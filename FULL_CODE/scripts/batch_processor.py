#!/usr/bin/env python3
"""CareBridge AI - Comprehensive Dataset Batch Processor.
Processes the complete 2,000 synthetic discharge summary dataset.
Supports streaming, configurable batch size, error isolation, progress tracking,
and detailed audit report generation.

Team: AVENGERS | Healthcare Track H2 | TalentAP Mega Hackathon 2026
"""

import argparse
import json
import os
import re
import sys
import time
import tracemalloc
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional

# Setup path to import ai_pipeline
SCRIPT_DIR = Path(__file__).resolve().parent
FULL_CODE_DIR = SCRIPT_DIR.parent
PROJECT_ROOT = FULL_CODE_DIR.parent
sys.path.insert(0, str(FULL_CODE_DIR))

from ai_pipeline.submission_generator import SubmissionGenerator
from ai_pipeline.faithfulness_validator import FaithfulnessValidator

def classify_condition(text: str) -> str:
    """Classify summary into official condition groups: maternity, postop, cardiac, respiratory, diabetes."""
    header = "\n".join([l for l in text.split("\n") if l.strip()][:6]).lower()
    t_low = text.lower()
    
    if any(k in header for k in ["obstetrics", "gynaecology", "gynae", "obg", "maternity"]):
        return "maternity"
    elif any(k in header for k in ["surgery", "orthopaedics", "ortho", "surgical"]):
        return "postop"
    elif any(k in header for k in ["cardiology", "cardiac", "ccu", "coronary"]):
        return "cardiac"
    elif any(k in header for k in ["pulmonary", "pulmonology", "chest", "respiratory"]):
        return "respiratory"
    else:
        # Dept is General Medicine / Medical Unit
        diag_m = re.search(r"(?:diagnosis|dx)[^\n]*?:?\s*([^\n]+(?:\n[ \t]*[-*•\d\.\)][^\n]+)*)", t_low)
        diag = diag_m.group(0) if diag_m else t_low[:300]
        
        diag_lines = [l.strip() for l in diag.split("\n") if l.strip() and not l.strip().lower().startswith(("diagnosis", "dx"))]
        first_diag = diag_lines[0] if diag_lines else diag
        
        if any(k in first_diag for k in ["copd", "asthma", "pneumonia", "tuberculosis", "tb", "bronch", "effusion"]):
            return "respiratory"
        elif any(k in first_diag for k in ["stemi", "nstemi", "coronary", "cad", "angina", "infarction", "heart failure", "ccf"]):
            return "cardiac"
        elif any(k in first_diag for k in ["type 2 diabetes", "type 1 diabetes", "t2dm", "t1dm", "dka", "hyperglyc", "diabetic"]):
            return "diabetes"
        elif any(k in diag for k in ["copd", "asthma", "pneumonia", "tuberculosis", "tb"]):
            return "respiratory"
        elif any(k in diag for k in ["stemi", "nstemi", "coronary", "cad", "angina", "infarction", "heart failure"]):
            return "cardiac"
        elif any(k in diag for k in ["type 2 diabetes", "type 1 diabetes", "t2dm", "dka", "diabetic"]):
            return "diabetes"
        elif any(k in t_low for k in ["copd", "asthma", "pneumonia", "tuberculosis"]):
            return "respiratory"
        elif any(k in t_low for k in ["stemi", "nstemi", "coronary", "cad", "angina"]):
            return "cardiac"
        elif any(k in t_low for k in ["diabetes", "t2dm", "dka", "hyperglyc"]):
            return "diabetes"
        elif any(k in t_low for k in ["cesarean", "lscs", "delivery", "maternity", "gravida"]):
            return "maternity"
        elif any(k in t_low for k in ["appendectomy", "cholecystectomy", "hernia", "postop", "orif", "fracture"]):
            return "postop"
        else:
            return "general_medical"

def process_dataset(
    summaries_file: Path,
    splits_file: Optional[Path],
    output_file: Optional[Path],
    report_file: Optional[Path],
    split_filter: str = "all",
    batch_size: int = 100,
    validate: bool = True
) -> Dict[str, Any]:
    """Stream and process discharge summaries with memory-efficient batching."""
    tracemalloc.start()
    start_time = time.time()

    print("=" * 70)
    print(" CAREBRIDGE AI - FULL DATASET BATCH PROCESSOR")
    print(f" Source: {summaries_file}")
    print(f" Split Filter: {split_filter} | Batch Size: {batch_size}")
    print(f" Validation Enabled: {validate}")
    print("=" * 70)

    # Load splits if available
    split_map = {}
    if splits_file and splits_file.exists():
        import pandas as pd
        df = pd.read_csv(splits_file)
        split_map = dict(zip(df["summary_id"], df["split"]))
        print(f"Loaded {len(split_map)} summary IDs from {splits_file.name}")

    generator = SubmissionGenerator(config_dir=FULL_CODE_DIR / "config")
    validator = FaithfulnessValidator() if validate else None

    # Tracking metrics
    total_discovered = 0
    total_eligible = 0
    total_processed = 0
    total_success = 0
    total_failed = 0
    total_verified = 0
    total_flagged = 0

    seen_ids = set()
    duplicate_ids = []
    condition_counts = Counter()
    split_counts = Counter()
    failure_details = []
    validation_summary = Counter()

    out_handle = open(output_file, "w", encoding="utf-8") if output_file else None

    try:
        with open(summaries_file, "r", encoding="utf-8") as f:
            for line_idx, line in enumerate(f, 1):
                if not line.strip():
                    continue
                total_discovered += 1

                try:
                    record = json.loads(line)
                except Exception as ex:
                    total_failed += 1
                    failure_details.append({"line": line_idx, "error": f"JSON parse error: {str(ex)}"})
                    continue

                sid = record.get("summary_id", f"UNKNOWN_{line_idx}")
                text = record.get("text", "")

                if sid in seen_ids:
                    duplicate_ids.append(sid)
                seen_ids.add(sid)

                # Check split filter
                rec_split = split_map.get(sid, "unlabelled")
                split_counts[rec_split] += 1
                if split_filter != "all" and rec_split != split_filter:
                    continue

                total_eligible += 1

                # Condition detection
                cond_group = classify_condition(text)
                condition_counts[cond_group] += 1

                # Generate Plan
                try:
                    plan = generator.generate_single_plan(sid, text)
                    total_success += 1

                    # Validate if requested
                    val_status = "NOT_EVALUATED"
                    if validator:
                        val_res = validator.validate_detailed(
                            plan["care_plan"],
                            source_text=text,
                            translation_text=plan["translation"]["text"]
                        )
                        val_status = val_res["status"]
                        if val_res["is_valid"]:
                            total_verified += 1
                        else:
                            total_flagged += 1
                        validation_summary[val_status] += 1

                    plan["_processing_meta"] = {
                        "split": rec_split,
                        "validation_status": val_status,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }

                    if out_handle:
                        out_handle.write(json.dumps(plan, ensure_ascii=False) + "\n")

                except Exception as ex:
                    total_failed += 1
                    failure_details.append({"summary_id": sid, "error": str(ex)})

                total_processed += 1
                if total_processed % batch_size == 0:
                    current_mem, peak_mem = tracemalloc.get_traced_memory()
                    elapsed = time.time() - start_time
                    rate = total_processed / elapsed if elapsed > 0 else 0
                    print(f" -> Processed {total_processed}/{total_eligible} records | {rate:.1f} rec/s | Peak RAM: {peak_mem / (1024*1024):.2f} MB")

    finally:
        if out_handle:
            out_handle.close()

    elapsed_time = time.time() - start_time
    current_mem, peak_mem = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dataset_source": str(summaries_file),
        "split_filter": split_filter,
        "total_records_discovered": total_discovered,
        "total_records_eligible": total_eligible,
        "total_records_processed": total_processed,
        "total_records_success": total_success,
        "total_records_failed": total_failed,
        "unique_summary_ids": len(seen_ids),
        "duplicate_summary_ids_count": len(duplicate_ids),
        "duplicate_summary_ids": duplicate_ids[:10],
        "split_distribution": dict(split_counts),
        "inferred_condition_distribution": dict(condition_counts),
        "validation_summary": {
            "verified_consistent": total_verified,
            "requires_clinician_review": total_flagged,
            "verification_rate": (total_verified / total_success) if total_success > 0 else 0.0
        },
        "performance": {
            "elapsed_seconds": round(elapsed_time, 2),
            "throughput_records_per_sec": round(total_processed / elapsed_time, 2) if elapsed_time > 0 else 0,
            "peak_memory_mb": round(peak_mem / (1024 * 1024), 2)
        },
        "failures": failure_details
    }

    print("=" * 70)
    print(" PROCESSING COMPLETED")
    print(f" Total Processed: {total_processed} | Success: {total_success} | Failed: {total_failed}")
    print(f" Verified Rate: {report['validation_summary']['verification_rate'] * 100:.1f}%")
    print(f" Runtime: {report['performance']['elapsed_seconds']}s | Peak RAM: {report['performance']['peak_memory_mb']} MB")
    print("=" * 70)

    if report_file:
        report_file.parent.mkdir(parents=True, exist_ok=True)
        with open(report_file, "w", encoding="utf-8") as rf:
            json.dump(report, rf, indent=2, ensure_ascii=False)
        print(f"Detailed audit report saved to: {report_file}")

    return report

def main():
    parser = argparse.ArgumentParser(description="CareBridge AI Full Dataset Batch Processor")
    parser.add_argument(
        "--data_dir",
        type=Path,
        default=PROJECT_ROOT / "h2_official_pack" / "H2_Discharge_Summary_to_Care_Plan" / "data",
        help="Path to data directory"
    )
    parser.add_argument(
        "--split",
        choices=["all", "dev", "test", "unlabelled"],
        default="all",
        help="Split to process (default: all)"
    )
    parser.add_argument("--batch_size", type=int, default=200, help="Batch progress report interval")
    parser.add_argument(
        "--out",
        type=Path,
        default=PROJECT_ROOT / "FULL_CODE" / "evaluation" / "all_2000_predictions.jsonl",
        help="Output file for generated plans"
    )
    parser.add_argument(
        "--report",
        type=Path,
        default=PROJECT_ROOT / "FULL_CODE" / "evaluation" / "dataset_processing_report.json",
        help="Output file for processing report"
    )
    parser.add_argument("--no_validate", action="store_true", help="Skip detailed 15-point validation")
    args = parser.parse_args()

    summaries_path = args.data_dir / "summaries.jsonl"
    splits_path = args.data_dir / "splits.csv"

    if not summaries_path.exists():
        print(f"Error: {summaries_path} not found", file=sys.stderr)
        sys.exit(1)

    process_dataset(
        summaries_file=summaries_path,
        splits_file=splits_path,
        output_file=args.out,
        report_file=args.report,
        split_filter=args.split,
        batch_size=args.batch_size,
        validate=not args.no_validate
    )

if __name__ == "__main__":
    main()
