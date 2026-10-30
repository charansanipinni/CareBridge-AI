"""Medication Extractor: Extracts active medications and stopped medicines."""

import re
from typing import Dict, List, Tuple
from .section_detector import (
    MED_HEADINGS,
    STOP_HEADINGS,
    SECTION_BOUNDARIES,
    get_section_lines,
)
from .drug_normalizer import DrugNormalizer
from .dose_parser import parse_dose
from .frequency_parser import parse_frequency
from .duration_parser import parse_duration

class MedicationExtractor:
    def __init__(self, normalizer: DrugNormalizer):
        self.normalizer = normalizer

    def parse_single_line(self, line: str) -> dict:
        clean_ln = re.sub(r"^\s*(\d+[.)]|[-•*])\s*", "", line).strip()

        # IFA special case
        if re.search(r"\b(?:IFA|Iron\s*\+\s*Folic)\b", clean_ln, re.I):
            freq = parse_frequency(clean_ln)
            m_dur = re.search(r"(x\s*\d+\s*(?:/\s*(?:7|52|12)|days?|months?)|lifelong)", clean_ln, re.I)
            dur = parse_duration(m_dur.group(0)) if m_dur else "6 months"
            return {
                "name": "Iron + Folic Acid (IFA)",
                "dose": "1 tablet",
                "frequency": freq,
                "timing": "after dinner",
                "duration": dur,
                "how_to_take_plain": f"Take 1 tablet (60 mg + 500 mcg) {freq}, after dinner, for {dur}.",
            }

        dose, name = parse_dose(clean_ln, self.normalizer)
        freq = parse_frequency(clean_ln)

        # Duration
        m_dur = re.search(
            r"(x\s*\d+\s*(?:/\s*(?:7|52|12)|days?|wks?|weeks?|months?|yrs?|years?|d)\b|for \d+ \w+|lifelong|life long|lifetime|till (?:next )?review|till the next review|until the next visit|till next visit|until review)",
            clean_ln,
            re.I,
        )
        duration = parse_duration(m_dur.group(0)) if m_dur else ""
        if ", then " in dose and not duration:
            duration = "15 days"

        # Timing
        timing = ""
        if re.search(r"\bafter (?:food|meals?)\b|PC\b", clean_ln, re.I):
            timing = "after food"
        elif re.search(r"\bbefore (?:food|meals?)\b|AC\b", clean_ln, re.I):
            timing = "before food"
        elif re.search(r"\bempty stomach\b", clean_ln, re.I):
            timing = "on an empty stomach"
        elif re.search(r"\bbefore breakfast\b", clean_ln, re.I):
            timing = "before breakfast"
        elif re.search(r"\bafter dinner\b", clean_ln, re.I):
            timing = "after dinner"
        elif re.search(r"\bat (?:bedtime|night)\b|HS\b", clean_ln, re.I):
            timing = "at bedtime"

        # Sanitize duration to prevent "for -" or "for till next review"
        if duration in ["-", "--", "---", "none", "nil", "n/a", "N/A"]:
            duration = ""

        how_plain = f"Take {dose} {freq}".strip()
        if timing:
            how_plain += f", {timing}"
        if duration:
            dur_low = duration.lower().strip()
            if dur_low.startswith("till") or dur_low.startswith("until") or dur_low == "lifelong":
                how_plain += f", {duration}"
            else:
                how_plain += f", for {duration}"
        how_plain += "."

        return {
            "name": name,
            "dose": dose,
            "frequency": freq,
            "timing": timing,
            "duration": duration,
            "how_to_take_plain": how_plain,
        }

    def extract_medications(self, lines: List[str]) -> Tuple[List[dict], List[str]]:
        meds = []
        stops = []

        med_lines = get_section_lines(lines, MED_HEADINGS, stop_headings=SECTION_BOUNDARIES)

        in_table = any(ln.strip().startswith("|") for ln in med_lines)
        if in_table:
            for ln in med_lines:
                if ln.strip().startswith("|"):
                    cells = [c.strip() for c in ln.strip("|").split("|")]
                    if not cells or cells[0] in ("No", "#", "") or len(cells) < 6:
                        continue
                    m_name = re.sub(r"^(Tab|T|Cap|C|Inj|Inh|Syp|Rotacap|Inhaler|Injection)\.?\s+", "", cells[1], flags=re.I).strip()
                    m_dose = cells[2]
                    m_freq = cells[4]
                    m_dur = parse_duration(cells[5])
                    m_inst = cells[6] if len(cells) > 6 else ""

                    if re.search(r"\b(?:IFA|Iron\s*\+\s*Folic)\b", m_name, re.I):
                        m_name = "Iron + Folic Acid (IFA)"
                        m_dose = "1 tablet"

                    if m_dur in ["-", "--", "---", "none", "nil", "n/a", "N/A"]:
                        m_dur = ""

                    how_plain = f"Take {m_dose} {m_freq}".strip()
                    if m_inst:
                        how_plain += f", {m_inst}"
                    if m_dur:
                        dur_low = m_dur.lower().strip()
                        if dur_low.startswith("till") or dur_low.startswith("until") or dur_low == "lifelong":
                            how_plain += f", {m_dur}"
                        else:
                            how_plain += f", for {m_dur}"
                    how_plain += "."

                    meds.append({
                        "name": m_name,
                        "dose": m_dose,
                        "frequency": m_freq,
                        "timing": m_inst,
                        "duration": m_dur,
                        "how_to_take_plain": how_plain,
                    })
        else:
            for ln in med_lines:
                stripped = ln.strip()
                if not stripped or stripped.startswith("+") or stripped.startswith("|"):
                    continue
                if re.match(r"^\s*(?:\d+[.)]|[-•*])?\s*(?:STOP|Stop|Please stop)\s+", stripped, re.I):
                    stop_txt = re.sub(r"^\s*(?:\d+[.)]|[-•*])?\s*(?:STOP|Stop|Please stop)\s+", "", stripped, flags=re.I)
                    stop_name = re.sub(r"\(.*", "", stop_txt).strip()
                    stops.append(stop_name)
                    continue
                if re.match(r"^\s*(\d+[.)]|[-•*])\s", stripped) or any(
                    stripped.startswith(p) for p in ["Tab.", "T.", "Cap.", "Inj.", "Inh.", "Syp.", "Rotacap", "Inhaler", "Injection"]
                ):
                    if not re.match(r"^\s*(?:\d+[.)]|[-•*])?\s*(?:STOP|Stop|Please stop)\s+", stripped, re.I):
                        meds.append(self.parse_single_line(stripped))

        # STOP sections
        for ln in lines:
            m = re.match(r"^\s*(?:[-•*]\s*)?(?:STOP|Stop)\s+((?:Tab|T|Cap|Inj|Inh)\..*)", ln)
            if m:
                s_name = re.sub(r"\(.*", "", m.group(1)).strip()
                if s_name not in stops:
                    stops.append(s_name)

        stop_sec = get_section_lines(
            lines,
            STOP_HEADINGS,
            stop_headings=["ADVICE", "Adv:", "Diet:", "Activity:", "Report immediately", "Follow up", "GENERAL ADVICE"],
        )
        for x in stop_sec:
            cleaned_x = re.sub(r"^\s*[-•*]\s*", "", x).strip()
            if not cleaned_x or cleaned_x.endswith(":") or "ADVICE" in cleaned_x.upper():
                continue
            s_name = re.sub(r"\(.*", "", cleaned_x).strip()
            if s_name and s_name not in stops:
                stops.append(s_name)

        clean_stops = []
        for s in stops:
            clean_s = re.sub(r"^(?:Tab|T|Cap|Inj|Inh)\.?\s+", "", s, flags=re.I).strip()
            clean_s = re.sub(r"\(.*", "", clean_s).strip()
            if clean_s and not clean_s.endswith(":") and "ADVICE" not in clean_s.upper() and clean_s not in clean_stops:
                clean_stops.append(clean_s)

        return meds, clean_stops
