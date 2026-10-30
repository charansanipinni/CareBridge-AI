import React from 'react';
import { X, HelpCircle, FileText, CheckCircle2, AlertTriangle, Printer, Lock, Languages, ShieldCheck } from 'lucide-react';
import { LanguageCode } from '../types/careplan';
import { getUiStrings } from '../utils/uiTranslations';

interface HelpModalProps {
  onClose: () => void;
  interfaceLanguage?: LanguageCode;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose, interfaceLanguage = 'en' }) => {
  const ui = getUiStrings(interfaceLanguage);

  const faqs = [
    {
      icon: <FileText className="w-5 h-5 text-teal-600" />,
      question: ui.help.q1,
      answer: ui.help.a1,
    },
    {
      icon: <FileText className="w-5 h-5 text-teal-600" />,
      question: ui.help.q2,
      answer: ui.help.a2,
    },
    {
      icon: <Languages className="w-5 h-5 text-teal-600" />,
      question: ui.help.q3,
      answer: ui.help.a3,
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      question: ui.help.q4,
      answer: ui.help.a4,
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      question: ui.help.q5,
      answer: ui.help.a5,
    },
    {
      icon: <Printer className="w-5 h-5 text-teal-600" />,
      question: ui.help.q6,
      answer: ui.help.a6,
    },
    {
      icon: <Lock className="w-5 h-5 text-teal-600" />,
      question: ui.help.q7,
      answer: ui.help.a7,
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
              <h3 className="text-lg font-bold text-slate-900">{ui.help.title}</h3>
              <p className="text-xs text-slate-500">
                {ui.help.subtitle}
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
          <span>{interfaceLanguage === 'te' ? 'అస్పష్టమైన సూచనలను ఎల్లప్పుడూ మీ ఆసుపత్రి లేదా ఫార్మసీ వైద్య బృందంతో నిర్ధారించుకోండి.' : 'Always confirm unclear instructions with your hospital or pharmacy care team.'}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition w-full sm:w-auto"
          >
            {ui.help.close}
          </button>
        </div>
      </div>
    </div>
  );
};
