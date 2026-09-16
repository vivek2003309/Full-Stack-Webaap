import React, { useState } from 'react';
import { Menu, X, Users, Briefcase, Lock, ChevronRight } from 'lucide-react';
import { Language, translations } from '../translations';

interface NavbarProps {
  lang: Language;
  userMode?: 'seeker' | 'employer';
  onToggleMode?: (mode: 'seeker' | 'employer') => void;
  onOpenHireModal: () => void;
  onOpenContactModal?: () => void;
  onScrollToJobs?: () => void;
  onOpenAdmin?: () => void;
  onOpenLicense: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  userMode = 'seeker',
  onToggleMode,
  onOpenHireModal,
  onOpenContactModal,
  onScrollToJobs,
  onOpenAdmin,
  onOpenLicense
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalMode, setInternalMode] = useState<'seeker' | 'employer'>(userMode);
  const t = translations[lang];

  const activeMode = userMode ?? internalMode;

  const handleModeChange = (mode: 'seeker' | 'employer') => {
    setInternalMode(mode);
    if (typeof onToggleMode === 'function') {
      onToggleMode(mode);
    }
  };

  const handleScrollToJobs = () => {
    if (typeof onScrollToJobs === 'function') {
      onScrollToJobs();
    } else {
      document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F2444]/95 backdrop-blur-md border-b border-slate-700/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-white font-['Space_Grotesk']">TICE</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ESTD. 1999
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-200 tracking-wide">
                TREHAN INTERNATIONAL
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Consultants &amp; Engineers
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-200">
            <a href="#about-us" className="hover:text-amber-400 transition-colors">{t.aboutUs}</a>
            <a 
              href="#sectors" 
              onClick={() => handleModeChange('employer')}
              className={`hover:text-amber-400 transition-colors ${activeMode === 'employer' ? 'text-amber-400 font-semibold' : ''}`}
            >
              {t.forEmployers}
            </a>
            <a 
              href="#jobs" 
              onClick={() => handleModeChange('seeker')}
              className={`hover:text-amber-400 transition-colors ${activeMode === 'seeker' ? 'text-amber-400 font-semibold' : ''}`}
            >
              {t.jobSeekers}
            </a>
            <a href="#infrastructure" className="hover:text-amber-400 transition-colors">{t.tradeTestCenters}</a>
            <button
              onClick={() => {
                if (onOpenContactModal) {
                  onOpenContactModal();
                } else {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="hover:text-amber-400 transition-colors cursor-pointer text-sm font-medium"
            >
              {t.contact}
            </button>
          </nav>

          {/* Mode Switch & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Employer vs Job Seeker pill toggle */}
            <div className="bg-slate-800/90 p-1 rounded-full border border-slate-700 flex items-center shadow-inner">
              <button
                id="toggle-job-seekers"
                onClick={() => handleModeChange('seeker')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  activeMode === 'seeker'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t.jobSeekers}</span>
              </button>
              <button
                id="toggle-employers"
                onClick={() => handleModeChange('employer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  activeMode === 'employer'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{t.forEmployers}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <button
              id="btn-nav-apply-jobs"
              onClick={handleScrollToJobs}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white border border-slate-500/70 hover:border-amber-400 hover:bg-slate-800 transition cursor-pointer"
            >
              {t.applyForJobs}
            </button>

            <button
              id="btn-nav-hire-manpower"
              onClick={onOpenHireModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              {t.hireManpower}
            </button>

            {/* Admin Key button */}
            <button
              id="btn-nav-admin"
              onClick={onOpenAdmin}
              className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 border border-slate-700 transition cursor-pointer"
              title="Admin Portal Login"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="btn-mobile-admin"
              onClick={onOpenAdmin}
              className="p-2 rounded-lg text-slate-300 hover:text-amber-400 bg-slate-800/80 border border-slate-700"
              title="Admin Portal"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:bg-slate-800 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#09172B] border-b border-slate-800 px-4 pt-3 pb-6 space-y-4">
          <div className="flex bg-slate-800/90 p-1 rounded-full border border-slate-700">
            <button
              onClick={() => {
                handleModeChange('seeker');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-full ${
                activeMode === 'seeker' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              {t.jobSeekers}
            </button>
            <button
              onClick={() => {
                handleModeChange('employer');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-full ${
                activeMode === 'employer' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              {t.forEmployers}
            </button>
          </div>

          <div className="space-y-2 text-sm text-slate-200">
            <a
              href="#about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              {t.aboutUs}
            </a>
            <a
              href="#jobs"
              onClick={() => {
                handleScrollToJobs();
                setMobileMenuOpen(false);
              }}
              className="block px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              {t.jobSeekers}
            </a>
            <a
              href="#drives-calendar"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              {t.calendarTitle}
            </a>
            <a
              href="#infrastructure"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              {t.tradeTestCenters}
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenContactModal) {
                  onOpenContactModal();
                } else {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
            >
              {t.contact}
            </button>
            <button
              onClick={() => {
                onOpenLicense();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-amber-400 hover:bg-slate-800 flex items-center justify-between"
            >
              <span>{t.verifyLicense}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                handleScrollToJobs();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-white border border-slate-600 text-center cursor-pointer hover:bg-slate-800"
            >
              {t.applyForJobs}
            </button>
            <button
              onClick={() => {
                onOpenHireModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 text-center cursor-pointer hover:bg-amber-300"
            >
              {t.hireManpower}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
