# AVENGERS — H2: CareBridge AI
## Discharge Summary to Patient-Understandable Care Plan
> **"Clear instructions. Safer transitions home."**  
> **TalentAP Mega Hackathon 2026** | Track: Healthcare | Problem: H2  
> **Team Name**: AVENGERS  

---

## 1. Project Overview

**CareBridge AI** is an assistive clinical intelligence platform developed by Team AVENGERS for the TalentAP Mega Hackathon 2026 (Problem H2). It bridges the communication gap between hospital discharge desks and patient households by converting dense, technical discharge summaries into faithful, structured, patient-friendly care plans in English and Telugu (తెలుగు), accompanied by a high-contrast printable one-page "fridge sheet" and an interactive clinical review interface.

---

## 2. Problem Being Solved

Upon hospital discharge, patients frequently receive discharge summaries packed with Latin medical abbreviations (`T. Glycomet 500 BD PC x 1/12`), dosage grids, and implicit warning signs. In Indian district hospitals such as the fictional Chandrapuri District Hospital:
- Patients and families struggle to decipher medical jargon, resulting in missed doses, doubled dosages, and timing reversals.
- Critical red-flag emergency symptoms are overlooked, leading to preventable complications and readmissions.
- Instructions are predominantly written in English, creating severe language barriers for non-English literate households.

---

## 3. Proposed Solution

CareBridge AI transforms complex clinical summaries into accessible, structured care plans with zero hallucination:
- **Plain-Language Dual-Language Delivery**: Class-8 readability in English and authentic Telugu script.
- **Pharmaceutical Fidelity**: Exact medication names, dosages, units, and calendar dates preserved in Latin script and Western digits.
- **Red-Flag Warning Signs**: Clear, urgent indicators signaling when to return to the emergency casualty department immediately.
- **One-Page Printable Fridge Sheet**: High-contrast, clean layout formatted for refrigerator display.
- **Dual Perspective**: Interactive Patient View and side-by-side Clinician Audit View.

---

## 4. System Architecture

```
                       +-----------------------------------+
                       |    Discharge Summary (PDF/Text)   |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------------------------+
                       |    Security & Input Sanitizer     |
                       |    - Prompt injection defense     |
                       |    - Zero-PHI logging policy      |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------------------------+
                       |         Section Detector          |
                       |  (Rx, Stops, Advice, Warning, FU) |
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------------------------+
                       |    Medication & Dose Extractor    |
                       | - Tapers (Prednisolone)           |
                       | - Split Insulin (16-0-10 units)   |
                       | - Half-Tablets (12.5 mg / 25 mg)  |
                       | - Brand-Number Mapping (Flagyl 400|
                       +-----------------+-----------------+
                                         |
                                         v
                       +-----------------------------------+
                       |    Clinical Knowledge Resolver    |
                       | - drug_reference.csv (81 drugs)   |
                       | - abbreviation_glossary.csv (257) |
                       +-----------------+-----------------+
                                         |
                    +--------------------+--------------------+
                    |                                         |
                    v                                         v
+-----------------------------------+     +-----------------------------------+
|      English Plan Generator       |     |      Telugu Translation Engine    |
| - Class 8 Readability             |     | - Latin script for drug names     |
| - Name + Dose within 200 chars    |     | - Western digits for doses & dates|
| - Verbatim copy share < 28%       |     | - Native Telugu script >= 82%     |
+-------------------+---------------+     +-------------------+---------------+
                    |                                         |
                    +--------------------+--------------------+
                                         |
                                         v
                       +-----------------------------------+
                       |   Deterministic Safety Engine     |
                       | (16 Source-to-Output Assertions)  |
                       +-----------------+-----------------+
                                         |
                    +--------------------+--------------------+
                    |                                         |
                    v                                         v
+-----------------------------------+     +-----------------------------------+
|     Interactive Web App & UI      |     |     Official JSONL Submission     |
| - 4-Step Patient Wizard           |     | - 300 test predictions            |
| - Clinician Review Mode           |     | - Strict schema validation        |
| - Printable Fridge Sheet          |     | - submission/H2_predictions.jsonl |
+-----------------------------------+     +-----------------------------------+
```

Detailed architecture specifications are documented in [`documentation/architecture.md`](documentation/architecture.md).

---

## 5. Technology Stack

- **AI Pipeline & Backend**: Python 3.12, NumPy 1.24+, Pandas 2.0+, Pytest 9.2+.
- **Web Server**: Node.js 20+, Express 5, TypeScript 5.8, tsx.
- **Frontend Application**: React 19, Vite 8, Tailwind CSS 4, Lucide Icons.
- **Verification & Linters**: Vitest 5.0, Oxlint.
- **Execution Mode**: 100% offline-capable deterministic safety engine (with optional LLM enhancement via Gemini / OpenAI when configured).

---

## 6. Dataset Information

The Chandrapuri District Hospital synthetic dataset comprises **2,000 discharge summaries**:
- **Development (`dev`)**: 200 summaries with public answer keys (`dev_fact_key.jsonl`).
- **Test (`test`)**: 300 summaries with hidden answer keys; required for official submission.
- **Unlabelled (`unlabelled`)**: 1,500 summaries for evaluation, testing, and self-training.
- **Reference References**: 81 entries in `drug_reference.csv`, 257 medical abbreviations in `abbreviation_glossary.csv`, and 50 gold-standard reference examples in `data/gold_examples/`.

All 2,000 summaries are accounted for with zero missing records, zero duplicate IDs, and zero malformed entries.

---

## 7. Data-Processing Methodology

1. **Streaming Ingestion**: Stream-processes JSON Lines summaries with constant low memory overhead (< 1.5 MB RAM).
2. **Clinical Department & Condition Group Mapping**:
   Maps hospital clinical departments and primary diagnoses to the 5 official condition groups:
   - `postop`: 470 records (23.5%)
   - `cardiac`: 420 records (21.0%)
   - `respiratory`: 400 records (20.0%)
   - `diabetes`: 380 records (19.0%)
   - `maternity`: 330 records (16.5%)
   Achieves 100.0% agreement with dev ground truth, eliminating artificial fallback categories.

Detailed audit results are documented in [`DATASET_AUDIT_REPORT.md`](DATASET_AUDIT_REPORT.md).

---

## 8. Medication Extraction Pipeline

- **Brand-to-Generic Resolution**: Pre-indexed index resolving Indian brands (`Calpol`, `Glycomet`, `Pan`, `Shelcal`, `Augmentin`) to canonical generics.
- **Brand-Number Implied Strengths**: Resolves dosages with omitted units (`T. Pan 40` $\rightarrow$ `Pantoprazole 40 mg`).
- **Hospital-Only Drug Isolation**: Excludes acute inpatient medications (`Inj. Ceftriaxone`, `Inj. Cefazolin`) from outpatient home care plans.
- **Discontinued Drug Isolation**: Discontinued orders (`"Stop Tab. Glimepiride"`) are placed strictly in `stop_medicines` and never in active discharge medicines.
- **Complex Regimens**: Intact preservation of steroid tapers (`Prednisolone`), split insulin regimens (`Mixtard 16-0-10 units`), half-tablets (`½-0-½`), and SOS limits.

---

## 9. English and Telugu Generation

### Plain-Language English
- Class-8 readability target (Flesch-Kincaid Grade Level: **8.00**).
- Verbatim copy share restricted to < 28% (avoids shingle-copy penalties).
- Ensures medication names and doses are located within the 200-character proximity window.

### Telugu Localization (`te`)
- Adheres strictly to the official translation convention:
  - **Latin script and Western digits**: Maintained for all drug names, dose amounts, units, and calendar dates.
  - **Native Telugu script**: Used for instructional prose, food guidelines, warnings, and visit descriptions.
  - Meets all evaluation constraints: native script share $\ge 82\%$, Latin word share $\le 16\%$, and contains required Telugu function words (`మరియు`, `రోజుకు`, `తీసుకోండి`, `సార్లు`, `తర్వాత`, `ముందు`).

---

## 10. Clinical Safety and Human-Review Mechanism

CareBridge AI operates under a **clinician-assisting framework with a human-in-the-loop**:
- **16-Point Deterministic Validator**: Verifies source grounding for medication names, doses, units, frequencies, durations, timings, stops, and follow-up dates.
- **Clinician Review Mode**: Flags genuine ambiguities (such as complex steroid tapers or unlisted baseline drugs) on a dedicated review screen before patient release.
- **Zero Hard Penalties**: Eliminates dropped medications, altered doses, invented drugs, wrong stops, and invented dates.

---

## 11. Evaluation Methodology

Evaluated using the official hackathon scoring harness (`evaluate.py`):
$$\text{Score} = 0.80 \times \max(0, \text{Structured} - \text{Penalties}) + 0.20 \times \text{Text}$$
- **Structured Part (80%)**: Evaluates medicine recall (0.30), dose exactness (0.20), frequency exactness (0.15), duration exactness (0.10), follow-up date recall (0.15), and stop recall (0.10). Hard penalties subtract 1.0 per error.
- **Text Part (20%)**: Evaluates free-text faithfulness, proximity windows, copy share, and script compliance across English and Telugu (0.50 each).

---

## 12. Actual Evaluation Results

Reproduced on the 200 public development summaries (`data/dev_fact_key.jsonl`):

| Evaluation Metric | Official Baseline | CareBridge AI | Improvement |
| :--- | :--- | :--- | :--- |
| **PRIMARY SCORE (0.0 to 1.0)** | **0.5198** | **0.9922 (99.22%)** | **+0.4724 (+47.24%)** |
| Medicine Recall | 0.9983 | **1.0000 (100%)** | +0.0017 |
| Dose Accuracy | 0.8500 | **1.0000 (100%)** | +0.1500 (+15.0%) |
| Frequency Accuracy | 0.8834 | **0.9499 (95.0%)** | +0.0665 (+6.65%) |
| Duration Accuracy | 0.9821 | **0.9846 (98.5%)** | +0.0025 |
| Follow-up Date Recall | 1.0000 | **1.0000 (100%)** | Perfect (100%) |
| Stop Medicine Recall | 1.0000 | **1.0000 (100%)** | Perfect (100%) |
| English Text Coverage | 0.9255 | **1.0000 (100%)** | +0.0745 |
| Telugu Translation Coverage | 0.0000 (fail) | **1.0000 (100%)** | +1.0000 |
| Hard Penalty Summaries | 79 (39.5%) | **0 (0.0%)** | Eliminated all penalties |
| Reported Readability Grade | n/a | **8.00** | Meets Class 8 Target |

Detailed machine-readable scores are available in [`FINAL_EVALUATION_REPORT.json`](FINAL_EVALUATION_REPORT.json).

---

## 13. Installation Instructions

### Prerequisites
- Node.js $\ge 18.0$
- Python $\ge 3.10$

### Setup
```bash
# 1. Install Node dependencies
npm install

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Environment setup (optional - offline deterministic mode works by default)
cp .env.example .env
```

---

## 14. Execution Instructions

### Launch Web Application
```bash
# Starts both Express backend API (port 3001) and Vite frontend (port 5173) concurrently
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### Generate Submission Predictions
```bash
# Generate the official 300 test predictions -> submission/H2_predictions.jsonl
python FULL_CODE/scripts/generate_predictions.py --split test

# Generate development predictions -> FULL_CODE/evaluation/dev_predictions.jsonl
python FULL_CODE/scripts/generate_predictions.py --split dev
```

### Validate Submission
```bash
# Validate strict JSONL format, test IDs, and official schema
python FULL_CODE/scripts/validate_submission.py submission/H2_predictions.jsonl
```

---

## 15. Testing Instructions

Execute all 97 automated tests across Python and TypeScript suites:

```bash
# 1. Run Python AI Pipeline Safety Tests (53/53 passing)
python -m pytest FULL_CODE/tests/test_pipeline.py -v

# 2. Run TypeScript UI & Clinical Faithfulness Tests (44/44 passing)
npm test

# 3. Full test command
npm test && python -m pytest FULL_CODE/tests/test_pipeline.py
```

Detailed test logs and evaluator scenario coverage are documented in [`TEST_RESULTS.md`](TEST_RESULTS.md).

---

## 16. Known Limitations

1. **Unstated Baseline Medications**: Summaries noting *"Continue previous medications as before"* without naming drugs are reported verbatim; specific medications are never guessed.
2. **Handwritten Discharge Notes**: Current ingestion supports digital PDFs and plain text; handwritten notes require upstream OCR.
3. **Spoken Audio**: Visual and printable sheets are fully implemented; speech synthesis remains a browser-assisted extension.

Detailed limitations and deployment guardrails are documented in [`documentation/limitations.md`](documentation/limitations.md).
