# CareBridge AI — Methodology & Clinical Engineering
## Challenge H2: Discharge Summary to Patient-Friendly Care Plan
### Team: AVENGERS | TalentAP Mega Hackathon 2026

---

## 1. Problem Framing & Clinical Rationale

In Indian district hospitals such as the fictional Chandrapuri District Hospital, patients receive discharge summaries with dense Latin abbreviations (`T. Glycomet 500 BD PC x 1/12`), compact dosage grids, and implicit instructions. Patients and their caregivers often cannot read English or decipher medical shorthand. Avoidable complications, missed doses, and emergency readmissions frequently follow.

CareBridge AI solves this challenge through a **clinician-assisting pipeline** that prioritizes **clinical faithfulness above linguistic fluency**:
- Never add, drop, or alter a doctor's instruction.
- Never guess or infer missing clinical details.
- Always provide a verifiable escalation path for ambiguous orders.

---

## 2. Methodology by Component

### 2.1. Dataset Processing & Audit
- Stream-processed all 2,000 synthetic summaries with memory-efficient batching.
- Reconciled against official `splits.csv`, `dev_ids.csv`, and `test_ids.csv`.
- Mapped hospital clinical departments (`Obstetrics & Gynaecology`, `General Surgery`, `Orthopaedics`, `Cardiology`, `Pulmonology`, `General Medicine`) to the 5 official condition groups:
  - `postop` (470 records, 23.5%)
  - `cardiac` (420 records, 21.0%)
  - `respiratory` (400 records, 20.0%)
  - `diabetes` (380 records, 19.0%)
  - `maternity` (330 records, 16.5%)
- Verified zero duplicate IDs, zero missing records, and zero `general_medical` anomalies.

### 2.2. Medication Extraction & Entity Normalization
- Pre-indexed `drug_reference.csv` (81 entries) and `abbreviation_glossary.csv` (257 entries).
- Resolved brand-number tokens: `Flagyl 400` $\rightarrow$ `Metronidazole 400 mg`.
- Isolated hospital-only drugs (e.g. `Inj. Ceftriaxone 1 g IV BD`) to prevent inclusion in outpatient care plans.
- Segregated `stop_medicines` (e.g. `Stop Tab. Glimepiride 2 mg`) from active discharge regimens.

### 2.3. Handling Complex Clinical Edge Cases
- **Half-Tablet Formulations**: Differentiates fractional doses (`½ tab of 25 mg`) from meal timings (`½ hr before meals`).
- **Steroid Tapers**: Preserves complete taper sequences (`30 mg x 5 days, then 20 mg x 5 days, then 10 mg x 5 days, then stop`).
- **Split Insulin Protocols**: Preserves multi-meal slot dosing (`16 units before breakfast, 10 units before dinner`).
- **SOS Regimens**: Maintains prn triggers ("for severe fever") and daily ceiling limits.

### 2.4. Dual-Language Translation Methodology
- Followed the official hackathon translation convention:
  - **Latin Script & Western Digits**: Retained for all drug names, dose values, units, and dates to ensure pharmaceutical clarity and automated verification.
  - **Native Telugu Script**: Used for instructional prose, timing guidelines, warning signs, food advice, and appointment descriptions.
  - **Evaluator Compliance**: Achieved $\ge 82\%$ native script share, $\le 16\%$ Latin word share, and included mandatory Telugu function words (`మరియు`, `రోజుకు`, `తీసుకోండి`, `సార్లు`, `తర్వాత`, `ముందు`).

### 2.5. Readability & One-Page Fridge Sheet
- Tuned plain-language generation to Class-8 reading level (Flesch-Kincaid Grade Level: **8.00**).
- Implemented high-contrast, icon-supported one-page printable care sheet for refrigerator display.

---

## 3. Official Evaluation Scoring Reproduction

CareBridge AI was benchmarked against the official Chandrapuri District Hospital development split (200 summaries) using the official `evaluate.py` harness:

$$\text{Score} = 0.80 \times \max(0, \text{Structured} - \text{Penalties}) + 0.20 \times \text{Text}$$

### Performance Metrics vs. Baseline

| Evaluation Component | Official Baseline | CareBridge AI | Delta |
| :--- | :--- | :--- | :--- |
| **PRIMARY SCORE (0.0 to 1.0)** | **0.5198** | **0.9922 (99.22%)** | **+0.4724 (+47.24%)** |
| Medicine Recall | 0.9983 | **1.0000 (100%)** | +0.0017 |
| Dose Accuracy | 0.8500 | **1.0000 (100%)** | +0.1500 (+15.0%) |
| Frequency Accuracy | 0.8834 | **0.9499 (95.0%)** | +0.0665 (+6.65%) |
| Duration Accuracy | 0.9821 | **0.9846 (98.5%)** | +0.0025 |
| Follow-up Date Recall | 1.0000 | **1.0000 (100%)** | Perfect (100%) |
| Stop Medicine Recall | 1.0000 | **1.0000 (100%)** | Perfect (100%) |
| English Text Coverage | 0.9255 | **1.0000 (100%)** | +0.0745 |
| Telugu Translation Coverage | 0.0000 (failed) | **1.0000 (100%)** | +1.0000 |
| Hard Penalties Count | 79 (39.5%) | **0 (0.0%)** | Eliminated all penalties |
