from pydantic import BaseModel, Field, ConfigDict
from typing import List
from datetime import datetime

class VerificationResultSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    record_a_count: int = Field(..., json_schema_extra={"example": 6})
    record_b_count: int = Field(..., json_schema_extra={"example": 7})
    expected_total: int = Field(..., json_schema_extra={"example": 13})
    actual_total: int = Field(..., json_schema_extra={"example": 13})
    missing_event_ids: List[str] = Field(default_factory=list)
    duplicate_event_ids: List[str] = Field(default_factory=list)
    invalid_provenance_event_ids: List[str] = Field(default_factory=list)
    lost_events_count: int = Field(0)
    provenance_intact: bool = Field(True)
    status: str = Field("PASS", json_schema_extra={"example": "PASS"}) # "PASS" or "FAIL"
    verified_at: str = Field(...)
