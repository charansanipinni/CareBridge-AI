import React, { useState, useRef } from 'react';
import { FileUp, Sparkles, AlertCircle, FileText, CheckCircle2, ChevronRight, Languages, RefreshCw, HelpCircle, ShieldAlert } from 'lucide-react';
import { SAMPLE_CASES, SampleCase } from '../data/sampleSummaries';
import { LanguageCode } from '../types/careplan';

interface InputSectionProps {
  onProcess: (text: string, language: LanguageCode, sourceType: 'SYNTHETIC_DEMO' | 'PASTED' | 'UPLOADED') => void;
  isProcessing: boolean;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  onProcess,
  isProcessing,
  selectedLanguage,
  onLanguageChange,
}) => {
  const [inputText, setInputText] = useState<string>(SAMPLE_CASES[0].sourceText);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_CASES[0].id);
  const [fileError, setFileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sample' | 'paste' | 'upload'>('sample');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSample = (sample: SampleCase) => {
    setSelectedSampleId(sample.id);
    setInputText(sample.sourceText);
    setFileError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds the 5MB limit. Please provide a standard summary.');
      return;
    }

    // Accept .txt, .md, .pdf
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.txt') && !fileName.endsWith('.md') && !fileName.endsWith('.pdf')) {
      setFileError('Please upload a .txt, .md, or .pdf text document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        // If it's a PDF text representation or plain text
        if (fileName.endsWith('.pdf')) {
          // Extract printable ASCII strings if binary PDF
          const cleanText = content.replace(/[^\x20-\x7E\r\n\t]/g, ' ').replace(/\s{3,}/g, '\n').trim();
          if (cleanText.length > 50) {
            setInputText(cleanText);
            setActiveTab('paste');
          } else {
            setFileError('Could not extract readable text from PDF. You can copy and paste the summary text directly below.');
          }
        } else {
          setInputText(content);
          setActiveTab('paste');
        }
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read the file. Please paste the summary text.');
    };

    if (fileName.endsWith('.pdf')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setFileError('Discharge summary text cannot be empty.');
      return;
    }

    const sourceType = activeTab === 'sample' ? 'SYNTHETIC_DEMO' : activeTab === 'upload' ? 'UPLOADED' : 'PASTED';
    onProcess(inputText, selectedLanguage, sourceType);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8 no-print">
      {/* Workflow Guidance Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 sm:p-7">
        <div className="max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
            <span>Healthcare Track H2 Prototype</span>
            <span>•</span>
            <span>Zero Clinical Drift Guarantee</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Discharge Summary to Patient-Understandable Care Plan
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Convert complex hospital discharge summaries into simple, Class 8 readability instructions in English and Telugu. 
            Every instruction is audited by our <strong className="text-teal-300 font-semibold">Deterministic Faithfulness Engine</strong> to ensure no medications, dosages, or safety warnings are altered, omitted, or hallucinated.
          </p>
        </div>

        {/* 3 Steps Visual Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="flex items-center space-x-2.5 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-[11px] border border-teal-500/40">1</span>
            <span>Input Discharge Summary (PDF/Text)</span>
          </div>
          <div className="flex items-center space-x-2.5 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-[11px] border border-teal-500/40">2</span>
            <span>Extract Facts & Translate (EN / TE)</span>
          </div>
          <div className="flex items-center space-x-2.5 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-[11px] border border-teal-500/40">3</span>
            <span>Deterministic Safety Audit & 1-Page Print</span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Input Methods Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('sample')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'sample'
                  ? 'bg-teal-50 text-teal-700 border border-teal-300'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Synthetic Demo Cases (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'paste'
                  ? 'bg-teal-50 text-teal-700 border border-teal-300'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Paste Summary Text
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'upload'
                  ? 'bg-teal-50 text-teal-700 border border-teal-300'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Upload Document (PDF / TXT)
            </button>
          </div>

          {/* Patient Plan Language Selector */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <Languages className="w-4 h-4 text-slate-500 ml-1.5" />
            <span className="text-xs font-medium text-slate-600 mr-1">Output Language:</span>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                selectedLanguage === 'en'
                  ? 'bg-white text-teal-800 shadow-xs border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('te')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                selectedLanguage === 'te'
                  ? 'bg-white text-teal-800 shadow-xs border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              తెలుగు (Telugu)
            </button>
          </div>
        </div>

        {/* Tab 1: Synthetic Benchmark Cards */}
        {activeTab === 'sample' && (
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
              Select A Synthetic Case To Test Clinical Integrity:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SAMPLE_CASES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition relative ${
                    selectedSampleId === sample.id
                      ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-1.5 ${
                        sample.isAdversarial 
                          ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}>
                        {sample.badge}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{sample.title}</h4>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{sample.subtitle}</p>
                    </div>
                    {selectedSampleId === sample.id && (
                      <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {sample.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Upload Drag & Drop Area */}
        {activeTab === 'upload' && (
          <div className="mb-5">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/30 rounded-xl p-8 text-center cursor-pointer transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center text-slate-600 group-hover:text-teal-700 mb-3 transition">
                <FileUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Click to upload or drag & drop discharge summary
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports TXT, MD, and text-based PDF (Max 5MB) • Synthetic patient data only
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {fileError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Discharge Summary Text Editor */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="summary-text" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Source Discharge Summary (Source of Truth)
              </label>
              <span className="text-[11px] text-slate-700 font-semibold">
                {inputText.length} characters • {inputText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              id="summary-text"
              rows={7}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setFileError(null);
              }}
              placeholder="Paste or type synthetic hospital discharge summary here..."
              className="w-full p-3.5 text-xs font-mono bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition text-slate-800 leading-relaxed"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center text-xs text-slate-700 font-medium">
              <ShieldAlert className="w-4 h-4 mr-1.5 text-teal-600" />
              <span>Synthetic de-identified data. Clinical facts deterministically audited before display.</span>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Auditing & Creating Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>Create Care Plan</span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
