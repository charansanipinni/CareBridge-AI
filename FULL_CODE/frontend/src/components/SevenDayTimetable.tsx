import React from 'react';
import { Calendar, Clock, Sun, Sunset, Moon, Sunrise, AlertCircle, CheckCircle2, Stethoscope } from 'lucide-react';
import { DaySchedule, LanguageCode } from '../types/careplan';

interface SevenDayTimetableProps {
  schedule: DaySchedule[];
  language: LanguageCode;
}

export const SevenDayTimetable: React.FC<SevenDayTimetableProps> = ({ schedule, language }) => {
  const isTelugu = language === 'te';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8 no-print">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                {isTelugu ? '7-రోజుల గృహ సంరక్షణ కాలపట్టిక (7-Day Care Timetable)' : '7-Day Home Recovery Timetable'}
              </h3>
              <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                Prescription-Derived
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isTelugu 
                ? 'ప్రిస్క్రిప్షన్ వ్యవధులు మరియు మోతాదు విరామాల ఆధారంగా మాత్రమే రూపొందించబడింది.'
                : 'Derived strictly from prescribed durations and intervals — zero fabricated milestones'}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          {isTelugu ? 'గమనిక: ఖచ్చితమైన సమయాల కోసం వైద్య బృందాన్ని సంప్రదించండి.' : 'Note: Times are guidance; confirm specific clock hours with your clinic.'}
        </div>
      </div>

      {/* Grid of 7 Days */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {schedule.map((day) => (
          <div
            key={day.dayNumber}
            className={`rounded-xl border flex flex-col justify-between p-3.5 transition ${
              day.isFollowUpDay
                ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-400'
                : day.dayNumber === 1
                ? 'border-slate-300 bg-slate-50/60 shadow-2xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              {/* Day Badge */}
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/80">
                <span className={`text-xs font-bold ${day.dayNumber === 1 ? 'text-teal-800 font-extrabold' : 'text-slate-800'}`}>
                  {day.dayLabel}
                </span>
                {day.dayNumber === 1 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-600 text-white uppercase">
                    Start
                  </span>
                )}
                {day.isFollowUpDay && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-white uppercase">
                    Review
                  </span>
                )}
              </div>

              {/* Slots */}
              <div className="space-y-2.5 text-[11px]">
                {/* Morning */}
                {day.morning.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-1 text-amber-700 font-bold text-[10px] uppercase mb-0.5">
                      <Sunrise className="w-3 h-3" />
                      <span>{isTelugu ? 'ఉదయం' : 'Morning'}</span>
                    </div>
                    {day.morning.map((m, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-amber-50/60 border border-amber-200 text-slate-800 leading-tight mb-1">
                        {m}
                      </div>
                    ))}
                  </div>
                )}

                {/* Afternoon */}
                {day.afternoon.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-1 text-orange-700 font-bold text-[10px] uppercase mb-0.5">
                      <Sun className="w-3 h-3" />
                      <span>{isTelugu ? 'మధ్యాహ్నం' : 'Afternoon'}</span>
                    </div>
                    {day.afternoon.map((m, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-orange-50/60 border border-orange-200 text-slate-800 leading-tight mb-1">
                        {m}
                      </div>
                    ))}
                  </div>
                )}

                {/* Evening */}
                {day.evening.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-1 text-teal-700 font-bold text-[10px] uppercase mb-0.5">
                      <Sunset className="w-3 h-3" />
                      <span>{isTelugu ? 'సాయంత్రం' : 'Evening'}</span>
                    </div>
                    {day.evening.map((m, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-teal-50/60 border border-teal-200 text-slate-800 leading-tight mb-1">
                        {m}
                      </div>
                    ))}
                  </div>
                )}

                {/* Bedtime */}
                {day.bedtime.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-1 text-indigo-700 font-bold text-[10px] uppercase mb-0.5">
                      <Moon className="w-3 h-3" />
                      <span>{isTelugu ? 'పడుకునే ముందు' : 'Bedtime'}</span>
                    </div>
                    {day.bedtime.map((m, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-indigo-50/60 border border-indigo-200 text-slate-800 leading-tight mb-1">
                        {m}
                      </div>
                    ))}
                  </div>
                )}

                {/* Wound Care */}
                {day.woundCare && day.woundCare.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-600 block mb-0.5">
                      {isTelugu ? 'గాయం సంరక్షణ:' : 'Dressing:'}
                    </span>
                    {day.woundCare.map((w, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] leading-tight">
                        {w}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes & Milestones */}
            {day.notes && day.notes.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px]">
                {day.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className={`p-1.5 rounded font-medium leading-tight mb-1 ${
                      note.includes('🚨') 
                        ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold' 
                        : 'bg-teal-100 text-teal-900'
                    }`}
                  >
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
