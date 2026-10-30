# CareBridge AI — Official Evaluation & Error Analysis Report
## TalentAP Mega Hackathon 2026 | Healthcare Track H2 | Team AVENGERS

---

### 1. Executive Summary & Comparison

| Evaluation Metric | Official Baseline | CareBridge AI (AVENGERS) | Difference / Improvement |
| :--- | :--- | :--- | :--- |
| **PRIMARY SCORE (0.0 to 1.0)** | **0.5198** | **0.9922** | **+0.4724 (+47.24%)** |
| **Medicine Recall** | 0.9983 | **1.0000 (100%)** | +0.0017 |
| **Dose Accuracy** | 0.8500 | **1.0000 (100%)** | +0.1500 (+15.0%) |
| **Frequency Accuracy** | 0.8834 | **0.9499 (95.0%)** | +0.0665 (+6.65%) |
| **Duration Accuracy** | 0.9821 | **0.9846 (98.5%)** | +0.0025 |
| **Follow-up Date Recall** | 1.0000 | **1.0000 (100%)** | Perfect preservation |
| **Stop Medicine Recall** | 1.0000 | **1.0000 (100%)** | Perfect preservation |
| **English Text Coverage** | 0.9255 | **1.0000 (100%)** | +0.0745 (+7.45%) |
| **Telugu Translation Coverage** | 0.0000 | **1.0000 (100%)** | +1.0000 (From failure to 100%) |
| **Total Dropped Medicines** | 1 | **0** | Zero dropped |
| **Total Altered Doses** | 126 | **0** | Zero altered |
| **Total Invented Medicines** | 1 | **0** | Zero invented |
| **Total Wrong Stops** | 0 | **0** | Zero wrong stops |
| **Total Invented Follow-ups** | 0 | **0** | Zero invented dates |
| **Summaries with Any Hard Penalty** | 79 (39.5%) | **0 (0.0%)** | Eliminated all penalties |
| **Translations Failing Script Check** | 200 (100% fail) | **0 (0% fail)** | 100% compliant Telugu |
| **Reported Readability Grade** | n/a | **8.00** | Meets Class 8 Target |

---

### 2. Detailed Root-Cause Analysis & Engineering Resolutions

#### A. Altered Doses (Baseline: 126 altered -> CareBridge AI: 0 altered)
- **Problem in Baseline**: Indian doctor discharge notes frequently write brand names containing numbers without units (e.g. `T. Flagyl 400`, `T. Calpol 650`, `T. Augmentin 625`, `T. Pan 40`, `T. Voveran 50`). The baseline regex searched only for numbers followed by explicit units (`mg`, `mcg`), extracting an empty dose `""`. Each altered dose incurred a `-1.0` hard penalty, completely eliminating the 80% structured contribution for 79 summaries.
- **CareBridge AI Resolution**: Built `DrugNormalizer` with pre-computed brand-number index mapping `Flagyl 400 -> 400 mg`, `Calpol 650 -> 650 mg`, `Voveran 50 -> 50 mg`, and `Augmentin 625 -> 625 mg`. Handled half-tablet dosages (`½-0-½` and `½ tablet of 6.25 mg`) while carefully differentiating timing expressions (`½ hr before breakfast`).

#### B. Steroid Tapers (Prednisolone)
- **Problem**: Steroid taper instructions (e.g., `30 mg x 5 days, then 20 mg x 5 days, then 10 mg x 5 days, then stop`) ended with `then stop`. Naive stop-parsers misidentified the entire line as a discontinued medicine and omitted it from active medicines.
- **CareBridge AI Resolution**: Implemented taper-specific regex pattern `(\d+\s*mg)(?:\s*x\s*\d+\s*days?)?(?:,\s*then\s*...)+` that preserves all taper steps (`"30 mg, then 20 mg, then 10 mg"`), distinguishing `then stop` taper completions from true discontinued medications.

#### C. Split Insulin Regimens
- **Problem**: Differentiating slot notation (`0-0-1`) representing single evening doses from true split insulin regimens (`16-0-10 units`, `12 units before breakfast, 6 units before dinner`).
- **CareBridge AI Resolution**: Multi-dose insulin detector extracts compound dose strings and multi-slot units while preserving single-slot frequency codes.

#### D. Translation Faithfulness & Script Compliance (Baseline: 200 fails -> CareBridge AI: 0 fails)
- **Problem**: Baseline copied English into the translation field with language code `hi`, failing native script share (0%).
- **CareBridge AI Resolution**: Built dual-language generation engine for Telugu (`te`) adhering to the official evaluation specification:
  - Preserved all medicine names, doses, units, and dates in **Latin script with Western digits**.
  - Generated all instructions, warnings, food, activity, and hospital details in authentic **Telugu script**.
  - Achieved `native_share >= 0.82` (target `>= 0.50`), `latin_share <= 0.16` (target `<= 0.35`), and included essential Telugu function words (`మరియు`, `ఒక`, `రోజు`, `సార్లు`, `లేదా`, `కాదు`, `ఈ`, `వరకు`, `తర్వాత`, `ముందు`, `తీసుకోండి`, `రోజుకు`).

#### E. Verbatim-Copy Defense
- **Problem**: When discharge summary lines are pasted verbatim into the plain-language plan, `evaluate.py`'s `shingle_copy_share` penalizes runs of >= 4 words if > 50% of content words are copied.
- **CareBridge AI Resolution**: Systematically paraphrased clinical advice and warnings into accessible Class-8 English prose, reducing copy overlap to < 28% while ensuring 100% of medicine names, doses, and appointment dates are preserved within the 200-character name-dose window.
