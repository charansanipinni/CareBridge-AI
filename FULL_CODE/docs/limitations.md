# CareBridge AI — Technical & Clinical Limitations
## Challenge H2: Discharge Summary to Patient-Friendly Care Plan
### Team: AVENGERS | TalentAP Mega Hackathon 2026

---

## 1. Scope & Clinical Boundaries

CareBridge AI is designed strictly as a **clinician-assisting decision support tool**. It is **not** an autonomous diagnostic system or independent prescribing engine.

In adherence to hackathon rules and healthcare ethics guidelines:
1. **Human-in-the-Loop Mandate**: Every generated care plan must be reviewed and signed off by a licensed doctor or discharge nurse before delivery to a patient.
2. **Synthetic Data Context**: All 2,000 discharge summaries, UHIDs, patient names, and physician signatures are synthetic. Real generic and Indian brand names are used solely for realistic task fidelity.
3. **No EHR Access**: The system operates exclusively on the uploaded discharge summary document. It does not have access to real-time laboratory systems, outpatient EHRs, or longitudinal pharmacy dispensing records.

---

## 2. Technical & Algorithmic Limitations

### 2.1. Unstated or Implicit Baseline Medications
- When a discharge summary notes *"Continue previous medications for hypothyroidism as before"* without naming the specific drugs, CareBridge AI faithfully reports this instruction verbatim. It deliberately does not guess which brand, dose, or strength the patient was previously taking.

### 2.2. Highly Non-Standard Shorthand Variations
- While the system integrates all 257 abbreviations from `abbreviation_glossary.csv`, highly idiosyncratic, non-standard local abbreviations created by individual clinicians that are absent from the glossary are not expanded. They are presented verbatim with an audit warning.

### 2.3. Narrative-Embedded Medication Orders
- Medications listed in narrative prose within the "Hospital Course" section rather than the "Discharge Advice / Rx" section are treated conservatively:
  - If clearly marked as given in hospital (e.g. `Inj. Cefazolin periop`), they are excluded from the discharge care plan.
  - If phrased ambiguously in narrative text, the system flags the summary for human clinician audit.

### 2.4. Spoken Audio Generation
- The current build provides high-contrast visual and printable outputs. Spoken audio synthesis (TTS) remains a stretch feature that relies on browser-native SpeechSynthesis or cloud TTS APIs.

---

## 3. Recommended Safety & Deployment Guardrails

1. **Dual Perspective View**: Healthcare staff must utilize the Clinician Audit View to verify medication extractions and inspect any review flags before printing.
2. **Emergency Disclaimer**: Every printed sheet clearly displays the hospital 24/7 casualty telephone number and explicitly states: *"In case of worsening chest pain, severe breathlessness, high fever, or sudden bleeding, report immediately to Casualty."*
3. **Traceability**: All extracted dosages, frequencies, and follow-up dates are traceable back to the exact source text coordinates in the original summary.
