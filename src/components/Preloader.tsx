import React, { useEffect, useState } from 'react';

const TICKER_FACTS = [
  '● Govt. of India Approved (MEA RC No. B-0613)',
  '● Mobilizing Skilled Indian Talent Globally',
  '● Connecting Opportunities Across Russia, Gulf & Europe',
  '● Preparing Secure Candidate Portal...'
];

export const Preloader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Body lock while preloading
    document.body.style.overflow = 'hidden';

    // Fact ticker carousel (changes every 1.4 seconds)
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % TICKER_FACTS.length);
    }, 1400);

    // Progress bar animation
    const startTime = Date.now();
    const minDuration = 1300; // minimum duration in ms
    const maxDuration = 2200; // max duration in ms

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(100, Math.floor((elapsed / maxDuration) * 100));
      setProgress(calculatedProgress);
    }, 30);

    const finishLoading = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = '';
          }, 700); // match transition duration
        }, 200);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading);
    }

    // Safety fallback timeout (2.5s maximum)
    const fallbackTimeout = setTimeout(finishLoading, 2500);

    return () => {
      clearInterval(factInterval);
      clearInterval(progressInterval);
      clearTimeout(fallbackTimeout);
      window.removeEventListener('load', finishLoading);
      document.body.style.overflow = '';
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      id="tice-preloader"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09172B] select-none transition-all duration-700 ease-in-out ${
        isExiting ? 'opacity-0 -translate-y-8 pointer-events-none scale-102' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 45%, #132D54 0%, #09172B 75%, #050D19 100%)'
      }}
      aria-hidden={isExiting ? 'true' : 'false'}
    >
      {/* Background Subtle Radial Glow & Grid Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,155,38,0.08)_0%,transparent_60%)] pointer-events-none animate-pulse duration-3000"></div>

      {/* Decorative Compass Lines */}
      <div className="absolute w-96 h-96 rounded-full border border-amber-500/10 pointer-events-none animate-[spin_40s_linear_infinite]"></div>
      <div className="absolute w-72 h-72 rounded-full border border-sky-400/5 pointer-events-none animate-[spin_25s_linear_infinite_reverse]"></div>

      {/* Centered Preloader Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
        
        {/* 1. Glowing Brand Emblem (Wireframe Globe / Compass) */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Ambient Glow */}
          <div className="absolute w-28 h-28 bg-amber-500/20 rounded-full blur-xl animate-pulse"></div>
          
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-[#142E56] to-[#0D1F3C] p-0.5 border border-amber-500/30 shadow-[0_0_35px_rgba(217,155,38,0.25)] flex items-center justify-center">
            {/* SVG Glowing Wireframe Globe / Geometric Compass */}
            <svg
              className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-[spin_18s_linear_infinite]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Ring */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 6"
                className="opacity-70"
              />
              {/* Inner Globe Longitude & Latitude */}
              <ellipse
                cx="50"
                cy="50"
                rx="40"
                ry="18"
                stroke="currentColor"
                strokeWidth="1.8"
                className="opacity-80"
              />
              <ellipse
                cx="50"
                cy="50"
                rx="18"
                ry="40"
                stroke="currentColor"
                strokeWidth="1.8"
                className="opacity-80"
              />
              <line
                x1="10"
                y1="50"
                x2="90"
                y2="50"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="2 3"
                className="opacity-60"
              />
              <line
                x1="50"
                y1="10"
                x2="50"
                y2="90"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="2 3"
                className="opacity-60"
              />
              {/* Center Core Compass Star */}
              <polygon
                points="50,32 54,46 68,50 54,54 50,68 46,54 32,50 46,46"
                fill="#FBBF24"
                className="animate-pulse"
              />
              <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
            </svg>
          </div>
        </div>

        {/* 2. Firm Typography */}
        <div className="space-y-1.5 mb-8">
          <h1 className="text-white font-bold text-base sm:text-lg md:text-xl tracking-[0.25em] font-['Space_Grotesk'] uppercase drop-shadow-sm">
            TREHAN INTERNATIONAL
          </h1>
          <p className="text-[#D99B26] tracking-[0.35em] text-[11px] sm:text-xs font-semibold uppercase">
            CONSULTANTS &amp; ENGINEERS
          </p>
          <p className="text-slate-300 text-xs tracking-wider font-normal">
            त्रेहन इंटरनेशनल कंसल्टेंट्स &amp; इंजीनियर्स
          </p>
          <div className="inline-block px-2.5 py-0.5 mt-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[9px] text-slate-300 font-mono tracking-wider">
            TICE • MEA RC NO. B-0613
          </div>
        </div>

        {/* 3. Animated Progress Indicator */}
        <div className="w-60 sm:w-64 max-w-full flex flex-col items-center gap-2 mb-6">
          <div className="w-full h-[2.5px] bg-slate-800/90 rounded-full overflow-hidden p-0 border border-slate-700/40 relative">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(245,158,11,0.8)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between w-full text-[10px] font-mono text-slate-400 px-0.5">
            <span className="text-slate-500">SYSTEM INITIALIZING</span>
            <span className="text-amber-400 font-bold">{progress}%</span>
          </div>
        </div>

        {/* 4. Dynamic Fact Ticker */}
        <div className="h-6 flex items-center justify-center">
          <p
            key={factIndex}
            className="text-xs sm:text-[13px] text-slate-300 font-medium tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all text-center"
          >
            {TICKER_FACTS[factIndex]}
          </p>
        </div>

      </div>

      {/* Bottom Minimalist Security Badge */}
      <div className="absolute bottom-6 text-center text-[10px] text-slate-300 font-mono tracking-widest uppercase">
        Govt. Approved Manpower Gateway
      </div>
    </div>
  );
};
