"""Summary Parser: Central parsing engine combining section detection, medication extraction, and advice."""

import re
from typing import Dict, List
from .drug_normalizer import DrugNormalizer
from .medication_extractor import MedicationExtractor
from .advice_extractor import extract_advice
from .section_detector import FU_HEADINGS, get_section_lines
from .date_extractor import DATE_RE, parse_date

class SummaryParser:
    def __init__(self, normalizer: DrugNormalizer):
        self.normalizer = normalizer
        self.med_extractor = MedicationExtractor(normalizer)

    def parse(self, text: str) -> dict:
        lines = text.split("\n")

        # 1. Medications & Stops
        meds, stops = self.med_extractor.extract_medications(lines)

        # 2. Advice & Warnings
        adv = extract_advice(lines)

        # 3. Follow-ups
        fu_lines = get_section_lines(lines, FU_HEADINGS)
        fus = []
        seen_dates = set()
        for ln in fu_lines:
            for ds in DATE_RE.findall(ln):
                d = parse_date(ds)
                if d:
                    iso = d.isoformat()
                    if iso not in seen_dates:
                        seen_dates.add(iso)
                        fus.append({
                            "date": iso,
                            "with_whom": "Hospital Outpatient Department (OPD)",
                            "purpose": re.sub(r"^\s*[-•*]\s*", "", ln).strip(),
                        })

        return {
            "medicines": meds,
            "stop_medicines": stops,
            "warning_signs": adv["warning_signs"],
            "diet": adv["diet"],
            "activity": adv["activity"],
            "wound_care": adv["wound_care"],
            "follow_ups": fus,
        }
