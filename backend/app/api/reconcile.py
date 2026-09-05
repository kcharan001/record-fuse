from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from app.database import get_db
from app.models import Patient, ClinicalEvent
from app.schemas.patient import PatientSchema
from app.schemas.reconciliation import ReconciliationOutputSchema
from app.schemas.verification import VerificationResultSchema
from app.schemas.audit import AuditTrailSchema, ApprovalRequestSchema, IntegrityTestMatrixSchema
from app.api.records import parse_event_metadata
from app.engine.reconciler import TimelineReconciler
from app.engine.verifier import ZeroLossVerifier
from app.engine.integrity_tester import IntegrityTester
from app.services.ai_service import AIService
from app.services.seed_service import get_scenarios_list

router = APIRouter(prefix="/api/reconcile", tags=["Timeline Reconciliation Engine"])

# Per-scenario in-memory approval states for realistic mixed data
SCENARIO_APPROVAL_STATES: Dict[str, str] = {}

def resolve_scenario_id(patient_a_id: str, patient_b_id: str, scenario_id: Optional[str] = None) -> str:
    if scenario_id:
        return scenario_id
    if patient_a_id == "REC-A" and patient_b_id == "REC-B":
        return "DEMO"
    scenarios = get_scenarios_list()
    sc = next((s for s in scenarios if s["patient_a_id"] == patient_a_id and s["patient_b_id"] == patient_b_id), None)
    if sc:
        return sc["scenario_id"]
    return f"{patient_a_id}_{patient_b_id}"

def resolve_patient_ids(patient_a_id: str, patient_b_id: str, scenario_id: Optional[str] = None):
    if scenario_id:
        scenarios = get_scenarios_list()
        sc = next((s for s in scenarios if s["scenario_id"] == scenario_id), None)
        if sc:
            return sc["patient_a_id"], sc["patient_b_id"]
    return patient_a_id, patient_b_id

def get_scenario_approval_status(sc_id: str) -> str:
    if sc_id in SCENARIO_APPROVAL_STATES:
        return SCENARIO_APPROVAL_STATES[sc_id]

    scenarios = get_scenarios_list()
    sc = next((s for s in scenarios if s["scenario_id"] == sc_id), None)
    if not sc:
        return "PENDING"

    category = sc.get("category", "")
    if category in ("demo_dataset", "high_confidence_match"):
        status_val = "APPROVED"
    elif category in ("medium_confidence_review", "complex_clinical_overlap"):
        status_val = "PENDING"
    elif category == "non_match":
        status_val = "REJECTED"
    else:
        status_val = "PENDING"

    SCENARIO_APPROVAL_STATES[sc_id] = status_val
    return status_val

def generate_permanent_patient_id(patient: PatientSchema) -> str:
    ssn = patient.ssn_last4 or "0000"
    last = (patient.last_name or "PATIENT").upper().replace(" ", "")
    year = patient.dob.split("-")[0] if patient.dob and "-" in patient.dob else "2026"
    return f"UPI-{year}-{ssn}-{last}"

@router.post("", response_model=ReconciliationOutputSchema)
def reconcile_patient_records(
    patient_a_id: str = "REC-A",
    patient_b_id: str = "REC-B",
    scenario_id: Optional[str] = None,
    force_ai_fallback: bool = False,
    db: Session = Depends(get_db)
):
    """
    Executes the pure deterministic timeline reconciliation engine, machine verification,
    and AI semantic context assistance on two patient records.
    Guarantees 100% preservation of all clinical events from both sides.
    """
    sc_id = resolve_scenario_id(patient_a_id, patient_b_id, scenario_id)
    patient_a_id, patient_b_id = resolve_patient_ids(patient_a_id, patient_b_id, scenario_id)

    patient_a_orm = db.query(Patient).filter(Patient.id == patient_a_id).first()
    patient_b_orm = db.query(Patient).filter(Patient.id == patient_b_id).first()

    if not patient_a_orm or not patient_b_orm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"One or both patient records ('{patient_a_id}', '{patient_b_id}') not found."
        )

    patient_a = PatientSchema.model_validate(patient_a_orm)
    patient_b = PatientSchema.model_validate(patient_b_orm)

    # Generate permanent master unique patient identifier (UPI)
    upi_id = generate_permanent_patient_id(patient_a)
    patient_a.permanent_patient_id = upi_id
    patient_b.permanent_patient_id = upi_id

    all_events_orm = db.query(ClinicalEvent).filter(
        (ClinicalEvent.patient_id == patient_a_id) | 
        (ClinicalEvent.patient_id == patient_b_id)
    ).order_by(ClinicalEvent.timestamp.asc()).all()

    events_a_orm = [
        e for e in all_events_orm 
        if e.source_record == 'record_A' or (e.patient_id == patient_a_id and e.source_record != 'record_B')
    ]
    events_b_orm = [
        e for e in all_events_orm 
        if e.source_record == 'record_B' or (e.patient_id == patient_b_id and e.source_record != 'record_A')
    ]

    events_a = [parse_event_metadata(e) for e in events_a_orm]
    events_b = [parse_event_metadata(e) for e in events_b_orm]

    reconciler = TimelineReconciler()
    result = reconciler.reconcile(events_a, events_b)

    # Attach permanent patient ID & current approval status for this scenario
    result.permanent_patient_id = upi_id
    result.approval_status = get_scenario_approval_status(sc_id)


    # Machine-checkable zero-loss verification
    verifier = ZeroLossVerifier()
    verification_proof = verifier.verify(events_a, events_b, result.timeline)
    result.verification = verification_proof

    # AI Assistance Analysis (non-modifying read-only metadata)
    ai_service = AIService()
    result.ai_analysis = ai_service.analyze_reconciliation(
        patient_a, patient_b, result, force_fallback=force_ai_fallback
    )

    return result

@router.post("/approval")
def set_merge_approval(payload: ApprovalRequestSchema):
    """
    User human-in-the-loop explicit merge approval action ('APPROVED' or 'REJECTED').
    AI never automatically approves a merge.
    """
    if payload.approval_status not in ("APPROVED", "REJECTED", "PENDING"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approval status must be 'APPROVED', 'REJECTED', or 'PENDING'."
        )

    sc_id = resolve_scenario_id(payload.patient_a_id, payload.patient_b_id, payload.scenario_id)
    SCENARIO_APPROVAL_STATES[sc_id] = payload.approval_status

    return {
        "message": f"Merge approval status for scenario '{sc_id}' updated to '{payload.approval_status}'.",
        "scenario_id": sc_id,
        "approval_status": payload.approval_status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }


@router.get("/verification", response_model=VerificationResultSchema)
def get_verification_proof(
    patient_a_id: str = "REC-A",
    patient_b_id: str = "REC-B",
    scenario_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns standalone machine-checkable zero-loss verification proof payload for target patient records.
    """
    patient_a_id, patient_b_id = resolve_patient_ids(patient_a_id, patient_b_id, scenario_id)

    all_events_orm = db.query(ClinicalEvent).filter(
        (ClinicalEvent.patient_id == patient_a_id) | 
        (ClinicalEvent.patient_id == patient_b_id)
    ).order_by(ClinicalEvent.timestamp.asc()).all()

    events_a_orm = [
        e for e in all_events_orm 
        if e.source_record == 'record_A' or (e.patient_id == patient_a_id and e.source_record != 'record_B')
    ]
    events_b_orm = [
        e for e in all_events_orm 
        if e.source_record == 'record_B' or (e.patient_id == patient_b_id and e.source_record != 'record_A')
    ]

    if not events_a_orm and not events_b_orm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No events found for verification."
        )

    events_a = [parse_event_metadata(e) for e in events_a_orm]
    events_b = [parse_event_metadata(e) for e in events_b_orm]

    reconciler = TimelineReconciler()
    result = reconciler.reconcile(events_a, events_b)

    verifier = ZeroLossVerifier()
    return verifier.verify(events_a, events_b, result.timeline)

@router.get("/audit", response_model=AuditTrailSchema)
def get_audit_trail(
    patient_a_id: str = "REC-A",
    patient_b_id: str = "REC-B",
    scenario_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns read-only auditable reconciliation record.
    """
    patient_a_id, patient_b_id = resolve_patient_ids(patient_a_id, patient_b_id, scenario_id)
    reconciliation = reconcile_patient_records(patient_a_id, patient_b_id, None, False, db)

    v = reconciliation.verification
    ai = reconciliation.ai_analysis

    return AuditTrailSchema(
        reconciliation_id=reconciliation.reconciliation_id,
        patient_a_id=patient_a_id,
        patient_b_id=patient_b_id,
        reconciled_at=datetime.now(timezone.utc).isoformat(),
        approval_status=reconciliation.approval_status,
        record_a_count=reconciliation.record_a_count,
        record_b_count=reconciliation.record_b_count,
        total_events=reconciliation.total_events,
        exact_overlaps_count=reconciliation.exact_overlaps_count,
        near_overlaps_count=reconciliation.near_overlaps_count,
        ai_status="FALLBACK" if (ai and ai.is_fallback) else "ACTIVE",
        ai_fallback_reason=ai.fallback_mode if (ai and ai.is_fallback) else None,
        match_confidence=ai.patient_match.match_confidence if ai else 0.95,
        verification_status=v.status if v else "PASS",
        lost_events_count=v.lost_events_count if v else 0,
        missing_event_ids=v.missing_event_ids if v else [],
        duplicate_event_ids=v.duplicate_event_ids if v else [],
        invalid_provenance_event_ids=v.invalid_provenance_event_ids if v else [],
        provenance_intact=v.provenance_intact if v else True
    )

@router.post("/integrity-test", response_model=IntegrityTestMatrixSchema)
def run_integrity_test():
    """
    Executes developer/demo-only in-memory chaos test matrix against 7 scenarios.
    Does not modify database or source records.
    """
    tester = IntegrityTester()
    return tester.run_all_scenarios()
