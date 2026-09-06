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
    ssn_last4 = Column(String(4), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
