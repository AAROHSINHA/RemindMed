
import traceback

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from google.api_core import exceptions as google_exceptions
from google.auth import exceptions as auth_exceptions

from src.utils.config.tokenConfig import get_current_user
from src.utils.config.vision import VisionResponseError, extract_document_text
from src.utils.config.gemini import extract_medications
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
    current_user: User = Depends(get_current_user),
):
    if not (image.content_type or "").startswith("image/"):
        print(
            f"[OCR] rejected upload: content_type={image.content_type}",
            flush=True,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image uploads are allowed",
        )

    print(
        f"[OCR] authenticated request from user id={current_user.id}",
        flush=True,
    )

    contents = await image.read()

    print(
        f"\n[OCR] upload object type={type(image).__name__},\n"
        f"data type={type(contents).__name__},\n"
        f"content_type={image.content_type}, size={len(contents)} bytes\n",
        flush=True,
    )

    if not contents:
        print(
            "\n[OCR ERROR] the uploaded image is empty (0 bytes)\n",
            flush=True,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image is empty",
        )

    # Step 1: Extract text using Google Cloud Vision
    print(
        "\n[OCR] sending image to Google Cloud Vision "
        "(DOCUMENT_TEXT_DETECTION)...\n",
        flush=True,
    )

    try:
        result = await run_in_threadpool(extract_document_text, contents)

    except (
        FileNotFoundError,
        auth_exceptions.DefaultCredentialsError,
        ValueError,
    ) as exc:
        _report_error(
            "credentials",
            "Check GOOGLE_APPLICATION_CREDENTIALS in backend/.env "
            "and verify that the service-account JSON file is valid.",
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OCR is not configured on the server",
        )

    except (
        google_exceptions.PermissionDenied,
        google_exceptions.Unauthenticated,
    ) as exc:
        _report_error(
            "authorization",
            "Check the service account, Vision API access, and billing.",
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="OCR service rejected the request",
        )

    except google_exceptions.ResourceExhausted as exc:
        _report_error(
            "quota",
            "Vision API quota exceeded. Check your quota and billing.",
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OCR quota exceeded, try again later",
        )

    except google_exceptions.InvalidArgument as exc:
        _report_error(
            "bad image",
            "Vision could not process this image. Check its format and contents.",
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The image could not be processed",
        )

    except (
        google_exceptions.GoogleAPICallError,
        VisionResponseError,
    ) as exc:
        _report_error(
            "vision api",
            "Google Cloud Vision request failed. See the error above.",
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="OCR service error",
        )

    except Exception as exc:
        _report_error(
            "unexpected OCR failure",
            "Unexpected error while extracting text.",
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected OCR failure",
        )

    text = result["text"]

    divider = "=" * 70
    print(f"\n{divider}", flush=True)
    print(
        f"[OCR] SUCCESS: {len(text)} characters, "
        f"{result['pages']} page(s)",
        flush=True,
    )

    if text:
        print("[OCR] extracted text:", flush=True)
        print(text, flush=True)
    else:
        print(
            "[OCR] WARNING: Vision returned no text. "
            "Check whether the prescription is visible and in focus.",
            flush=True,
        )

    print(f"{divider}\n", flush=True)

    # Step 2: Convert OCR text into structured medication data using Gemini
    medications = []

    if text.strip():
        print(
            "[GEMINI] Sending OCR text for medication extraction...",
            flush=True,
        )

        try:
            gemini_result = await run_in_threadpool(
                extract_medications,
                text,
            )

            medications = gemini_result["medications"]

            print(
                f"[GEMINI] SUCCESS: {len(medications)} "
                "medication/treatment entries extracted",
                flush=True,
            )

        except Exception as exc:
            _report_error(
                "Gemini medication extraction",
                "Check GEMINI_API_KEY, model availability, API quota, "
                "network connectivity, and the returned JSON.",
                exc,
            )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Medication extraction failed",
            )

    else:
        print(
            "[GEMINI] Skipped because OCR returned no text.",
            flush=True,
        )

    # Step 3: Return OCR text and structured data to the frontend.
    # No database records or medication schedules are created here.
    return {
        "success": True,
        "message": (
            "Text and medication data extracted"
            if text.strip()
            else "No text detected in the image"
        ),
        "text": text,
        "pages": result["pages"],
        "size": len(contents),
        "medications": medications,
    }
