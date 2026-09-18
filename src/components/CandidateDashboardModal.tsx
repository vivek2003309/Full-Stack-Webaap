import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Printer, 
  LogOut, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Plane, 
  HeartPulse, 
  UserCheck, 
  Shield, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Briefcase,
  Check,
  MapPin,
  Phone,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Language, translations } from '../translations';
import { Application, CandidateDocument, StageNumber, STAGE_NAMES } from '../types';
import { CountryFlag } from './CountryFlag';
import { QRCodeSVG } from 'qrcode.react';
import { 
  getAllApplicationsForCandidate, 
  getCandidateDocumentStatus, 
  getLoggedInCandidatePassport, 
  setLoggedInCandidatePassport, 
  maskCandidateName, 
  maskPassportNumber, 
  maskPhoneNumber,
  generateCandidateTimeline,
  getStoredApplications,
  subscribeToCandidateByPassport,
  getCandidateByPassportOrTokenAsync
} from '../services/apiService';
import { RECRUITMENT_STAGES, getStageBadgeStyles } from './HeroSection';
import { CandidateDocumentVaultModal } from './CandidateDocumentVaultModal';
import { WalkInPassModal } from './WalkInPassModal';

interface CandidateDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialPassport?: string | null;
  onApplyNew?: () => void;
  onBrowseJobs?: () => void;
}

export const CandidateDashboardModal: React.FC<CandidateDashboardModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialPassport,
  onApplyNew,
  onBrowseJobs
}) => {
  const t = translations[lang];

  // Auth & Session state
  const [passportInput, setPassportInput] = useState('');
  const [loggedInPassport, setLoggedInPassport] = useState<string | null>(null);
  const [showMaskedDetails, setShowMaskedDetails] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Candidate Data State
  const [candidateApplications, setCandidateApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'documents' | 'dossier'>('applications');
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showWalkInPassModal, setShowWalkInPassModal] = useState(false);

  // Selected application derived
  const activeApp = candidateApplications.find(a => a.id === selectedAppId) || candidateApplications[0] || null;
  const activeTimeline = activeApp ? generateCandidateTimeline(activeApp) : [];
  const activeDocuments: CandidateDocument[] = activeApp ? getCandidateDocumentStatus(activeApp) : [];

  // Load session or initialize from prop
  useEffect(() => {
    const saved = getLoggedInCandidatePassport();
    const target = initialPassport?.trim().toUpperCase() || saved;
    if (target) {
      loadCandidateData(target);
    }
  }, [initialPassport, isOpen]);

  // Real-time Firestore subscription for active candidate
  useEffect(() => {
    if (!loggedInPassport) return;
    
    const unsubscribe = subscribeToCandidateByPassport(loggedInPassport, (apps) => {
      if (apps.length > 0) {
        setCandidateApplications(apps);
        setSelectedAppId((curr) => {
          if (!curr || !apps.some(a => a.id === curr)) {
            return apps[0].id;
          }
          return curr;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loggedInPassport]);

  const loadCandidateData = (passportOrToken: string, autoSelectFirst = true) => {
    const clean = passportOrToken.trim().toUpperCase();
    if (!clean) return;

    const apps = getAllApplicationsForCandidate(clean);
    if (apps.length > 0) {
      setCandidateApplications(apps);
      setLoggedInPassport(clean);
      setLoggedInCandidatePassport(clean);
      setLoginError(null);
      if (autoSelectFirst || !selectedAppId || !apps.some(a => a.id === selectedAppId)) {
        setSelectedAppId(apps[0].id);
        setExpandedStage(apps[0].currentStage);
      }
    } else {
      setCandidateApplications([]);
      setLoginError(`No active records found for "${clean}". Please enter a valid registered Passport number or Token ID.`);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportInput.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);

    setTimeout(() => {
      const clean = passportInput.trim().toUpperCase();
      const apps = getAllApplicationsForCandidate(clean);
      if (apps.length > 0) {
        setCandidateApplications(apps);
        setLoggedInPassport(clean);
        setLoggedInCandidatePassport(clean);
        setSelectedAppId(apps[0].id);
        setExpandedStage(apps[0].currentStage);
        setPassportInput('');
      } else {
        setLoginError(`No records found for "${clean}". Try sample candidate "P1234567" or "R9876543".`);
      }
      setIsLoggingIn(false);
    }, 400);
  };

  const handleLogout = () => {
    setLoggedInPassport(null);
    setLoggedInCandidatePassport(null);
    setCandidateApplications([]);
    setSelectedAppId(null);
    setPassportInput('');
    setLoginError(null);
  };

  const handlePrintDossier = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div 
      id="candidate-dashboard-modal-backdrop" 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-portal-title"
    >
      <div 
        id="candidate-dashboard-container"
        className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* =========================================
            HEADER BAR
           ========================================= */}
        <div id="candidate-dashboard-header" className="bg-[#0B1A30] border-b border-slate-800 px-5 sm:px-7 py-4 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="candidate-portal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {lang === 'hi' ? 'उम्मीदवार डैशबोर्ड एवं दस्तावेज पोर्टल' : 'Candidate Dashboard & Document Portal'}
                </h2>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  MEA e-Migrate Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {loggedInPassport 
                  ? (lang === 'hi' ? 'पासपोर्ट एवं आवेदन स्थिति का पूर्ण इतिहास' : 'Complete Application History, Milestones & Clearance Documents')
                  : (lang === 'hi' ? 'अपने पंजीकृत पासपोर्ट नंबर से लॉग इन करें' : 'Sign in with your Passport Number to track status')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {loggedInPassport && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                title="Sign out of applicant session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'hi' ? 'लॉगआउट' : 'Switch Account'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Close dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================
            MAIN CONTENT AREA
           ========================================= */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8 space-y-6">

          {/* -----------------------------------------
              VIEW 1: CANDIDATE NOT LOGGED IN
             ----------------------------------------- */}
          {!loggedInPassport && (
            <div className="max-w-xl mx-auto py-6 space-y-7">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk']">
                  {lang === 'hi' ? 'उम्मीदवार लॉगिन' : 'Applicant Status & Document Login'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                  {lang === 'hi' 
                    ? 'अपने संपूर्ण आवेदन इतिहास, मेडिकल रिपोर्ट, दूतावास वीजा एवं उत्प्रवास (PoE) क्लीयरेंस की स्थिति देखने के लिए अपना पासपोर्ट नंबर दर्ज करें।'
                    : 'Enter your registered Passport Number or Application ID to access your full overseas application history and real-time document milestones.'}
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 bg-slate-950/60 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl">
                <div>
                  <label htmlFor="candidate-login-passport" className="block text-xs font-semibold text-slate-300 mb-2">
                    {lang === 'hi' ? 'पासपोर्ट नंबर या टोकन आईडी' : 'Passport Number or Token ID'}
                  </label>
                  <div className="relative">
                    <input
                      id="candidate-login-passport"
                      type="text"
                      value={passportInput}
                      onChange={(e) => {
                        setPassportInput(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 15));
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="e.g. P1234567 or TRH-8821"
                      maxLength={15}
                      autoCapitalize="characters"
                      autoFocus
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-2xl py-3.5 pl-11 pr-24 text-white placeholder-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                    />
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    
                    <button
                      type="submit"
                      disabled={isLoggingIn || !passportInput.trim()}
                      className="absolute right-2 top-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md"
                    >
                      {isLoggingIn ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <>
                          <span>Login</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Privacy Badge */}
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>256-Bit Encrypted MEA e-Migrate Verification Portal.</span>
                </div>
              </form>
            </div>
          )}


          {/* -----------------------------------------
              VIEW 2: CANDIDATE LOGGED IN DASHBOARD
             ----------------------------------------- */}
          {loggedInPassport && activeApp && (
            <div className="space-y-6">
              
              {/* Profile Summary Card */}
              <div id="candidate-dashboard-app-selector" className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#0A1A30] border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                  
                  {/* Avatar & Identifiers */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-xl font-['Space_Grotesk'] shrink-0 shadow-md">
                      {activeApp.fullName.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                          {showMaskedDetails ? maskCandidateName(activeApp.fullName) : activeApp.fullName}
                        </h3>
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {activeApp.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowMaskedDetails(!showMaskedDetails)}
                          className="p-1 rounded-md text-slate-400 hover:text-amber-300 transition cursor-pointer"
                          title={showMaskedDetails ? "Reveal full details" : "Mask sensitive details"}
                        >
                          {showMaskedDetails ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                        <span>Passport: <strong className="font-mono text-white">{showMaskedDetails ? maskPassportNumber(activeApp.passportNumber) : activeApp.passportNumber}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span>Phone: <strong className="text-white">{showMaskedDetails ? maskPhoneNumber(activeApp.phone) : activeApp.phone}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span>Interview Hub: <strong className="text-white">{activeApp.interviewCity}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Badge */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('dossier')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'hi' ? 'सत्यापन पास प्रिंट करें' : 'Print Verification Dossier'}</span>
                    </button>

                    {onBrowseJobs && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onBrowseJobs();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'नई रिक्ति आवेदन करें' : 'Apply Another Job'}</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>

              {/* Navigation Tabs (History vs Documents vs Dossier) */}
              <div id="candidate-dashboard-nav" className="flex border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto pb-1 print:hidden">
                <button
                  type="button"
                  onClick={() => setActiveTab('applications')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                    activeTab === 'applications'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'आवेदन इतिहास एवं माइलस्टोन' : 'Application History & Milestones'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'applications' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {candidateApplications.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                    activeTab === 'documents'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'आधिकारिक दस्तावेज एवं क्लीयरेंस' : 'Official Clearance Documents'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'documents' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {activeDocuments.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('dossier')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                    activeTab === 'dossier'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'उम्मीदवार सत्यापन पास' : 'Candidate Gate Pass'}</span>
                </button>
              </div>

              {/* -----------------------------------------
                  TAB 1: APPLICATION HISTORY & MILESTONES
                 ----------------------------------------- */}
              {activeTab === 'applications' && (
                <div className="space-y-6">
                  
                  {/* Multi-application selector if user has applied for >1 position */}
                  {candidateApplications.length > 1 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                        {lang === 'hi' ? 'सक्रिय एवं पिछले आवेदन चुनें:' : 'Select Application Pipeline:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {candidateApplications.map((app, appIdx) => {
                          const isSelected = app.id === activeApp.id;
                          return (
                            <div
                              key={`cand-app-${app.id || app.passportNumber || 'app'}-${appIdx}`}
                              onClick={() => {
                                setSelectedAppId(app.id);
                                setExpandedStage(app.currentStage);
                              }}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-slate-800/95 border-amber-400 ring-2 ring-amber-400/20 shadow-lg'
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-mono text-xs font-bold text-amber-400">{app.id}</span>
                                <div className="flex items-center gap-1.5">
                                  <CountryFlag country={app.targetCountry} size="xs" shape="circle" />
                                  <span className="text-xs text-white font-medium">{app.targetCountry}</span>
                                </div>
                              </div>
                              <div className="text-sm font-bold text-white line-clamp-1">{app.trade}</div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                                <span className={`px-2 py-0.5 rounded-full font-semibold ${getStageBadgeStyles(app.currentStage)}`}>
                                  Stage {app.currentStage}: {STAGE_NAMES[app.currentStage as StageNumber]}
                                </span>
                                <span className="text-slate-400">
                                  {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Active Application Deployment Progress Gauge */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CountryFlag country={activeApp.targetCountry} size="sm" shape="circle" />
                          <h4 className="text-base sm:text-lg font-bold text-white">
                            {activeApp.trade} — {activeApp.targetCountry}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Applied: {new Date(activeApp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • Hub: {activeApp.interviewCity} Trade Centre
                        </p>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1">
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${getStageBadgeStyles(activeApp.currentStage)}`}>
                          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                          <span>Stage {activeApp.currentStage} of 7: {STAGE_NAMES[activeApp.currentStage as StageNumber]}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-emerald-400">
                          {Math.round((activeApp.currentStage / 7) * 100)}% Milestone Completed
                        </span>
                      </div>
                    </div>

                    {/* Visual 7-Stage Stepper Progress Tracker */}
                    <div className="pt-2 pb-1">
                      {/* Step Bubbles & Connector Lines */}
                      <div className="relative flex items-center justify-between">
                        {/* Background connecting track */}
                        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0" />
                        
                        {/* Active completed track fill */}
                        <div 
                          className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-700 -z-0"
                          style={{
                            width: activeApp.currentStage > 1 
                              ? `calc(${((Math.min(activeApp.currentStage, 7) - 1) / 6) * 100}% - 2rem)`
                              : '0%'
                          }}
                        />

                        {[1, 2, 3, 4, 5, 6, 7].map((stg) => {
                          const isCompleted = activeApp.currentStage > stg;
                          const isCurrent = activeApp.currentStage === stg;
                          const isUpcoming = activeApp.currentStage < stg;
                          const stageDef = RECRUITMENT_STAGES.find(s => s.stage === stg);

                          return (
                            <div key={stg} className="relative z-10 flex flex-col items-center group">
                              <button
                                type="button"
                                onClick={() => setExpandedStage(expandedStage === stg ? null : stg as StageNumber)}
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 cursor-pointer ${
                                  isCompleted
                                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                    : isCurrent
                                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 animate-pulse shadow-lg shadow-blue-500/30 scale-110'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                                }`}
                                title={`Stage ${stg}: ${STAGE_NAMES[stg as StageNumber]}`}
                              >
                                {isCompleted ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  <span>{stg}</span>
                                )}
                              </button>
                              
                              {/* Stage Step Label on desktop */}
                              <span className={`hidden md:block text-[10px] mt-1.5 font-semibold text-center max-w-[70px] truncate ${
                                isCurrent ? 'text-blue-400 font-bold' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                              }`}>
                                {STAGE_NAMES[stg as StageNumber]?.split(' ')[0] || `S${stg}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dynamic Stage Metadata Card (Stage Name, Last Updated, Officer Remarks, Cleared Requirements) */}
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-[11px]">
                            Stage {activeApp.currentStage} of 7
                          </span>
                          <h5 className="text-sm font-bold text-white">
                            {STAGE_NAMES[activeApp.currentStage as StageNumber]}
                          </h5>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Last Updated: {new Date(activeApp.updatedAt || activeApp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Officer Remarks */}
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <strong className="text-amber-300 font-semibold">{lang === 'hi' ? 'आधिकारिक भर्ती अधिकारी टिप्पणी:' : 'Officer Remarks:'}</strong>
                          <p className="text-slate-200 leading-relaxed">{activeApp.remarks || 'Application proceeding through mandatory emigration clearances.'}</p>
                        </div>
                      </div>

                      {/* Cleared Statutory Requirements Matrix */}
                      <div className="pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                          {lang === 'hi' ? 'स्वीकृत आवश्यकताएँ एवं दस्तावेज स्थिति:' : 'Stage Cleared Requirements & Status:'}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            activeApp.currentStage >= 2 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}>
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${activeApp.currentStage >= 2 ? 'text-emerald-400' : 'text-slate-600'}`} />
                            <span className="truncate">Skill Test &amp; Selection</span>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            activeApp.currentStage >= 4 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}>
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${activeApp.currentStage >= 4 ? 'text-emerald-400' : 'text-slate-600'}`} />
                            <span className="truncate">GAMCA Medical Fitness</span>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            activeApp.currentStage >= 6 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}>
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${activeApp.currentStage >= 6 ? 'text-emerald-400' : 'text-slate-600'}`} />
                            <span className="truncate">Visa &amp; MEA Emigration</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 7-Stage Detailed Milestone Timeline List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                      {lang === 'hi' ? 'विस्तृत 7-चरणीय माइलस्टोन प्रगति:' : 'Detailed 7-Stage Milestone Progression:'}
                    </h4>

                    <div className="space-y-2.5">
                      {RECRUITMENT_STAGES.map((stageDef) => {
                        const stageNum = stageDef.stage;
                        const isCompleted = activeApp.currentStage >= stageNum;
                        const isCurrent = activeApp.currentStage === stageNum;
                        const isExpanded = expandedStage === stageNum;
                        const StageIcon = stageDef.icon;
                        const timelineItem = activeTimeline.find(t => t.stage === stageNum);

                        return (
                          <div
                            key={stageNum}
                            className={`rounded-2xl border transition-all overflow-hidden ${
                              isCurrent 
                                ? 'bg-slate-900 border-amber-500/60 ring-1 ring-amber-500/30 shadow-md'
                                : isCompleted
                                ? 'bg-slate-950/80 border-slate-800'
                                : 'bg-slate-950/40 border-slate-900 opacity-75'
                            }`}
                          >
                            <div
                              onClick={() => setExpandedStage(isExpanded ? null : stageNum)}
                              className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition"
                            >
                              <div className="flex items-center gap-3.5">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isCurrent
                                    ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-500/30'
                                    : isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}>
                                  {isCompleted && !isCurrent ? <Check className="w-4 h-4 stroke-[3]" /> : <StageIcon className="w-4 h-4" />}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className={`text-sm font-bold ${isCurrent ? 'text-amber-300' : isCompleted ? 'text-white' : 'text-slate-400'}`}>
                                      Stage {stageNum}: {stageDef.title}
                                    </h5>
                                    {isCurrent && (
                                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                                        Current Stage
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                    {timelineItem?.remarks || stageDef.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                                  {timelineItem?.date || (isCompleted ? 'Completed' : 'Pending')}
                                </span>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-900/50 space-y-3 text-xs animate-in fade-in duration-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                                    <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5" />
                                      What it Entails:
                                    </span>
                                    <p className="text-slate-300 leading-relaxed">{stageDef.whatItEntails}</p>
                                  </div>

                                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                                    <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                                      <UserCheck className="w-3.5 h-3.5" />
                                      Candidate Action Needed:
                                    </span>
                                    <p className="text-slate-300 leading-relaxed">{stageDef.candidateRole}</p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-slate-400">
                                  <span><strong>Documents Required:</strong> {stageDef.documentsNeeded}</span>
                                  <span><strong>Estimated Processing:</strong> {stageDef.estimatedTime}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}


              {/* -----------------------------------------
                  TAB 2: OFFICIAL CLEARANCE DOCUMENTS & VAULT
                 ----------------------------------------- */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>{lang === 'hi' ? 'सत्यापित दस्तावेज एवं अनुमोदन स्थिति' : 'Verified Dossier & Emigration Clearances'}</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        {lang === 'hi' 
                          ? 'विदेश मंत्रालय (MEA) एवं गंतव्य दूतावास के साथ समन्वयित 6 मुख्य अनुमोदन दस्तावेज'
                          : '6 core statutory documents synchronized with MEA e-Migrate and host country consulates'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowVaultModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer shrink-0"
                      title="Upload or preview your Passport, Medical, PCC, Trade test, or Visa documents"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'दस्तावेज़ वॉल्ट खोलें' : 'Open Document Vault'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeDocuments.map((doc) => {
                      return (
                        <div 
                          key={doc.id}
                          className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-3.5 transition shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                {doc.authority}
                              </span>
                              <h5 className="text-sm font-bold text-white">
                                {lang === 'hi' ? doc.nameHi : doc.name}
                              </h5>
                            </div>

                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${doc.badgeColor}`}>
                              {doc.status}
                            </span>
                          </div>

                          {/* Doc Meta Details */}
                          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
                            {doc.documentNumber && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Doc Ref Number:</span>
                                <span className="font-mono font-bold text-amber-300">{doc.documentNumber}</span>
                              </div>
                            )}
                            {doc.verifiedDate && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Authenticated Date:</span>
                                <span className="text-slate-200">{doc.verifiedDate}</span>
                              </div>
                            )}
                            {doc.expiryDate && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Validity:</span>
                                <span className="text-emerald-400 font-semibold">{doc.expiryDate}</span>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {lang === 'hi' ? doc.notesHi : doc.notes}
                          </p>

                          {/* Document Vault Action Button */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <span className="text-[11px] text-slate-400">
                              {doc.status === 'Verified' ? '✓ Authenticated Scan Available' : 'Scan upload pending'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowVaultModal(true)}
                              className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-750 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{lang === 'hi' ? 'दस्तावेज़ वॉल्ट' : 'View in Vault'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {/* -----------------------------------------
                  TAB 3: CANDIDATE GATE PASS / DOSSIER PREVIEW
                 ----------------------------------------- */}
              {activeTab === 'dossier' && (
                <div className="space-y-5">
                  <div 
                    id="candidate-dossier-printable"
                    className="bg-white text-slate-950 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/80 space-y-6 relative print:m-0 print:border-none"
                  >
                    
                    {/* Official Letterhead Header */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-900 pb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xl font-['Space_Grotesk']">
                          TICE
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
                            TREHAN INTERNATIONAL
                          </h3>
                          <p className="text-xs text-slate-600 font-medium">
                            Consultants &amp; Engineers • MEA RC No. B-0613/DEL/COM/1000+/5/5374/1999
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Dynamic Gate Pass QR Code */}
                        <div 
                          className="p-1.5 bg-white border border-slate-300 rounded-xl shadow-xs flex flex-col items-center justify-center shrink-0"
                          title={`Gate Security QR: Scan to verify ${activeApp.passportNumber}`}
                        >
                          <QRCodeSVG
                            value={typeof window !== 'undefined' ? `${window.location.origin}/?passport=${activeApp.passportNumber}` : `https://trehaninternational.com/?passport=${activeApp.passportNumber}`}
                            size={56}
                            level="M"
                            includeMargin={false}
                          />
                          <span className="text-[8px] font-mono font-bold text-slate-700 tracking-tighter mt-0.5">
                            SCAN PASS
                          </span>
                        </div>

                        <div className="text-center sm:text-right">
                          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
                            OFFICIAL VERIFICATION PASS
                          </span>
                          <div className="text-[11px] font-mono text-slate-500 mt-1">
                            Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Pass ID: TIC-{activeApp.passportNumber.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">Candidate Name:</span>
                        <div className="font-bold text-slate-900 text-sm">{activeApp.fullName}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Passport Number:</span>
                        <div className="font-mono font-bold text-slate-900 text-sm">{activeApp.passportNumber}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Designated Trade:</span>
                        <div className="font-bold text-slate-900">{activeApp.trade}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Destination Country:</span>
                        <div className="font-bold text-amber-700">{activeApp.targetCountry}</div>
                      </div>
                    </div>

                    {/* Milestone Summary */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Current Milestone &amp; Status
                      </h5>
                      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-xs text-amber-400 font-bold">STAGE {activeApp.currentStage} OF 7</div>
                          <div className="text-base font-black">{STAGE_NAMES[activeApp.currentStage as StageNumber]}</div>
                          <div className="text-xs text-slate-300 mt-0.5">{activeApp.remarks}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {Math.round((activeApp.currentStage / 7) * 100)}% Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Document Clearance Matrix */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Statutory Document Verification Summary
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {activeDocuments.map((d) => (
                          <div key={d.id} className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <span className="font-medium text-slate-800 line-clamp-1">{d.name}</span>
                            <span className="font-bold text-emerald-700">{d.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Authority Seals */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
                      <div>
                        Trehan International HQ: Unit No. UG-1 &amp; 2, Westend Mall, Janakpuri, New Delhi - 110058
                      </div>
                      <div className="font-semibold text-slate-700">
                        Official Helpline: +91 99100 44590
                      </div>
                    </div>

                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 print:hidden">
                    <button
                      type="button"
                      onClick={() => setShowWalkInPassModal(true)}
                      className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'वॉक-इन टेस्ट पास' : 'Walk-in Test Pass'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintDossier}
                      className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'यह पास प्रिंट या डाउनलोड करें' : 'Print / Save Pass (PDF)'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* =========================================
            MODAL FOOTER
           ========================================= */}
        <div className="bg-[#0B1A30] border-t border-slate-800 px-5 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MEA e-Migrate Gateway 2.0 Live Synchronized</span>
          </div>
          <div>
            <span>Support Desk: <strong className="text-slate-200">+91 99100 44590</strong></span>
          </div>
        </div>

      </div>

      {/* Candidate Document Vault Modal */}
      {showVaultModal && activeApp && (
        <CandidateDocumentVaultModal
          isOpen={showVaultModal}
          onClose={() => setShowVaultModal(false)}
          candidate={activeApp}
          isAdmin={false}
          onCandidateUpdated={(updated) => {
            setCandidateApplications((prev) =>
              prev.map((app) => (app.id === updated.id ? updated : app))
            );
          }}
        />
      )}

      {/* Walk-In Trade Test & Interview Pass Modal */}
      {showWalkInPassModal && activeApp && (
        <WalkInPassModal
          isOpen={showWalkInPassModal}
          onClose={() => setShowWalkInPassModal(false)}
          data={{
            candidateName: activeApp.fullName || activeApp.name || 'Candidate',
            passportNumber: activeApp.passportNumber || activeApp.id,
            tokenId: activeApp.token || activeApp.id,
            trade: activeApp.trade || 'Technical Trade',
            targetCountry: activeApp.targetCountry || activeApp.country || 'Russia',
            reportingDate: 'Monday - Friday Walk-in',
            reportingTime: '09:30 AM - 01:00 PM',
            venue: 'TICE Overseas Skill Testing Complex, B-1/16, Community Centre, Janakpuri, New Delhi - 110058'
          }}
        />
      )}
    </div>
  );
};
