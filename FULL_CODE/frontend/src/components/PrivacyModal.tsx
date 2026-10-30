import React from 'react';
import { X, Shield, Lock, EyeOff, FileText, Database, Server, CheckCircle2 } from 'lucide-react';

interface PrivacyModalProps {
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Privacy & Security Information</h3>
              <p className="text-xs text-slate-500">
                How CareBridge AI safeguards your healthcare document and data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Privacy"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200">
            <div className="flex items-center space-x-2 font-bold text-teal-950 mb-1 text-sm">
              <Lock className="w-4 h-4 text-teal-700" />
              <span>Core Privacy Commitment: Zero Permanent PHI Storage</span>
            </div>
            <p>
              CareBridge AI operates on an in-memory session model. Your uploaded discharge documents and medical records are processed solely for the duration of your active browser session and are not permanently logged, tracked, or sold to third parties.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1">
                <EyeOff className="w-4 h-4 text-slate-700" />
                <span>No Third-Party Ad Trackers</span>
              </div>
              <p className="text-slate-600">
                We do not include advertising pixels, behavioral trackers, or analytics scripts that capture patient identity or clinical notes.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1">
                <Server className="w-4 h-4 text-slate-700" />
                <span>Server-Side Credential Safety</span>
              </div>
              <p className="text-slate-600">
                All processing occurs server-side with zero exposure of API keys, internal models, or secrets in browser client code.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1">
                <Shield className="w-4 h-4 text-slate-700" />
                <span>Prompt Injection Defense</span>
              </div>
              <p className="text-slate-600">
                Documents are treated as untrusted inputs. Prompt override attacks and malicious scripts are disarmed automatically before processing.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1">
                <Database className="w-4 h-4 text-slate-700" />
                <span>Patient Data Ownership</span>
              </div>
              <p className="text-slate-600">
                You retain full ownership of your records. You can delete your session history at any time with a single click.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-amber-950 mt-3">
            <p className="font-bold text-[11px] uppercase tracking-wider mb-0.5">Healthcare Production Roadmap Notice:</p>
            <p className="text-[11px] leading-relaxed">
              This prototype demonstrates deterministic consistency verification. Prior to clinical deployment with live hospital EHR systems (such as Epic, Cerner, or FHIR endpoints), a HIPAA Business Associate Agreement (BAA) and formal legal compliance review must be conducted.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
