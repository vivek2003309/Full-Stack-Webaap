import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Shield, 
  Sparkles, 
  Building2, 
  Plane, 
  UserCheck, 
  Loader2,
  HeartPulse,
  FileText,
  ShieldCheck,
  Check,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Language, translations } from '../translations';
import { StageNumber, STAGE_NAMES } from '../types';
import { CountryFlag } from './CountryFlag';
import { 
  apiFetchTracker,
  getCandidateByPassportOrToken,
  generateCandidateTimeline,
  maskCandidateName,
  maskPassportNumber,
  maskPhoneNumber,
  safeJsonFetch
} from '../services/apiService';

interface CandidateData {
  id: string;
  fullName: string;
  phone: string;
  passportNumber: string;
  trade: string;
  targetCountry: string;
  interviewCity: string;
  currentStage: StageNumber;
  currentStageName: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

interface TimelineItem {
  stage: StageNumber;
  title: string;
  date: string;
  completed: boolean;
  isCurrent: boolean;
  remarks: string;
}

type LookupStatus = 'isIdle' | 'isLoading' | 'isSuccess' | 'isNotFound';

interface HeroSectionProps {
  lang: Language;
  onScrollToJobs?: () => void;
  onOpenLicense?: () => void;
  onSelectDriveTrade?: (trade: string, country: string) => void;
  prefilledPassport?: string | null;
}

export interface RecruitmentStageDef {
  stage: StageNumber;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  whatItEntails: string;
  candidateRole: string;
  documentsNeeded: string;
  estimatedTime: string;
  nextStep: string;
}

export const RECRUITMENT_STAGES: RecruitmentStageDef[] = [
  {
    stage: 1,
    title: 'Application Review',
    shortTitle: 'Review',
    icon: FileText,
    description: 'Application received and under preliminary review.',
    whatItEntails: 'Initial verification of candidate CV, qualifications, trade certification eligibility, and passport authenticity before shortlisting for client trade interviews.',
    candidateRole: 'Ensure submission of valid identity proofs, contact details, and updated vocational experience credentials.',
    documentsNeeded: 'Original/Copy of Passport, Educational / Trade Certificates, Resume / Bio-data',
    estimatedTime: '1 – 2 Working Days',
    nextStep: 'Report for technical trade test and client interview upon notification.'
  },
  {
    stage: 2,
    title: 'Interview & Trade Test',
    shortTitle: 'Interview',
    icon: UserCheck,
    description: 'Scheduled / Cleared technical trade interview.',
    whatItEntails: 'Rigorous trade testing, practical workshop demonstration (welding, electrical, plumbing, or driving trial), and client delegation interview to evaluate vocational skill, safety discipline, and readiness for overseas deployment.',
    candidateRole: 'Attend client interview in person with updated CV, original passport (min. 2 years validity), educational/trade credentials, and 12 white-background photographs.',
    documentsNeeded: 'Original Passport, Trade Certificates, Experience Letters, 12 White-BG Photos',
    estimatedTime: '1 – 3 Working Days',
    nextStep: 'Collect candidate selection letter and report for GAMCA biometric medical fitness screening.'
  },
  {
    stage: 3,
    title: 'Medical Fitness',
    shortTitle: 'Medical',
    icon: HeartPulse,
    description: 'Medical examination completed (GAMCA/Authorized Center).',
    whatItEntails: 'Mandatory GCC/GAMCA (Wafid) computerized medical examination consisting of pulmonary chest X-rays, comprehensive blood pathology (infectious disease screening), vision, and biometric fingerprinting.',
    candidateRole: 'Fast for 8 to 10 hours prior to reporting to authorized GAMCA diagnostic centre, bring appointment voucher, and undergo all mandatory pathology tests.',
    documentsNeeded: 'Original Passport, GAMCA Slip, 4 Photos, National ID / Aadhaar',
    estimatedTime: '2 – 4 Working Days',
    nextStep: 'FIT medical report authenticated on online portal; sponsor applies for labor quota and work permit.'
  },
  {
    stage: 4,
    title: 'Visa Applied',
    shortTitle: 'Visa Filed',
    icon: FileText,
    description: 'Work permit & visa documents submitted to embassy.',
    whatItEntails: 'Foreign employer files official labor contract with host nation Ministry of Human Resources, reserves government visa quota, and submits candidate credentials to the foreign consulate.',
    candidateRole: 'Review draft employment offer (salary, perks, hours, overtime terms), sign contract acceptance, and confirm contact numbers with recruitment team.',
    documentsNeeded: 'Signed Employment Contract, FIT Medical Certificate, Verified Passport Dossier',
    estimatedTime: '5 – 12 Working Days',
    nextStep: 'Embassy consular verification, immigration security audit, and electronic work visa issuance.'
  },
  {
    stage: 5,
    title: 'Visa Approved',
    shortTitle: 'Visa Approved',
    icon: ShieldCheck,
    description: 'Work visa officially issued by destination immigration.',
    whatItEntails: 'Foreign government immigration authority officially issues the entry employment permit / electronic visa with authorized employer sponsorship and trade designation.',
    candidateRole: 'Cross-check e-visa copy for exact name spelling matching passport, trade designation, and visa validity window.',
    documentsNeeded: 'Approved Electronic Visa, Labor Department NOC / Work Permit',
    estimatedTime: '3 – 7 Working Days',
    nextStep: 'Apply for Police Clearance Certificate (PCC) at Passport Seva Kendra for emigration clearance.'
  },
  {
    stage: 6,
    title: 'PCC / POE Clearance',
    shortTitle: 'PCC / PoE',
    icon: Shield,
    description: 'Police Clearance & Protector of Emigrants (eMigrate) clearance approved.',
    whatItEntails: 'Regional Passport Office (RPO) / Ministry of External Affairs verifies clean criminal record, and Protector of Emigrants (PoE) issues mandatory emigration endorsement via e-Migrate.',
    candidateRole: 'Attend appointment at local Passport Seva Kendra (PSK) with original passport for physical verification and biometric record check.',
    documentsNeeded: 'Original Passport, PSK Appointment Letter, Local Police Address Verification',
    estimatedTime: '7 – 14 Working Days',
    nextStep: 'Flight itinerary booking, pre-departure orientation training (PDOT), and ticket issuance.'
  },
  {
    stage: 7,
    title: 'Dispatched / Ready to Fly',
    shortTitle: 'Dispatched',
    icon: Plane,
    description: 'Flight ticket confirmed & pre-departure orientation completed.',
    whatItEntails: 'Direct international flight booking confirmed, overseas travel insurance activated, airport reception arranged by employer, and candidate successfully departs India.',
    candidateRole: 'Attend mandatory Pre-Departure Orientation session, collect original ticket and visa copy, and arrive at departure airport 4 hours before flight.',
    documentsNeeded: 'Confirmed Flight Ticket, Original Passport + Visa, PDOT Certificate, Sponsor Reception Contact',
    estimatedTime: '1 – 3 Days to Departure',
    nextStep: 'Arrival at destination airport, employer reception greeting, site accommodation check-in, and duty onboarding.'
  }
];

export const getStageBadgeStyles = (stage: number) => {
  switch (stage) {
    case 1:
      return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    case 2:
      return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
    case 3:
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    case 4:
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    case 5:
      return 'bg-teal-500/20 text-teal-300 border border-teal-500/30';
    case 6:
      return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
    case 7:
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    default:
      return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
  }
};

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  lang, 
  onScrollToJobs, 
  onOpenLicense, 
  onSelectDriveTrade,
  prefilledPassport 
}) => {
  const t = translations[lang];
  const [passportInput, setPassportInput] = useState('');
  const [showPassportInput, setShowPassportInput] = useState(false);
  
  // Strict non-conflicting lookup states: 'isIdle' | 'isLoading' | 'isSuccess' | 'isNotFound'
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('isIdle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  
  const [selectedStage, setSelectedStage] = useState<StageNumber | null>(null);
  const [timelineExpanded, setTimelineExpanded] = useState(true);
  const [hoveredStage, setHoveredStage] = useState<StageNumber | null>(null);
  const [activeTooltipStage, setActiveTooltipStage] = useState<StageNumber | null>(null);
  const [expandedGuideStages, setExpandedGuideStages] = useState<Record<number, boolean>>({});

  const searchTimerRef = useRef<any>(null);

  const toggleStageGuide = (stageNum: number) => {
    setExpandedGuideStages(prev => ({
      ...prev,
      [stageNum]: !prev[stageNum]
    }));
  };

  // Real-time input handling with capitalization and length restriction (supports passport & tokens like TRH-8821)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = rawVal.replace(/[^a-zA-Z0-9-\s]/g, '').toUpperCase().slice(0, 15);
    setPassportInput(formatted);

    // When the user clears the input box, immediately unmount the status card and reset the tracker to clean idle view
    if (!formatted.trim()) {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      setLookupStatus('isIdle');
      setCandidateData(null);
      setTimeline([]);
      setSelectedStage(null);
      setErrorMessage(null);
      setActiveTooltipStage(null);
    }
  };

  const handleClear = () => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    setPassportInput('');
    setLookupStatus('isIdle');
    setCandidateData(null);
    setTimeline([]);
    setSelectedStage(null);
    setErrorMessage(null);
    setActiveTooltipStage(null);
  };

  // Strict search trigger: runs only when explicitly called via form submission or button click
  const performTrackSearch = (targetQuery?: string) => {
    const query = (targetQuery !== undefined ? targetQuery : passportInput).trim().toUpperCase();
    if (!query) return;

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    setLookupStatus('isLoading');
    setErrorMessage(null);

    // Single fixed duration of 600ms verification simulation
    searchTimerRef.current = setTimeout(async () => {
      try {
        // 1. Synchronized direct query from candidate store (tice_candidates_data)
        const record = getCandidateByPassportOrToken(query);
        if (record) {
          const generatedTimeline = generateCandidateTimeline(record);
          setCandidateData({
            id: record.id,
            fullName: maskCandidateName(record.fullName),
            phone: maskPhoneNumber(record.phone),
            passportNumber: maskPassportNumber(record.passportNumber || (record as any).passport),
            trade: record.trade,
            targetCountry: record.targetCountry,
            interviewCity: record.interviewCity || 'Delhi',
            currentStage: record.currentStage,
            currentStageName: STAGE_NAMES[record.currentStage as StageNumber] || `Stage ${record.currentStage}`,
            remarks: record.remarks || 'Document verification underway.',
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
          });
          setTimeline(generatedTimeline);
          setSelectedStage(record.currentStage);
          setExpandedGuideStages({ [record.currentStage]: true });
          setActiveTooltipStage(null);
          setLookupStatus('isSuccess');
          return;
        }

        // 2. Query server API once if not found in local state
        const res = await safeJsonFetch(`/api/tracker/${encodeURIComponent(query)}`);
        if (res.ok && res.data && res.data.candidate) {
          setCandidateData(res.data.candidate);
          setTimeline(res.data.timeline || []);
          setSelectedStage(res.data.candidate.currentStage);
          setExpandedGuideStages({ [res.data.candidate.currentStage]: true });
          setActiveTooltipStage(null);
          setLookupStatus('isSuccess');
          return;
        }

        // 3. Not found
        setCandidateData(null);
        setTimeline([]);
        setSelectedStage(null);
        setActiveTooltipStage(null);
        setErrorMessage(`No record found for "${query}". Please check your passport number or token ID.`);
        setLookupStatus('isNotFound');
      } catch (err: any) {
        setCandidateData(null);
        setTimeline([]);
        setErrorMessage('Verification service is temporarily unreachable. Please try again.');
        setLookupStatus('isNotFound');
      }
    }, 600);
  };

  // React strictly to external triggers (e.g. registration success redirect)
  useEffect(() => {
    if (prefilledPassport && prefilledPassport.trim()) {
      const clean = prefilledPassport.trim().toUpperCase();
      setPassportInput(clean);
      performTrackSearch(clean);
    }
  }, [prefilledPassport]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const handleScrollClick = () => {
    if (onScrollToJobs) {
      onScrollToJobs();
    } else {
      document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-[#071326] text-white pt-8 pb-16 lg:py-20 border-b border-slate-800">
      
      {/* Background Aerial Skyline Image with Refined Translucent Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2160&q=85"
          alt="Dubai and Modern Metropolis Skyline at Twilight Dusk"
          className="w-full h-full object-cover object-center brightness-95 contrast-105 saturate-110 scale-100 transition-all duration-700"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = '/a8c6abdc-0116-4796-ab12-6e6a62ae64b8.png';
          }}
        />
        {/* Refined Translucent Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071326]/75 via-[#0F2444]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071326]/80 via-transparent to-transparent" />
      </div>

      {/* Warm Amber Ambient Glow Spot on the right side behind the cards */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[550px] h-[550px] bg-[#D99B26]/10 blur-3xl rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* =========================================
              LEFT COLUMN: TRUST PILL, HEADLINE & DRIVES STACK
             ========================================= */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Live Trust Pill & Dual Language Emblem */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.liveDrivesBadge}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
                <span>Trehan International</span>
                <span className="text-amber-400/80">•</span>
                <span className="text-slate-300 font-normal">त्रेहन इंटरनेशनल</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15] font-['Space_Grotesk'] drop-shadow-md">
              {t.heroHeadline}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              {t.heroSubtitle}
            </p>

            {/* Active Drives Card Stack */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.activeDrivesTitle}
                </span>
                <span className="text-xs text-slate-400">MEA Verified Direct Quota</span>
              </div>

              <div className="space-y-2.5">
                
                {/* Russia Drive */}
                <div 
                  onClick={() => onSelectDriveTrade && onSelectDriveTrade('Logistics', 'Russia')}
                  className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-3.5 transition-all shadow-md flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <CountryFlag country="Russia" size="lg" shape="circle" className="border-white/30 shadow-md shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          Russia Logistics & Delivery
                        </h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">350 Vacancies • Moscow & St. Petersburg Distribution</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Oman Drive */}
                <div 
                  onClick={() => onSelectDriveTrade && onSelectDriveTrade('6G Pipe Welder', 'Oman')}
                  className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-3.5 transition-all shadow-md flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <CountryFlag country="Oman" size="lg" shape="circle" className="border-white/30 shadow-md shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          Oman Civil & MEP Construction
                        </h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Testing Live
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">120 Vacancies • Duqm Refinery & Sohar Port</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Qatar Drive */}
                <div 
                  onClick={() => onSelectDriveTrade && onSelectDriveTrade('HVAC', 'Qatar')}
                  className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-3.5 transition-all shadow-md flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <CountryFlag country="Qatar" size="lg" shape="circle" className="border-white/30 shadow-md shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          Qatar Facility Management
                        </h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Interviewing
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">85 Vacancies • Commercial Chillers & Towers, Doha</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>

              </div>
            </div>

            {/* Quick action buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={handleScrollClick}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-2"
              >
                <span>Browse All 685+ Vacancies</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#drives-calendar"
                className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white border border-slate-600 font-semibold text-sm transition"
              >
                View Walk-In Drives
              </a>
            </div>

          </div>


          {/* =========================================
              RIGHT COLUMN: PASSPORT & VISA APPLICATION STATUS TRACKER
             ========================================= */}
          <div className="lg:col-span-6">
            <div id="passport-tracker-card" className="bg-slate-900/95 backdrop-blur-md shadow-2xl border border-white/20 rounded-3xl p-6 sm:p-7 relative overflow-hidden">
              
              {/* Subtle Indeterminate Top Shimmer Line on Active Query */}
              {lookupStatus === 'isLoading' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800/80 overflow-hidden z-20">
                  <div className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 w-1/2 animate-shimmer" />
                </div>
              )}

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {t.trackerTitle}
                    </h3>
                    <p className="text-xs text-slate-400">Live Emigration & Consulate Processing Gateway</p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  e-Migrate 2.0
                </span>
              </div>

              {/* Search Input Box */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  performTrackSearch();
                }}
                autoComplete="off"
                autoCorrect="off"
                noValidate
                className="space-y-3"
              >
                <div className="relative">
                  <input
                    id="input-passport-tracker"
                    type={showPassportInput ? "text" : "password"}
                    value={passportInput}
                    onChange={handleInputChange}
                    placeholder={t.trackerPlaceholder}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    maxLength={15}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-400 rounded-2xl py-3.5 pl-11 pr-48 text-white placeholder-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  
                  <div className="absolute right-2 top-2 flex items-center gap-1.5">
                    {passportInput && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="p-2 text-slate-400 hover:text-slate-200 transition rounded-lg hover:bg-slate-800"
                        title="Clear input"
                        aria-label="Clear input"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassportInput(!showPassportInput)}
                      className="p-2 text-slate-400 hover:text-amber-300 transition rounded-lg hover:bg-slate-800 cursor-pointer"
                      title={showPassportInput ? "Mask identification number" : "Show identification number"}
                      aria-label={showPassportInput ? "Mask identification number" : "Show identification number"}
                    >
                      {showPassportInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      id="btn-submit-track"
                      type="submit"
                      disabled={lookupStatus === 'isLoading' || !passportInput.trim()}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {lookupStatus === 'isLoading' ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                          <span>Checking...</span>
                        </span>
                      ) : (
                        t.trackBtn
                      )}
                    </button>
                  </div>
                </div>

                {/* Privacy Protected Notice */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 px-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>🔒 Data Protected: Full identification details are masked for your safety.</span>
                </div>
              </form>

              {/* Default Clean View when tracker is idle */}
              {lookupStatus === 'isIdle' && (
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-1.5">
                    <div className="flex items-center justify-center gap-2 text-slate-300 font-medium text-xs">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Encrypted Status Tracking</span>
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Enter your Passport Number or Application Token above to view real-time medical, trade test, PCC, and visa stamping milestones.
                    </p>
                  </div>
                </div>
              )}

              {/* SKELETON LOADER: Displayed solely during active 600ms loading */}
              {lookupStatus === 'isLoading' && (
                <div 
                  id="tracker-skeleton-loader" 
                  className="mt-6 pt-5 border-t border-slate-800/80 space-y-5 animate-in fade-in duration-200"
                  role="status"
                  aria-label="Loading passport record"
                >
                  {/* Subtle live query indicator banner */}
                  <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/90 shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                      <span className="text-amber-300/95 font-medium text-xs">
                        Querying e-Migrate emigration database...
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                      Live Gateway
                    </span>
                  </div>

                  {/* Candidate Details Skeleton */}
                  <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-shimmer">
                    <div className="space-y-2.5 flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-slate-800 animate-pulse" />
                        <div className="h-4 w-40 bg-slate-800 rounded-md animate-pulse" />
                        <div className="h-4 w-16 bg-slate-800/80 rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2.5 pt-0.5">
                        <div className="h-3 w-28 bg-slate-800/70 rounded animate-pulse" />
                        <span className="text-slate-700">•</span>
                        <div className="h-3 w-32 bg-slate-800/70 rounded animate-pulse" />
                        <span className="text-slate-700">•</span>
                        <div className="h-3 w-24 bg-slate-800/70 rounded animate-pulse" />
                      </div>
                    </div>

                    {/* Status Badge Skeleton */}
                    <div className="h-8 w-32 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center gap-2 px-3 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                      <div className="h-3 w-16 bg-slate-700/70 rounded" />
                    </div>
                  </div>

                  {/* Stepper Skeleton */}
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-48 bg-slate-800/80 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-slate-800/50 rounded animate-pulse" />
                    </div>

                    <div className="relative pt-1 pb-1">
                      {/* Connecting Line Skeleton */}
                      <div className="absolute top-5 left-4 right-4 h-0.5 bg-slate-800 -z-0" />

                      <div className="grid grid-cols-7 gap-1 relative z-10">
                        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                          <div key={`skeleton-step-${step}`} className="flex flex-col items-center text-center">
                            <div className="w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700/70 flex items-center justify-center shadow-xs animate-pulse">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                            </div>
                            <div className="h-2.5 w-11 bg-slate-800 rounded mt-2.5 animate-pulse" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Remarks Skeleton */}
                  <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-2 animate-shimmer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-700 animate-pulse" />
                        <div className="h-3 w-36 bg-slate-700/80 rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-20 bg-slate-700/60 rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-full bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-3 w-3/4 bg-slate-700/40 rounded animate-pulse" />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {lookupStatus === 'isNotFound' && errorMessage && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Candidate Info & Visual Step-by-Step Progress Timeline */}
              {lookupStatus === 'isSuccess' && candidateData && (
                <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-5 animate-in fade-in duration-300">
                  
                  {/* Candidate Profile Details Bar */}
                  <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800/90 shadow-lg flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-bold text-white text-sm sm:text-base">{candidateData.fullName}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-semibold">
                          {candidateData.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1.5">
                        <span>Passport No: <strong className="text-slate-200 font-mono tracking-wider">{candidateData.passportNumber}</strong></span>
                        <span className="text-slate-700">•</span>
                        <span>Trade: <strong className="text-slate-200">{candidateData.trade}</strong></span>
                        <span className="text-slate-700">•</span>
                        <span className="inline-flex items-center gap-1">
                          Country: 
                          <CountryFlag country={candidateData.targetCountry} size="xs" shape="circle" className="shrink-0" />
                          <strong className="text-amber-400 font-semibold">{candidateData.targetCountry}</strong>
                        </span>
                        <span className="text-slate-700">•</span>
                        <span>Interview: <strong className="text-slate-200">{candidateData.interviewCity}</strong></span>
                      </div>
                    </div>

                    {/* Status & Progress Percentage Badge */}
                    <div className="flex flex-col items-end gap-1">
                      <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs ${getStageBadgeStyles(candidateData.currentStage)}`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                        <span>Stage {candidateData.currentStage} of 7: {candidateData.currentStageName}</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        {Math.round((candidateData.currentStage / 7) * 100)}% Completed
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Gauge */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-medium text-slate-300">Recruitment & Deployment Pipeline</span>
                      <span className="font-mono text-xs text-slate-400">Stage {candidateData.currentStage}/7</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 rounded-full transition-all duration-700 shadow-sm"
                        style={{ width: `${(candidateData.currentStage / 7) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Horizontal 7-Stage Milestone Stepper */}
                  <div className="pt-1">
                    <div className="relative">
                      {/* Connecting Line */}
                      <div className="absolute top-4 left-3 right-3 h-0.5 bg-slate-800 -z-0">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500"
                          style={{
                            width: `${((candidateData.currentStage - 1) / 6) * 100}%`
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-7 gap-1 relative z-10">
                        {RECRUITMENT_STAGES.map((stageDef) => {
                          const stageNum = stageDef.stage;
                          const isCompleted = candidateData.currentStage >= stageNum;
                          const isCurrent = candidateData.currentStage === stageNum;
                          const isSelected = selectedStage === stageNum;
                          const StageIcon = stageDef.icon;
                          const isTooltipOpen = hoveredStage === stageNum || activeTooltipStage === stageNum;

                          // Helper classes for responsive tooltip positioning to prevent screen overflow
                          const getTooltipAlignClass = () => {
                            if (stageNum === 1) return 'left-0 sm:-left-2';
                            if (stageNum === 2) return 'left-0 sm:left-1/2 sm:-translate-x-1/4';
                            if (stageNum === 6) return 'right-0 sm:left-1/2 sm:-translate-x-3/4';
                            if (stageNum === 7) return 'right-0 sm:-right-2';
                            return 'left-1/2 -translate-x-1/2';
                          };

                          const getArrowAlignClass = () => {
                            if (stageNum === 1) return 'left-4 sm:left-6';
                            if (stageNum === 2) return 'left-4 sm:left-1/4';
                            if (stageNum === 6) return 'right-4 sm:right-3/4';
                            if (stageNum === 7) return 'right-4 sm:right-6';
                            return 'left-1/2 -translate-x-1/2';
                          };

                          return (
                            <div 
                              key={`stepper-stage-${stageNum}`}
                              className="relative flex flex-col items-center"
                              onMouseEnter={() => setHoveredStage(stageNum)}
                              onMouseLeave={() => setHoveredStage(null)}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStage(stageNum);
                                  setTimelineExpanded(true);
                                  setActiveTooltipStage(activeTooltipStage === stageNum ? null : stageNum);
                                  setExpandedGuideStages(prev => ({ ...prev, [stageNum]: true }));
                                }}
                                onFocus={() => setHoveredStage(stageNum)}
                                onBlur={() => setHoveredStage(null)}
                                className="flex flex-col items-center text-center group cursor-pointer focus:outline-none w-full"
                                aria-label={`Stage ${stageNum}: ${stageDef.title}`}
                              >
                                {/* Step circle */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                  isCurrent
                                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 scale-110'
                                    : isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 group-hover:border-slate-500'
                                } ${isSelected && !isCurrent ? 'ring-2 ring-slate-400' : ''}`}>
                                  {isCompleted && !isCurrent ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  ) : isCurrent ? (
                                    <StageIcon className="w-4 h-4" />
                                  ) : (
                                    stageNum
                                  )}
                                </div>

                                {/* Label */}
                                <span className={`text-[10px] mt-2 font-medium leading-tight px-0.5 line-clamp-2 transition-colors ${
                                  isCurrent
                                    ? 'text-amber-300 font-bold'
                                    : isCompleted
                                    ? 'text-slate-300'
                                    : 'text-slate-500 group-hover:text-slate-400'
                                }`}>
                                  {stageDef.shortTitle}
                                </span>
                              </button>

                              {/* Informative Floating Tooltip Popover */}
                              {isTooltipOpen && (
                                <div 
                                  className={`absolute z-40 bottom-full mb-2.5 w-64 sm:w-72 p-3.5 rounded-2xl bg-slate-900/98 backdrop-blur-xl border border-amber-500/40 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 ${getTooltipAlignClass()}`}
                                  role="tooltip"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Arrow */}
                                  <div className={`absolute -bottom-1.5 w-3 h-3 bg-slate-900 border-r border-b border-amber-500/40 rotate-45 ${getArrowAlignClass()}`} />

                                  {/* Tooltip Header */}
                                  <div className="flex items-start justify-between gap-1.5 pb-2 border-b border-slate-800">
                                    <div className="flex items-center gap-1.5">
                                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                        isCurrent 
                                          ? 'bg-amber-500 text-slate-950 font-bold' 
                                          : isCompleted 
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                                      }`}>
                                        {stageNum}
                                      </div>
                                      <div>
                                        <h6 className="text-xs font-bold text-white leading-tight">
                                          {stageDef.title}
                                        </h6>
                                        <span className="text-[10px] text-amber-300/90 font-mono">
                                          Turnaround: {stageDef.estimatedTime}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Status Pill */}
                                    <div className="shrink-0 flex items-center gap-1">
                                      {isCurrent ? (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                                          Active
                                        </span>
                                      ) : isCompleted ? (
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-semibold border border-emerald-500/30">
                                          Cleared
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] border border-slate-700">
                                          Pending
                                        </span>
                                      )}
                                      {activeTooltipStage === stageNum && (
                                        <button
                                          type="button"
                                          onClick={() => setActiveTooltipStage(null)}
                                          className="text-slate-400 hover:text-white p-0.5 transition cursor-pointer"
                                          aria-label="Close tooltip"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Tooltip Content */}
                                  <div className="pt-2 space-y-2 text-[11px] leading-relaxed">
                                    <div>
                                      <span className="text-amber-400 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                                        What This Stage Entails:
                                      </span>
                                      <p className="text-slate-200 text-[11px]">
                                        {stageDef.whatItEntails}
                                      </p>
                                    </div>

                                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 space-y-1.5 text-[10px]">
                                      <div>
                                        <span className="text-emerald-400 font-semibold block">Candidate Action:</span>
                                        <p className="text-slate-300 leading-tight">{stageDef.candidateRole}</p>
                                      </div>
                                      <div className="pt-1 border-t border-slate-800/80">
                                        <span className="text-sky-400 font-semibold block">Required Documents:</span>
                                        <p className="text-slate-300 leading-tight">{stageDef.documentsNeeded}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                                    <span className="text-amber-400 font-medium">Click to view in timeline</span>
                                    <span className="text-slate-500 font-mono">Stage {stageNum} of 7</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* VISUAL STEP-BY-STEP PROGRESS TIMELINE */}
                  <div className="border border-slate-800/90 rounded-2xl bg-slate-950/60 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          Step-by-Step Recruitment Progress Timeline
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Tracking stages from initial trade assessment to flight deployment
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setTimelineExpanded(!timelineExpanded)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer transition"
                      >
                        <span>{timelineExpanded ? 'Compact' : 'Expand All'}</span>
                        {timelineExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Timeline Vertical Stack */}
                    <div className={`space-y-3 transition-all ${timelineExpanded ? 'max-h-[460px] overflow-y-auto pr-1' : ''}`}>
                      {RECRUITMENT_STAGES.map((stageDef, idx) => {
                        const stageNum = stageDef.stage;
                        const isCompleted = candidateData.currentStage >= stageNum;
                        const isCurrent = candidateData.currentStage === stageNum;
                        const isPending = candidateData.currentStage < stageNum;
                        const isSelected = selectedStage === stageNum;
                        const StageIcon = stageDef.icon;

                        // Match timeline logs from API if available
                        const timelineLog = timeline.find(item => item.stage === stageNum);
                        const stageDate = timelineLog?.date 
                          ? timelineLog.date 
                          : isCurrent 
                          ? new Date(candidateData.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : isCompleted 
                          ? new Date(candidateData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Pending Previous Stage';

                        const stageRemarks = isCurrent && candidateData.remarks
                          ? candidateData.remarks
                          : timelineLog?.remarks || stageDef.description;

                        // If not expanded and not current or selected, collapse to brief row
                        if (!timelineExpanded && !isCurrent && !isSelected) {
                          return (
                            <div 
                              key={`timeline-collapsed-${stageNum}`}
                              onClick={() => setSelectedStage(stageNum)}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                                isCompleted 
                                  ? 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900' 
                                  : 'bg-slate-950/30 border-slate-850 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                                }`}>
                                  {isCompleted ? '✓' : stageNum}
                                </div>
                                <span className={isCompleted ? 'font-medium text-slate-200' : 'text-slate-500'}>
                                  Stage {stageNum}: {stageDef.title}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">{stageDate}</span>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={`timeline-stage-${stageNum}`}
                            onClick={() => setSelectedStage(stageNum)}
                            className={`relative rounded-2xl p-3.5 sm:p-4 border transition-all ${
                              isCurrent
                                ? 'bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-900 border-amber-500/50 shadow-lg ring-1 ring-amber-500/20'
                                : isSelected
                                ? 'bg-slate-900 border-slate-600 shadow-md'
                                : isCompleted
                                ? 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700'
                                : 'bg-slate-950/40 border-slate-850 opacity-70'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2.5 mb-2">
                              <div className="flex items-center gap-2.5">
                                {/* Stage Icon Badge */}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                                  isCurrent
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                                    : isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-800/80 text-slate-500 border border-slate-700'
                                }`}>
                                  {isCompleted && !isCurrent ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  ) : (
                                    <StageIcon className="w-4 h-4" />
                                  )}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className={`text-xs sm:text-sm font-bold ${
                                      isCurrent ? 'text-amber-300' : isCompleted ? 'text-white' : 'text-slate-400'
                                    }`}>
                                      Stage {stageNum}: {stageDef.title}
                                    </h5>
                                    {isCurrent && (
                                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                        Current Stage
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                    <span className="flex items-center gap-1 font-mono">
                                      <Calendar className="w-3 h-3 text-slate-500" />
                                      {stageDate}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Tag Pill */}
                              <div>
                                {isCurrent ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-xs">
                                    In Progress
                                  </span>
                                ) : isCompleted ? (
                                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-semibold text-[11px] border border-emerald-500/30 flex items-center gap-1">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    Cleared
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-500 text-[10px] font-medium border border-slate-700/60">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stage Remarks / Details */}
                            <div className="text-xs space-y-2.5 pl-10">
                              <p className={`${isCurrent ? 'text-slate-200' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                                {stageRemarks}
                              </p>

                              {/* Informative Tooltip / Guide Trigger Button & Estimated Timeframe */}
                              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStageGuide(stageNum);
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                                    expandedGuideStages[stageNum]
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                                      : 'bg-slate-900/90 hover:bg-slate-850 text-slate-300 border-slate-700/80 hover:text-white'
                                  }`}
                                  aria-expanded={!!expandedGuideStages[stageNum]}
                                  title="View what this stage entails, candidate actions, and required documents"
                                >
                                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Stage Guide: What it entails</span>
                                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${expandedGuideStages[stageNum] ? 'rotate-180' : ''}`} />
                                </button>

                                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>Turnaround: <strong className="text-slate-300 font-medium">{stageDef.estimatedTime}</strong></span>
                                </span>
                              </div>

                              {/* Expanded Stage Guide: What This Stage Entails For Candidate */}
                              {expandedGuideStages[stageNum] && (
                                <div className="p-3.5 rounded-xl bg-slate-950/95 border border-slate-700/80 space-y-2.5 text-xs shadow-md animate-in fade-in duration-200">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                                    <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                                      <Info className="w-3.5 h-3.5 text-amber-400" />
                                      What Stage {stageNum} ({stageDef.title}) Entails
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                      Timeframe: {stageDef.estimatedTime}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                                      Process & Assessment:
                                    </span>
                                    <p className="text-slate-200 leading-relaxed text-xs">
                                      {stageDef.whatItEntails}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                                        Candidate Action Required:
                                      </span>
                                      <p className="text-slate-300 text-[11px] leading-relaxed">
                                        {stageDef.candidateRole}
                                      </p>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                                      <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block mb-1">
                                        Documents & Verification:
                                      </span>
                                      <p className="text-slate-300 text-[11px] leading-relaxed">
                                        {stageDef.documentsNeeded}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] text-slate-300">
                                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-amber-300 font-medium">Subsequent Milestone: </strong>
                                      <span>{stageDef.nextStep}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Current Stage Next Step Action Advice */}
                              {isCurrent && (
                                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-2">
                                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-semibold text-amber-300">Current Action: </span>
                                    <span>{stageDef.nextStep}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Official Gateway Accreditation Footnote */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ministry of External Affairs Approved Gateway (e-Migrate 2.0)</span>
                      </div>
                      <span className="font-mono text-slate-500 text-[10px]">
                        Helpline: +91 11 4165 9500
                      </span>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
