from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from app.schemas.verification import VerificationResultSchema
from app.schemas.ai import AIServiceResponseSchema

class ApprovalRequestSchema(BaseModel):
    patient_a_id: str = Field("REC-A")
    patient_b_id: str = Field("REC-B")
    scenario_id: Optional[str] = Field(None)
    approval_status: str = Field(..., json_schema_extra={"example": "APPROVED"}) # "APPROVED" or "REJECTED" or "PENDING"
    reviewer_notes: Optional[str] = Field(None)


class AuditTrailSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reconciliation_id: str = Field(..., json_schema_extra={"example": "RECON-REC-A-REC-B"})
    patient_a_id: str = Field("REC-A")
    patient_b_id: str = Field("REC-B")
    reconciled_at: str = Field(...)
    approval_status: str = Field("PENDING") # "PENDING", "APPROVED", "REJECTED"
    record_a_count: int = Field(6)
    record_b_count: int = Field(7)
    total_events: int = Field(13)
    exact_overlaps_count: int = Field(1)
    near_overlaps_count: int = Field(4)
    ai_status: str = Field("FALLBACK") # "ACTIVE" or "FALLBACK"
    ai_fallback_reason: Optional[str] = Field(None)
    match_confidence: float = Field(0.95)
    verification_status: str = Field("PASS")
    lost_events_count: int = Field(0)
    missing_event_ids: List[str] = Field(default_factory=list)
    duplicate_event_ids: List[str] = Field(default_factory=list)
    invalid_provenance_event_ids: List[str] = Field(default_factory=list)
    provenance_intact: bool = Field(True)

class IntegrityScenarioResultSchema(BaseModel):
    scenario_name: str
    description: str
    expected_status: str # "PASS" or "FAIL"
    actual_status: str # "PASS" or "FAIL"
    passed: bool
    details: Dict[str, Any]

class IntegrityTestMatrixSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_scenarios: int = Field(7)
    passed_scenarios: int = Field(7)
    system_integrity_status: str = Field("PASS")
    scenarios: List[IntegrityScenarioResultSchema]
    executed_at: str
