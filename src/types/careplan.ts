/**
 * CareBridge AI - Strict Healthcare Data Schema
 * Discharge Summary to Patient-Understandable Care Plan
 */

export type ProcessingMode = 'DEMO' | 'AI';

export type LanguageCode = 'en' | 'te';

export interface MedicationFact {
  id: string;
  name: string;
  strength: string | null;         // e.g. "500 mg"
  dose: string | null;             // e.g. "one tablet"
  route: string | null;            // e.g. "by mouth", "oral"
  frequency: string | null;        // e.g. "twice daily", "every 12 hours"
  timing: string | null;           // e.g. "with meals", "before breakfast"
  duration: string | null;         // e.g. "5 days"
  durationDays?: number | null;    // parsed integer days if specified
  evidence: string;                // Exact sentence from source document
  isMissingRequiredField?: boolean;
  missingFields?: string[];
  uncertaintyFlag?: string | null;
}

export interface FollowUpFact {
  clinicianOrDept: string | null;
  exactDate: string | null;        // null if only relative
  exactTime: string | null;
  relativeTimeline: string | null; // e.g. "in seven days"
  relativeDays?: number | null;    // parsed relative days (e.g. 7, 10, 14)
  isRelativeOnly: boolean;
  missingDetails: string[];
  evidence: string;
}

export interface ClinicalFacts {
  patientId: string | null;
  admissionReason: string | null;
  medications: MedicationFact[];
  warningSigns: {
    explicitListGiven: boolean;
    signs: string[];
    actions: string[];
    evidence: string;
  };
  dietInstructions: {
    instructions: string[];
    restrictions: string[];
    evidence: string | null;
  };
  activityInstructions: {
    allowed: string[];
    restricted: string[];
    evidence: string | null;
  };
  homeCareAndWound: {
    instructions: string[];
    evidence: string | null;
  };
  followUp: FollowUpFact;
  contradictionsDetected: string[];
}

export interface PatientMedicationInstruction {
  id: string;
  medicineName: string;
  strength: string;
  howMuch: string;
  route: string;
  whenToTake: string;
  forHowLong: string;
  durationDays?: number | null;
  purposeOrNote?: string;
  validationStatus: 'MATCHED' | 'DISCREPANCY' | 'UNVERIFIED';
  discrepancyReason?: string;
  sourceEvidence: string;
}

export interface DaySchedule {
  dayNumber: number; // 1 to 7
  dayLabel: string;  // e.g. "Day 1 (Today)", "Day 2", etc.
  morning: string[];
  afternoon: string[];
  evening: string[];
  bedtime: string[];
  woundCare?: string[];
  notes?: string[];
  isFollowUpDay?: boolean;
}

export interface PatientCarePlan {
  language: LanguageCode;
  careSummary: string;
  medications: PatientMedicationInstruction[];
  dailyCare: string[];
  foodAndDrink: string[];
  activity: string[];
  warningSigns: {
    hasSpecificWarnings: boolean;
    urgentSigns: string[];
    actionToTake: string;
    notice?: string;
  };
  followUp: {
    departmentOrDoctor: string;
    timingDisplay: string;
    missingNotice?: string;
  };
  questionsForCareTeam: string[];
  readabilityScore: {
    fleschKincaidGradeLevel: number;
    targetGrade: string; // "~Class 8"
    isWithinTarget: boolean;
    notes: string;
  };
  sevenDaySchedule: DaySchedule[];
}

export type CheckSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface ValidationCheck {
  id: string;
  category: 'MEDICATION' | 'FOLLOW_UP' | 'WARNING_SIGNS' | 'DIET_ACTIVITY' | 'TRANSLATION' | 'CONTRADICTION' | 'SECURITY';
  title: string;
  detail: string;
  severity: CheckSeverity;
  status: 'PASSED' | 'FAILED' | 'UNRESOLVED';
  sourceEvidence?: string;
  generatedEvidence?: string;
}

export interface FaithfulnessReport {
  overallStatus: 'VERIFIED_CONSISTENT' | 'NEEDS_REVIEW';
  summaryBadge: {
    label: string;
    variant: 'success' | 'danger' | 'warning';
    description: string;
  };
  passedCount: number;
  failedCount: number;
  unresolvedCount: number;
  checks: ValidationCheck[];
  missingSourceInstructions: string[];
  unsupportedAdditions: string[];
  uncertainFacts: string[];
  itemsRequiringClinicianReview: string[];
  disclaimer: string;
}

export interface CareBridgeResult {
  id: string;
  timestamp: string;
  sourceText: string;
  sourceType: 'SYNTHETIC_DEMO' | 'PASTED' | 'UPLOADED';
  mode: ProcessingMode;
  facts: ClinicalFacts;
  carePlanEnglish: PatientCarePlan;
  carePlanTelugu: PatientCarePlan;
  faithfulnessReport: FaithfulnessReport;
  faithfulnessReportTelugu: FaithfulnessReport;
  verificationToken?: string;
  securityThreats?: string[];
}
