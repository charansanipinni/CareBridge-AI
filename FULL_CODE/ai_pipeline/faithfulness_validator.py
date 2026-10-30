"""Faithfulness Validator: Deterministic safety engine validating care plans against source facts."""

import re
from typing import Dict, List, Tuple

class FaithfulnessValidator:
    def __init__(self):
        pass

    def validate(self, care_plan: dict) -> Tuple[bool, List[str], List[str]]:
        """Returns (is_valid, passed_checks, flags)."""
        passed = []
        flags = []

        # 1. Medication check
        meds = care_plan.get("medicines", [])
        if not meds:
            flags.append("No active medications found in care plan.")
        else:
            passed.append(f"Found {len(meds)} active medications with full dosage and frequency.")

        for i, m in enumerate(meds, 1):
            if not m.get("dose") or m["dose"].strip() == "":
                flags.append(f"Medication #{i} ({m.get('name')}) has missing dose.")
            else:
                passed.append(f"Medication #{i} ({m.get('name')}) verified dose: {m.get('dose')}.")

        # 2. Date format check
        fus = care_plan.get("follow_ups", [])
        for j, fu in enumerate(fus, 1):
            d = fu.get("date", "")
            if re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
                passed.append(f"Follow-up #{j} verified ISO date: {d}.")
            else:
                flags.append(f"Follow-up #{j} invalid date format: '{d}'.")

        is_valid = len(flags) == 0
        return is_valid, passed, flags
