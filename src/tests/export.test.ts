import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadCarePlanJSON, printCarePlanElement } from '../utils/exportUtils';
import { jsPDF } from 'jspdf';
import { PatientCarePlan, ClinicalFacts, FaithfulnessReport } from '../types/careplan';

describe('CareBridge AI - Export & Print Engine', () => {
  const sampleFacts: ClinicalFacts = {
    patientId: 'SYNTH-89241',
    admissionReason: 'Acute cholecystitis post laparoscopic cholecystectomy',
    medications: [
      {
        id: 'med-1',
        name: 'Paracetamol',
        strength: '650 mg',
        dose: '1 tablet',
        route: 'oral',
        frequency: 'Q6H PRN',
        timing: 'after food',
        duration: 'for 5 days',
        evidence: 'T. Paracetamol 650mg Q6H PRN for 5 days',
      },
      {
        id: 'med-2',
        name: 'Amoxicillin-Clavulanate',
        strength: '625 mg',
        dose: '1 tablet',
        route: 'oral',
        frequency: 'BD',
        timing: 'after food',
        duration: 'for 5 days',
        evidence: 'T. Augmentin 625mg BD x 5 days',
      },
    ],
    stoppedMedications: ['Ibuprofen 400 mg'],
    warningSigns: {
      explicitListGiven: true,
      signs: ['Persistent high fever > 101°F', 'Severe abdominal pain', 'Jaundice / yellow eyes'],
      actions: ['Seek immediate emergency medical evaluation at Chandrapuri District Hospital'],
      evidence: 'Red flags: fever > 101, jaundice, acute abdomen',
    },
    dietInstructions: {
      instructions: ['Maintain a light, low-fat recovery diet', 'Drink 2 to 2.5 litres of water daily'],
      restrictions: ['Avoid oily, deep-fried foods'],
      evidence: 'Low-fat diet, good hydration',
    },
    activityInstructions: {
      allowed: ['Light walking around the house is encouraged'],
      restricted: ['Avoid lifting objects heavier than 5 kg for 2 weeks'],
      evidence: 'No heavy lifting > 5kg x 2 weeks',
    },
    homeCareAndWound: {
      instructions: ['Keep laparoscopic puncture sites dry and clean for 48 hours'],
      evidence: 'Keep dressings clean and dry',
    },
    followUp: {
      clinicianOrDept: 'Surgical OPD',
      exactDate: '2026-08-15',
      exactTime: '10:00 AM',
      relativeTimeline: 'in 7 days',
      isRelativeOnly: false,
      missingDetails: [],
      evidence: 'Review in Surgical OPD on 15.08.2026 at 10 AM',
    },
    contradictionsDetected: [],
  };

  const samplePlan: PatientCarePlan = {
    language: 'en',
    careSummary: 'You are returning home after laparoscopic cholecystectomy.',
    medications: [
      {
        id: 'med-1',
        medicineName: 'Paracetamol',
        strength: '650 mg',
        howMuch: '1 tablet',
        route: 'Take by mouth',
        whenToTake: 'every 6 hours as needed for pain',
        forHowLong: 'for 5 days',
        validationStatus: 'MATCHED',
        sourceEvidence: 'T. Paracetamol 650mg Q6H PRN for 5 days',
      },
      {
        id: 'med-2',
        medicineName: 'Amoxicillin-Clavulanate',
        strength: '625 mg',
        howMuch: '1 tablet',
        route: 'Take by mouth',
        whenToTake: 'twice daily, after food',
        forHowLong: 'for 5 days',
        validationStatus: 'MATCHED',
        sourceEvidence: 'T. Augmentin 625mg BD x 5 days',
      },
    ],
    dailyCare: ['Keep laparoscopic puncture sites dry and clean for 48 hours.'],
    foodAndDrink: ['Maintain a light, low-fat recovery diet.', 'Drink 2 to 2.5 litres of water daily.'],
    activity: ['Light walking is encouraged.', 'Avoid lifting objects > 5kg.'],
    warningSigns: {
      hasSpecificWarnings: true,
      urgentSigns: ['Persistent fever > 101°F', 'Severe abdominal pain'],
      actionToTake: 'Seek immediate emergency medical evaluation.',
    },
    followUp: {
      departmentOrDoctor: 'Surgical OPD',
      timingDisplay: '15-Aug-2026 at 10:00 AM',
    },
    questionsForCareTeam: ['When can I resume driving?'],
    readabilityScore: {
      fleschKincaidGradeLevel: 7.8,
      targetGrade: '~Class 8',
      isWithinTarget: true,
      notes: 'Clear, plain-language patient recovery instructions.',
    },
    sevenDaySchedule: [],
  };

  const sampleReport: FaithfulnessReport = {
    overallStatus: 'VERIFIED_CONSISTENT',
    summaryBadge: {
      label: 'Verified Consistent',
      variant: 'success',
      description: 'Zero medication hallucinations or unprescribed dosage changes.',
    },
    passedCount: 15,
    failedCount: 0,
    unresolvedCount: 0,
    checks: [],
    missingSourceInstructions: [],
    unsupportedAdditions: [],
    uncertainFacts: [],
    itemsRequiringClinicianReview: [],
    disclaimer: 'CareBridge AI assistive verification.',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. JSON Direct Download', () => {
    it('creates a valid CareBridge_Care_Plan.json Blob with all medical fields preserved', () => {
      let createdBlob: Blob | null = null;
      let downloadFilename: string | null = null;
      let clicked = false;

      // Mock DOM methods for Blob download
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(() => {
          clicked = true;
        }),
      };

      globalThis.URL.createObjectURL = vi.fn((blob: Blob) => {
        createdBlob = blob;
        return 'blob:mock-url';
      });
      globalThis.URL.revokeObjectURL = vi.fn();

      const originalCreateElement = globalThis.document?.createElement;
      const originalAppendChild = globalThis.document?.body?.appendChild;
      const originalRemoveChild = globalThis.document?.body?.removeChild;

      // Provide minimal DOM mock if in Node
      (globalThis as any).document = {
        createElement: vi.fn((tag: string) => {
          if (tag === 'a') return mockAnchor;
          return {};
        }),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      };

      downloadCarePlanJSON(samplePlan, sampleFacts, sampleReport);

      expect(mockAnchor.download).toBe('CareBridge_Care_Plan.json');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(clicked).toBe(true);
      expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(createdBlob).not.toBeNull();
      expect(createdBlob!.type).toBe('application/json;charset=utf-8');

      // Restore
      if (originalCreateElement) globalThis.document.createElement = originalCreateElement;
      if (originalAppendChild) globalThis.document.body.appendChild = originalAppendChild;
      if (originalRemoveChild) globalThis.document.body.removeChild = originalRemoveChild;
    });

    it('preserves exact medical entities, dosages, and stops in JSON output', async () => {
      let jsonContent = '';

      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      (globalThis as any).URL.createObjectURL = vi.fn((blob: Blob) => {
        return 'blob:mock';
      });

      // Intercept Blob constructor to inspect data
      const OriginalBlob = globalThis.Blob;
      (globalThis as any).Blob = class MockBlob extends OriginalBlob {
        constructor(parts: any[], options: any) {
          super(parts, options);
          jsonContent = parts[0];
        }
      };

      (globalThis as any).document = {
        createElement: vi.fn(() => mockAnchor),
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
      };

      downloadCarePlanJSON(samplePlan, sampleFacts, sampleReport);

      const parsed = JSON.parse(jsonContent);
      expect(parsed.product).toBe('CareBridge AI');
      expect(parsed.patientId).toBe('SYNTH-89241');
      expect(parsed.carePlan.medications).toHaveLength(2);
      expect(parsed.carePlan.medications[0].medicineName).toBe('Paracetamol');
      expect(parsed.carePlan.medications[0].strength).toBe('650 mg');
      expect(parsed.carePlan.stoppedMedications).toContain('Ibuprofen 400 mg');
      expect(parsed.facts.warningSigns.signs).toContain('Persistent high fever > 101°F');
      expect(parsed.verificationStatus).toBe('VERIFIED_CONSISTENT');

      // Restore Blob
      globalThis.Blob = OriginalBlob;
    });

    it('preserves authentic Telugu script in Telugu care plan JSON exports', () => {
      let jsonContent = '';
      const teluguPlan: PatientCarePlan = {
        ...samplePlan,
        language: 'te',
        careSummary: 'లాపరోస్కోపిక్ కోలిసిస్టెక్టమీ శస్త్రచికిత్స తర్వాత మీరు ఇంటి వద్ద విశ్రాంతి తీసుకుంటున్నారు.',
        medications: [
          {
            ...samplePlan.medications[0],
            whenToTake: 'నొప్పి ఉన్నప్పుడు ప్రతి 6 గంటలకు ఒకసారి',
            forHowLong: '5 రోజుల పాటు',
          },
        ],
      };

      const OriginalBlob = globalThis.Blob;
      (globalThis as any).Blob = class MockBlob extends OriginalBlob {
        constructor(parts: any[], options: any) {
          super(parts, options);
          jsonContent = parts[0];
        }
      };

      (globalThis as any).document = {
        createElement: vi.fn(() => ({ click: vi.fn(), download: '' })),
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
      };

      downloadCarePlanJSON(teluguPlan, sampleFacts, sampleReport);

      const parsed = JSON.parse(jsonContent);
      expect(parsed.language).toBe('te');
      expect(parsed.carePlan.careSummary).toContain('లాపరోస్కోపిక్ కోలిసిస్టెక్టమీ');
      expect(parsed.carePlan.medications[0].medicineName).toBe('Paracetamol'); // Latin drug preserved
      expect(parsed.carePlan.medications[0].forHowLong).toBe('5 రోజుల పాటు');

      globalThis.Blob = OriginalBlob;
    });
  });

  describe('2. A4 PDF Generation (jsPDF)', () => {
    it('initializes valid A4 PDF document with correct 210mm x 297mm dimensions', () => {
      const doc = new jsPDF('p', 'mm', 'a4');
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      expect(Math.round(width)).toBe(210);
      expect(Math.round(height)).toBe(297);

      doc.setFontSize(16);
      doc.text('CareBridge AI Prescription', 10, 20);

      const output = doc.output('arraybuffer');
      expect(output.byteLength).toBeGreaterThan(1000);

      // Verify PDF magic header bytes
      const header = String.fromCharCode(...new Uint8Array(output.slice(0, 5)));
      expect(header).toBe('%PDF-');
    });

    it('supports multi-page document pagination without errors', () => {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.text('Page 1 - Patient Care Summary', 10, 20);
      doc.addPage();
      doc.text('Page 2 - Follow-up and Dietary Guidance', 10, 20);

      expect(doc.getNumberOfPages()).toBe(2);

      const output = doc.output('arraybuffer');
      expect(output.byteLength).toBeGreaterThan(1500);
    });
  });

  describe('3. Isolated Print Layout', () => {
    it('isolates printable content inside a hidden iframe and injects A4 print CSS', async () => {
      let writtenHtml = '';
      let printCalled = false;

      const mockIframeDoc = {
        open: vi.fn(),
        write: vi.fn((html: string) => {
          writtenHtml = html;
        }),
        close: vi.fn(),
        fonts: {
          ready: Promise.resolve(),
        },
      };

      const mockIframe = {
        id: '',
        style: {},
        contentWindow: {
          document: mockIframeDoc,
          focus: vi.fn(),
          print: vi.fn(() => {
            printCalled = true;
          }),
        },
        remove: vi.fn(),
      };

      (globalThis as any).document = {
        getElementById: vi.fn(() => null),
        createElement: vi.fn((tag: string) => {
          if (tag === 'iframe') return mockIframe;
          return {};
        }),
        body: {
          appendChild: vi.fn(),
        },
      };

      // Mock DOM element to print
      const mockElement = {
        cloneNode: vi.fn(() => ({
          querySelectorAll: vi.fn(() => []),
          outerHTML: '<div class="printable-care-sheet"><h1>PATIENT DISCHARGE CARE PLAN</h1></div>',
        })),
      } as any;

      const printPromise = printCarePlanElement(mockElement);
      await printPromise;

      expect(writtenHtml).toContain('@page');
      expect(writtenHtml).toContain('size: A4 portrait');
      expect(writtenHtml).toContain('PATIENT DISCHARGE CARE PLAN');
      expect(printCalled).toBe(true);
    });
  });
});
