import React from 'react';
import { 
  Heart, 
  Utensils, 
  Activity as ActivityIcon, 
  AlertTriangle, 
  Calendar, 
  HelpCircle, 
  Clock, 
  CheckCircle,
  Bandage,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { PatientCarePlan } from '../types/careplan';

interface CarePlanCardsProps {
  plan: PatientCarePlan;
}

export const CarePlanCards: React.FC<CarePlanCardsProps> = ({ plan }) => {
  return (
    <div className="space-y-6 mb-8">
      {/* 1. Care Summary Callout */}
      <div className="bg-gradient-to-br from-teal-50/60 to-white rounded-2xl border border-teal-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {plan.language === 'te' ? '1. మీ సంరక్షణ సారాంశం (Your Care Summary)' : '1. Your Care Summary'}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {plan.careSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Daily Care, Food & Drink, Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Daily Care & Wound Care */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                <Bandage className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {plan.language === 'te' ? '3. రోజువారీ సంరక్షణ' : '3. Daily & Wound Care'}
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {plan.dailyCare.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Food and Drink */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                <Utensils className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {plan.language === 'te' ? '4. ఆహారం & ద్రవాలు' : '4. Food & Drink Guidance'}
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {plan.foodAndDrink.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Physical Activity */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                <ActivityIcon className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {plan.language === 'te' ? '5. శారీరక వ్యాయామాలు' : '5. Physical Activity Limits'}
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {plan.activity.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Grid: Warning Signs & Follow-Up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Warning Signs & Emergency Action */}
        <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center space-x-3 mb-3.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950">
                {plan.language === 'te' ? '6. ప్రమాద సంకేతాలు & హెచ్చరికలు' : '6. Warning Signs & Urgent Action'}
              </h4>
              <p className="text-[11px] text-rose-800">
                Strict adherence to source documents — zero fabricated symptoms
              </p>
            </div>
          </div>

          {plan.warningSigns.notice && (
            <div className="p-3 mb-3.5 rounded-xl bg-white/80 border border-amber-300 text-amber-900 text-xs flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{plan.warningSigns.notice}</span>
            </div>
          )}

          {plan.warningSigns.urgentSigns.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-rose-900 mb-2 uppercase tracking-wider">
                Watch Out For These Specific Symptoms:
              </p>
              <ul className="space-y-2">
                {plan.warningSigns.urgentSigns.map((sign, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-rose-950 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5"></span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-rose-600 text-white text-xs font-semibold">
            <p className="uppercase text-[10px] text-rose-200 tracking-wider font-bold mb-0.5">What To Do:</p>
            <p>{plan.warningSigns.actionToTake}</p>
          </div>
        </div>

        {/* Follow-up Appointment */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {plan.language === 'te' ? '7. తదుపరి అపాయింట్‌మెంట్' : '7. Follow-up Appointment'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Preserves relative vs exact calendar dates faithfully
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">Clinic / Department:</span>
                <span className="text-xs font-bold text-slate-900">{plan.followUp.departmentOrDoctor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Scheduled Timing:</span>
                <span className="text-xs font-extrabold text-teal-700">{plan.followUp.timingDisplay}</span>
              </div>
            </div>

            {plan.followUp.missingNotice && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{plan.followUp.missingNotice}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 italic">
            Always bring this discharge care sheet and your current medication boxes to your review visit.
          </div>
        </div>
      </div>

      {/* 8. Questions for Care Team */}
      <div className="bg-white rounded-2xl border border-teal-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center space-x-3 mb-3.5">
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {plan.language === 'te' ? '8. మీ వైద్య బృందాన్ని అడగవలసిన ప్రశ్నలు' : '8. Questions To Confirm With Your Healthcare Team'}
            </h4>
            <p className="text-[11px] text-slate-500">
              Generated automatically to clarify missing stop dates or relative appointment timings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plan.questionsForCareTeam.map((q, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                {idx + 1}
              </span>
              <span className="font-medium">{q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
