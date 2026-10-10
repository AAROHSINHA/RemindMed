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


def store_prescription(db: Session, user_id: int, extracted: dict) -> dict | None:
    """Save Gemini's JSON as Prescription -> PrescriptionMedication -> MedicationSchedule rows.

    Returns the saved records (with ids) in the shape the frontend renders, or None when
    no valid medication was found.
    """
    meta = extracted.get("prescription")
    meta = meta if isinstance(meta, dict) else {}

    prescription = Prescription(
        user_id=user_id,
        name=_clean_str(meta.get("name"), 255) or "Prescription",
        doctor_name=_clean_str(meta.get("doctor_name"), 255),
        notes=_clean_str(meta.get("notes")),
        status=PrescriptionStatus.PENDING_REVIEW,
    )

    for item in extracted.get("medications") or []:
        if not isinstance(item, dict):
            continue
        medicine_name = _clean_str(item.get("medicine_name"), 255)
        if not medicine_name:
            continue

        medication = PrescriptionMedication(
            medicine_name=medicine_name,
            strength=_clean_str(item.get("strength"), 100),
            dosage=_clean_str(item.get("dosage"), 100),
            dosage_unit=_clean_str(item.get("dosage_unit"), 50),
            frequency=_clean_str(item.get("frequency"), 100),
            duration_days=_parse_int(item.get("duration_days")),
            start_date=_parse_date(item.get("start_date")),
            end_date=_parse_date(item.get("end_date")),
            instructions=_clean_str(item.get("instructions")),
            ai_confidence=_parse_confidence(item.get("ai_confidence")),
        )

        seen_times: set[time] = set()
        for schedule in item.get("schedules") or []:
            if not isinstance(schedule, dict):
                continue
            scheduled_time = _parse_time(schedule.get("scheduled_time"))
            if scheduled_time is None or scheduled_time in seen_times:
                continue
            seen_times.add(scheduled_time)
            medication.schedules.append(
                MedicationSchedule(
                    scheduled_time=scheduled_time,
                    enabled=bool(schedule.get("enabled", True)),
                )
            )

        prescription.medications.append(medication)

    if not prescription.medications:
        return None

    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return _serialize(prescription)
