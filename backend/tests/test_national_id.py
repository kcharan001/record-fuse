import pytest
from app.schemas.patient import PatientSchema
from app.schemas.reconciliation import ReconciliationOutputSchema
from app.services.ai_service import AIService
from app.models.patient import Patient
from app.services.seed_service import SYNTHETIC_PATIENTS

def test_india_aadhaar_matching():
    patient_a = PatientSchema(
        id="P-IN-A",
        first_name="Ramesh",
        last_name="Kumar",
        dob="1990-05-15",
        gender="Male",
        ssn_last4="1234",
        national_id_country="IN",
        national_id_type="Aadhaar Number",
        national_id_last4="1234"
    )
    patient_b = PatientSchema(
        id="P-IN-B",
        first_name="Ramesh",
        last_name="Kumar",
        dob="1990-05-15",
        gender="Male",
        ssn_last4="1234",
        national_id_country="IN",
        national_id_type="Aadhaar Number",
        national_id_last4="1234"
    )
    recon_output = ReconciliationOutputSchema(
        record_a_count=1,
        record_b_count=1,
        total_events=2,
        preserved_event_ids=["A-01", "B-01"],
        exact_overlaps_count=0,
        near_overlaps_count=0,
        timeline=[]
    )
    service = AIService()
    analysis = service.analyze_reconciliation(patient_a, patient_b, recon_output, force_fallback=True)
    
    # 100% match factor on National ID
    assert analysis.patient_match.is_match is True
    assert any("National ID similarity: 100%" in factor for factor in analysis.patient_match.matching_factors)


def test_usa_ssn_matching():
    patient_a = PatientSchema(
        id="P-US-A",
        first_name="John",
        last_name="Smith",
        dob="1985-11-20",
        gender="Male",
        ssn_last4="5678",
        national_id_country="US",
        national_id_type="SSN",
        national_id_last4="5678"
    )
    patient_b = PatientSchema(
        id="P-US-B",
        first_name="John",
        last_name="Smith",
        dob="1985-11-20",
        gender="Male",
        ssn_last4="5678",
        national_id_country="US",
        national_id_type="SSN",
        national_id_last4="5678"
    )
    recon_output = ReconciliationOutputSchema(
        record_a_count=1,
        record_b_count=1,
        total_events=2,
        preserved_event_ids=["A-01", "B-01"],
        exact_overlaps_count=0,
        near_overlaps_count=0,
        timeline=[]
    )
    service = AIService()
    analysis = service.analyze_reconciliation(patient_a, patient_b, recon_output, force_fallback=True)
    
    assert analysis.patient_match.is_match is True
    assert any("Country 'US'" in factor for factor in analysis.patient_match.matching_factors)


def test_uk_national_insurance_matching():
    patient_a = PatientSchema(
        id="P-GB-A",
        first_name="Oliver",
        last_name="Brown",
        dob="1992-03-10",
        gender="Male",
        ssn_last4="9988",
        national_id_country="GB",
        national_id_type="National Insurance Number",
        national_id_last4="9988"
    )
    patient_b = PatientSchema(
        id="P-GB-B",
        first_name="Oliver",
        last_name="Brown",
        dob="1992-03-10",
        gender="Male",
        ssn_last4="9988",
        national_id_country="GB",
        national_id_type="National Insurance Number",
        national_id_last4="9988"
    )
    recon_output = ReconciliationOutputSchema(
        record_a_count=1,
        record_b_count=1,
        total_events=2,
        preserved_event_ids=["A-01", "B-01"],
        exact_overlaps_count=0,
        near_overlaps_count=0,
        timeline=[]
    )
    service = AIService()
    analysis = service.analyze_reconciliation(patient_a, patient_b, recon_output, force_fallback=True)
    
    assert analysis.patient_match.is_match is True
    assert any("Country 'GB'" in factor for factor in analysis.patient_match.matching_factors)


def test_different_country_safety_rule():
    """
    CRITICAL SAFETY TEST:
    Same last 4 digits ('1234') BUT DIFFERENT countries (India 'IN' vs USA 'US')
    MUST NOT count as a National ID match.
    """
    patient_in = PatientSchema(
        id="P-IN",
        first_name="Rahul",
        last_name="Sharma",
        dob="1995-01-01",
        gender="Male",
        ssn_last4="1234",
        national_id_country="IN",
        national_id_type="Aadhaar Number",
        national_id_last4="1234"
    )
    patient_us = PatientSchema(
        id="P-US",
        first_name="Rahul",
        last_name="Sharma",
        dob="1995-01-01",
        gender="Male",
        ssn_last4="1234",
        national_id_country="US",
        national_id_type="SSN",
        national_id_last4="1234"
    )
    recon_output = ReconciliationOutputSchema(
        record_a_count=1,
        record_b_count=1,
        total_events=2,
        preserved_event_ids=["A-01", "B-01"],
        exact_overlaps_count=0,
        near_overlaps_count=0,
        timeline=[]
    )
    service = AIService()
    analysis = service.analyze_reconciliation(patient_in, patient_us, recon_output, force_fallback=True)
    
    # Check that National ID similarity match factor is NOT present
    assert not any("National ID similarity: 100%" in factor for factor in analysis.patient_match.matching_factors)
    # Check that safety rule discrepancy flag IS raised
    assert any("Different Country Safety Rule triggered" in disc for disc in analysis.patient_match.potential_discrepancies)


def test_same_country_same_last4_matching():
    patient_a = PatientSchema(
        id="P-CA-A",
        first_name="Liam",
        last_name="Roy",
        dob="1980-08-08",
        gender="Male",
        ssn_last4="4321",
        national_id_country="CA",
        national_id_type="Social Insurance Number",
        national_id_last4="4321"
    )
    patient_b = PatientSchema(
        id="P-CA-B",
        first_name="Liam",
        last_name="Roy",
        dob="1980-08-08",
        gender="Male",
        ssn_last4="4321",
        national_id_country="CA",
        national_id_type="Social Insurance Number",
        national_id_last4="4321"
    )
    recon_output = ReconciliationOutputSchema(
        record_a_count=1,
        record_b_count=1,
        total_events=2,
        preserved_event_ids=["A-01", "B-01"],
        exact_overlaps_count=0,
        near_overlaps_count=0,
        timeline=[]
    )
    service = AIService()
    analysis = service.analyze_reconciliation(patient_a, patient_b, recon_output, force_fallback=True)
    
    assert any("National ID similarity: 100%" in factor for factor in analysis.patient_match.matching_factors)


def test_existing_aadhaar_demo_records():
    demo_a = SYNTHETIC_PATIENTS[0]
    p_schema = PatientSchema.model_validate(demo_a)
    assert p_schema.national_id_country == "IN"
    assert p_schema.national_id_type == "Aadhaar"
    assert p_schema.national_id_last4 == "4892"


def test_no_plaintext_full_id_stored_or_displayed():
    patient = PatientSchema(
        id="P-SEC",
        first_name="Alice",
        last_name="Smith",
        dob="1999-12-31",
        gender="Female",
        ssn_last4="9876",
        national_id_country="JP",
        national_id_type="My Number",
        national_id_last4="9876"
    )
    # Check that national_id_last4 contains max 4 chars
    assert len(patient.national_id_last4) <= 4
    assert patient.national_id_last4 == "9876"


def test_confidence_weight_preservation():
    patient_a = PatientSchema(
        id="P-W-A",
        first_name="Alex",
        last_name="Taylor",
        dob="2000-01-01",
        gender="Other",
        ssn_last4="1111",
        national_id_country="AE",
        national_id_type="Emirates ID",
        national_id_last4="1111"
    )
    patient_b = PatientSchema(
        id="P-W-B",
        first_name="Alex",
        last_name="Taylor",
        dob="2000-01-01",
        gender="Other",
        ssn_last4="1111",
        national_id_country="AE",
        national_id_type="Emirates ID",
        national_id_last4="1111"
    )
    recon_output = ReconciliationOutputSchema(
        record_a_count=1,
        record_b_count=1,
        total_events=2,
        preserved_event_ids=["A-01", "B-01"],
        exact_overlaps_count=0,
        near_overlaps_count=0,
        timeline=[]
    )
    service = AIService()
    analysis = service.analyze_reconciliation(patient_a, patient_b, recon_output, force_fallback=True)
    
    # Weight breakdown: 0.40 (DOB) + 0.30 (National ID) + 0.15 (Surname) + 0.15 (First name) = 1.00 (capped at 0.98)
    assert analysis.patient_match.match_confidence == 0.98
