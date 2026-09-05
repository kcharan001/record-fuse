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
        "phone": "(555) 234-5678",
        "address": "742 Evergreen Terr, Springfield"
    }
]

SYNTHETIC_EVENTS = [
    # Record A Events (6 Events: A-001 to A-006)
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
    {
        "event_id": "A-003",
        "patient_id": "REC-A",
        "source_record": "record_A",
        "timestamp": datetime(2026, 8, 21, 11, 30, 0, tzinfo=timezone.utc),
        "event_type": "prescription",
        "description": "Prescribed Lisinopril 10mg daily",
        "provider": "Dr. Sarah Jenkins",
        "department": "Pharmacy",
        "metadata_json": json.dumps({"dosage": "10mg", "refills": 3})
    },
    {
        "event_id": "A-004",
        "patient_id": "REC-A",
        "source_record": "record_A",
        "timestamp": datetime(2026, 8, 21, 14, 0, 0, tzinfo=timezone.utc),
        "event_type": "vitals",
        "description": "Blood Pressure Check: 138/88 mmHg, HR 76",
        "provider": "Nurse Reader",
        "department": "Cardiology",
        "metadata_json": json.dumps({"bp_systolic": 138, "bp_diastolic": 88})
    },
    {
        "event_id": "A-005",
        "patient_id": "REC-A",
        "source_record": "record_A",
        "timestamp": datetime(2026, 8, 21, 16, 15, 0, tzinfo=timezone.utc),
        "event_type": "followup",
        "description": "Telehealth follow-up appointment scheduled",
        "provider": "Coordinator Kelly",
        "department": "Outpatient Care",
        "metadata_json": json.dumps({"mode": "telehealth"})
    },
    {
        "event_id": "A-006",
        "patient_id": "REC-A",
        "source_record": "record_A",
        "timestamp": datetime(2026, 8, 21, 18, 0, 0, tzinfo=timezone.utc),
        "event_type": "discharge",
        "description": "Outpatient consultation summary generated",
        "provider": "Dr. Sarah Jenkins",
        "department": "Cardiology",
        "metadata_json": json.dumps({"status": "discharged"})
    },

    # Record B Events (7 Events: B-001 to B-007)
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
    },
    {
        "event_id": "B-003",
        "patient_id": "REC-B",
        "source_record": "record_B",
        "timestamp": datetime(2026, 8, 21, 12, 0, 0, tzinfo=timezone.utc),
        "event_type": "medication",
        "description": "Administered Albuterol Inhaler dose 2 puffs",
        "provider": "Nurse Practitioner Miller",
        "department": "Urgent Care",
        "metadata_json": json.dumps({"route": "inhalation", "puffs": 2})
    },
    {
        "event_id": "B-004",
        "patient_id": "REC-B",
        "source_record": "record_B",
        "timestamp": datetime(2026, 8, 21, 13, 30, 0, tzinfo=timezone.utc),
        "event_type": "lab_test",
        "description": "Sputum Culture & Viral Respiratory Panel Collected",
        "provider": "Tech Davis",
        "department": "Urgent Care Lab",
        "metadata_json": json.dumps({"sample_type": "sputum"})
    },
    {
        "event_id": "B-005",
        "patient_id": "REC-B",
        "source_record": "record_B",
        "timestamp": datetime(2026, 8, 21, 15, 0, 0, tzinfo=timezone.utc),
        "event_type": "vitals",
        "description": "Vitals Check: Temp 99.4 F, Pulse 82 bpm, SpO2 98%",
        "provider": "Nurse Practitioner Miller",
        "department": "Urgent Care",
        "metadata_json": json.dumps({"temp_f": 99.4, "spo2": 98})
    },
    {
        "event_id": "B-006",
        "patient_id": "REC-B",
        "source_record": "record_B",
        "timestamp": datetime(2026, 8, 21, 17, 0, 0, tzinfo=timezone.utc),
        "event_type": "prescription",
        "description": "Prescribed Amoxicillin 500mg capsules",
        "provider": "Dr. Robert Chen",
        "department": "Urgent Care Pharmacy",
        "metadata_json": json.dumps({"dosage": "500mg", "duration_days": 7})
    },
    {
        "event_id": "B-007",
        "patient_id": "REC-B",
        "source_record": "record_B",
        "timestamp": datetime(2026, 8, 21, 19, 30, 0, tzinfo=timezone.utc),
        "event_type": "note",
        "description": "Urgent Care discharge instruction note: Rest & Hydrate",
        "provider": "Dr. Robert Chen",
        "department": "Urgent Care",
        "metadata_json": json.dumps({"instructions": "Rest, drink fluids, follow up if fever spikes"})
    }
]

from app.services.expanded_dataset import EXPANDED_SCENARIOS

def get_scenarios_list():
    """
    Returns high-level metadata for all 21 available synthetic scenarios (DEMO + S01 to S20).
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

def seed_database(db: Session):
    """
    Cleans and seeds the database with 21 synthetic duplicate-pair scenarios
    (1 Original Demo + 20 Expanded Scenarios S01..S20).
    """
    # Delete existing data to guarantee clean idempotent reset
    db.query(ClinicalEvent).delete()
    db.query(Patient).delete()
    db.commit()

    # 1. Insert DEMO Patients & Events
    for p_data in SYNTHETIC_PATIENTS:
        patient = Patient(**p_data)
        db.add(patient)
    for e_data in SYNTHETIC_EVENTS:
        event = ClinicalEvent(**e_data)
        db.add(event)
    db.commit()

    # 2. Insert 20 Expanded Scenarios Patients & Events
    for sc in EXPANDED_SCENARIOS:
        db.add(Patient(**sc["patient_a"]))
        db.add(Patient(**sc["patient_b"]))
        for e_data in sc["events_a"]:
            db.add(ClinicalEvent(**e_data))
        for e_data in sc["events_b"]:
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


