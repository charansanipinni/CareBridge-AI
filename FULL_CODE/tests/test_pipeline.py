"""Unit and Safety Integration Tests for CareBridge AI Pipeline.
Team: AVENGERS | Healthcare Track H2 | TalentAP Mega Hackathon 2026
"""

import sys
from pathlib import Path
import pytest

TESTS_DIR = Path(__file__).resolve().parent
FULL_CODE_DIR = TESTS_DIR.parent
PROJECT_ROOT = FULL_CODE_DIR.parent
sys.path.insert(0, str(FULL_CODE_DIR))

from ai_pipeline.drug_normalizer import DrugNormalizer
from ai_pipeline.dose_parser import parse_dose
from ai_pipeline.frequency_parser import parse_frequency
from ai_pipeline.duration_parser import parse_duration
from ai_pipeline.date_extractor import parse_date, extract_dates
from ai_pipeline.summary_parser import SummaryParser
from ai_pipeline.translation_service import TranslationService
from ai_pipeline.readability_service import ReadabilityService
from ai_pipeline.faithfulness_validator import FaithfulnessValidator

@pytest.fixture
def normalizer():
    return DrugNormalizer(FULL_CODE_DIR / "config" / "drug_reference.csv")

@pytest.fixture
def parser(normalizer):
    return SummaryParser(normalizer)

# 1. Dose Parser Tests
def test_dose_parser_half_tablets(normalizer):
    dose, name = parse_dose("Tab. Spironolactone 12.5 mg (½ tab of 25 mg) OD", normalizer)
    assert "12.5 mg" in dose
    assert "half" in dose.lower() or "½" in dose

def test_dose_parser_timing_not_half_tablet(normalizer):
    dose, name = parse_dose("T. Pan 40 OD ½ hr before breakfast x 5 days", normalizer)
    assert "40 mg" in dose
    assert "half" not in dose.lower() and "½" not in dose

def test_dose_parser_steroid_taper(normalizer):
    line = "Tab. Prednisolone: 40 mg x 5 days, then 30 mg x 5 days, then 20 mg x 5 days, then 10 mg x 5 days, then stop"
    dose, name = parse_dose(line, normalizer)
    assert "40 mg, then 30 mg, then 20 mg, then 10 mg" in dose

def test_dose_parser_split_insulin(normalizer):
    dose, name = parse_dose("Inj. Mixtard 30/70 16-0-10 units SC BD before meals", normalizer)
    assert "16-0-10 units" in dose

def test_dose_parser_inhaler_puffs(normalizer):
    dose, name = parse_dose("Inhaler Salbutamol 2 puffs SOS for wheeze", normalizer)
    assert "2 puffs" in dose

def test_brand_number_resolution(normalizer):
    dose1, name1 = parse_dose("T. Flagyl 400 TDS x 5 days", normalizer)
    assert "400 mg" in dose1
    dose2, name2 = parse_dose("T. Calpol 650 TDS", normalizer)
    assert "650 mg" in dose2
    dose3, name3 = parse_dose("T. Augmentin 625 TDS", normalizer)
    assert "625 mg" in dose3

# 2. Frequency Parser Tests
def test_frequency_classes():
    assert "BD" in parse_frequency("Take twice daily (1-0-1)")
    assert "TDS" in parse_frequency("Take 3 times a day (1-1-1)")
    assert "OD" in parse_frequency("Take once daily in morning (1-0-0)")
    assert "SOS" == parse_frequency("Take only when needed for fever")
    assert "WEEKLY" in parse_frequency("Take once weekly on Sunday")

# 3. Duration Parser Tests
def test_duration_parsing():
    assert parse_duration("x 5/7") == "5 days"
    assert parse_duration("x 2/52") == "2 weeks"
    assert parse_duration("x 1/12") == "1 month"
    assert parse_duration("x 6/12") == "6 months"
    assert parse_duration("life long") == "lifelong"
    assert parse_duration("till next review") == "till next review"

# 4. Date Extractor Tests
def test_date_extractor_indian_formats():
    assert parse_date("12/03/2026").isoformat() == "2026-03-12"
    assert parse_date("21-Apr-26").isoformat() == "2026-04-21"
    assert parse_date("15th June 2026").isoformat() == "2026-06-15"
    assert parse_date("05.08.2026").isoformat() == "2026-08-05"

# 5. Full Summary Parsing Tests
def test_summary_parsing_table_and_stops(parser):
    summary = """
    ADV ON DISCHARGE:
    1) Tab. Metformin 500 mg BD after food lifelong
    2) Tab. Pantocid 40 mg OD before breakfast x 14 days
    3) Stop Tab. Glimepiride 2 mg (risk of hypoglycaemia)

    Follow up:
    - Review with FBS report on 15/06/2026 in Medicine OPD
    """
    res = parser.parse(summary)
    assert len(res["medicines"]) == 2
    assert any("Metformin" in m["name"] for m in res["medicines"])
    assert any("Pantocid" in m["name"] for m in res["medicines"])
    assert len(res["stop_medicines"]) == 1
    assert "Glimepiride 2 mg" in res["stop_medicines"][0]
    assert len(res["follow_ups"]) == 1
    assert res["follow_ups"][0]["date"] == "2026-06-15"

# 6. Telugu Script & Faithfulness Tests
def test_telugu_translation_compliance():
    translator = TranslationService()
    dummy_cp = {
        "medicines": [{"name": "Metformin", "dose": "500 mg", "frequency": "BD", "timing": "after food"}],
        "stop_medicines": ["Glimepiride 2 mg"],
        "warning_signs": ["తీవ్రమైన ఛాతీ నొప్పి"],
        "follow_ups": [{"date": "2026-06-15", "with_whom": "OPD"}],
    }
    te_text = translator.generate_telugu(dummy_cp)
    
    # Must preserve Latin script for medicine and dates
    assert "Metformin 500 mg" in te_text
    assert "2026-06-15" in te_text
    
    # Must have common Telugu function words
    assert "మరియు" in te_text or "తీసుకోండి" in te_text or "రోజుకు" in te_text

# 7. Readability Target Test
def test_readability_calculation():
    sample_text = (
        "You are going home from the hospital today. "
        "Please take your medicines on time with water. "
        "Eat fresh fruits and vegetables every day. "
        "Call the clinic if you feel unwell."
    )
    score = ReadabilityService.calculate_flesch_kincaid(sample_text)
    assert 4.0 <= score <= 8.5

# 8. Faithfulness Validator Test
def test_faithfulness_validator():
    validator = FaithfulnessValidator()
    valid_cp = {
        "medicines": [{"name": "Amlodipine", "dose": "5 mg", "frequency": "OD"}],
        "follow_ups": [{"date": "2026-07-10", "with_whom": "Cardiology"}],
    }
    is_valid, passed, flags = validator.validate(valid_cp)
    assert is_valid is True
    assert len(flags) == 0

    invalid_cp = {
        "medicines": [{"name": "Amlodipine", "dose": "", "frequency": "OD"}],
        "follow_ups": [{"date": "invalid-date", "with_whom": "Cardiology"}],
    }
    is_valid_inv, _, flags_inv = validator.validate(invalid_cp)
    assert is_valid_inv is False
    assert len(flags_inv) >= 2


# 9. Extended Faithfulness & 15-Check Validator Tests
def test_telugu_no_hallucinations_when_empty():
    translator = TranslationService()
    cp = {
        "medicines": [{"name": "Aspirin", "dose": "75 mg", "frequency": "OD", "timing": "after food"}],
        "stop_medicines": [],
        "warning_signs": [],
        "diet": [],
        "activity": [],
        "wound_care": [],
        "follow_ups": [],
    }
    te_text = translator.generate_telugu(cp)
    # Must NOT hallucinate hospital name or warning signs or diet
    assert "చంద్రపురి" not in te_text
    assert "క్యాజువాలిటీ" not in te_text
    assert "ప్రమాదకర లక్షణాలు" not in te_text
    assert "ఆహార నియమాలు" not in te_text
    assert "శారీరక శ్రమ" not in te_text
    assert "Aspirin 75 mg" in te_text

def test_15_checks_comprehensive_safety():
    validator = FaithfulnessValidator()
    source = """
    DISCHARGE SUMMARY
    DIAGNOSIS: Essential Hypertension
    DISCHARGE MEDICATIONS:
    1. Tab. Telmisartan 40 mg OD after breakfast
    2. Tab. Amlodipine 5 mg OD at bedtime
    Stop Tab. Atenolol 50 mg OD
    FOLLOW UP:
    Review in Cardiology OPD on 2026-08-15
    """
    
    # 1. Perfectly Faithful Plan
    faithful_cp = {
        "medicines": [
            {"name": "Telmisartan", "dose": "40 mg", "frequency": "OD", "timing": "after breakfast"},
            {"name": "Amlodipine", "dose": "5 mg", "frequency": "OD", "timing": "at bedtime"},
        ],
        "stop_medicines": ["Atenolol 50 mg"],
        "warning_signs": [],
        "diet": [],
        "activity": [],
        "follow_ups": [{"date": "2026-08-15", "with_whom": "Cardiology OPD"}],
    }
    te_trans = "మీ డిశ్చార్జ్ సంరక్షణ ప్రణాళిక 1. Telmisartan 40 mg 2. Amlodipine 5 mg - 2026-08-15 మరియు తీసుకోండి"
    report = validator.validate_detailed(faithful_cp, source, te_trans)
    assert report["is_valid"] is True
    assert report["status"] == "VERIFIED"
    assert report["checks"]["missing_medicines"]["status"] == "PASS"
    assert report["checks"]["extra_medicines"]["status"] == "PASS"
    assert report["checks"]["duplicate_medicines"]["status"] == "PASS"
    assert report["checks"]["altered_dose"]["status"] == "PASS"
    assert report["checks"]["altered_frequency"]["status"] == "PASS"
    assert report["checks"]["wrong_stop_classification"]["status"] == "PASS"
    assert report["checks"]["missing_followup_dates"]["status"] == "PASS"
    assert report["checks"]["invented_followup_dates"]["status"] == "PASS"
    assert report["checks"]["telugu_numeric_corruption"]["status"] == "PASS"

    # 2. Altered Dose Check
    bad_dose_cp = {
        "medicines": [
            {"name": "Telmisartan", "dose": "80 mg", "frequency": "OD", "timing": "after breakfast"},
        ],
        "stop_medicines": [],
        "follow_ups": [],
    }
    report_dose = validator.validate_detailed(bad_dose_cp, source)
    assert report_dose["checks"]["altered_dose"]["status"] == "FAIL"

    # 3. Extra/Invented Med Check
    hallucinated_cp = {
        "medicines": [
            {"name": "Telmisartan", "dose": "40 mg", "frequency": "OD"},
            {"name": "Atorvastatin", "dose": "20 mg", "frequency": "OD"},
        ],
        "stop_medicines": [],
        "follow_ups": [],
    }
    report_hallucinated = validator.validate_detailed(hallucinated_cp, source)
    assert report_hallucinated["checks"]["extra_medicines"]["status"] == "FAIL"

    # 4. Duplicate Med Check
    dup_cp = {
        "medicines": [
            {"name": "Telmisartan", "dose": "40 mg", "frequency": "OD"},
            {"name": "Telmisartan", "dose": "40 mg", "frequency": "OD"},
        ],
        "stop_medicines": [],
        "follow_ups": [],
    }
    report_dup = validator.validate_detailed(dup_cp, source)
    assert report_dup["checks"]["duplicate_medicines"]["status"] == "FAIL"

    # 5. Invented Date Check
    bad_date_cp = {
        "medicines": [
            {"name": "Telmisartan", "dose": "40 mg", "frequency": "OD"},
        ],
        "stop_medicines": [],
        "follow_ups": [{"date": "2026-12-25", "with_whom": "Cardiology"}],
    }
    report_date = validator.validate_detailed(bad_date_cp, source)
    assert report_date["checks"]["invented_followup_dates"]["status"] == "FAIL"

    # 6. Telugu Numeric Corruption Check
    corrupted_te = "మీ డిశ్చార్జ్ సంరక్షణ ప్రణాళిక 1. Telmisartan (dose missing) 2026-08-15"
    report_te = validator.validate_detailed(faithful_cp, source, corrupted_te)
    assert report_te["checks"]["telugu_numeric_corruption"]["status"] == "FAIL"

def test_swapped_dosage_cross_medicine_fail():
    """Verify Phase 5 requirement: Swapped dose between two existing medicines must FAIL

    even if the number exists elsewhere in the document.
    """
    validator = FaithfulnessValidator()
    source = """
    DISCHARGE MEDICATIONS:
    1. Tab. Metformin 500 mg BD after food
    2. Tab. Cefixime 1000 mg OD
    """

    # Care plan improperly assigns 1000 mg to Metformin
    swapped_cp = {
        "medicines": [
            {"name": "Metformin", "dose": "1000 mg", "frequency": "BD", "timing": "after food"},
            {"name": "Cefixime", "dose": "1000 mg", "frequency": "OD", "timing": "after food"},
        ],
        "stop_medicines": [],
        "follow_ups": [],
    }

    report = validator.validate_detailed(swapped_cp, source)
    assert report["is_valid"] is False
    assert report["checks"]["altered_dose"]["status"] == "FAIL"
    assert "Metformin" in report["checks"]["altered_dose"]["detail"]

def test_unit_mismatch_fail():
    """Verify Phase 5 requirement: Changed unit (mcg vs mg) must FAIL."""
    validator = FaithfulnessValidator()
    source = """
    DISCHARGE MEDICATIONS:
    1. Tab. Thyroxine 100 mcg OD on empty stomach
    """
    mismatched_unit_cp = {
        "medicines": [
            {"name": "Thyroxine", "dose": "100 mg", "frequency": "OD"},
        ],
        "stop_medicines": [],
        "follow_ups": [],
    }
    report = validator.validate_detailed(mismatched_unit_cp, source)
    assert report["is_valid"] is False
    assert report["checks"]["altered_dose"]["status"] == "FAIL"

# 10. Abbreviation Expansion Tests
def test_abbreviation_resolver():
    from ai_pipeline.abbreviation_resolver import AbbreviationResolver
    resolver = AbbreviationResolver(FULL_CODE_DIR / "config" / "abbreviation_glossary.csv")
    bd = resolver.resolve("BD")
    assert bd is not None
    assert "twice" in bd["plain_language"].lower() or "twice" in bd["expansion"].lower()
    
    sos = resolver.resolve("SOS")
    assert sos is not None
    assert "needed" in sos["plain_language"].lower() or "emergency" in sos["plain_language"].lower()

# 11. Drug Reference & Hospital-Only Drugs Tests
def test_drug_reference_hospital_only_exclusion(normalizer):
    # Verify ceftriaxone is flagged as hospital-only (used_at_discharge = False)
    ref = normalizer.drug_ref.get("ceftriaxone")
    if ref:
        assert ref["used_at_discharge"] is False

    # Verify oral discharge drug is used_at_discharge = True
    met = normalizer.drug_ref.get("metformin")
    if met:
        assert met["used_at_discharge"] is True

# 12. Dropped Medication Detection Test
def test_dropped_medication_detection():
    validator = FaithfulnessValidator()
    source = """
    DISCHARGE MEDICATIONS:
    1. Tab. Metformin 500 mg BD after food
    2. Tab. Atorvastatin 20 mg HS at bedtime
    """
    omitted_cp = {
        "medicines": [
            {"name": "Metformin", "dose": "500 mg", "frequency": "BD", "timing": "after food"},
        ],
        "stop_medicines": [],
        "follow_ups": [],
    }
    report = validator.validate_detailed(omitted_cp, source)
    assert report["checks"]["missing_medicines"]["status"] == "FAIL"
    assert "atorvastatin" in report["checks"]["missing_medicines"]["detail"].lower()

# 13. Incorrect STOP Classification Test
def test_incorrect_stop_classification_detection():
    validator = FaithfulnessValidator()
    source = """
    DISCHARGE MEDICATIONS:
    1. Tab. Metformin 500 mg BD after food
    Stop Tab. Glimepiride 2 mg OD
    """
    # Care plan falsely tells patient to STOP Metformin
    wrong_stop_cp = {
        "medicines": [
            {"name": "Metformin", "dose": "500 mg", "frequency": "BD", "timing": "after food"},
        ],
        "stop_medicines": ["Metformin 500 mg"],
        "follow_ups": [],
    }
    report = validator.validate_detailed(wrong_stop_cp, source)
    assert report["checks"]["wrong_stop_classification"]["status"] == "FAIL"

# 14. Conflicting Instruction Test
def test_conflicting_instruction_detection():
    validator = FaithfulnessValidator()
    source = """
    DISCHARGE MEDICATIONS:
    1. Tab. Metformin 500 mg BD after food
    """
    # Care plan contradicts food timing: lists as before food when source says after food
    conflict_cp = {
        "medicines": [
            {"name": "Metformin", "dose": "500 mg", "frequency": "BD", "timing": "before food"},
        ],
        "stop_medicines": [],
        "follow_ups": [],
    }
    report = validator.validate_detailed(conflict_cp, source)
    assert report["checks"]["timing_mismatch"]["status"] == "FAIL"

# 15. Batch Processor Integration Test
def test_batch_processor_execution(tmp_path):
    from scripts.batch_processor import process_dataset
    data_dir = PROJECT_ROOT / "h2_official_pack" / "H2_Discharge_Summary_to_Care_Plan" / "data"
    out_file = tmp_path / "test_out.jsonl"
    report_file = tmp_path / "test_report.json"
    
    report = process_dataset(
        summaries_file=data_dir / "summaries.jsonl",
        splits_file=data_dir / "splits.csv",
        output_file=out_file,
        report_file=report_file,
        split_filter="dev",
        batch_size=50,
        validate=True
    )
    
    assert report["total_records_processed"] == 200
    assert report["total_records_success"] == 200
    assert report["total_records_failed"] == 0
    assert out_file.exists()
    assert report_file.exists()

# 16. Pre-Submission Regression Tests for Section 7
def test_missing_medicine_frequency_fails():
    validator = FaithfulnessValidator()
    source = "DISCHARGE MEDICATIONS:\n1. Tab. Metformin 500 mg BD"
    cp = {
        "medicines": [{"name": "Metformin", "dose": "500 mg", "frequency": "", "timing": "after food"}],
        "stop_medicines": [],
        "follow_ups": [],
    }
    report = validator.validate_detailed(cp, source)
    assert report["is_valid"] is False
    assert report["checks"]["altered_frequency"]["status"] == "FAIL"

def test_missing_medicine_duration_handling():
    from ai_pipeline.medication_extractor import MedicationExtractor
    normalizer = DrugNormalizer()
    extractor = MedicationExtractor(normalizer)
    res = extractor.parse_single_line("Tab. Metformin 500 mg BD after food")
    assert res["duration"] == ""
    assert "for -" not in res["how_to_take_plain"]
    assert "for till next review" not in res["how_to_take_plain"]

def test_unknown_medicine_timing_no_assumption():
    translator = TranslationService()
    cp = {
        "medicines": [{"name": "Metformin", "dose": "500 mg", "frequency": "BD", "timing": ""}],
        "stop_medicines": [],
        "warning_signs": [],
        "diet": [],
        "activity": [],
        "wound_care": [],
        "follow_ups": [],
    }
    te_text = translator.generate_telugu(cp)
    # Must not assume before food or after food or water
    assert "నీటితో" not in te_text
    assert "భోజనం తర్వాత" not in te_text
    assert "భోజనానికి ముందు" not in te_text

def test_unsupported_water_instruction_fails():
    validator = FaithfulnessValidator()
    source = "DISCHARGE MEDICATIONS:\n1. Tab. Metformin 500 mg BD"
    cp = {
        "medicines": [{"name": "Metformin", "dose": "500 mg", "frequency": "BD", "how_to_take_plain": "Take with water."}],
        "stop_medicines": [],
        "follow_ups": [],
    }
    report = validator.validate_detailed(cp, source, translation_text="ఈ మందును నీటితో వేసుకోండి.")
    assert report["is_valid"] is False
    assert report["checks"]["unsupported_water"]["status"] == "FAIL"

def test_unsupported_warning_signs_fails():
    validator = FaithfulnessValidator()
    source = "DISCHARGE MEDICATIONS:\n1. Tab. Metformin 500 mg BD\nNo other complaints."
    cp = {
        "medicines": [{"name": "Metformin", "dose": "500 mg", "frequency": "BD"}],
        "stop_medicines": [],
        "warning_signs": ["Sudden chest pain", "High fever"],
        "follow_ups": [],
    }
    report = validator.validate_detailed(cp, source)
    assert report["is_valid"] is False
    assert report["checks"]["invented_warning_signs"]["status"] == "FAIL"

def test_unsupported_dietary_instructions_fails():
    validator = FaithfulnessValidator()
    source = "DISCHARGE MEDICATIONS:\n1. Tab. Metformin 500 mg BD"
    cp = {
        "medicines": [{"name": "Metformin", "dose": "500 mg", "frequency": "BD"}],
        "stop_medicines": [],
        "diet": ["Strict low sodium diet under 2g/day"],
        "follow_ups": [],
    }
    report = validator.validate_detailed(cp, source)
    assert report["is_valid"] is False
    assert report["checks"]["unsupported_diet"]["status"] == "FAIL"

def test_wrapped_prescriptions_contextual_match():
    validator = FaithfulnessValidator()
    source = """
    DISCHARGE MEDICATIONS:
    1. Tab. Amoxicillin Clavulanate
       625 mg BD x 5 days
    2. Tab. Paracetamol 650 mg TDS
    """
    cp = {
        "medicines": [
            {"name": "Amoxicillin Clavulanate", "dose": "625 mg", "frequency": "BD", "duration": "5 days"},
            {"name": "Paracetamol", "dose": "650 mg", "frequency": "TDS"},
        ],
        "stop_medicines": [],
        "follow_ups": [],
    }
    report = validator.validate_detailed(cp, source)
    assert report["checks"]["altered_dose"]["status"] == "PASS"

def test_multiple_medicines_in_prescription_table():
    validator = FaithfulnessValidator()
    source = """
    | No | Medicine | Strength | Route | Frequency | Duration | Instructions |
    | 1  | Tab. Metformin | 500 mg | Oral | BD | 15 days | After food |
    | 2  | Tab. Atorvastatin | 20 mg | Oral | HS | 30 days | At bedtime |
    """
    cp = {
        "medicines": [
            {"name": "Metformin", "dose": "500 mg", "frequency": "BD", "duration": "15 days", "timing": "after food"},
            {"name": "Atorvastatin", "dose": "20 mg", "frequency": "HS", "duration": "30 days", "timing": "at bedtime"},
        ],
        "stop_medicines": [],
        "follow_ups": [],
    }
    report = validator.validate_detailed(cp, source)
    assert report["is_valid"] is True
    assert report["checks"]["altered_dose"]["status"] == "PASS"

def test_followup_date_mismatch_fails():
    validator = FaithfulnessValidator()
    source = "Follow up in Medicine OPD on 2026-09-20"
    cp = {
        "medicines": [],
        "stop_medicines": [],
        "follow_ups": [{"date": "2026-10-15", "with_whom": "Medicine OPD"}],
    }
    report = validator.validate_detailed(cp, source)
    assert report["is_valid"] is False
    assert report["checks"]["invented_followup_dates"]["status"] == "FAIL"

def test_english_telugu_numerical_mismatch_fails():
    validator = FaithfulnessValidator()
    source = "Tab. Metformin 500 mg BD"
    cp = {
        "medicines": [{"name": "Metformin", "dose": "500 mg", "frequency": "BD"}],
        "stop_medicines": [],
        "follow_ups": [],
    }
    # Telugu translation accidentally replaced 500 with 250
    mismatched_te = "మీ డిశ్చార్జ్ సంరక్షణ ప్రణాళిక 1. Metformin 250 mg"
    report = validator.validate_detailed(cp, source, translation_text=mismatched_te)
    assert report["is_valid"] is False
    assert report["checks"]["telugu_numeric_corruption"]["status"] == "FAIL"

