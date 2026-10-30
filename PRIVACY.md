# CareBridge AI — Privacy Policy & Patient Confidentiality Standards

**Product**: CareBridge AI  
**Team**: AVENGERS  
**Event**: Talent AP Mega Hackathon 2026 (Healthcare Track H2)  
**Classification**: Prototype Privacy Policy & Patient Rights

---

## 1. Our Privacy Philosophy

CareBridge AI was built with a privacy-by-design architecture:
> *"Your health information belongs to you. Simplifying medical instructions should never compromise patient confidentiality."*

We strictly adhere to the principle of data minimization: we collect and process only the minimal information required to generate a patient-understandable discharge care plan.

---

## 2. What Data We Process

When you use CareBridge AI, you may submit:
- A hospital discharge summary document (PDF, TXT, MD, or pasted text).
- Language preference (English or Telugu).

### What We Do NOT Collect:
- We do not require account creation, passwords, phone numbers, or credit cards.
- We do not run third-party advertising trackers, social media pixels, or behavioral analytics cookies.
- We do not sell, rent, or trade patient health data.

---

## 3. How Data is Handled During Your Session

1. **In-Memory Ephemeral Analysis**: Your document is held in active memory solely for the time necessary to extract clinical facts, generate plain-language instructions, and run deterministic safety tests.
2. **Local Session Control**: When you view your care plan or review past plans under "My Care Plans", that data is stored in your current browser session only.
3. **One-Click Deletion**: Clicking "Clear Session Plans" or "Delete" immediately purges the plan from browser memory.
4. **No Permanent Remote Storage**: In its default configuration, CareBridge AI does not save patient discharge summaries or extracted facts to a remote database.

---

## 4. Synthetic Patient Benchmark Data

For hackathon demonstrations, public evaluations, and testing, CareBridge AI uses 100% fictional, synthetic patient scenarios. No real Protected Health Information (PHI) is present in our test suites or demonstration fixtures.

---

## 5. Roadmap for Clinical HIPAA & GDPR Compliance

Before CareBridge AI is used with real patient records in clinical hospital settings:
- **HIPAA Compliance Review**: Execution of Business Associate Agreements (BAAs) with underlying cloud infrastructure providers.
- **GDPR Compliance Review**: Explicit consent mechanisms, right to erasure workflows, and Data Protection Impact Assessments (DPIA).
- **Patient Authorization**: Explicit patient or legal guardian consent prior to discharge summary processing.
- **De-Identification Engine**: Automated redacting of patient names, phone numbers, and Social Security / Aadhaar identifiers before AI processing.
