import pytest

def test_permanent_patient_id_generation(client):
    """Verify POST /api/reconcile attaches permanent_patient_id (UPI-YYYY-SSN-LASTNAME)."""
    response = client.post("/api/reconcile?scenario_id=DEMO")
    assert response.status_code == 200
    data = response.json()

    assert "permanent_patient_id" in data
    assert data["permanent_patient_id"] == "UPI-1982-4892-DOE"

def test_lookup_patient_by_permanent_id(client):
    """Verify GET /api/records/lookup/{identifier} retrieves unified profile and timeline."""
    response = client.get("/api/records/lookup/UPI-1982-4892-DOE")
    assert response.status_code == 200
    data = response.json()

    assert data["permanent_patient_id"] == "UPI-1982-4892-DOE"
    assert data["patient"]["first_name"] == "Jonathan"
    assert data["patient"]["last_name"] == "Doe"
    assert len(data["linked_record_ids"]) == 2
    assert "REC-A" in data["linked_record_ids"]
    assert "REC-B" in data["linked_record_ids"]
    assert data["total_visits_count"] == 4
    assert len(data["medical_history_timeline"]) == 4

def test_lookup_patient_by_ssn(client):
    """Verify GET /api/records/lookup/{ssn_last4} retrieves patient profile via SSN."""
    response = client.get("/api/records/lookup/4892")
    assert response.status_code == 200
    data = response.json()

    assert data["permanent_patient_id"] == "UPI-1982-4892-DOE"
    assert data["patient"]["ssn_last4"] == "4892"
    assert data["total_visits_count"] == 4
