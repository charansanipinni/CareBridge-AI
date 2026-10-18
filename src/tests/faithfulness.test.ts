/**
 * CareBridge AI - Automated Faithfulness Engine Tests
 * Covers all 12 mandatory clinical safety scenarios:
 * 1. Correct extraction of a medicine name
 * 2. Correct matching of dose and units
 * 3. Detection of a missing medication
 * 4. Detection of an extra unsupported medication (hallucination)
 * 5. Detection of a changed frequency
 * 6. Detection of a changed duration
 * 7. Detection of a changed follow-up date
 * 8. Detection of omitted warning signs
 * 9. Handling of unknown or missing values
 * 10. Translation output that changes a number or medication instruction
 * 11. Handling of contradictory source instructions
 * 12. Demo mode working without API credentials
 */

import { describe, it, expect } from 'vitest';
import { extractClinicalFacts } from '../core/extractor';
import { generatePatientCarePlan } from '../core/generator';
import { validateCarePlanFaithfulness } from '../core/validator';
import { SAMPLE_CASES } from '../data/sampleSummaries';

describe('CareBridge AI - Clinical Safety & Faithfulness Verification Suite', () => {

  // Test 1: Correct extraction of a medicine name
  it('1. Correctly extracts medicine names from source document', () => {
    const raw = `MEDICATION:\nMedicine A, 500 mg tablet, take one tablet by mouth twice daily for five days.`;
    const facts = extractClinicalFacts(raw);

    expect(facts.medications.length).toBe(1);
    expect(facts.medications[0].name).toBe('Medicine A');
  });

  // Test 2: Correct matching of dose and units
  it('2. Correctly extracts and matches dose, strength, and units', () => {
    const raw = `MEDICATION:\nAmoxicillin-Clavulanate 625 mg oral tablet, 1 tablet twice daily for 5 days.`;
    const facts = extractClinicalFacts(raw);
    const plan = generatePatientCarePlan(facts, 'en');
    const report = validateCarePlanFaithfulness(raw, facts, plan);

    expect(facts.medications[0].strength).toBe('625 mg');
    const doseMatchCheck = report.checks.find(c => c.id.includes('chk-dose-match'));
    expect(doseMatchCheck).toBeDefined();
    expect(doseMatchCheck?.status).toBe('PASSED');
  });

  // Test 3: Detection of a missing medication
  it('3. Successfully detects when a source medication is omitted from care plan', () => {
    const raw = `MEDICATIONS:\n1. Paracetamol 650 mg tablet, every 6 hours.\n2. Pantoprazole 40 mg tablet, once daily.`;
    const facts = extractClinicalFacts(raw);
    const plan = generatePatientCarePlan(facts, 'en');

    // Artificially drop Pantoprazole to test safety detector
    plan.medications = plan.medications.filter(m => !m.medicineName.toLowerCase().includes('pantoprazole'));

    const report = validateCarePlanFaithfulness(raw, facts, plan);
    expect(report.overallStatus).toBe('NEEDS_REVIEW');
    expect(report.missingSourceInstructions.some(m => m.includes('Pantoprazole'))).toBe(true);

    const omittedCheck = report.checks.find(c => c.category === 'MEDICATION' && c.status === 'FAILED');
    expect(omittedCheck).toBeDefined();
    expect(omittedCheck?.title).toContain('Omitted Medication');
  });

  // Test 4: Detection of an extra unsupported medication (Hallucination detector)
  it('4. Successfully detects when an unsupported / hallucinated medicine is added', () => {
    const raw = `MEDICATION:\nMedicine A, 500 mg tablet, take one tablet by mouth twice daily for five days.`;
    const facts = extractClinicalFacts(raw);
    const plan = generatePatientCarePlan(facts, 'en');

    // Simulate an AI model hallucinating an opioid or antibiotic not in source
    plan.medications.push({
      id: 'hallucinated-1',
      medicineName: 'Oxycodone',
      strength: '10 mg',
      howMuch: '1 tablet',
      route: 'by mouth',
      whenToTake: 'every 4 hours',
      forHowLong: '7 days',
      validationStatus: 'UNVERIFIED',
      sourceEvidence: 'None',
    });

    const report = validateCarePlanFaithfulness(raw, facts, plan);
    expect(report.overallStatus).toBe('NEEDS_REVIEW');
    expect(report.unsupportedAdditions.length).toBeGreaterThan(0);
    expect(report.unsupportedAdditions[0]).toContain('Oxycodone');

    const unsuppCheck = report.checks.find(c => c.title.includes('Unsupported Medication'));
    expect(unsuppCheck).toBeDefined();
    expect(unsuppCheck?.severity).toBe('CRITICAL');
    expect(unsuppCheck?.status).toBe('FAILED');
  });

  // Test 5: Detection of a changed frequency
  it('5. Successfully detects altered frequency (e.g., twice daily changed to once daily)', () => {
    const raw = `MEDICATION:\nMedicine A, 500 mg tablet, take one tablet by mouth twice daily for five days.`;
    const facts = extractClinicalFacts(raw);
    const plan = generatePatientCarePlan(facts, 'en');

    // Simulate frequency drift
    plan.medications[0].whenToTake = 'Take once daily in the evening';

    const report = validateCarePlanFaithfulness(raw, facts, plan);
    expect(report.overallStatus).toBe('NEEDS_REVIEW');
    const freqCheck = report.checks.find(c => c.title.includes('Frequency Drift'));
    expect(freqCheck).toBeDefined();
    expect(freqCheck?.status).toBe('FAILED');
  });

  // Test 6: Detection of a changed duration
  it('6. Successfully detects altered duration (e.g., 5 days changed to 14 days)', () => {
    const raw = `MEDICATION:\nMedicine A, 500 mg tablet, take one tablet by mouth twice daily for five days.`;
    const facts = extractClinicalFacts(raw);
    const plan = generatePatientCarePlan(facts, 'en');

    // Alter duration from 5 days to 14 days
    plan.medications[0].forHowLong = 'for 14 days';

    const report = validateCarePlanFaithfulness(raw, facts, plan);
    expect(report.overallStatus).toBe('NEEDS_REVIEW');
    const durCheck = report.checks.find(c => c.title.includes('Duration Discrepancy'));
    expect(durCheck).toBeDefined();
    expect(durCheck?.status).toBe('FAILED');
  });

  // Test 7: Detection of a changed or hallucinated follow-up date
  it('7. Flags invented calendar dates when source only specified relative timeline', () => {
    const raw = `FOLLOW-UP:\nAttend the surgical outpatient department in seven days. The exact appointment date and time were not supplied.`;
    const facts = extractClinicalFacts(raw);
    expect(facts.followUp.isRelativeOnly).toBe(true);

    const plan = generatePatientCarePlan(facts, 'en');

    // Simulate a model hallucinating a specific calendar date
    plan.followUp.timingDisplay = 'Date: 2026-11-05 at 09:00 AM';

    const report = validateCarePlanFaithfulness(raw, facts, plan);
    expect(report.overallStatus).toBe('NEEDS_REVIEW');
    const followupCheck = report.checks.find(c => c.id === 'chk-followup-invented');
    expect(followupCheck).toBeDefined();
    expect(followupCheck?.status).toBe('FAILED');
  });

  // Test 8: Detection of omitted warning signs
  it('8. Flags when source warning signs are omitted from the generated care plan', () => {
    const raw = `DISCHARGE SUMMARY\nWARNING SIGNS:\n- Persistent high fever above 101 F\n- Yellowing of skin or eyes`;
    const facts = extractClinicalFacts(raw);
    const plan = generatePatientCarePlan(facts, 'en');

    // Simulate omission of yellowing of skin warning sign
    plan.warningSigns.urgentSigns = ['Persistent high fever'];

    const report = validateCarePlanFaithfulness(raw, facts, plan);
    expect(report.overallStatus).toBe('NEEDS_REVIEW');
    const omittedSignCheck = report.checks.find(c => c.title.includes('Omitted Red-Flag'));
    expect(omittedSignCheck).toBeDefined();
  });

  // Test 9: Handling of unknown or missing values without inventing details
  it('9. Preserves unknown or missing fields as unresolved caveats without guessing', () => {
    const sample = SAMPLE_CASES[0]; // Fictional Demo Benchmark
    const facts = extractClinicalFacts(sample.sourceText);
    const plan = generatePatientCarePlan(facts, 'en');
    const report = validateCarePlanFaithfulness(sample.sourceText, facts, plan);

    // Follow-up date was not supplied in benchmark
    expect(facts.followUp.isRelativeOnly).toBe(true);
    expect(facts.followUp.exactDate).toBeNull();
    expect(facts.followUp.missingDetails).toContain('Exact calendar date');

    // Warning signs were explicitly deferred, not fabricated
    expect(facts.warningSigns.explicitListGiven).toBe(false);
    expect(plan.warningSigns.hasSpecificWarnings).toBe(false);

    // The validation report notes that non-invention of warning signs passed
    const deferredWarningCheck = report.checks.find(c => c.id === 'chk-warning-deferred-safe');
    expect(deferredWarningCheck?.status).toBe('PASSED');
  });

  // Test 10: Translation output that changes a number or medication instruction
  it('10. Detects when a translated (Telugu) version alters a numerical dose', () => {
    const raw = `MEDICATION:\nMedicine A, 500 mg tablet, take one tablet by mouth twice daily for five days.`;
    const facts = extractClinicalFacts(raw);
    const teluguPlan = generatePatientCarePlan(facts, 'te');

    // Simulate corrupted translation where 500 mg became 50 mg
    teluguPlan.medications[0].strength = '50 mg';
    teluguPlan.medications[0].howMuch = '50 mg';

    const report = validateCarePlanFaithfulness(raw, facts, teluguPlan);
    expect(report.overallStatus).toBe('NEEDS_REVIEW');
    const teCheck = report.checks.find(c => c.id.includes('chk-te-num-mismatch'));
    expect(teCheck).toBeDefined();
    expect(teCheck?.status).toBe('FAILED');
  });

  // Test 11: Handling of contradictory source instructions
  it('11. Accurately detects and flags contradictory instructions in source text', () => {
    const rawContradictory = `MEDICATIONS:\nMedicine B 250 mg tablet: Take one tablet by mouth once daily in the morning. Note: take twice daily if discomfort persists.`;
    const facts = extractClinicalFacts(rawContradictory);

    expect(facts.contradictionsDetected.length).toBeGreaterThan(0);
    expect(facts.contradictionsDetected[0]).toContain('Conflicting frequencies');

    const plan = generatePatientCarePlan(facts, 'en');
    const report = validateCarePlanFaithfulness(rawContradictory, facts, plan);

    expect(report.overallStatus).toBe('NEEDS_REVIEW');
    const contraCheck = report.checks.find(c => c.category === 'CONTRADICTION');
    expect(contraCheck?.status).toBe('FAILED');
  });

  // Test 12: Demo mode working without API credentials
  it('12. Operates completely deterministically in Demo Mode without API credentials', () => {
    for (const sample of SAMPLE_CASES) {
      const facts = extractClinicalFacts(sample.sourceText);
      expect(facts).toBeDefined();

      const enPlan = generatePatientCarePlan(facts, 'en');
      expect(enPlan.medications.length).toBeGreaterThan(0);
      expect(enPlan.readabilityScore.fleschKincaidGradeLevel).toBeGreaterThan(0);

      const tePlan = generatePatientCarePlan(facts, 'te');
      expect(tePlan.careSummary).toContain('ఆసుపత్రి');

      const report = validateCarePlanFaithfulness(sample.sourceText, facts, enPlan);
      expect(report.summaryBadge).toBeDefined();

      // For sample 4 (adversarial case), safety engine must fail and mark NEEDS_REVIEW
      if (sample.isAdversarial) {
        expect(report.overallStatus).toBe('NEEDS_REVIEW');
      }
    }
  });

});
