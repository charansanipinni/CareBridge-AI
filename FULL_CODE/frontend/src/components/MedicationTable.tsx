import React from 'react';
import { Pill, CheckCircle2, AlertTriangle, HelpCircle, ShieldCheck } from 'lucide-react';
import { PatientMedicationInstruction } from '../types/careplan';

interface MedicationTableProps {
  medications: PatientMedicationInstruction[];
}

export const MedicationTable: React.FC<MedicationTableProps> = ({ medications }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Discharge Medications Table</h3>
            <p className="text-xs text-slate-500">
              Clear dosage, schedules, and duration with deterministic source validation
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {medications.length} {medications.length === 1 ? 'Medication' : 'Medications'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Medicine</th>
              <th className="py-3 px-4">Strength</th>
              <th className="py-3 px-4">Dose (How Much)</th>
              <th className="py-3 px-4">Route</th>
              <th className="py-3 px-4">When to Take</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4 text-center">Safety Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {medications.map((med) => {
              const isMatched = med.validationStatus === 'MATCHED';
              const isDiscrepancy = med.validationStatus === 'DISCREPANCY';

              return (
                <tr key={med.id} className="hover:bg-slate-50/60 transition group">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center space-x-2">
                      <span>{med.medicineName}</span>
                    </div>
                    {med.sourceEvidence && (
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5 font-mono line-clamp-1 group-hover:line-clamp-none">
                        Src: "{med.sourceEvidence}"
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {med.strength || <span className="text-slate-400 italic">Not specified in source</span>}
                  </td>

                  <td className="py-3.5 px-4 text-slate-800 font-semibold">
                    {med.howMuch || <span className="text-slate-400 italic">Not specified in source</span>}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {med.route || 'Not specified in source'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-800 font-medium">
                    {med.whenToTake || <span className="text-slate-400 italic">Not specified in source</span>}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    {med.forHowLong.includes('not stated') ? (
                      <span className="inline-flex items-center text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {med.forHowLong}
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-800">{med.forHowLong}</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {isMatched ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Verified
                      </span>
                    ) : isDiscrepancy ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                        Check Needed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                        <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Unverified
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
