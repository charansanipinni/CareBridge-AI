import React, { useState } from 'react';
import { Bug, ShieldAlert, RotateCcw, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DriftSimulationType, simulateDrift } from '../core/driftSimulator';
import { PatientCarePlan, FaithfulnessReport } from '../types/careplan';
import { validateCarePlanFaithfulness } from '../core/validator';

interface DriftControlBarProps {
  originalSourceText: string;
  baseFacts: any;
  basePlan: PatientCarePlan;
  onApplyDrift: (simulatedPlan: PatientCarePlan, simulatedReport: FaithfulnessReport, note: string) => void;
  onResetDrift: () => void;
  isDriftActive: boolean;
  driftDescription?: string;
}

export const DriftControlBar: React.FC<DriftControlBarProps> = ({
  originalSourceText,
  baseFacts,
  basePlan,
  onApplyDrift,
  onResetDrift,
  isDriftActive,
  driftDescription,
}) => {
  const [selectedDrift, setSelectedDrift] = useState<DriftSimulationType>('ALTER_DOSE');

  const handleTriggerDrift = () => {
    const { modifiedPlan, description } = simulateDrift(basePlan, selectedDrift);
    const newReport = validateCarePlanFaithfulness(originalSourceText, baseFacts, modifiedPlan);
    onApplyDrift(modifiedPlan, newReport, description);
  };

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border transition mb-6 no-print ${
      isDriftActive 
        ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400' 
        : 'bg-white border-slate-200/90 shadow-2xs'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDriftActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
          }`}>
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-slate-900">
                Live Safety Test Mode (Judge Demonstration)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Section 10 Spec
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Inject controlled clinical drift into the care plan to prove that the Faithfulness Engine catches discrepancies.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {!isDriftActive ? (
            <>
              <select
                value={selectedDrift}
                onChange={(e) => setSelectedDrift(e.target.value as DriftSimulationType)}
                className="text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-rose-500"
              >
                <option value="ALTER_DOSE">Mutate Dose (500mg → 50mg)</option>
                <option value="OMIT_MEDICATION">Omit Prescribed Drug</option>
                <option value="ALTER_FREQUENCY">Alter Schedule (BD → OD)</option>
                <option value="OMIT_WARNING">Omit Red-Flag Warning</option>
                <option value="INVENT_DATE">Invent Calendar Date</option>
              </select>

              <button
                type="button"
                onClick={handleTriggerDrift}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1"
              >
                <span>Simulate Error</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onResetDrift}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Validated Plan</span>
            </button>
          )}
        </div>
      </div>

      {isDriftActive && driftDescription && (
        <div className="mt-3 pt-3 border-t border-rose-200 text-xs text-rose-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Simulated Mismatch Injected:</strong> {driftDescription} Notice how the safety status immediately flipped to <strong>"Needs Review"</strong>!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
