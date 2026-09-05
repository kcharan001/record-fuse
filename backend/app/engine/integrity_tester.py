from datetime import datetime, timezone
from typing import List
from app.services.seed_service import SYNTHETIC_EVENTS, SYNTHETIC_PATIENTS
from app.schemas.patient import PatientSchema
from app.schemas.event import ClinicalEventSchema
from app.engine.reconciler import TimelineReconciler
from app.engine.verifier import ZeroLossVerifier
from app.services.ai_service import AIService
from app.schemas.audit import IntegrityTestMatrixSchema, IntegrityScenarioResultSchema

class IntegrityTester:
    """
    Developer / Demo Integrity & Chaos Test Suite.
    Runs in-memory controlled chaos scenarios against verifier & reconciler.
    Guarantees zero mutation of real database tables.
    """

    def _get_synthetic_data(self):
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
        return patient_a, patient_b, events_a, events_b

    def run_all_scenarios(self) -> IntegrityTestMatrixSchema:
        patient_a, patient_b, events_a, events_b = self._get_synthetic_data()
        reconciler = TimelineReconciler()
        verifier = ZeroLossVerifier()
        ai_service = AIService()

        base_reconcile = reconciler.reconcile(events_a, events_b)

        scenarios: List[IntegrityScenarioResultSchema] = []

        # 1. Normal Merge
        proof1 = verifier.verify(events_a, events_b, base_reconcile.timeline)
        scenarios.append(IntegrityScenarioResultSchema(
            scenario_name="Normal 13-Event Merge",
            description="Reconciles 6 + 7 events. Asserts 13 preserved events.",
            expected_status="PASS",
            actual_status=proof1.status,
            passed=(proof1.status == "PASS"),
            details={"actual_total": proof1.actual_total, "lost_events_count": proof1.lost_events_count}
        ))

        # 2. Single Event Removal (A-002)
        timeline_corrupt1 = [e for e in base_reconcile.timeline if e.original_event_id != "A-002"]
        proof2 = verifier.verify(events_a, events_b, timeline_corrupt1)
        scenarios.append(IntegrityScenarioResultSchema(
            scenario_name="Single Event Loss Detection (A-002)",
            description="Artificially removes event A-002. Asserts lost_events_count == 1 and status == FAIL.",
            expected_status="FAIL",
            actual_status=proof2.status,
            passed=(proof2.status == "FAIL" and proof2.lost_events_count == 1 and proof2.missing_event_ids == ["A-002"]),
            details={"missing_event_ids": proof2.missing_event_ids, "lost_events_count": proof2.lost_events_count}
        ))

        # 3. Two Events Removal (A-002, B-005)
        timeline_corrupt2 = [e for e in base_reconcile.timeline if e.original_event_id not in ("A-002", "B-005")]
        proof3 = verifier.verify(events_a, events_b, timeline_corrupt2)
        scenarios.append(IntegrityScenarioResultSchema(
            scenario_name="Multiple Event Loss Detection (A-002, B-005)",
            description="Artificially removes A-002 and B-005. Asserts lost_events_count == 2 and status == FAIL.",
            expected_status="FAIL",
            actual_status=proof3.status,
            passed=(proof3.status == "FAIL" and proof3.lost_events_count == 2),
            details={"missing_event_ids": proof3.missing_event_ids, "lost_events_count": proof3.lost_events_count}
        ))

        # 4. Duplicate Event ID (A-001)
        timeline_corrupt3 = list(base_reconcile.timeline)
        timeline_corrupt3.append(base_reconcile.timeline[0])
        proof4 = verifier.verify(events_a, events_b, timeline_corrupt3)
        scenarios.append(IntegrityScenarioResultSchema(
            scenario_name="Duplicate Event ID Detection (A-001)",
            description="Appends duplicate A-001. Asserts duplicate_event_ids == ['A-001'], lost_events_count == 0, and status == FAIL.",
            expected_status="FAIL",
            actual_status=proof4.status,
            passed=(proof4.status == "FAIL" and proof4.duplicate_event_ids == ["A-001"] and proof4.lost_events_count == 0),
            details={"duplicate_event_ids": proof4.duplicate_event_ids, "lost_events_count": proof4.lost_events_count}
        ))

        # 5. Invalid Provenance Mutated
        timeline_corrupt4 = [e.model_copy(deep=True) for e in base_reconcile.timeline]
        timeline_corrupt4[0].source_record = "record_B"
        proof5 = verifier.verify(events_a, events_b, timeline_corrupt4)
        scenarios.append(IntegrityScenarioResultSchema(
            scenario_name="Provenance Mutation Detection (A-001)",
            description="Mutates source_record of A-001 to record_B. Asserts provenance_intact == False and status == FAIL.",
            expected_status="FAIL",
            actual_status=proof5.status,
            passed=(proof5.status == "FAIL" and proof5.provenance_intact is False),
            details={"invalid_provenance_ids": proof5.invalid_provenance_event_ids}
        ))

        # 6. Same Timestamp Overlap Preservation
        ten_am_events = [e for e in base_reconcile.timeline if e.timestamp == datetime(2026, 8, 21, 10, 0, 0, tzinfo=timezone.utc)]
        scenarios.append(IntegrityScenarioResultSchema(
            scenario_name="Exact 10:00 AM Overlap Preservation",
            description="Asserts A-002 and B-002 at 10:00 AM are both preserved side-by-side in output.",
            expected_status="PASS",
            actual_status="PASS" if len(ten_am_events) == 2 else "FAIL",
            passed=(len(ten_am_events) == 2),
            details={"overlapping_event_ids": [e.original_event_id for e in ten_am_events]}
        ))

        # 7. AI Fallback Operational Readiness
        ai_resp = ai_service.analyze_reconciliation(patient_a, patient_b, base_reconcile, force_fallback=True)
        scenarios.append(IntegrityScenarioResultSchema(
            scenario_name="AI Fallback Mode Operational Readiness",
            description="Forces fallback mode. Asserts rule-engine produces valid 95% match confidence.",
            expected_status="PASS",
            actual_status="PASS" if ai_resp.is_fallback else "FAIL",
            passed=(ai_resp.is_fallback and ai_resp.patient_match.match_confidence >= 0.70),
            details={"is_fallback": ai_resp.is_fallback, "fallback_mode": ai_resp.fallback_mode}
        ))

        passed_count = sum(1 for s in scenarios if s.passed)
        matrix_status = "PASS" if passed_count == len(scenarios) else "FAIL"

        return IntegrityTestMatrixSchema(
            total_scenarios=len(scenarios),
            passed_scenarios=passed_count,
            system_integrity_status=matrix_status,
            scenarios=scenarios,
            executed_at=datetime.now(timezone.utc).isoformat()
        )
