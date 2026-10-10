import type { PrescriptionImage } from "@/api/ocr";

// Holds the captured photo between the camera and the processing screen.
// The file uri must NOT go through route params: the router URL-decodes it, which changes
// the cache folder name (%40anonymous%2F...) and makes the file unreadable.
let pendingImage: PrescriptionImage | null = null;

export const setPendingImage = (image: PrescriptionImage) => {
  pendingImage = image;
};

export const getPendingImage = () => pendingImage;
