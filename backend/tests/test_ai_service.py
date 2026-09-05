import pytest
from app.services.seed_service import SYNTHETIC_EVENTS, SYNTHETIC_PATIENTS
from app.schemas.patient import PatientSchema
from app.schemas.event import ClinicalEventSchema
from app.engine.reconciler import TimelineReconciler
from app.engine.verifier import ZeroLossVerifier
from app.services.ai_service import AIService

@pytest.fixture
def ai_test_data():
    patient_a = PatientSchema(**SYNTHETIC_PATIENTS[0])
    patient_b = PatientSchema(**SYNTHETIC_PATIENTS[1])
    
    events_a = [
        ClinicalEventSchema(
            event_id=e["event_id"],
            patient_id=e["patient_id"],
            source_record=e["source_record"],
            timestamp=e["timestamp"],
            event_type=e["event_type"],
            description=e["description"]
        ) for e in SYNTHETIC_EVENTS if e["source_record"] == "record_A"
    ]
    events_b = [
        ClinicalEventSchema(
            event_id=e["event_id"],
            patient_id=e["patient_id"],
            source_record=e["source_record"],
            timestamp=e["timestamp"],
            event_type=e["event_type"],
            description=e["description"]
        ) for e in SYNTHETIC_EVENTS if e["source_record"] == "record_B"
    ]

    reconciler = TimelineReconciler()
    reconciliation_result = reconciler.reconcile(events_a, events_b)
    return patient_a, patient_b, reconciliation_result

def test_missing_api_key_activates_fallback(ai_test_data):
    """ASSERTION: Missing API key triggers deterministic rule fallback (is_fallback: True)."""
    patient_a, patient_b, reconciliation_result = ai_test_data
    ai_service = AIService()
    ai_service.api_key = "" # Clear key

    result = ai_service.analyze_reconciliation(patient_a, patient_b, reconciliation_result)

    assert result.is_fallback is True
    assert "deterministic_rule_engine" in result.fallback_mode
    assert result.patient_match.match_confidence >= 0.70
    assert result.patient_match.is_match is True
    assert len(result.patient_match.matching_factors) >= 3

def test_forced_fallback_mode(ai_test_data):
    """ASSERTION: force_fallback=True forces fallback mode regardless of API key."""
    patient_a, patient_b, reconciliation_result = ai_test_data
    ai_service = AIService()

    result = ai_service.analyze_reconciliation(patient_a, patient_b, reconciliation_result, force_fallback=True)

    assert result.is_fallback is True
    assert result.patient_match.match_confidence == 0.95
    assert len(result.overlap_analyses) >= 1

def test_ai_analysis_does_not_alter_timeline_events_or_ids(ai_test_data):
    """ASSERTION: AI analysis output does NOT alter original timeline IDs or total count (4)."""
    patient_a, patient_b, reconciliation_result = ai_test_data
    ai_service = AIService()

    # Before AI analysis
    original_ids = list(reconciliation_result.preserved_event_ids)
    original_count = reconciliation_result.total_events

    ai_result = ai_service.analyze_reconciliation(patient_a, patient_b, reconciliation_result, force_fallback=True)

    # Re-verify deterministic reconciliation invariants after AI service invocation
    assert reconciliation_result.total_events == original_count
    assert reconciliation_result.preserved_event_ids == original_ids
    assert len(reconciliation_result.timeline) == 4

def test_verification_remains_independent_and_authoritative(ai_test_data):
    """ASSERTION: Verification engine independently asserts PASS/FAIL regardless of AI."""
    patient_a, patient_b, reconciliation_result = ai_test_data
    ai_service = AIService()
    ai_result = ai_service.analyze_reconciliation(patient_a, patient_b, reconciliation_result, force_fallback=True)

    verifier = ZeroLossVerifier()
    events_a = [e for e in reconciliation_result.timeline if e.source_record == "record_A"]
    events_b = [e for e in reconciliation_result.timeline if e.source_record == "record_B"]
    
    proof = verifier.verify(events_a, events_b, reconciliation_result.timeline)
    assert proof.status == "PASS"

def test_ai_api_endpoint(client):
    """Verify POST /api/ai/analyze returns structured JSON schema response."""
    response = client.post("/api/ai/analyze?force_fallback=true")
    assert response.status_code == 200
    data = response.json()

    assert "patient_match" in data
    assert "overlap_analyses" in data
    assert "executive_summary" in data
    assert data["is_fallback"] is True
    assert data["patient_match"]["match_confidence"] >= 0.70
