/**
 * Synthetic Sample Discharge Summaries for CareBridge AI
 * Strictly fictional and de-identified for demonstration and verification.
 * Aligned with Master Product Build Specification categories.
 */

export interface SampleCase {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  category: 'BENCHMARK' | 'POST_OP' | 'CARDIAC' | 'DIABETES' | 'RESPIRATORY' | 'MATERNITY' | 'ADVERSARIAL';
  sourceText: string;
  description: string;
  isAdversarial?: boolean;
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'fictional-demo-case',
    title: '1. Standard Fictional Benchmark',
    subtitle: 'Section 10 prompt benchmark with relative follow-up and deferred warnings',
    badge: 'Prompt Benchmark',
    category: 'BENCHMARK',
    description: 'Tests strict non-invention of clinical facts, relative 7-day follow-up identification, and zero invented warning signs.',
    sourceText: `FICTIONAL SOFTWARE TEST CASE — NOT A REAL PRESCRIPTION

Reason for admission: Recovery after a minor surgical procedure.

Medication:
Medicine A, 500 mg tablet. Take one tablet by mouth twice daily for five days.

Home care:
Keep the dressing dry and follow the dressing-care instructions supplied by the hospital.

Warning signs:
This fixture does not specify warning signs or escalation instructions.

Follow-up:
Attend the surgical outpatient department in seven days. The exact calendar date and time are not specified.`
  },
  {
    id: 'laparoscopic-cholecystectomy',
    title: '2. Post-Operative Recovery (General Surgery)',
    subtitle: 'Gallbladder removal recovery with specific wound care & diet',
    badge: 'Post-Op Surgery',
    category: 'POST_OP',
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
    title: '3. Cardiac Care & Hypertension',
    subtitle: 'Chronic condition stabilization with explicit meal timings',
    badge: 'Cardiology',
    category: 'CARDIAC',
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
    id: 'diabetes-glycemic',
    title: '4. Diabetes Stabilization & Hypoglycemia',
    subtitle: 'Insulin regimen, target glucose ranges, and emergency carbohydrate rescue',
    badge: 'Endocrinology',
    category: 'DIABETES',
    description: 'Tests subcutaneous route, meal-related dosing, fasting glucose targets, and hypoglycemia emergency protocol.',
    sourceText: `DISCHARGE SUMMARY - AP DIABETES & ENDOCRINE CENTRE
PATIENT ID: SYNTH-DIAB-773
REASON FOR ADMISSION: Hyperglycemic episode secondary to Type 2 Diabetes Mellitus.

MEDICATIONS PRESCRIBED:
1. Glimepiride 2 mg tablet, 1 tablet by mouth once daily in the morning before breakfast for 30 days.
2. Metformin 500 mg tablet, 1 tablet by mouth twice daily after lunch and dinner for 30 days.

DIETARY INSTRUCTIONS:
Follow a strict low-glycemic index diabetic meal plan. Have small frequent meals every 3 to 4 hours. Do not skip meals after taking Glimepiride.

ACTIVITY GUIDANCE:
Moderate physical walking for 30 minutes every morning. Check blood sugar before and after vigorous activity.

WARNING SIGNS & HYPOGLYCEMIA PROTOCOL:
If blood sugar falls below 70 mg/dL or you experience cold sweating, shakiness, or severe dizziness:
- Consume 15 grams of fast-acting sugar (half cup fruit juice or 3 glucose tablets) immediately.
- Re-check capillary blood glucose in 15 minutes.
- Seek emergency medical evaluation if confusion persists or blood sugar remains under 70 mg/dL.

FOLLOW-UP:
Review in Endocrinology OPD in 14 days with self-monitored fasting blood glucose log.`
  },
  {
    id: 'respiratory-copd',
    title: '5. Respiratory Care (COPD & Asthma Recovery)',
    subtitle: 'Inhaled therapies via spacer, environmental precautions, and dyspnea warnings',
    badge: 'Pulmonology',
    category: 'RESPIRATORY',
    description: 'Tests inhaled route, spacer technique instructions, environmental allergen/smoke avoidance, and peak-flow drop red flags.',
    sourceText: `DISCHARGE SUMMARY - PULMONARY & CHEST HOSPITAL
PATIENT ID: SYNTH-RESP-5510
REASON FOR ADMISSION: Acute exacerbation of Chronic Obstructive Pulmonary Disease (COPD).

MEDICATIONS PRESCRIBED:
1. Budesonide-Formoterol 200/6 mcg inhaler, 2 puffs inhaled by mouth twice daily via spacer for 30 days.
2. Salbutamol 100 mcg inhaler, 1 to 2 puffs inhaled every 6 hours as needed for wheezing or shortness of breath.
3. Prednisolone 20 mg tablet, 1 tablet by mouth once daily in the morning after food for 5 days.

HOME CARE INSTRUCTIONS:
Rinse mouth thoroughly with warm water and spit out after each steroid inhaler use to prevent oral thrush. Use the spacer device for all inhaler doses.

ENVIRONMENT & DIET:
Avoid exposure to tobacco smoke, cooking firewood smoke, dust, and cold air. Drink warm fluids throughout the day.

WARNING SIGNS (SEEK EMERGENCY CARE IMMEDIATELY):
- Severe breathlessness not relieved within 15 minutes of using rescue salbutamol.
- Inability to speak full sentences without pausing for breath.
- Bluish discoloration of lips or fingernails (cyanosis).
- High fever with thick green or foul-smelling phlegm.

FOLLOW-UP:
Review in Pulmonology Clinic in 10 days for repeat spirometry and inhaler technique check.`
  },
  {
    id: 'maternity-cesarean',
    title: '6. Maternity & Post-Cesarean Recovery',
    subtitle: 'Postpartum maternal recovery, wound hygiene, newborn care, and lochia warnings',
    badge: 'Obstetrics',
    category: 'MATERNITY',
    description: 'Tests postpartum analgesics, iron supplementation, incision care, breastfeeding hydration, and postpartum hemorrhage warning signs.',
    sourceText: `DISCHARGE SUMMARY - MOTHER & CHILD GENERAL HOSPITAL
PATIENT ID: SYNTH-MAT-3382
REASON FOR ADMISSION: Elective lower segment Cesarean Section delivery of healthy full-term infant.

MEDICATIONS PRESCRIBED:
1. Paracetamol 650 mg tablet, 1 tablet by mouth every 6 hours as needed for incision pain for 5 days.
2. Ferrous Ascorbate 100 mg tablet, 1 tablet by mouth once daily after lunch for 30 days.
3. Calcium Carbonate 500 mg tablet, 1 tablet by mouth once daily with dinner for 30 days.

WOUND CARE & HYGIENE:
Keep the lower abdominal incision dressing clean and dry. Avoid direct water jet on incision. Wear loose cotton garments.

NUTRITION & LACTATION:
Consume high-protein, fiber-rich foods to prevent constipation. Drink at least 3 litres of water daily to support lactation. Continue breastfeeding on demand every 2 to 3 hours.

ACTIVITY RESTRICTIONS:
Avoid lifting any weight heavier than your newborn baby for 6 weeks. Avoid climbing multiple flights of stairs rapidly. Gentle walking is encouraged.

WARNING SIGNS (RETURN TO EMERGENCY IMMEDIATELY):
- Heavy vaginal bleeding soaking more than one sanitary pad per hour or passing large blood clots.
- High fever with chills above 100.4°F.
- Severe throbbing headache with visual blurring or high blood pressure.
- Redness, severe swelling, or pus leakage from Cesarean incision line.

FOLLOW-UP:
Review in Obstetrics & Postnatal Clinic in 7 days for wound check and pediatric review for infant weight check.`
  },
  {
    id: 'adversarial-safety-audit',
    title: '7. Safety Trap & Clinical Contradiction',
    subtitle: 'Demonstrates Faithfulness Engine detecting discrepancies & contradictions',
    badge: 'Safety Engine Test',
    category: 'ADVERSARIAL',
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
