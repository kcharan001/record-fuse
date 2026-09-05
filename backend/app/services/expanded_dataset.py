import json
from datetime import datetime, timezone

def dt(year, month, day, hour, minute):
    return datetime(year, month, day, hour, minute, 0, tzinfo=timezone.utc)

EXPANDED_SCENARIOS = [
    # =========================================================================
    # CASE 1: HIGH-CONFIDENCE MATCHES (S01 - S02) - 2 Events Per Record
    # =========================================================================
    {
        "scenario_id": "S01",
        "category": "high_confidence_match",
        "expected_match_class": "match",
        "title": "Jonathan Miller vs John Miller (Nickname & Exact Identifiers)",
        "patient_a": {
            "id": "S01-REC-A",
            "first_name": "Jonathan",
            "last_name": "Miller",
            "dob": "1978-06-12",
            "gender": "Male",
            "ssn_last4": "9102",
            "phone": "555-101-2020",
            "address": "104 Maple Street, Boston MA"
        },
        "patient_b": {
            "id": "S01-REC-B",
            "first_name": "John",
            "last_name": "Miller",
            "dob": "1978-06-12",
            "gender": "Male",
            "ssn_last4": "9102",
            "phone": "(555) 101-2020",
            "address": "104 Maple St, Boston MA"
        },
        "events_a": [
            {"event_id": "S01-A-001", "patient_id": "S01-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 1, 8, 0), "event_type": "lab_test", "description": "Lipid Panel & Fasting Blood Glucose", "provider": "Dr. Adams", "department": "Outpatient Lab", "metadata_json": json.dumps({"fasting": True})},
            {"event_id": "S01-A-002", "patient_id": "S01-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 1, 10, 0), "event_type": "consultation", "description": "Routine Primary Care Annual Physical", "provider": "Dr. Adams", "department": "Internal Medicine", "metadata_json": json.dumps({"type": "annual"})}
        ],
        "events_b": [
            {"event_id": "S01-B-001", "patient_id": "S01-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 1, 9, 0), "event_type": "vitals", "description": "Triage Vitals: HR 72 bpm, BP 126/82 mmHg", "provider": "Nurse Tech", "department": "Urgent Care", "metadata_json": json.dumps({"bp": "126/82"})},
            {"event_id": "S01-B-002", "patient_id": "S01-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 1, 10, 0), "event_type": "consultation", "description": "Urgent Care Evaluation for Mild Ankle Sprain", "provider": "Dr. Evans", "department": "Urgent Care", "metadata_json": json.dumps({"injury": "ankle"})}
        ]
    },
    {
        "scenario_id": "S02",
        "category": "high_confidence_match",
        "expected_match_class": "match",
        "title": "Katherine Wilson vs Catherine Wilson (Spelling Variation)",
        "patient_a": {
            "id": "S02-REC-A",
            "first_name": "Katherine",
            "last_name": "Wilson",
            "dob": "1990-11-25",
            "gender": "Female",
            "ssn_last4": "3411",
            "phone": "555-222-3344",
            "address": "45 Oakland Ave, Chicago IL"
        },
        "patient_b": {
            "id": "S02-REC-B",
            "first_name": "Catherine",
            "last_name": "Wilson",
            "dob": "1990-11-25",
            "gender": "Female",
            "ssn_last4": "3411",
            "phone": "555-222-3344",
            "address": "45 Oakland Avenue, Chicago IL"
        },
        "events_a": [
            {"event_id": "S02-A-001", "patient_id": "S02-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 5, 9, 0), "event_type": "consultation", "description": "OB/GYN Routine Annual Check-up", "provider": "Dr. Smith", "department": "OB/GYN", "metadata_json": json.dumps({"type": "routine"})},
            {"event_id": "S02-A-002", "patient_id": "S02-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 5, 10, 30), "event_type": "lab_test", "description": "Pap Smear & HPV Screening Collected", "provider": "Tech Lisa", "department": "Pathology", "metadata_json": json.dumps({"sample": "cervical"})}
        ],
        "events_b": [
            {"event_id": "S02-B-001", "patient_id": "S02-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 5, 9, 15), "event_type": "radiology", "description": "Pelvic Ultrasound Imaging Completed", "provider": "Dr. Wong", "department": "Ultrasound", "metadata_json": json.dumps({"type": "pelvic"})},
            {"event_id": "S02-B-002", "patient_id": "S02-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 5, 11, 0), "event_type": "consultation", "description": "Ultrasound Review & Follow-up Note", "provider": "Dr. Wong", "department": "Radiology", "metadata_json": json.dumps({"notes": "normal"})}
        ]
    },

    # =========================================================================
    # CASE 2: MEDIUM-CONFIDENCE / REVIEW REQUIRED (S03 - S04) - 2 Events Per Record
    # =========================================================================
    {
        "scenario_id": "S03",
        "category": "medium_confidence_review",
        "expected_match_class": "review_required",
        "title": "Michael Brown vs Mike Brown (Same DOB, Phone/Address Relocated)",
        "patient_a": {
            "id": "S03-REC-A",
            "first_name": "Michael",
            "last_name": "Brown",
            "dob": "1985-04-18",
            "gender": "Male",
            "ssn_last4": "5541",
            "phone": "555-888-9900",
            "address": "12 Elm St, Dallas TX"
        },
        "patient_b": {
            "id": "S03-REC-B",
            "first_name": "Mike",
            "last_name": "Brown",
            "dob": "1985-04-18",
            "gender": "Male",
            "ssn_last4": "5541",
            "phone": "555-111-2233",
            "address": "889 Oak Blvd, Fort Worth TX"
        },
        "events_a": [
            {"event_id": "S03-A-001", "patient_id": "S03-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 10, 8, 30), "event_type": "vitals", "description": "Pre-op Assessment Vitals: BP 130/84 mmHg", "provider": "Nurse Karen", "department": "Surgery", "metadata_json": json.dumps({"bp": "130/84"})},
            {"event_id": "S03-A-002", "patient_id": "S03-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 10, 10, 0), "event_type": "consultation", "description": "Orthopedic Knee Surgery Prep Consult", "provider": "Dr. Ross", "department": "Orthopedics", "metadata_json": json.dumps({"knee": "left"})}
        ],
        "events_b": [
            {"event_id": "S03-B-001", "patient_id": "S03-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 10, 9, 30), "event_type": "radiology", "description": "Left Knee MRI Scan 1.5T", "provider": "Dr. Kim", "department": "Imaging", "metadata_json": json.dumps({"mri": "left_knee"})},
            {"event_id": "S03-B-002", "patient_id": "S03-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 10, 11, 30), "event_type": "prescription", "description": "Prescribed Celecoxib 200mg daily", "provider": "Dr. Ross", "department": "Pharmacy", "metadata_json": json.dumps({"dosage": "200mg"})}
        ]
    },
    {
        "scenario_id": "S04",
        "category": "medium_confidence_review",
        "expected_match_class": "review_required",
        "title": "Christopher Lee vs Chris Lee (DOB Month/Day Transposition)",
        "patient_a": {
            "id": "S04-REC-A",
            "first_name": "Christopher",
            "last_name": "Lee",
            "dob": "1992-03-08",
            "gender": "Male",
            "ssn_last4": "7789",
            "phone": "555-333-4455",
            "address": "200 Main St, Seattle WA"
        },
        "patient_b": {
            "id": "S04-REC-B",
            "first_name": "Chris",
            "last_name": "Lee",
            "dob": "1992-08-03",
            "gender": "Male",
            "ssn_last4": "7789",
            "phone": "555-333-4455",
            "address": "200 Main Street, Seattle WA"
        },
        "events_a": [
            {"event_id": "S04-A-001", "patient_id": "S04-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 12, 9, 0), "event_type": "consultation", "description": "Dermatology Skin Lesion Exam", "provider": "Dr. Patel", "department": "Dermatology", "metadata_json": json.dumps({"lesion": "back"})},
            {"event_id": "S04-A-002", "patient_id": "S04-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 12, 10, 15), "event_type": "procedure", "description": "Biopsy of Skin Lesion Collected", "provider": "Dr. Patel", "department": "Dermatology", "metadata_json": json.dumps({"site": "upper_back"})}
        ],
        "events_b": [
            {"event_id": "S04-B-001", "patient_id": "S04-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 12, 9, 30), "event_type": "vitals", "description": "Dermatology Clinic Vitals Check", "provider": "Nurse Ann", "department": "Dermatology", "metadata_json": json.dumps({"bp": "120/78"})},
            {"event_id": "S04-B-002", "patient_id": "S04-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 12, 11, 0), "event_type": "lab_test", "description": "Histopathology Biopsy Sent to Lab", "provider": "Tech Sam", "department": "Pathology", "metadata_json": json.dumps({"specimen": "skin"})}
        ]
    },

    # =========================================================================
    # CASE 3: COMPLEX CLINICAL OVERLAPS (S05 - S06) - 2 Events Per Record
    # =========================================================================
    {
        "scenario_id": "S05",
        "category": "complex_clinical_overlap",
        "expected_match_class": "match",
        "title": "James Anderson vs Jim Anderson (Exact 14:00 ER vs Urgent Care Overlap)",
        "patient_a": {
            "id": "S05-REC-A",
            "first_name": "James",
            "last_name": "Anderson",
            "dob": "1973-09-14",
            "gender": "Male",
            "ssn_last4": "6019",
            "phone": "555-777-8899",
            "address": "55 Park Ave, New York NY"
        },
        "patient_b": {
            "id": "S05-REC-B",
            "first_name": "Jim",
            "last_name": "Anderson",
            "dob": "1973-09-14",
            "gender": "Male",
            "ssn_last4": "6019",
            "phone": "555-777-8899",
            "address": "55 Park Avenue, New York NY"
        },
        "events_a": [
            {"event_id": "S05-A-001", "patient_id": "S05-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 15, 13, 0), "event_type": "vitals", "description": "ER Triage Vitals: HR 104, BP 142/90", "provider": "Triage Nurse", "department": "Emergency", "metadata_json": json.dumps({"triage": 2})},
            {"event_id": "S05-A-002", "patient_id": "S05-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 15, 14, 0), "event_type": "consultation", "description": "Emergency Dept Assessment for Abdominal Pain", "provider": "Dr. Vance", "department": "Emergency", "metadata_json": json.dumps({"pain_scale": 7})}
        ],
        "events_b": [
            {"event_id": "S05-B-001", "patient_id": "S05-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 15, 13, 30), "event_type": "vitals", "description": "Urgent Care Vitals: Temp 99.1 F, SpO2 98%", "provider": "Nurse Miller", "department": "Urgent Care", "metadata_json": json.dumps({"spo2": 98})},
            {"event_id": "S05-B-002", "patient_id": "S05-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 15, 14, 0), "event_type": "consultation", "description": "Urgent Care Evaluation for Nausea & Gastritis", "provider": "Dr. Chen", "department": "Urgent Care", "metadata_json": json.dumps({"diagnosis": "gastritis"})}
        ]
    },
    {
        "scenario_id": "S06",
        "category": "complex_clinical_overlap",
        "expected_match_class": "match",
        "title": "Emily Thomas vs Emma Thomas (Exact 09:30 Outpatient Lab vs Ultrasound Collision)",
        "patient_a": {
            "id": "S06-REC-A",
            "first_name": "Emily",
            "last_name": "Thomas",
            "dob": "1995-12-04",
            "gender": "Female",
            "ssn_last4": "1122",
            "phone": "555-999-0011",
            "address": "120 Lake St, Miami FL"
        },
        "patient_b": {
            "id": "S06-REC-B",
            "first_name": "Emma",
            "last_name": "Thomas",
            "dob": "1995-12-04",
            "gender": "Female",
            "ssn_last4": "1122",
            "phone": "555-999-0011",
            "address": "120 Lake Drive, Miami FL"
        },
        "events_a": [
            {"event_id": "S06-A-001", "patient_id": "S06-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 18, 8, 30), "event_type": "vitals", "description": "Outpatient Lab Check-in Vitals", "provider": "Nurse Pam", "department": "Outpatient Lab", "metadata_json": json.dumps({"bp": "116/74"})},
            {"event_id": "S06-A-002", "patient_id": "S06-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 18, 9, 30), "event_type": "lab_test", "description": "Thyroid Panel TSH & Free T4 Collected", "provider": "Tech Beth", "department": "Outpatient Lab", "metadata_json": json.dumps({"tsh": 2.1})}
        ],
        "events_b": [
            {"event_id": "S06-B-001", "patient_id": "S06-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 18, 9, 0), "event_type": "vitals", "description": "Thyroid Ultrasound Clinic Vitals", "provider": "Tech Don", "department": "Ultrasound", "metadata_json": json.dumps({"bp": "118/76"})},
            {"event_id": "S06-B-002", "patient_id": "S06-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 18, 9, 30), "event_type": "radiology", "description": "Thyroid Ultrasound Scan 7.5MHz", "provider": "Dr. Scott", "department": "Ultrasound", "metadata_json": json.dumps({"nodule": "none"})}
        ]
    },

    # =========================================================================
    # CASE 4: NON-MATCH CASES (S07 - S08) - 2 Events Per Record
    # =========================================================================
    {
        "scenario_id": "S07",
        "category": "non_match",
        "expected_match_class": "non_match",
        "title": "William Johnson vs William Johnson (Same Name, Different DOB & SSN-4)",
        "patient_a": {
            "id": "S07-REC-A",
            "first_name": "William",
            "last_name": "Johnson",
            "dob": "1962-01-15",
            "gender": "Male",
            "ssn_last4": "1001",
            "phone": "555-111-0000",
            "address": "10 Cedar Rd, Denver CO"
        },
        "patient_b": {
            "id": "S07-REC-B",
            "first_name": "William",
            "last_name": "Johnson",
            "dob": "1988-07-22",
            "gender": "Male",
            "ssn_last4": "9999",
            "phone": "555-999-1111",
            "address": "400 Pine St, Denver CO"
        },
        "events_a": [
            {"event_id": "S07-A-001", "patient_id": "S07-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 25, 9, 0), "event_type": "consultation", "description": "Cardiology Evaluation for Hypertension", "provider": "Dr. Clark", "department": "Cardiology", "metadata_json": json.dumps({"bp": "148/92"})},
            {"event_id": "S07-A-002", "patient_id": "S07-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 25, 10, 30), "event_type": "lab_test", "description": "Comprehensive Metabolic Panel & Lipid Screen", "provider": "Tech Mary", "department": "Lab", "metadata_json": json.dumps({"glucose": 105})}
        ],
        "events_b": [
            {"event_id": "S07-B-001", "patient_id": "S07-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 25, 14, 0), "event_type": "consultation", "description": "Sports Medicine Acute Knee Assessment", "provider": "Dr. Young", "department": "Orthopedics", "metadata_json": json.dumps({"joint": "knee"})},
            {"event_id": "S07-B-002", "patient_id": "S07-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 25, 15, 15), "event_type": "radiology", "description": "Right Knee X-Ray 2-Views", "provider": "Tech Bob", "department": "Radiology", "metadata_json": json.dumps({"result": "sprain"})}
        ]
    },
    {
        "scenario_id": "S08",
        "category": "non_match",
        "expected_match_class": "non_match",
        "title": "Charles Martinez vs Charles Martinez (Father / Son Different DOB)",
        "patient_a": {
            "id": "S08-REC-A",
            "first_name": "Charles",
            "last_name": "Martinez",
            "dob": "1955-03-30",
            "gender": "Male",
            "ssn_last4": "4444",
            "phone": "555-444-3333",
            "address": "500 Elm St, Chicago IL"
        },
        "patient_b": {
            "id": "S08-REC-B",
            "first_name": "Charles",
            "last_name": "Martinez",
            "dob": "1977-08-14",
            "gender": "Male",
            "ssn_last4": "5555",
            "phone": "555-555-4444",
            "address": "500 Elm St, Chicago IL"
        },
        "events_a": [
            {"event_id": "S08-A-001", "patient_id": "S08-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 28, 10, 0), "event_type": "consultation", "description": "Geriatric Memory & Cognitive Assessment", "provider": "Dr. Shaw", "department": "Geriatrics", "metadata_json": json.dumps({"mmse": 28})},
            {"event_id": "S08-A-002", "patient_id": "S08-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 28, 11, 30), "event_type": "vitals", "description": "Geriatric Clinic Vitals Check: BP 134/82", "provider": "Nurse Beth", "department": "Geriatrics", "metadata_json": json.dumps({"bp": "134/82"})}
        ],
        "events_b": [
            {"event_id": "S08-B-001", "patient_id": "S08-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 28, 10, 30), "event_type": "consultation", "description": "Executive Health Physical Exam", "provider": "Dr. Vance", "department": "Executive Health", "metadata_json": json.dumps({"status": "healthy"})},
            {"event_id": "S08-B-002", "patient_id": "S08-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 28, 12, 0), "event_type": "lab_test", "description": "Executive Health Lipid & Treadmill Stress Test", "provider": "Tech Ryan", "department": "Cardiology Lab", "metadata_json": json.dumps({"mets": 12})}
        ]
    }
]
