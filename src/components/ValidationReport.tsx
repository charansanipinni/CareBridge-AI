import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  ChevronRight,
  Stethoscope,
  Filter
} from 'lucide-react';
import { FaithfulnessReport, ValidationCheck, CheckSeverity } from '../types/careplan';

interface ValidationReportProps {
  report: FaithfulnessReport;
}

export const ValidationReport: React.FC<ValidationReportProps> = ({ report }) => {
  const [filter, setFilter] = useState<'ALL' | 'FAILED' | 'PASSED' | 'UNRESOLVED'>('ALL');

  const filteredChecks = report.checks.filter(c => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                Faithfulness & Safety Audit Engine
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                report.overallStatus === 'VERIFIED_CONSISTENT' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {report.overallStatus === 'VERIFIED_CONSISTENT' ? 'Safe to Discharge' : 'Clinician Review Required'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Deterministic verification against 10+ clinical safety rules
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg transition ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({report.checks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('FAILED')}
            className={`px-2.5 py-1 rounded-lg transition ${
              filter === 'FAILED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Failed ({report.failedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('UNRESOLVED')}
            className={`px-2.5 py-1 rounded-lg transition ${
              filter === 'UNRESOLVED' ? 'bg-amber-500 text-white shadow-2xs' : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Unclear ({report.unresolvedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PASSED')}
            className={`px-2.5 py-1 rounded-lg transition ${
              filter === 'PASSED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Passed ({report.passedCount})
          </button>
        </div>
      </div>

      {/* Clinician Action Items Banner if anything needs review */}
      {report.itemsRequiringClinicianReview.length > 0 && (
        <div className="bg-rose-50/70 p-5 border-b border-rose-200">
          <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs uppercase tracking-wider mb-2">
            <Stethoscope className="w-4 h-4 text-rose-600" />
            <span>Items Requiring Clinician Confirmation Before Patient Delivery:</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {report.itemsRequiringClinicianReview.map((item, idx) => (
              <li key={idx} className="p-2.5 rounded-lg bg-white border border-rose-200 text-rose-900 font-medium flex items-start space-x-2">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hallucination / Unsupported Additions Alert */}
      {report.unsupportedAdditions.length > 0 && (
        <div className="bg-amber-50/70 p-5 border-b border-amber-200">
          <p className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-1 flex items-center">
            <AlertTriangle className="w-4 h-4 text-amber-600 mr-1.5" />
            Unsupported Additions Detected (Hallucination Prevention):
          </p>
          <ul className="list-disc pl-5 text-xs text-amber-900 space-y-1">
            {report.unsupportedAdditions.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Checks List */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {filteredChecks.map((chk) => {
          const isPassed = chk.status === 'PASSED';
          const isFailed = chk.status === 'FAILED';
          const isUnresolved = chk.status === 'UNRESOLVED';

          return (
            <div key={chk.id} className="p-4 hover:bg-slate-50/80 transition flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {isPassed && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {isFailed && <XCircle className="w-5 h-5 text-rose-600" />}
                  {isUnresolved && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{chk.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                      {chk.category}
                    </span>
                    {chk.severity === 'CRITICAL' && isFailed && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 uppercase">
                        Critical Safety Check
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{chk.detail}</p>

                  {(chk.sourceEvidence || chk.generatedEvidence) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono">
                      {chk.sourceEvidence && (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          Source: "{chk.sourceEvidence}"
                        </span>
                      )}
                      {chk.generatedEvidence && (
                        <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                          Plan: "{chk.generatedEvidence}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                  isPassed 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : isFailed 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {chk.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Disclaimer Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
        <span className="font-semibold text-slate-600">Safety Notice: </span>
        {report.disclaimer}
      </div>
    </div>
  );
};
