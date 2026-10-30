"""Advice Extractor: Extracts diet, activity, wound care, and emergency warning signs."""

import re
from typing import Dict, List
from .section_detector import WARN_HEADINGS, get_section_lines

def extract_advice(lines: List[str]) -> Dict[str, List[str]]:
    # Warning signs
    warn_lines = get_section_lines(lines, WARN_HEADINGS)
    warn = [
        re.sub(r"^\s*[-•*]\s*", "", x).strip()
        for x in warn_lines
        if re.sub(r"^\s*[-•*]\s*", "", x).strip()
    ]

    # Diet
    diet_lines = get_section_lines(lines, ["Diet:", "DIET:", "Diet advice:"])
    diet = [
        re.sub(r"^\s*[-•*]\s*", "", x).strip()
        for x in diet_lines
        if re.sub(r"^\s*[-•*]\s*", "", x).strip()
    ]

    # Activity
    act_lines = get_section_lines(lines, ["Activity:", "ACTIVITY:", "Activity advice:"])
    act = [
        re.sub(r"^\s*[-•*]\s*", "", x).strip()
        for x in act_lines
        if re.sub(r"^\s*[-•*]\s*", "", x).strip()
    ]

    # Wound care
    wound_lines = get_section_lines(lines, ["Wound:", "WOUND:", "Wound care:"])
    wound = [
        re.sub(r"^\s*[-•*]\s*", "", x).strip()
        for x in wound_lines
        if re.sub(r"^\s*[-•*]\s*", "", x).strip()
    ]

    return {
        "warning_signs": warn,
        "diet": diet,
        "activity": act,
        "wound_care": wound,
    }
