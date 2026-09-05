import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models import Patient, ClinicalEvent
from app.schemas.record import RecordDetailResponse, RecordPairResponse, SeedDataResponse
from app.schemas.patient import PatientSchema, PatientCreateSchema, PatientUpsertResponseSchema
from app.schemas.event import ClinicalEventSchema, ClinicalEventCreateSchema
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

@router.post("/patient", response_model=PatientUpsertResponseSchema)
def create_or_update_patient(payload: PatientCreateSchema, db: Session = Depends(get_db)):
    """
    Creates a new patient or UPDATES existing patient if first_name + last_name already exists.
    """
    first_clean = payload.first_name.strip()
    last_clean = payload.last_name.strip()

    existing_patient = db.query(Patient).filter(
        func.lower(Patient.first_name) == first_clean.lower(),
        func.lower(Patient.last_name) == last_clean.lower()
    ).first()

    if existing_patient:
        existing_patient.dob = payload.dob
        existing_patient.gender = payload.gender
        existing_patient.ssn_last4 = payload.ssn_last4
        if payload.phone:
            existing_patient.phone = payload.phone
        if payload.address:
            existing_patient.address = payload.address
        db.commit()
        db.refresh(existing_patient)

        year = existing_patient.dob.split('-')[0] if '-' in existing_patient.dob else "2026"
        upi = f"UPI-{year}-{existing_patient.ssn_last4}-{existing_patient.last_name.upper()}"
        p_schema = PatientSchema.model_validate(existing_patient)
        p_schema.permanent_patient_id = upi

        return PatientUpsertResponseSchema(
            message=f"Patient '{first_clean} {last_clean}' found in database. Profile updated successfully.",
            updated=True,
            patient=p_schema
        )
    else:
        new_id = f"PAT-{uuid.uuid4().hex[:8].upper()}"
        new_patient = Patient(
            id=new_id,
            first_name=first_clean,
            last_name=last_clean,
            dob=payload.dob,
            gender=payload.gender,
            ssn_last4=payload.ssn_last4,
            phone=payload.phone,
            address=payload.address
        )
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)

        year = new_patient.dob.split('-')[0] if '-' in new_patient.dob else "2026"
        upi = f"UPI-{year}-{new_patient.ssn_last4}-{new_patient.last_name.upper()}"
        p_schema = PatientSchema.model_validate(new_patient)
        p_schema.permanent_patient_id = upi

        return PatientUpsertResponseSchema(
            message=f"New patient '{first_clean} {last_clean}' registered successfully.",
            updated=False,
            patient=p_schema
        )

@router.post("/event", response_model=ClinicalEventSchema)
def add_clinical_event(payload: ClinicalEventCreateSchema, db: Session = Depends(get_db)):
    """
    Adds a new clinical encounter to a specific patient.
    """
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient ID '{payload.patient_id}' not found."
        )

    ev_id = f"EVT-{uuid.uuid4().hex[:8].upper()}"
    ts = payload.timestamp or datetime.now(timezone.utc)
    meta_str = json.dumps(payload.metadata) if payload.metadata else None

    new_event = ClinicalEvent(
        event_id=ev_id,
        patient_id=payload.patient_id,
        source_record=payload.source_record or "record_A",
        timestamp=ts,
        event_type=payload.event_type,
        description=payload.description,
        provider=payload.provider,
        department=payload.department,
        metadata_json=meta_str
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return parse_event_metadata(new_event)

@router.patch("/event/{event_id}", response_model=ClinicalEventSchema)
def update_clinical_event(event_id: str, source_record: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Updates the source record provenance (record_A vs record_B) of an existing clinical event.
    """
    ev = db.query(ClinicalEvent).filter(ClinicalEvent.event_id == event_id).first()
    if not ev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clinical event '{event_id}' not found."
        )

    if source_record:
        ev.source_record = source_record
        if source_record == "record_B" and ev.patient_id == "REC-A":
            ev.patient_id = "REC-B"
        elif source_record == "record_A" and ev.patient_id == "REC-B":
            ev.patient_id = "REC-A"

    db.commit()
    db.refresh(ev)
    return parse_event_metadata(ev)

@router.get("/database")
def get_master_database_directory(db: Session = Depends(get_db)):
    """
    Returns ALL stored patients in SQLite with their event counts and complete medical history timelines.
    """
    patients_orm = db.query(Patient).order_by(Patient.created_at.desc()).all()
    results = []

    for p in patients_orm:
        events_orm = db.query(ClinicalEvent).filter(ClinicalEvent.patient_id == p.id).order_by(ClinicalEvent.timestamp.asc()).all()
        events = [parse_event_metadata(e) for e in events_orm]
        
        year = p.dob.split('-')[0] if '-' in p.dob else "2026"
        upi = f"UPI-{year}-{p.ssn_last4}-{p.last_name.upper()}"
        p_schema = PatientSchema.model_validate(p)
        p_schema.permanent_patient_id = upi

        results.append({
            "patient": p_schema,
            "event_count": len(events),
            "events": events
        })

    return {
        "total_patients": len(results),
        "patients": results
    }

@router.delete("/database/clear")
def clear_all_records(db: Session = Depends(get_db)):
    """
    Clears all patient records and events from database.
    """
    db.query(ClinicalEvent).delete()
    db.query(Patient).delete()
    db.commit()
    return {"message": "All patient records and events cleared successfully."}

@router.post("/seed", response_model=SeedDataResponse)
def seed_records(db: Session = Depends(get_db)):
    """
    Populates SQLite DB with synthetic demonstration data while preserving custom user patient entries.
    """
    result = seed_database(db, force_reset=False)
    return SeedDataResponse(**result)

@router.get("/scenarios")
def get_available_scenarios():
    """
    Retrieves metadata list for all available synthetic scenarios (DEMO + S01 to S08).
    """
    return get_scenarios_list()

@router.get("/lookup/{identifier}")
def lookup_patient_by_permanent_id(identifier: str, db: Session = Depends(get_db)):
    """
    Looks up a patient by their Permanent Master Patient Identifier (UPI / MPI), SSN-4, or Record ID.
    Returns their complete unified master profile, linked record IDs, and complete multi-visit clinical history.
    """
    clean_id = identifier.strip().upper()
    
    patient = db.query(Patient).filter(Patient.id == identifier).first()
    
    if not patient:
        patient = db.query(Patient).filter(Patient.ssn_last4 == identifier).first()
        
    if not patient:
        scenarios = get_scenarios_list()
        for sc in scenarios:
            p_a = db.query(Patient).filter(Patient.id == sc["patient_a_id"]).first()
            if p_a:
                year = p_a.dob.split('-')[0] if '-' in p_a.dob else "2026"
                upi = f"UPI-{year}-{p_a.ssn_last4}-{p_a.last_name.upper()}"
                if clean_id in upi or clean_id == upi:
                    patient = p_a
                    break

    if not patient:
        patient = db.query(Patient).filter(Patient.id == "REC-A").first()
        if not patient:
            seed_database(db)
            patient = db.query(Patient).filter(Patient.id == "REC-A").first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No patient found matching Permanent ID or SSN '{identifier}'."
        )

    sibling = db.query(Patient).filter(
        Patient.ssn_last4 == patient.ssn_last4,
        Patient.dob == patient.dob,
        Patient.id != patient.id
    ).first()

    linked_records = [patient.id]
    if sibling:
        linked_records.append(sibling.id)

    events_orm = db.query(ClinicalEvent).filter(ClinicalEvent.patient_id.in_(linked_records)).order_by(ClinicalEvent.timestamp.asc()).all()
    events = [parse_event_metadata(e) for e in events_orm]

    year = patient.dob.split('-')[0] if '-' in patient.dob else "2026"
    upi_id = f"UPI-{year}-{patient.ssn_last4}-{patient.last_name.upper()}"
    p_schema = PatientSchema.model_validate(patient)
    p_schema.permanent_patient_id = upi_id

    return {
        "permanent_patient_id": upi_id,
        "patient": p_schema,
        "linked_record_ids": linked_records,
        "total_visits_count": len(events),
        "medical_history_timeline": events
    }


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

    all_events_orm = db.query(ClinicalEvent).filter(
        (ClinicalEvent.patient_id == patient_a_id) | 
        (ClinicalEvent.patient_id == patient_b_id)
    ).order_by(ClinicalEvent.timestamp.asc()).all()

    events_a_orm = [
        e for e in all_events_orm 
        if e.source_record == 'record_A' or (e.patient_id == patient_a_id and e.source_record != 'record_B')
    ]
    events_b_orm = [
        e for e in all_events_orm 
        if e.source_record == 'record_B' or (e.patient_id == patient_b_id and e.source_record != 'record_A')
    ]

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
