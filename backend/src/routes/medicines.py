from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from src.utils.config.redis_client import redis_client
from src.utils.models import (
    User,
    Prescription,
    PrescriptionMedication,
    MedicationSchedule,
)
from src.utils.config.db import get_db
from src.utils.config.tokenConfig import get_current_user
from datetime import date, datetime, time
from sqlalchemy import or_
import time as timer
from pydantic import TypeAdapter

router = APIRouter(tags=["medicine"])


class TodayMedicineResponse(BaseModel):
    prescription_id: int
    user_id: int
    medication_id: int | None = None
    medicine_name: str | None = None
    strength: str | None = None
    scheduled_time: time | None = None



@router.get(
    "/today-medicines",
    status_code=status.HTTP_200_OK,
    response_model=list[TodayMedicineResponse],
)
def get_today_medicines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start_time = timer.perf_counter()
    today = date.today()
    cache_key = f"today_medicines:{current_user.id}:{today}"

    try:
        # 1. Try Redis cache
        try:
            cached_data = redis_client.get(cache_key)

            if cached_data is not None:
                result = TypeAdapter(
                    list[TodayMedicineResponse]
                ).validate_json(cached_data)

                print(
                    f"GET /today-medicines [CACHE HIT]: "
                    f"{(timer.perf_counter() - start_time) * 1000:.2f} ms"
                )
                return result

        except Exception as e:
            print(f"Redis read failed: {e}")

        # 2. Cache miss: fetch from PostgreSQL
        data = (
            db.query(
                Prescription.id.label("prescription_id"),
                Prescription.user_id,
                PrescriptionMedication.id.label("medication_id"),
                PrescriptionMedication.medicine_name,
                PrescriptionMedication.strength,
                MedicationSchedule.scheduled_time,
            )
            .join(
                PrescriptionMedication,
                Prescription.id == PrescriptionMedication.prescription_id,
            )
            .join(
                MedicationSchedule,
                PrescriptionMedication.id
                == MedicationSchedule.prescription_medication_id,
            )
            .filter(
                Prescription.user_id == current_user.id,
                MedicationSchedule.enabled.is_(True),
                or_(
                    PrescriptionMedication.start_date.is_(None),
                    PrescriptionMedication.start_date <= today,
                ),
                or_(
                    PrescriptionMedication.end_date.is_(None),
                    PrescriptionMedication.end_date >= today,
                ),
            )
            .all()
        )

        result = [
            {
                "prescription_id": row.prescription_id,
                "user_id": row.user_id,
                "medication_id": row.medication_id,
                "medicine_name": row.medicine_name,
                "strength": row.strength,
                "scheduled_time": row.scheduled_time,
            }
            for row in data
        ]

        # 3. Store response in Redis for 24 hours
        try:
            cached_json = TypeAdapter(
                list[TodayMedicineResponse]
            ).dump_json(result).decode("utf-8")

            redis_client.set(cache_key, cached_json, ex=86400)

        except Exception as e:
            print(f"Redis write failed: {e}")

        print(
            f"GET /today-medicines [CACHE MISS]: "
            f"{(timer.perf_counter() - start_time) * 1000:.2f} ms"
        )

        return result

    except Exception as e:
        print(f"Error fetching today's medicines: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch medicines",
        ) from e


@router.get(
    "/medications",
    status_code=status.HTTP_200_OK,
    response_model=list[TodayMedicineResponse],
)
def get_user_medications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    cache_key = f"medicines:{current_user.id}:{today}"
    try:
        # 1. Try redis cache
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data is not None:
                result = TypeAdapter(
                    list[TodayMedicineResponse]
                ).validate_json(cached_data)

                print("GET /medications [CACHE HIT] done")
                return result
        except Exception as e:
            print(f"Redis read failed: {e}")

        # 2. Cache miss : read from PostgreSQL
        data = (
            db.query(
                Prescription.id.label("prescription_id"),
                Prescription.user_id,
                PrescriptionMedication.id.label("medication_id"),
                PrescriptionMedication.medicine_name,
                PrescriptionMedication.strength,
                MedicationSchedule.scheduled_time,
            )
            .outerjoin(
                PrescriptionMedication,
                Prescription.id == PrescriptionMedication.prescription_id,
            )
            .outerjoin(
                MedicationSchedule,
                PrescriptionMedication.id
                == MedicationSchedule.prescription_medication_id,
            )
            .filter(Prescription.user_id == current_user.id)
            .all()
        )

        result =  [
            {
                "prescription_id": row.prescription_id,
                "user_id": row.user_id,
                "medication_id": row.medication_id,
                "medicine_name": row.medicine_name,
                "strength": row.strength,
                "scheduled_time": row.scheduled_time,
            }
            for row in data
        ]

        # 3. Store response in redis for 24 hours
        try:
            cached_json = TypeAdapter(
             list[TodayMedicineResponse]
            ).dump_json(
                TypeAdapter(list[TodayMedicineResponse]).validate_python(result)
            ).decode("utf-8")

            redis_client.set(cache_key, cached_json, ex=86400)

        except Exception as e:
            print(f"Redis write failed : {e}")

        return result
    except Exception as e:
        print(f"Error fetching medications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch medications",
        ) from e
