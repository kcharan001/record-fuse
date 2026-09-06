from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(50), primary_key=True, index=True) # e.g. "REC-A", "REC-B"
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    dob = Column(String(20), nullable=False) # ISO YYYY-MM-DD
    age = Column(String(20), nullable=True) # e.g. "22"
    gender = Column(String(20), nullable=False)
    ssn_last4 = Column(String(20), nullable=False, default="0000")
    national_id_country = Column(String(10), default="IN", nullable=True)
    national_id_type = Column(String(50), default="Aadhaar", nullable=True)
    national_id_last4 = Column(String(20), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
