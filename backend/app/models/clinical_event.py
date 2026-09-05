from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class ClinicalEvent(Base):
    __tablename__ = "clinical_events"

    event_id = Column(String(50), primary_key=True, index=True) # e.g. "A-001", "B-004"
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False, index=True)
    source_record = Column(String(20), nullable=False) # "record_A" or "record_B"
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    event_type = Column(String(50), nullable=False) # e.g. "lab_test", "consultation", "radiology"
    description = Column(Text, nullable=False)
    provider = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    metadata_json = Column(Text, nullable=True) # JSON serialized metadata
