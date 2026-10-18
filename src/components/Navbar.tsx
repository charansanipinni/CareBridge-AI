import React from 'react';
import { ShieldCheck, HeartPulse, Sparkles, FileText, Printer, AlertTriangle } from 'lucide-react';
import { ProcessingMode } from '../types/careplan';

interface NavbarProps {
  mode: ProcessingMode;
  onOpenPrint?: () => void;
  hasResult: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ mode, onOpenPrint, hasResult }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center shadow-sm text-white">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">CareBridge</span>
              <span className="px-1.5 py-0.5 text-xs font-semibold rounded-md bg-teal-100 text-teal-800 uppercase tracking-wider">AI</span>
              <span className="hidden md:inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                Team AVENGERS • Hackathon 2026
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium">Clear instructions. Safer transitions home.</p>
          </div>
        </div>

        {/* Status Pills & Actions */}
        <div className="flex items-center space-x-3">
          {/* Demo Mode or AI Indicator */}
          <div className="flex items-center">
            {mode === 'DEMO' ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
                <span className="w-2 h-2 mr-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                Demo Mode (Deterministic)
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                AI Enhanced
              </span>
            )}
          </div>

          {/* Print Action if results available */}
          {hasResult && (
            <button
              onClick={onOpenPrint}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              <Printer className="w-4 h-4 mr-1.5 text-teal-400" />
              Print Care Sheet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
