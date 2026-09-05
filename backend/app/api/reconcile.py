from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Patient, ClinicalEvent
from app.schemas.patient import PatientSchema
from app.schemas.reconciliation import ReconciliationOutputSchema
from app.schemas.verification import VerificationResultSchema
from app.api.records import parse_event_metadata
from app.engine.reconciler import TimelineReconciler
from app.engine.verifier import ZeroLossVerifier
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/reconcile", tags=["Timeline Reconciliation Engine"])

@router.post("", response_model=ReconciliationOutputSchema)
def reconcile_patient_records(
    patient_a_id: str = "REC-A",
    patient_b_id: str = "REC-B",
    force_ai_fallback: bool = False,
    db: Session = Depends(get_db)
):
    """
    Executes the pure deterministic timeline reconciliation engine, machine verification,
    and AI semantic context assistance on two patient records.
    Guarantees 100% preservation of all clinical events from both sides.
    """
    patient_a_orm = db.query(Patient).filter(Patient.id == patient_a_id).first()
    patient_b_orm = db.query(Patient).filter(Patient.id == patient_b_id).first()

    if not patient_a_orm or not patient_b_orm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"One or both patient records ('{patient_a_id}', '{patient_b_id}') not found."
        )

    patient_a = PatientSchema.model_validate(patient_a_orm)
    patient_b = PatientSchema.model_validate(patient_b_orm)

    events_a_orm = db.query(ClinicalEvent).filter(ClinicalEvent.patient_id == patient_a_id).order_by(ClinicalEvent.timestamp.asc()).all()
    events_b_orm = db.query(ClinicalEvent).filter(ClinicalEvent.patient_id == patient_b_id).order_by(ClinicalEvent.timestamp.asc()).all()

    events_a = [parse_event_metadata(e) for e in events_a_orm]
    events_b = [parse_event_metadata(e) for e in events_b_orm]

    reconciler = TimelineReconciler()
    result = reconciler.reconcile(events_a, events_b)

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

@router.get("/verification", response_model=VerificationResultSchema)
def get_verification_proof(
    patient_a_id: str = "REC-A",
    patient_b_id: str = "REC-B",
    db: Session = Depends(get_db)
):
    """
    Returns standalone machine-checkable zero-loss verification proof payload for target patient records.
    """
    events_a_orm = db.query(ClinicalEvent).filter(ClinicalEvent.patient_id == patient_a_id).order_by(ClinicalEvent.timestamp.asc()).all()
    events_b_orm = db.query(ClinicalEvent).filter(ClinicalEvent.patient_id == patient_b_id).order_by(ClinicalEvent.timestamp.asc()).all()

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
