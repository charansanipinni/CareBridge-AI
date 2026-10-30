import React, { useState, useEffect } from 'react';
import { Navbar, NavView } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { WorkflowWizard } from './components/WorkflowWizard';
import { MyCarePlansPage } from './components/MyCarePlansPage';
import { HowItWorksPage } from './components/HowItWorksPage';
import { AboutPage } from './components/AboutPage';
import { PatientCareSheet } from './components/PatientCareSheet';
import { HelpModal } from './components/HelpModal';
import { PrivacyModal } from './components/PrivacyModal';
import { ArchitectureModal } from './components/ArchitectureModal';

import { extractClinicalFacts } from './core/extractor';
import { generatePatientCarePlan } from './core/generator';
import { validateCarePlanFaithfulness } from './core/validator';
import { SAMPLE_CASES } from './data/sampleSummaries';
import { CareBridgeResult, LanguageCode, ProcessingMode, PatientCarePlan, FaithfulnessReport } from './types/careplan';

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('home');
  const [interfaceLanguage, setInterfaceLanguage] = useState<LanguageCode>('en');
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('DEMO');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Modals
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);

  // Active result & session history
  const [result, setResult] = useState<CareBridgeResult | null>(null);
  const [sessionHistory, setSessionHistory] = useState<CareBridgeResult[]>([]);

  // Safety test drift state (for professional review view)
  const [isDriftActive, setIsDriftActive] = useState<boolean>(false);
  const [driftDescription, setDriftDescription] = useState<string>('');
  const [driftedPlan, setDriftedPlan] = useState<PatientCarePlan | null>(null);
  const [driftedReport, setDriftedReport] = useState<FaithfulnessReport | null>(null);

  // Process a discharge summary (Client-side deterministic + optional backend API)
  const processDischargeSummary = async (
    text: string,
    language: LanguageCode,
    sourceType: 'SYNTHETIC_DEMO' | 'PASTED' | 'UPLOADED',
    documentName?: string
  ) => {
    setIsProcessing(true);
    // Reset drift when processing a new document
    setIsDriftActive(false);
    setDriftedPlan(null);
    setDriftedReport(null);
    setDriftDescription('');

    try {
      let processedResult: CareBridgeResult | null = null;
      try {
        const response = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            requestedMode: processingMode,
            sourceType,
            documentName,
          }),
        });

        if (response.ok) {
          processedResult = await response.json();
          if (documentName && processedResult) {
            processedResult.documentName = documentName;
          }
        }
      } catch (networkErr) {
        console.warn('Backend API unreachable, executing verified client-side deterministic pipeline:', networkErr);
      }

      if (!processedResult) {
        const facts = extractClinicalFacts(text);
        const carePlanEnglish = generatePatientCarePlan(facts, 'en');
        const carePlanTelugu = generatePatientCarePlan(facts, 'te');
        const faithfulnessReport = validateCarePlanFaithfulness(text, facts, carePlanEnglish);
        const faithfulnessReportTelugu = validateCarePlanFaithfulness(text, facts, carePlanTelugu);

        processedResult = {
          id: `cb-${Date.now()}`,
          timestamp: new Date().toISOString(),
          sourceText: text,
          sourceType,
          documentName: documentName || facts.admissionReason || 'Discharge Care Plan',
          mode: processingMode,
          facts,
          carePlanEnglish,
          carePlanTelugu,
          faithfulnessReport,
          faithfulnessReportTelugu,
          verificationToken: `CB-${(facts.patientId || 'SYNTH').slice(0, 8)}-${faithfulnessReport.passedCount}P${faithfulnessReport.failedCount}F`,
        };
      }

      setResult(processedResult);

      // Add to session history
      setSessionHistory((prev) => [processedResult!, ...prev.filter(p => p.id !== processedResult!.id)].slice(0, 10));
    } catch (err) {
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Initial load: initialize health check
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.mode === 'AI_READY') {
          setProcessingMode('AI');
        }
      })
      .catch(() => {
        // Fall back to DEMO mode
      });
  }, []);

  // Compute active plan and report, accounting for simulated drift if active
  const basePlan = result ? (interfaceLanguage === 'te' ? result.carePlanTelugu : result.carePlanEnglish) : null;
  const baseReport = result ? (interfaceLanguage === 'te' ? result.faithfulnessReportTelugu : result.faithfulnessReport) : null;

  const activePlan = (isDriftActive && driftedPlan) ? driftedPlan : basePlan;
  const activeReport = (isDriftActive && driftedReport) ? driftedReport : baseReport;

  const handleApplyDrift = (simPlan: PatientCarePlan, simReport: FaithfulnessReport, note: string) => {
    setIsDriftActive(true);
    setDriftedPlan(simPlan);
    setDriftedReport(simReport);
    setDriftDescription(note);
  };

  const handleResetDrift = () => {
    setIsDriftActive(false);
    setDriftedPlan(null);
    setDriftedReport(null);
    setDriftDescription('');
  };

  // Handlers for Home Page actions
  const handleStartCreateFromHome = () => {
    setCurrentView('create');
  };

  const handleTrySampleFromHome = () => {
    // Process benchmark sample immediately and navigate to create wizard
    processDischargeSummary(SAMPLE_CASES[0].sourceText, interfaceLanguage, 'SYNTHETIC_DEMO', `${SAMPLE_CASES[0].title}.txt`);
    setCurrentView('create');
  };

  // Handler for My Care Plans selection
  const handleSelectPlanFromHistory = (plan: CareBridgeResult) => {
    setResult(plan);
    setIsDriftActive(false);
    setCurrentView('create');
  };

  const handleDeletePlanFromHistory = (id: string) => {
    setSessionHistory(prev => prev.filter(p => p.id !== id));
    if (result?.id === id) {
      setResult(null);
    }
  };

  const handleClearAllHistory = () => {
    setSessionHistory([]);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans antialiased">
      {/* Redesigned Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        interfaceLanguage={interfaceLanguage}
        onLanguageToggle={setInterfaceLanguage}
        mode={processingMode}
        onOpenPrint={() => setShowPrintModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        hasResult={Boolean(result)}
        historyCount={sessionHistory.length}
      />

      {/* Main View Container */}
      <main className="grow w-full">
        {currentView === 'home' && (
          <HomePage
            onStartCreate={handleStartCreateFromHome}
            onTrySample={handleTrySampleFromHome}
            onNavigateHowItWorks={() => setCurrentView('how-it-works')}
            interfaceLanguage={interfaceLanguage}
          />
        )}

        {currentView === 'create' && (
          <WorkflowWizard
            initialText={result ? result.sourceText : SAMPLE_CASES[0].sourceText}
            initialLanguage={interfaceLanguage}
            onProcess={processDischargeSummary}
            isProcessing={isProcessing}
            result={result}
            onOpenPrint={() => setShowPrintModal(true)}
            isDriftActive={isDriftActive}
            driftDescription={driftDescription}
            onApplyDrift={handleApplyDrift}
            onResetDrift={handleResetDrift}
            activePlan={activePlan}
            activeReport={activeReport}
          />
        )}

        {currentView === 'history' && (
          <MyCarePlansPage
            plans={sessionHistory}
            onSelectPlan={handleSelectPlanFromHistory}
            onDeletePlan={handleDeletePlanFromHistory}
            onClearAll={handleClearAllHistory}
            onNavigateCreate={() => setCurrentView('create')}
          />
        )}

        {currentView === 'how-it-works' && (
          <HowItWorksPage
            onStartCreate={() => setCurrentView('create')}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            onStartCreate={() => setCurrentView('create')}
          />
        )}
      </main>

      {/* Printable Modal View if opened from top navbar */}
      {showPrintModal && result && activePlan && activeReport && (
        <PatientCareSheet
          plan={activePlan}
          facts={result.facts}
          report={activeReport}
          isPrintModal={true}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      {/* Architecture Modal */}
      {showArchitectureModal && (
        <ArchitectureModal onClose={() => setShowArchitectureModal(false)} />
      )}

      {/* Clean Production Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black text-slate-900 tracking-tight">CareBridge AI</span>
              <span>•</span>
              <span>Healthcare Track H2 • Team AVENGERS</span>
            </div>

            <div className="flex items-center space-x-6 text-slate-600 font-semibold">
              <button onClick={() => setCurrentView('how-it-works')} className="hover:text-teal-700 transition">How It Works</button>
              <button onClick={() => setCurrentView('about')} className="hover:text-teal-700 transition">About</button>
              <button onClick={() => setShowHelpModal(true)} className="hover:text-teal-700 transition">Help & FAQs</button>
              <button onClick={() => setShowPrivacyModal(true)} className="hover:text-teal-700 transition">Privacy & Security</button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <p>
              © 2026 CareBridge AI. Built for clinical safety and patient empowerment. Synthetic data demonstration.
            </p>
            <p>
              Always confirm medication and follow-up instructions with your attending physician or pharmacist.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
