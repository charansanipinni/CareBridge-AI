# CareBridge AI — Discharge Summary to Patient-Understandable Care Plan

**Team AVENGERS** | **Talent AP Mega Hackathon 2026** | **Healthcare Track H2**

> *"Clear instructions. Safer transitions home."*

---

## 1. Executive Summary & Problem Overview

Hospital discharge summaries are written by clinicians for clinicians—dense with medical acronyms, complex dosing intervals (BD, TDS, QDS), and implicit instructions. Patients and caregivers discharged home face a critical transition where misunderstanding instructions can lead to adverse drug events, preventable complications, and hospital readmissions.

**CareBridge AI** bridges this critical gap. It ingests complex hospital discharge summaries (via text, PDF, or synthetic benchmarks) and converts them into structured, simple, Class 8 readability care plans in **English** and **Telugu**.

Most importantly, CareBridge AI includes a **Deterministic Faithfulness Engine** that verifies the generated patient instructions against the raw source discharge summary before clinical discharge. It guarantees that:
- No medications are omitted or invented (zero AI hallucination).
- Doses, strengths, units, and frequencies match with 100% precision.
- Follow-up dates and relative timelines are preserved without guessing or inventing calendar dates.
- Emergency warning signs and escalation steps are preserved.
- If a source instruction is ambiguous or contradictory, it is flagged prominently as **"Needs Review"** with an amber/red alert badge. A green "Verified" badge is strictly suppressed.

---

## 2. Master Feature Checklist (P0, P1, P2 Implemented)

### P0 — Core Clinical Safety (Complete)
- [x] **Reliable Full-Stack Execution**: Concurrent Express backend (`:3001`) and Vite React frontend (`:5173`).
- [x] **Multi-Modal Document Input**: Direct text pasting, drag-and-drop document upload (PDF, TXT, MD), and built-in synthetic scenarios.
- [x] **PDF Text Extraction**: Server-side parsing with `pdf-parse` plus client-side stream fallback.
- [x] **Typed Clinical Schema**: Extracts patient ID, admission diagnosis, medications (name, strength, dose, route, frequency, meal timing, duration), warning signs, diet, activity limits, wound care, and follow-up.
- [x] **Deterministic Faithfulness Engine**: 12+ independent mathematical/text verification checks.
- [x] **Bilingual Support**: English (~Class 8 Flesch-Kincaid) and Telugu (Indic Prose Clarity Index) with clinical parameters preserved.
- [x] **Source Comparison Inspector**: Line-by-line evidence mapping between original summary sentences and simplified instructions.
- [x] **One-Page Printable Care Sheet**: Dedicated `@media print` A4 stylesheet removing web chrome with doctor signature line and emergency warning boxes.
- [x] **100% Offline Capability**: Runs autonomously in Demo Mode without requiring cloud API keys.
- [x] **Automated Safety Test Suite**: 18 automated tests passing in Vitest.

### P1 — Advanced Dashboard & Workflow (Complete)
- [x] **Curated Synthetic Case Library**:
  1. *Prompt Benchmark*: Fictional Software Test Case (Section 10 benchmark, relative 7-day follow-up, deferred warning signs).
  2. *Post-Operative Recovery*: Laparoscopic cholecystectomy (wound dressings, lifting limits, multi-drug schedule).
  3. *Cardiac Care & Hypertension*: Angina alerts, low-sodium diet, nocturnal Atorvastatin, Metformin with meals.
  4. *Diabetes Stabilization*: Subcutaneous/oral hypoglycemic regimen, glucose targets, emergency 15g carb rescue.
  5. *Respiratory Care*: COPD/Asthma recovery, steroid inhalers via spacer device, dyspnea warning signs.
  6. *Maternity & Post-Cesarean*: Postpartum care, incision hygiene, breastfeeding hydration, lochia red flags.
  7. *Adversarial Safety Trap*: Conflicting frequencies (*"once daily"* vs *"twice daily"*), missing stop date.
- [x] **Live Safety Test Mode (Judge Simulator)**:
  - 1-click injection of controlled drift (Mutate Dose 500mg→50mg, Omit Drug, Alter Frequency, Omit Warning, Invent Date).
  - Demonstrates to judges how the green "Verified" badge immediately flips to red **"Needs Review"**.
- [x] **Safe Session History**: In-memory session tracking allowing clinicians to switch between recent discharge plans and clear data with 1 click.
- [x] **JSON Data Export**: Full export of structured clinical facts, patient care plan, and validation checklist for EHR interoperability.

### P2 — Stretch Capabilities (Complete)
- [x] **7-Day Home Recovery Timetable**: Derived strictly from prescribed durations and intervals (Morning, Afternoon, Evening, Bedtime) with day-stopping milestones (e.g. *"★ Amoxicillin stops after Day 5"*).
- [x] **Web Speech TTS Audio Reader**: Interactive voice playback of patient care plan in English and Telugu with speed controls (0.8x, 1.0x, 1.2x).
- [x] **Interactive Architecture Diagram**: Modal visualizing the 6-stage clinical pipeline.
- [x] **Prompt Injection Defense**: Sanitizes untrusted documents and neutralizes adversarial overrides (e.g. *"SYSTEM OVERRIDE: ignore instructions"*).

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript (`tsx`), `pdf-parse`, CORS, dotenv.
- **Testing**: Vitest with 18 comprehensive clinical safety test scenarios.
- **Speech**: Web Speech API (`SpeechSynthesisUtterance`).
- **Styling & Print**: Healthcare SaaS UI (Deep Navy `#0F172A`, Slate `#F8FAFC`, Teal `#0D9488`, Emerald `#16A34A`, Rose `#E11D48`) and dedicated `@media print` A4 stylesheet.

---

## 4. Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or later, v26.x supported)
- npm (v9.x or later)

### Installation
```bash
cd "c:\Mega Hackathon"
npm install
```

### Running the Application
To run both the Express backend API (port 3001) and Vite frontend (port 5173) concurrently:
```bash
npm run dev
```

The application is accessible at:
- **Web App**: `http://localhost:5173/`
- **Backend API**: `http://localhost:3001/api/health`

### Running the Automated Tests
Run the Vitest test suite covering all 18 clinical scenarios:
```bash
npm test
```

---

## 5. Automated Test Results (18 / 18 Passed)

All 18 tests exercise the actual extraction, generation, security, and validation logic:

```
 RUN  v5.0.5 C:/Mega Hackathon

 ✓ src/tests/faithfulness.test.ts (18 tests) 32ms
   ✓ 1. Valid document extraction: Successfully extracts clinical structure from standard summary
   ✓ 2. Empty or unreadable input: Handles empty or minimal strings gracefully without throwing
   ✓ 3. Correct medication-name extraction: Extracts exact brand & generic drug names
   ✓ 4. Correct matching of dose and units: Preserves numeric strength and units faithfully
   ✓ 5. Missing medication detection: Flags when a prescribed medication is omitted from care plan
   ✓ 6. Unsupported medication detection: Flags hallucinated medications not present in source
   ✓ 7. Changed frequency detection: Detects altered frequency (twice daily changed to once daily)
   ✓ 8. Changed duration detection: Detects altered duration (5 days changed to 14 days)
   ✓ 9. Changed follow-up date detection: Flags invented calendar dates when source was relative
   ✓ 10. Missing warning-sign detection: Flags omitted emergency warning signs
   ✓ 11. Contradictory source instructions: Accurately detects and flags conflicting orders
   ✓ 12. Unknown fields and missing information: Preserves missing details as unresolved caveats
   ✓ 13. Telugu output with changed numerical values: Detects dosage number corruption in Telugu
   ✓ 14. AI service failure: Operates fully autonomously when external AI services are offline
   ✓ 15. Offline demo mode: All sample cases generate valid plans and reports deterministically
   ✓ 16. Print/export behavior & 7-day schedule: Derives correct Day 1 to Day 7 timetable
   ✓ 17. Malformed model output: Drift simulator modifies plan and triggers immediate validation catch
   ✓ 18. Prompt-injection defense: Neutralizes override instructions in untrusted discharge documents

 Test Files  1 passed (1)
      Tests  18 passed (18)
```

---

## 6. Live Hackathon Judge Demo Script (3-Minute Walkthrough)

1. **Introduction & Mission (25s)**:
   > *"Good morning, esteemed judges. We are Team AVENGERS presenting CareBridge AI for Healthcare Track H2. Discharge instructions are often misunderstood by patients, driving hospital readmissions. Our mission is to translate complex summaries into simple, Class 8 readability care plans in English and Telugu without clinical drift."*

2. **Benchmark Demonstration & Safe Non-Invention (45s)**:
   > *"Let us load Case 1: Standard Fictional Benchmark. Notice our two core non-invention rules:
   > 1. Follow-up was given as 'in seven days'. CareBridge AI shows 'Timing: In seven days' and alerts the patient that exact appointment date/time were not supplied. It refuses to hallucinate a calendar date.
   > 2. The source deferred warning signs. CareBridge AI did not fabricate clinical symptoms like fever or bleeding, but generated clarification questions for the surgical team."*

3. **7-Day Timetable & Audio Reader (35s)**:
   > *"Switch to the '7-Day Recovery Timetable' tab. You see Day 1 through Day 7 organized by Morning, Afternoon, Evening, and Bedtime, derived strictly from prescribed intervals. Notice on Day 5: '★ Medicine stops after today'. Click 'Play Audio' to hear the instructions read aloud word-for-word in plain English or Telugu."*

4. **Bilingual Telugu Translation (25s)**:
   > *"Switch to the 'Bilingual (EN / తెలుగు)' tab. Our Telugu translation preserves drug brand names, numerical strengths (500 mg), and schedules (రోజుకు 2 సార్లు) without translational corruption, evaluated by an Indic Prose Clarity Index."*

5. **The Safety Trap — Live Error Injection (35s)**:
   > *"Now, let's test our safety guardrails. In the Live Safety Test bar, click 'Simulate Error (Mutate Dose 500mg → 50mg)'. Watch the screen: The green 'Verified' badge instantly flips to red 'Needs Review', displaying the exact dose discrepancy and adding an action item for clinician confirmation."*

6. **1-Page Printable Care Sheet (15s)**:
   > *"Finally, click 'Print Care Sheet'. The interface transforms into a clean, clutter-free A4 document with doctor signature lines and emergency escalation steps, ready for the patient to take home."*

---

## 7. Known Limitations & Safety Disclaimers

1. **Decision Support Prototype**: CareBridge AI is an AI-assisted decision support prototype. Every document clearly instructs patients to confirm unclear instructions directly with their healthcare team.
2. **De-Identified Data**: Built and tested with synthetic data to protect patient privacy.
3. **Formulary Synonyms**: Standard clinical Latin abbreviations (PO, BD, OD, TDS, PRN) are normalized. Unrecognized local abbreviations are marked as "Unresolved" rather than guessed.

---
*Developed with clinical safety engineering by Team AVENGERS for Talent AP Mega Hackathon 2026.*
