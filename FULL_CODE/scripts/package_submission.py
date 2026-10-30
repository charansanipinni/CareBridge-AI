#!/usr/bin/env python3
"""Submission Packaging & Compliance Verification Script for TalentAP Mega Hackathon 2026 - Problem H2.
Team: AVENGERS | CareBridge AI

Usage:
    python FULL_CODE/scripts/package_submission.py --team_id <YOUR_OFFICIAL_TEAM_ID> [--validate_only]
Example:
    python FULL_CODE/scripts/package_submission.py --team_id AVENGERS --validate_only
    python FULL_CODE/scripts/package_submission.py --team_id AVENGERS
"""

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
import json
from pathlib import Path

def validate_predictions_integrity(sub_file: Path, repo_path: Path):
    """Strictly validates submission/H2_predictions.jsonl against official splits and schema."""
    if not sub_file.exists():
        raise FileNotFoundError(f"Missing submission predictions file: {sub_file}")

    # Load predictions
    rows = []
    seen_ids = set()
    dup_ids = set()
    with open(sub_file, encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line_str = line.strip()
            if not line_str:
                continue
            rec = json.loads(line_str)
            sid = rec.get("summary_id")
            if not sid:
                raise ValueError(f"Line {line_num} missing 'summary_id'")
            if sid in seen_ids:
                dup_ids.add(sid)
            seen_ids.add(sid)
            rows.append(rec)

    if dup_ids:
        raise ValueError(f"Duplicate summary IDs detected in submission: {dup_ids}")

    if len(rows) != 300:
        raise ValueError(f"Expected exactly 300 predictions, but found {len(rows)}")

    # Check against official splits.csv test IDs if available
    splits_path = repo_path / "h2_official_pack" / "H2_Discharge_Summary_to_Care_Plan" / "data" / "splits.csv"
    if splits_path.exists():
        import pandas as pd
        df = pd.read_csv(splits_path)
        expected_test_ids = set(df[df["split"] == "test"]["summary_id"])
        missing = expected_test_ids - seen_ids
        extra = seen_ids - expected_test_ids
        if missing:
            raise ValueError(f"Submission is missing expected test IDs: {missing}")
        if extra:
            raise ValueError(f"Submission contains unknown/non-test IDs: {extra}")
        print(f"  [x] Verified all {len(expected_test_ids)} expected test IDs against splits.csv (0 missing, 0 extra).")

    # Schema validation using official evaluate.py rules
    eval_script = repo_path / "FULL_CODE" / "evaluation" / "evaluate.py"
    if eval_script.exists():
        sys.path.insert(0, str(eval_script.parent))
        import evaluate
        validated_dict = evaluate.validate_submission(rows)
        print(f"  [x] Official schema validation passed for all {len(validated_dict)} records.")

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

    # 1. Clean previous clone if exists
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

    # 3. Mandatory files verification
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

    # 4. Deep prediction integrity validation
    sub_file = clone_dest / "submission" / "H2_predictions.jsonl"
    try:
        validate_predictions_integrity(sub_file, repo_path)
    except Exception as e:
        print(f"FATAL: Prediction integrity validation failed: {e}", file=sys.stderr)
        sys.exit(1)

    # 5. Check and remove forbidden directories and metadata in clone
    forbidden = [".git", ".env", "data", "models", ".venv", "venv", "node_modules", ".pytest_cache", "__pycache__", "h2_official_pack"]
    for item in forbidden:
        p = clone_dest / item
        if p.exists():
            if p.is_dir():
                shutil.rmtree(p, ignore_errors=True)
            else:
                p.unlink()

    all_2000_p = clone_dest / "FULL_CODE" / "evaluation" / "all_2000_predictions.jsonl"
    if all_2000_p.exists():
        all_2000_p.unlink()

    if args.validate_only:
        print("=" * 70)
        print(" [x] PRE-PACKAGING VERIFICATION COMPLETED: ALL AUDIT CHECKS PASSED!")
        print("     Repository is strictly compliant and ready for final release.")
        print("=" * 70)
        shutil.rmtree(clone_dest, ignore_errors=True)
        return

    # 6. Create Zip archive
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

    # 7. Verification of extracted archive in fresh temporary directory
    print("Verifying archive via fresh extraction into temporary sandbox...")
    with tempfile.TemporaryDirectory() as temp_dir:
        with zipfile.ZipFile(target_zip, "r") as zf:
            zf.extractall(temp_dir)
        extracted_root = Path(temp_dir) / pack_folder_name
        if not (extracted_root / "submission" / "H2_predictions.jsonl").exists():
            print("FATAL: Extracted archive missing submission file!", file=sys.stderr)
            sys.exit(1)
        if (extracted_root / ".git").exists() or (extracted_root / "node_modules").exists():
            print("FATAL: Extracted archive contains forbidden files!", file=sys.stderr)
            sys.exit(1)

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
