import { describe, it, expect } from 'vitest';
import { 
  categorizeMedicationSlots, 
  generateRemindersFromPlan, 
  generateCalendarICS, 
  generateWhatsAppUrl 
} from '../utils/reminderEngine';
import { PatientCarePlan, ClinicalFacts } from '../types/careplan';

describe('CareBridge AI - Prescription Reminder Engine', () => {
  const sampleFacts: ClinicalFacts = {
    patientId: 'SYNTH-89241',
    admissionReason: 'Acute cholecystitis post laparoscopic cholecystectomy',
    medications: [
      {
        id: 'med-1',
        name: 'Pantoprazole',
        strength: '40 mg',
        dose: '1 tablet',
        route: 'oral',
        frequency: 'OD',
        timing: 'before breakfast',
        duration: '7 days',
        evidence: 'T. Pantocid 40mg OD AC (before breakfast) x 7 days',
      },
      {
        id: 'med-2',
        name: 'Amoxicillin-Clavulanate',
        strength: '625 mg',
        dose: '1 tablet',
        route: 'oral',
        frequency: 'BD',
        timing: 'after meals',
        duration: '5 days',
        evidence: 'T. Augmentin 625mg BD PC (after meals) x 5 days',
      },
      {
        id: 'med-3',
        name: 'Atorvastatin',
        strength: '20 mg',
        dose: '1 tablet',
        route: 'oral',
        frequency: 'HS',
        timing: 'at bedtime',
        duration: 'lifelong',
        evidence: 'T. Atorva 20mg HS (at bedtime)',
      },
    ],
    warningSigns: {
      explicitListGiven: true,
      signs: ['Persistent high fever > 101°F'],
      actions: ['Seek immediate emergency care'],
      evidence: 'Fever > 101 report',
    },
    dietInstructions: { instructions: ['Light diet'], restrictions: [], evidence: null },
    activityInstructions: { allowed: ['Light walking'], restricted: [], evidence: null },
    homeCareAndWound: { instructions: ['Keep dry'], evidence: null },
    followUp: {
      clinicianOrDept: 'Surgical OPD',
      exactDate: '2026-08-15',
      exactTime: '10:00 AM',
      relativeTimeline: 'in 7 days',
      isRelativeOnly: false,
      missingDetails: [],
      evidence: 'Review on 15.08.2026',
    },
    contradictionsDetected: [],
  };

  const samplePlan: PatientCarePlan = {
    language: 'en',
    careSummary: 'Post laparoscopic cholecystectomy care instructions.',
    medications: [
      {
        id: 'med-1',
        medicineName: 'Pantoprazole',
        strength: '40 mg',
        howMuch: '1 tablet',
        route: 'Take by mouth',
        whenToTake: 'once daily, in the morning 30 minutes before breakfast',
        forHowLong: 'for 7 days',
        validationStatus: 'MATCHED',
        sourceEvidence: 'T. Pantocid 40mg OD AC',
      },
      {
        id: 'med-2',
        medicineName: 'Amoxicillin-Clavulanate',
        strength: '625 mg',
        howMuch: '1 tablet',
        route: 'Take by mouth',
        whenToTake: 'twice daily, after meals',
        forHowLong: 'for 5 days',
        validationStatus: 'MATCHED',
        sourceEvidence: 'T. Augmentin 625mg BD PC',
      },
      {
        id: 'med-3',
        medicineName: 'Atorvastatin',
        strength: '20 mg',
        howMuch: '1 tablet',
        route: 'Take by mouth',
        whenToTake: 'once daily, at bedtime before sleeping',
        forHowLong: 'lifelong',
        validationStatus: 'MATCHED',
        sourceEvidence: 'T. Atorva 20mg HS',
      },
    ],
    dailyCare: ['Keep puncture sites dry.'],
    foodAndDrink: ['Low fat light diet.'],
    activity: ['Light walking encouraged.'],
    warningSigns: {
      hasSpecificWarnings: true,
      urgentSigns: ['High fever > 101°F'],
      actionToTake: 'Report to emergency.',
    },
    followUp: {
      departmentOrDoctor: 'Surgical OPD',
      timingDisplay: '15-Aug-2026 at 10:00 AM',
    },
    questionsForCareTeam: [],
    readabilityScore: {
      fleschKincaidGradeLevel: 7.9,
      targetGrade: '~Class 8',
      isWithinTarget: true,
      notes: 'Clear plain language',
    },
    sevenDaySchedule: [],
  };

  describe('1. Slot Categorization from Prescription Text', () => {
    it('correctly maps breakfast medications to morning slot', () => {
      const slots = categorizeMedicationSlots(samplePlan.medications[0]);
      expect(slots).toContain('morning');
    });

    it('correctly maps twice daily (BD) medications to morning and evening slots', () => {
      const slots = categorizeMedicationSlots(samplePlan.medications[1]);
      expect(slots).toContain('morning');
      expect(slots).toContain('evening');
    });

    it('correctly maps bedtime (HS) medications to bedtime slot', () => {
      const slots = categorizeMedicationSlots(samplePlan.medications[2]);
      expect(slots).toContain('bedtime');
    });
  });

  describe('2. Schedule Derivation & Bilingual Reminders', () => {
    it('derives morning, evening, bedtime, and follow-up slots for the prescription', () => {
      const slots = generateRemindersFromPlan(samplePlan, sampleFacts);
      const slotIds = slots.map((s) => s.slot);

      expect(slotIds).toContain('morning');
      expect(slotIds).toContain('evening');
      expect(slotIds).toContain('bedtime');
      expect(slotIds).toContain('followup');

      const morningSlot = slots.find((s) => s.slot === 'morning');
      expect(morningSlot?.items.some((i) => i.medicineName === 'Pantoprazole')).toBe(true);
      expect(morningSlot?.items.some((i) => i.medicineName === 'Amoxicillin-Clavulanate')).toBe(true);
    });

    it('generates natural Telugu reminder messages when Telugu plan is provided', () => {
      const teluguPlan: PatientCarePlan = {
        ...samplePlan,
        language: 'te',
      };
      const slots = generateRemindersFromPlan(teluguPlan, sampleFacts);
      const morningSlot = slots.find((s) => s.slot === 'morning');

      expect(morningSlot?.labelTe).toBe('ఉదయం మందులు (అల్పాహారం)');
      expect(morningSlot?.messageTe).toContain('కేర్‌బ్రిడ్జ్ ఉదయం రిమైండర్:');
      expect(morningSlot?.messageTe).toContain('Pantoprazole');
    });
  });

  describe('3. Calendar (.ics) & WhatsApp Dispatch', () => {
    it('generates standard compliant iCalendar (.ics) format with VALARM notifications', () => {
      const slots = generateRemindersFromPlan(samplePlan, sampleFacts);
      const ics = generateCalendarICS(slots, 'SYNTH-89241', 7);

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('BEGIN:VALARM');
      expect(ics).toContain('ACTION:DISPLAY');
      expect(ics).toContain('END:VCALENDAR');
    });

    it('generates valid WhatsApp click-to-chat URL with encoded reminder text', () => {
      const url = generateWhatsAppUrl('9876543210', '⏰ Time for Pantoprazole 40 mg!');
      expect(url).toContain('https://api.whatsapp.com/send?phone=9876543210&text=');
      expect(url).toContain(encodeURIComponent('⏰ Time for Pantoprazole 40 mg!'));
    });
  });
});
