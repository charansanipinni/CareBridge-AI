import React from 'react';
import { 
  ArrowRight, 
  FileUp, 
  FileCheck2, 
  Printer, 
  ShieldCheck, 
  Heart, 
  CheckCircle, 
} from 'lucide-react';
import { LanguageCode } from '../types/careplan';
import { getUiStrings } from '../utils/uiTranslations';

interface HomePageProps {
  onStartCreate: () => void;
  onTrySample: () => void;
  onNavigateHowItWorks: () => void;
  interfaceLanguage: LanguageCode;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartCreate,
  onTrySample,
  interfaceLanguage,
}) => {
  const t = getUiStrings(interfaceLanguage).home;

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* 1. Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4">
        {/* Subtle Category Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-6 shadow-2xs">
          <Heart className="w-3.5 h-3.5 text-teal-600 fill-teal-600" />
          <span>{t.category}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-5">
          {t.heroTitle}
        </h1>

        {/* Supporting text */}
        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
          {t.heroSubtitle}
        </p>

        {/* Primary and Secondary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={onStartCreate}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center space-x-2 group focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
          >
            <span>{t.ctaCreate}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={onTrySample}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 shadow-2xs transition hover:border-slate-400 flex items-center justify-center space-x-2 focus:ring-2 focus:ring-slate-300 focus:outline-hidden"
          >
            <span>{t.ctaSample}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          {t.trustPill}
        </p>
      </section>

      {/* 2. Three Simple Steps Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
            {t.howTitle}
          </h2>
          <h3 className="text-2xl font-bold text-slate-900">
            {t.howSubtitle}
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
                {t.step1Title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.step1Desc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-teal-700 font-semibold space-x-1.5">
              <FileUp className="w-4 h-4" />
              <span>{t.step1Badge}</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between hover:border-teal-300 transition">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-lg mb-4 border border-teal-200">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                {t.step2Title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.step2Desc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-teal-700 font-semibold space-x-1.5">
              <FileCheck2 className="w-4 h-4" />
              <span>{t.step2Badge}</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between hover:border-teal-300 transition">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-lg mb-4 border border-teal-200">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                {t.step3Title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.step3Desc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-teal-700 font-semibold space-x-1.5">
              <Printer className="w-4 h-4" />
              <span>{t.step3Badge}</span>
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
                {t.safetyTitle}
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.safetyDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{t.safety1}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{t.safety2}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{t.safety3}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Healthcare Notice */}
      <section className="max-w-3xl mx-auto px-4 text-center">
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800 font-semibold">{t.clinicalNoticeLabel} </strong>
          {t.clinicalNoticeText}
        </div>
      </section>
    </div>
  );
};
