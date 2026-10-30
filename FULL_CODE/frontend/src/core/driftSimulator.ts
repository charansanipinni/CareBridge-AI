/**
 * CareBridge AI - Safety Engine Live Demonstration Simulator
 * 
 * Deliberately introduces controlled modifications into a care plan to verify
 * that the Faithfulness Validation Engine detects the clinical mismatch.
 * 
 * Per Master Product Build Specification Section 10:
 * "Add a validation-test mode that deliberately alters a dose or removes an instruction
 * and demonstrates that the validator detects the difference. The test mode must never
 * change the real source or silently modify the user's care plan."
 */

import { PatientCarePlan } from '../types/careplan';

export type DriftSimulationType = 'ALTER_DOSE' | 'OMIT_MEDICATION' | 'ALTER_FREQUENCY' | 'OMIT_WARNING' | 'INVENT_DATE';

export interface DriftResult {
  modifiedPlan: PatientCarePlan;
  description: string;
  expectedFlag: string;
}

export function simulateDrift(basePlan: PatientCarePlan, type: DriftSimulationType): DriftResult {
  // Deep clone base plan so original is untouched
  const clone: PatientCarePlan = JSON.parse(JSON.stringify(basePlan));

  switch (type) {
    case 'ALTER_DOSE': {
      if (clone.medications.length > 0) {
        const originalStrength = clone.medications[0].strength;
        // Mutate e.g. 500 mg to 50 mg
        clone.medications[0].strength = '50 mg';
        clone.medications[0].howMuch = '50 mg';
        return {
          modifiedPlan: clone,
          description: `Mutated ${clone.medications[0].medicineName} dose from "${originalStrength}" to "50 mg".`,
          expectedFlag: 'Dose / Strength Discrepancy',
        };
      }
      break;
    }

    case 'OMIT_MEDICATION': {
      if (clone.medications.length > 1) {
        const removed = clone.medications.pop();
        return {
          modifiedPlan: clone,
          description: `Silently removed prescribed medication "${removed?.medicineName}" from care plan.`,
          expectedFlag: 'Omitted Medication',
        };
      }
      break;
    }

    case 'ALTER_FREQUENCY': {
      if (clone.medications.length > 0) {
        const originalFreq = clone.medications[0].whenToTake;
        clone.medications[0].whenToTake = 'Take once daily at bedtime';
        return {
          modifiedPlan: clone,
          description: `Altered schedule for ${clone.medications[0].medicineName} from "${originalFreq}" to "once daily at bedtime".`,
          expectedFlag: 'Frequency Drift',
        };
      }
      break;
    }

    case 'OMIT_WARNING': {
      if (clone.warningSigns.urgentSigns.length > 0) {
        const removedSign = clone.warningSigns.urgentSigns.pop();
        return {
          modifiedPlan: clone,
          description: `Omitted red-flag emergency sign "${removedSign}".`,
          expectedFlag: 'Omitted Red-Flag Warning Sign',
        };
      }
      break;
    }

    case 'INVENT_DATE': {
      clone.followUp.timingDisplay = 'Date: 2026-11-20 at 10:00 AM (Invented)';
      return {
        modifiedPlan: clone,
        description: `Hallucinated an exact calendar appointment date when source only gave relative timing.`,
        expectedFlag: 'Hallucinated Calendar Date in Follow-up',
      };
    }
  }

  return {
    modifiedPlan: clone,
    description: 'No modification applied.',
    expectedFlag: 'None',
  };
}
