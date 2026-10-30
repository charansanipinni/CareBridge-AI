import React from 'react';
import { 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Database, 
  Cpu, 
  CheckCircle2, 
  HelpCircle,
  AlertTriangle,
  Lock,
  Printer
} from 'lucide-react';

interface HowItWorksPageProps {
  onStartCreate: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onStartCreate }) => {
  const architectureSteps = [
    {
      num: '1',
      title: 'Discharge Summary Ingestion',
      desc: 'Accepts PDF, text, or manual paste. Documents are sanitized to disarm script execution and prompt overrides.',
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200',
    },
    {
      num: '2',
      title: 'Deterministic Fact Extraction',
      desc: 'Extracts exact medication names, strengths, dosages, frequencies, wound care, and follow-up without guessing.',
      icon: <Database className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200',
    },
    {
      num: '3',
      title: 'Typed Clinical Schema',
      desc: 'Stores extracted facts with explicit source quotes. Missing fields are recorded as null rather than filled by general medical knowledge.',
      icon: <Layers className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      num: '4',
      title: 'Plain-Language Simplification',
      desc: 'Rewrites instructions at ~Class 8 readability in English and natural Telugu with short sentences and active voice.',
      icon: <Cpu className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      num: '5',
      title: 'Independent Deterministic Validation',
      desc: 'Runs 12+ independent mathematical and text checks. Compares generated instructions against raw source text.',
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      num: '6',
      title: 'Patient Care Plan & 1-Page Sheet',
      desc: 'Produces interactive bilingual views, a 7-day timetable, Web Speech audio reader, and a single-page printable care sheet.',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          <span>Clinical Safety Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How CareBridge AI Works
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Simplifying medical language must never change clinical meaning. Here is how our six-stage clinical architecture protects your health instructions.
        </p>
      </div>

      {/* 6-Stage Architecture Grid */}
      <section className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 text-center">
          The 6-Stage Clinical Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {architectureSteps.map((step) => (
            <div key={step.num} className={`p-5 rounded-2xl border ${step.bg} flex flex-col justify-between shadow-2xs`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-full bg-white shadow-2xs flex items-center justify-center font-black text-xs text-slate-800">
                    {step.num}
                  </span>
                  {step.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Deterministic Validation Matters */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Why We Never Let an AI Model Certify Its Own Output
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              In healthcare, self-evaluating AI is a known hazard—language models can hallucinate or omit a critical medication while still claiming their output is correct. CareBridge AI uses an <strong>Independent Deterministic Validation Engine</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 font-semibold block mb-1">Exact Drug & Dose Matching</strong>
            Every medication in the generated plan is verified against the source text. Doses, units (e.g. mg, mcg, units), and frequencies must match.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 font-semibold block mb-1">Zero Hallucination Guarantee</strong>
            If an unprescribed medication or fabricated warning sign appears in the output, it is flagged as a Critical Failure.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 font-semibold block mb-1">Preservation of Relative Dates</strong>
            If a discharge summary says "follow up in seven days", CareBridge AI preserves the relative timing without inventing an arbitrary calendar date.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 font-semibold block mb-1">Strict Status Suppression</strong>
            If any critical check fails or remains unresolved, a green "Verified" badge is strictly suppressed.
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={onStartCreate}
          className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-sm transition inline-flex items-center space-x-2"
        >
          <span>Try CareBridge AI With Your Document</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
