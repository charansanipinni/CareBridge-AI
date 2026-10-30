#!/usr/bin/env python3
"""Prediction Generator for TalentAP Mega Hackathon 2026 - Problem H2.
Team: AVENGERS | CareBridge AI

Usage:
    python FULL_CODE/scripts/generate_predictions.py --split test [--data_dir PATH] [--out PATH]
    python FULL_CODE/scripts/generate_predictions.py --split dev
"""

import argparse
import sys
from pathlib import Path

# Add project root and FULL_CODE to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
FULL_CODE_DIR = SCRIPT_DIR.parent
PROJECT_ROOT = FULL_CODE_DIR.parent
sys.path.insert(0, str(FULL_CODE_DIR))

from ai_pipeline.submission_generator import SubmissionGenerator

def main():
    parser = argparse.ArgumentParser(description="Generate H2 Care Plan Predictions")
    parser.add_argument("--split", choices=["dev", "test"], default="test", help="Dataset split (dev or test)")
    parser.add_argument(
        "--data_dir",
        type=Path,
        default=PROJECT_ROOT / "h2_official_pack" / "H2_Discharge_Summary_to_Care_Plan" / "data",
        help="Path to data directory containing summaries.jsonl and split CSVs",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Output path for JSONL predictions. Defaults to submission/H2_predictions.jsonl for test",
    )
    args = parser.parse_args()

    if args.out is None:
        if args.split == "test":
            args.out = PROJECT_ROOT / "submission" / "H2_predictions.jsonl"
        else:
            args.out = PROJECT_ROOT / "FULL_CODE" / "evaluation" / "dev_predictions.jsonl"

    if not args.data_dir.exists():
        # Fallback to local data/ folder if user placed it there
        fallback = PROJECT_ROOT / "data"
        if fallback.exists():
            args.data_dir = fallback
        else:
            print(f"Error: Data directory not found at {args.data_dir} or {fallback}", file=sys.stderr)
            sys.exit(1)

    print(f"Generating predictions for split '{args.split}' from {args.data_dir} -> {args.out}...")
    generator = SubmissionGenerator(config_dir=FULL_CODE_DIR / "config")
    n = generator.generate_split(args.data_dir, args.split, args.out)
    print(f"Successfully generated {n} predictions in {args.out}")

if __name__ == "__main__":
    main()
