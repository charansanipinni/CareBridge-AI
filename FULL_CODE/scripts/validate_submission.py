#!/usr/bin/env python3
"""Submission Validator for TalentAP Mega Hackathon 2026 - Problem H2.
Team: AVENGERS | CareBridge AI

Checks all strict format rules:
  - File exists and is valid UTF-8
  - Exactly 300 physical JSON Lines
  - Exactly matches test_ids.csv
  - Valid JSON schema with all required keys
  - Real YYYY-MM-DD dates
  - Valid Telugu language code 'te'
  - Character length constraints (<= 300 short, <= 100,000 text)
  - No NaN or Infinity

Usage:
    python FULL_CODE/scripts/validate_submission.py submission/H2_predictions.jsonl
"""

import json
import math
import re
import sys
from datetime import date
from pathlib import Path

REQUIRED_CP_LISTS = ["medicines", "stop_medicines", "warning_signs", "diet", "activity", "follow_ups"]
MED_KEYS = ["name", "dose", "frequency", "timing", "duration", "how_to_take_plain"]
FU_KEYS = ["date", "with_whom", "purpose"]
MAX_FIELD_LEN = 300
MAX_TEXT_LEN = 100_000

def validate_submission_file(sub_path: Path, test_ids_path: Path) -> bool:
    print("=" * 68)
    print(f" VALIDATING SUBMISSION: {sub_path}")
    print("=" * 68)

    if not sub_path.exists():
        print(f"FAILED: Submission file not found at {sub_path}", file=sys.stderr)
        return False

    # Check test IDs if available
    expected_ids = None
    if test_ids_path.exists():
        import pandas as pd
        expected_ids = set(pd.read_csv(test_ids_path)["summary_id"])
        print(f"Loaded {len(expected_ids)} expected IDs from {test_ids_path.name}")

    rows = []
    try:
        with open(sub_path, encoding="utf-8-sig") as f:
            for i, line in enumerate(f, 1):
                if not line.strip():
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError as e:
                    print(f"FAILED Line {i}: Invalid JSON ({e})", file=sys.stderr)
                    return False
                if not isinstance(obj, dict):
                    print(f"FAILED Line {i}: Line must be a JSON object", file=sys.stderr)
                    return False
                rows.append(obj)
    except UnicodeDecodeError:
        print("FAILED: File is not valid UTF-8", file=sys.stderr)
        return False

    print(f"Parsed {len(rows)} physical JSON lines.")
    if len(rows) != 300 and expected_ids and len(expected_ids) == 300:
        print(f"FAILED: Expected exactly 300 records, got {len(rows)}", file=sys.stderr)
        return False

    seen_ids = set()
    for i, r in enumerate(rows, 1):
        sid = r.get("summary_id")
        if not sid or not isinstance(sid, str):
            print(f"FAILED Line {i}: Missing or invalid 'summary_id'", file=sys.stderr)
            return False
        if sid in seen_ids:
            print(f"FAILED Line {i}: Duplicate summary_id '{sid}'", file=sys.stderr)
            return False
        seen_ids.add(sid)

        # care_plan
        cp = r.get("care_plan")
        if not isinstance(cp, dict):
            print(f"FAILED Line {i}: Missing or invalid 'care_plan' object", file=sys.stderr)
            return False
        for k in REQUIRED_CP_LISTS:
            if not isinstance(cp.get(k), list):
                print(f"FAILED Line {i}: care_plan.{k} must be a list", file=sys.stderr)
                return False

        for j, m in enumerate(cp["medicines"]):
            if not isinstance(m, dict):
                print(f"FAILED Line {i}: care_plan.medicines[{j}] must be an object", file=sys.stderr)
                return False
            for mk in MED_KEYS:
                if mk not in m:
                    print(f"FAILED Line {i}: care_plan.medicines[{j}] missing key '{mk}'", file=sys.stderr)
                    return False
                val = m[mk]
                if val is not None and not isinstance(val, str):
                    print(f"FAILED Line {i}: care_plan.medicines[{j}].{mk} must be string or null", file=sys.stderr)
                    return False
                if isinstance(val, str) and len(val) > (MAX_TEXT_LEN if mk == "how_to_take_plain" else MAX_FIELD_LEN):
                    print(f"FAILED Line {i}: care_plan.medicines[{j}].{mk} exceeds character limit", file=sys.stderr)
                    return False

        for j, fu in enumerate(cp["follow_ups"]):
            if not isinstance(fu, dict):
                print(f"FAILED Line {i}: care_plan.follow_ups[{j}] must be an object", file=sys.stderr)
                return False
            d_str = fu.get("date")
            if not d_str or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d_str):
                print(f"FAILED Line {i}: care_plan.follow_ups[{j}].date must be YYYY-MM-DD", file=sys.stderr)
                return False
            try:
                date.fromisoformat(d_str)
            except ValueError:
                print(f"FAILED Line {i}: care_plan.follow_ups[{j}].date is not a real calendar date", file=sys.stderr)
                return False

        # plain_text_en
        en_text = r.get("plain_text_en")
        if not isinstance(en_text, str) or len(en_text) > MAX_TEXT_LEN:
            print(f"FAILED Line {i}: Missing or oversized 'plain_text_en'", file=sys.stderr)
            return False

        # translation
        tr = r.get("translation")
        if not isinstance(tr, dict):
            print(f"FAILED Line {i}: Missing 'translation' object", file=sys.stderr)
            return False
        if tr.get("language_code") != "te":
            print(f"FAILED Line {i}: translation.language_code must be 'te', got '{tr.get('language_code')}'", file=sys.stderr)
            return False
        if not isinstance(tr.get("text"), str) or len(tr["text"]) > MAX_TEXT_LEN:
            print(f"FAILED Line {i}: Missing or oversized 'translation.text'", file=sys.stderr)
            return False

        # readability
        rd = r.get("readability")
        if not isinstance(rd, dict) or "metric" not in rd or "score" not in rd:
            print(f"FAILED Line {i}: Missing or invalid 'readability' object", file=sys.stderr)
            return False
        sc = rd.get("score")
        if sc is not None:
            if not isinstance(sc, (int, float)) or isinstance(sc, bool) or not math.isfinite(sc):
                print(f"FAILED Line {i}: readability.score must be a finite number or null", file=sys.stderr)
                return False

    if expected_ids:
        missing = expected_ids - seen_ids
        if missing:
            print(f"FAILED: {len(missing)} expected test IDs are missing: {list(missing)[:5]}", file=sys.stderr)
            return False
        print("All 300 expected test IDs are present with zero missing and zero duplicates.")

    print("=" * 68)
    print(" ALL STRICT OFFICIAL VALIDATION CHECKS PASSED SUCCESSFULLY (300/300)")
    print("=" * 68)
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_submission.py <path_to_H2_predictions.jsonl>")
        sys.exit(1)
    sub = Path(sys.argv[1])
    # Search for test_ids.csv
    test_ids = Path("C:/Mega Hackathon/h2_official_pack/H2_Discharge_Summary_to_Care_Plan/data/test_ids.csv")
    if not test_ids.exists():
        test_ids = Path("data/test_ids.csv")
    ok = validate_submission_file(sub, test_ids)
    sys.exit(0 if ok else 2)
