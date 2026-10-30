import os
import zipfile
import tempfile
import json
import pandas as pd
from pathlib import Path
import sys

def audit_archive():
    zip_path = Path("AVENGERS_H2.zip").resolve()
    print("=" * 70)
    print(" INDEPENDENT POST-EXTRACTION ARCHIVE AUDIT")
    print(f" Archive: {zip_path}")
    print(f" Size:    {zip_path.stat().st_size} bytes ({zip_path.stat().st_size / (1024*1024):.2f} MB)")
    print("=" * 70)

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(tmp_path)
        
        extracted_root = tmp_path / "AVENGERS_H2"
        print(f"Extracted root directory: {extracted_root}")

        # 1. Check mandatory files
        required = [
            "README.md", "LICENSE", ".gitignore", ".env.example",
            "submission/H2_predictions.jsonl", "FULL_CODE"
        ]
        print("\n1. Mandatory File Checklist:")
        for r in required:
            p = extracted_root / r
            status = "FOUND" if p.exists() else "MISSING"
            print(f"   [{status}] {r}")
            assert p.exists(), f"Missing required file: {r}"

        # 2. Check forbidden files
        print("\n2. Forbidden File & Credential Audit:")
        forbidden_found = []
        for root, dirs, files in os.walk(extracted_root):
            for d in dirs:
                if d in [".git", "node_modules", ".venv", "venv", "__pycache__", ".pytest_cache"]:
                    forbidden_found.append(f"Directory: {Path(root) / d}")
            for f in files:
                fn = f.lower()
                ext = Path(f).suffix.lower()
                if (fn.startswith(".env") or fn.endswith(".env")) and fn != ".env.example":
                    forbidden_found.append(f"Credential file: {Path(root) / f}")
                if ext in [".pem", ".key", ".pt", ".bin", ".onnx", ".sqlite", ".db"]:
                    forbidden_found.append(f"Forbidden extension: {Path(root) / f}")
                if fn in ["summaries.jsonl", "dev_fact_key.jsonl", "all_2000_predictions.jsonl"]:
                    forbidden_found.append(f"Raw dataset file: {Path(root) / f}")

        print(f"   Total forbidden artifacts found: {len(forbidden_found)}")
        if forbidden_found:
            for item in forbidden_found:
                print(f"   - {item}")
        assert len(forbidden_found) == 0, "Forbidden files detected in archive!"
        print("   [PASS] Archive is 100% clean of credentials, models, and datasets.")

        # 3. Check predictions
        print("\n3. Official Predictions Integrity Audit:")
        sub_file = extracted_root / "submission" / "H2_predictions.jsonl"
        lines = [json.loads(l) for l in sub_file.read_text(encoding="utf-8").splitlines() if l.strip()]
        print(f"   Extracted prediction records: {len(lines)}")
        assert len(lines) == 300, f"Expected 300 records, got {len(lines)}"

        # 4. Compare with splits.csv
        splits = pd.read_csv("h2_official_pack/H2_Discharge_Summary_to_Care_Plan/data/splits.csv")
        test_ids = set(splits[splits["split"] == "test"]["summary_id"])
        sub_ids = set(r["summary_id"] for r in lines)
        
        missing = test_ids - sub_ids
        extra = sub_ids - test_ids
        print(f"   Authoritative test IDs in splits.csv: {len(test_ids)}")
        print(f"   Submitted test IDs in archive:         {len(sub_ids)}")
        print(f"   Missing IDs: {len(missing)}")
        print(f"   Extra IDs:   {len(extra)}")
        assert sub_ids == test_ids, "Test ID set mismatch!"
        print("   [PASS] Exact test ID set equality confirmed (300/300 match).")

        # 5. Schema validation via official evaluate.py
        print("\n4. Official Evaluator Schema Audit:")
        sys.path.insert(0, str(Path("FULL_CODE/evaluation").resolve()))
        import evaluate
        val_res = evaluate.validate_submission(lines)
        print(f"   Official evaluate.validate_submission accepted: {len(val_res)} records")
        assert len(val_res) == 300, "Schema validation did not accept all 300 records!"
        print("   [PASS] Official schema validation: 300/300 valid records.")

    print("\n" + "=" * 70)
    print(" ALL POST-EXTRACTION AUDIT CHECKS PASSED SUCCESSFULLY (STATUS: PASS)")
    print("=" * 70)

if __name__ == "__main__":
    audit_archive()
