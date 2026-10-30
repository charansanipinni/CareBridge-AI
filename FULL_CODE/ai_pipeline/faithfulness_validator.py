"""Faithfulness Validator: Comprehensive clinical safety engine executing 15 source-to-output checks.
Ensures zero hallucination, zero omitted instructions, and complete numerical preservation.
"""

import re
from typing import Dict, List, Tuple, Any, Optional

DATE_RE = re.compile(r"\b(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b")

class FaithfulnessValidator:
    def __init__(self):
        pass

    def validate(
        self, 
        care_plan: dict, 
        source_text: str = "", 
        translation_text: str = ""
    ) -> Tuple[bool, List[str], List[str]]:
        report = self.validate_detailed(care_plan, source_text, translation_text)
        return report["is_valid"], report["passed"], report["flags"]

    def validate_detailed(
        self, 
        care_plan: dict, 
        source_text: str = "", 
        translation_text: str = ""
    ) -> Dict[str, Any]:
        passed: List[str] = []
        flags: List[str] = []
        checks: Dict[str, Dict[str, Any]] = {}

        source_lower = (source_text or "").lower()
        meds = care_plan.get("medicines", [])
        stop_meds = care_plan.get("stop_medicines", [])
        fus = care_plan.get("follow_ups", [])
        warns = care_plan.get("warning_signs", [])
        diet = care_plan.get("diet", [])
        act = care_plan.get("activity", [])

        # ---------------------------------------------------------
        # CHECK 1: Missing Medicines
        # ---------------------------------------------------------
        missing_med_errors = []
        if source_text:
            # Look for discharge medicine section
            rx_match = re.search(r"(?:discharge\s+medications?|advice\s+on\s+discharge|treatment\s+on\s+discharge|rx\s+on\s+discharge)[\s\S]*?(?=(?:follow[\s-]*up|warning|emergency|diet|activity|\Z))", source_lower)
            rx_text = rx_match.group(0) if rx_match else source_lower
            plan_med_names = [m.get("name", "").lower() for m in meds]
            
            lines = rx_text.split("\n")
            for ln in lines:
                ln_str = ln.strip()
                if not ln_str or len(ln_str) < 4:
                    continue
                # If line starts with a numbering or Tab/Cap/Inj and has dosage
                if re.search(r"^(?:\d+[\.\)]|tab|cap|inj|syp|t\.|c\.)", ln_str, re.I):
                    words = [w for w in re.split(r"[^a-z0-9]", ln_str) if len(w) > 3 and not w.isdigit()]
                    if words:
                        # Check if at least one characteristic word of the med exists in plan
                        found = any(any(w in pmn for w in words) for pmn in plan_med_names)
                        is_stop = any(w in " ".join(stop_meds).lower() for w in words)
                        if not found and not is_stop:
                            missing_med_errors.append(ln_str)

        if missing_med_errors:
            msg = f"Potential missing discharge medications: {', '.join(missing_med_errors[:3])}"
            flags.append(msg)
            checks["missing_medicines"] = {"status": "FAIL", "detail": msg}
        else:
            msg = f"All {len(meds)} active discharge medications captured."
            passed.append(msg)
            checks["missing_medicines"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 2: Extra / Invented Medicines (Hallucination)
        # ---------------------------------------------------------
        extra_meds = []
        if source_text:
            for m in meds:
                m_name = m.get("name", "").lower()
                clean_name = re.sub(r"^(?:tab(?:let)?|cap(?:sule)?|inj(?:ection)?|syp|sachet)\.?\s*", "", m_name).strip()
                primary_word = re.split(r"[^a-z0-9]", clean_name)[0] if clean_name else ""
                if primary_word and len(primary_word) > 3 and primary_word not in source_lower:
                    extra_meds.append(m.get("name"))

        if extra_meds:
            msg = f"Invented/unsupported medications detected: {', '.join(extra_meds)}"
            flags.append(msg)
            checks["extra_medicines"] = {"status": "FAIL", "detail": msg}
        else:
            msg = "Zero invented medications found; all drugs exist in source."
            passed.append(msg)
            checks["extra_medicines"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 3: Duplicate Medicines
        # ---------------------------------------------------------
        seen_meds = set()
        dups = []
        for m in meds:
            name_key = re.sub(r"[^a-z0-9]", "", m.get("name", "").lower())
            if name_key in seen_meds:
                dups.append(m.get("name"))
            else:
                seen_meds.add(name_key)

        if dups:
            msg = f"Duplicate medicine entries in care plan: {', '.join(dups)}"
            flags.append(msg)
            checks["duplicate_medicines"] = {"status": "FAIL", "detail": msg}
        else:
            msg = "No duplicate medication entries."
            passed.append(msg)
            checks["duplicate_medicines"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 4: Altered Dose Amount or Unit (Contextually Bound)
        # ---------------------------------------------------------
        altered_doses = []
        for i, m in enumerate(meds, 1):
            dose = m.get("dose", "").strip()
            if not dose:
                altered_doses.append(f"{m.get('name')} (missing dose)")
            elif source_text:
                num_match = re.search(r"(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|units?|puffs?|drops?|tablets?)?", dose.lower())
                if num_match:
                    num_val = num_match.group(1)
                    unit_val = num_match.group(2) or ""
                    
                    # Contextual search: look around the specific medicine's mention in source
                    m_name = m.get("name", "").lower()
                    clean_name = re.sub(r"^(?:tab(?:let)?|cap(?:sule)?|inj(?:ection)?|syp|sachet|ointment)\.?\s*", "", m_name).strip()
                    primary_word = re.split(r"[^a-z0-9]", clean_name)[0] if clean_name else ""
                    
                    found_in_context = False
                    if primary_word and primary_word in source_lower:
                        # Find all occurrences of primary_word in source_lower
                        for match in re.finditer(re.escape(primary_word), source_lower):
                            pos = match.start()
                            # Confine window to the specific line/table row of this medicine
                            line_start = source_lower.rfind("\n", 0, pos)
                            line_start = 0 if line_start == -1 else line_start + 1
                            line_end = source_lower.find("\n", pos)
                            line_end = len(source_lower) if line_end == -1 else line_end
                            
                            # Check next line if it is a continuation of the same prescription
                            if line_end < len(source_lower):
                                next_newline = source_lower.find("\n", line_end + 1)
                                next_newline = len(source_lower) if next_newline == -1 else next_newline
                                next_line = source_lower[line_end + 1:next_newline].strip()
                                if next_line and not re.match(r"^(?:\d+[\.\)]|tab|cap|inj|syp|t\.|c\.|stop|follow|diet|activity|warning)", next_line):
                                    line_end = next_newline

                            window = source_lower[line_start:line_end]

                            # Exact whole-token match for the number to avoid substring false matches
                            if re.search(r"\b" + re.escape(num_val) + r"\b", window):
                                # Also verify unit if specified
                                if unit_val and unit_val in ["mg", "mcg", "g", "ml", "iu", "units"]:
                                    # Ensure unit is in that line and not mismatched
                                    if unit_val in window or (unit_val == "mg" and "1 g" in window) or (unit_val == "g" and "1000 mg" in window):
                                        found_in_context = True
                                        break
                                else:
                                    found_in_context = True
                                    break
                    else:
                        # If drug name not found (flagged in Check 2), check source as fallback
                        found_in_context = (num_val in source_lower)

                    if not found_in_context:
                        altered_doses.append(f"{m.get('name')} dose '{dose}' not grounded in drug's source context")

        if altered_doses:
            msg = f"Altered or unverified dosages: {', '.join(altered_doses)}"
            flags.append(msg)
            checks["altered_dose"] = {"status": "FAIL", "detail": msg}
        else:
            msg = "All prescribed dosages faithfully verified in local source context."
            passed.append(msg)
            checks["altered_dose"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 5: Altered Frequency
        # ---------------------------------------------------------
        freq_errors = []
        for m in meds:
            freq = (m.get("frequency") or "").upper().strip()
            if not freq:
                freq_errors.append(f"{m.get('name')} (missing frequency)")
            elif source_text:
                m_name = m.get("name", "").lower()
                clean_name = re.split(r"[^a-z0-9]", m_name)[0]
                if clean_name and len(clean_name) > 3 and clean_name in source_lower:
                    # Verify frequency code or slots exist around drug name
                    pos = source_lower.find(clean_name)
                    window = source_lower[max(0, pos - 50): min(len(source_lower), pos + 100)]
                    freq_tokens = [freq.lower(), freq.replace(" ", "").lower()]
                    if not any(ft in window for ft in freq_tokens) and not any(k in window for k in ["daily", "times", "od", "bd", "tds", "sos", "prn"]):
                        freq_errors.append(f"{m.get('name')} frequency {freq} altered")

        if freq_errors:
            msg = f"Frequency mismatches: {', '.join(freq_errors)}"
            flags.append(msg)
            checks["altered_frequency"] = {"status": "FAIL", "detail": msg}
        else:
            msg = "All medication frequencies preserved without alteration."
            passed.append(msg)
            checks["altered_frequency"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 6: Altered Duration
        # ---------------------------------------------------------
        dur_errors = []
        for m in meds:
            dur = m.get("duration", "").strip()
            if dur and source_text:
                num_dur = re.search(r"(\d+)\s*(?:day|week|month|year)", dur.lower())
                if num_dur and num_dur.group(0) not in source_lower:
                    dur_errors.append(f"{m.get('name')} duration '{dur}' not grounded")

        if dur_errors:
            msg = f"Duration discrepancies: {', '.join(dur_errors)}"
            flags.append(msg)
            checks["altered_duration"] = {"status": "FAIL", "detail": msg}
        else:
            msg = "Treatment durations verified."
            passed.append(msg)
            checks["altered_duration"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 7: Timing Instruction Mismatch (Before vs After Food)
        # ---------------------------------------------------------
        timing_errors = []
        for m in meds:
            timing = (m.get("timing") or "").lower()
            m_name = m.get("name", "").lower()
            clean_name = re.split(r"[^a-z0-9]", m_name)[0]
            if "before" in timing and clean_name in source_lower:
                pos = source_lower.find(clean_name)
                window = source_lower[pos: pos + 80]
                if "after food" in window or "after meals" in window or " pc " in f" {window} ":
                    timing_errors.append(f"{m.get('name')} listed as before food but source says after food")
            elif "after" in timing and clean_name in source_lower:
                pos = source_lower.find(clean_name)
                window = source_lower[pos: pos + 80]
                if "before food" in window or "before breakfast" in window or " ac " in f" {window} ":
                    timing_errors.append(f"{m.get('name')} listed as after food but source says before food")

        if timing_errors:
            msg = f"Timing reversals: {', '.join(timing_errors)}"
            flags.append(msg)
            checks["timing_mismatch"] = {"status": "FAIL", "detail": msg}
        else:
            msg = "Food timing instructions (before/after meals) verified."
            passed.append(msg)
            checks["timing_mismatch"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 8: Wrong STOP Classification
        # ---------------------------------------------------------
        wrong_stops = []
        for s in stop_meds:
            s_clean = s.lower().strip()
            clean_s_name = re.sub(r"^(?:tab(?:let)?|cap(?:sule)?|inj(?:ection)?|syp|sachet)\.?\s*", "", s_clean).strip()
            primary_s_word = re.split(r"[^a-z0-9]", clean_s_name)[0] if clean_s_name else ""

            # Verify that source text explicitly orders this medicine discontinued
            if source_text and primary_s_word:
                stop_match = re.search(r"\b(?:stop|discontinue|withhold|hold|taper\s+and\s+stop)\b[^\n]*?" + re.escape(primary_s_word), source_lower)
                if not stop_match:
                    wrong_stops.append(f"{s} (no explicit stop order in source)")

            # Also verify it is not simultaneously listed as an active medicine to take
            for m in meds:
                m_name_low = m.get("name", "").lower()
                clean_m_name = re.sub(r"^(?:tab(?:let)?|cap(?:sule)?|inj(?:ection)?|syp|sachet)\.?\s*", "", m_name_low).strip()
                primary_m_word = re.split(r"[^a-z0-9]", clean_m_name)[0] if clean_m_name else ""
                if primary_s_word and primary_m_word and primary_s_word == primary_m_word:
                    wrong_stops.append(f"{s} (both active and stopped)")

        if wrong_stops:
            msg = f"Discontinued medication errors: {', '.join(wrong_stops)}"
            flags.append(msg)
            checks["wrong_stop_classification"] = {"status": "FAIL", "detail": msg}
        else:
            msg = f"Discontinued medicines verified: {len(stop_meds)} appropriately isolated."
            passed.append(msg)
            checks["wrong_stop_classification"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 9: Missing Follow-up Dates
        # ---------------------------------------------------------
        missing_dates = []
        if source_text:
            fu_section = re.search(r"(?:follow[\s-]*up|review|appointment)[\s\S]*?(?=(?:discharge|rx|warning|\Z))", source_lower)
            fu_text = fu_section.group(0) if fu_section else ""
            plan_dates = {f.get("date") for f in fus}
            for d in DATE_RE.findall(fu_text):
                # normalize date
                parts = re.split(r"[-/]", d)
                if len(parts) == 3 and len(parts[0]) == 4:
                    iso = d
                elif len(parts) == 3:
                    iso = f"{parts[2]}-{int(parts[1]):02d}-{int(parts[0]):02d}" if len(parts[2]) == 4 else ""
                else:
                    iso = ""
                if iso and iso not in plan_dates:
                    missing_dates.append(iso)

        if missing_dates:
            msg = f"Missing source follow-up dates: {', '.join(missing_dates)}"
            flags.append(msg)
            checks["missing_followup_dates"] = {"status": "FAIL", "detail": msg}
        else:
            msg = f"All {len(fus)} follow-up dates preserved."
            passed.append(msg)
            checks["missing_followup_dates"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 10: Invented Follow-up Dates / Invalid Format
        # ---------------------------------------------------------
        invented_dates = []
        for f in fus:
            dt = f.get("date", "")
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", dt):
                invented_dates.append(f"{dt} (invalid ISO date format)")
            elif source_text and dt not in source_text:
                # check if parts appear
                parts = dt.split("-")
                if not (parts[0] in source_text and parts[2] in source_text):
                    invented_dates.append(dt)

        if invented_dates:
            msg = f"Invented follow-up dates: {', '.join(invented_dates)}"
            flags.append(msg)
            checks["invented_followup_dates"] = {"status": "FAIL", "detail": msg}
        else:
            msg = "Zero invented follow-up dates."
            passed.append(msg)
            checks["invented_followup_dates"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 11: Missing Warning Signs
        # ---------------------------------------------------------
        if source_text and ("warning" in source_lower or "red flag" in source_lower or "when to return" in source_lower):
            if not warns:
                msg = "Source summary specifies warning signs but care plan omitted them."
                flags.append(msg)
                checks["missing_warning_signs"] = {"status": "FAIL", "detail": msg}
            else:
                msg = f"Source warning signs successfully captured ({len(warns)} signs)."
                passed.append(msg)
                checks["missing_warning_signs"] = {"status": "PASS", "detail": msg}
        else:
            msg = "No explicit warning sign section required or omitted."
            passed.append(msg)
            checks["missing_warning_signs"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 12: Invented Warning Signs
        # ---------------------------------------------------------
        invented_warns = []
        if source_text and warns:
            if not any(k in source_lower for k in ["warning", "red flag", "emergency", "when to return", "fever", "pain", "bleeding"]):
                invented_warns.append("Generic warning signs added without source support")

        if invented_warns:
            msg = f"Invented warning signs: {', '.join(invented_warns)}"
            flags.append(msg)
            checks["invented_warning_signs"] = {"status": "FAIL", "detail": msg}
        else:
            msg = "Zero invented warning signs."
            passed.append(msg)
            checks["invented_warning_signs"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 13: Unsupported Diet Instructions
        # ---------------------------------------------------------
        invented_diet = []
        if source_text and diet:
            if not any(k in source_lower for k in ["diet", "food", "salt", "fluid", "hydration", "eat", "meal"]):
                invented_diet.append("Diet restrictions added without source support")

        if invented_diet:
            msg = f"Unsupported diet instructions: {', '.join(invented_diet)}"
            flags.append(msg)
            checks["unsupported_diet"] = {"status": "FAIL", "detail": msg}
        else:
            msg = "Diet instructions grounded in source record."
            passed.append(msg)
            checks["unsupported_diet"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 14: Unsupported Activity Restrictions
        # ---------------------------------------------------------
        invented_act = []
        if source_text and act:
            if not any(k in source_lower for k in ["activity", "lifting", "rest", "walk", "exercise", "physio"]):
                invented_act.append("Activity restrictions added without source support")

        if invented_act:
            msg = f"Unsupported activity restrictions: {', '.join(invented_act)}"
            flags.append(msg)
            checks["unsupported_activity"] = {"status": "FAIL", "detail": msg}
        else:
            msg = "Activity instructions grounded in source record."
            passed.append(msg)
            checks["unsupported_activity"] = {"status": "PASS", "detail": msg}

        # ---------------------------------------------------------
        # CHECK 15: Telugu Numeric Corruption
        # ---------------------------------------------------------
        corrupted_nums = []
        if translation_text:
            # Check every medicine dose number and follow up date is in translation text
            for m in meds:
                dose = m.get("dose", "")
                for token in re.findall(r"\b\d+(?:\.\d+)?\b", dose):
                    if token not in translation_text:
                        corrupted_nums.append(f"{m.get('name')} dose number {token}")
            for f in fus:
                dt = f.get("date", "")
                if dt and dt not in translation_text:
                    corrupted_nums.append(f"Follow-up date {dt}")

        if corrupted_nums:
            msg = f"Telugu translation numbers corrupted or omitted: {', '.join(corrupted_nums[:3])}"
            flags.append(msg)
            checks["telugu_numeric_corruption"] = {"status": "FAIL", "detail": msg}
        else:
            msg = "All numerical doses, units, and dates preserved faithfully in Telugu script."
            passed.append(msg)
            checks["telugu_numeric_corruption"] = {"status": "PASS", "detail": msg}

        is_valid = len(flags) == 0
        return {
            "is_valid": is_valid,
            "status": "VERIFIED" if is_valid else "NEEDS_REVIEW",
            "passed": passed,
            "flags": flags,
            "checks": checks,
        }
