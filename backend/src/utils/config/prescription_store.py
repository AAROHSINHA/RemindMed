from datetime import date, time

from sqlalchemy.orm import Session

from src.utils.models import (
    MedicationSchedule,
    Prescription,
    PrescriptionMedication,
    PrescriptionStatus,
)


def _clean_str(value, max_len: int | None = None) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    return text[:max_len] if max_len else text


def _parse_int(value) -> int | None:
    try:
        return int(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def _parse_confidence(value) -> float | None:
    try:
        return min(max(float(value), 0.0), 1.0) if value is not None else None
    except (TypeError, ValueError):
        return None


def _parse_date(value) -> date | None:
    try:
        return date.fromisoformat(str(value)) if value else None
    except ValueError:
        return None


def _parse_time(value) -> time | None:
    try:
        return time.fromisoformat(str(value)) if value else None
    except ValueError:
        return None


def _clean_medication(item) -> dict | None:
    """Validate and normalise one medication dict. None when it has no usable name."""
    if not isinstance(item, dict):
        return None
    medicine_name = _clean_str(item.get("medicine_name"), 255)
    if not medicine_name:
        return None

    times: list[time] = []
    for schedule in item.get("schedules") or []:
        if not isinstance(schedule, dict):
            continue
        scheduled_time = _parse_time(schedule.get("scheduled_time"))
        if scheduled_time is None or scheduled_time in times:
            continue
        if schedule.get("enabled", True):
            times.append(scheduled_time)

    return {
        "medicine_name": medicine_name,
        "strength": _clean_str(item.get("strength"), 100),
        "dosage": _clean_str(item.get("dosage"), 100),
        "dosage_unit": _clean_str(item.get("dosage_unit"), 50),
        "frequency": _clean_str(item.get("frequency"), 100),
        "duration_days": _parse_int(item.get("duration_days")),
        "start_date": _parse_date(item.get("start_date")),
        "end_date": _parse_date(item.get("end_date")),
        "instructions": _clean_str(item.get("instructions")),
        "ai_confidence": _parse_confidence(item.get("ai_confidence")),
        "schedule_times": sorted(times),
    }


def _clean_prescription_meta(extracted: dict) -> dict:
    meta = extracted.get("prescription")
    meta = meta if isinstance(meta, dict) else {}
    return {
        "name": _clean_str(meta.get("name"), 255) or "Prescription",
        "doctor_name": _clean_str(meta.get("doctor_name"), 255),
        "notes": _clean_str(meta.get("notes")),
    }


def normalize_extraction(extracted: dict) -> dict | None:
    """Clean the LLM JSON for the frontend. Does NOT touch the database.

    Returns {"prescription": {...}, "medications": [...]} without ids, or None when no
    valid medication was found. Nothing is stored until the user confirms.
    """
    medications = []
    for item in extracted.get("medications") or []:
        cleaned = _clean_medication(item)
        if cleaned is None:
            continue
        times = cleaned.pop("schedule_times")
        cleaned["start_date"] = cleaned["start_date"].isoformat() if cleaned["start_date"] else None
        cleaned["end_date"] = cleaned["end_date"].isoformat() if cleaned["end_date"] else None
        cleaned["schedules"] = [
            {"scheduled_time": t.isoformat(), "enabled": True} for t in times
        ]
        medications.append(cleaned)

    if not medications:
        return None
    return {"prescription": _clean_prescription_meta(extracted), "medications": medications}


def _serialize(prescription: Prescription) -> dict:
    return {
        "prescription": {
            "id": prescription.id,
            "name": prescription.name,
            "doctor_name": prescription.doctor_name,
            "notes": prescription.notes,
            "status": prescription.status.value,
            "created_at": prescription.created_at.isoformat() if prescription.created_at else None,
        },
        "medications": [
            {
                "id": med.id,
                "medicine_name": med.medicine_name,
                "strength": med.strength,
                "dosage": med.dosage,
                "dosage_unit": med.dosage_unit,
                "frequency": med.frequency,
                "duration_days": med.duration_days,
                "start_date": med.start_date.isoformat() if med.start_date else None,
                "end_date": med.end_date.isoformat() if med.end_date else None,
                "instructions": med.instructions,
                "ai_confidence": med.ai_confidence,
                "schedules": [
                    {
                        "id": schedule.id,
                        "scheduled_time": schedule.scheduled_time.isoformat(),
                        "enabled": schedule.enabled,
                    }
                    for schedule in med.schedules
                ],
            }
            for med in prescription.medications
        ],
    }


# Public name for routes that need to return a saved prescription.
serialize_prescription = _serialize


def store_prescription(db: Session, user_id: int, data: dict) -> dict | None:
    """Create a CONFIRMED Prescription with its medications and reminder schedules.

    Called only when the user confirms in the app. Returns the saved records (with ids),
    or None when there is no valid medication.
    """
    prescription = Prescription(
        user_id=user_id,
        status=PrescriptionStatus.CONFIRMED,
        **_clean_prescription_meta(data),
    )

    for item in data.get("medications") or []:
        cleaned = _clean_medication(item)
        if cleaned is None:
            continue
        times = cleaned.pop("schedule_times")

        medication = PrescriptionMedication(**cleaned, user_verified=True)
        for scheduled_time in times:
            medication.schedules.append(
                MedicationSchedule(scheduled_time=scheduled_time, enabled=True)
            )
        prescription.medications.append(medication)

    if not prescription.medications:
        return None

    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return _serialize(prescription)
