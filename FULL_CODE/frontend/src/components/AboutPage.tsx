import React from 'react';
import { HeartPulse, Shield, Users, Award, CheckCircle2, AlertTriangle, ArrowRight, FileText } from 'lucide-react';

interface AboutPageProps {
  onStartCreate: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onStartCreate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
          <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
          <span>About CareBridge AI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Clear Instructions. Safer Transitions Home.
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Developed by <strong>Team AVENGERS</strong> for the Talent AP Mega Hackathon 2026 (Healthcare Track H2). Our mission is to eliminate post-discharge medication errors and confusion for patients and families.
        </p>
      </div>

      {/* Core Principles */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Source of Truth</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The original discharge summary written by the hospital physician is the absolute source of truth. Simplifying language must never alter clinical meaning or invent instructions.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Patient & Caregiver First</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We target approximately Class 8 readability. Technical Latin acronyms like "BD", "TDS", or "PRN" are converted into clear instructions like "twice daily with meals".
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Deterministic Safety</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We use independent rule-based validation to ensure zero hallucination of medications, dosages, durations, or follow-up dates before any care sheet is printed.
          </p>
        </div>
      </section>

      {/* Production Readiness Assessment Section (Section 16 Specification) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
            Transparency Report
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            Production Readiness Assessment
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            In compliance with healthcare safety standards, we distinguish between website publication readiness and operational clinical readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Level A: Website Publication Readiness */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>A. Website Publication Readiness (COMPLETE)</span>
            </div>
            <ul className="space-y-2 text-xs text-emerald-950 font-medium">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Stable full-stack React 19 + TypeScript + Node architecture</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Deterministic clinical validation engine with 18 automated tests</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Prompt-injection sanitization & in-memory privacy preservation</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Responsive mobile-first interface & A4 browser print stylesheets</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Offline demo mode supporting 7 synthetic clinical cases</span>
              </li>
            </ul>
          </div>

          {/* Level B: Healthcare Operational Readiness */}
          <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>B. Healthcare Operational Roadmap (AWAITING REVIEW)</span>
            </div>
            <ul className="space-y-2 text-xs text-amber-950 font-medium">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>Multi-center clinical trial with licensed attending physicians</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>HIPAA / GDPR Business Associate Agreement (BAA) with hospital networks</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>Hospital EHR integration via HL7 FHIR APIs</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>Medical Device SaMD (Software as a Medical Device) risk assessment</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>Clinical Pharmacist formulary reconciliation verification</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800 font-semibold">Legal & Medical Boundary: </strong>
          CareBridge AI is currently an assistive patient communication prototype. It does not provide medical diagnoses, alter prescriptions, or replace human medical judgment. Patients should always verify care instructions with their healthcare provider.
        </div>
      </section>

      {/* CTA */}
      <div className="text-center pt-2">
        <button
          onClick={onStartCreate}
          className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-sm transition inline-flex items-center space-x-2"
        >
          <span>Create a Discharge Care Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
