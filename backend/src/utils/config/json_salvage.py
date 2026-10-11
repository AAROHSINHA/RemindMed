import json

DEFAULT_PRESCRIPTION = {"name": "Prescription", "doctor_name": None, "notes": None}


def _complete_objects(text: str, start: int, limit: int | None = None) -> list[dict]:
    """Collect the COMPLETE top-level {...} objects found from `start`.

    String-aware brace matching, so braces inside strings are ignored. An object that is
    still open when the text ends (a cut-off one) is simply not returned.
    """
    objects: list[dict] = []
    depth = 0
    object_start = None
    in_string = False
    escaped = False

    for index in range(start, len(text)):
        char = text[index]

        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
        elif char == "{":
            if depth == 0:
                object_start = index
            depth += 1
        elif char == "}":
            if depth == 0:
                continue
            depth -= 1
            if depth == 0 and object_start is not None:
                try:
                    parsed = json.loads(text[object_start : index + 1])
                    if isinstance(parsed, dict):
                        objects.append(parsed)
                except json.JSONDecodeError:
                    pass
                object_start = None
                if limit is not None and len(objects) >= limit:
                    break
        elif char == "]" and depth == 0:
            break  # the array closed normally

    return objects


def salvage_truncated_json(text: str) -> dict:
    """Recover what we can from a cut-off Gemini response.

    {A, B, C-incomplete} -> {A, B}. Raises ValueError when no medication is recoverable.
    """
    prescription = dict(DEFAULT_PRESCRIPTION)

    key = text.find('"prescription"')
    if key != -1:
        colon = text.find(":", key)
        if colon != -1:
            found = _complete_objects(text, colon + 1, limit=1)
            if found:
                prescription = found[0]

    medications: list[dict] = []
    key = text.find('"medications"')
    if key != -1:
        bracket = text.find("[", key)
        if bracket != -1:
            medications = _complete_objects(text, bracket + 1)

    if not medications:
        raise ValueError("Gemini output was cut off and no complete medication could be recovered")

    return {"prescription": prescription, "medications": medications}
