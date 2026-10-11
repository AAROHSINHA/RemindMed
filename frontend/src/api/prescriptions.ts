import axios from "axios";

import type { ScannedMedication, ScannedPrescription } from "./ocr";
import { API_BASE_URL } from "./env";
import { withAuthRetry } from "./core/withAuthRetry";

export interface CreateMedicationPayload {
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
  schedules: { scheduled_time: string; enabled: boolean }[];
}

export interface CreatePrescriptionPayload {
  name: string;
  doctor_name: string | null;
  notes: string | null;
  medications: CreateMedicationPayload[];
}

// What the backend returns after saving: real database ids on everything.
export interface SavedPrescription {
  prescription: ScannedPrescription;
  medications: ScannedMedication[];
}

// ---- Save the reviewed prescription (the only place a scan is written to the DB) ----
export const createPrescription = (payload: CreatePrescriptionPayload) =>
  withAuthRetry<SavedPrescription>((token) =>
    axios.post(`${API_BASE_URL}/prescriptions`, payload, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    }),
  );
