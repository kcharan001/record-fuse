from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Patient, ClinicalEvent
from app.schemas.patient import PatientSchema
from app.schemas.ai import AIServiceResponseSchema
from app.api.records import parse_event_metadata
from app.engine.reconciler import TimelineReconciler
from app.services.ai_service import AIService
from app.services.seed_service import get_scenarios_list

router = APIRouter(prefix="/api/ai", tags=["AI Assistance Service"])

@router.post("/analyze", response_model=AIServiceResponseSchema)
def analyze_patient_pair(
    patient_a_id: str = "REC-A",
    patient_b_id: str = "REC-B",
    scenario_id: Optional[str] = None,
    force_fallback: bool = False,
    db: Session = Depends(get_db)
):
    """
    Executes AI patient match analysis, semantic event overlap evaluation, and executive summary synthesis.
    Automatically falls back to deterministic rule engine if API key is missing or request fails.
    """
    if scenario_id:
        scenarios = get_scenarios_list()
        sc = next((s for s in scenarios if s["scenario_id"] == scenario_id), None)
        if sc:
            patient_a_id = sc["patient_a_id"]
            patient_b_id = sc["patient_b_id"]

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
    reconciliation_result = reconciler.reconcile(events_a, events_b)

    ai_service = AIService()
    return ai_service.analyze_reconciliation(patient_a, patient_b, reconciliation_result, force_fallback=force_fallback)

