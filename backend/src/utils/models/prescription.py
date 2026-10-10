import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.utils.config.db import Base


class PrescriptionStatus(str, enum.Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    CONFIRMED = "CONFIRMED"
    ARCHIVED = "ARCHIVED"


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name = Column(String(255), nullable=False)
    doctor_name = Column(String(255), nullable=True)
    status = Column(
        Enum(PrescriptionStatus, name="prescription_status"),
        default=PrescriptionStatus.PENDING_REVIEW,
        nullable=False,
    )
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="prescriptions")
    medications = relationship(
        "PrescriptionMedication",
        back_populates="prescription",
        cascade="all, delete-orphan",
    )
