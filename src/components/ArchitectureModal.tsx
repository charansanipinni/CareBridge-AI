import React from 'react';
import { X, Layers, ArrowRight, ShieldCheck, Database, FileText, CheckCircle2, Cpu, Lock } from 'lucide-react';

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  const steps = [
    {
      num: '1',
      title: 'Discharge Summary Ingestion',
      subtitle: 'Untrusted PDF / TXT / Paste Input',
      desc: 'Sanitizes document input, neutralizes prompt injection payloads, and enforces file limits.',
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200',
    },
    {
      num: '2',
      title: 'Clinical Fact Extraction',
      subtitle: 'Zero-Hallucination Typed Extraction',
      desc: 'Extracts drugs, doses, units, routes, frequencies, durations, and follow-up without guessing.',
      icon: <Database className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200',
    },
    {
      num: '3',
      title: 'Structured Facts Schema',
      subtitle: 'Clinical Schema Standard',
      desc: 'Stores facts with exact source evidence strings, recording unknown or missing fields as null.',
      icon: <Layers className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      num: '4',
      title: 'Plain-Language Simplification',
      subtitle: '~Class 8 Patient Readability (EN & TE)',
      desc: 'Generates 8 structured sections in English and natural Telugu with short sentences and active voice.',
      icon: <Cpu className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      num: '5',
      title: 'Deterministic Faithfulness Engine',
      subtitle: '12+ Independent Clinical Safety Checks',
      desc: 'Mathematically compares output against source: detects omissions, dosage drift, frequency changes, and hallucinations.',
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      num: '6',
      title: 'Patient Care Plan & 1-Page Sheet',
      subtitle: 'Multi-Modal Patient Delivery',
      desc: 'Provides interactive bilingual dashboard, 7-day timetable, Web Speech TTS, and printable A4 sheet.',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">CareBridge AI System Architecture</h3>
              <p className="text-xs text-slate-500">
                End-to-end clinical data flow: Input → Extraction → Schema → Simplification → Deterministic Audit → Care Plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {steps.map((s, idx) => (
            <div key={s.num} className={`p-4 rounded-xl border ${s.bg} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-white shadow-2xs flex items-center justify-center font-bold text-xs text-slate-800">
                    {s.num}
                  </span>
                  {s.icon}
                </div>
                <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
                <p className="text-[11px] font-semibold text-slate-600 mb-1.5">{s.subtitle}</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Principles Strip */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-slate-900">
            <Lock className="w-4 h-4 text-teal-600" />
            <span>Core Safety Engineering Principles:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              <span><strong>The Source is Truth:</strong> No clinical facts are invented.</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              <span><strong>Independent Validation:</strong> Deterministic code validates output.</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              <span><strong>Strict Badge Model:</strong> Any mismatch forces "Needs Review".</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              <span><strong>Offline Capable:</strong> 100% operational without cloud APIs.</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Close Architecture View
          </button>
        </div>
      </div>
    </div>
  );
};
