"""Unit and Safety Integration Tests for CareBridge AI Pipeline.
Team: AVENGERS | Healthcare Track H2 | TalentAP Mega Hackathon 2026
"""

import sys
from pathlib import Path
import pytest

TESTS_DIR = Path(__file__).resolve().parent
FULL_CODE_DIR = TESTS_DIR.parent
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
