import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  X, 
  HeartPulse, 
  AlertTriangle, 
  Calendar, 
  Pill, 
  ShieldCheck, 
  CheckCircle,
  HelpCircle,
  Download,
  QrCode,
  FileCode,
  ArrowLeft,
  FileDown
} from 'lucide-react';
import { PatientCarePlan, FaithfulnessReport, ClinicalFacts } from '../types/careplan';

interface PatientCareSheetProps {
  plan: PatientCarePlan;
  facts: ClinicalFacts;
  report: FaithfulnessReport;
  onClose?: () => void;
  onBack?: () => void;
  isPrintModal?: boolean;
  autoPrint?: boolean;
}

export const PatientCareSheet: React.FC<PatientCareSheetProps> = ({
  plan,
  facts,
  report,
  onClose,
  onBack,
  isPrintModal = false,
  autoPrint = false,
}) => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const isTelugu = plan.language === 'te';
  const isVerified = report.overallStatus === 'VERIFIED_CONSISTENT';
  const verificationHash = `CB-${(facts.patientId || 'SYNTH').slice(0, 8)}-${report.passedCount}P${report.failedCount}F`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const originalTitle = document.title;
    const cleanId = (facts.patientId || 'Discharge-Prescription').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `CareBridge_Prescription_${cleanId}_${plan.language.toUpperCase()}`;
    
    // Set document title so the browser print-to-PDF dialog uses this filename by default
    document.title = filename;

    setDownloadNotice(
      isTelugu 
        ? 'ప్రిస్క్రిప్షన్ PDF సిద్ధంగా ఉంది. మీ కంప్యూటర్‌లో భద్రపరచడానికి "Save as PDF" ఎంచుకోండి.' 
        : 'Prescription PDF ready: select "Save as PDF" destination in your browser to download.'
    );

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);

    setTimeout(() => {
      setDownloadNotice(null);
    }, 6000);
  };

  // Auto-trigger PDF download when autoPrint prop is true
  useEffect(() => {
    if (isPrintModal && autoPrint) {
      const timer = setTimeout(() => {
        handleDownloadPDF();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isPrintModal, autoPrint]);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isPrintModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (onClose || onBack)) {
        (onClose || onBack)!();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPrintModal, onClose, onBack]);

  const handleDownloadJSON = () => {
    const exportData = {
      product: 'CareBridge AI',
      generatedDate: new Date().toISOString(),
      language: plan.language,
      verificationStatus: report.overallStatus,
      facts,
      carePlan: plan,
      validationSummary: {
        passed: report.passedCount,
        failed: report.failedCount,
        unresolved: report.unresolvedCount,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carebridge-care-plan-${plan.language}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sheetContent = (
    <div className="printable-care-sheet bg-white p-6 sm:p-8 text-slate-900 border sm:border-slate-300 sm:rounded-2xl sm:shadow-lg max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-6 h-6 text-teal-700" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {isTelugu ? 'రోగి డిశ్చార్జ్ సంరక్షణ ప్రణాళిక (CareBridge AI)' : 'PATIENT DISCHARGE CARE PLAN'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">
            {isTelugu 
              ? 'ఆసుపత్రి డిశ్చార్జ్ సారాంశం ఆధారంగా రూపొందించిన స్పష్టమైన సూచనలు' 
              : 'Clear, simplified instructions for home recovery • Source-Verified'}
          </p>
        </div>

        <div className="text-right">
          <div className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
            isVerified 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}>
            {isVerified ? 'VERIFIED CONSISTENT' : 'NEEDS CLINICIAN REVIEW'}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Date: {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>

      {/* Patient & Admission Info */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 text-xs grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            {isTelugu ? 'రోగి గుర్తింపు (Patient ID)' : 'Patient ID'}
          </span>
          <span className="font-bold text-slate-900">{facts.patientId || 'Not recorded'}</span>
        </div>
        <div className="col-span-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            {isTelugu ? 'చికిత్స పొందిన కారణం (Reason for Care)' : 'Reason For Hospital Care'}
          </span>
          <span className="font-bold text-slate-900">{facts.admissionReason || 'General Post-Procedure Recovery'}</span>
        </div>
      </div>

      {/* 1. Care Summary */}
      <div className="mb-5 page-break-inside-avoid">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center">
          <span className="w-2 h-2 rounded-full bg-teal-600 mr-2"></span>
          {isTelugu ? '1. సంరక్షణ సారాంశం (Summary)' : '1. Your Care Summary'}
        </h2>
        <p className="text-xs text-slate-700 leading-relaxed bg-teal-50/30 p-3 rounded-lg border border-teal-100">
          {plan.careSummary}
        </p>
      </div>

      {/* 2. Discharge Medications Table */}
      <div className="mb-5 page-break-inside-avoid">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
          <Pill className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
          {isTelugu ? '2. మందులు: ఎలా మరియు ఎప్పుడు తీసుకోవాలి (Your Medicines)' : '2. Your Medicines: What, How Much, When & How Long'}
        </h2>
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold text-slate-800 uppercase">
                <th className="p-2 border-r border-slate-300">{isTelugu ? 'మందు పేరు' : 'Medicine'}</th>
                <th className="p-2 border-r border-slate-300">{isTelugu ? 'మోతాదు' : 'Dose (How Much)'}</th>
                <th className="p-2 border-r border-slate-300">{isTelugu ? 'మార్గం' : 'Route'}</th>
                <th className="p-2 border-r border-slate-300">{isTelugu ? 'ఎప్పుడు తీసుకోవాలి' : 'When to Take'}</th>
                <th className="p-2">{isTelugu ? 'ఎన్ని రోజులు' : 'How Long'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {plan.medications.map((m) => (
                <tr key={m.id}>
                  <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                    {m.medicineName} {m.strength !== 'Not specified in source' && `(${m.strength})`}
                  </td>
                  <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">{m.howMuch}</td>
                  <td className="p-2 text-slate-700 border-r border-slate-200">{m.route}</td>
                  <td className="p-2 text-slate-800 font-medium border-r border-slate-200">{m.whenToTake}</td>
                  <td className="p-2 text-slate-800 font-bold">{m.forHowLong}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stopped Medications - Critical Safety Section */}
      {facts.stoppedMedications && facts.stoppedMedications.length > 0 && (
        <div className="mb-5 p-3.5 rounded-lg border-2 border-amber-500 bg-amber-50/80 page-break-inside-avoid">
          <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-700" />
            {isTelugu ? 'తక్షణమే ఆపివేయవలసిన మందులు (DO NOT TAKE)' : 'MEDICINES TO STOP IMMEDIATELY (DO NOT TAKE)'}
          </h2>
          <ul className="list-disc pl-4 text-xs font-semibold text-amber-950 space-y-0.5">
            {facts.stoppedMedications.map((s, idx) => (
              <li key={idx}>STOP {s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid: Daily Care, Diet, Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 page-break-inside-avoid text-xs">
        {/* Daily Care */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1">
            {isTelugu ? '3. రోజువారీ సంరక్షణ' : '3. Daily Care & Dressing'}
          </h3>
          <ul className="list-disc pl-3.5 space-y-1 text-slate-700 text-[11px]">
            {plan.dailyCare.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Food and Drink */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1">
            {isTelugu ? '4. ఆహారం & ద్రవాలు' : '4. Food & Drink'}
          </h3>
          <ul className="list-disc pl-3.5 space-y-1 text-slate-700 text-[11px]">
            {plan.foodAndDrink.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Activity Limits */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1">
            {isTelugu ? '5. శారీరక వ్యాయామాలు' : '5. Activity Limits'}
          </h3>
          <ul className="list-disc pl-3.5 space-y-1 text-slate-700 text-[11px]">
            {plan.activity.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 6. Warning Signs & Escalation Box */}
      <div className="p-4 rounded-xl border-2 border-rose-500 bg-rose-50/60 mb-5 page-break-inside-avoid">
        <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs uppercase tracking-wider mb-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{isTelugu ? '6. అత్యవసర హెచ్చరిక సంకేతాలు (Warning Signs)' : '6. When to Seek Urgent Medical Care'}</span>
        </div>

        {plan.warningSigns.notice && (
          <p className="text-xs text-rose-800 italic mb-2">{plan.warningSigns.notice}</p>
        )}

        {plan.warningSigns.urgentSigns.length > 0 && (
          <ul className="list-disc pl-4 space-y-1 text-xs text-rose-950 font-semibold mb-2">
            {plan.warningSigns.urgentSigns.map((sign, idx) => (
              <li key={idx}>{sign}</li>
            ))}
          </ul>
        )}

        <div className="text-xs font-bold text-rose-950 mt-1">
          {isTelugu ? 'చేయవలసిన పని: ' : 'Action to take: '}
          <span className="underline">{plan.warningSigns.actionToTake}</span>
        </div>
      </div>

      {/* 7. Follow-up & 8. Questions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 page-break-inside-avoid text-xs">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-700" />
            {isTelugu ? '7. తదుపరి చెకప్ (Follow-up)' : '7. Follow-up Appointment'}
          </h3>
          <p className="font-extrabold text-teal-800 text-sm mt-1">{plan.followUp.timingDisplay}</p>
          <p className="text-slate-700 font-medium mt-0.5">{plan.followUp.departmentOrDoctor}</p>
          {plan.followUp.missingNotice && (
            <p className="text-amber-800 text-[11px] mt-1 font-semibold">{plan.followUp.missingNotice}</p>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1 flex items-center">
            <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-700" />
            {isTelugu ? '8. అడగవలసిన ప్రశ్నలు' : '8. Questions For Your Care Team'}
          </h3>
          <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
            {plan.questionsForCareTeam.slice(0, 3).map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mandatory Reminder Box */}
      <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-center text-xs text-amber-950 font-bold mb-4 page-break-inside-avoid">
        {isTelugu ? (
          <span>ముఖ్య గమనిక: ఏదైనా సూచన అస్పష్టంగా ఉంటే, వెంటనే మీ ఆసుపత్రి వైద్య బృందాన్ని సంప్రదించి నిర్ధారించుకోండి.</span>
        ) : (
          <span>IMPORTANT: Always confirm unclear or contradictory instructions directly with your healthcare team before taking medications.</span>
        )}
      </div>

      {/* Signature & Verification Footer */}
      <div className="border-t border-slate-300 pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 page-break-inside-avoid">
        <div className="flex items-center space-x-2">
          <span>CareBridge AI v1.0 • AVENGERS Prototype</span>
          <span>•</span>
          <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">ID: {verificationHash}</span>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-6">
          <span>Clinician Signature: _______________________</span>
          <span>Patient/Caregiver Acknowledged: [  ]</span>
        </div>
      </div>
    </div>
  );

  // If used as full-screen print preview modal
  if (isPrintModal) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs overflow-y-auto p-2 sm:p-4 md:py-8 flex justify-center items-start"
        onClick={(e) => {
          if (e.target === e.currentTarget && (onClose || onBack)) {
            (onClose || onBack)!();
          }
        }}
      >
        <div className="relative w-full max-w-4xl my-2 sm:my-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
          {/* STICKY ACTION HEADER BAR - ALWAYS VISIBLE AT THE TOP */}
          <div className="sticky top-0 z-30 no-print flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white px-4 py-3 sm:px-6 sm:py-3.5 shadow-md border-b border-slate-800">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {(onBack || onClose) && (
                <button
                  type="button"
                  onClick={onBack || onClose}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition border border-slate-600 hover:border-teal-400 shadow-xs cursor-pointer"
                  title={isTelugu ? 'సంరక్షణ ప్రణాళికకు తిరిగి వెళ్లండి' : 'Back to Care Plan'}
                >
                  <ArrowLeft className="w-4 h-4 text-teal-400" />
                  <span>{isTelugu ? '← వెనుకకు' : '← Back to Care Plan'}</span>
                </button>
              )}
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-100">
                  {isTelugu ? 'రోగి డిశ్చార్జ్ సంరక్షణ ప్రిస్క్రిప్షన్ (A4)' : 'Prescription & Care Sheet (A4)'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 transition border border-slate-700 cursor-pointer"
                title="Download JSON record"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">JSON</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 sm:px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition border border-slate-700 cursor-pointer"
                title="Print on paper"
              >
                <Printer className="w-4 h-4 text-teal-400" />
                <span>{isTelugu ? 'ప్రింట్' : 'Print'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition cursor-pointer ring-1 ring-emerald-400/50"
                title="Download Prescription as PDF"
              >
                <FileDown className="w-4 h-4" />
                <span>{isTelugu ? 'PDF డౌన్‌లోడ్' : 'Download Prescription PDF'}</span>
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition ml-1 cursor-pointer"
                  title="Close (Esc)"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {downloadNotice && (
            <div className="no-print bg-teal-800 text-teal-50 px-4 py-2.5 text-xs font-semibold flex items-center space-x-2 border-b border-teal-700">
              <CheckCircle className="w-4 h-4 text-teal-300 shrink-0" />
              <span>{downloadNotice}</span>
            </div>
          )}

          <div className="p-3 sm:p-6 bg-slate-100">
            {sheetContent}
          </div>
        </div>
      </div>
    );
  }

  // Inline view
  return (
    <div className="mb-8">
      {downloadNotice && (
        <div className="no-print mb-4 p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center space-x-2 shadow-2xs">
          <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {(onBack || onClose) && (
            <button
              type="button"
              onClick={onBack || onClose}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition shadow-2xs cursor-pointer"
              title={isTelugu ? 'సంరక్షణ ప్రణాళికకు తిరిగి వెళ్లండి' : 'Back to Care Plan'}
            >
              <ArrowLeft className="w-4 h-4 text-teal-700" />
              <span>{isTelugu ? '← సంరక్షణ ప్రణాళికకు తిరిగి వెళ్లండి' : '← Back to Care Plan'}</span>
            </button>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isTelugu ? 'ఒక పేజీ ముద్రించదగిన రోగి సంరక్షణ పత్రం' : 'One-Page Printable Patient Care Sheet'}
            </h3>
            <p className="text-xs text-slate-500">
              {isTelugu 
                ? 'A4 పేపర్‌పై ప్రింట్ చేయడానికి లేదా PDFగా డౌన్‌లోడ్ చేయడానికి సరిపోతుంది' 
                : 'Formatted specifically for A4 printing or browser PDF export with zero dashboard clutter'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1.5 transition cursor-pointer"
            title="Export JSON record"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs flex items-center space-x-1.5 transition cursor-pointer"
            title="Print on paper"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>{isTelugu ? 'ప్రింట్' : 'Print'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
            title="Download as PDF file"
          >
            <FileDown className="w-4 h-4" />
            <span>{isTelugu ? 'PDF డౌన్‌లోడ్' : 'Download as PDF'}</span>
          </button>
        </div>
      </div>

      {sheetContent}
    </div>
  );
};
