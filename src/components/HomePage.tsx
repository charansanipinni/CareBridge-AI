import React from 'react';
import { 
  ArrowRight, 
  FileUp, 
  FileCheck2, 
  Printer, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Languages,
  Clock,
  Pill,
  Calendar
} from 'lucide-react';
import { LanguageCode } from '../types/careplan';

interface HomePageProps {
  onStartCreate: () => void;
  onTrySample: () => void;
  onNavigateHowItWorks: () => void;
  interfaceLanguage: LanguageCode;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartCreate,
  onTrySample,
  onNavigateHowItWorks,
  interfaceLanguage,
}) => {
  const isTe = interfaceLanguage === 'te';

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* 1. Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4">
        {/* Subtle Category Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-6 shadow-2xs">
          <Heart className="w-3.5 h-3.5 text-teal-600 fill-teal-600" />
          <span>{isTe ? 'రోగుల మరియు సంరక్షకుల మార్గదర్శి' : 'Patient-Centered Discharge Care Assistant'}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-5">
          {isTe 
            ? 'మీ చికిత్సను అర్థం చేసుకోండి. ఇంట్లో మరింత నమ్మకంగా కోలుకోండి.'
            : 'Understand Your Care. Feel More Confident at Home.'}
        </h1>

        {/* Supporting text */}
        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
          {isTe
            ? 'క్లిష్టమైన ఆసుపత్రి డిశ్చార్జ్ సూచనలను మీ ప్రాధాన్యత భాషలో సరళమైన, సులభంగా అర్థమయ్యే సంరక్షణ ప్రణాళికగా మార్చండి.'
            : 'Turn complicated hospital discharge instructions into simple, easy-to-understand care plans in your preferred language.'}
        </p>

        {/* Primary and Secondary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={onStartCreate}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center space-x-2 group focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
          >
            <span>{isTe ? 'నా సంరక్షణ ప్రణాళికను సృష్టించండి' : 'Create My Care Plan'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={onTrySample}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 shadow-2xs transition hover:border-slate-400 flex items-center justify-center space-x-2 focus:ring-2 focus:ring-slate-300 focus:outline-hidden"
          >
            <span>{isTe ? 'నమూనా ప్లాన్ చూడండి' : 'Try a Sample Care Plan'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          {isTe ? 'ఉచితంగా ఉపయోగించండి • లాగిన్ అవసరం లేదు • సురక్షితమైన సెషన్ ప్రాసెసింగ్' : 'Free to use • No account required • In-memory privacy preservation'}
        </p>
      </section>

      {/* 2. Three Simple Steps Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
            {isTe ? 'మూడు సులభమైన దశలు' : 'How It Works in 3 Simple Steps'}
          </h2>
          <h3 className="text-2xl font-bold text-slate-900">
            {isTe ? 'ఆసుపత్రి నుండి ఇంటికి సులభమైన ప్రయాణం' : 'From Hospital Discharge to Confident Home Recovery'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between hover:border-teal-300 transition">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-lg mb-4 border border-teal-200">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                {isTe ? '1. మీ డిశ్చార్జ్ సారాంశాన్ని అప్‌లోడ్ చేయండి' : '1. Upload your discharge summary.'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isTe
                  ? 'మీ ఆసుపత్రి ఇచ్చిన పత్రాలను PDF రూపంలో అప్‌లోడ్ చేయండి లేదా సూచనలను నేరుగా కాపీ చేసి పేస్ట్ చేయండి.'
                  : 'Upload your hospital summary as a PDF, text document, or paste the text directly into our clean document workspace.'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-teal-700 font-semibold space-x-1.5">
              <FileUp className="w-4 h-4" />
              <span>{isTe ? 'PDF లేదా టెక్స్ట్ పత్రాలు' : 'PDF, TXT, or manual text'}</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between hover:border-teal-300 transition">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-lg mb-4 border border-teal-200">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                {isTe ? '2. సులభమైన సూచనలను సమీక్షించండి' : '2. Review your simplified care instructions.'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isTe
                  ? 'మందులు, మోతాదులు, ఆహార నియమాలు మరియు అత్యవసర హెచ్చరికలను సరళమైన ఆంగ్లంలో లేదా సహజమైన తెలుగులో చదవండి.'
                  : 'Read clear medication schedules, daily home care, food instructions, and warning signs in plain English or natural Telugu.'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-teal-700 font-semibold space-x-1.5">
              <FileCheck2 className="w-4 h-4" />
              <span>{isTe ? '8వ తరగతి చదువు శైలి' : 'Class 8 plain-language reading'}</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between hover:border-teal-300 transition">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-lg mb-4 border border-teal-200">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                {isTe ? '3. కేర్ ప్లాన్‌ను డౌన్‌లోడ్ చేసి ఉంచుకోండి' : '3. Download and keep your care plan.'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isTe
                  ? 'మీ కోసం లేదా మీ సంరక్షకుల కోసం ఒక-పేజీ ప్రింట్ షీట్‌ను ప్రింట్ చేసుకోండి లేదా PDF రూపంలో సేవ్ చేయండి.'
                  : 'Print a clean, single-page care sheet or download as PDF for your home refrigerator, caregiver, or bedside table.'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-teal-700 font-semibold space-x-1.5">
              <Printer className="w-4 h-4" />
              <span>{isTe ? '1-పేజీ ప్రింట్ మరియు PDF' : '1-page print or save as PDF'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust & Safety Anchor Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">
                {isTe ? 'మా విశ్వసనీయత మరియు భద్రతా సూత్రం' : 'Our Source-of-Truth Safety Promise'}
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                "Your original medical instructions remain our source of truth. Important details are checked, and unclear information is flagged for review."
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Zero invented medications</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Exact doses and units verified</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Ambiguities flagged for doctor review</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Healthcare Notice */}
      <section className="max-w-3xl mx-auto px-4 text-center">
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800 font-semibold">Important Clinical Notice: </strong>
          CareBridge AI helps explain discharge instructions. It does not replace your doctor, pharmacist, or healthcare team. Confirm unclear instructions directly with them.
        </div>
      </section>
    </div>
  );
};
