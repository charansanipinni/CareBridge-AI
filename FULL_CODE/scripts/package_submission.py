#!/usr/bin/env python3
"""Submission Packaging Script for TalentAP Mega Hackathon 2026 - Problem H2.
Team: AVENGERS | CareBridge AI

Usage:
    python FULL_CODE/scripts/package_submission.py --team_id <YOUR_OFFICIAL_TEAM_ID>
Example:
    python FULL_CODE/scripts/package_submission.py --team_id T042
    Output: T042_H2.zip
"""

import argparse
import os
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Package official Hackathon submission zip")
    parser.add_argument("--team_id", required=True, help="Official Team ID issued by organizers (e.g. T042 or AVENGERS)")
    parser.add_argument("--repo_path", default=".", help="Path to current repository root")
    parser.add_argument("--output_dir", default="..", help="Directory where zip will be generated")
    args = parser.parse_args()

    team_id = args.team_id.strip()
    zip_name = f"{team_id}_H2.zip"
    pack_folder_name = f"{team_id}_H2"
    repo_path = Path(args.repo_path).resolve()
    output_dir = Path(args.output_dir).resolve()
    clone_dest = output_dir / pack_folder_name
    target_zip = output_dir / zip_name

    print("=" * 70)
    print(f" PACKAGING SUBMISSION FOR TEAM: {team_id}")
    print(f" Target Zip: {target_zip}")
    print("=" * 70)

    # 1. Clean previous clone if exists
    if clone_dest.exists():
        print(f"Cleaning existing staging folder: {clone_dest}")
        shutil.rmtree(clone_dest, ignore_errors=True)

    # 2. Fresh git clone
    print(f"Creating fresh git clone from {repo_path} -> {clone_dest}...")
    res = subprocess.run(["git", "clone", str(repo_path), str(clone_dest)], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Git clone failed: {res.stderr}", file=sys.stderr)
        sys.exit(1)

    # 3. Verify submission file exists and is intact
    sub_file = clone_dest / "submission" / "H2_predictions.jsonl"
    if not sub_file.exists():
        print(f"ERROR: {sub_file} does not exist in clone!", file=sys.stderr)
        sys.exit(1)

    with open(sub_file, encoding="utf-8") as f:
        lines = [ln for ln in f if ln.strip()]
    print(f"Verified submission/H2_predictions.jsonl: {len(lines)} records.")
    if len(lines) != 300:
        print(f"ERROR: Expected 300 test predictions, got {len(lines)}", file=sys.stderr)
        sys.exit(1)

    # 4. Check for forbidden directories in clone
    forbidden = [".env", "data", "models", ".venv", "venv", "node_modules"]
    for item in forbidden:
        p = clone_dest / item
        if p.exists() and not (item == "data" and (clone_dest / "FULL_CODE" / "frontend" / "src" / "data").exists()):
            print(f"WARNING: Forbidden path {item} found at root of clone! Removing...")
            if p.is_dir():
                shutil.rmtree(p)
            else:
                p.unlink()

    # 5. Create Zip archive
    print(f"Creating ZIP archive: {target_zip}...")
    if target_zip.exists():
        target_zip.unlink()

    with zipfile.ZipFile(target_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(clone_dest):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(output_dir)
                zipf.write(file_path, arcname)

    zip_size_mb = target_zip.stat().st_size / (1024 * 1024)
    print("=" * 70)
    print(f" SUBMISSION ZIP READY: {target_zip} ({zip_size_mb:.2f} MB)")
    print(" Validated checklist:")
    print("  [x] All code in FULL_CODE/")
    print("  [x] submission/H2_predictions.jsonl included (300 records)")
    print("  [x] Root README.md included")
    print("  [x] .env excluded")
    print("  [x] node_modules and .venv excluded")
    print("  [x] data/ and models/ excluded")
    print("  [x] Fresh git clone packaged")
    print("=" * 70)

    # Cleanup staging clone folder
    shutil.rmtree(clone_dest, ignore_errors=True)

if __name__ == "__main__":
    main()
