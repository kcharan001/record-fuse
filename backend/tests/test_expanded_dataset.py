import pytest
from app.services.expanded_dataset import EXPANDED_SCENARIOS

def test_scenarios_list_endpoint(client):
    """Verify GET /api/records/scenarios returns all 9 scenarios (DEMO + S01..S08)."""
    response = client.get("/api/records/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) == 9
    
    demo_sc = next((s for s in scenarios if s["scenario_id"] == "DEMO"), None)
    assert demo_sc is not None
    assert demo_sc["patient_a_id"] == "REC-A"
    assert demo_sc["patient_b_id"] == "REC-B"
    assert demo_sc["total_events"] == 4

    s01_sc = next((s for s in scenarios if s["scenario_id"] == "S01"), None)
    assert s01_sc is not None
    assert s01_sc["category"] == "high_confidence_match"
    assert s01_sc["patient_a_id"] == "S01-REC-A"

def test_all_expanded_scenarios_zero_loss_verification(client):
    """
    Core Zero-Loss Guarantee Test:
    Executes timeline reconciliation across ALL expanded scenarios (S01..S08).
    Asserts zero data loss: N_A + N_B == N_reconciled, missing_event_ids == [], lost_events_count == 0.
    Asserts each scenario has exactly 4 events total (2 per record).
    """
    for sc in EXPANDED_SCENARIOS:
        sc_id = sc["scenario_id"]
        response = client.post(f"/api/reconcile?scenario_id={sc_id}")
        assert response.status_code == 200, f"Reconciliation failed for scenario {sc_id}"
        data = response.json()

        expected_count_a = len(sc["events_a"])
        expected_count_b = len(sc["events_b"])
        expected_total = expected_count_a + expected_count_b

        assert expected_total == 4, f"{sc_id} must have exactly 4 events total"
        assert data["record_a_count"] == expected_count_a, f"{sc_id}: record_a_count mismatch"
        assert data["record_b_count"] == expected_count_b, f"{sc_id}: record_b_count mismatch"
        assert data["total_events"] == expected_total, f"{sc_id}: total_events mismatch"
        assert len(data["timeline"]) == expected_total, f"{sc_id}: timeline length mismatch"

        # Verification proof assertion
        v = data["verification"]
        assert v["status"] == "PASS", f"{sc_id}: Zero-loss verification failed"
        assert v["lost_events_count"] == 0, f"{sc_id}: lost_events_count must be 0"
        assert v["missing_event_ids"] == [], f"{sc_id}: missing_event_ids must be empty"
        assert v["duplicate_event_ids"] == [], f"{sc_id}: duplicate_event_ids must be empty"
        assert v["provenance_intact"] is True, f"{sc_id}: provenance_intact must be True"

def test_high_confidence_scenarios_ai_matching(client):
    """Verify S01-S02 (High Confidence Matches) produce match_confidence >= 0.70 and is_match = True."""
    high_conf_scenarios = [sc for sc in EXPANDED_SCENARIOS if sc["category"] == "high_confidence_match"]
    assert len(high_conf_scenarios) == 2

    for sc in high_conf_scenarios:
        sc_id = sc["scenario_id"]
        response = client.post(f"/api/ai/analyze?scenario_id={sc_id}")
        assert response.status_code == 200
        ai_data = response.json()

        p_match = ai_data["patient_match"]
        assert p_match["match_confidence"] >= 0.70, f"{sc_id} expected high confidence, got {p_match['match_confidence']}"
        assert p_match["is_match"] is True, f"{sc_id} expected is_match=True"

def test_non_match_scenarios_ai_matching(client):
    """Verify S07-S08 (Non-Matches) produce low confidence and is_match = False."""
    non_match_scenarios = [sc for sc in EXPANDED_SCENARIOS if sc["category"] == "non_match"]
    assert len(non_match_scenarios) == 2

    for sc in non_match_scenarios:
        sc_id = sc["scenario_id"]
        response = client.post(f"/api/ai/analyze?scenario_id={sc_id}")
        assert response.status_code == 200
        ai_data = response.json()

        p_match = ai_data["patient_match"]
        assert p_match["is_match"] is False, f"{sc_id} expected is_match=False"
        assert p_match["match_confidence"] < 0.70, f"{sc_id} expected confidence < 0.70, got {p_match['match_confidence']}"

def test_scenario_record_fetching(client):
    """Verify GET /api/records?scenario_id=S01 returns correct record pair for S01."""
    response = client.get("/api/records?scenario_id=S01")
    assert response.status_code == 200
    data = response.json()

    assert data["record_a"]["patient"]["id"] == "S01-REC-A"
    assert data["record_a"]["patient"]["first_name"] == "Jonathan"
    assert data["record_b"]["patient"]["id"] == "S01-REC-B"
    assert data["record_b"]["patient"]["first_name"] == "John"
    assert data["total_events"] == 4

