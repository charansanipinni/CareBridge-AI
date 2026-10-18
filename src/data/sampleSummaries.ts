/**
 * Synthetic Sample Discharge Summaries for CareBridge AI
 * Strictly fictional and de-identified for demonstration and verification.
 */

export interface SampleCase {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  sourceText: string;
  description: string;
  isAdversarial?: boolean;
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'fictional-demo-case',
    title: '1. Standard Fictional Demo (Problem Statement)',
    subtitle: 'Minor surgical recovery with relative follow-up and deferred warning signs',
    badge: 'Prompt Benchmark',
    description: 'Tests strict non-invention of clinical facts, relative 7-day follow-up identification, and zero invented warning signs.',
    sourceText: `Fictional discharge summary — for software demonstration only.

Reason for admission: Recovery after a minor surgical procedure.

Medication:
Medicine A, 500 mg tablet, take one tablet by mouth twice daily for five days.

Home care:
Keep the dressing dry and follow the dressing-care instructions provided by the hospital.

Warning signs:
Return to the hospital if you experience the warning signs listed in your discharge instructions. This example intentionally does not invent a list of clinical warning signs.

Follow-up:
Attend the surgical outpatient department in seven days. The exact appointment date and time were not supplied.`
  },
  {
    id: 'laparoscopic-cholecystectomy',
    title: '2. Post-Op Laparoscopic Surgery',
    subtitle: 'Gallbladder removal recovery with specific wound care & diet',
    badge: 'Post-Op Clinical',
    description: 'Tests multi-medication extraction, wound dressing care, low-fat diet restrictions, lifting limits, and scheduled OPD follow-up.',
    sourceText: `DISCHARGE SUMMARY - AP GENERAL HOSPITAL
PATIENT ID: SYNTH-89241
ADMISSION DIAGNOSIS: Acute cholecystitis status post laparoscopic cholecystectomy.

MEDICATIONS PRESCRIBED:
1. Paracetamol 650 mg tablet, 1 tablet by mouth every 6 hours as needed for pain, maximum 4 tablets in 24 hours.
2. Amoxicillin-Clavulanate 625 mg oral tablet, 1 tablet twice daily after meals for 5 days.
3. Pantoprazole 40 mg tablet, 1 tablet by mouth once daily in the morning 30 minutes before breakfast for 7 days.

DIETARY INSTRUCTIONS:
Maintain a light, low-fat diet for the next 2 weeks. Avoid oily, deep-fried, and heavily spiced foods. Drink 2 to 2.5 litres of water daily.

ACTIVITY RESTRICTIONS:
Rest at home for 48 hours. Light walking around the house is encouraged. Strictly avoid lifting objects heavier than 5 kg (10 lbs) and avoid vigorous abdominal exercises for 2 weeks.

WOUND CARE:
Keep surgical puncture dressings clean and completely dry for 48 hours. After 48 hours, sponge baths are allowed. Do not soak in a bath or swim until cleared.

WARNING SIGNS & ESCALATION:
Seek immediate emergency medical evaluation if you experience:
- Persistent fever greater than 101°F (38.3°C) or severe chills.
- Worsening abdominal pain not relieved by paracetamol.
- Increasing redness, heat, swelling, or foul-smelling pus from laparoscopic incision sites.
- Yellowing of skin or eyes (jaundice), or severe persistent vomiting.

FOLLOW-UP:
Review in General Surgery Outpatient Department on 28-October-2026 at 10:30 AM with Dr. Rao. Bring this summary.`
  },
  {
    id: 'cardiac-metabolic',
    title: '3. Cardiac & Type 2 Diabetes Management',
    subtitle: 'Chronic condition stabilization with explicit meal timings',
    badge: 'Chronic Care',
    description: 'Tests timing relation to meals (e.g. Metformin with dinner, Atorvastatin at bedtime), hypoglycemia alerts, and relative follow-up.',
    sourceText: `DISCHARGE SUMMARY - METROPOLITAN CARDIAC CARE
PATIENT ID: SYNTH-CARD-4412
REASON FOR ADMISSION: Uncontrolled Hypertension and Type 2 Diabetes stabilization.

DISCHARGE MEDICATIONS:
1. Metformin 500 mg tablet, 1 tablet orally twice daily with meals for 30 days.
2. Amlodipine 5 mg tablet, 1 tablet orally once daily in the morning for 30 days.
3. Atorvastatin 20 mg tablet, 1 tablet orally once daily at bedtime for 30 days.

DIET & NUTRITION:
Adhere strictly to a low-sodium (less than 2 grams salt/day) diabetic diet. Avoid sweetened beverages, refined sugars, and bakery items.

ACTIVITY GUIDANCE:
Engage in 20 to 30 minutes of gentle brisk walking daily once rested. Avoid sudden heavy physical exertion.

WARNING SIGNS (RETURN TO EMERGENCY IMMEDIATELY):
- Squeezing chest pressure, heaviness, or radiation of pain to left arm or jaw.
- Sudden shortness of breath or dizziness.
- Signs of low blood sugar (sweating, trembling, extreme hunger, confusion) with capillary blood glucose below 70 mg/dL.

FOLLOW-UP CARE:
Cardiology & Endocrine Clinic review in 14 days for repeat blood pressure and fasting blood glucose check. Exact appointment time to be confirmed by phone call.`
  },
  {
    id: 'adversarial-safety-audit',
    title: '4. Safety Trap & Clinical Contradiction (Judge Verification Case)',
    subtitle: 'Demonstrates Faithfulness Engine detecting discrepancies & contradictions',
    badge: 'Safety Engine Test',
    description: 'Contains an intentional contradictory dosing instruction and missing stop date. Proves CareBridge AI never falsely displays a green "Verified" badge on unsafe data.',
    isAdversarial: true,
    sourceText: `SYNTHETIC DISCHARGE AUDIT - SAFETY VERIFICATION CASE
REASON FOR ADMISSION: Observational evaluation for non-cardiac chest discomfort.

MEDICATIONS:
1. Medicine B 250 mg tablet: Take one tablet by mouth once daily in the morning. Note in nursing notes: patient advised to take twice daily if discomfort persists.
2. Medicine C 100 mg capsule: Take orally every 8 hours. Duration not stated in record.

WARNING SIGNS:
No specific red-flag warning signs documented by the attending resident.

FOLLOW-UP:
Follow up with primary care clinic within 10 days.`
  }
];
