export type MedicationStatus =
  | "taken"
  | "pending"
  | "missed"
  | "skipped"
  | "active"
  | "completed";

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  detail: string;
  status?: MedicationStatus;
}

export const todayMedications: MedicationItem[] = [
  { id: "t1", name: "Paracetamol", dosage: "500mg", detail: "8:00 AM", status: "taken" },
  { id: "t2", name: "Metformin", dosage: "500mg", detail: "8:30 AM", status: "taken" },
  { id: "t3", name: "Vitamin D3", dosage: "1000 IU", detail: "1:00 PM", status: "pending" },
  { id: "t4", name: "Cetirizine", dosage: "10mg", detail: "9:00 PM", status: "pending" },
];

export const upcomingReminders: MedicationItem[] = [
  { id: "u1", name: "Metformin", dosage: "500mg", detail: "6:00 PM · With food" },
  { id: "u2", name: "Atorvastatin", dosage: "10mg", detail: "9:30 PM · After dinner" },
];

export const medications: MedicationItem[] = [
  { id: "m1", name: "Metformin", dosage: "500mg", detail: "Twice daily · 30 days", status: "active" },
  { id: "m2", name: "Vitamin D3", dosage: "1000 IU", detail: "Daily · 30 days", status: "active" },
  { id: "m3", name: "Paracetamol", dosage: "500mg", detail: "As needed", status: "active" },
  { id: "m4", name: "Amoxicillin", dosage: "250mg", detail: "3 times daily · 7 days", status: "completed" },
];

export const medicationHistory: MedicationItem[] = [
  { id: "h1", name: "Metformin", dosage: "500mg", detail: "8:00 AM", status: "taken" },
  { id: "h2", name: "Vitamin D3", dosage: "1000 IU", detail: "1:00 PM", status: "taken" },
  { id: "h3", name: "Metformin", dosage: "500mg", detail: "6:00 PM", status: "missed" },
  { id: "h4", name: "Paracetamol", dosage: "500mg", detail: "9:00 PM", status: "skipped" },
];
