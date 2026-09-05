import pytest

def test_dynamic_patient_creation(client):
    """Verify POST /api/records/patient creates new patient in SQLite database."""
    payload = {
        "first_name": "Alice",
        "last_name": "Smith",
        "dob": "1991-05-15",
        "gender": "Female",
        "ssn_last4": "1234",
        "phone": "555-999-1234",
        "address": "123 Main St, New York NY"
    }
    response = client.post("/api/records/patient", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["updated"] is False
    assert "registered successfully" in data["message"]
    assert data["patient"]["first_name"] == "Alice"
    assert data["patient"]["last_name"] == "Smith"
    assert data["patient"]["permanent_patient_id"] == "UPI-1991-1234-SMITH"

def test_duplicate_name_updates_existing_patient(client):
    """Verify submitting same first & last name UPDATES existing patient details instead of duplicating."""
    initial_payload = {
        "first_name": "Robert",
        "last_name": "Johnson",
        "dob": "1980-01-01",
        "gender": "Male",
        "ssn_last4": "5555",
        "phone": "555-000-1111",
        "address": "Old Address 100"
    }
    res1 = client.post("/api/records/patient", json=initial_payload)
    assert res1.status_code == 200
    pat_id = res1.json()["patient"]["id"]

    # Submit second entry with SAME NAME but updated address and phone
    updated_payload = {
        "first_name": "robert", # Case insensitive check
        "last_name": "JOHNSON",
        "dob": "1980-01-01",
        "gender": "Male",
        "ssn_last4": "5555",
        "phone": "555-999-8888", # Updated phone
        "address": "New Address 200" # Updated address
    }
    res2 = client.post("/api/records/patient", json=updated_payload)
    assert res2.status_code == 200
    data2 = res2.json()

    assert data2["updated"] is True
    assert data2["patient"]["id"] == pat_id # Preserved same patient ID
    assert data2["patient"]["phone"] == "555-999-8888"
    assert data2["patient"]["address"] == "New Address 200"

def test_add_clinical_event_dynamically(client):
    """Verify POST /api/records/event adds clinical encounter to patient."""
    pat_res = client.post("/api/records/patient", json={
        "first_name": "David",
        "last_name": "Williams",
        "dob": "1988-09-20",
        "gender": "Male",
        "ssn_last4": "8877",
        "phone": "555-444-3333",
        "address": "456 Oak Rd"
    })
    pat_id = pat_res.json()["patient"]["id"]

    event_payload = {
        "patient_id": pat_id,
        "source_record": "record_A",
        "event_type": "lab_test",
        "description": "Fasting Blood Sugar & Lipid Panel",
        "provider": "Dr. Miller",
        "department": "Pathology Lab",
        "metadata": {"glucose": 95}
    }
    evt_res = client.post("/api/records/event", json=event_payload)
    assert evt_res.status_code == 200
    evt_data = evt_res.json()

    assert evt_data["patient_id"] == pat_id
    assert evt_data["event_type"] == "lab_test"
    assert evt_data["description"] == "Fasting Blood Sugar & Lipid Panel"

def test_master_database_directory_endpoint(client):
    """Verify GET /api/records/database returns all stored patients and complete medical histories."""
    res = client.get("/api/records/database")
    assert res.status_code == 200
    data = res.json()

    assert "total_patients" in data
    assert "patients" in data
    assert isinstance(data["patients"], list)
    assert data["total_patients"] >= 1
