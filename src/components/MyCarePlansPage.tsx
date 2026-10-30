import React from 'react';
import { 
  FolderClock, 
  Trash2, 
  Eye, 
  Download, 
  Plus, 
  ShieldCheck, 
  AlertOctagon, 
  Calendar, 
  Clock, 
  FileText,
  Lock,
  Printer
} from 'lucide-react';
import { CareBridgeResult } from '../types/careplan';

interface MyCarePlansPageProps {
  plans: CareBridgeResult[];
  onSelectPlan: (plan: CareBridgeResult) => void;
  onDeletePlan: (id: string) => void;
  onClearAll: () => void;
  onNavigateCreate: () => void;
}

export const MyCarePlansPage: React.FC<MyCarePlansPageProps> = ({
  plans,
  onSelectPlan,
  onDeletePlan,
  onClearAll,
  onNavigateCreate,
}) => {
  const handleDownload = (plan: CareBridgeResult) => {
    const data = {
      product: 'CareBridge AI',
      generatedDate: plan.timestamp,
      documentName: plan.documentName || plan.facts.admissionReason || 'Discharge Care Plan',
      language: plan.carePlanEnglish.language,
      validationStatus: plan.faithfulnessReport.overallStatus,
      facts: plan.facts,
      carePlanEnglish: plan.carePlanEnglish,
      carePlanTelugu: plan.carePlanTelugu,
      verificationToken: plan.verificationToken,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carebridge-plan-${plan.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Care Plans
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, download, or print care plans generated during your current session.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {plans.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Session Plans</span>
            </button>
          )}

          <button
            onClick={onNavigateCreate}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {/* Retention Policy Banner */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
        <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 font-semibold">In-Memory Privacy Policy: </strong>
          For patient safety and confidentiality, CareBridge AI stores care plans in your current browser memory only. No medical documents are saved permanently to public cloud databases. You can download your plans or clear history at any time.
        </div>
      </div>

      {/* Plans List or Empty State */}
      {plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <FolderClock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No care plans in this session yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload a discharge summary or try a sample case to generate your first simple care plan.
            </p>
          </div>
          <button
            onClick={onNavigateCreate}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Care Plan Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((item) => {
            const isVerified = item.faithfulnessReport.overallStatus === 'VERIFIED_CONSISTENT';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">
                      {item.documentName || item.facts.admissionReason || 'Discharge Care Plan'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isVerified ? 'Checks Passed' : 'Needs Review'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(item.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </span>
                    <span>•</span>
                    <span>{item.facts.medications.length} {item.facts.medications.length === 1 ? 'Medication' : 'Medications'}</span>
                    <span>•</span>
                    <span>Source: {item.sourceType}</span>
                    <span>•</span>
                    <span>Mode: {item.mode}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <button
                    onClick={() => onSelectPlan(item)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Plan</span>
                  </button>

                  <button
                    onClick={() => handleDownload(item)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    title="Download JSON record"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeletePlan(item.id)}
                    className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                    title="Delete plan from session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
