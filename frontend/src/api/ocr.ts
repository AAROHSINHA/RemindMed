import { File } from "expo-file-system";

import { API_BASE_URL, buildApiError, type ApiError } from "./env";
import { refreshAccessToken } from "./core/refresh";
import { getToken } from "./core/tokenStorage";

export interface PrescriptionImage {
  uri: string;
  fileName: string;
  mimeType: string;
}

export interface OcrUploadResponse {
  success: boolean;
  message: string;
  text: string;
  pages: number;
  size: number;
}

const UPLOAD_TIMEOUT_MS = 30000;

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
    const message =
      error?.name === "AbortError"
        ? "The upload took too long. Please try again."
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
