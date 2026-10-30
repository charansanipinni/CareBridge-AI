import React from 'react';
import { History, Trash2, ArrowUpRight, Clock, FileText, CheckCircle2, AlertOctagon } from 'lucide-react';
import { CareBridgeResult } from '../types/careplan';

interface SessionHistoryProps {
  history: CareBridgeResult[];
  onSelectResult: (result: CareBridgeResult) => void;
  onClearHistory: () => void;
  currentResultId?: string;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  history,
  onSelectResult,
  onClearHistory,
  currentResultId,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs mb-8 no-print">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Session Plan History</h4>
            <p className="text-[11px] text-slate-500">
              Safe in-memory session records ({history.length} processed) • No persistent PHI storage
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {history.map((item) => {
          const isSelected = item.id === currentResultId;
          const isConsistent = item.faithfulnessReport.overallStatus === 'VERIFIED_CONSISTENT';

          return (
            <div
              key={item.id}
              onClick={() => onSelectResult(item)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                isSelected
                  ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    isConsistent
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isConsistent ? 'Verified' : 'Needs Review'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">
                {item.facts.admissionReason || 'Clinical Summary'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {item.facts.medications.length} Meds • Mode: {item.mode}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
