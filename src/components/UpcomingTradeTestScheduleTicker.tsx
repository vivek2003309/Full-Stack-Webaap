import React from 'react';
import { Calendar, MapPin, Users, ArrowRight, Clock, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { InterviewDrive } from '../types';
import { Language } from '../translations';
import { CountryFlag } from './CountryFlag';

interface UpcomingTradeTestScheduleTickerProps {
  lang: Language;
  onRegisterDrive: (drive: InterviewDrive) => void;
}

// Scheduled upcoming client interview drives & practical trade tests
export const UPCOMING_SCHEDULE_ITEMS: (InterviewDrive & {
  urgencyBadge: string;
  testBay: string;
  vacanciesCount: number;
})[] = [
  {
    id: "schedule-russia-welders",
    city: "Janakpuri Center",
    venue: "TICE Testing Workshop, Janakpuri District Centre, New Delhi - 110058",
    driveDate: "Oct 24 - 26, 2026 (09:00 AM - 05:30 PM)",
    tradesAllowed: ["Structural Welders (6G/TIG)", "Pipe Fitters", "Plate Welders"],
    countryDestination: "Russia LNG Project",
    urgencyBadge: "Client Delegation Attending",
    testBay: "Bay 4 & 6 (High Pressure X-Ray)",
    vacanciesCount: 220
  },
  {
    id: "schedule-saudi-aramco",
    city: "Janakpuri Center",
    venue: "TICE Trade Testing Centre, Westend Mall Annex, Janakpuri, New Delhi",
    driveDate: "Oct 28 - 30, 2026 (09:30 AM - 06:00 PM)",
    tradesAllowed: ["Riggers & Fabricators", "Heavy Equipment Mechanics", "Scaffolders"],
    countryDestination: "Saudi Aramco Pipeline",
    urgencyBadge: "Fast-Track Visa Mobilization",
    testBay: "Rigging Bay & Heavy Rig Simulation",
    vacanciesCount: 185
  },
  {
    id: "schedule-uae-mep",
    city: "Janakpuri Center",
    venue: "TICE Electrical & MEP Diagnostic Lab, Janakpuri, New Delhi",
    driveDate: "Nov 02 - 04, 2026 (10:00 AM - 05:00 PM)",
    tradesAllowed: ["MEP Electricians & Plumbers", "HVAC Chiller Technicians", "BMS Operators"],
    countryDestination: "UAE Commercial Facility",
    urgencyBadge: "Immediate GAMCA & Offer Letter",
    testBay: "HVAC & Commercial Wiring Suite",
    vacanciesCount: 140
  }
];

export const UpcomingTradeTestScheduleTicker: React.FC<UpcomingTradeTestScheduleTickerProps> = ({
  lang,
  onRegisterDrive
}) => {
  return (
    <section 
      id="upcoming-trade-tests-ticker" 
      className="relative z-10 py-10 bg-slate-900/90 border-y border-slate-800 text-slate-100 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Ticker Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {lang === 'hi' 
                  ? 'आगामी वॉक-इन क्लाइंट इंटरव्यू एवं ट्रेड टेस्ट' 
                  : lang === 'ar'
                  ? 'جدول مقابلات واختبارات العملاء والورش القادمة'
                  : 'Upcoming Client Interviews & Trade Tests'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {lang === 'hi'
                ? 'अधिकृत क्लाइंट इंटरव्यू एवं ट्रेड टेस्ट तिथियां'
                : lang === 'ar'
                ? 'جدول مواعيد الفحص الفني والمقابلات المباشرة'
                : 'Upcoming Client Interviews & Practical Trade Test Bay Schedules'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {lang === 'hi'
                ? 'जनकपुरी मुख्य केंद्र पर प्रत्यक्ष क्लाइंट प्रतिनिधियों के समक्ष व्यवहारिक ट्रेड टेस्ट देकर 24 घंटे में ऑफर लेटर प्राप्त करें।'
                : lang === 'ar'
                ? 'احضر المقابلات والاختبارات العملية مباشرة في مركز جناكبوري مع وفود الشركات العالمية.'
                : 'Direct client assessments with immediate technical scorecards, biometric verification, and fast-track flight processing at our certified Janakpuri testing facilities.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-semibold text-emerald-400">
              {lang === 'hi' ? '3 सक्रिय क्लाइंट सत्र' : lang === 'ar' ? '3 جلسات نشطة' : '3 Live Client Delegations Active'}
            </span>
          </div>
        </div>

        {/* 3 Interactive Schedule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {UPCOMING_SCHEDULE_ITEMS.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-950/85 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition shadow-lg group hover:shadow-amber-500/5 relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300 opacity-60 group-hover:opacity-100 transition" />

              <div className="space-y-3">
                {/* Destination & Urgency */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CountryFlag 
                      country={item.countryDestination.includes('Russia') ? 'Russia' : item.countryDestination.includes('Saudi') ? 'Saudi Arabia' : 'UAE'} 
                      size="sm" 
                      shape="circle" 
                    />
                    <span className="font-bold text-amber-300 text-sm tracking-tight">
                      {item.countryDestination}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {item.vacanciesCount} {lang === 'hi' ? 'पद' : lang === 'ar' ? 'شاغر' : 'Vacancies'}
                  </span>
                </div>

                {/* Primary Trades Invited */}
                <h4 className="text-base font-bold text-white group-hover:text-amber-200 transition">
                  {item.tradesAllowed[0]}
                </h4>

                {/* Secondary trades pills */}
                <div className="flex flex-wrap gap-1.5">
                  {item.tradesAllowed.slice(1).map((trade, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                      {trade}
                    </span>
                  ))}
                </div>

                {/* Schedule & Venue Meta */}
                <div className="space-y-2 pt-2 text-xs border-t border-slate-800/80 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-medium text-slate-200">{item.driveDate}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400 text-[11px] leading-snug">{item.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-medium text-[11px]">{item.testBay}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Register for Walk-In */}
              <button
                type="button"
                onClick={() => onRegisterDrive(item)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-amber-500/20 group-hover:bg-amber-400"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {lang === 'hi' 
                    ? 'वॉक-इन हेतु पंजीकरण करें' 
                    : lang === 'ar'
                    ? 'التسجيل في المقابلة الفورية'
                    : 'Register for Walk-In'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
