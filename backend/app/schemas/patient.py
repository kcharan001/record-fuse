from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class PatientSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., json_schema_extra={"example": "REC-A"})
    first_name: str = Field(..., json_schema_extra={"example": "Jonathan"})
    last_name: str = Field(..., json_schema_extra={"example": "Doe"})
    dob: str = Field(..., json_schema_extra={"example": "1982-04-14"})
    age: Optional[str] = Field(None, json_schema_extra={"example": "42"})
    gender: str = Field(..., json_schema_extra={"example": "Male"})
    ssn_last4: str = Field(..., json_schema_extra={"example": "4892"})
    phone: Optional[str] = Field(None, json_schema_extra={"example": "555-234-5678"})
    address: Optional[str] = Field(None, json_schema_extra={"example": "742 Evergreen Terrace"})
    permanent_patient_id: Optional[str] = Field(None, json_schema_extra={"example": "UPI-1982-4892-DOE"})

class PatientCreateSchema(BaseModel):
    first_name: str = Field(..., json_schema_extra={"example": "Jonathan"})
    last_name: str = Field(..., json_schema_extra={"example": "Doe"})
    dob: str = Field(..., json_schema_extra={"example": "1982-04-14"})
    age: Optional[str] = Field(None, json_schema_extra={"example": "42"})
    gender: str = Field(..., json_schema_extra={"example": "Male"})
    ssn_last4: str = Field(..., json_schema_extra={"example": "4892"})
    phone: Optional[str] = Field(None, json_schema_extra={"example": "555-234-5678"})
    address: Optional[str] = Field(None, json_schema_extra={"example": "742 Evergreen Terrace"})

class PatientUpsertResponseSchema(BaseModel):
    message: str
    updated: bool
    patient: PatientSchema

