import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, ArrowRight, Clock, Building, CheckCircle } from 'lucide-react';
import { InterviewDrive } from '../types';
import { Language, translations } from '../translations';
import { CountryFlag } from './CountryFlag';
import { apiFetchDrives, INITIAL_DRIVES, getStoredDrives } from '../services/apiService';

interface InterviewCalendarProps {
  lang: Language;
  onRegisterDrive: (drive: InterviewDrive) => void;
}

export const InterviewCalendar: React.FC<InterviewCalendarProps> = ({ lang, onRegisterDrive }) => {
  const t = translations[lang];
  // Initialize with seed/cached data immediately so cards are visible with zero flicker
  const [drives, setDrives] = useState<InterviewDrive[]>(() => {
    try {
      const stored = getStoredDrives();
      return stored && stored.length > 0 ? stored : INITIAL_DRIVES;
    } catch {
      return INITIAL_DRIVES;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDrivesOnce = async () => {
      try {
        const res = await apiFetchDrives();
        const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
        if (isMounted && list.length > 0) {
          setDrives(list);
        }
      } catch (err) {
        console.warn('Error fetching drives silently:', err);
      }
    };

    fetchDrivesOnce();

    return () => {
      isMounted = false;
    };
  }, []);

  // Silent sync when data updates from admin without triggering loading skeletons
  useEffect(() => {
    let isMounted = true;
    const handleDataChange = () => {
      if (!isMounted) return;
      try {
        const updated = getStoredDrives();
        if (updated && updated.length > 0) {
          setDrives(updated);
        }
      } catch (err) {
        console.warn('Silent drive update failed:', err);
      }
    };

    window.addEventListener('tice_data_changed', handleDataChange);
    return () => {
      isMounted = false;
      window.removeEventListener('tice_data_changed', handleDataChange);
    };
  }, []);

  return (
    <section id="drives-calendar" className="py-20 bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden transition-colors">
      
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Face-to-Face Foreign Delegation Interviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
            {t.calendarTitle}
          </h2>
          <p className="mt-3 text-slate-300 text-base sm:text-lg">
            {t.calendarSubtitle}
          </p>
        </motion.div>

        {/* Drives Grid / Skeleton */}
        {isLoading && drives.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading walk-in interview schedule">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl animate-pulse space-y-6"
              >
                <div>
                  {/* Top Badges Skeleton */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-24 h-6 bg-slate-700 rounded-full" />
                    <div className="w-24 h-4 bg-slate-700 rounded" />
                  </div>

                  {/* Date Skeleton */}
                  <div className="w-48 h-6 bg-slate-700 rounded-md mb-3" />

                  {/* Destination Skeleton */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-16 h-3 bg-slate-700 rounded" />
                    <div className="w-4 h-4 rounded-full bg-slate-700" />
                    <div className="w-20 h-3 bg-slate-700 rounded" />
                  </div>

                  {/* Venue Box Skeleton */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2 mb-4">
                    <div className="w-16 h-3 bg-slate-700 rounded" />
                    <div className="w-full h-3 bg-slate-700/70 rounded" />
                    <div className="w-3/4 h-3 bg-slate-700/70 rounded" />
                  </div>

                  {/* Trades Allowed Skeleton */}
                  <div className="space-y-2">
                    <div className="w-28 h-3 bg-slate-700 rounded" />
                    <div className="flex flex-wrap gap-1.5">
                      <div className="w-20 h-5 bg-slate-700/70 rounded-md" />
                      <div className="w-24 h-5 bg-slate-700/70 rounded-md" />
                      <div className="w-16 h-5 bg-slate-700/70 rounded-md" />
                    </div>
                  </div>
                </div>

                {/* Button Skeleton */}
                <div className="pt-4 border-t border-slate-700/60">
                  <div className="w-full h-10 bg-slate-700 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Array.isArray(drives) ? drives : []).map((drive, index) => (
              <motion.div
                key={drive.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
                className="bg-slate-800/90 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl group relative"
              >
                {/* Top Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {drive.city} Center
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      Walk-in Ready
                    </span>
                  </div>

                  {/* Drive Date */}
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {drive.driveDate}
                  </h3>

                  {/* Destination */}
                  <div className="mt-2 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="text-slate-400">Destination:</span>
                    <CountryFlag country={drive.countryDestination} size="xs" shape="circle" className="shrink-0" />
                    <span className="text-amber-400 font-semibold">{drive.countryDestination}</span>
                  </div>

                  {/* Venue */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{t.venue}:</span>
                    </div>
                    <p className="pl-4 text-slate-200">{drive.venue}</p>
                  </div>

                  {/* Trades Allowed */}
                  <div className="mt-4">
                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{t.tradesInvited}:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {drive.tradesAllowed.map((tr, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-200 border border-slate-600/50"
                        >
                          {tr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Button */}
                <div className="mt-6 pt-4 border-t border-slate-700/60">
                  <button
                    onClick={() => onRegisterDrive(drive)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <span>{t.registerDrive}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            ))}
          </div>
        )}

        {/* Note on requirements */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Walk-in Checklist:</strong> Original Passport (valid for 1+ year), 8 White background photos, Educational/Trade certificates, and Experience letters.
            </span>
          </div>
          <span className="text-amber-400 font-semibold shrink-0">No Pre-Interview Registration Fees</span>
        </motion.div>

      </div>
    </section>
  );
};
