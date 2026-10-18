# CareBridge AI — Discharge Summary to Patient-Understandable Care Plan

**Team AVENGERS** | **Talent AP Mega Hackathon 2026** | **Healthcare Track H2**

> *"Clear instructions. Safer transitions home."*

---

## 1. Executive Summary & Problem Overview

Hospital discharge summaries are written by clinicians for clinicians—dense with medical acronyms, complex dosing intervals (BD, TDS, QDS), and implicit instructions. Patients and caregivers discharged home face a critical transition where misunderstanding instructions can lead to adverse drug events, preventable complications, and hospital readmissions.

**CareBridge AI** bridges this critical gap. It ingests complex, synthetic hospital discharge summaries and converts them into structured, simple, Class 8 readability care plans in **English** and **Telugu**. 

Most importantly, CareBridge AI includes a **Deterministic Faithfulness Engine** that verifies the generated patient instructions against the raw source discharge summary before clinical discharge. It guarantees that:
- No medications are omitted or invented (zero AI hallucination).
- Doses, strengths, units, and frequencies match with 100% precision.
- Follow-up dates and relative timelines are preserved without guessing or inventing calendar dates.
- Emergency warning signs and escalation steps are preserved.
- If a source instruction is ambiguous or contradictory, it is flagged prominently as **"Needs Review"** with a red/amber alert badge. A green "Verified" badge is strictly suppressed.

---

## 2. Core Features & Architecture

### A. Step-by-Step Clinical Workflow
1. **Input Interface**:
   - One-click loading of synthetic clinical benchmark cases.
   - Text paste and drag-and-drop document upload (TXT, MD, PDF).
   - Target language selector: **English** and **తెలుగు (Telugu)**.
2. **Fact Extraction Engine (`src/core/extractor.ts`)**:
   - Typed clinical schema extracting admission diagnosis, medications (name, strength, dose, route, frequency, timing, duration), warning signs, diet instructions, activity limits, wound care, and follow-up.
   - Missing fields represented as `null`/unknown without general medical guessing.
3. **Patient-Friendly Care Plan Generator (`src/core/generator.ts`)**:
   - Generates 8 structured sections with short sentences, active voice, and numbered steps.
   - Natural, high-accuracy Telugu translation preserving brand names, numbers, and units.
4. **Deterministic Faithfulness Engine (`src/core/validator.ts`)**:
   - Deterministic rule engine performing 10+ mathematical and clinical checks.
   - Computes overall safety status: `VERIFIED_CONSISTENT` vs `NEEDS_REVIEW`.
   - Generates clinician confirmation action items for any ambiguous fields.
5. **Readability Scoring (`src/core/readability.ts`)**:
   - Calculates Flesch-Kincaid Grade Level and Flesch Reading Ease to verify ~Class 8 target.
6. **Bilingual Dual View (`src/components/TeluguDualView.tsx`)**:
   - Side-by-side or toggled view comparing English and Telugu instructions with clinical integrity verified.
7. **Line-by-Line Evidence Inspector (`src/components/SourceComparison.tsx`)**:
   - Expandable ground-truth mapping linking each generated instruction to its source sentence.
8. **1-Page Printable Patient Care Sheet (`src/components/PatientCareSheet.tsx`)**:
   - Clean, professional A4 print layout suitable for home use with zero web buttons, patient signature lines, and clear safety reminders.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript (`tsx`), CORS.
- **Testing**: Vitest automated test suite with 12 clinical safety test scenarios.
- **Styling & Print**: Modern healthcare SaaS UI (Navy `#0F172A`, Slate `#F8FAFC`, Teal `#0D9488`, Emerald `#16A34A`, Rose `#E11D48`) and dedicated `@media print` A4 stylesheet.

---

## 4. Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or later, v26.x supported)
- npm (v9.x or later)

### Installation
Clone or navigate to the repository directory:
```bash
cd "c:\Mega Hackathon"
npm install
```

### Running the Application
To start both the Express backend API (port 3001) and Vite frontend (port 5173) concurrently:
```bash
npm run dev
```

The application will be live at:
- **Web App**: `http://localhost:5173/`
- **Backend API**: `http://localhost:3001/api/health`

### Running the Automated Tests
Run the Vitest test suite covering all 12 mandatory clinical scenarios:
```bash
npm test
```

---

## 5. Environment Variables & Modes

CareBridge AI includes an `.env.example` file:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Deterministic Demo Mode (Default)
When no API key is provided, CareBridge AI runs in **Demo Mode (Deterministic)**. It uses a rule-based extraction and verification engine with 4 built-in synthetic cases. A visible **"Demo Mode"** badge is displayed in the navigation bar to maintain transparency with clinicians and hackathon judges.

---

## 6. Automated Test Results (12/12 Passed)

All 12 mandatory tests exercise the actual validation and extraction engine:

| # | Test Scenario | Status | Result |
|---|---|:---:|---|
| 1 | Correct extraction of a medicine name | Passed | Verified with `Medicine A` |
| 2 | Correct matching of dose and units | Passed | 625 mg extracted & matched |
| 3 | Detection of a missing medication | Passed | Flags omitted drug & marks `NEEDS_REVIEW` |
| 4 | Detection of an extra unsupported medication | Passed | Detects hallucinated Oxycodone as `CRITICAL` |
| 5 | Detection of a changed frequency | Passed | Catches BD changed to OD |
| 6 | Detection of a changed duration | Passed | Catches 5 days altered to 14 days |
| 7 | Detection of an invented follow-up date | Passed | Flags hallucinated calendar date when source was relative |
| 8 | Detection of omitted warning signs | Passed | Flags omitted emergency symptom |
| 9 | Handling of unknown or missing values | Passed | Flags relative 7-day follow-up without guessing |
| 10 | Translation output that changes a number | Passed | Catches corrupted dosage in Telugu view |
| 11 | Handling of contradictory source instructions | Passed | Detects conflicting frequencies in source record |
| 12 | Demo mode working without API credentials | Passed | Verified across all synthetic benchmark cases |

---

## 7. Known Limitations & Safe Guardrails

1. **Synthetic Data Focus**: Built and verified for synthetic and de-identified hospital discharge records. Does not store protected health information (PHI).
2. **Prototype Consistency Check**: Does not constitute a certified medical device. Every generated care plan carries the reminder: *"Confirm unclear instructions directly with your healthcare team before taking medications."*
3. **Complex Formulary Synonyms**: While standard route and frequency abbreviations (PO, BD, OD, TDS, PRN) are normalized, non-standard hospital jargon is flagged for clinician verification rather than resolved through speculation.

---

## 8. Deployment Guide (Obtaining a Public URL)

### Option 1: Vercel (Frontend + Serverless)
1. Push repository to GitHub.
2. Link repository to Vercel (`vercel.com`).
3. Set Build Command: `npm run build` and Output Directory: `dist`.
4. Deploy to receive an instant `https://carebridge-ai.vercel.app` URL.

### Option 2: Render / Railway (Full Stack)
1. Create a Web Service on Render (`render.com`).
2. Build Command: `npm install && npm run build`
3. Start Command: `node server/index.ts`
4. Set Environment Variables (`PORT=3001`).

---

## 9. 2-Minute Judge Demo Script

1. **Introduction**:
   - *"Respected judges, Team AVENGERS presents CareBridge AI. We address Healthcare Track H2: converting complex discharge summaries into Class 8 patient-friendly care plans without clinical drift."*
2. **Benchmark Test Case 1 (Non-Invention Rule)**:
   - Select **Case 1: Standard Fictional Demo**.
   - Point out that the follow-up is correctly identified as **"In 7 days"** without inventing a calendar date.
   - Point out that warning signs show: *"The discharge summary does not invent clinical warning signs"*, and flags them for confirmation.
   - Show the **Readability Gauge**: ~Class 8 reading level.
3. **Bilingual Telugu Demo**:
   - Click the **తెలుగు** toggle or **Bilingual (EN / తెలుగు)** tab.
   - Show natural Telugu translations with brand names, numerical doses (500 mg), and durations (5 రోజుల పాటు) preserved.
4. **Safety Trap Demonstration (Case 4)**:
   - Select **Case 4: Safety Trap & Clinical Contradiction**.
   - Show the green "Verified" badge immediately turn to a red **"Needs Review"** alert badge.
   - Show the audit engine catching contradictory dosing (*"once daily"* vs *"twice daily"*) and missing stop dates.
5. **Printable Care Sheet**:
   - Click **"Print Care Sheet"**.
   - Show the clean, clutter-free A4 patient care sheet ready for the patient to take home with doctor signature lines and emergency escalation steps.

---
*Developed with clinical safety engineering by Team AVENGERS for Talent AP Mega Hackathon 2026.*
