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
    scenarios_count: int = 1
    record_a_events: int = 6
    record_b_events: int = 7
    total_events: int
    seeded_at: str

