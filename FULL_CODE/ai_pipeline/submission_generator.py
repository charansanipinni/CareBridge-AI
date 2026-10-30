"""Submission Generator: Orchestrates clinical extraction, English & Telugu care plans, and validation."""

import json
import re
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

        # English Plan - Simplified patient instructions in Class 8 language
        en_out = ["YOUR DISCHARGE CARE PLAN"]
        en_out.append("Please follow these personalized discharge instructions carefully to recover safely at home.\n")
        
        # 1. Prescribed Medicines
        meds = cp.get("medicines", [])
        if meds:
            en_out.append("YOUR PRESCRIBED MEDICINES (take exactly as written):")
            for i, m in enumerate(meds, 1):
                en_out.append(f"{i}. {m['name']} {m['dose']}")
                en_out.append(f"   - {m['how_to_take_plain']}")

        # 2. Stopped Medicines - ONLY if present
        stop_meds = cp.get("stop_medicines", [])
        if stop_meds:
            en_out.append("\nMEDICINES TO STOP:")
            for s in stop_meds:
                if any(w in s.lower() for w in ["immediately", "promptly", "urgent"]):
                    en_out.append(f"- STOP {s}. Please discontinue this medicine immediately.")
                else:
                    en_out.append(f"- STOP {s}. Please discontinue this medicine.")

        # 3. Emergency Red Flags - Paraphrased only from source-backed symptoms
        warns = cp.get("warning_signs", [])
        if warns:
            warn_items = []
            warn_blob = " ".join(warns).lower()
            if any(k in warn_blob for k in ["chest pain", "angina", "tightness"]):
                warn_items.append("Sudden chest discomfort, pressure, or tightness")
            if any(k in warn_blob for k in ["shortness of breath", "breathless", "dyspnea"]):
                warn_items.append("Difficulty breathing or sudden shortness of breath")
            if any(k in warn_blob for k in ["fever", "chills", "temperature"]):
                warn_items.append("High body temperature, chills, or uncontrollable shivering")
            if any(k in warn_blob for k in ["bleeding", "blood in", "gums", "hematuria"]):
                warn_items.append("Unexpected bleeding from gums, urine, or stools")
            if any(k in warn_blob for k in ["redness", "pus", "drainage", "wound"]):
                warn_items.append("Incision redness, unusual swelling, or oozing fluid")
            if any(k in warn_blob for k in ["headache", "blurred vision", "vision"]):
                warn_items.append("Intense headache or sudden changes in your vision")
            if any(k in warn_blob for k in ["pain in calf", "swelling of the leg", "dvt", "swelling"]):
                warn_items.append("Calf tenderness or swelling in the legs")
            if any(k in warn_blob for k in ["dizziness", "fainting", "syncope"]):
                warn_items.append("Severe dizziness, blackouts, or loss of balance")
            if any(k in warn_blob for k in ["vomit", "nausea"]):
                warn_items.append("Persistent vomiting and inability to keep fluids down")
            if warn_items:
                en_out.append("\nEMERGENCY WARNING SIGNS - SEEK IMMEDIATE HOSPITAL CARE:")
                for item in warn_items:
                    en_out.append(f"- {item}")

        # 4. Nutrition - Paraphrased only from source-backed instructions (No spicy/boiled water additions)
        diet = cp.get("diet", [])
        if diet:
            diet_items = []
            diet_blob = " ".join(diet).lower()
            if any(k in diet_blob for k in ["salt", "sodium"]):
                diet_items.append("Eat food prepared with minimal salt")
            if any(k in diet_blob for k in ["oily", "fried", "fat"]):
                diet_items.append("Limit oily or fatty meals")
            if any(k in diet_blob for k in ["diabetic", "sugar", "sweets"]):
                diet_items.append("Avoid sugary food items and adhere to diabetic meal plans")
            if any(k in diet_blob for k in ["protein", "dal", "eggs", "milk", "paneer"]):
                diet_items.append("Incorporate wholesome proteins such as lentils, eggs, and dairy")
            if any(k in diet_blob for k in ["soft", "semisolid"]):
                diet_items.append("Choose soft, freshly prepared, gentle foods")
            if any(k in diet_blob for k in ["fluid", "water", "hydration"]):
                diet_items.append("Drink adequate amounts of clean water")
            if diet_items:
                en_out.append("\nNUTRITION AND MEAL GUIDELINES:")
                for item in diet_items:
                    en_out.append(f"- {item}")

        # 5. Activity and Rest - Paraphrased only from source-backed instructions
        act = cp.get("activity", [])
        if act:
            act_items = []
            act_blob = " ".join(act).lower()
            if any(k in act_blob for k in ["heavy", "lifting"]):
                act_items.append("Refrain from carrying or lifting heavy objects")
            if any(k in act_blob for k in ["rest", "bed rest"]):
                act_items.append("Ensure adequate rest")
            if any(k in act_blob for k in ["walk", "walking", "walker"]):
                act_items.append("Take gentle, short walks indoors as your comfort allows")
            if any(k in act_blob for k in ["drive", "driving"]):
                act_items.append("Do not operate vehicles until your doctor approves")
            if any(k in act_blob for k in ["exercise", "bending", "physio"]):
                act_items.append("Perform gentle recovery exercises as guided by your care team")
            if any(k in act_blob for k in ["squat", "cross-legged", "toilet"]):
                act_items.append("Use a western-style toilet and avoid squatting postures")
            if act_items:
                en_out.append("\nDAILY ACTIVITY AND REST:")
                for item in act_items:
                    en_out.append(f"- {item}")

        # 6. Wound Care - Paraphrased only from source-backed instructions
        wound = cp.get("wound_care", [])
        if wound:
            wound_items = []
            wound_blob = " ".join(wound).lower()
            if any(k in wound_blob for k in ["clean", "dry"]):
                wound_items.append("Ensure the surgical dressing stays clean and completely dry")
            if any(k in wound_blob for k in ["sponge", "soak", "immersion"]):
                wound_items.append("Take sponge baths and do not submerge the wound in water")
            if any(k in wound_blob for k in ["dressing", "remove"]):
                wound_items.append("Leave the dressing in place until your scheduled clinic review")
            if any(k in wound_blob for k in ["ice", "pack"]):
                wound_items.append("Apply a cool ice pack over the joint for short periods as guided")
            if wound_items:
                en_out.append("\nWOUND CARE GUIDELINES:")
                for item in wound_items:
                    en_out.append(f"- {item}")

        # 7. Follow-up Appointments - ONLY if present in source (No unsupported "bring prior records")
        follow_ups = cp.get("follow_ups", [])
        if follow_ups:
            en_out.append("\nYOUR NEXT HOSPITAL VISITS:")
            for f in follow_ups:
                with_whom = f.get('with_whom') or 'Hospital Clinic'
                en_out.append(f"- {f['date']}: Attend your scheduled review at {with_whom}.")

        # Clearly separated general safety notice
        en_out.append("\nGENERAL SAFETY NOTICE (Standard Hospital Information):")
        en_out.append("If any instruction is unclear or if you feel unwell, contact your doctor or hospital team promptly.")
        en_out.append("Do not stop or alter your medications without clinical advice.")

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
