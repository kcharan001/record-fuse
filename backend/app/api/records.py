import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Patient, ClinicalEvent
from app.schemas.record import RecordDetailResponse, RecordPairResponse, SeedDataResponse
from app.schemas.patient import PatientSchema
from app.schemas.event import ClinicalEventSchema
from app.services.seed_service import seed_database

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
    Idempotently clears and populates SQLite DB with synthetic demonstration data.
    """
    result = seed_database(db)
    return SeedDataResponse(**result)

@router.get("", response_model=RecordPairResponse)
def get_all_records(db: Session = Depends(get_db)):
    """
    Retrieves synthetic Record A and Record B duplicate pair with clinical timelines.
    Automatically seeds DB if empty.
    """
    patient_a = db.query(Patient).filter(Patient.id == "REC-A").first()
    patient_b = db.query(Patient).filter(Patient.id == "REC-B").first()

    if not patient_a or not patient_b:
        # Auto-seed if not present
        seed_database(db)
        patient_a = db.query(Patient).filter(Patient.id == "REC-A").first()
        patient_b = db.query(Patient).filter(Patient.id == "REC-B").first()

    events_a_orm = db.query(ClinicalEvent).filter(ClinicalEvent.patient_id == "REC-A").order_by(ClinicalEvent.timestamp.asc()).all()
    events_b_orm = db.query(ClinicalEvent).filter(ClinicalEvent.patient_id == "REC-B").order_by(ClinicalEvent.timestamp.asc()).all()

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
