from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.schemas.verification import VerificationResultSchema
from app.schemas.ai import AIServiceResponseSchema

class MergedTimelineEventSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    original_event_id: str = Field(..., json_schema_extra={"example": "A-001"})
    patient_id: str = Field(..., json_schema_extra={"example": "REC-A"})
    source_record: str = Field(..., json_schema_extra={"example": "record_A"})
    timestamp: datetime
    event_type: str = Field(..., json_schema_extra={"example": "consultation"})
    description: str = Field(..., json_schema_extra={"example": "General Cardiology Consultation"})
    provider: Optional[str] = Field(None, json_schema_extra={"example": "Dr. Sarah Jenkins"})
    department: Optional[str] = Field(None, json_schema_extra={"example": "Cardiology"})
    metadata: Optional[Dict[str, Any]] = Field(default=None)
    
    chronological_index: int = Field(..., json_schema_extra={"example": 1})
    is_overlapping: bool = Field(False, description="True if another event exists at exact same timestamp")
    is_near_overlap: bool = Field(False, description="True if another event exists within 30-minute window")
    overlap_group_id: Optional[str] = Field(None, json_schema_extra={"example": "OVERLAP-1000"})
    overlap_type: Optional[str] = Field(None, json_schema_extra={"example": "exact"})
    conflict_flag: bool = Field(False)

class ReconciliationOutputSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    record_a_count: int
    record_b_count: int
    total_events: int
    preserved_event_ids: List[str]
    exact_overlaps_count: int
    near_overlaps_count: int
    timeline: List[MergedTimelineEventSchema]
    verification: Optional[VerificationResultSchema] = None
    ai_analysis: Optional[AIServiceResponseSchema] = None
