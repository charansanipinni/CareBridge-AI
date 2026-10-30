import React from 'react';
import { HeartPulse, Shield, Users, Award, CheckCircle2, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { LanguageCode } from '../types/careplan';
import { getUiStrings } from '../utils/uiTranslations';

interface AboutPageProps {
  onStartCreate: () => void;
  interfaceLanguage?: LanguageCode;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onStartCreate, interfaceLanguage = 'en' }) => {
  const ui = getUiStrings(interfaceLanguage);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
          <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
          <span>{ui.about.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {ui.about.title}
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          {ui.about.desc}
        </p>
      </div>

      {/* Core Principles */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{ui.about.prin1Title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {ui.about.prin1Desc}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{ui.about.prin2Title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {ui.about.prin2Desc}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{ui.about.prin3Title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {ui.about.prin3Desc}
          </p>
        </div>
      </section>

      {/* Production Readiness Assessment Section (Section 16 Specification) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
            {ui.about.badge}
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            {ui.about.prodTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {ui.about.prodSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Level A: Website Publication Readiness */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>A. Website Publication Readiness ({interfaceLanguage === 'te' ? 'పూర్తయింది' : 'COMPLETE'})</span>
            </div>
            <ul className="space-y-2 text-xs text-emerald-950 font-medium">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>{interfaceLanguage === 'te' ? 'స్థిరమైన ఫుల్-స్టాక్ React 19 + TypeScript ఆర్కిటెక్చర్' : 'Stable full-stack React 19 + TypeScript + Node architecture'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>{interfaceLanguage === 'te' ? '18 ఆటోమేటెడ్ పరీక్షలతో క్లినికల్ ధృవీకరణ ఇంజిన్' : 'Deterministic clinical validation engine with 18 automated tests'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>{interfaceLanguage === 'te' ? 'ప్రాంప్ట్-ఇంజెక్షన్ శానిటైజేషన్ & ఇన్-మెమరీ గోప్యత' : 'Prompt-injection sanitization & in-memory privacy preservation'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>{interfaceLanguage === 'te' ? 'మొబైల్-ఫస్ట్ ఇంటర్‌ఫేస్ & A4 ప్రింట్ స్టైల్స్' : 'Responsive mobile-first interface & A4 browser print stylesheets'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>{interfaceLanguage === 'te' ? '7 సింథటిక్ క్లినికల్ కేసులతో ఆఫ్‌లైన్ డెమో మోడ్' : 'Offline demo mode supporting 7 synthetic clinical cases'}</span>
              </li>
            </ul>
          </div>

          {/* Level B: Healthcare Operational Readiness */}
          <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>B. Healthcare Operational Roadmap ({interfaceLanguage === 'te' ? 'క్లినికల్ ట్రయల్స్ దశ' : 'AWAITING REVIEW'})</span>
            </div>
            <ul className="space-y-2 text-xs text-amber-950 font-medium">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>{interfaceLanguage === 'te' ? 'వైద్యులతో మల్టీ-సెంటర్ క్లినికల్ అధ్యయనాలు' : 'Multi-center clinical trial with licensed attending physicians'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>{interfaceLanguage === 'te' ? 'హాస్పిటల్ నెట్‌వర్క్‌లతో HIPAA / GDPR ఒప్పందాలు' : 'HIPAA / GDPR Business Associate Agreement (BAA) with hospital networks'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>{interfaceLanguage === 'te' ? 'HL7 FHIR APIల ద్వారా హాస్పిటల్ EHR ఇంటిగ్రేషన్' : 'Hospital EHR integration via HL7 FHIR APIs'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>{interfaceLanguage === 'te' ? 'మెడికల్ డివైస్ SaMD రిస్క్ అసెస్‌మెంట్' : 'Medical Device SaMD (Software as a Medical Device) risk assessment'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>{interfaceLanguage === 'te' ? 'క్లినికల్ ఫార్మసిస్ట్ ఫార్ములరీ సరిపోలిక' : 'Clinical Pharmacist formulary reconciliation verification'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800 font-semibold">{interfaceLanguage === 'te' ? 'వైద్య మరియు చట్టపరమైన పరిమితి: ' : 'Legal & Medical Boundary: '}</strong>
          {interfaceLanguage === 'te'
            ? 'కేర్‌బ్రిడ్జ్ AI రోగులకు అవగాహన కల్పించే సాంకేతిక నమూనా. ఇది వైద్య నిర్ధారణలను అందించదు లేదా ప్రిస్క్రిప్షన్‌లను మార్చదు. రోగులు ఎల్లప్పుడూ తమ వైద్యునితో సూచనలను ధృవీకరించుకోవాలి.'
            : 'CareBridge AI is currently an assistive patient communication prototype. It does not provide medical diagnoses, alter prescriptions, or replace human medical judgment. Patients should always verify care instructions with their healthcare provider.'}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center pt-2">
        <button
          onClick={onStartCreate}
          className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-sm transition inline-flex items-center space-x-2"
        >
          <span>{ui.about.ctaBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
