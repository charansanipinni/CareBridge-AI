import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, HelpCircle } from 'lucide-react';
import { FaithfulnessReport } from '../types/careplan';

interface ValidationBadgeProps {
  report: FaithfulnessReport;
  compact?: boolean;
}

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({ report, compact = false }) => {
  const isConsistent = report.overallStatus === 'VERIFIED_CONSISTENT';
  const hasUnresolved = report.unresolvedCount > 0;
  const hasFailed = report.failedCount > 0;

  if (compact) {
    if (isConsistent && !hasUnresolved) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          Verified Consistent
        </span>
      );
    }
    if (isConsistent && hasUnresolved) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
          Verified with Caveats
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-600" />
        Needs Review
      </span>
    );
  }

  // Full Banner
  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        isConsistent && !hasUnresolved
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : isConsistent && hasUnresolved
          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
          : 'bg-rose-50/80 border-rose-300 text-rose-950 ring-1 ring-rose-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isConsistent && !hasUnresolved
                ? 'bg-emerald-600 text-white shadow-sm'
                : isConsistent && hasUnresolved
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-rose-600 text-white shadow-sm animate-pulse'
            }`}
          >
            {isConsistent && !hasUnresolved ? (
              <ShieldCheck className="w-6 h-6" />
            ) : isConsistent && hasUnresolved ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <AlertOctagon className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold">
                {report.summaryBadge.label}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-md font-medium uppercase tracking-wider bg-white/80 border border-slate-200 text-slate-700">
                Deterministic Audit
              </span>
            </div>
            <p className="text-xs mt-1 text-slate-700 leading-relaxed font-normal">
              {report.summaryBadge.description}
            </p>
          </div>
        </div>

        {/* Audit Metrics */}
        <div className="flex items-center space-x-3 bg-white/80 px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          <div className="text-center px-2">
            <span className="text-sm font-bold text-emerald-700">{report.passedCount}</span>
            <p className="text-[10px] uppercase font-bold text-slate-500">Passed</p>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-center px-2">
            <span className={`text-sm font-bold ${report.failedCount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
              {report.failedCount}
            </span>
            <p className="text-[10px] uppercase font-bold text-slate-500">Failed</p>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-center px-2">
            <span className={`text-sm font-bold ${report.unresolvedCount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
              {report.unresolvedCount}
            </span>
            <p className="text-[10px] uppercase font-bold text-slate-500">Missing/Unclear</p>
          </div>
        </div>
      </div>

      {/* Critical warning note if Needs Review */}
      {hasFailed && (
        <div className="mt-4 pt-3 border-t border-rose-200/70 text-xs text-rose-800 flex items-start space-x-2">
          <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>
            <strong>Safety Mechanism Active:</strong> One or more clinical discrepancies were identified between the discharge summary and generated plan. A green badge is strictly suppressed until reviewed by a medical clinician.
          </span>
        </div>
      )}
    </div>
  );
};
