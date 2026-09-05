from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class PatientSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., json_schema_extra={"example": "REC-A"})
    first_name: str = Field(..., json_schema_extra={"example": "Jonathan"})
    last_name: str = Field(..., json_schema_extra={"example": "Doe"})
    dob: str = Field(..., json_schema_extra={"example": "1982-04-14"})
    gender: str = Field(..., json_schema_extra={"example": "Male"})
    ssn_last4: str = Field(..., json_schema_extra={"example": "4892"})
    phone: Optional[str] = Field(None, json_schema_extra={"example": "555-234-5678"})
    address: Optional[str] = Field(None, json_schema_extra={"example": "742 Evergreen Terrace"})
