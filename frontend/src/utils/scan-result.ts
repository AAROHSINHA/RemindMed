import type { ExtractedMedication, ExtractedPrescription } from "@/api/ocr";

export interface ScanResult {
  prescription: ExtractedPrescription;
  medications: ExtractedMedication[];
  truncated: boolean;
}

// Hands the saved prescription from the processing screen to the review screen.
// Kept out of route params so nothing gets URL-encoded or truncated.
let scanResult: ScanResult | null = null;

export const setScanResult = (result: ScanResult) => {
  scanResult = result;
};

export const getScanResult = () => scanResult;
