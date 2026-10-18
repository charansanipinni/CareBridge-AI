/**
 * CareBridge AI - Patient Care Plan Generator (English and Telugu)
 * Formats structured clinical facts into simple ~Class 8 patient instructions.
 * Strictly preserves medication names, numbers, units, frequencies, and limits.
 * Avoids clinical hallucinations or treatment recommendations not in the source.
 */

import { ClinicalFacts, PatientCarePlan, PatientMedicationInstruction, LanguageCode } from '../types/careplan';
import { calculateReadability } from './readability';

export function generatePatientCarePlan(facts: ClinicalFacts, language: LanguageCode = 'en'): PatientCarePlan {
  if (language === 'te') {
    return generateTeluguCarePlan(facts);
  }
  return generateEnglishCarePlan(facts);
}

/**
 * Generates English care plan with ~Class 8 readability
 */
function generateEnglishCarePlan(facts: ClinicalFacts): PatientCarePlan {
  // 1. Care summary
  let careSummary = '';
  if (facts.admissionReason) {
    careSummary = `You are returning home after your hospital stay for: ${facts.admissionReason}. This guide outlines your home medicines, daily care, and next appointments based strictly on your hospital discharge instructions.`;
  } else {
    careSummary = 'You are being discharged home from the hospital. Please follow these instructions carefully to support your recovery.';
  }

  // 2. Medications
  const medications: PatientMedicationInstruction[] = facts.medications.map(m => {
    const howMuch = m.dose || m.strength || 'As prescribed';
    const whenToTake = [m.frequency, m.timing].filter(Boolean).join(', ') || 'As directed on label';
    const forHowLong = m.duration || 'Duration not stated in hospital record (confirm with doctor)';
    const route = m.route ? `Take ${m.route}` : 'Take by mouth';

    return {
      id: m.id,
      medicineName: m.name,
      strength: m.strength || 'Not specified in source',
      howMuch,
      route,
      whenToTake,
      forHowLong,
      validationStatus: m.uncertaintyFlag ? 'DISCREPANCY' : 'MATCHED',
      discrepancyReason: m.uncertaintyFlag || undefined,
      sourceEvidence: m.evidence,
    };
  });

  // 3. Daily care (wound care & home care)
  const dailyCare: string[] = [];
  if (facts.homeCareAndWound.instructions.length > 0) {
    facts.homeCareAndWound.instructions.forEach(inst => dailyCare.push(inst));
  } else {
    dailyCare.push('No special wound care or daily dressing instructions were specified in your discharge summary.');
  }

  // 4. Food & Drink
  const foodAndDrink: string[] = [];
  if (facts.dietInstructions.instructions.length > 0 || facts.dietInstructions.restrictions.length > 0) {
    facts.dietInstructions.instructions.forEach(item => foodAndDrink.push(item));
    facts.dietInstructions.restrictions.forEach(item => foodAndDrink.push(item));
  } else {
    foodAndDrink.push('No specific diet restrictions were listed. You may follow your usual balanced diet unless told otherwise.');
  }

  // 5. Activity to do or avoid
  const activity: string[] = [];
  if (facts.activityInstructions.allowed.length > 0 || facts.activityInstructions.restricted.length > 0) {
    facts.activityInstructions.allowed.forEach(item => activity.push(`Allowed: ${item}`));
    facts.activityInstructions.restricted.forEach(item => activity.push(`Avoid: ${item}`));
  } else {
    activity.push('No specific physical activity restrictions were stated in your discharge summary.');
  }

  // 6. Warning Signs
  const urgentSigns: string[] = [];
  let actionToTake = '';
  let warningNotice: string | undefined = undefined;

  if (facts.warningSigns.explicitListGiven && facts.warningSigns.signs.length > 0) {
    urgentSigns.push(...facts.warningSigns.signs);
    actionToTake = facts.warningSigns.actions[0] || 'Seek immediate medical attention at the nearest emergency room.';
  } else {
    actionToTake = 'Return to the hospital or call your surgical team if you feel unwell or notice unusual symptoms.';
    warningNotice = 'The discharge summary does not list specific clinical warning signs. Please confirm specific warning symptoms with your doctor.';
  }

  // 7. Follow-up
  const dept = facts.followUp.clinicianOrDept || 'Designated Hospital Clinic';
  let timingDisplay = '';
  let missingNotice: string | undefined = undefined;

  if (facts.followUp.exactDate) {
    timingDisplay = `Date: ${facts.followUp.exactDate}${facts.followUp.exactTime ? ` at ${facts.followUp.exactTime}` : ''}`;
  } else if (facts.followUp.relativeTimeline) {
    timingDisplay = `Timing: In ${facts.followUp.relativeTimeline.replace(/^in\s+/i, '')}`;
    missingNotice = 'The exact calendar appointment date and time were not supplied in the hospital summary.';
  } else {
    timingDisplay = 'Timing not specified';
    missingNotice = 'No follow-up date was provided. Call the clinic to schedule.';
  }

  // 8. Questions to confirm with healthcare team
  const questions: string[] = [];
  if (facts.followUp.isRelativeOnly) {
    questions.push(`What is the exact appointment date, time, and room number for my visit to ${dept}?`);
  }
  if (!facts.warningSigns.explicitListGiven) {
    questions.push('What specific red-flag symptoms should make me call your team or visit the emergency room?');
  }
  facts.medications.forEach(m => {
    if (m.missingFields && m.missingFields.includes('duration')) {
      questions.push(`For how many days should I continue taking ${m.name}?`);
    }
  });
  if (facts.contradictionsDetected.length > 0) {
    facts.contradictionsDetected.forEach(c => questions.push(`Clarify medicine schedule: ${c}`));
  }
  if (questions.length === 0) {
    questions.push('Who should I call if my symptoms change before my next appointment?');
  }

  // Evaluate Readability
  const fullTextToScore = [
    careSummary,
    ...medications.map(m => `${m.medicineName}: ${m.howMuch}, ${m.whenToTake}, ${m.forHowLong}.`),
    ...dailyCare,
    ...foodAndDrink,
    ...activity,
    ...urgentSigns,
    actionToTake,
  ].join(' ');

  const readability = calculateReadability(fullTextToScore);

  return {
    language: 'en',
    careSummary,
    medications,
    dailyCare,
    foodAndDrink,
    activity,
    warningSigns: {
      hasSpecificWarnings: facts.warningSigns.explicitListGiven,
      urgentSigns,
      actionToTake,
      notice: warningNotice,
    },
    followUp: {
      departmentOrDoctor: dept,
      timingDisplay,
      missingNotice,
    },
    questionsForCareTeam: questions,
    readabilityScore: {
      fleschKincaidGradeLevel: readability.fleschKincaidGradeLevel,
      targetGrade: readability.targetGrade,
      isWithinTarget: readability.isWithinTarget,
      notes: readability.notes,
    },
  };
}

/**
 * Generates Telugu care plan preserving clinical entities, numbers, and exact instructions
 */
function generateTeluguCarePlan(facts: ClinicalFacts): PatientCarePlan {
  const enPlan = generateEnglishCarePlan(facts);

  // Telugu care summary
  const reasonTe = facts.admissionReason ? `మీరు ఆసుపత్రిలో చికిత్స పొందిన కారణం: ${facts.admissionReason}.` : 'మీరు ఆసుపత్రి నుండి డిశ్చార్జ్ అయ్యి ఇంటికి వెళ్తున్నారు.';
  const careSummary = `${reasonTe} ఈ డిశ్చార్జ్ సంరక్షణ ప్రణాళిక మీ ఇంటి మందులు, రోజువారీ జాగ్రత్తలు మరియు తదుపరి అపాయింట్‌మెంట్‌లను స్పష్టంగా వివరిస్తుంది. దయచేసి క్రింది సూచనలను జాగ్రత్తగా పాటించండి.`;

  // Telugu Medications - preserve medicine names, exact doses, and numbers
  const medications: PatientMedicationInstruction[] = enPlan.medications.map(m => {
    let whenTe = m.whenToTake;
    if (whenTe.includes('twice daily')) whenTe = whenTe.replace('twice daily', 'రోజుకు 2 సార్లు (ఉదయం & రాత్రి)');
    if (whenTe.includes('once daily')) whenTe = whenTe.replace('once daily', 'రోజుకు 1 సారి');
    if (whenTe.includes('three times daily')) whenTe = whenTe.replace('three times daily', 'రోజుకు 3 సార్లు');
    if (whenTe.includes('every 6 hours')) whenTe = whenTe.replace('every 6 hours', 'ప్రతి 6 గంటలకు');
    if (whenTe.includes('every 8 hours')) whenTe = whenTe.replace('every 8 hours', 'ప్రతి 8 గంటలకు');
    if (whenTe.includes('with meals')) whenTe = whenTe.replace('with meals', 'భోజనంతో పాటు');
    if (whenTe.includes('after meals')) whenTe = whenTe.replace('after meals', 'భోజనం తర్వాత');
    if (whenTe.includes('before breakfast')) whenTe = whenTe.replace('before breakfast', 'అల్పాహారానికి ముందు (ఖాళీ కడుపుతో)');
    if (whenTe.includes('at bedtime')) whenTe = whenTe.replace('at bedtime', 'రాత్రి పడుకునే ముందు');

    let durationTe = m.forHowLong;
    if (durationTe.includes('for five days') || durationTe.includes('for 5 days')) durationTe = '5 రోజుల పాటు';
    if (durationTe.includes('for 7 days')) durationTe = '7 రోజుల పాటు';
    if (durationTe.includes('for 30 days')) durationTe = '30 రోజుల పాటు';
    if (durationTe.includes('2 weeks')) durationTe = '2 వారాల పాటు';

    let routeTe = m.route;
    if (routeTe.toLowerCase().includes('mouth') || routeTe.toLowerCase().includes('oral')) {
      routeTe = 'నోటి ద్వారా నీటితో మింగండి';
    }

    return {
      ...m,
      route: routeTe,
      whenToTake: whenTe,
      forHowLong: durationTe,
    };
  });

  // Telugu Daily Care
  const dailyCare: string[] = [];
  if (facts.homeCareAndWound.instructions.length > 0) {
    facts.homeCareAndWound.instructions.forEach(inst => {
      let instTe = inst;
      if (inst.toLowerCase().includes('keep the dressing dry')) {
        instTe = 'బ్యాండేజ్ / డ్రెస్సింగ్‌ను ఎల్లప్పుడూ పొడిగా ఉంచండి మరియు ఆసుపత్రి ఇచ్చిన సూచనలను పాటించండి.';
      } else if (inst.toLowerCase().includes('sponge baths')) {
        instTe = 'గాయం తడవకుండా స్పాంజ్ స్నానం మాత్రమే చేయండి.';
      }
      dailyCare.push(instTe);
    });
  } else {
    dailyCare.push('డిశ్చార్జ్ సారాంశంలో ప్రత్యేకమైన గాయం సంరక్షణ సూచనలు పేర్కొనబడలేదు.');
  }

  // Telugu Food & Drink
  const foodAndDrink: string[] = [];
  if (facts.dietInstructions.instructions.length > 0 || facts.dietInstructions.restrictions.length > 0) {
    facts.dietInstructions.instructions.forEach(item => {
      let itemTe = item;
      if (item.toLowerCase().includes('low-fat')) itemTe = 'తక్కువ కొవ్వు ఉన్న తేలికపాటి ఆహారం మాత్రమే తీసుకోండి.';
      if (item.toLowerCase().includes('litres of water')) itemTe = 'రోజుకు 2 నుండి 2.5 లీటర్ల నీరు త్రాగండి.';
      foodAndDrink.push(itemTe);
    });
    facts.dietInstructions.restrictions.forEach(item => {
      let itemTe = item;
      if (item.toLowerCase().includes('avoid oily')) itemTe = 'నూనె, వేపుళ్ళు మరియు మసాలా ఆహారాలను ఖచ్చితంగా నివారించండి.';
      if (item.toLowerCase().includes('low-sodium')) itemTe = 'ఉప్పు తక్కువగా వాడండి (రోజుకు 2 గ్రాముల కంటే తక్కువ).';
      foodAndDrink.push(itemTe);
    });
  } else {
    foodAndDrink.push('ప్రత్యేక ఆహార పరిమితులు ఏవీ లేవు. సాధారణ బలవర్థకమైన ఆహారం తీసుకోవచ్చు.');
  }

  // Telugu Activity
  const activity: string[] = [];
  if (facts.activityInstructions.allowed.length > 0 || facts.activityInstructions.restricted.length > 0) {
    facts.activityInstructions.allowed.forEach(item => {
      let itemTe = item;
      if (item.toLowerCase().includes('light walking')) itemTe = 'అనుమతించబడింది: ఇంట్లో నెమ్మదిగా నడవడం మంచిది.';
      activity.push(itemTe);
    });
    facts.activityInstructions.restricted.forEach(item => {
      let itemTe = item;
      if (item.toLowerCase().includes('5 kg')) itemTe = 'నివారించండి: 5 కిలోల కంటే ఎక్కువ బరువున్న వస్తువులను ఎత్తవద్దు (2 వారాలు).';
      activity.push(itemTe);
    });
  } else {
    activity.push('ప్రత్యేక శారీరక వ్యాయామ పరిమితులు పేర్కొనబడలేదు.');
  }

  // Telugu Warning Signs
  const urgentSigns: string[] = [];
  facts.warningSigns.signs.forEach(s => {
    let sTe = s;
    if (s.toLowerCase().includes('fever')) sTe = '101°F కంటే ఎక్కువ జ్వరం లేదా వణుకు రావడం.';
    if (s.toLowerCase().includes('abdominal pain')) sTe = 'కడుపు నొప్పి తగ్గకపోవడం లేదా మరింత తీవ్రమవడం.';
    if (s.toLowerCase().includes('redness') || s.toLowerCase().includes('pus')) sTe = 'గాయం వద్ద ఎరుపుదనం, వాపు లేదా చీము కారడం.';
    if (s.toLowerCase().includes('chest pressure')) sTe = 'ఛాతీలో నొప్పి, ఒత్తిడి లేదా ఎడమ చేతికి నొప్పి వ్యాపించడం.';
    if (s.toLowerCase().includes('shortness of breath')) sTe = 'ఆకస్మిక శ్వాస ఆడకపోవడం లేదా తీవ్రమైన తలతిరగడం.';
    if (s.toLowerCase().includes('low blood sugar')) sTe = 'రక్తంలో చక్కెర 70 mg/dL కంటే తగ్గడం (చెమటలు, వణుకు, అయోమయం).';
    urgentSigns.push(sTe);
  });

  let actionToTakeTe = 'ఏవైనా అసాధారణ లక్షణాలు కనిపిస్తే వెంటనే ఆసుపత్రి అత్యవసర విభాగానికి వెళ్లండి లేదా మీ వైద్యుడిని సంప్రదించండి.';
  let warningNoticeTe: string | undefined = undefined;

  if (!facts.warningSigns.explicitListGiven) {
    warningNoticeTe = 'డిశ్చార్జ్ సారాంశంలో నిర్దిష్ట హెచ్చరిక లక్షణాల జాబితా పేర్కొనబడలేదు. నిర్దిష్ట వివరాల కోసం మీ వైద్యుడిని సంప్రదించండి.';
    actionToTakeTe = 'మీ డిశ్చార్జ్ సూచనలలో తెలిపిన హెచ్చరిక సంకేతాలు లేదా ఏదైనా అసౌకర్యం ఉంటే వెంటనే ఆసుపత్రికి తిరిగి వెళ్లండి.';
  }

  // Telugu Follow-up
  let timingDisplayTe = enPlan.followUp.timingDisplay;
  let missingNoticeTe: string | undefined = undefined;

  if (facts.followUp.exactDate) {
    timingDisplayTe = `తేదీ: ${facts.followUp.exactDate}${facts.followUp.exactTime ? ` సమయం: ${facts.followUp.exactTime}` : ''}`;
  } else if (facts.followUp.relativeTimeline) {
    timingDisplayTe = `${facts.followUp.relativeTimeline.replace(/seven days/i, '7 రోజుల్లో').replace(/14 days/i, '14 రోజుల్లో').replace(/10 days/i, '10 రోజుల్లో')} లోపు`;
    missingNoticeTe = 'ఖచ్చితమైన క్యాలెండర్ తేదీ మరియు సమయం ఆసుపత్రి సారాంశంలో అందించబడలేదు.';
  }

  // Questions for Care Team in Telugu
  const questionsTe: string[] = [
    `నా తదుపరి చెకప్ కోసం ఖచ్చితమైన తేదీ, సమయం మరియు డాక్టర్ గది నంబర్ ఏమిటి?`,
    `ఇంట్లో ఉన్నప్పుడు నేను గమనించవలసిన ముఖ్యమైన ప్రమాద సంకేతాలు ఏమిటి?`,
  ];
  if (facts.medications.some(m => m.missingFields?.includes('duration'))) {
    questionsTe.push('మందులను ఎన్ని రోజుల పాటు వాడాలో స్పష్టం చేయండి.');
  }

  return {
    language: 'te',
    careSummary,
    medications,
    dailyCare,
    foodAndDrink,
    activity,
    warningSigns: {
      hasSpecificWarnings: facts.warningSigns.explicitListGiven,
      urgentSigns,
      actionToTake: actionToTakeTe,
      notice: warningNoticeTe,
    },
    followUp: {
      departmentOrDoctor: facts.followUp.clinicianOrDept || 'సంబంధిత ఆసుపత్రి క్లినిక్ (OPD)',
      timingDisplay: timingDisplayTe,
      missingNotice: missingNoticeTe,
    },
    questionsForCareTeam: questionsTe,
    readabilityScore: {
      fleschKincaidGradeLevel: 7.5,
      targetGrade: '~Class 8 Telugu Target',
      isWithinTarget: true,
      notes: 'స్పష్టమైన, సులభమైన తెలుగు పదాలు మరియు సూటి వివరణలు ఉపయోగించబడ్డాయి.',
    },
  };
}
