import React from 'react';
import { ShieldCheck, PhoneCall, Languages, ExternalLink, Lock, UserCheck, LogOut, ShieldAlert } from 'lucide-react';
import { Language, translations } from '../translations';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  lang: Language;
  setLang?: (l: Language | ((prev: Language) => Language)) => void;
  onToggleLang?: () => void;
  onOpenLicense?: () => void;
  onOpenAdmin?: () => void;
  onOpenCandidatePortal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  lang, 
  setLang, 
  onToggleLang, 
  onOpenLicense, 
  onOpenAdmin,
  onOpenCandidatePortal
}) => {
  const t = translations[lang];
  const { candidateUser, adminUser, isAdminAuthenticated, isCandidateAuthenticated, logoutCandidate, logoutAdmin } = useAuth();

  const handleLanguageClick = () => {
    if (onToggleLang) {
      onToggleLang();
    } else if (setLang) {
      setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
    }
  };

  return (
    <div id="top-utility-bar" className="bg-[#09172B] text-slate-300 text-xs border-b border-slate-800/80 py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Indian flag & MEA Registration */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="inline-flex items-center justify-center w-5 h-3.5 rounded-xs overflow-hidden shadow-xs border border-white/20">
            <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
              <path fill="#f93" d="M0 0h640v160H0z"/>
              <path fill="#fff" d="M0 160h640v160H0z"/>
              <path fill="#128807" d="M0 320h640v160H0z"/>
              <circle cx="320" cy="240" r="40" fill="#000088"/>
              <circle cx="320" cy="240" r="32" fill="#fff"/>
              <circle cx="320" cy="240" r="8" fill="#000088"/>
            </svg>
          </span>
          <span className="font-semibold text-slate-200">{t.govtApproved}</span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="text-slate-400 font-mono text-[11px]">{t.rcNumber}</span>
          <button
            id="btn-verify-license"
            onClick={onOpenLicense}
            className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-medium transition cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>{t.verifyLicense}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </button>
        </div>

        {/* Right: Dynamic Auth States, Language switch, Contact Hotline */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap justify-center">
          
          {/* Candidate Auth State */}
          {onOpenCandidatePortal && (
            <div className="flex items-center gap-1.5">
              <button
                id="btn-topbar-candidate-portal"
                onClick={onOpenCandidatePortal}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${
                  isCandidateAuthenticated 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Candidate Application & Document Dashboard"
              >
                <UserCheck className={`w-3.5 h-3.5 ${isCandidateAuthenticated ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span>
                  {isCandidateAuthenticated 
                    ? `${candidateUser?.passport} • ${t.myApplications}` 
                    : t.candidatePortal}
                </span>
              </button>

              {isCandidateAuthenticated && (
                <button
                  type="button"
                  onClick={() => logoutCandidate()}
                  className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition cursor-pointer"
                  title="Sign Out Candidate"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Admin Auth Badge / Toggle */}
          {isAdminAuthenticated ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <button 
                onClick={onOpenAdmin}
                className="hover:underline font-mono text-[11px] font-semibold"
              >
                Admin Online
              </button>
              <button
                onClick={() => logoutAdmin()}
                className="ml-1 text-amber-400 hover:text-red-400 cursor-pointer p-0.5"
                title="Sign Out Admin"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : onOpenAdmin ? (
            <button
              id="btn-topbar-admin"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition cursor-pointer text-xs font-medium"
              title="Admin Management"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Admin</span>
            </button>
          ) : null}

          <span className="text-slate-700">|</span>

          <a
            id="topbar-phone-link"
            href="tel:+919910044590"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">{t.supportHotline}</span>
          </a>

          <span className="text-slate-700">|</span>

          {/* Multi-Language Switcher [EN | HI | AR] */}
          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Languages className="w-3.5 h-3.5 text-sky-400 ml-1.5 mr-0.5 shrink-0" />
            <button
              type="button"
              id="lang-btn-en"
              onClick={() => setLang && setLang('en')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer text-[11px] ${
                lang === 'en'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              id="lang-btn-hi"
              onClick={() => setLang && setLang('hi')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer text-[11px] ${
                lang === 'hi'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="हिन्दी (Hindi)"
            >
              HI
            </button>
            <button
              type="button"
              id="lang-btn-ar"
              onClick={() => setLang && setLang('ar')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer text-[11px] ${
                lang === 'ar'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="العربية (Arabic)"
            >
              AR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
