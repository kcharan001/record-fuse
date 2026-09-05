import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Patient, ClinicalEvent
from app.schemas.record import RecordDetailResponse, RecordPairResponse, SeedDataResponse
from app.schemas.patient import PatientSchema
from app.schemas.event import ClinicalEventSchema
from app.services.seed_service import seed_database, get_scenarios_list

router = APIRouter(prefix="/api/records", tags=["Patient Records"])

def parse_event_metadata(event: ClinicalEvent) -> ClinicalEventSchema:
    metadata_dict = None
    if event.metadata_json:
        try:
            metadata_dict = json.loads(event.metadata_json)
        except Exception:
            metadata_dict = None

    return ClinicalEventSchema(
        event_id=event.event_id,
        patient_id=event.patient_id,
        source_record=event.source_record,
        timestamp=event.timestamp,
        event_type=event.event_type,
        description=event.description,
        provider=event.provider,
        department=event.department,
        metadata=metadata_dict
    )

@router.post("/seed", response_model=SeedDataResponse)
def seed_records(db: Session = Depends(get_db)):
    """
    Idempotently clears and populates SQLite DB with synthetic demonstration data and 20 expanded scenarios.
    """
    result = seed_database(db)
    return SeedDataResponse(**result)

@router.get("/scenarios")
def get_available_scenarios():
    """
    Retrieves metadata list for all available synthetic scenarios (DEMO + S01 to S20).
    """
    return get_scenarios_list()

@router.get("", response_model=RecordPairResponse)
def get_all_records(
    patient_a_id: str = "REC-A",
    patient_b_id: str = "REC-B",
    scenario_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieves synthetic Record A and Record B duplicate pair with clinical timelines.
    Supports query parameters patient_a_id, patient_b_id, or scenario_id.
    Automatically seeds DB if empty.
    """
    if scenario_id:
        scenarios = get_scenarios_list()
        matched_sc = next((s for s in scenarios if s["scenario_id"] == scenario_id), None)
        if matched_sc:
            patient_a_id = matched_sc["patient_a_id"]
            patient_b_id = matched_sc["patient_b_id"]

    patient_a = db.query(Patient).filter(Patient.id == patient_a_id).first()
    patient_b = db.query(Patient).filter(Patient.id == patient_b_id).first()

    if not patient_a or not patient_b:
        # Auto-seed if not present
        seed_database(db)
        patient_a = db.query(Patient).filter(Patient.id == patient_a_id).first()
        patient_b = db.query(Patient).filter(Patient.id == patient_b_id).first()

    if not patient_a or not patient_b:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient record pair '{patient_a_id}' / '{patient_b_id}' not found."
        )

    events_a_orm = db.query(ClinicalEvent).filter(ClinicalEvent.patient_id == patient_a_id).order_by(ClinicalEvent.timestamp.asc()).all()
    events_b_orm = db.query(ClinicalEvent).filter(ClinicalEvent.patient_id == patient_b_id).order_by(ClinicalEvent.timestamp.asc()).all()

    events_a = [parse_event_metadata(e) for e in events_a_orm]
    events_b = [parse_event_metadata(e) for e in events_b_orm]

    rec_a_detail = RecordDetailResponse(
        patient=PatientSchema.model_validate(patient_a),
        events=events_a,
        event_count=len(events_a)
    )

    rec_b_detail = RecordDetailResponse(
        patient=PatientSchema.model_validate(patient_b),
        events=events_b,
        event_count=len(events_b)
    )

    return RecordPairResponse(
        record_a=rec_a_detail,
        record_b=rec_b_detail,
        total_events=len(events_a) + len(events_b)
    )

@router.get("/{record_id}", response_model=RecordDetailResponse)
def get_record_by_id(record_id: str, db: Session = Depends(get_db)):

    """
    Retrieves detailed clinical record for a single patient ID ('REC-A' or 'REC-B').
    """
    patient = db.query(Patient).filter(Patient.id == record_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient record '{record_id}' not found."
        )

    events_orm = db.query(ClinicalEvent).filter(ClinicalEvent.patient_id == record_id).order_by(ClinicalEvent.timestamp.asc()).all()
    events = [parse_event_metadata(e) for e in events_orm]

    return RecordDetailResponse(
        patient=PatientSchema.model_validate(patient),
        events=events,
        event_count=len(events)
    )
