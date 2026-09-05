import pytest
from app.services.seed_service import SYNTHETIC_EVENTS
from app.schemas.event import ClinicalEventSchema
from app.engine.reconciler import TimelineReconciler
from app.engine.verifier import ZeroLossVerifier

@pytest.fixture
def synthetic_records():
    """Parses raw synthetic events into Record A and Record B lists."""
    events_a = []
    events_b = []
    for ev in SYNTHETIC_EVENTS:
        schema_ev = ClinicalEventSchema(
            event_id=ev["event_id"],
            patient_id=ev["patient_id"],
            source_record=ev["source_record"],
            timestamp=ev["timestamp"],
            event_type=ev["event_type"],
            description=ev["description"],
            provider=ev["provider"],
            department=ev["department"],
            metadata=None
        )
        if ev["source_record"] == "record_A":
            events_a.append(schema_ev)
        else:
            events_b.append(schema_ev)
    return events_a, events_b

def test_happy_path_verification_pass(synthetic_records):
    """Happy Path: Normal 13-event merge must yield PASS with 0 lost events."""
    events_a, events_b = synthetic_records
    reconciler = TimelineReconciler()
    result = reconciler.reconcile(events_a, events_b)

    verifier = ZeroLossVerifier()
    v_result = verifier.verify(events_a, events_b, result.timeline)

    assert v_result.status == "PASS"
    assert v_result.expected_total == 13
    assert v_result.actual_total == 13
    assert v_result.lost_events_count == 0
    assert v_result.missing_event_ids == []
    assert v_result.duplicate_event_ids == []
    assert v_result.invalid_provenance_event_ids == []
    assert v_result.provenance_intact is True

def test_adversarial_missing_record_a_event_causes_fail(synthetic_records):
    """ADVERSARIAL: Removing event A-002 from merged timeline MUST yield FAIL."""
    events_a, events_b = synthetic_records
    reconciler = TimelineReconciler()
    result = reconciler.reconcile(events_a, events_b)

    # Corrupt timeline by silently dropping A-002
    corrupted_timeline = [e for e in result.timeline if e.original_event_id != "A-002"]

    verifier = ZeroLossVerifier()
    v_result = verifier.verify(events_a, events_b, corrupted_timeline)

    assert v_result.status == "FAIL"
    assert v_result.actual_total == 12
    assert "A-002" in v_result.missing_event_ids
    assert v_result.lost_events_count >= 1

def test_adversarial_missing_record_b_event_causes_fail(synthetic_records):
    """ADVERSARIAL: Removing event B-005 from merged timeline MUST yield FAIL."""
    events_a, events_b = synthetic_records
    reconciler = TimelineReconciler()
    result = reconciler.reconcile(events_a, events_b)

    # Corrupt timeline by silently dropping B-005
    corrupted_timeline = [e for e in result.timeline if e.original_event_id != "B-005"]

    verifier = ZeroLossVerifier()
    v_result = verifier.verify(events_a, events_b, corrupted_timeline)

    assert v_result.status == "FAIL"
    assert v_result.actual_total == 12
    assert "B-005" in v_result.missing_event_ids
    assert v_result.lost_events_count >= 1

def test_adversarial_duplicate_event_id_causes_fail(synthetic_records):
    """ADVERSARIAL: Duplicating event A-001 in merged timeline MUST yield FAIL."""
    events_a, events_b = synthetic_records
    reconciler = TimelineReconciler()
    result = reconciler.reconcile(events_a, events_b)

    # Corrupt timeline by appending a duplicate copy of A-001
    corrupted_timeline = list(result.timeline)
    corrupted_timeline.append(result.timeline[0]) # Duplicate A-001

    verifier = ZeroLossVerifier()
    v_result = verifier.verify(events_a, events_b, corrupted_timeline)

    assert v_result.status == "FAIL"
    assert "A-001" in v_result.duplicate_event_ids

def test_adversarial_invalid_provenance_causes_fail(synthetic_records):
    """ADVERSARIAL: Mutating source_record of A-001 to 'record_B' MUST yield FAIL."""
    events_a, events_b = synthetic_records
    reconciler = TimelineReconciler()
    result = reconciler.reconcile(events_a, events_b)

    # Corrupt provenance of event A-001
    corrupted_timeline = [e.model_copy(deep=True) for e in result.timeline]
    corrupted_timeline[0].source_record = "record_B" # A-001 claims to be from record_B

    verifier = ZeroLossVerifier()
    v_result = verifier.verify(events_a, events_b, corrupted_timeline)

    assert v_result.status == "FAIL"
    assert "A-001" in v_result.invalid_provenance_event_ids
    assert v_result.provenance_intact is False

def test_exact_10am_overlap_preservation_passes_verification(synthetic_records):
    """ASSERTION: Both 10:00 AM events (A-002 and B-002) preserved → PASS."""
    events_a, events_b = synthetic_records
    reconciler = TimelineReconciler()
    result = reconciler.reconcile(events_a, events_b)

    verifier = ZeroLossVerifier()
    v_result = verifier.verify(events_a, events_b, result.timeline)

    # Assert both 10am events exist in output
    ids = [e.original_event_id for e in result.timeline]
    assert "A-002" in ids
    assert "B-002" in ids
    assert v_result.status == "PASS"

def test_verification_api_endpoint(client):
    """Verify GET /api/reconcile/verification returns PASS."""
    response = client.get("/api/reconcile/verification")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PASS"
    assert data["expected_total"] == 13
    assert data["actual_total"] == 13
    assert data["lost_events_count"] == 0
    assert data["missing_event_ids"] == []
