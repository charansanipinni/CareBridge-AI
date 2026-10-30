/**
 * CareBridge AI - Deterministic Fact Extractor
 * Extracts clinical facts explicitly present in the source text.
 * Preserves exact medication names, doses, units, durations, and follow-up dates.
 * Represents missing fields as null/unknown and flags contradictions.
 */

import { ClinicalFacts, MedicationFact, FollowUpFact } from '../types/careplan';
import { sanitizeDocumentInput } from './security';

export function extractClinicalFacts(rawText: string): ClinicalFacts {
  // Step 1: Security sanitization to neutralize prompt overrides or malicious scripts
  const { sanitizedText } = sanitizeDocumentInput(rawText);
  const normalized = sanitizedText.trim();

  // 1. Patient ID (only if explicitly present)
  let patientId: string | null = null;
  const patientIdMatch = normalized.match(/(?:PATIENT\s*ID|MRN|RECORD\s*NO|ID)[:\s]+([A-Z0-9_-]+)/i);
  if (patientIdMatch) {
    patientId = patientIdMatch[1].trim();
  }

  // 2. Admission Reason / Diagnosis
  let admissionReason: string | null = null;
  const reasonMatch = normalized.match(/(?:REASON\s+FOR\s+ADMISSION|ADMISSION\s+DIAGNOSIS|DIAGNOSIS)[:\s]+([^\n\r]+)/i);
  if (reasonMatch) {
    admissionReason = reasonMatch[1].trim().replace(/\.$/, '');
  }

  // 3. Medications & Stopped Medications
  const medications: MedicationFact[] = [];
  const stoppedMedications: string[] = [];
  const contradictions: string[] = [];

  // Dedicated stopped medicines section if present
  const stopSectionMatch = normalized.match(/(?:STOP(?:PED)?\s+MEDICATIONS?|DISCONTINUED\s+MEDICATIONS?|MEDICATIONS?\s+TO\s+STOP)[:\s]*([\s\S]*?)(?=(?:HOME\s+CARE|DIETARY|DIET|ACTIVITY|WOUND|WARNING|EMERGENCY|FOLLOW-UP|$))/i);
  if (stopSectionMatch) {
    const stopLines = stopSectionMatch[1].split(/\r?\n/).map(l => l.replace(/^\d+[\.\)]\s*|^[-*]\s*/, '').trim()).filter(Boolean);
    for (const sl of stopLines) {
      if (!sl.toLowerCase().startsWith('none')) {
        const cleanStop = sl.replace(/^(?:stop|discontinue|hold)\s+(?:tab(?:let)?|cap(?:sule)?|inj(?:ection)?)?\.?\s*/i, '').trim();
        if (cleanStop && !stoppedMedications.includes(cleanStop)) {
          stoppedMedications.push(cleanStop);
        }
      }
    }
  }

  // Find medication section or parse medication lines
  const medSectionMatch = normalized.match(/(?:MEDICATION(?:S)?(?:\s+PRESCRIBED)?|DISCHARGE\s+MEDICATIONS)[:\s]*([\s\S]*?)(?=(?:HOME\s+CARE|DIETARY|DIET|ACTIVITY|WOUND|WARNING(?:\s+SIGNS)?|EMERGENCY|WHEN\s+TO\s+SEEK|FOLLOW-UP|FOLLOW\s+UP|STOP\s+MEDICATIONS?|$))/i);
  const medBlock = medSectionMatch ? medSectionMatch[1].trim() : '';

  if (medBlock) {
    const rawMedEntries = medBlock
      .split(/(?:\r?\n(?=\d+[\.\)]|\-|\*|[A-Z][a-z0-9\s]+,))|\r?\n\r?\n/)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    for (let i = 0; i < rawMedEntries.length; i++) {
      const entry = rawMedEntries[i].replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').trim();
      if (!entry || entry.toLowerCase().startsWith('none')) continue;

      // Check if this line is an order to discontinue or stop
      if (/^(?:stop|discontinue|hold)\s+/i.test(entry)) {
        const cleanStop = entry.replace(/^(?:stop|discontinue|hold)\s+(?:tab(?:let)?|cap(?:sule)?|inj(?:ection)?)?\.?\s*/i, '').trim();
        if (cleanStop && !stoppedMedications.includes(cleanStop)) {
          stoppedMedications.push(cleanStop);
        }
        continue;
      }

      const medFact = parseMedicationLine(entry, `med-${i + 1}`);
      if (medFact) {
        // Detect contradictory dosage instructions within the same entry
        if (entry.toLowerCase().includes('once daily') && entry.toLowerCase().includes('twice daily')) {
          contradictions.push(`Conflicting frequencies in ${medFact.name}: "once daily" vs "twice daily".`);
          medFact.uncertaintyFlag = 'Contradictory frequencies in source text (once daily vs twice daily). Requires clinician clarification.';
        }
        medications.push(medFact);
      }
    }
  }

  // 4. Warning signs
  let explicitListGiven = false;
  const warningSignsList: string[] = [];
  const warningActions: string[] = [];
  let warningEvidence = '';

  const warningSectionMatch = normalized.match(/(?:WARNING\s+SIGNS(?:\s*&|\s+AND)?(?:\s+ESCALATION)?|WHEN\s+TO\s+SEEK\s+CARE)[:\s]*([\s\S]*?)(?=(?:FOLLOW-UP|FOLLOW\s+UP|HOME\s+CARE|DIET|$))/i);
  if (warningSectionMatch) {
    warningEvidence = warningSectionMatch[0].trim();
    const content = warningSectionMatch[1].trim();

    // Check if the source explicitly states it does not invent/list warning signs
    if (content.toLowerCase().includes('intentionally does not invent') || 
        content.toLowerCase().includes('does not specify') ||
        content.toLowerCase().includes('listed in your discharge instructions') || 
        content.toLowerCase().includes('no specific') || 
        content.toLowerCase().includes('not documented')) {
      explicitListGiven = false;
      warningActions.push('Return to hospital or contact surgical team if experiencing unlisted warning signs.');
    } else {
      explicitListGiven = true;
      const bulletItems = content
        .split(/(?:\r?\n(?=[-•*]|\d+\.))|\r?\n/)
        .map(b => b.replace(/^[-•*]|\d+\.\s*/, '').trim())
        .filter(b => b.length > 5 && !b.toLowerCase().startsWith('seek immediate') && !b.toLowerCase().startsWith('return to emergency'));

      if (bulletItems.length > 0) {
        warningSignsList.push(...bulletItems);
      } else {
        warningSignsList.push(content);
      }

      if (content.toLowerCase().includes('emergency') || content.toLowerCase().includes('immediate')) {
        warningActions.push('Seek immediate emergency medical evaluation.');
      } else {
        warningActions.push('Contact hospital or care team promptly.');
      }
    }
  }

  // 5. Diet instructions
  const dietInstructions: string[] = [];
  const dietRestrictions: string[] = [];
  let dietEvidence: string | null = null;

  const dietMatch = normalized.match(/(?:DIETARY\s+INSTRUCTIONS|DIET\s*&?\s*NUTRITION|DIET)[:\s]*([\s\S]*?)(?=(?:ACTIVITY|WOUND|WARNING|FOLLOW-UP|MEDICATION|$))/i);
  if (dietMatch) {
    dietEvidence = dietMatch[0].trim();
    const text = dietMatch[1].trim();
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    for (const s of sentences) {
      if (s.toLowerCase().includes('avoid') || s.toLowerCase().includes('restrict') || s.toLowerCase().includes('limit')) {
        dietRestrictions.push(s.trim());
      } else {
        dietInstructions.push(s.trim());
      }
    }
  }

  // 6. Activity restrictions
  const activityAllowed: string[] = [];
  const activityRestricted: string[] = [];
  let activityEvidence: string | null = null;

  const activityMatch = normalized.match(/(?:ACTIVITY\s+RESTRICTIONS|ACTIVITY\s+GUIDANCE|ACTIVITY)[:\s]*([\s\S]*?)(?=(?:WOUND|DIET|WARNING|FOLLOW-UP|HOME\s+CARE|$))/i);
  if (activityMatch) {
    activityEvidence = activityMatch[0].trim();
    const text = activityMatch[1].trim();
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    for (const s of sentences) {
      if (s.toLowerCase().includes('avoid') || s.toLowerCase().includes('no heavy') || s.toLowerCase().includes('do not') || s.toLowerCase().includes('strictly')) {
        activityRestricted.push(s.trim());
      } else {
        activityAllowed.push(s.trim());
      }
    }
  }

  // 7. Wound care & Home care
  const homeCareInstructions: string[] = [];
  let homeCareEvidence: string | null = null;

  const homeMatch = normalized.match(/(?:HOME\s+CARE|WOUND\s+CARE)[:\s]*([\s\S]*?)(?=(?:WARNING|FOLLOW-UP|DIET|ACTIVITY|$))/i);
  if (homeMatch) {
    homeCareEvidence = homeMatch[0].trim();
    const text = homeMatch[1].trim();
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    for (const s of sentences) {
      homeCareInstructions.push(s.trim());
    }
  }

  // 8. Follow-up
  const followUp = parseFollowUpSection(normalized);

  return {
    patientId,
    admissionReason,
    medications,
    warningSigns: {
      explicitListGiven,
      signs: warningSignsList,
      actions: warningActions,
      evidence: warningEvidence,
    },
    dietInstructions: {
      instructions: dietInstructions,
      restrictions: dietRestrictions,
      evidence: dietEvidence,
    },
    activityInstructions: {
      allowed: activityAllowed,
      restricted: activityRestricted,
      evidence: activityEvidence,
    },
    homeCareAndWound: {
      instructions: homeCareInstructions,
      evidence: homeCareEvidence,
    },
    followUp,
    stoppedMedications,
    contradictionsDetected: contradictions,
  };
}

/**
 * Parses an individual medication line with exact preservation of clinical terms.
 */
function parseMedicationLine(line: string, id: string): MedicationFact | null {
  const cleanLine = line.trim();
  if (cleanLine.length < 3) return null;

  // Extract Name (first segment before comma, dosage or strength)
  let name = '';
  let strength: string | null = null;
  let dose: string | null = null;
  let route: string | null = null;
  let frequency: string | null = null;
  let timing: string | null = null;
  let duration: string | null = null;
  let durationDays: number | null = null;
  const missingFields: string[] = [];

  // Match strength e.g., "500 mg", "650 mg", "40 mg", "625 mg", "250 mg"
  const strengthMatch = cleanLine.match(/(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|IU|units|puffs))/i);
  if (strengthMatch) {
    strength = strengthMatch[1].trim();
  }

  // Medication Name: Everything before strength or first comma/colon
  const nameMatch = cleanLine.match(/^([A-Za-z0-9\s-]+?)(?:,|\s+\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|iu|units)|:)/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  } else {
    const parts = cleanLine.split(/[,:]/);
    name = parts[0].trim();
  }

  // Clean medication name from leading numbers/bullets and prefixes
  name = name.replace(/^\d+[\s.-]*/, '').replace(/^(?:tablet|capsule|tab|cap|inj|syp)\.?\s+/i, '').trim();

  // Dose: e.g. "one tablet", "1 tablet", "2 puffs", "1 capsule"
  const doseMatch = cleanLine.match(/(\b(?:one|two|three|\d+)\s+(?:tablet|tablets|tab|capsule|capsules|cap|puff|puffs|drop|drops|unit|units)\b)/i);
  if (doseMatch) {
    dose = doseMatch[1].trim();
  } else if (strength) {
    dose = strength;
  }

  // Route: "by mouth", "oral", "orally", "topical", "subcutaneous", "IV", "inhaled"
  const routeMatch = cleanLine.match(/(by mouth|orally|oral|sublingual|topical|intravenous|IV|subcutaneous|inhaled|via inhaler)/i);
  if (routeMatch) {
    route = routeMatch[1].toLowerCase() === 'oral' || routeMatch[1].toLowerCase() === 'orally' ? 'by mouth' : routeMatch[1];
  }

  // Frequency: "twice daily", "once daily", "every 6 hours", "every 8 hours", "three times daily"
  const freqMatch = cleanLine.match(/(twice daily|once daily|three times daily|every \d+ hours(?: as needed for [a-z]+)?|as needed|at bedtime|in the morning)/i);
  if (freqMatch) {
    frequency = freqMatch[1].trim();
  }

  // Timing: "with meals", "after meals", "before breakfast", "in the morning", "at bedtime"
  const timingMatch = cleanLine.match(/(?:in the morning\s*)?(?:30 minutes before breakfast|with meals|after meals|before breakfast|at bedtime|in the morning)/i);
  if (timingMatch) {
    timing = timingMatch[0].trim();
  }

  // Duration: "for five days", "for 5 days", "for 7 days", "for 30 days", "for 2 weeks"
  const durationMatch = cleanLine.match(/(?:for\s+)(\w+\s+(?:days|weeks|months|d)|(?:five|seven|ten|fourteen|thirty)\s+(?:days|weeks))/i);
  if (durationMatch) {
    duration = durationMatch[0].trim();
    // Parse integer days
    if (duration.includes('5') || duration.includes('five')) durationDays = 5;
    else if (duration.includes('7') || duration.includes('seven')) durationDays = 7;
    else if (duration.includes('10') || duration.includes('ten')) durationDays = 10;
    else if (duration.includes('14') || duration.includes('fourteen') || duration.includes('2 weeks')) durationDays = 14;
    else if (duration.includes('30') || duration.includes('thirty') || duration.includes('1 month')) durationDays = 30;
    else {
      const numMatch = duration.match(/\d+/);
      if (numMatch) durationDays = parseInt(numMatch[0], 10);
    }
  } else {
    // Check if missing
    if (cleanLine.toLowerCase().includes('duration not stated') || !cleanLine.toLowerCase().includes('for ')) {
      missingFields.push('duration');
    }
  }

  if (!route) missingFields.push('route');
  if (!frequency) missingFields.push('frequency');
  if (!dose && !strength) missingFields.push('dose');

  let uncertaintyFlag: string | null = null;
  if (missingFields.length > 0) {
    uncertaintyFlag = `Missing in source: ${missingFields.join(', ')}`;
  }

  return {
    id,
    name,
    strength,
    dose,
    route,
    frequency,
    timing,
    duration,
    durationDays,
    evidence: cleanLine,
    isMissingRequiredField: missingFields.length > 0,
    missingFields,
    uncertaintyFlag,
  };
}

/**
 * Parses Follow-up section and accurately flags relative timelines vs calendar dates.
 */
function parseFollowUpSection(text: string): FollowUpFact {
  const followUpMatch = text.match(/(?:FOLLOW-UP|FOLLOW\s+UP(?:\s+CARE)?|APPOINTMENT)[:\s]*([\s\S]*?)(?=(?:WARNING|DIET|ACTIVITY|MEDICATION|$))/i);
  
  if (!followUpMatch) {
    return {
      clinicianOrDept: null,
      exactDate: null,
      exactTime: null,
      relativeTimeline: null,
      relativeDays: null,
      isRelativeOnly: true,
      missingDetails: ['Appointment date', 'Time', 'Department'],
      evidence: 'No follow-up section found in source document.',
    };
  }

  const rawSection = followUpMatch[1].trim();
  const evidence = followUpMatch[0].trim();
  const missingDetails: string[] = [];

  // Clinician or department
  let clinicianOrDept: string | null = null;
  const deptMatch = rawSection.match(/(?:surgical outpatient department|general surgery outpatient department|cardiology & endocrine clinic|cardiology OPD|primary care clinic|pulmonology clinic|respiratory OPD|obstetrics & gynecology clinic|postnatal clinic|outpatient department|Dr\.\s*[A-Za-z]+)/i);
  if (deptMatch) {
    clinicianOrDept = deptMatch[0].trim();
  } else {
    missingDetails.push('Clinician/Department');
  }

  // Exact calendar date
  let exactDate: string | null = null;
  const dateMatch = rawSection.match(/(\d{1,2}(?:st|nd|rd|th)?[-/\s](?:January|February|March|April|May|June|July|August|September|October|November|December|[A-Za-z]{3})[-/\s]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (dateMatch) {
    exactDate = dateMatch[1].trim();
  }

  // Exact time
  let exactTime: string | null = null;
  const timeMatch = rawSection.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
  if (timeMatch) {
    exactTime = timeMatch[1].trim();
  }

  // Relative timeline
  let relativeTimeline: string | null = null;
  let relativeDays: number | null = null;
  const relMatch = rawSection.match(/(?:in\s+)?(seven days|7 days|10 days|14 days|two weeks|one week|within 10 days)/i);
  if (relMatch) {
    relativeTimeline = relMatch[0].trim();
    if (relativeTimeline.includes('7') || relativeTimeline.includes('seven') || relativeTimeline.includes('one week')) relativeDays = 7;
    else if (relativeTimeline.includes('10')) relativeDays = 10;
    else if (relativeTimeline.includes('14') || relativeTimeline.includes('two weeks')) relativeDays = 14;
  }

  // Check if source explicitly says date/time not supplied
  const notSuppliedNotice = rawSection.toLowerCase().includes('not supplied') || rawSection.toLowerCase().includes('to be confirmed');

  const isRelativeOnly = !exactDate;
  if (!exactDate) {
    missingDetails.push('Exact calendar date');
  }
  if (!exactTime) {
    missingDetails.push('Exact appointment time');
  }

  if (notSuppliedNotice && !missingDetails.includes('Exact calendar date')) {
    missingDetails.push('Exact calendar date not supplied in source');
  }

  return {
    clinicianOrDept,
    exactDate,
    exactTime,
    relativeTimeline,
    relativeDays,
    isRelativeOnly,
    missingDetails,
    evidence,
  };
}
