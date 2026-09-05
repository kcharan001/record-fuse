import pytest
from app.engine.integrity_tester import IntegrityTester
from app.engine.verifier import ZeroLossVerifier
from app.schemas.event import ClinicalEventSchema
from app.services.seed_service import SYNTHETIC_EVENTS
from app.engine.reconciler import TimelineReconciler

@pytest.fixture
def synthetic_records_local():
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

def test_integrity_test_matrix_execution():
    """Verify all 7 in-memory chaos scenarios execute and return system_integrity_status == PASS."""
    tester = IntegrityTester()
    result = tester.run_all_scenarios()

    assert result.total_scenarios == 7
    assert result.passed_scenarios == 7
    assert result.system_integrity_status == "PASS"

def test_approval_workflow_api_endpoint(client):
    """Verify POST /api/reconcile/approval updates approval state."""
    resp = client.post("/api/reconcile/approval", json={"approval_status": "APPROVED"})
    assert resp.status_code == 200
    assert resp.json()["approval_status"] == "APPROVED"

    # Verify updated state in main reconcile payload
    reconcile_resp = client.post("/api/reconcile")
    assert reconcile_resp.status_code == 200
    assert reconcile_resp.json()["approval_status"] == "APPROVED"

    # Reset back to PENDING for tests
    client.post("/api/reconcile/approval", json={"approval_status": "PENDING"})

def test_audit_trail_api_endpoint(client):
    """Verify GET /api/reconcile/audit returns valid read-only audit payload."""
    resp = client.get("/api/reconcile/audit")
    assert resp.status_code == 200
    data = resp.json()

    assert data["reconciliation_id"] == "RECON-REC-A-REC-B"
    assert data["total_events"] == 4
    assert data["lost_events_count"] == 0
    assert data["verification_status"] == "PASS"

def test_verifier_bug_fix_regressions(synthetic_records_local):
    """
    Regression verification for lost_events_count bug fix:
    - 1 event removed -> lost_events_count == 1
    - 2 events removed -> lost_events_count == 2
    - Duplicate ID only -> lost_events_count == 0
    """
    events_a, events_b = synthetic_records_local
    reconciler = TimelineReconciler()
    result = reconciler.reconcile(events_a, events_b)
    verifier = ZeroLossVerifier()

    # 1. One event removed (A-002)
    t1 = [e for e in result.timeline if e.original_event_id != "A-002"]
    p1 = verifier.verify(events_a, events_b, t1)
    assert p1.actual_total == 3
    assert p1.missing_event_ids == ["A-002"]
    assert p1.lost_events_count == 1
    assert p1.status == "FAIL"

    # 2. Two events removed (A-002, B-002)
    t2 = [e for e in result.timeline if e.original_event_id not in ("A-002", "B-002")]
    p2 = verifier.verify(events_a, events_b, t2)
    assert p2.actual_total == 2
    assert p2.missing_event_ids == ["A-002", "B-002"]
    assert p2.lost_events_count == 2
    assert p2.status == "FAIL"

    # 3. Duplicate ID only (A-001 appended)
    t3 = list(result.timeline)
    t3.append(result.timeline[0])
    p3 = verifier.verify(events_a, events_b, t3)
    assert p3.actual_total == 5
    assert p3.duplicate_event_ids == ["A-001"]
    assert p3.missing_event_ids == []
    assert p3.lost_events_count == 0
    assert p3.status == "FAIL"
