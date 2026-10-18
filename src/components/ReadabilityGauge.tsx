import React from 'react';
import { BookOpen, Check, Award, Info } from 'lucide-react';

interface ReadabilityGaugeProps {
  gradeLevel: number;
  notes: string;
}

export const ReadabilityGauge: React.FC<ReadabilityGaugeProps> = ({ gradeLevel, notes }) => {
  const isOptimal = gradeLevel <= 8.5;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-900">Readability Target: ~Class 8</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isOptimal 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {isOptimal ? 'Optimal (Grade ' + gradeLevel + ')' : 'Grade ' + gradeLevel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{notes}</p>
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-end pl-4 border-l border-slate-100">
        <span className="text-xs text-slate-400 font-medium">Standard</span>
        <span className="text-xs font-bold text-slate-700">Flesch-Kincaid</span>
      </div>
    </div>
  );
};
