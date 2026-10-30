import React from 'react';
import { X, HelpCircle, FileText, CheckCircle2, AlertTriangle, Printer, Lock, Languages, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const faqs = [
    {
      icon: <FileText className="w-5 h-5 text-teal-600" />,
      question: 'How do I upload a hospital discharge summary?',
      answer: 'Go to "Create Care Plan" and choose either "Upload Discharge Summary" to drop a PDF or text file (up to 10MB), or "Enter Instructions Manually" to paste text directly. You can also explore our built-in sample cases.',
    },
    {
      icon: <FileText className="w-5 h-5 text-teal-600" />,
      question: 'Which document formats are supported?',
      answer: 'We support text-based PDF documents (.pdf), plain text files (.txt), and Markdown files (.md). If you have a scanned image PDF, we recommend copying and pasting the text into the manual entry box.',
    },
    {
      icon: <Languages className="w-5 h-5 text-teal-600" />,
      question: 'How does the English and Telugu language selector work?',
      answer: 'CareBridge AI translates instructions into natural, easy-to-understand conversational Telugu while preserving clinical medication brand names, numerical strengths (e.g. 500 mg), and schedules. You can toggle between English and Telugu anytime.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      question: 'What does "Checks Passed" vs "Needs Review" mean?',
      answer: '"Checks Passed" indicates all 12+ deterministic safety tests confirmed exact consistency with your discharge summary. "Needs Review" indicates an ambiguity, missing detail (such as an unstated stop date), or conflicting instruction was found in the hospital record.',
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      question: 'What should I do if my care plan says "Needs Review"?',
      answer: 'Do not panic. "Needs Review" protects your safety by highlighting missing or unclear items. We provide a list of specific clarification questions for you to confirm with your doctor, pharmacist, or hospital care team before taking medications.',
    },
    {
      icon: <Printer className="w-5 h-5 text-teal-600" />,
      question: 'How do I print or download my care plan?',
      answer: 'In the care plan view, click "Print Care Sheet" or "Download PDF". We provide a clean, clutter-free A4 printable sheet designed for you or your caregiver to keep on the refrigerator or bedside table.',
    },
    {
      icon: <Lock className="w-5 h-5 text-teal-600" />,
      question: 'How is my medical document privacy handled?',
      answer: 'CareBridge AI processes documents in-memory during your session. No medical documents or protected health information (PHI) are permanently saved on our servers. You can clear session records at any time with one click.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Help & Patient Support</h3>
              <p className="text-xs text-slate-500">
                Clear answers on using CareBridge AI and understanding your care plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Help"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 shrink-0">{faq.icon}</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{faq.question}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Notice Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Always confirm unclear instructions with your hospital or pharmacy care team.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition w-full sm:w-auto"
          >
            Close Help
          </button>
        </div>
      </div>
    </div>
  );
};
