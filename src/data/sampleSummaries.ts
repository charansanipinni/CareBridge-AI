/**
 * Synthetic Sample Discharge Summaries for CareBridge AI
 * Strictly fictional and de-identified for demonstration and verification.
 * Aligned with Master Product Build Specification categories.
 */

export interface SampleCase {
  id: string;
  title: string;
  titleTe?: string;
  subtitle: string;
  subtitleTe?: string;
  badge: string;
  badgeTe?: string;
  category: 'BENCHMARK' | 'POST_OP' | 'CARDIAC' | 'DIABETES' | 'RESPIRATORY' | 'MATERNITY' | 'ADVERSARIAL';
  sourceText: string;
  description: string;
  isAdversarial?: boolean;
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'fictional-demo-case',
    title: '1. Simple Hospital Recovery',
    titleTe: '1. సాధారణ ఆసుపత్రి కోలుకోవడం',
    subtitle: 'Basic home medicine, keeping dressing dry, and 7-day follow-up',
    subtitleTe: 'సాధారణ మందులు, బ్యాండేజ్ జాగ్రత్తలు మరియు 7 రోజుల తర్వాత చెకప్',
    badge: 'General Care',
    badgeTe: 'సాధారణ సంరక్షణ',
    category: 'BENCHMARK',
    description: 'Basic recovery with one home medicine, dressing instructions, and scheduled 7-day follow-up.',
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
    title: '2. Gallbladder Surgery Recovery',
    titleTe: '2. పిత్తాశయ శస్త్రచికిత్స సంరక్షణ',
    subtitle: 'Pain relief, antibiotics, safe sponge bathing, and light walking',
    subtitleTe: 'నొప్పి మందులు, స్పాంజ్ స్నానం, తేలికపాటి నడక మరియు తక్కువ నూనె ఆహారం',
    badge: 'Surgery Recovery',
    badgeTe: 'శస్త్రచికిత్స సంరక్షణ',
    category: 'POST_OP',
    description: 'Post-surgery recovery with pain tablets, antibiotic course, wound protection, and low-fat diet.',
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
    title: '3. High Blood Pressure & Heart Care',
    titleTe: '3. అధిక రక్తపోటు & గుండె సంరక్షణ',
    subtitle: 'Daily BP tablets, morning dosage, low-salt diet, and doctor visit',
    subtitleTe: 'రోజూ వేసుకునే బీపీ మందులు, ఉదయం వేళలు, తక్కువ ఉప్పు ఆహారం మరియు చెకప్',
    badge: 'Heart & BP',
    badgeTe: 'గుండె & బీపీ',
    category: 'CARDIAC',
    description: 'Managing daily blood pressure and heart tablets with meals, light walking, and low-salt diet.',
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
    title: '4. Diabetes & Blood Sugar Care',
    titleTe: '4. షుగర్ వ్యాధి సంరక్షణ',
    subtitle: 'Sugar tablets before meals, regular walking, and dizzy care',
    subtitleTe: 'భోజనానికి ముందు షుగర్ మాత్రలు, నడక మరియు కళ్ళు తిరిగితే తీసుకోవాల్సిన జాగ్రత్తలు',
    badge: 'Diabetes & Sugar',
    badgeTe: 'షుగర్ సంరక్షణ',
    category: 'DIABETES',
    description: 'Taking sugar tablets with regular meals, morning walking, and quick sugar intake if dizzy.',
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
    title: '5. Breathing & Inhaler Care',
    titleTe: '5. శ్వాస & ఇన్‌హేలర్ సంరక్షణ',
    subtitle: 'Inhaler use, mouth rinsing, and avoiding smoke, dust & cold air',
    subtitleTe: 'ఇన్‌హేలర్ వాడకం, నోరు శుభ్రం చేసుకోవడం మరియు దుమ్ము, పొగకు దూరంగా ఉండటం',
    badge: 'Breathing Care',
    badgeTe: 'శ్వాస సంరక్షణ',
    category: 'RESPIRATORY',
    description: 'Using an inhaler for easier breathing, rinsing mouth after spray, and protecting from dust & smoke.',
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
    title: '6. Mother Care (After C-Section)',
    titleTe: '6. సిజేరియన్ ప్రసవం తర్వాత తల్లి సంరక్షణ',
    subtitle: 'Pain relief, iron tablets, baby feeding, and resting at home',
    subtitleTe: 'నొప్పి మాత్రలు, ఐరన్ & కాల్షియం, కుట్ల సంరక్షణ మరియు బిడ్డకు పాలివ్వడం',
    badge: 'Mother & Baby',
    badgeTe: 'తల్లి & బిడ్డ',
    category: 'MATERNITY',
    description: 'Caring for a new mother after delivery with pain relief, iron supplements, and gentle recovery.',
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
    title: '7. Unclear Doctor Note Example',
    titleTe: '7. అస్పష్టమైన సూచనల ఉదాహరణ',
    subtitle: 'Shows how our system safely flags confusing or incomplete doctor notes',
    subtitleTe: 'అస్పష్టమైన వైద్య సూచనలను మా వ్యవస్థ ఎలా గుర్తిస్తుందో చూపే ఉదాహరణ',
    badge: 'Doctor Review',
    badgeTe: 'డాక్టర్ సమీక్ష',
    category: 'ADVERSARIAL',
    description: 'Demonstrates our clinical safety audit flagging unclear doctor notes so no errors reach the patient.',
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
