import enum
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.utils.config.db import Base


class MedicationLogStatus(str, enum.Enum):
    TAKEN = "TAKEN"
    MISSED = "MISSED"
    SKIPPED = "SKIPPED"


class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id = Column(Integer, primary_key=True, index=True)
    medication_schedule_id = Column(
        Integer,
        ForeignKey("medication_schedules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    taken_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(
        Enum(MedicationLogStatus, name="medication_log_status"),
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    medication_schedule = relationship("MedicationSchedule", back_populates="logs")
