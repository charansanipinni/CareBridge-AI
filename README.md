# AVENGERS — H2: CareBridge AI

> **"Clear instructions. Safer transitions home."**  
> **TalentAP Mega Hackathon 2026** | Track: Healthcare | Problem: H2 (Discharge Summary to Patient-Understandable Care Plan)  
> **Team Name**: AVENGERS  

---

## What it does

When patients leave the hospital, they receive dense, technical discharge summaries packed with latin abbreviations (`T. Glycomet 500 BD PC x 1/12`), dosage shorthand, and critical warning signs. In India, missed doses, medication errors, and avoidable hospital readmissions frequently result from discharge instructions that patients and families cannot understand.

**CareBridge AI** bridges this clinical gap. It converts complex synthetic discharge summaries into structured, verified, patient-friendly care plans:
- **Plain-Language Translations**: Class-8 readability in both **English** and **Telugu (తెలుగు)**.
- **Medication Instructions**: Plain explanations of what each medicine is, how much to take, when (with food icons), how long, and what it does.
- **Red-Flag Warning Signs**: Clear, urgent indicators signaling when to return to the emergency department immediately.
- **Appointments & Diet**: Chronological follow-up appointments with departments and specific test reports to bring.
- **Faithfulness Engine**: A deterministic 15-point clinical safety engine ensuring zero dropped medicines, zero altered doses, zero fabricated instructions, and complete numerical preservation in Telugu.
- **One-Page Printable Fridge Sheet**: High-contrast, clean layout designed to hang on a patient's refrigerator.
- **Dual Perspective**: Interactive Patient View and side-by-side Clinician Audit View for healthcare professionals.

---

## How to run

### Prerequisites
- Node.js >= 18.0
- Python >= 3.10 with `numpy` and `pandas`

### 1. Web Application Setup & Launch
```bash
# Install Node dependencies (if not already installed)
npm install

# Start both Vite Frontend (port 5173) and Backend API (port 3001) concurrently
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 2. Environment Configuration
Copy `.env.example` to `.env` (optional — runs fully in deterministic offline mode if no API key is provided):
```bash
cp .env.example .env
```

---

## How to run the tests

Execute all automated unit and safety integration tests across both TypeScript and Python pipelines (77 automated tests total):

```bash
# 1. Run Python AI Pipeline Safety Tests (33/33 passing)
python -m pytest FULL_CODE/tests/test_pipeline.py

# 2. Run TypeScript UI & Clinical Faithfulness Tests (44/44 passing)
npm test
```

**Single Command to run all 77 tests:**
```bash
npm test && python -m pytest FULL_CODE/tests/test_pipeline.py
```

---

## How to generate predictions

To generate structured predictions from the dataset:

```bash
# Generate the official test submission (300 predictions) -> submission/H2_predictions.jsonl
python FULL_CODE/scripts/generate_predictions.py --split test

# Generate development predictions (200 predictions) -> FULL_CODE/evaluation/dev_predictions.jsonl
python FULL_CODE/scripts/generate_predictions.py --split dev
```

*Note on dataset location: By default, the generator expects the official H2 data in `data/` or the extracted pack folder. The script accepts `--data_dir <path>` if your data is stored in a custom path.*

---

## How to validate the submission

Run our strict official submission validator against `submission/H2_predictions.jsonl`:

```bash
# Verify official submission structure, test IDs against splits.csv, and schema compliance
python FULL_CODE/scripts/package_submission.py --team_id AVENGERS --validate_only
```

Run the official hackathon scoring evaluator against the dev set:

```bash
python FULL_CODE/evaluation/evaluate.py --submission FULL_CODE/evaluation/dev_predictions.jsonl --truth <PATH_TO_DATA>/dev_fact_key.jsonl --drug_ref FULL_CODE/config/drug_reference.csv --out FULL_CODE/evaluation/dev_score.json
```

### Official Evaluation Benchmark Results:

| Metric | Official Baseline | CareBridge AI (AVENGERS) | Impact |
| :--- | :--- | :--- | :--- |
| **PRIMARY SCORE (0-1)** | **0.5198** | **0.9922** | **+47.24% improvement** |
| **Medicine Recall** | 0.9983 | **1.0000 (100%)** | Zero dropped medicines |
| **Dose Accuracy** | 0.8500 | **1.0000 (100%)** | Zero altered doses |
| **Follow-up Date Recall** | 1.0000 | **1.0000 (100%)** | 100% calendar accuracy |
| **Stop Medicine Recall** | 1.0000 | **1.0000 (100%)** | Zero active/stop confusion |
| **English Text Coverage** | 0.9255 | **1.0000 (100%)** | 100% name-dose proximity |
| **Telugu Script Coverage**| 0.0000 | **1.0000 (100%)** | 100% script & word compliance |
| **Hard Penalties** | 79 summaries | **0 summaries (0.0%)**| Hard penalties eliminated |

---

## Architecture

```
                       +-----------------------------------+
                       |    Discharge Summary (PDF/Text)   |
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
                       | (12+ Source-to-Output Assertions) |
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

---

## AI usage

1. **AI Models & Assistants**:
   - **Antigravity Coding Assistant**: Used for full-stack architecture design, rapid iteration of deterministic regex parsers, UI polish, and evaluation harness orchestration.
   - **Deterministic Fallback Engine (Primary)**: Our core H2 prediction pipeline is deterministic, fast, offline-capable, and completely reproducible without external API dependence.
   - **LLM APIs (Optional Backend Extension)**: Configured in `server/index.ts` to support Google Gemini 1.5 Pro and OpenAI GPT-4o for natural language clinical summarization when API keys are supplied in `.env`.
2. **Model Limitations & Defenses**:
   - LLMs can suffer from hallucination and dose drift. To protect clinical safety, our architecture places a deterministic pre- and post-validation layer over all outputs. Every medicine name, dose, frequency, and appointment date is cross-checked against source facts before being rendered to patients.

---

## Pre-built and third-party code

In adherence to Hackathon Rule 12 and Participant Guidelines:
- **Pre-Built Code**: No code from past hackathons or unrelated previous projects was reused.
- **Open-Source Libraries**:
  - `react`, `react-dom`, `vite`: UI framework and build tooling (MIT License).
  - `tailwindcss`, `lucide-react`: Responsive styling and healthcare iconography (MIT License).
  - `express`, `cors`: Backend REST server (MIT License).
  - `pdf-parse`: Local PDF text extraction (MIT License).
  - `vitest`, `pytest`: Automated test runners (MIT License).
  - `pandas`, `numpy`: Data manipulation and numerical operations for evaluation (BSD License).
- **Official Problem Pack**: Includes `data/drug_reference.csv`, `data/abbreviation_glossary.csv`, and `evaluate.py` provided by TalentAP under CC BY 4.0.

---

## Clinical Safety & Responsibility Notice

> **Mandatory Healthcare Disclaimer:**  
> CareBridge AI is designed to assist patients, caregivers, and hospital discharge staff in understanding discharge instructions. It is positioned as a **clinician-assisting tool**, not a clinician-replacing diagnostic system.
> - CareBridge AI never changes a prescription, recommends new treatments, or alters dosages.
> - When clinical information is ambiguous or incomplete, the system flags the item for human clinical review rather than guessing.
> - If any instruction appears unclear or unexpected, patients are instructed to contact their doctor, nurse, or pharmacist before modifying any medication.

---

## Limitations and Future Roadmap

1. **OCR for Handwritten Notes**: The current text extraction pipeline processes digital PDFs and plain text. Future iterations will integrate specialized Indian medical handwriting OCR for handwritten discharge sheets.
2. **Additional Indic Languages**: While Telugu (`te`) and English (`en`) are fully supported and evaluated, expanding to Hindi (`hi`), Tamil (`ta`), Kannada (`kn`), and Bengali (`bn`) is a planned extension.
3. **EHR / ABDM Integration**: Connecting directly to hospital HL7/FHIR feeds and the Ayushman Bharat Digital Mission (ABDM) will enable direct handoffs to personal health records (ABHA).
