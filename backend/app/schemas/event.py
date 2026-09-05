from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any

class ClinicalEventSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: str = Field(..., json_schema_extra={"example": "A-001"})
    patient_id: str = Field(..., json_schema_extra={"example": "REC-A"})
    source_record: str = Field(..., json_schema_extra={"example": "record_A"})
    timestamp: datetime
    event_type: str = Field(..., json_schema_extra={"example": "consultation"})
    description: str = Field(..., json_schema_extra={"example": "General Cardiology Consultation"})
    provider: Optional[str] = Field(None, json_schema_extra={"example": "Dr. Sarah Jenkins"})
    department: Optional[str] = Field(None, json_schema_extra={"example": "Cardiology"})
    metadata: Optional[Dict[str, Any]] = Field(default=None)

class ClinicalEventCreateSchema(BaseModel):
    patient_id: str = Field(..., json_schema_extra={"example": "REC-A"})
    source_record: Optional[str] = Field("record_A", json_schema_extra={"example": "record_A"})
    timestamp: Optional[datetime] = Field(default=None)
    event_type: str = Field(..., json_schema_extra={"example": "consultation"})
    description: str = Field(..., json_schema_extra={"example": "General Cardiology Consultation"})
    provider: Optional[str] = Field(None, json_schema_extra={"example": "Dr. Sarah Jenkins"})
    department: Optional[str] = Field(None, json_schema_extra={"example": "Cardiology"})
    metadata: Optional[Dict[str, Any]] = Field(default=None)
