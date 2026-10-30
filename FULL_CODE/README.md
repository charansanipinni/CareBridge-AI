# CareBridge AI — FULL_CODE Documentation
## TalentAP Mega Hackathon 2026 | Healthcare Track H2 | Team AVENGERS

This directory contains the complete source code, AI prediction pipeline, evaluation suite, test harness, configuration, and documentation for **CareBridge AI**.

---

### Directory Layout

```
FULL_CODE/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS Web Application
│   ├── src/              # UI components, wizard, timetable, TTS audio, safety engines
│   ├── public/           # Static assets, branding, and icons
│   ├── index.html        # Single-page application entry HTML
│   ├── package.json      # Node.js dependencies & scripts
│   └── vite.config.ts    # Vite bundler configuration
├── backend/              # Express + TypeScript Server
│   └── server/index.ts   # Secure REST endpoints, PDF extraction, health check
├── ai_pipeline/          # Modular Python Clinical Information Extraction Pipeline
│   ├── summary_parser.py         # Central parsing coordinator
│   ├── section_detector.py       # Clinical heading & section detection
│   ├── medication_extractor.py   # Table & list medication parser
│   ├── drug_normalizer.py        # Indian generic-brand lookup & strength matcher
│   ├── abbreviation_resolver.py  # Medical acronym dictionary (257 entries)
│   ├── dose_parser.py            # Tapers, split insulin, half tablets, puffs & units
│   ├── frequency_parser.py       # Frequency & slot-notation interpreter
│   ├── duration_parser.py        # Duration normalizer (x 5/7, x 2/52, lifelong, till review)
│   ├── date_extractor.py         # Day-first Indian calendar date normalizer (YYYY-MM-DD)
│   ├── advice_extractor.py       # Diet, activity, wound care, and warning red flags
│   ├── translation_service.py    # Compliant Telugu generator (Latin script drug preservation)
│   ├── readability_service.py    # English Flesch-Kincaid Class-8 grade evaluator
│   ├── faithfulness_validator.py # Pre-submission deterministic safety checks
│   └── submission_generator.py   # High-throughput batch JSONL generator
├── evaluation/           # Official Evaluator & Benchmark Reports
│   ├── evaluate.py               # Official hackathon scoring engine
│   ├── baseline.py               # Official benchmark baseline
│   ├── dev_score.json            # Official evaluate.py scoring result (Score: 0.9922)
│   └── error_analysis.md         # Comprehensive comparison & error analysis report
├── tests/                # Automated Test Suites (31 total passing tests)
│   └── test_pipeline.py          # Pytest unit tests for all clinical pipeline edge cases
├── scripts/              # Prediction Generation & Validation CLI
│   ├── generate_predictions.py   # CLI to generate dev or test predictions
│   └── validate_submission.py    # Strict submission validator (300/300 check)
├── config/               # Settings & Clinical References
│   ├── config.yaml               # Master pipeline configuration & limits
│   ├── drug_reference.csv        # 81 Indian reference drugs, brands & strengths
│   └── abbreviation_glossary.csv # 257 clinical abbreviations
├── prompts/              # Centralized Prompt Templates
│   ├── extraction_prompt.txt     # System prompt for clinical information extraction
│   ├── translation_prompt_te.txt # Telugu translation prompt with Latin script constraints
│   └── simplification_prompt_en.txt # Plain-English Class 8 simplification prompt
├── .env.example          # Safe environment variable template (zero secrets)
└── README.md             # This documentation file
```

---

### Command Quick Reference

1. **Run AI Pipeline Tests**:
   ```bash
   python -m pytest FULL_CODE/tests/test_pipeline.py
   ```

2. **Generate Test Predictions**:
   ```bash
   python FULL_CODE/scripts/generate_predictions.py --split test
   ```

3. **Validate Submission**:
   ```bash
   python FULL_CODE/scripts/validate_submission.py submission/H2_predictions.jsonl
   ```

4. **Evaluate Dev Split**:
   ```bash
   python FULL_CODE/scripts/generate_predictions.py --split dev
   python FULL_CODE/evaluation/evaluate.py --submission FULL_CODE/evaluation/dev_predictions.jsonl --truth <PATH_TO_DATA>/dev_fact_key.jsonl --drug_ref FULL_CODE/config/drug_reference.csv
   ```
