
import json
from functools import lru_cache

from google import genai
from google.genai import types

from src.utils.config.json_salvage import salvage_truncated_json
from src.utils.config.settings import settings
from src.utils.templates.gemini_api_template import GEMINI_API_TEMPLATE


@lru_cache
def get_gemini_client():
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured")

    return genai.Client(api_key=settings.GEMINI_API_KEY)


def extract_medications(ocr_text: str) -> dict:
    prompt = GEMINI_API_TEMPLATE.replace(
        "{{OCR_TEXT}}",
        ocr_text,
    )

    response = get_gemini_client().models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1,
            max_output_tokens=6000,
        ),
    )

    if not response.text:
        raise ValueError("Gemini returned an empty response")
    print("\n[GEMINI RAW RESPONSE]")
    print(repr(response.text))
    print("[END GEMINI RAW RESPONSE]\n")


    truncated = False
    try:
        result = json.loads(response.text)
    except json.JSONDecodeError as exc:
        # The model's output was cut off. Keep the complete medications, drop the broken one.
        print(
            f"\n[GEMINI WARNING] output is not valid JSON ({exc}). It was probably cut off. "
            "Recovering the complete medications and dropping the incomplete one...",
            flush=True,
        )
        result = salvage_truncated_json(response.text)
        truncated = True
        print(
            f"[GEMINI WARNING] recovered {len(result['medications'])} complete medication(s). "
            "The user will be asked to add any missing ones manually.\n",
            flush=True,
        )

    if not isinstance(result, dict) or not isinstance(
        result.get("medications"), list
    ):
        raise ValueError("Gemini returned an unexpected JSON structure")

    result["truncated"] = truncated
    return result
