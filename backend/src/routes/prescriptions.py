import traceback
from datetime import date, time

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from src.utils.config.db import get_db
from src.utils.config.prescription_store import store_prescription
from src.utils.config.tokenConfig import get_current_user
from src.utils.models import User

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])


class ScheduleIn(BaseModel):
    scheduled_time: str  # "HH:MM" or "HH:MM:SS"
    enabled: bool = True

    @field_validator("scheduled_time")
    @classmethod
    def valid_time(cls, value: str) -> str:
        try:
            return time.fromisoformat(value.strip()).isoformat()
        except ValueError:
            raise ValueError(f"'{value}' is not a valid HH:MM time")


class MedicationIn(BaseModel):
    medicine_name: str = Field(min_length=1, max_length=255)
    strength: str | None = Field(default=None, max_length=100)
    dosage: str | None = Field(default=None, max_length=100)
    dosage_unit: str | None = Field(default=None, max_length=50)
    frequency: str | None = Field(default=None, max_length=100)
    duration_days: int | None = Field(default=None, ge=1, le=3650)
    start_date: date | None = None
    end_date: date | None = None
    instructions: str | None = None
    ai_confidence: float | None = Field(default=None, ge=0, le=1)
    schedules: list[ScheduleIn] = []


class CreatePrescriptionRequest(BaseModel):
    name: str = Field(default="Prescription", min_length=1, max_length=255)
    doctor_name: str | None = Field(default=None, max_length=255)
    notes: str | None = None
    medications: list[MedicationIn] = Field(min_length=1)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_prescription(
    payload: CreatePrescriptionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Store the prescription the user reviewed and confirmed in the app.

    This is the only place a scanned prescription is written to the database.
    """
    data = {
        "prescription": {
            "name": payload.name,
            "doctor_name": payload.doctor_name,
            "notes": payload.notes,
        },
        "medications": [med.model_dump(mode="json") for med in payload.medications],
    }

    try:
        saved = store_prescription(db, current_user.id, data)
    except Exception as exc:
        db.rollback()
        print(
            f"\n[DB ERROR] could not save prescription for user id={current_user.id}: "
            f"{type(exc).__name__}: {exc}\n{traceback.format_exc()}",
            flush=True,
        )
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, "Could not save the prescription"
        )

    if saved is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "No valid medication to save"
        )

    print(
        f"[DB] SUCCESS: prescription id={saved['prescription']['id']} saved for "
        f"user id={current_user.id} with {len(saved['medications'])} medication(s)",
        flush=True,
    )
    return saved
