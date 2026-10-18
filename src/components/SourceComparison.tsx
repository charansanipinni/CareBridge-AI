import React, { useState } from 'react';
import { GitCompare, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { ClinicalFacts, PatientCarePlan } from '../types/careplan';

interface SourceComparisonProps {
  sourceText: string;
  facts: ClinicalFacts;
  carePlan: PatientCarePlan;
}

export const SourceComparison: React.FC<SourceComparisonProps> = ({ sourceText, facts, carePlan }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Accordion Toggle Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 transition flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                Source Document Audit & Line-by-Line Evidence Inspector
              </h3>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                Ground Truth Mapping
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Verify how original clinical statements map into simplified Class 8 instructions without distortion
            </p>
          </div>
        </div>

        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 p-6 space-y-6">
          {/* Medication Mapping */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Medication Instruction Mappings:
            </h4>
            <div className="space-y-3">
              {facts.medications.map((m, idx) => {
                const planMed = carePlan.medications.find(p => p.medicineName.toLowerCase() === m.name.toLowerCase());
                return (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {/* Left: Original Source */}
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Original Discharge Summary:
                        </span>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-800">
                          {m.evidence}
                        </div>
                      </div>

                      {/* Right: Simplified Instruction */}
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-800">
                          Simplified Care Plan Output:
                        </span>
                        <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-200 text-slate-900 font-medium">
                          Take <strong>{planMed?.howMuch || m.dose}</strong> of <strong>{m.name}</strong> ({planMed?.strength || m.strength}), {planMed?.whenToTake || m.frequency}, {planMed?.forHowLong || m.duration}.
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Follow-up Mapping */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Follow-up Appointment Mapping:
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Source Follow-up Text:
                  </span>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-800">
                    {facts.followUp.evidence}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-800">
                    Patient Display (Relative Date Safe):
                  </span>
                  <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-200 text-slate-900 font-medium">
                    Department: {carePlan.followUp.departmentOrDoctor} • {carePlan.followUp.timingDisplay}
                    {carePlan.followUp.missingNotice && (
                      <p className="text-[11px] text-amber-800 mt-1">{carePlan.followUp.missingNotice}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Text Drawer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Full Source Document Text:
            </h4>
            <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
              {sourceText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
