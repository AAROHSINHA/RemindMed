from functools import lru_cache

from google.cloud import vision


from src.utils.config.settings import settings

import os

path = settings.GOOGLE_APPLICATION_CREDENTIALS

print("Credentials path:", repr(path))
print("File exists:", os.path.isfile(path) if path else False)

@lru_cache
def get_vision_client() -> vision.ImageAnnotatorClient:
    """Create the Vision client once. Uses the JSON path from .env, else Google's default lookup."""
    path = settings.GOOGLE_APPLICATION_CREDENTIALS
    if path:
        return vision.ImageAnnotatorClient.from_service_account_file(path)
    return vision.ImageAnnotatorClient()


class VisionResponseError(Exception):
    """Vision answered, but with an error payload."""


def extract_document_text(image_bytes: bytes) -> dict:
    """Run DOCUMENT_TEXT_DETECTION on raw image bytes. Blocking call: run it in a threadpool."""
    client = get_vision_client()
    response = client.document_text_detection(image=vision.Image(content=image_bytes))

    if response.error.message:
        raise VisionResponseError(f"code={response.error.code}: {response.error.message}")

    annotation = response.full_text_annotation
    return {
        "text": annotation.text,
        "pages": len(annotation.pages),
    }
