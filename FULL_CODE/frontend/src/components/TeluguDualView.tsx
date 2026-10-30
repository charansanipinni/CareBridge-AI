import React, { useState } from 'react';
import { Languages, CheckCircle2, ArrowRightLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { PatientCarePlan } from '../types/careplan';

interface TeluguDualViewProps {
  englishPlan: PatientCarePlan;
  teluguPlan: PatientCarePlan;
}

export const TeluguDualView: React.FC<TeluguDualViewProps> = ({ englishPlan, teluguPlan }) => {
  const [viewMode, setViewMode] = useState<'split' | 'en' | 'te'>('split');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Header and Toggle */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">Bilingual Care Instructions (ఆంగ్లం మరియు తెలుగు)</h3>
              <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                Validated Translation
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Side-by-side alignment preserving exact brand names, dosages, and emergency escalation instructions
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              viewMode === 'split' ? 'bg-white text-teal-800 shadow-2xs border border-slate-300' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side-by-Side Dual View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('en')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              viewMode === 'en' ? 'bg-white text-teal-800 shadow-2xs border border-slate-300' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English Only
          </button>
          <button
            type="button"
            onClick={() => setViewMode('te')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              viewMode === 'te' ? 'bg-white text-teal-800 shadow-2xs border border-slate-300' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            తెలుగు Only
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="p-6">
        <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* English Column */}
          {(viewMode === 'split' || viewMode === 'en') && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-600 mr-2"></span>
                  English Instructions (~Class 8)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Flesch-Kincaid: {englishPlan.readabilityScore.fleschKincaidGradeLevel}</span>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                <p className="font-bold text-slate-900 mb-1">Care Summary:</p>
                <p>{englishPlan.careSummary}</p>
              </div>

              {/* Medicines */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Medicines:</p>
                {englishPlan.medications.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900">{m.medicineName}</span>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">{m.strength}</span>
                    </div>
                    <p className="text-slate-700">Dose: {m.howMuch} • {m.whenToTake}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Duration: {m.forHowLong}</p>
                  </div>
                ))}
              </div>

              {/* Warning Signs */}
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950">
                <p className="font-bold text-rose-900 mb-1">Warning Signs & Action:</p>
                {englishPlan.warningSigns.urgentSigns.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 mb-2">
                    {englishPlan.warningSigns.urgentSigns.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-rose-800 mb-2">{englishPlan.warningSigns.notice || 'No explicit signs listed in source.'}</p>
                )}
                <p className="font-semibold text-rose-900">Action: {englishPlan.warningSigns.actionToTake}</p>
              </div>

              {/* Follow-up */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                <p className="font-bold text-slate-900 mb-1">Follow-up:</p>
                <p className="font-semibold text-teal-700">{englishPlan.followUp.timingDisplay}</p>
                <p className="text-slate-600 mt-0.5">{englishPlan.followUp.departmentOrDoctor}</p>
              </div>
            </div>
          )}

          {/* Telugu Column */}
          {(viewMode === 'split' || viewMode === 'te') && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-600 mr-2"></span>
                  తెలుగు సూచనలు (Telugu Instructions)
                </span>
                <span className="text-[11px] text-teal-700 font-medium">సహజమైన భాషా రూపకల్పన</span>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200 text-xs text-slate-800">
                <p className="font-bold text-slate-900 mb-1">సంరక్షణ సారాంశం (Care Summary):</p>
                <p className="leading-relaxed">{teluguPlan.careSummary}</p>
              </div>

              {/* Medicines */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">మందులు (Medicines):</p>
                {teluguPlan.medications.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-teal-50/40 border border-teal-200 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900">{m.medicineName}</span>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-300">{m.strength}</span>
                    </div>
                    <p className="text-slate-800">మోతాదు: {m.howMuch} • {m.whenToTake}</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">ఎన్ని రోజులు: {m.forHowLong}</p>
                  </div>
                ))}
              </div>

              {/* Warning Signs */}
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950">
                <p className="font-bold text-rose-900 mb-1">ప్రమాద సంకేతాలు & హెచ్చరికలు (Warning Signs):</p>
                {teluguPlan.warningSigns.urgentSigns.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 mb-2">
                    {teluguPlan.warningSigns.urgentSigns.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-rose-800 mb-2">{teluguPlan.warningSigns.notice || 'డిశ్చార్జ్ సారాంశంలో నిర్దిష్ట లక్షణాలు లేవు.'}</p>
                )}
                <p className="font-semibold text-rose-900">చేయవలసిన చర్య: {teluguPlan.warningSigns.actionToTake}</p>
              </div>

              {/* Follow-up */}
              <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200 text-xs text-slate-800">
                <p className="font-bold text-slate-900 mb-1">తదుపరి అపాయింట్‌మెంట్ (Follow-up):</p>
                <p className="font-semibold text-teal-800">{teluguPlan.followUp.timingDisplay}</p>
                <p className="text-slate-600 mt-0.5">{teluguPlan.followUp.departmentOrDoctor}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
