"""Submission Generator: Orchestrates clinical extraction, English & Telugu care plans, and validation."""

import json
from pathlib import Path
from typing import Optional
import pandas as pd

from .drug_normalizer import DrugNormalizer
from .summary_parser import SummaryParser
from .translation_service import TranslationService
from .readability_service import ReadabilityService

class SubmissionGenerator:
    def __init__(self, config_dir: Optional[Path] = None):
        if config_dir is None:
            config_dir = Path(__file__).resolve().parent.parent / "config"
        self.normalizer = DrugNormalizer(config_dir / "drug_reference.csv")
        self.parser = SummaryParser(self.normalizer)
        self.translator = TranslationService()

    def generate_single_plan(self, summary_id: str, summary_text: str) -> dict:
        cp = self.parser.parse(summary_text)

        # English Plan
        en_out = ["MY CARE PLAN - Chandrapuri District Hospital"]
        en_out.append("This document outlines your discharge instructions to help you recover comfortably at home.\n")
        en_out.append("YOUR MEDICINES (take exactly as written)")
        for i, m in enumerate(cp.get("medicines", []), 1):
            en_out.append(f"{i}. {m['name']} {m['dose']}")
            en_out.append(f"   - {m['how_to_take_plain']}")

        if cp.get("stop_medicines"):
            en_out.append("\nMEDICINES TO STOP")
            for s in cp["stop_medicines"]:
                en_out.append(f"- STOP {s}. Please discontinue this medicine immediately.")

        en_out.append("\nEMERGENCY WARNING SIGNS - SEEK IMMEDIATE HOSPITAL CARE")
        en_out.append("Return to the hospital emergency department right away if you notice any of these danger signs:")
        en_out.append("- Severe or sudden headache, blurred vision, or intense dizziness")
        en_out.append("- High fever, chills, persistent sweating, or uncontrollable shivering")
        en_out.append("- Trouble breathing, chest tightness, or rapid breathing")
        en_out.append("- Increasing pain, swelling, warmth, or drainage around the surgical area")
        en_out.append("- Severe nausea, inability to keep liquids down, or severe abdominal swelling")
        en_out.append("- Any unusual bleeding, weakness, or seizure activity")

        en_out.append("\nNUTRITION AND MEAL GUIDELINES")
        en_out.append("- Eat freshly cooked, well-balanced meals with plenty of fresh vegetables and proteins.")
        en_out.append("- Avoid overly salty, spicy, fried or packaged snacks.")
        en_out.append("- Keep yourself well hydrated with boiled or filtered water throughout the day.")

        en_out.append("\nDAILY ACTIVITY AND REST")
        en_out.append("- Ensure you get adequate restful sleep each night and do not overexert yourself.")
        en_out.append("- Avoid heavy lifting, intense workouts, or strenuous physical work until cleared by your physician.")
        en_out.append("- Gentle walking around the home is encouraged to maintain good blood circulation.")

        if cp.get("follow_ups"):
            en_out.append("\nYOUR NEXT HOSPITAL VISITS")
            for f in cp["follow_ups"]:
                en_out.append(f"- {f['date']}: Attend your scheduled review at the {f['with_whom']}. Please bring all prior records and test reports.")

        en_out.append("\nIn case of any urgent medical emergency, report immediately to Casualty at Chandrapuri District Hospital (open 24 hours).")
        en_out.append("If any instruction is unclear, speak to your healthcare team before changing your medicines.")

        plain_text_en = "\n".join(en_out)
        telugu_text = self.translator.generate_telugu(cp)
        readability_score = ReadabilityService.calculate_flesch_kincaid(plain_text_en)

        return {
            "summary_id": summary_id,
            "care_plan": cp,
            "plain_text_en": plain_text_en,
            "translation": {
                "language_code": "te",
                "text": telugu_text,
            },
            "readability": {
                "metric": "flesch_kincaid_grade",
                "score": readability_score,
            },
        }

    def generate_split(self, data_dir: Path, split: str, out_path: Path) -> int:
        id_file = data_dir / f"{split}_ids.csv"
        ids = set(pd.read_csv(id_file)["summary_id"])

        out_path.parent.mkdir(parents=True, exist_ok=True)
        count = 0
        with open(data_dir / "summaries.jsonl", encoding="utf-8") as f, open(out_path, "w", encoding="utf-8") as g:
            for line in f:
                rec = json.loads(line)
                sid = rec["summary_id"]
                if sid not in ids:
                    continue
                record = self.generate_single_plan(sid, rec["text"])
                g.write(json.dumps(record, ensure_ascii=False) + "\n")
                count += 1
        return count
