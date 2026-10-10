from sqlalchemy import Column, Integer, Boolean, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.utils.config.db import Base


class MedicationSchedule(Base):
    __tablename__ = "medication_schedules"

    id = Column(Integer, primary_key=True, index=True)
    prescription_medication_id = Column(
        Integer,
        ForeignKey("prescription_medications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scheduled_time = Column(Time, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    prescription_medication = relationship(
        "PrescriptionMedication", back_populates="schedules"
    )
    logs = relationship(
        "MedicationLog",
        back_populates="medication_schedule",
        cascade="all, delete-orphan",
    )
