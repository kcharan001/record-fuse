import json
from datetime import datetime, timezone, timedelta

# Helper to generate ISO UTC datetimes easily
def dt(year, month, day, hour, minute):
    return datetime(year, month, day, hour, minute, 0, tzinfo=timezone.utc)

EXPANDED_SCENARIOS = [
    # =========================================================================
    # HIGH-CONFIDENCE MATCHES (S01 - S05)
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
            {"event_id": "S01-A-001", "patient_id": "S01-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 1, 8, 0), "event_type": "lab_test", "description": "Lipid Panel & Fasting Glucose", "provider": "Dr. Adams", "department": "Outpatient Lab", "metadata_json": json.dumps({"fasting": True})},
            {"event_id": "S01-A-002", "patient_id": "S01-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 1, 10, 0), "event_type": "consultation", "description": "Routine Annual Physical Examination", "provider": "Dr. Adams", "department": "Internal Medicine", "metadata_json": json.dumps({"type": "annual"})},
            {"event_id": "S01-A-003", "patient_id": "S01-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 1, 11, 30), "event_type": "prescription", "description": "Atorvastatin 20mg daily", "provider": "Dr. Adams", "department": "Pharmacy", "metadata_json": json.dumps({"dosage": "20mg"})},
            {"event_id": "S01-A-004", "patient_id": "S01-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 1, 14, 0), "event_type": "vitals", "description": "BP Check 124/80 mmHg, HR 70", "provider": "Nurse Joy", "department": "Internal Medicine", "metadata_json": json.dumps({"bp": "124/80"})},
            {"event_id": "S01-A-005", "patient_id": "S01-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 1, 16, 0), "event_type": "followup", "description": "Follow-up scheduled in 6 months", "provider": "Dr. Adams", "department": "Internal Medicine", "metadata_json": json.dumps({"period": "6m"})}
        ],
        "events_b": [
            {"event_id": "S01-B-001", "patient_id": "S01-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 1, 9, 0), "event_type": "vitals", "description": "Triage Vitals: HR 72, BP 126/82", "provider": "Nurse Tech", "department": "Urgent Care", "metadata_json": json.dumps({"bp": "126/82"})},
            {"event_id": "S01-B-002", "patient_id": "S01-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 1, 10, 0), "event_type": "consultation", "description": "Urgent Care Evaluation for Mild Ankle Sprain", "provider": "Dr. Evans", "department": "Urgent Care", "metadata_json": json.dumps({"injury": "ankle"})},
            {"event_id": "S01-B-003", "patient_id": "S01-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 1, 10, 45), "event_type": "radiology", "description": "Right Ankle X-Ray 3-Views", "provider": "Tech Ray", "department": "Radiology", "metadata_json": json.dumps({"result": "No fracture"})},
            {"event_id": "S01-B-004", "patient_id": "S01-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 1, 12, 0), "event_type": "prescription", "description": "Ibuprofen 600mg as needed", "provider": "Dr. Evans", "department": "Pharmacy", "metadata_json": json.dumps({"dosage": "600mg"})},
            {"event_id": "S01-B-005", "patient_id": "S01-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 1, 13, 0), "event_type": "discharge", "description": "Urgent Care discharge instructions", "provider": "Dr. Evans", "department": "Urgent Care", "metadata_json": json.dumps({"status": "discharged"})}
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
            {"event_id": "S02-A-001", "patient_id": "S02-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 5, 9, 0), "event_type": "consultation", "description": "OB/GYN Routine Check-up", "provider": "Dr. Smith", "department": "OB/GYN", "metadata_json": json.dumps({"type": "routine"})},
            {"event_id": "S02-A-002", "patient_id": "S02-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 5, 11, 0), "event_type": "lab_test", "description": "Pap Smear & HPV Screening", "provider": "Tech Lisa", "department": "Pathology", "metadata_json": json.dumps({"sample": "cervical"})}
        ],
        "events_b": [
            {"event_id": "S02-B-001", "patient_id": "S02-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 5, 9, 15), "event_type": "radiology", "description": "Pelvic Ultrasound Imaging", "provider": "Dr. Wong", "department": "Ultrasound", "metadata_json": json.dumps({"type": "pelvic"})},
            {"event_id": "S02-B-002", "patient_id": "S02-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 5, 12, 30), "event_type": "note", "description": "Patient consultation summary", "provider": "Dr. Wong", "department": "OB/GYN", "metadata_json": json.dumps({"status": "complete"})}
        ]
    },
    {
        "scenario_id": "S03",
        "category": "high_confidence_match",
        "expected_match_class": "match",
        "title": "Robert Davis vs Bob Davis (Nickname & Identical DOB/SSN)",
        "patient_a": {"id": "S03-REC-A", "first_name": "Robert", "last_name": "Davis", "dob": "1965-03-08", "gender": "Male", "ssn_last4": "8820", "phone": "555-444-5566", "address": "12 Pine Rd, Seattle WA"},
        "patient_b": {"id": "S03-REC-B", "first_name": "Bob", "last_name": "Davis", "dob": "1965-03-08", "gender": "Male", "ssn_last4": "8820", "phone": "555-444-5566", "address": "12 Pine Road, Seattle WA"},
        "events_a": [
            {"event_id": "S03-A-001", "patient_id": "S03-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 10, 8, 30), "event_type": "vitals", "description": "Pre-op Assessment Vitals", "provider": "Nurse Karen", "department": "Surgery", "metadata_json": json.dumps({"bp": "130/84"})},
            {"event_id": "S03-A-002", "patient_id": "S03-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 10, 10, 0), "event_type": "consultation", "description": "Orthopedic Knee Surgery Prep", "provider": "Dr. Ross", "department": "Orthopedics", "metadata_json": json.dumps({"knee": "left"})}
        ],
        "events_b": [
            {"event_id": "S03-B-001", "patient_id": "S03-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 10, 9, 30), "event_type": "radiology", "description": "Left Knee MRI scan", "provider": "Dr. Kim", "department": "Imaging", "metadata_json": json.dumps({"mri": "left_knee"})},
            {"event_id": "S03-B-002", "patient_id": "S03-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 10, 11, 30), "event_type": "prescription", "description": "Celecoxib 200mg daily", "provider": "Dr. Ross", "department": "Pharmacy", "metadata_json": json.dumps({"dosage": "200mg"})}
        ]
    },
    {
        "scenario_id": "S04",
        "category": "high_confidence_match",
        "expected_match_class": "match",
        "title": "Elizabeth Taylor vs Liz Taylor (Exact DOB & SSN-4)",
        "patient_a": {"id": "S04-REC-A", "first_name": "Elizabeth", "last_name": "Taylor", "dob": "1985-09-30", "gender": "Female", "ssn_last4": "5123", "phone": "555-777-8899", "address": "88 Elm St, Miami FL"},
        "patient_b": {"id": "S04-REC-B", "first_name": "Liz", "last_name": "Taylor", "dob": "1985-09-30", "gender": "Female", "ssn_last4": "5123", "phone": "555-777-8899", "address": "88 Elm Street, Miami FL"},
        "events_a": [
            {"event_id": "S04-A-001", "patient_id": "S04-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 12, 10, 0), "event_type": "consultation", "description": "Dermatology Skin Cancer Screen", "provider": "Dr. Patel", "department": "Dermatology", "metadata_json": json.dumps({"screen": "full_body"})}
        ],
        "events_b": [
            {"event_id": "S04-B-001", "patient_id": "S04-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 12, 10, 0), "event_type": "consultation", "description": "Allergy Assessment & Scratch Test", "provider": "Dr. Lee", "department": "Allergy Clinic", "metadata_json": json.dumps({"test": "skin_prick"})}
        ]
    },
    {
        "scenario_id": "S05",
        "category": "high_confidence_match",
        "expected_match_class": "match",
        "title": "Alexander Wright vs Alex Wright (Identical Match)",
        "patient_a": {"id": "S05-REC-A", "first_name": "Alexander", "last_name": "Wright", "dob": "1995-01-18", "gender": "Male", "ssn_last4": "7744", "phone": "555-333-4455", "address": "500 Grand Ave, Austin TX"},
        "patient_b": {"id": "S05-REC-B", "first_name": "Alex", "last_name": "Wright", "dob": "1995-01-18", "gender": "Male", "ssn_last4": "7744", "phone": "555-333-4455", "address": "500 Grand Avenue, Austin TX"},
        "events_a": [
            {"event_id": "S05-A-001", "patient_id": "S05-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 14, 13, 0), "event_type": "vitals", "description": "Sports Medicine Check-in Vitals", "provider": "Nurse Dan", "department": "Sports Med", "metadata_json": json.dumps({"bp": "118/76"})}
        ],
        "events_b": [
            {"event_id": "S05-B-001", "patient_id": "S05-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 14, 13, 15), "event_type": "consultation", "description": "Shoulder Impingement Exam", "provider": "Dr. Carter", "department": "Sports Med", "metadata_json": json.dumps({"joint": "shoulder"})}
        ]
    },

    # =========================================================================
    # MEDIUM-CONFIDENCE / REVIEW REQUIRED (S06 - S10)
    # =========================================================================
    {
        "scenario_id": "S06",
        "category": "medium_confidence_review",
        "expected_match_class": "review_required",
        "title": "Michael Brown vs Mike Brown (Same DOB, Phone Differs)",
        "patient_a": {"id": "S06-REC-A", "first_name": "Michael", "last_name": "Brown", "dob": "1980-07-22", "gender": "Male", "ssn_last4": "4321", "phone": "555-999-1111", "address": "123 Main St, Denver CO"},
        "patient_b": {"id": "S06-REC-B", "first_name": "Mike", "last_name": "Brown", "dob": "1980-07-22", "gender": "Male", "ssn_last4": "4321", "phone": "555-888-2222", "address": "456 High St, Denver CO"},
        "events_a": [
            {"event_id": "S06-A-001", "patient_id": "S06-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 15, 9, 0), "event_type": "lab_test", "description": "HbA1c & Fasting Glucose Panel", "provider": "Tech Sam", "department": "Endocrinology Lab", "metadata_json": json.dumps({"hba1c": 6.8})}
        ],
        "events_b": [
            {"event_id": "S06-B-001", "patient_id": "S06-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 15, 9, 30), "event_type": "consultation", "description": "Diabetes Management Review", "provider": "Dr. Hill", "department": "Endocrinology", "metadata_json": json.dumps({"type": "diabetes"})}
        ]
    },
    {
        "scenario_id": "S07",
        "category": "medium_confidence_review",
        "expected_match_class": "review_required",
        "title": "Sarah Jenkins vs Sara Jenkins (Address Relocated)",
        "patient_a": {"id": "S07-REC-A", "first_name": "Sarah", "last_name": "Jenkins", "dob": "1988-12-04", "gender": "Female", "ssn_last4": "6543", "phone": "555-123-9876", "address": "77 River Rd, Dallas TX"},
        "patient_b": {"id": "S07-REC-B", "first_name": "Sara", "last_name": "Jenkins", "dob": "1988-12-04", "gender": "Female", "ssn_last4": "6543", "phone": "555-123-9876", "address": "900 Sun Valley Dr, Fort Worth TX"},
        "events_a": [
            {"event_id": "S07-A-001", "patient_id": "S07-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 16, 11, 0), "event_type": "consultation", "description": "Neurology Migraine Evaluation", "provider": "Dr. Vance", "department": "Neurology", "metadata_json": json.dumps({"symptom": "migraine"})}
        ],
        "events_b": [
            {"event_id": "S07-B-001", "patient_id": "S07-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 16, 11, 30), "event_type": "prescription", "description": "Sumatriptan 50mg tablets", "provider": "Dr. Vance", "department": "Pharmacy", "metadata_json": json.dumps({"dosage": "50mg"})}
        ]
    },
    {
        "scenario_id": "S08",
        "category": "medium_confidence_review",
        "expected_match_class": "review_required",
        "title": "David Martinez vs Dave Martinez (Different Hospitals)",
        "patient_a": {"id": "S08-REC-A", "first_name": "David", "last_name": "Martinez", "dob": "1972-04-19", "gender": "Male", "ssn_last4": "1199", "phone": "555-444-1122", "address": "15 West St, Phoenix AZ"},
        "patient_b": {"id": "S08-REC-B", "first_name": "Dave", "last_name": "Martinez", "dob": "1972-04-19", "gender": "Male", "ssn_last4": "1199", "phone": "555-444-1122", "address": "15 West Street, Phoenix AZ"},
        "events_a": [
            {"event_id": "S08-A-001", "patient_id": "S08-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 17, 14, 0), "event_type": "consultation", "description": "Gastroenterology Acid Reflux Exam", "provider": "Dr. Gomez", "department": "GI Clinic", "metadata_json": json.dumps({"symptom": "reflux"})}
        ],
        "events_b": [
            {"event_id": "S08-B-001", "patient_id": "S08-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 17, 14, 15), "event_type": "prescription", "description": "Omeprazole 20mg daily", "provider": "Dr. Gomez", "department": "Pharmacy", "metadata_json": json.dumps({"dosage": "20mg"})}
        ]
    },
    {
        "scenario_id": "S09",
        "category": "medium_confidence_review",
        "expected_match_class": "review_required",
        "title": "Christopher Lee vs Chris Lee (Minor DOB Typo)",
        "patient_a": {"id": "S09-REC-A", "first_name": "Christopher", "last_name": "Lee", "dob": "1992-08-11", "gender": "Male", "ssn_last4": "8765", "phone": "555-666-7788", "address": "22 Cedar Ct, San Jose CA"},
        "patient_b": {"id": "S09-REC-B", "first_name": "Chris", "last_name": "Lee", "dob": "1992-08-12", "gender": "Male", "ssn_last4": "8765", "phone": "555-666-7788", "address": "22 Cedar Court, San Jose CA"},
        "events_a": [
            {"event_id": "S09-A-001", "patient_id": "S09-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 18, 10, 0), "event_type": "vitals", "description": "Routine Vitals Assessment", "provider": "Nurse Beth", "department": "Primary Care", "metadata_json": json.dumps({"bp": "120/78"})}
        ],
        "events_b": [
            {"event_id": "S09-B-001", "patient_id": "S09-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 18, 10, 30), "event_type": "consultation", "description": "General Physical Exam", "provider": "Dr. Chen", "department": "Primary Care", "metadata_json": json.dumps({"type": "exam"})}
        ]
    },
    {
        "scenario_id": "S10",
        "category": "medium_confidence_review",
        "expected_match_class": "review_required",
        "title": "Amanda White vs Mandy White (Different Phone Number)",
        "patient_a": {"id": "S10-REC-A", "first_name": "Amanda", "last_name": "White", "dob": "1984-02-28", "gender": "Female", "ssn_last4": "3344", "phone": "555-111-2233", "address": "600 Birch Ave, Minneapolis MN"},
        "patient_b": {"id": "S10-REC-B", "first_name": "Mandy", "last_name": "White", "dob": "1984-02-28", "gender": "Female", "ssn_last4": "3344", "phone": "555-999-8877", "address": "600 Birch Avenue, Minneapolis MN"},
        "events_a": [
            {"event_id": "S10-A-001", "patient_id": "S10-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 19, 15, 0), "event_type": "lab_test", "description": "Thyroid Panel (TSH & Free T4)", "provider": "Tech John", "department": "Lab", "metadata_json": json.dumps({"tsh": 2.1})}
        ],
        "events_b": [
            {"event_id": "S10-B-001", "patient_id": "S10-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 19, 15, 45), "event_type": "consultation", "description": "Endocrinology Review", "provider": "Dr. Baker", "department": "Endocrinology", "metadata_json": json.dumps({"status": "normal"})}
        ]
    },

    # =========================================================================
    # COMPLEX CLINICAL OVERLAP (S11 - S15)
    # =========================================================================
    {
        "scenario_id": "S11",
        "category": "complex_clinical_overlap",
        "expected_match_class": "match",
        "title": "James Anderson vs Jim Anderson (Exact 14:00 ER vs Urgent Care Overlap)",
        "patient_a": {"id": "S11-REC-A", "first_name": "James", "last_name": "Anderson", "dob": "1975-05-14", "gender": "Male", "ssn_last4": "5512", "phone": "555-777-1122", "address": "33 River St, Philadelphia PA"},
        "patient_b": {"id": "S11-REC-B", "first_name": "Jim", "last_name": "Anderson", "dob": "1975-05-14", "gender": "Male", "ssn_last4": "5512", "phone": "555-777-1122", "address": "33 River Street, Philadelphia PA"},
        "events_a": [
            {"event_id": "S11-A-001", "patient_id": "S11-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 20, 14, 0), "event_type": "consultation", "description": "Emergency Room Acute Chest Pain Triage", "provider": "Dr. Clark", "department": "Emergency Dept", "metadata_json": json.dumps({"triage": 1})},
            {"event_id": "S11-A-002", "patient_id": "S11-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 20, 14, 30), "event_type": "radiology", "description": "Emergency Chest CT Angiogram", "provider": "Dr. Clark", "department": "Radiology", "metadata_json": json.dumps({"ct": "chest"})}
        ],
        "events_b": [
            {"event_id": "S11-B-001", "patient_id": "S11-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 20, 14, 0), "event_type": "consultation", "description": "Urgent Care Assessment for Shortness of Breath", "provider": "Dr. Harris", "department": "Urgent Care", "metadata_json": json.dumps({"triage": 2})},
            {"event_id": "S11-B-002", "patient_id": "S11-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 20, 14, 45), "event_type": "medication", "description": "Oxygen Therapy 2L via Nasal Cannula", "provider": "Nurse Pam", "department": "Urgent Care", "metadata_json": json.dumps({"o2": "2L"})}
        ]
    },
    {
        "scenario_id": "S12",
        "category": "complex_clinical_overlap",
        "expected_match_class": "match",
        "title": "Emily Thomas vs Emma Thomas (Exact 09:30 Lab vs Ultrasound Overlap)",
        "patient_a": {"id": "S12-REC-A", "first_name": "Emily", "last_name": "Thomas", "dob": "1993-02-17", "gender": "Female", "ssn_last4": "2299", "phone": "555-888-3344", "address": "90 Lakeview Dr, Orlando FL"},
        "patient_b": {"id": "S12-REC-B", "first_name": "Emma", "last_name": "Thomas", "dob": "1993-02-17", "gender": "Female", "ssn_last4": "2299", "phone": "555-888-3344", "address": "90 Lakeview Drive, Orlando FL"},
        "events_a": [
            {"event_id": "S12-A-001", "patient_id": "S12-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 21, 9, 30), "event_type": "lab_test", "description": "Blood Glucose & Metabolic Panel", "provider": "Tech Amy", "department": "Outpatient Lab", "metadata_json": json.dumps({"glucose": 105})}
        ],
        "events_b": [
            {"event_id": "S12-B-001", "patient_id": "S12-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 21, 9, 30), "event_type": "radiology", "description": "Abdominal Ultrasound Examination", "provider": "Dr. Scott", "department": "Ultrasound", "metadata_json": json.dumps({"organ": "gallbladder"})}
        ]
    },
    {
        "scenario_id": "S13",
        "category": "complex_clinical_overlap",
        "expected_match_class": "match",
        "title": "Daniel Jackson vs Dan Jackson (Exact 11:00 Nephrology vs Dialysis)",
        "patient_a": {"id": "S13-REC-A", "first_name": "Daniel", "last_name": "Jackson", "dob": "1968-10-05", "gender": "Male", "ssn_last4": "6677", "phone": "555-222-7788", "address": "14 Park Ave, Detroit MI"},
        "patient_b": {"id": "S13-REC-B", "first_name": "Dan", "last_name": "Jackson", "dob": "1968-10-05", "gender": "Male", "ssn_last4": "6677", "phone": "555-222-7788", "address": "14 Park Avenue, Detroit MI"},
        "events_a": [
            {"event_id": "S13-A-001", "patient_id": "S13-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 22, 11, 0), "event_type": "consultation", "description": "Nephrology Renal Function Review", "provider": "Dr. Mehta", "department": "Nephrology", "metadata_json": json.dumps({"stage": "CKD 3"})}
        ],
        "events_b": [
            {"event_id": "S13-B-001", "patient_id": "S13-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 22, 11, 0), "event_type": "medication", "description": "Outpatient Hemodialysis Session Prep", "provider": "Nurse Ray", "department": "Dialysis Center", "metadata_json": json.dumps({"session": "prep"})}
        ]
    },
    {
        "scenario_id": "S14",
        "category": "complex_clinical_overlap",
        "expected_match_class": "match",
        "title": "Jessica Harris vs Jessie Harris (Exact 15:30 ICU vs Surgical Exam)",
        "patient_a": {"id": "S14-REC-A", "first_name": "Jessica", "last_name": "Harris", "dob": "1987-04-03", "gender": "Female", "ssn_last4": "4488", "phone": "555-999-4455", "address": "77 Sun St, San Diego CA"},
        "patient_b": {"id": "S14-REC-B", "first_name": "Jessie", "last_name": "Harris", "dob": "1987-04-03", "gender": "Female", "ssn_last4": "4488", "phone": "555-999-4455", "address": "77 Sun Street, San Diego CA"},
        "events_a": [
            {"event_id": "S14-A-001", "patient_id": "S14-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 23, 15, 30), "event_type": "vitals", "description": "Post-Op ICU Vital Signs Continuous Monitoring", "provider": "Nurse Clara", "department": "ICU", "metadata_json": json.dumps({"bp": "115/72"})}
        ],
        "events_b": [
            {"event_id": "S14-B-001", "patient_id": "S14-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 23, 15, 30), "event_type": "consultation", "description": "Surgical Wound Drainage & Dressing Exam", "provider": "Dr. Vance", "department": "General Surgery", "metadata_json": json.dumps({"wound": "clean"})}
        ]
    },
    {
        "scenario_id": "S15",
        "category": "complex_clinical_overlap",
        "expected_match_class": "match",
        "title": "Matthew Martin vs Matt Martin (Exact 08:00 Blood Draw vs ECG)",
        "patient_a": {"id": "S15-REC-A", "first_name": "Matthew", "last_name": "Martin", "dob": "1991-07-29", "gender": "Male", "ssn_last4": "1234", "phone": "555-444-9900", "address": "55 Valley View, Nashville TN"},
        "patient_b": {"id": "S15-REC-B", "first_name": "Matt", "last_name": "Martin", "dob": "1991-07-29", "gender": "Male", "ssn_last4": "1234", "phone": "555-444-9900", "address": "55 Valley View Rd, Nashville TN"},
        "events_a": [
            {"event_id": "S15-A-001", "patient_id": "S15-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 24, 8, 0), "event_type": "lab_test", "description": "Troponin T & Cardiac Enzyme Draw", "provider": "Tech Tim", "department": "Cardiac Lab", "metadata_json": json.dumps({"troponin": "<0.01"})}
        ],
        "events_b": [
            {"event_id": "S15-B-001", "patient_id": "S15-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 24, 8, 0), "event_type": "radiology", "description": "12-Lead Electrocardiogram (ECG)", "provider": "Tech Jane", "department": "Cardiology", "metadata_json": json.dumps({"rhythm": "sinus"})}
        ]
    },

    # =========================================================================
    # NON-MATCH / POTENTIAL FALSE MATCH (S16 - S20)
    # =========================================================================
    {
        "scenario_id": "S16",
        "category": "non_match",
        "expected_match_class": "non_match",
        "title": "William Johnson vs William Johnson (Same Name, Different DOB & SSN)",
        "patient_a": {"id": "S16-REC-A", "first_name": "William", "last_name": "Johnson", "dob": "1970-01-15", "gender": "Male", "ssn_last4": "1111", "phone": "555-111-0000", "address": "101 1st Ave, New York NY"},
        "patient_b": {"id": "S16-REC-B", "first_name": "William", "last_name": "Johnson", "dob": "1985-06-20", "gender": "Male", "ssn_last4": "9999", "phone": "555-999-0000", "address": "909 9th St, Brooklyn NY"},
        "events_a": [
            {"event_id": "S16-A-001", "patient_id": "S16-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 25, 9, 0), "event_type": "consultation", "description": "Hypertension Follow-up Consultation", "provider": "Dr. Lee", "department": "Internal Medicine", "metadata_json": json.dumps({"bp": "142/90"})}
        ],
        "events_b": [
            {"event_id": "S16-B-001", "patient_id": "S16-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 25, 10, 0), "event_type": "consultation", "description": "Pediatric/Young Adult Asthma Consultation", "provider": "Dr. Davis", "department": "Pulmonology", "metadata_json": json.dumps({"asthma": "mild"})}
        ]
    },
    {
        "scenario_id": "S17",
        "category": "non_match",
        "expected_match_class": "non_match",
        "title": "Jennifer Smith vs Jennifer Smith (Different Generations/DOBs)",
        "patient_a": {"id": "S17-REC-A", "first_name": "Jennifer", "last_name": "Smith", "dob": "1993-05-10", "gender": "Female", "ssn_last4": "2222", "phone": "555-222-1111", "address": "12 Cherry Ln, Atlanta GA"},
        "patient_b": {"id": "S17-REC-B", "first_name": "Jennifer", "last_name": "Smith", "dob": "1968-11-02", "gender": "Female", "ssn_last4": "8888", "phone": "555-888-7777", "address": "45 Peachtree St, Atlanta GA"},
        "events_a": [
            {"event_id": "S17-A-001", "patient_id": "S17-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 26, 14, 0), "event_type": "lab_test", "description": "Routine Wellness Blood Panel", "provider": "Tech Sue", "department": "Wellness Lab", "metadata_json": json.dumps({"type": "wellness"})}
        ],
        "events_b": [
            {"event_id": "S17-B-001", "patient_id": "S17-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 26, 14, 30), "event_type": "consultation", "description": "Rheumatology Arthritis Evaluation", "provider": "Dr. King", "department": "Rheumatology", "metadata_json": json.dumps({"joint": "hands"})}
        ]
    },
    {
        "scenario_id": "S18",
        "category": "non_match",
        "expected_match_class": "non_match",
        "title": "Richard Garcia vs Richard Garcia (Different DOB & SSN-4)",
        "patient_a": {"id": "S18-REC-A", "first_name": "Richard", "last_name": "Garcia", "dob": "1981-09-09", "gender": "Male", "ssn_last4": "3311", "phone": "555-331-1000", "address": "77 Houston St, Austin TX"},
        "patient_b": {"id": "S18-REC-B", "first_name": "Richard", "last_name": "Garcia", "dob": "1999-12-12", "gender": "Male", "ssn_last4": "7722", "phone": "555-772-2000", "address": "88 San Antonio Rd, Austin TX"},
        "events_a": [
            {"event_id": "S18-A-001", "patient_id": "S18-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 27, 11, 0), "event_type": "vitals", "description": "Pre-employment Screen Vitals", "provider": "Nurse Beth", "department": "Occupational Health", "metadata_json": json.dumps({"fit": "yes"})}
        ],
        "events_b": [
            {"event_id": "S18-B-001", "patient_id": "S18-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 27, 11, 30), "event_type": "consultation", "description": "Emergency Dept Laceration Repair", "provider": "Dr. Cruz", "department": "Emergency", "metadata_json": json.dumps({"sutures": 4})}
        ]
    },
    {
        "scenario_id": "S19",
        "category": "non_match",
        "expected_match_class": "non_match",
        "title": "Charles Martinez vs Charles Martinez (Father / Son Different DOB)",
        "patient_a": {"id": "S19-REC-A", "first_name": "Charles", "last_name": "Martinez", "dob": "1955-03-30", "gender": "Male", "ssn_last4": "4444", "phone": "555-444-3333", "address": "500 Elm St, Chicago IL"},
        "patient_b": {"id": "S19-REC-B", "first_name": "Charles", "last_name": "Martinez", "dob": "1977-08-14", "gender": "Male", "ssn_last4": "5555", "phone": "555-555-4444", "address": "500 Elm St, Chicago IL"},
        "events_a": [
            {"event_id": "S19-A-001", "patient_id": "S19-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 28, 10, 0), "event_type": "consultation", "description": "Geriatric Memory & Cognitive Assessment", "provider": "Dr. Shaw", "department": "Geriatrics", "metadata_json": json.dumps({"mmse": 28})}
        ],
        "events_b": [
            {"event_id": "S19-B-001", "patient_id": "S19-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 28, 10, 30), "event_type": "consultation", "description": "Executive Physical Exam", "provider": "Dr. Vance", "department": "Executive Health", "metadata_json": json.dumps({"status": "healthy"})}
        ]
    },
    {
        "scenario_id": "S20",
        "category": "non_match",
        "expected_match_class": "non_match",
        "title": "Patricia Clark vs Patricia Clark (Different DOBs & Identifiers)",
        "patient_a": {"id": "S20-REC-A", "first_name": "Patricia", "last_name": "Clark", "dob": "1989-10-24", "gender": "Female", "ssn_last4": "3333", "phone": "555-333-1111", "address": "12 Pine St, Boston MA"},
        "patient_b": {"id": "S20-REC-B", "first_name": "Patricia", "last_name": "Clark", "dob": "1994-04-01", "gender": "Female", "ssn_last4": "7777", "phone": "555-777-2222", "address": "99 Beacon St, Boston MA"},
        "events_a": [
            {"event_id": "S20-A-001", "patient_id": "S20-REC-A", "source_record": "record_A", "timestamp": dt(2026, 8, 29, 13, 0), "event_type": "consultation", "description": "Allergy Desensitization Immunotherapy", "provider": "Dr. Ross", "department": "Allergy", "metadata_json": json.dumps({"dose": "maintenance"})}
        ],
        "events_b": [
            {"event_id": "S20-B-001", "patient_id": "S20-REC-B", "source_record": "record_B", "timestamp": dt(2026, 8, 29, 13, 30), "event_type": "lab_test", "description": "Complete Blood Count & Iron Panel", "provider": "Tech Mary", "department": "Hematology", "metadata_json": json.dumps({"ferritin": 45})}
        ]
    }
]
