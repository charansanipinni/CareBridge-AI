import React, { useState, useRef, useEffect } from 'react';
import { 
  FileUp, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Languages, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  Check, 
  AlertOctagon, 
  AlertTriangle, 
  Pill, 
  Calendar, 
  Heart, 
  Clock, 
  Printer, 
  Eye, 
  Stethoscope, 
  Download,
  BookOpen,
  HelpCircle,
  FolderOpen,
  FileDown,
  Bell,
  BellRing
} from 'lucide-react';
import { SAMPLE_CASES, SampleCase } from '../data/sampleSummaries';
import { CareBridgeResult, LanguageCode, PatientCarePlan, FaithfulnessReport } from '../types/careplan';
import { getUiStrings } from '../utils/uiTranslations';

import { MedicationTable } from './MedicationTable';
import { CarePlanCards } from './CarePlanCards';
import { SevenDayTimetable } from './SevenDayTimetable';
import { AudioPlayer } from './AudioPlayer';
import { TeluguDualView } from './TeluguDualView';
import { SourceComparison } from './SourceComparison';
import { ValidationReport } from './ValidationReport';
import { PatientCareSheet } from './PatientCareSheet';
import { PrescriptionReminders } from './PrescriptionReminders';
import { DriftControlBar } from './DriftControlBar';

interface WorkflowWizardProps {
  initialText?: string;
  initialLanguage?: LanguageCode;
  interfaceLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onProcess: (text: string, language: LanguageCode, sourceType: 'SYNTHETIC_DEMO' | 'PASTED' | 'UPLOADED', documentName?: string) => Promise<void>;
  isProcessing: boolean;
  result: CareBridgeResult | null;
  onOpenPrint: () => void;
  // Drift props
  isDriftActive: boolean;
  driftDescription: string;
  onApplyDrift: (simPlan: PatientCarePlan, simReport: FaithfulnessReport, note: string) => void;
  onResetDrift: () => void;
  activePlan: PatientCarePlan | null;
  activeReport: FaithfulnessReport | null;
}

export const WorkflowWizard: React.FC<WorkflowWizardProps> = ({
  initialText = '',
  initialLanguage = 'en',
  interfaceLanguage,
  onLanguageChange,
  onProcess,
  isProcessing,
  result,
  onOpenPrint,
  isDriftActive,
  driftDescription,
  onApplyDrift,
  onResetDrift,
  activePlan,
  activeReport,
}) => {
  // Step state (1: Upload, 2: Language, 3: Review & Generate, 4: View Care Plan)
  const [currentStep, setCurrentStep] = useState<number>(result ? 4 : 1);
  const [inputOption, setInputOption] = useState<'upload' | 'manual'>('upload');
  
  // Document state
  const [documentText, setDocumentText] = useState<string>(initialText || SAMPLE_CASES[0].sourceText);
  const [selectedFileName, setSelectedFileName] = useState<string>('sample-surgical-recovery.txt');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(interfaceLanguage || initialLanguage);
  const [sourceType, setSourceType] = useState<'SYNTHETIC_DEMO' | 'PASTED' | 'UPLOADED'>('SYNTHETIC_DEMO');

  // Presentation view in Step 4: Patient View vs Professional Review View
  const [viewLevel, setViewLevel] = useState<'patient' | 'professional'>('patient');
  const [resultsTab, setResultsTab] = useState<'plan' | 'timetable' | 'bilingual' | 'audit' | 'source' | 'print' | 'reminders'>('plan');

  // Localized UI strings
  const ui = getUiStrings(selectedLanguage);

  // Sync selected language when interfaceLanguage updates
  useEffect(() => {
    if (interfaceLanguage && interfaceLanguage !== selectedLanguage) {
      setSelectedLanguage(interfaceLanguage);
    }
  }, [interfaceLanguage]);

  const handleSelectLanguage = (lang: LanguageCode) => {
    setSelectedLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  // Processing stage progression animation
  const [processingStage, setProcessingStage] = useState<number>(1);
  const stages = [
    ui.wizard.stage1,
    ui.wizard.stage2,
    ui.wizard.stage3,
    ui.wizard.stage4,
    ui.wizard.stage5,
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  // If a result is available and we just generated, jump to step 4
  useEffect(() => {
    if (result) {
      setCurrentStep(4);
    }
  }, [result]);

  // Processing stages timer simulation
  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      setProcessingStage(1);
      interval = setInterval(() => {
        setProcessingStage((prev) => (prev < 5 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds the 10MB limit. Please provide a standard summary.');
      return;
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.txt') && !fileName.endsWith('.md') && !fileName.endsWith('.pdf')) {
      setFileError('Please upload a .txt, .md, or .pdf text document.');
      return;
    }

    setSelectedFileName(file.name);
    setSourceType('UPLOADED');

    if (fileName.endsWith('.pdf')) {
      setIsExtractingPdf(true);
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            const res = await fetch('/api/extract-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ base64: base64Data, filename: file.name }),
            });

            if (res.ok) {
              const data = await res.json();
              if (data.text && data.text.trim().length > 20) {
                setDocumentText(data.text);
                setIsExtractingPdf(false);
                return;
              }
            }
          } catch {
            // fallback
          }

          // Fallback parser
          const binaryReader = new FileReader();
          binaryReader.onload = () => {
            const raw = binaryReader.result as string;
            const extracted = raw.replace(/[^\x20-\x7E\r\n\t]/g, ' ').replace(/\s{3,}/g, '\n').trim();
            if (extracted.length > 50) {
              setDocumentText(extracted);
            } else {
              setFileError('Scanned or image-only PDF detected. Please paste text directly into manual entry.');
            }
            setIsExtractingPdf(false);
          };
          binaryReader.readAsBinaryString(file);
        };
        reader.readAsDataURL(file);
      } catch {
        setIsExtractingPdf(false);
        setFileError('PDF parsing failed. Please copy & paste text directly.');
      }
    } else {
      // Plain text or markdown
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setDocumentText(content);
        }
      };
      reader.onerror = () => {
        setFileError('Failed to read the file. Please paste the summary text.');
      };
      reader.readAsText(file);
    }
  };

  const handleSelectSample = (sample: SampleCase) => {
    setSelectedFileName(`${sample.title}.txt`);
    setDocumentText(sample.sourceText);
    setSourceType('SYNTHETIC_DEMO');
    setFileError(null);
  };

  const handleRemoveFile = () => {
    setDocumentText('');
    setSelectedFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!documentText.trim()) {
      setFileError('Discharge summary text cannot be empty.');
      setCurrentStep(1);
      return;
    }

    await onProcess(documentText, selectedLanguage, sourceType, selectedFileName);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-4 sm:py-6">
      {/* 4-Step Progress Indicator Header */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { step: 1, label: selectedLanguage === 'te' ? '1. పత్రం' : '1. Document' },
            { step: 2, label: selectedLanguage === 'te' ? '2. భాష' : '2. Language' },
            { step: 3, label: selectedLanguage === 'te' ? '3. సమీక్ష' : '3. Review' },
            { step: 4, label: selectedLanguage === 'te' ? '4. కేర్ ప్లాన్' : '4. Care Plan' },
          ].map((item, idx) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <React.Fragment key={item.step}>
                <div 
                  onClick={() => {
                    if (isCompleted || (result && item.step === 4)) {
                      setCurrentStep(item.step);
                    }
                  }}
                  className={`flex items-center space-x-2 cursor-pointer transition ${
                    isCurrent 
                      ? 'text-teal-700 font-bold' 
                      : isCompleted 
                      ? 'text-slate-800 font-semibold' 
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition ${
                    isCurrent 
                      ? 'bg-teal-600 text-white shadow-xs' 
                      : isCompleted 
                      ? 'bg-teal-100 text-teal-800' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : item.step}
                  </div>
                  <span className="hidden sm:inline text-xs">{item.label}</span>
                </div>

                {idx < 3 && (
                  <div className={`grow h-0.5 mx-2 sm:mx-4 transition ${
                    currentStep > idx + 1 ? 'bg-teal-600' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: UPLOAD YOUR DOCUMENT                                              */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {ui.wizard.step1Title}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {ui.wizard.step1Desc}
            </p>
          </div>

          {/* Option Selector Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setInputOption('upload')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                  inputOption === 'upload'
                    ? 'bg-white text-teal-800 shadow-2xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>{ui.wizard.uploadTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setInputOption('manual')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                  inputOption === 'manual'
                    ? 'bg-white text-teal-800 shadow-2xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{ui.wizard.manualTab}</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {fileError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center max-w-2xl mx-auto">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Option A: File Upload Card */}
          {inputOption === 'upload' && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-500 p-8 text-center transition group max-w-2xl mx-auto shadow-2xs">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />

              {!selectedFileName || selectedFileName.startsWith('sample-') ? (
                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-700 group-hover:bg-teal-100 flex items-center justify-center mb-3 transition">
                    {isExtractingPdf ? (
                      <RefreshCw className="w-7 h-7 animate-spin text-teal-600" />
                    ) : (
                      <FileUp className="w-7 h-7" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isExtractingPdf ? ui.wizard.extractingPdf : ui.wizard.dragDrop}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {ui.wizard.supportedFormats}
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-xs"
                  >
                    {ui.wizard.browseFiles}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {ui.wizard.documentReady}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedFileName}</h3>
                    <p className="text-xs text-slate-500">
                      {documentText.length} {ui.wizard.characters} • {documentText.split(/\s+/).filter(Boolean).length} {ui.wizard.wordsExtracted}
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      {ui.common.replace}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{ui.common.remove}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Option B: Manual Entry Card */}
          {inputOption === 'manual' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs max-w-2xl mx-auto">
              <label htmlFor="manual-instructions" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {ui.wizard.pasteLabel}
              </label>
              <textarea
                id="manual-instructions"
                rows={8}
                value={documentText}
                onChange={(e) => {
                  setDocumentText(e.target.value);
                  setSelectedFileName('pasted-discharge-summary.txt');
                  setSourceType('PASTED');
                  setFileError(null);
                }}
                placeholder={ui.wizard.pastePlaceholder}
                className="w-full p-4 text-xs font-mono bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800 leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>{ui.wizard.pasteHint}</span>
                <span>{documentText.split(/\s+/).filter(Boolean).length} {ui.wizard.words}</span>
              </div>
            </div>
          )}

          {/* Try a Sample Document Section */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {ui.wizard.sampleLabel}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_CASES.slice(0, 4).map((sample) => {
                const title = interfaceLanguage === 'te' && sample.titleTe ? sample.titleTe : sample.title;
                const subtitle = interfaceLanguage === 'te' && sample.subtitleTe ? sample.subtitleTe : sample.subtitle;
                const badge = interfaceLanguage === 'te' && sample.badgeTe ? sample.badgeTe : sample.badge;
                return (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      selectedFileName === `${sample.title}.txt` || selectedFileName === `${title}.txt`
                        ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-400'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {badge}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Action */}
          <div className="max-w-2xl mx-auto flex justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={!documentText.trim()}
              onClick={() => {
                if (!documentText.trim()) {
                  setFileError('Please provide a document or choose a sample.');
                  return;
                }
                setCurrentStep(2);
              }}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition flex items-center space-x-2"
            >
              <span>{ui.wizard.nextChooseLang}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: CHOOSE YOUR LANGUAGE                                              */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {ui.wizard.step2Title}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {ui.wizard.step2Desc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* English Card */}
            <div
              onClick={() => handleSelectLanguage('en')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                selectedLanguage === 'en'
                  ? 'border-teal-600 bg-teal-50/40 shadow-xs ring-1 ring-teal-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                    EN
                  </span>
                  {selectedLanguage === 'en' && <CheckCircle2 className="w-6 h-6 text-teal-600" />}
                </div>
                <h3 className="text-base font-bold text-slate-900">{ui.wizard.enTitle}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {ui.wizard.enDesc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-teal-800 font-semibold">
                Class 8 Reading Level Verified
              </div>
            </div>

            {/* Telugu Card */}
            <div
              onClick={() => handleSelectLanguage('te')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                selectedLanguage === 'te'
                  ? 'border-teal-600 bg-teal-50/40 shadow-xs ring-1 ring-teal-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                    తె
                  </span>
                  {selectedLanguage === 'te' && <CheckCircle2 className="w-6 h-6 text-teal-600" />}
                </div>
                <h3 className="text-base font-bold text-slate-900">{ui.wizard.teTitle}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {ui.wizard.teDesc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-teal-800 font-semibold">
                Indic Prose Clarity Index Verified
              </div>
            </div>
          </div>

          {/* Clinical preservation note */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800 font-semibold">{ui.wizard.retentionNoticeLabel} </strong>
            {ui.wizard.retentionNoticeText}
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center space-x-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{ui.wizard.backToDoc}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition flex items-center space-x-2"
            >
              <span>{ui.wizard.continueToReview}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: REVIEW AND GENERATE                                               */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {ui.wizard.step3Title}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {ui.wizard.step3Desc}
            </p>
          </div>

          {/* Review Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase">{ui.wizard.inputDoc}</span>
              <span className="text-xs font-bold text-slate-900">{selectedFileName || 'Discharge Summary'}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase">{ui.wizard.targetLang}</span>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {selectedLanguage === 'te' ? 'తెలుగు (Telugu)' : 'English (Class 8 Plain Language)'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase">{ui.wizard.wordCount}</span>
              <span className="text-xs font-mono text-slate-700">{documentText.split(/\s+/).filter(Boolean).length} {ui.wizard.words}</span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Document Snippet:</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 line-clamp-3">
                {documentText}
              </div>
            </div>

            {/* Privacy Confirmation */}
            <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 text-xs text-slate-700 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                {ui.wizard.clinicalSafetyNotice}
              </span>
            </div>
          </div>

          {/* Processing Stages Indicator (Visible when generating) */}
          {isProcessing && (
            <div className="bg-white rounded-2xl border border-teal-200 p-6 shadow-md text-center space-y-4 animate-pulse">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {stages[processingStage - 1]}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Auditing clinical parameters against source text
                </p>
              </div>

              {/* Step checklist */}
              <div className="max-w-md mx-auto text-left space-y-1.5 text-xs text-slate-600 pt-2">
                {stages.map((st, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    {processingStage > i + 1 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : processingStage === i + 1 ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-200" />
                    )}
                    <span className={processingStage >= i + 1 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                      {st}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center space-x-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{ui.wizard.backBtn}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing || !documentText.trim()}
              onClick={handleGenerate}
              className="px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{ui.wizard.generatingBtn}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>{ui.wizard.generateBtn}</span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: VIEW YOUR CARE PLAN                                               */}
      {/* ========================================================================= */}
      {currentStep === 4 && result && activePlan && activeReport && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="no-print bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                {ui.results.planReadyBadge}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                {ui.results.planReadyTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {ui.results.admissionReason} <strong>{result.facts.admissionReason || 'Clinical discharge recovery'}</strong> • {ui.results.languageLabel} {activePlan.language === 'te' ? 'తెలుగు (Telugu)' : 'English'}
              </p>
            </div>

            {/* Presentation Level Toggle (Patient View vs Professional Review View) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewLevel('patient')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  viewLevel === 'patient'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{ui.results.patientView}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewLevel('professional')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  viewLevel === 'professional'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{ui.results.profReview}</span>
              </button>
            </div>
          </div>

          {/* Validation Status Banner */}
          <div className="no-print">
            {activeReport.overallStatus === 'VERIFIED_CONSISTENT' ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold">{ui.results.passedTitle}</h3>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded">
                      {activeReport.passedCount} {ui.results.passedChecksBadge}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {ui.results.passedDesc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex items-start space-x-3 ring-1 ring-rose-300">
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold">{ui.results.needsReviewTitle}</h3>
                    <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.2 rounded">
                      {activeReport.failedCount} {ui.results.needsReviewBadge}
                    </span>
                  </div>
                  <p className="text-xs text-rose-900 mt-0.5">
                    {ui.results.needsReviewDesc}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Professional Review View Banner (When active) */}
          {viewLevel === 'professional' && (
            <div className="no-print">
              <DriftControlBar
                originalSourceText={result.sourceText}
                baseFacts={result.facts}
                basePlan={activePlan}
                onApplyDrift={onApplyDrift}
                onResetDrift={onResetDrift}
                isDriftActive={isDriftActive}
                driftDescription={driftDescription}
              />
            </div>
          )}

          {/* Readability & Audio Strip */}
          <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <AudioPlayer plan={activePlan} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">{ui.results.readabilityStandard}</span>
                <span className="text-xs font-bold text-slate-900">{activePlan.readabilityScore.targetGrade}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">{activePlan.readabilityScore.notes}</p>
              </div>
              <span className="text-xs font-extrabold px-2 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-200">
                {ui.results.grade} {activePlan.readabilityScore.fleschKincaidGradeLevel}
              </span>
            </div>
          </div>

          {/* Tab Navigation for Step 4 Views */}
          <div className="no-print border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setResultsTab('plan')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
                  resultsTab === 'plan'
                    ? 'border-teal-600 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{ui.results.tabOverview}</span>
              </button>

              <button
                type="button"
                onClick={() => setResultsTab('timetable')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
                  resultsTab === 'timetable'
                    ? 'border-teal-600 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{ui.results.tabTimetable}</span>
              </button>

              <button
                type="button"
                onClick={() => setResultsTab('bilingual')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
                  resultsTab === 'bilingual'
                    ? 'border-teal-600 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Languages className="w-4 h-4" />
                <span>{ui.results.tabBilingual}</span>
              </button>

              {viewLevel === 'professional' && (
                <>
                  <button
                    type="button"
                    onClick={() => setResultsTab('audit')}
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
                      resultsTab === 'audit'
                        ? 'border-teal-600 text-teal-800'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{ui.results.tabAudit} ({activeReport.checks.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResultsTab('source')}
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
                      resultsTab === 'source'
                        ? 'border-teal-600 text-teal-800'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{ui.results.tabSource}</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setResultsTab('reminders')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
                  resultsTab === 'reminders'
                    ? 'border-teal-600 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bell className="w-4 h-4 text-amber-500" />
                <span>{interfaceLanguage === 'te' ? 'ఆటో రిమైండర్లు' : 'Auto Reminders'}</span>
                <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-emerald-100 text-emerald-800">
                  AUTO
                </span>
              </button>

              <button
                type="button"
                onClick={() => setResultsTab('print')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
                  resultsTab === 'print'
                    ? 'border-teal-600 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>{ui.results.tabPrint}</span>
              </button>
            </div>

            {/* Quick Action: Download PDF & New Document */}
            <div className="flex items-center space-x-2.5 pb-2">
              <button
                type="button"
                onClick={onOpenPrint}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer"
                title="Download or print single-page care plan"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>{interfaceLanguage === 'te' ? 'PDF డౌన్‌లోడ్' : 'Download PDF'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                + {ui.results.createAnother}
              </button>
            </div>
          </div>

          {/* Sub-Tab Contents */}
          <div className="pt-2">
            {resultsTab === 'plan' && (
              <div className="space-y-6">
                {/* Dedicated "Needs Confirmation" Callout if unresolved items exist */}
                {activePlan.questionsForCareTeam.length > 0 && (
                  <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 shadow-2xs">
                    <div className="flex items-center space-x-2 text-amber-950 font-bold text-sm mb-2">
                      <HelpCircle className="w-5 h-5 text-amber-600" />
                      <span>Items to Confirm with Your Healthcare Team:</span>
                    </div>
                    <p className="text-xs text-amber-900 mb-3">
                      The hospital summary left the following details unstated or relative. Please confirm with your clinic or pharmacist:
                    </p>
                    <ul className="space-y-1.5 text-xs text-amber-950 font-medium list-disc pl-5">
                      {activePlan.questionsForCareTeam.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Auto-Reminders Callout Banner */}
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 bg-white text-teal-700 rounded-xl shadow-2xs border border-teal-100 shrink-0">
                      <BellRing className="w-5 h-5 text-teal-600 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {interfaceLanguage === 'te' 
                          ? 'మందుల ఆటోమేటిక్ రిమైండర్లను ప్రారంభించండి (Auto-Send Reminders)' 
                          : 'Auto-Send Prescription Reminders (Never Miss a Dose)'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {interfaceLanguage === 'te'
                          ? 'మీ ప్రిస్క్రిప్షన్ ప్రకారం ఉదయం, మధ్యాహ్నం, రాత్రి వేళల్లో బ్రౌజర్ నోటిఫికేషన్లు, వాట్సాప్ మరియు క్యాలెండర్ అలర్ట్‌లు పొందండి.'
                          : 'Automated notification schedule derived from your prescription: Morning (8 AM), Midday (1 PM), Evening (6 PM), Bedtime (9 PM) with WhatsApp caregiver alerts.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResultsTab('reminders')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-teal-300" />
                    <span>{interfaceLanguage === 'te' ? 'రిమైండర్లు సెట్ చేయండి' : 'Configure Reminders'}</span>
                  </button>
                </div>

                <MedicationTable medications={activePlan.medications} />
                <CarePlanCards plan={activePlan} />
              </div>
            )}

            {resultsTab === 'timetable' && (
              <div className="space-y-6">
                <SevenDayTimetable
                  schedule={activePlan.sevenDaySchedule}
                  language={activePlan.language}
                />
                <CarePlanCards plan={activePlan} />
              </div>
            )}

            {resultsTab === 'bilingual' && (
              <TeluguDualView
                englishPlan={result.carePlanEnglish}
                teluguPlan={result.carePlanTelugu}
              />
            )}

            {resultsTab === 'audit' && (
              <ValidationReport report={activeReport} />
            )}

            {resultsTab === 'source' && (
              <SourceComparison
                sourceText={result.sourceText}
                facts={result.facts}
                carePlan={activePlan}
              />
            )}

            {resultsTab === 'reminders' && (
              <PrescriptionReminders
                plan={activePlan}
                facts={result.facts}
              />
            )}

            {resultsTab === 'print' && (
              <PatientCareSheet
                plan={activePlan}
                facts={result.facts}
                report={activeReport}
                onBack={() => setResultsTab('plan')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
