from pydantic import BaseModel, Field
from typing import List
from app.schemas.patient import PatientSchema
from app.schemas.event import ClinicalEventSchema

class RecordDetailResponse(BaseModel):
    patient: PatientSchema
    events: List[ClinicalEventSchema]
    event_count: int

class RecordPairResponse(BaseModel):
    record_a: RecordDetailResponse
    record_b: RecordDetailResponse
    total_events: int

class SeedDataResponse(BaseModel):
    message: str
    patient_count: int
    record_a_events: int
    record_b_events: int
    total_events: int
    seeded_at: str
