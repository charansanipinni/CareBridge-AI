import React from 'react';
import { 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Database, 
  Cpu, 
  CheckCircle2, 
} from 'lucide-react';
import { LanguageCode } from '../types/careplan';
import { getUiStrings } from '../utils/uiTranslations';

interface HowItWorksPageProps {
  onStartCreate: () => void;
  interfaceLanguage?: LanguageCode;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ 
  onStartCreate,
  interfaceLanguage = 'en'
}) => {
  const t = getUiStrings(interfaceLanguage).howItWorks;
  const isTe = interfaceLanguage === 'te';

  const architectureSteps = [
    {
      num: '1',
      title: t.step1Title,
      desc: t.step1Desc,
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200',
    },
    {
      num: '2',
      title: t.step2Title,
      desc: t.step2Desc,
      icon: <Database className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200',
    },
    {
      num: '3',
      title: t.step3Title,
      desc: t.step3Desc,
      icon: <Layers className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      num: '4',
      title: t.step4Title,
      desc: t.step4Desc,
      icon: <Cpu className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      num: '5',
      title: t.step5Title,
      desc: t.step5Desc,
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      num: '6',
      title: t.step6Title,
      desc: t.step6Desc,
      icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          <span>{t.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t.title}
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* 6-Stage Architecture Grid */}
      <section className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 text-center">
          {isTe ? '6-దశల క్లినికల్ సేఫ్టీ పైప్‌లైన్' : 'The 6-Stage Clinical Pipeline'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {architectureSteps.map((step) => (
            <div key={step.num} className={`p-5 rounded-2xl border ${step.bg} flex flex-col justify-between shadow-2xs`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-full bg-white shadow-2xs flex items-center justify-center font-black text-xs text-slate-800">
                    {step.num}
                  </span>
                  {step.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Deterministic Validation Matters */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isTe ? 'స్వతంత్ర నియమాల ధృవీకరణ ఎందుకు ముఖ్యం?' : 'Why We Never Let an AI Model Certify Its Own Output'}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isTe 
                ? 'వైద్యరంగంలో స్వీయ-ధృవీకరణ సురక్షితం కాదు. లాంగ్వేజ్ మోడల్స్ ముఖ్యమైన మందులను విడిచిపెట్టినా సరైనవని చెప్పే ప్రమాదం ఉంది. అందువల్ల కేర్‌బ్రిడ్జ్ AI ఒక స్వతంత్ర రూల్-బేస్డ్ సేఫ్టీ ఇంజిన్‌ను ఉపయోగిస్తుంది.'
                : 'In healthcare, self-evaluating AI is a known hazard—language models can hallucinate or omit a critical medication while still claiming their output is correct. CareBridge AI uses an Independent Deterministic Validation Engine.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 font-semibold block mb-1">
              {isTe ? 'ఖచ్చితమైన ఔషధ & మోతాదు పోలిక' : 'Exact Drug & Dose Matching'}
            </strong>
            {isTe 
              ? 'రూపొందించిన ప్లాన్‌లోని ప్రతి మందూ మూల పత్రంతో సరిపోల్చబడుతుంది. మోతాదులు, యూనిట్లు (mg, mcg) మరియు సమయాలు ఖచ్చితంగా సరిపోలాలి.'
              : 'Every medication in the generated plan is verified against the source text. Doses, units (e.g. mg, mcg, units), and frequencies must match.'}
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 font-semibold block mb-1">
              {isTe ? 'సున్నా ఊహాజనిత హామీ' : 'Zero Hallucination Guarantee'}
            </strong>
            {isTe 
              ? 'సూచించని మందు లేదా లేని హెచ్చరిక కనిపిస్తే వెంటనే లోపంగా గుర్తించబడుతుంది.'
              : 'If an unprescribed medication or fabricated warning sign appears in the output, it is flagged as a Critical Failure.'}
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 font-semibold block mb-1">
              {isTe ? 'చెకప్ తేదీల పరిరక్షణ' : 'Preservation of Relative Dates'}
            </strong>
            {isTe 
              ? 'సారాంశంలో "వారం రోజుల్లో రండి" అని రాసి ఉంటే, సొంతంగా తప్పుడు తేదీని ఊహించకుండా ఆ సమయాన్ని స్పష్టంగా ఉంచుతుంది.'
              : 'If a discharge summary says "follow up in seven days", CareBridge AI preserves the relative timing without inventing an arbitrary calendar date.'}
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 font-semibold block mb-1">
              {isTe ? 'ఖచ్చితమైన భద్రతా స్థితి' : 'Strict Status Suppression'}
            </strong>
            {isTe 
              ? 'ఏదైనా సందేహం లేదా లోపం ఉంటే గ్రీన్ వెరిఫైడ్ బ్యాడ్జ్ నిలిపివేయబడి వైద్యుల సమీక్ష కోరబడుతుంది.'
              : 'If any critical check fails or remains unresolved, a green "Verified" badge is strictly suppressed.'}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={onStartCreate}
          className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-sm transition inline-flex items-center space-x-2"
        >
          <span>{t.ctaBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
