#!/usr/bin/env python3
"""Submission Packaging & Compliance Verification Script for TalentAP Mega Hackathon 2026 - Problem H2.
Team: AVENGERS | CareBridge AI

Strict Fail-Closed Architecture:
1. Requires official dataset split file (splits.csv / test_ids.csv). Halts if missing.
2. Compares complete set of 300 expected vs submitted test IDs.
3. Rejects missing IDs, extra IDs, duplicates, and schema non-compliance.
4. Executes official evaluate.validate_submission schema audit.
5. Recursively scans staging directory and extracted ZIP for forbidden files, model weights, datasets, and secrets.
6. Enforces 50MB archive-size constraint and mandatory submission structure.

Usage:
    python FULL_CODE/scripts/package_submission.py --team_id <YOUR_OFFICIAL_TEAM_ID> [--validate_only]
Example:
    python FULL_CODE/scripts/package_submission.py --team_id AVENGERS --validate_only
    python FULL_CODE/scripts/package_submission.py --team_id AVENGERS
"""

import argparse
import os
import re
import shutil
import sys
import tempfile
import zipfile
import json
from pathlib import Path

# Security regex patterns
SECRET_CONTENT_PATTERNS = [
    re.compile(r"AIzaSy[A-Za-z0-9_-]{33}"),                  # Google API Key
    re.compile(r"sk-[A-Za-z0-9]{32,}"),                     # OpenAI API Key
    re.compile(r"-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----"), # Private key header
]

FORBIDDEN_FILE_EXTENSIONS = {
    ".pem", ".key", ".pkcs12", ".pfx",
    ".pt", ".pth", ".bin", ".onnx", ".safetensors",
    ".sqlite", ".sqlite3", ".db",
}

def scan_path_for_security_violations(target_dir: Path):
    """Recursively inspects every directory and file for forbidden files, datasets, and secrets."""
    for root, dirs, files in os.walk(target_dir):
        # Check directories
        for d in dirs:
            if d in [".git", "node_modules", ".venv", "venv", "__pycache__", ".pytest_cache", ".cache"]:
                raise ValueError(f"SECURITY VIOLATION: Forbidden directory found in package staging: {Path(root) / d}")

        # Check files
        for f in files:
            fp = Path(root) / f
            fn = f.lower()

            # 1. Reject non-example .env files (only approved .env.example is allowed)
            if (fn.startswith(".env") or fn.endswith(".env")) and fn != ".env.example":
                raise ValueError(f"SECURITY VIOLATION: Environment credential file found: {fp}")

            # 2. Reject forbidden extensions (keys, models, databases)
            ext = fp.suffix.lower()
            if ext in FORBIDDEN_FILE_EXTENSIONS:
                raise ValueError(f"SECURITY VIOLATION: Forbidden file type ({ext}) found: {fp}")

            # 3. Reject datasets and raw files
            if fn in ["summaries.jsonl", "dev_fact_key.jsonl", "all_2000_predictions.jsonl"]:
                raise ValueError(f"SECURITY VIOLATION: Prohibited dataset/scratch file found: {fp}")

            # 4. Content scan for secrets in small text files (< 1MB)
            if fp.stat().st_size < 1024 * 1024 and not ext in [".png", ".jpg", ".jpeg", ".ico", ".pdf", ".zip"]:
                try:
                    content = fp.read_text(encoding="utf-8", errors="ignore")
                    for pattern in SECRET_CONTENT_PATTERNS:
                        if pattern.search(content):
                            raise ValueError(f"SECURITY VIOLATION: Hardcoded credential/secret pattern detected in {fp}")
                except Exception as e:
                    if "SECURITY VIOLATION" in str(e):
                        raise

def validate_predictions_integrity(sub_file: Path, repo_path: Path):
    """Strictly validates submission/H2_predictions.jsonl against official splits and schema.
    FAILS CLOSED if the official split file is missing or mismatching.
    """
    if not sub_file.exists():
        raise FileNotFoundError(f"FAIL-CLOSED: Missing submission predictions file: {sub_file}")

    # Load and check JSONL records
    rows = []
    seen_ids = set()
    dup_ids = set()
    with open(sub_file, encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line_str = line.strip()
            if not line_str:
                continue
            try:
                rec = json.loads(line_str)
            except json.JSONDecodeError as err:
                raise ValueError(f"FAIL-CLOSED: Malformed JSON at line {line_num}: {err}")

            sid = rec.get("summary_id")
            if not sid:
                raise ValueError(f"FAIL-CLOSED: Line {line_num} missing required field 'summary_id'")
            if sid in seen_ids:
                dup_ids.add(sid)
            seen_ids.add(sid)
            rows.append(rec)

    if dup_ids:
        raise ValueError(f"FAIL-CLOSED: Duplicate summary IDs detected in submission: {dup_ids}")

    if len(rows) != 300:
        raise ValueError(f"FAIL-CLOSED: Expected exactly 300 predictions, but found {len(rows)}")

    # 1. Require official split file - FAIL CLOSED if missing
    split_candidates = [
        repo_path / "h2_official_pack" / "H2_Discharge_Summary_to_Care_Plan" / "data" / "splits.csv",
        repo_path / "data" / "splits.csv",
        repo_path / "h2_official_pack" / "H2_Discharge_Summary_to_Care_Plan" / "data" / "test_ids.csv",
    ]
    splits_path = next((p for p in split_candidates if p.exists()), None)
    if not splits_path:
        raise FileNotFoundError(
            "FAIL-CLOSED: Official dataset split file ('splits.csv' or 'test_ids.csv') is missing. "
            "Verification cannot proceed without authoritative test IDs."
        )

    # 2. Authoritative test ID reconciliation
    import pandas as pd
    df = pd.read_csv(splits_path)
    if "split" in df.columns:
        expected_test_ids = set(df[df["split"] == "test"]["summary_id"])
    elif "summary_id" in df.columns:
        expected_test_ids = set(df["summary_id"])
    else:
        raise ValueError(f"FAIL-CLOSED: Official split file at {splits_path} missing summary_id column")

    if len(expected_test_ids) != 300:
        raise ValueError(f"FAIL-CLOSED: Authoritative test split has {len(expected_test_ids)} IDs, expected exactly 300.")

    missing = expected_test_ids - seen_ids
    extra = seen_ids - expected_test_ids
    if missing or extra:
        raise ValueError(f"FAIL-CLOSED: Test ID set mismatch! Missing IDs: {len(missing)}, Extra IDs: {len(extra)}")

    print(f"  [x] Verified all {len(expected_test_ids)} authoritative test IDs against {splits_path.name} (0 missing, 0 extra).")

    # 3. Official evaluator schema validation execution
    eval_script = repo_path / "FULL_CODE" / "evaluation" / "evaluate.py"
    if not eval_script.exists():
        eval_script = repo_path / "h2_official_pack" / "H2_Discharge_Summary_to_Care_Plan" / "evaluate.py"
    if not eval_script.exists():
        raise FileNotFoundError(f"FAIL-CLOSED: Official evaluator script 'evaluate.py' not found.")

    sys.path.insert(0, str(eval_script.parent))
    import evaluate
    validated_dict = evaluate.validate_submission(rows)
    if len(validated_dict) != 300:
        raise ValueError(f"FAIL-CLOSED: Official schema validator accepted {len(validated_dict)} records, expected 300.")
    print(f"  [x] Official schema validation successfully executed and passed for all 300 records.")

def main():
    parser = argparse.ArgumentParser(description="Package and verify official Hackathon submission zip")
    parser.add_argument("--team_id", required=True, help="Official Team ID issued by organizers (e.g. T042 or AVENGERS)")
    parser.add_argument("--repo_path", default=".", help="Path to current repository root")
    parser.add_argument("--output_dir", default="dist_submission", help="Directory where zip will be generated")
    parser.add_argument("--validate_only", action="store_true", help="Perform full validation without creating archive")
    args = parser.parse_args()

    team_id = args.team_id.strip()
    zip_name = f"{team_id}_H2.zip"
    pack_folder_name = f"{team_id}_H2"
    repo_path = Path(args.repo_path).resolve()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    clone_dest = output_dir / pack_folder_name
    target_zip = output_dir / zip_name
    root_zip = repo_path / zip_name

    print("=" * 70)
    print(f" SUBMISSION COMPLIANCE & PACKAGING AUDIT: TEAM {team_id}")
    print(f" Mode: {'VALIDATE ONLY (No ZIP)' if args.validate_only else 'FULL PACKAGING'}")
    print("=" * 70)

    # 1. Clean previous staging
    if clone_dest.exists():
        shutil.rmtree(clone_dest, ignore_errors=True)

    # 2. Resilient staging copy with strict exclusions
    print(f"Staging clean repository tree from {repo_path} -> {clone_dest}...")
    def ignore_patterns(dir_path, files):
        ignored = set()
        for f in files:
            if f in [".git", "node_modules", "dist", "dist_submission", ".venv", "venv", "__pycache__", ".pytest_cache", ".DS_Store", "h2_official_pack"]:
                ignored.add(f)
            elif f == ".env" or (f.startswith(".env.") and not f.endswith(".example")):
                ignored.add(f)
            elif f.endswith(".pyc") or f == "all_2000_predictions.jsonl" or f == zip_name or f.endswith(".zip"):
                ignored.add(f)
        return ignored

    shutil.copytree(repo_path, clone_dest, ignore=ignore_patterns)

    # 3. Clean any local scratch evaluation artifacts inside clone
    forbidden_local = [
        clone_dest / "FULL_CODE" / "evaluation" / "all_2000_predictions.jsonl",
        clone_dest / ".pytest_cache",
        clone_dest / "__pycache__",
    ]
    for p in forbidden_local:
        if p.exists():
            if p.is_dir():
                shutil.rmtree(p, ignore_errors=True)
            else:
                p.unlink()

    # 4. Mandatory root files verification
    mandatory_files = [
        clone_dest / "README.md",
        clone_dest / "LICENSE",
        clone_dest / ".gitignore",
        clone_dest / "submission" / "H2_predictions.jsonl",
        clone_dest / "FULL_CODE",
    ]
    for mf in mandatory_files:
        if not mf.exists():
            print(f"FATAL: Mandatory submission file/directory missing: {mf.name}", file=sys.stderr)
            sys.exit(1)
    print("  [x] Mandatory root files verified (README.md, LICENSE, .gitignore, submission/, FULL_CODE/).")

    # 5. Deep prediction integrity validation (FAIL-CLOSED)
    sub_file = clone_dest / "submission" / "H2_predictions.jsonl"
    try:
        validate_predictions_integrity(sub_file, repo_path)
    except Exception as e:
        print(f"FATAL: Prediction integrity validation failed: {e}", file=sys.stderr)
        shutil.rmtree(clone_dest, ignore_errors=True)
        sys.exit(1)

    # 6. Deep recursive security and secret scan on staging directory
    try:
        scan_path_for_security_violations(clone_dest)
        print("  [x] Recursive security scan passed (zero unauthorized .env files, private keys, models, or secrets).")
    except Exception as e:
        print(f"FATAL: Security scan failed on staging tree: {e}", file=sys.stderr)
        shutil.rmtree(clone_dest, ignore_errors=True)
        sys.exit(1)

    if args.validate_only:
        print("=" * 70)
        print(" [x] PRE-PACKAGING VERIFICATION COMPLETED: ALL AUDIT CHECKS PASSED!")
        print("     Repository is strictly compliant and ready for final release.")
        print("     CONFIRMATION: No ZIP file was created.")
        print("=" * 70)
        shutil.rmtree(clone_dest, ignore_errors=True)
        return

    # 7. Create Zip archive
    print(f"Creating ZIP archive: {target_zip}...")
    if target_zip.exists():
        target_zip.unlink()

    with zipfile.ZipFile(target_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(clone_dest):
            dirs[:] = [d for d in dirs if d not in [".git", "node_modules", ".venv", "__pycache__", ".pytest_cache"]]
            for file in files:
                if file == ".env" or (file.startswith(".env.") and not file.endswith(".example")):
                    continue
                file_path = Path(root) / file
                arcname = file_path.relative_to(output_dir)
                zipf.write(file_path, arcname)

    # 8. Verification of extracted archive in fresh temporary directory
    print("Verifying archive via fresh extraction into temporary sandbox...")
    with tempfile.TemporaryDirectory() as temp_dir:
        with zipfile.ZipFile(target_zip, "r") as zf:
            zf.extractall(temp_dir)
        extracted_root = Path(temp_dir) / pack_folder_name
        
        # Verify mandatory contents in extracted tree
        if not (extracted_root / "submission" / "H2_predictions.jsonl").exists():
            print("FATAL: Extracted archive missing submission file!", file=sys.stderr)
            sys.exit(1)
        if not (extracted_root / "FULL_CODE").exists():
            print("FATAL: Extracted archive missing FULL_CODE directory!", file=sys.stderr)
            sys.exit(1)
        if not (extracted_root / "README.md").exists():
            print("FATAL: Extracted archive missing README.md!", file=sys.stderr)
            sys.exit(1)
        if not (extracted_root / "LICENSE").exists():
            print("FATAL: Extracted archive missing LICENSE!", file=sys.stderr)
            sys.exit(1)
            
        # Recursive security scan on extracted archive contents
        scan_path_for_security_violations(extracted_root)
        print("  [x] Post-extraction recursive security scan passed.")

        # Re-verify extracted submission prediction file integrity and official schema
        validate_predictions_integrity(extracted_root / "submission" / "H2_predictions.jsonl", repo_path)
        print("  [x] Post-extraction predictions integrity & official schema validation passed on extracted archive.")

    zip_size_mb = target_zip.stat().st_size / (1024 * 1024)
    if zip_size_mb > 50.0:
        print(f"FATAL: Archive size {zip_size_mb:.2f} MB exceeds 50MB limit!", file=sys.stderr)
        sys.exit(1)

    shutil.copy2(target_zip, root_zip)
    print("=" * 70)
    print(f" SUBMISSION ZIP READY & VERIFIED: {target_zip} ({zip_size_mb:.2f} MB)")
    print(f" Root Archive Copy:               {root_zip}")
    print("=" * 70)

    shutil.rmtree(clone_dest, ignore_errors=True)

if __name__ == "__main__":
    main()
