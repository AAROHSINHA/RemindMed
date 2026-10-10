import traceback

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from google.api_core import exceptions as google_exceptions
from google.auth import exceptions as auth_exceptions

from src.utils.config.tokenConfig import get_current_user
from src.utils.config.vision import VisionResponseError, extract_document_text
from src.utils.models import User

router = APIRouter(tags=["ocr"])


def _report_error(stage: str, hint: str, exc: Exception) -> None:
    """Loud, readable error block in the backend terminal."""
    line = "!" * 70
    print(f"\n{line}", flush=True)
    print(f"[OCR ERROR] stage : {stage}", flush=True)
    print(f"[OCR ERROR] type  : {type(exc).__name__}", flush=True)
    print(f"[OCR ERROR] detail: {exc}", flush=True)
    print(f"[OCR ERROR] hint  : {hint}", flush=True)
    print("[OCR ERROR] traceback:", flush=True)
    print(traceback.format_exc(), flush=True)
    print(f"{line}\n", flush=True)


@router.post("/ocr")
async def ocr(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),  # 401 if the bearer token is missing/invalid
):
    if not (image.content_type or "").startswith("image/"):
        print(f"[OCR] rejected upload: content_type={image.content_type}", flush=True)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only image uploads are allowed")

    print(f"[OCR] authenticated request from user id={current_user.id}", flush=True)
    contents = await image.read()
    print(
        f"\n[OCR] upload object type={type(image).__name__},\n"
        f"data type={type(contents).__name__},\n"
        f"content_type={image.content_type}, size={len(contents)} bytes\n",
        flush=True,
    )
    if not contents:
        print("\n[OCR ERROR] the uploaded image is empty (0 bytes)\n", flush=True)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "The uploaded image is empty")

    print("\n[OCR] sending image to Google Cloud Vision (DOCUMENT_TEXT_DETECTION)...\n", flush=True)
    try:
        result = await run_in_threadpool(extract_document_text, contents)

    except (FileNotFoundError, auth_exceptions.DefaultCredentialsError, ValueError) as exc:
        _report_error(
            "credentials",
            "Set GOOGLE_APPLICATION_CREDENTIALS in backend/.env to the service-account JSON path "
            "(file missing, not found, or not valid JSON).",
            exc,
        )
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "OCR is not configured on the server")

    except (google_exceptions.PermissionDenied, google_exceptions.Unauthenticated) as exc:
        _report_error(
            "authorization",
            "Check the service account's permissions and that the Cloud Vision API is enabled with billing.",
            exc,
        )
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "OCR service rejected the request")

    except google_exceptions.ResourceExhausted as exc:
        _report_error("quota", "Vision API quota exceeded. Wait or raise the quota.", exc)
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "OCR quota exceeded, try again later")

    except google_exceptions.InvalidArgument as exc:
        _report_error("bad image", "Vision could not read this image (corrupt or unsupported format).", exc)
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "The image could not be processed")

    except (google_exceptions.GoogleAPICallError, VisionResponseError) as exc:
        _report_error("vision api", "Vision API call failed. See detail above.", exc)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "OCR service error")

    except Exception as exc:  # anything unexpected: still be loud
        _report_error("unexpected", "Unexpected failure while running OCR.", exc)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Unexpected OCR failure")

    text = result["text"]
    divider = "=" * 70
    print(f"\n{divider}", flush=True)
    print(f"[OCR] SUCCESS: {len(text)} characters, {result['pages']} page(s)", flush=True)
    if text:
        print("[OCR] extracted text:", flush=True)
        print(text, flush=True)
    else:
        print("[OCR] WARNING: Vision returned no text. Is the prescription visible and in focus?", flush=True)
    print(f"{divider}\n", flush=True)

    return {
        "success": True,
        "message": "Text extracted" if text else "No text detected in the image",
        "text": text,
        "pages": result["pages"],
        "size": len(contents),
    }
