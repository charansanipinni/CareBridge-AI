# CareBridge AI — Discharge Summary to Patient-Understandable Care Plan

**Team AVENGERS** | **Talent AP Mega Hackathon 2026** | **Healthcare Track H2**

> *"Clear instructions. Safer transitions home."*

---

## 1. Executive Summary & Product Vision

Hospital discharge summaries are written by clinicians for clinicians—dense with medical acronyms, complex dosing intervals (BD, TDS, QDS), and implicit instructions. Patients and caregivers discharged home face a critical transition where misunderstanding instructions can lead to adverse drug events, preventable complications, and hospital readmissions.

**CareBridge AI** bridges this critical gap. It ingests hospital discharge summaries (via PDF, TXT, MD, or text paste) and converts them into structured, simple, Class 8 readability care plans in **English** and **Telugu**.

### Core Product Promise
> *"Make medical instructions easier to understand without changing their meaning."*

Our **Deterministic Faithfulness Engine** verifies the generated patient instructions against the raw source discharge summary before clinical discharge:
- Zero medications omitted or invented (zero AI hallucination).
- Doses, strengths, units, and frequencies match with 100% precision.
- Follow-up dates and relative timelines are preserved without guessing or inventing calendar dates.
- Emergency warning signs and escalation steps are preserved.
- If a source instruction is ambiguous or contradictory, it is flagged prominently as **"Needs Review"** with an alert banner. A green "Verified" badge is strictly suppressed.

---

## 2. Production UX & Navigation Architecture

CareBridge AI features a clean, minimal, patient-centered healthcare SaaS interface:

### Main Navigation
1. **Home**: Welcoming hero section (*"Understand Your Care. Feel More Confident at Home."*), 3-step visual guide, and core trust & safety commitments.
2. **Create Care Plan**: Guided 4-step workflow preventing cognitive overload:
   - **Step 1 — Upload Document**: Differentiated Option A (drag-and-drop PDF/TXT upload with removal/replacement) and Option B (large readable text area), plus 1-click curated clinical examples.
   - **Step 2 — Choose Language**: Large selection cards for **English** (Class 8 Plain Language) and **తెలుగు (Telugu)** with source-retention guarantees.
   - **Step 3 — Review & Generate**: Document snippet verification, target language confirmation, in-memory privacy assurance, and real 5-stage progress indicator.
   - **Step 4 — View Your Care Plan**: Clean patient-friendly layout with validation status badge, expandable/collapsible sections, and dedicated "Needs Confirmation" calls.
3. **My Care Plans**: Safe in-memory session history allowing patients and clinicians to review, download JSON records, print, or delete past plans with 1 click.
4. **How It Works**: Visual breakdown of the 6-stage clinical architecture and in-depth patient FAQs.
5. **About CareBridge**: Product mission, clinical boundaries, and Production Readiness Assessment.

### Dual Presentation Levels
- **Patient View**: Friendly, digestible outcomes (*"Matches original"*, *"Needs confirmation"*, *"Could not be verified"*) focusing on what to take, when, and emergency warning signs.
- **Professional Review View**: Complete clinical audit tables, source evidence citations, line-by-line ground truth mapping, and the live safety test drift simulator.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript (`tsx`), `pdf-parse`, CORS, dotenv.
- **Testing**: Vitest with 18 comprehensive clinical safety test scenarios.
- **Speech**: Web Speech API (`SpeechSynthesisUtterance`) with English & Telugu playback and speed controls.
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

 ✓ src/tests/faithfulness.test.ts (18 tests) 36ms
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

## 6. Security & Privacy Documentation

Please see our dedicated security and privacy standards:
- [`SECURITY.md`](./SECURITY.md) — Comprehensive explanation of prompt-injection defense, in-memory processing, zero-PHI logging, file upload caps, and production healthcare security roadmaps.
- [`PRIVACY.md`](./PRIVACY.md) — Explanation of patient data minimization, in-memory ephemeral sessions, 1-click history purging, and HIPAA/GDPR clinical review requirements.

---

## 7. Production Readiness Assessment

In compliance with healthcare safety engineering, we distinguish between website publication readiness and clinical operational readiness:

### A. Website Publication Readiness (COMPLETE)
- [x] Stable full-stack React 19 + TypeScript + Node architecture.
- [x] Responsive, accessible, mobile-first healthcare SaaS interface.
- [x] Deterministic validation engine with 18 automated tests.
- [x] Prompt-injection disarming and in-memory session protection.
- [x] Offline Demo Mode operational without external API keys or cloud dependencies.
- [x] Production build passes (`npm run build`) with zero TypeScript/bundling errors.

### B. Healthcare Operational Readiness (Roadmap for Hospital Deployment)
- [ ] Multi-center clinical trial with attending hospital physicians.
- [ ] Formal HIPAA / GDPR Business Associate Agreement (BAA) with hospital cloud providers.
- [ ] EHR integration with hospital systems via HL7 FHIR APIs (Epic, Cerner).
- [ ] SaMD (Software as a Medical Device) risk assessment and regulatory filing.
- [ ] Licensed clinical pharmacist formulary review.

---

## 8. Live Hackathon Judge Demo Script (3-Minute Walkthrough)

1. **Introduction & Mission (25s)**:
   > *"Good morning, esteemed judges. We are Team AVENGERS presenting CareBridge AI for Healthcare Track H2. Discharge instructions are often misunderstood by patients, driving hospital readmissions. Our mission is to translate complex summaries into simple, Class 8 readability care plans in English and Telugu without clinical drift."*
2. **Benchmark Demonstration & Safe Non-Invention (45s)**:
   > *"Click 'Create My Care Plan'. In Step 1, select '1. Standard Fictional Benchmark'. Notice our non-invention rules:
   > 1. Follow-up was given as 'in seven days'. CareBridge AI shows 'Timing: In seven days' and alerts the patient that exact appointment date/time were not supplied. It refuses to hallucinate a calendar date.
   > 2. The source deferred warning signs. CareBridge AI did not fabricate clinical symptoms like fever or bleeding, but generated clarification questions for the surgical team."*
3. **7-Day Timetable & Audio Reader (35s)**:
   > *"In Step 4, view the '7-Day Recovery Timetable' tab. You see Day 1 through Day 7 organized by Morning, Afternoon, Evening, and Bedtime, derived strictly from prescribed intervals. Notice on Day 5: '★ Medicine stops after today'. Click 'Play Audio' to hear the instructions read aloud word-for-word in plain English or Telugu."*
4. **Bilingual Telugu Translation (25s)**:
   > *"Switch to the 'Bilingual (EN / తెలుగు)' tab. Our Telugu translation preserves drug brand names, numerical strengths (500 mg), and schedules (రోజుకు 2 సార్లు) without translational corruption, evaluated by an Indic Prose Clarity Index."*
5. **The Safety Trap — Live Error Injection (35s)**:
   > *"Now switch to 'Professional Review View'. In the Live Safety Test bar, click 'Simulate Error (Mutate Dose 500mg → 50mg)'. Watch the screen: The green 'Verified' badge instantly flips to red 'Needs Review', displaying the exact dose discrepancy and adding an action item for clinician confirmation."*
6. **1-Page Printable Care Sheet (15s)**:
   > *"Finally, click 'Print Care Sheet'. The interface transforms into a clean, clutter-free A4 document with doctor signature lines and emergency escalation steps, ready for the patient to take home."*

---
*Developed with clinical safety engineering by Team AVENGERS for Talent AP Mega Hackathon 2026.*
