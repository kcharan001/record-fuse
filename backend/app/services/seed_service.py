import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import Patient, ClinicalEvent

SYNTHETIC_PATIENTS = [
    {
        "id": "REC-A",
        "first_name": "Jonathan",
        "last_name": "Doe",
        "dob": "1982-04-14",
        "gender": "Male",
        "ssn_last4": "4892",
        "national_id_country": "IN",
        "national_id_type": "Aadhaar",
        "national_id_last4": "4892",
        "phone": "555-234-5678",
        "address": "742 Evergreen Terrace, Springfield"
    },
    {
        "id": "REC-B",
        "first_name": "John",
        "last_name": "Doe",
        "dob": "1982-04-14",
        "gender": "Male",
        "ssn_last4": "4892",
        "national_id_country": "IN",
        "national_id_type": "Aadhaar",
        "national_id_last4": "4892",
        "phone": "(555) 234-5678",
        "address": "742 Evergreen Terr, Springfield"
    }
]

SYNTHETIC_EVENTS = [
    # Record A Events (2 Events: A-001, A-002)
    {
        "event_id": "A-001",
        "patient_id": "REC-A",
        "source_record": "record_A",
        "timestamp": datetime(2026, 8, 21, 8, 30, 0, tzinfo=timezone.utc),
        "event_type": "lab_test",
        "description": "Blood Glucose & Comprehensive Metabolic Panel",
        "provider": "Dr. Marcus Vance",
        "department": "Outpatient Lab",
        "metadata_json": json.dumps({"fasting": True, "glucose_mg_dl": 98})
    },
    {
        "event_id": "A-002",
        "patient_id": "REC-A",
        "source_record": "record_A",
        "timestamp": datetime(2026, 8, 21, 10, 0, 0, tzinfo=timezone.utc),
        "event_type": "consultation",
        "description": "General Cardiology Consultation for Palpitations",
        "provider": "Dr. Sarah Jenkins",
        "department": "Cardiology",
        "metadata_json": json.dumps({"clinic_type": "Specialty"})
    },

    # Record B Events (2 Events: B-001, B-002)
    {
        "event_id": "B-001",
        "patient_id": "REC-B",
        "source_record": "record_B",
        "timestamp": datetime(2026, 8, 21, 9, 15, 0, tzinfo=timezone.utc),
        "event_type": "radiology",
        "description": "Chest X-Ray 2-Views for Chest Discomfort",
        "provider": "Dr. Alan Grant",
        "department": "Urgent Care Radiology",
        "metadata_json": json.dumps({"view": "PA and Lateral", "result": "Clear"})
    },
    {
        "event_id": "B-002",
        "patient_id": "REC-B",
        "source_record": "record_B",
        "timestamp": datetime(2026, 8, 21, 10, 0, 0, tzinfo=timezone.utc), # EXACT OVERLAP AT 10:00:00
        "event_type": "consultation",
        "description": "Urgent Care Assessment for Acute Chest Tightness & Cough",
        "provider": "Dr. Robert Chen",
        "department": "Urgent Care",
        "metadata_json": json.dumps({"triage_level": 2})
    }
]

from app.services.expanded_dataset import EXPANDED_SCENARIOS

def get_scenarios_list():
    """
    Returns high-level metadata for all available synthetic scenarios (DEMO + S01 to S08).
    """
    scenarios = [
        {
            "scenario_id": "DEMO",
            "category": "demo_dataset",
            "expected_match_class": "match",
            "title": "Jonathan Doe vs John Doe (Original Demo Dataset)",
            "patient_a_id": "REC-A",
            "patient_b_id": "REC-B",
            "patient_a_name": "Jonathan Doe",
            "patient_b_name": "John Doe",
            "events_a_count": len([e for e in SYNTHETIC_EVENTS if e["source_record"] == "record_A"]),
            "events_b_count": len([e for e in SYNTHETIC_EVENTS if e["source_record"] == "record_B"]),
            "total_events": len(SYNTHETIC_EVENTS)
        }
    ]
    for sc in EXPANDED_SCENARIOS:
        scenarios.append({
            "scenario_id": sc["scenario_id"],
            "category": sc["category"],
            "expected_match_class": sc["expected_match_class"],
            "title": sc["title"],
            "patient_a_id": sc["patient_a"]["id"],
            "patient_b_id": sc["patient_b"]["id"],
            "patient_a_name": f"{sc['patient_a']['first_name']} {sc['patient_a']['last_name']}",
            "patient_b_name": f"{sc['patient_b']['first_name']} {sc['patient_b']['last_name']}",
            "events_a_count": len(sc["events_a"]),
            "events_b_count": len(sc["events_b"]),
            "total_events": len(sc["events_a"]) + len(sc["events_b"])
        })
    return scenarios

def seed_database(db: Session, force_reset: bool = False):
    """
    Seeds the database with synthetic duplicate-pair scenarios (1 Demo + 8 Expanded).
    Preserves all user-added patients and custom clinical events unless force_reset is explicitly True.
    """
    if force_reset:
        db.query(ClinicalEvent).delete()
        db.query(Patient).delete()
        db.commit()

    # 1. Insert DEMO Patients & Events if missing
    for p_data in SYNTHETIC_PATIENTS:
        if not db.query(Patient).filter(Patient.id == p_data["id"]).first():
            patient = Patient(**p_data)
            db.add(patient)
    for e_data in SYNTHETIC_EVENTS:
        if not db.query(ClinicalEvent).filter(ClinicalEvent.event_id == e_data["event_id"]).first():
            event = ClinicalEvent(**e_data)
            db.add(event)
    db.commit()

    # 2. Insert 8 Expanded Scenarios Patients & Events if missing
    for sc in EXPANDED_SCENARIOS:
        pa = dict(sc["patient_a"])
        pa.setdefault("national_id_country", "IN")
        pa.setdefault("national_id_type", "Aadhaar")
        pa.setdefault("national_id_last4", pa.get("ssn_last4", "0000"))

        pb = dict(sc["patient_b"])
        pb.setdefault("national_id_country", "IN")
        pb.setdefault("national_id_type", "Aadhaar")
        pb.setdefault("national_id_last4", pb.get("ssn_last4", "0000"))

        if not db.query(Patient).filter(Patient.id == pa["id"]).first():
            db.add(Patient(**pa))
        if not db.query(Patient).filter(Patient.id == pb["id"]).first():
            db.add(Patient(**pb))
        for e_data in sc["events_a"]:
            if not db.query(ClinicalEvent).filter(ClinicalEvent.event_id == e_data["event_id"]).first():
                db.add(ClinicalEvent(**e_data))
        for e_data in sc["events_b"]:
            if not db.query(ClinicalEvent).filter(ClinicalEvent.event_id == e_data["event_id"]).first():
                db.add(ClinicalEvent(**e_data))
    db.commit()

    count_a = db.query(ClinicalEvent).filter(ClinicalEvent.source_record == "record_A").count()
    count_b = db.query(ClinicalEvent).filter(ClinicalEvent.source_record == "record_B").count()
    total_patients = db.query(Patient).count()
    total_events = db.query(ClinicalEvent).count()

    return {
        "message": f"Seeded {len(EXPANDED_SCENARIOS) + 1} synthetic patient duplicate-pair scenarios successfully",
        "scenarios_count": len(EXPANDED_SCENARIOS) + 1,
        "patient_count": total_patients,
        "record_a_events": count_a,
        "record_b_events": count_b,
        "total_events": total_events,
        "seeded_at": datetime.now(timezone.utc).isoformat()
    }
