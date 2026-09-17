import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, MapPin, DollarSign, Check, Phone, ArrowUpRight, MessageSquare, Send, Sparkles, Filter, X } from 'lucide-react';
import { Job } from '../types';
import { Language, translations } from '../translations';
import { CountryFlag } from './CountryFlag';
import { apiFetchJobs, INITIAL_JOBS, getStoredJobs } from '../services/apiService';

interface JobBoardProps {
  lang: Language;
  onApplyJob: (job: Job) => void;
  selectedCategory?: string;
  selectedTrade?: string;
  filterTrade?: string;
  filterCountry?: string;
}

const COUNTRIES = ["All", "Russia", "Oman", "Qatar", "Kuwait", "Saudi Arabia", "Europe"];
const TRADES = ["All", "Logistics", "6G Welder", "Heavy Driver", "HVAC", "Civil Mason", "Technical"];

export const JobBoard: React.FC<JobBoardProps> = ({ 
  lang, 
  onApplyJob, 
  selectedTrade: propTrade,
  filterTrade,
  filterCountry 
}) => {
  const t = translations[lang];
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const stored = getStoredJobs();
      return stored && stored.length > 0 ? stored : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  });
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedTrade, setSelectedTrade] = useState("All");
  const [detailModalJob, setDetailModalJob] = useState<Job | null>(null);

  // Sync external filters if provided
  useEffect(() => {
    if (filterCountry) {
      setSelectedCountry(filterCountry);
    }
  }, [filterCountry]);

  useEffect(() => {
    const tradeToSet = filterTrade || propTrade;
    if (tradeToSet) {
      setSelectedTrade(tradeToSet);
    }
  }, [filterTrade, propTrade]);

  const fetchJobs = async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const data = await apiFetchJobs({
        country: selectedCountry,
        trade: selectedTrade
      });
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(jobs.length === 0);
  }, [selectedCountry, selectedTrade]);

  // Real-time synchronization when admin adds/modifies/deletes jobs or when data changes
  useEffect(() => {
    const handleJobsUpdated = () => {
      fetchJobs(false);
    };
    window.addEventListener('jobsUpdated', handleJobsUpdated);
    window.addEventListener('tice_data_changed', handleJobsUpdated);
    return () => {
      window.removeEventListener('jobsUpdated', handleJobsUpdated);
      window.removeEventListener('tice_data_changed', handleJobsUpdated);
    };
  }, [selectedCountry, selectedTrade]);

  // Handle WhatsApp Apply link safely
  const handleWhatsAppApply = (job: Job) => {
    const text = encodeURIComponent(
      `Hello TICE Recruitment Team, I am interested in applying for the overseas vacancy:\n\n*Position:* ${job.title}\n*Country:* ${job.country}\n*Salary:* ${job.salaryText}\n\nPlease guide me on the trade test and document requirements.`
    );
    const url = `https://wa.me/919910044590?text=${text}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  return (
    <section id="jobs" className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Briefcase className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Government Verified Demand</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2444] dark:text-white tracking-tight font-['Space_Grotesk']">
            {t.jobBoardTitle}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            {t.jobBoardSubtitle}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/90 dark:border-slate-800 mb-10 space-y-4"
        >
          
          {/* Country Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Destinations:
            </span>
            {COUNTRIES.map((country) => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCountry === country
                    ? 'bg-[#0F2444] dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {country !== 'All' && (
                  <CountryFlag country={country} size="xs" shape="circle" className="border-slate-300 dark:border-slate-600 shadow-xs" />
                )}
                <span>{country === 'All' ? t.allCountries : country}</span>
              </button>
            ))}
          </div>

          {/* Trade / Sector Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 dark:border-slate-800 pt-3 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Trade Category:
            </span>
            {TRADES.map((trade) => (
              <button
                key={trade}
                onClick={() => setSelectedTrade(trade)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedTrade === trade
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {trade === 'All' ? t.allTrades : trade}
              </button>
            ))}
          </div>

        </motion.div>

        {/* Loading State / Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading jobs">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden animate-pulse"
              >
                {/* Card Top Skeleton */}
                <div className="p-6 space-y-4">
                  {/* Top Bar Skeleton */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-1.5">
                        <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="w-20 h-2.5 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                    <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>

                  {/* Title Skeleton */}
                  <div className="space-y-2 pt-1">
                    <div className="w-4/5 h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="w-1/2 h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                  </div>

                  {/* Salary Block Skeleton */}
                  <div className="py-3 px-3.5 bg-slate-100 dark:bg-slate-800/70 rounded-xl flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>

                  {/* Perks Tags Skeleton */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <div className="w-20 h-5 bg-slate-100 dark:bg-slate-800 rounded-md" />
                    <div className="w-24 h-5 bg-slate-100 dark:bg-slate-800 rounded-md" />
                    <div className="w-16 h-5 bg-slate-100 dark:bg-slate-800 rounded-md" />
                  </div>

                  {/* Location snippet Skeleton */}
                  <div className="w-3/4 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>

                {/* Card Actions Skeleton */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="w-20 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No vacancies match current filter criteria</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Please try clearing or changing your destination or trade filter, or submit a general registration.
            </p>
            <button
              onClick={() => {
                setSelectedCountry('All');
                setSelectedTrade('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-amber-400 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Jobs Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (idx % 3) * 0.08, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl dark:shadow-slate-950/60 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top */}
                <div className="p-6">
                  
                  {/* Top Bar with Country & Flag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <CountryFlag 
                        country={job.country} 
                        size="md" 
                        shape="circle" 
                        className="border-slate-300 dark:border-slate-700 shadow-xs" 
                        alt={`${job.country} Flag`} 
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                          {job.country}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          ● {job.vacanciesCount} Openings
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {job.category}
                    </span>
                  </div>

                  {/* Job Title */}
                  <h3 className="text-lg font-extrabold text-[#0F2444] dark:text-white group-hover:text-amber-500 transition-colors">
                    {job.title}
                  </h3>

                  {/* Salary Block */}
                  <div className="mt-3 py-2.5 px-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-500/30 rounded-xl flex items-center gap-2 text-amber-950 dark:text-amber-200 font-bold text-sm">
                    <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{job.salaryText}</span>
                  </div>

                  {/* Perks Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.perks.map((perk, pIdx) => (
                      <span
                        key={pIdx}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        {perk}
                      </span>
                    ))}
                  </div>

                  {/* Short snippet */}
                  {job.workLocation && (
                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      <strong className="text-slate-700 dark:text-slate-300">Location:</strong> {job.workLocation}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setDetailModalJob(job)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{t.viewDetails}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleWhatsAppApply(job)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/30 cursor-pointer"
                    title="Apply directly on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    <span>{t.applyWhatsApp}</span>
                  </button>

                  <button
                    onClick={() => onApplyJob(job)}
                    className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                    title="Register application online"
                  >
                    {t.applyNow}
                  </button>
                </div>

              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Details Modal */}
      {detailModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <CountryFlag 
                  country={detailModalJob.country} 
                  size="xl" 
                  shape="squircle" 
                  className="border-slate-200 dark:border-slate-700 shadow-md" 
                  alt={`${detailModalJob.country} Flag`} 
                />
                <div>
                  <h3 className="text-xl font-bold text-[#0F2444] dark:text-white">{detailModalJob.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {detailModalJob.country} • {detailModalJob.category} • {detailModalJob.vacanciesCount} Openings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalJob(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-700 dark:text-slate-300">
              
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30">
                <div className="text-xs uppercase font-bold text-amber-800 dark:text-amber-400 tracking-wider">Salary & Benefits</div>
                <div className="text-lg font-black text-amber-950 dark:text-amber-200 mt-0.5">{detailModalJob.salaryText}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {detailModalJob.perks.map((p, idx) => (
                    <span key={idx} className="text-xs font-medium px-2 py-0.5 bg-white dark:bg-slate-800 rounded-md text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>

              {detailModalJob.description && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Job Description:</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{detailModalJob.description}</p>
                </div>
              )}

              {detailModalJob.requirements && detailModalJob.requirements.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Eligibility & Trade Requirements:</h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                    {detailModalJob.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-800 dark:text-slate-200">Legal Protection:</strong> This recruitment is directly governed under MEA Govt of India guidelines. No sub-agent commission authorized.
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  handleWhatsAppApply(detailModalJob);
                  setDetailModalJob(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Apply on WhatsApp
              </button>
              <button
                onClick={() => {
                  const j = detailModalJob;
                  setDetailModalJob(null);
                  onApplyJob(j);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Register Application
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
