from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class AIMatchAnalysisSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    match_confidence: float = Field(..., json_schema_extra={"example": 0.94})
    is_match: bool = Field(..., json_schema_extra={"example": True})
    reasoning: str = Field(..., json_schema_extra={"example": "Matching DOB (1982-04-14) and SSN last 4 (4892) with name variation Jonathan vs John."})
    matching_factors: List[str] = Field(default_factory=list)
    potential_discrepancies: List[str] = Field(default_factory=list)

class AIEventOverlapAnalysisSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    overlap_group_id: str = Field(..., json_schema_extra={"example": "OVERLAP-1000"})
    event_a_id: str = Field(..., json_schema_extra={"example": "A-002"})
    event_b_id: str = Field(..., json_schema_extra={"example": "B-002"})
    relationship_type: str = Field(..., json_schema_extra={"example": "concurrent_encounters"})
    clinical_explanation: str = Field(..., json_schema_extra={"example": "Cardiology consultation vs Urgent Care assessment at 10:00 AM represent concurrent independent clinical activity."})
    preservation_rationale: str = Field(..., json_schema_extra={"example": "Both events preserved side-by-side to prevent clinical data loss."})

class AIExecutiveSummarySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    match_summary: str = Field(...)
    overlap_summary: str = Field(...)
    safety_guarantee_summary: str = Field(...)

class AIServiceResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    patient_match: AIMatchAnalysisSchema
    overlap_analyses: List[AIEventOverlapAnalysisSchema] = Field(default_factory=list)
    executive_summary: AIExecutiveSummarySchema
    is_fallback: bool = Field(False)
    fallback_mode: Optional[str] = Field(None)
    generated_at: str = Field(...)
