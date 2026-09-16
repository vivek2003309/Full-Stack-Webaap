import React, { useState, useEffect, useRef } from 'react';
import { Star, Quote, Award, ShieldCheck, Users, Globe2 } from 'lucide-react';
import { Language, translations } from '../translations';
import { CountryFlag } from './CountryFlag';

interface CounterProps {
  target: number;
  suffix?: string;
  duration?: number;
  formatComma?: boolean;
}

const CounterNumber: React.FC<CounterProps> = ({ 
  target, 
  suffix = '', 
  duration = 1800, 
  formatComma = false 
}) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth cubic ease out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * target);
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasStarted, target, duration]);

  const formattedNumber = formatComma ? count.toLocaleString('en-US') : count.toString();

  return (
    <span ref={containerRef} className="tabular-nums inline-block">
      {formattedNumber}{suffix}
    </span>
  );
};

interface TestimonialsAndStatsProps {
  lang: Language;
}

export const TestimonialsAndStats: React.FC<TestimonialsAndStatsProps> = ({ lang }) => {
  const t = translations[lang];

  const testimonials = [
    {
      name: "Prashant Patil",
      title: "Mumbai Drive ➔ Russia (Moscow Logistics Hub)",
      company: "Verified Candidate • Google Review",
      avatarInitial: "PP",
      country: "Russia",
      badge: "Mumbai Walk-in Selection",
      quote: "Selected as Logistics Driver for Moscow logistics hub through the Mumbai trade test drive. Full documentation and visa delivered without any delays.",
      rating: 5,
      date: "Verified Google Review"
    },
    {
      name: "Gopal Kamble",
      title: "Documentation & Flight Dispatch (Oman)",
      company: "Verified Candidate • Google Review",
      avatarInitial: "GK",
      country: "Oman",
      badge: "eMigrate PoE Cleared",
      quote: "Clear guidance throughout the GAMCA medical and embassy visa stamping process. Traveled to Oman with complete eMigrate PoE clearance.",
      rating: 5,
      date: "Verified Google Review"
    },
    {
      name: "Salman Ansari",
      title: "Gorakhpur Drive (6G Pipe Welder)",
      company: "Verified Candidate • Google Review",
      avatarInitial: "SA",
      country: "Oman",
      badge: "Gorakhpur Center Interview",
      quote: "Attended walk-in interview at Gorakhpur center for 6G Welder vacancy. Clean trade testing and prompt visa dispatch with proper employment contract.",
      rating: 5,
      date: "Verified Google Review"
    }
  ];

  return (
    <section id="about-us" className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =========================================
            STATS COUNTERS ROW
           ========================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          
          <div 
            id="stat-card-legacy" 
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-300/80 dark:hover:border-amber-500/50 transition-all duration-300 text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-300">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#0F2444] dark:text-white font-['Space_Grotesk']">
              <CounterNumber target={25} suffix="+" duration={1600} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              {t.statYears} (Since 1999)
            </p>
          </div>

          <div 
            id="stat-card-mobilized" 
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300/80 dark:hover:border-sky-500/50 transition-all duration-300 text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-sky-950/60 text-blue-700 dark:text-sky-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-300">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#0F2444] dark:text-white font-['Space_Grotesk']">
              <CounterNumber target={50000} suffix="+" duration={2000} formatComma={true} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              {t.statMobilized}
            </p>
          </div>

          <div 
            id="stat-card-compliance" 
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300/80 dark:hover:border-emerald-500/50 transition-all duration-300 text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#0F2444] dark:text-white font-['Space_Grotesk']">
              <CounterNumber target={100} suffix="%" duration={1700} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              {t.statCompliance}
            </p>
          </div>

          <div 
            id="stat-card-nations" 
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300/80 dark:hover:border-indigo-500/50 transition-all duration-300 text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-300">
              <Globe2 className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#0F2444] dark:text-white font-['Space_Grotesk']">
              <CounterNumber target={14} suffix="+" duration={1500} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              Deploying Nations
            </p>
          </div>

        </div>

        {/* =========================================
            TESTIMONIALS (AUTHENTIC GOOGLE REVIEWS)
           ========================================= */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-3">
            <Quote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Google Reviews &amp; Candidate Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2444] dark:text-white tracking-tight font-['Space_Grotesk']">
            {t.testimonialsTitle}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Authentic experiences from candidates recruited and mobilized across Russia, Oman, and the Middle East.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-xl dark:shadow-slate-950/60 transition-all duration-300 relative group"
            >
              <div>
                {/* Header: Stars & Google badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">5.0</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                    {item.badge}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-[#0F2444] dark:bg-amber-500 text-amber-400 dark:text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                  {item.avatarInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                    <CountryFlag country={item.country} size="xs" shape="circle" className="shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{item.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
