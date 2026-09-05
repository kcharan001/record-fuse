def test_seed_endpoint(client):
    """Verify POST /api/records/seed populates DB and returns expected counts."""
    response = client.post("/api/records/seed")
    assert response.status_code == 200
    data = response.json()
    assert data["patient_count"] == 42
    assert data["scenarios_count"] == 21
    assert data["record_a_events"] == 33
    assert data["record_b_events"] == 34
    assert data["total_events"] == 67




def test_get_all_records_structure(client):
    """Verify GET /api/records returns Record A (6) and Record B (7)."""
    response = client.get("/api/records")
    assert response.status_code == 200
    data = response.json()

    rec_a = data["record_a"]
    rec_b = data["record_b"]

    assert rec_a["patient"]["id"] == "REC-A"
    assert rec_a["event_count"] == 6
    assert len(rec_a["events"]) == 6

    assert rec_b["patient"]["id"] == "REC-B"
    assert rec_b["event_count"] == 7
    assert len(rec_b["events"]) == 7

    assert data["total_events"] == 13

def test_event_id_uniqueness_and_provenance(client):
    """Verify all 13 event IDs are unique and retain source provenance."""
    response = client.get("/api/records")
    assert response.status_code == 200
    data = response.json()

    events_a = data["record_a"]["events"]
    events_b = data["record_b"]["events"]
    all_events = events_a + events_b

    # Rule 1: 13 Total Events
    assert len(all_events) == 13

    # Rule 2: All 13 IDs are unique
    event_ids = [e["event_id"] for e in all_events]
    assert len(set(event_ids)) == 13

    # Rule 3: Provenance assertion
    for e in events_a:
        assert e["source_record"] == "record_A"
        assert e["event_id"].startswith("A-")
        assert e["patient_id"] == "REC-A"
        assert e["timestamp"] is not None
        assert e["event_type"] is not None
        assert e["description"] is not None

    for e in events_b:
        assert e["source_record"] == "record_B"
        assert e["event_id"].startswith("B-")
        assert e["patient_id"] == "REC-B"
        assert e["timestamp"] is not None
        assert e["event_type"] is not None
        assert e["description"] is not None

def test_get_single_record_by_id(client):
    """Verify GET /api/records/REC-A and /api/records/REC-B."""
    resp_a = client.get("/api/records/REC-A")
    assert resp_a.status_code == 200
    data_a = resp_a.json()
    assert data_a["patient"]["first_name"] == "Jonathan"
    assert data_a["event_count"] == 6

    resp_b = client.get("/api/records/REC-B")
    assert resp_b.status_code == 200
    data_b = resp_b.json()
    assert data_b["patient"]["first_name"] == "John"
    assert data_b["event_count"] == 7

def test_nonexistent_record_returns_404(client):
    """Verify 404 for invalid record ID."""
    resp = client.get("/api/records/REC-UNKNOWN")
    assert resp.status_code == 404
