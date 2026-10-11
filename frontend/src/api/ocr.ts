import { File } from "expo-file-system";

import { API_BASE_URL, buildApiError, type ApiError } from "./env";
import { refreshAccessToken } from "./core/refresh";
import { getToken } from "./core/tokenStorage";

export interface PrescriptionImage {
  uri: string;
  fileName: string;
  mimeType: string;
}

// What /ocr returns: cleaned LLM output. Nothing is saved yet, so there are no ids.
export interface ExtractedSchedule {
  scheduled_time: string; // "HH:MM:SS"
  enabled: boolean;
}

export interface ExtractedMedication {
  medicine_name: string;
  strength: string | null;
  dosage: string | null;
  dosage_unit: string | null;
  frequency: string | null;
  duration_days: number | null;
  start_date: string | null;
  end_date: string | null;
  instructions: string | null;
  ai_confidence: number | null;
  schedules: ExtractedSchedule[];
}

export interface ExtractedPrescription {
  name: string;
  doctor_name: string | null;
  notes: string | null;
}

// Saved records (returned by POST /prescriptions) carry database ids.
export interface ScannedSchedule {
  id: number;
  scheduled_time: string; // "HH:MM:SS"
  enabled: boolean;
}

export interface ScannedMedication {
  id: number;
  medicine_name: string;
  strength: string | null;
  dosage: string | null;
  dosage_unit: string | null;
  frequency: string | null;
  duration_days: number | null;
  start_date: string | null;
  end_date: string | null;
  instructions: string | null;
  ai_confidence: number | null;
  schedules: ScannedSchedule[];
}

export interface ScannedPrescription {
  id: number;
  name: string;
  doctor_name: string | null;
  notes: string | null;
  status: string;
  created_at: string | null;
}

export interface OcrUploadResponse {
  success: boolean;
  message: string;
  text: string;
  pages: number;
  size: number;
  prescription: ExtractedPrescription | null;
  medications: ExtractedMedication[];
  // true when the LLM output was cut off and some medicines may be missing
  truncated?: boolean;
}

// The request covers upload + Vision OCR + Gemini + DB save. Let the user wait: this is only
// a last-resort ceiling. The processing screen shows "still working" messages along the way.
const UPLOAD_TIMEOUT_MS = 300000;

// Sends one multipart request.
// SDK 57 installs expo/fetch as the global fetch, and it does NOT accept React Native's
// { uri, name, type } file objects ("Unsupported FormDataPart implementation"). A File from
// expo-file-system is a Blob-compatible part, so we send that instead.
const sendImage = async (token: string, { uri, fileName, mimeType }: PrescriptionImage) => {
  const formData = new FormData();
  formData.append("image", new File(uri) as any);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  console.log("[UPLOAD] POST", `${API_BASE_URL}/ocr`, { fileName, mimeType });
  try {
    // No manual Content-Type: the multipart boundary must be set automatically.
    const response = await fetch(`${API_BASE_URL}/ocr`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: formData,
      signal: controller.signal,
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null; // non-JSON body
    }
    console.log("[UPLOAD] response", response.status, data);
    return { status: response.status, ok: response.ok, data };
  } catch (error: any) {
    console.log("[UPLOAD ERROR] no response from server:", error?.name, error?.message);
    // expo/fetch reports a cancelled request as "fetch request has been cancelled",
    // not always with the name AbortError, so check the message too.
    const cancelled =
      error?.name === "AbortError" || /cancel|abort/i.test(error?.message ?? "");
    const message = cancelled
      ? "The scan timed out after 5 minutes. Please try again."
      : `Upload failed: ${error?.message ?? "could not reach the server"}`;
    throw { message } as ApiError;
  } finally {
    clearTimeout(timer);
  }
};

// ---- Upload prescription image (multipart/form-data, requires login) ----
// Sends the access token; on a 401 it refreshes the token once and retries.
export const uploadPrescription = async (image: PrescriptionImage): Promise<OcrUploadResponse> => {
  const accessToken = await getToken("access_token");

  let result = accessToken ? await sendImage(accessToken, image) : null;
  if (!result || result.status === 401) {
    const newToken = await refreshAccessToken();
    result = await sendImage(newToken, image);
  }

  if (!result.ok) {
    throw buildApiError(result.status, result.data);
  }
  return result.data as OcrUploadResponse;
};
