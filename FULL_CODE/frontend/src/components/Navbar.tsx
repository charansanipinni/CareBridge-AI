import React, { useState } from 'react';
import { 
  HeartPulse, 
  Sparkles, 
  Printer, 
  HelpCircle, 
  Shield, 
  Menu, 
  X, 
  Languages, 
  FilePlus, 
  FolderClock, 
  BookOpen, 
  Info,
  ChevronDown
} from 'lucide-react';
import { ProcessingMode, LanguageCode } from '../types/careplan';

export type NavView = 'home' | 'create' | 'history' | 'how-it-works' | 'about';

interface NavbarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  interfaceLanguage: LanguageCode;
  onLanguageToggle: (lang: LanguageCode) => void;
  mode: ProcessingMode;
  onOpenPrint?: (autoDownload?: boolean) => void;
  onOpenHelp: () => void;
  onOpenPrivacy: () => void;
  hasResult: boolean;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  interfaceLanguage,
  onLanguageToggle,
  mode,
  onOpenPrint,
  onOpenHelp,
  onOpenPrivacy,
  hasResult,
  historyCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'home' as NavView, label: interfaceLanguage === 'te' ? 'హోమ్' : 'Home' },
    { id: 'create' as NavView, label: interfaceLanguage === 'te' ? 'కేర్ ప్లాన్ తయారు చేయండి' : 'Create Care Plan' },
    { 
      id: 'history' as NavView, 
      label: interfaceLanguage === 'te' ? 'నా కేర్ ప్లాన్‌లు' : 'My Care Plans',
      badge: historyCount > 0 ? historyCount : undefined
    },
    { id: 'how-it-works' as NavView, label: interfaceLanguage === 'te' ? 'ఇది ఎలా పనిచేస్తుంది' : 'How It Works' },
    { id: 'about' as NavView, label: interfaceLanguage === 'te' ? 'కేర్‌బ్రిడ్జ్ గురించి' : 'About CareBridge' },
  ];

  const handleNavClick = (view: NavView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center space-x-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-500 flex items-center justify-center shadow-sm text-white group-hover:scale-102 transition duration-200">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-teal-900 transition">
                CareBridge
              </span>
              <span className="px-1.5 py-0.5 text-[11px] font-extrabold rounded-md bg-teal-100 text-teal-800 tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {interfaceLanguage === 'te' ? 'స్పష్టమైన సూచనలు. సురక్షితమైన స్వస్థత.' : 'Clear instructions. Safer transitions home.'}
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Language Toggle, and Help */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Patient Language Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => onLanguageToggle('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                interfaceLanguage === 'en'
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageToggle('te')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                interfaceLanguage === 'te'
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              తెలుగు
            </button>
          </div>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            aria-label="Help & Support"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
            title="Help and Support"
          >
            <HelpCircle className="w-5 h-5 text-slate-600" />
          </button>

          {/* Privacy Button */}
          <button
            onClick={onOpenPrivacy}
            aria-label="Privacy & Security"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
            title="Privacy & Data Safety"
          >
            <Shield className="w-5 h-5 text-slate-600" />
          </button>

          {/* Print Action if results available */}
          {hasResult && onOpenPrint && (
            <button
              onClick={() => onOpenPrint(true)}
              className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs cursor-pointer border border-slate-700"
              title="Download Prescription as PDF or Print Care Sheet"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
              <span>{interfaceLanguage === 'te' ? 'ప్రిస్క్రిప్షన్ ప్రింట్ / PDF' : 'Print Care Sheet'}</span>
            </button>
          )}

          {/* Mobile menu burger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-2 shadow-lg">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-200 text-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {hasResult && onOpenPrint && (
            <button
              onClick={() => {
                onOpenPrint();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>{interfaceLanguage === 'te' ? 'కేర్ షీట్ ప్రింట్ / PDF డౌన్‌లోడ్' : 'Print / Download Care Sheet'}</span>
            </button>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenHelp();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-slate-600 flex items-center space-x-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </button>
            <button
              onClick={() => {
                onOpenPrivacy();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-slate-600 flex items-center space-x-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Privacy & Security</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
