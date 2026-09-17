import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Truck, 
  GraduationCap, 
  CheckCircle, 
  ArrowRight, 
  HardHat, 
  Cog, 
  Activity, 
  ShieldCheck, 
  FileText, 
  Send,
  Building,
  ChevronRight
} from 'lucide-react';
import { Language, translations } from '../translations';

interface InfrastructureShowcaseProps {
  lang: Language;
  onOpenHireModal: () => void;
}

export const InfrastructureShowcase: React.FC<InfrastructureShowcaseProps> = ({ lang, onOpenHireModal }) => {
  const t = translations[lang];
  const [activeSector, setActiveSector] = useState<'construction' | 'logistics' | 'heavy' | 'technical'>('logistics');

  const sectors = [
    {
      id: 'construction',
      name: 'Construction & Civil',
      icon: HardHat,
      color: 'from-amber-500 to-amber-600',
      description: 'Masons, Carpenters, Steel Fixers, Tile Setters, Riggers, and Civil Supervisors for large infrastructure and mega towers.',
      stats: '18,500+ Deployed in GCC'
    },
    {
      id: 'logistics',
      name: 'Logistics & Supply Chain',
      icon: Truck,
      color: 'from-sky-500 to-blue-600',
      description: 'LCV Delivery Van Drivers, Heavy Articulated Trailer Operators, Forklift Handlers, and Automated Warehouse Clerks.',
      stats: '14,200+ Deployed across Russia & Gulf'
    },
    {
      id: 'heavy',
      name: 'Heavy Industry & Piping',
      icon: Cog,
      color: 'from-orange-500 to-red-600',
      description: '3G/4G/6G TIG & ARC Welders, Pipe Fabricators, Millwright Fitters, Instrumentation Mechanics for Oil & Gas refineries.',
      stats: '11,000+ Certified 6G Specialists'
    },
    {
      id: 'technical',
      name: 'MEP & Technical Operations',
      icon: Activity,
      color: 'from-emerald-500 to-teal-600',
      description: 'HVAC Chiller Technicians, Industrial Electricians, Fire Alarm Engineers, and High-voltage Substation Operators.',
      stats: '8,400+ Technicians Mobilized'
    }
  ];

  return (
    <section id="infrastructure" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Inspection-Ready Technical Infrastructure</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2444] dark:text-white tracking-tight font-['Space_Grotesk']">
            {t.infraTitle}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            {t.infraSubtitle}
          </p>
        </motion.div>

        {/* 3-Column Facilities Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          {/* Facility 1: Practical Welding & Piping Workshop */}
          <motion.div 
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0, ease: "easeOut" }}
            className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl dark:shadow-slate-950/60 transition-all duration-300 group"
          >
            <div className="h-56 bg-slate-900 relative overflow-hidden flex items-center justify-center">
              {/* Graphic visual illustration for Welding Workshop */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                  <Flame className="w-8 h-8" />
                </div>
                <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                  Bays 01 - 24
                </span>
                <h4 className="text-white font-bold text-lg mt-0.5">TIG / ARC 6G Testing Bays</h4>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#0F2444] dark:text-white mb-2">
                Practical Welding & Piping Workshop
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Equipped with Lincoln Electric & Miller multi-process welding machines, radiographic testing, and coupon bend testing apparatus under certified AWS/CSWIP welding inspectors.
              </p>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>24 Independent Welding Booths</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>CSWIP 3.1 & AWS Senior QA Certified Staff</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Live Video Streaming for Foreign Clients</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Facility 2: Heavy Machinery Simulator & Operating Grounds */}
          <motion.div 
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
            className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl dark:shadow-slate-950/60 transition-all duration-300 group"
          >
            <div className="h-56 bg-slate-900 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-3 group-hover:scale-110 transition-transform">
                  <Truck className="w-8 h-8" />
                </div>
                <span className="text-xs uppercase font-mono tracking-widest text-sky-400 font-bold">
                  Track & Simulation Arena
                </span>
                <h4 className="text-white font-bold text-lg mt-0.5">Heavy Transport Assessment</h4>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#0F2444] dark:text-white mb-2">
                Machinery Simulator & Driving Grounds
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Dedicated 5-acre enclosed driving practice and testing ground for multi-axle trailers, articulated trucks, excavators, and crawler cranes with obstacle manoeuvring courses.
              </p>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Reverse S-curve & ramp gradient tracks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Russian & Gulf traffic rules evaluation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Pre-trip mechanical maintenance audit</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Facility 3: Digital Emigration & Pre-Departure Classrooms */}
          <motion.div 
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.24, ease: "easeOut" }}
            className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl dark:shadow-slate-950/60 transition-all duration-300 group"
          >
            <div className="h-56 bg-slate-900 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
                  PDOT Training Suites
                </span>
                <h4 className="text-white font-bold text-lg mt-0.5">Pre-Departure Orientation</h4>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#0F2444] dark:text-white mb-2">
                Digital Classrooms & Orientation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Air-conditioned lecture theatres equipped with audio-visual learning aids for mandatory Pre-Departure Orientation Training (PDOT), safety briefings, and basic conversational language.
              </p>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>MEA Accredited PDOT Curriculum</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Basic Russian & Arabic conversational modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Biometric finger-scan registration terminals</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>


        {/* =========================================
            KEY SECTORS WE SERVE
           ========================================= */}
        <div id="sectors" className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F2444] dark:text-white font-['Space_Grotesk']">
              {t.sectorsTitle}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Deep industry specialization with tailored technical grading for global EPC contractors.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sectors.map((sec, sIdx) => {
              const IconComp = sec.icon;
              const isSelected = activeSector === sec.id;
              return (
                <motion.div
                  key={sec.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: sIdx * 0.08, ease: "easeOut" }}
                  onClick={() => setActiveSector(sec.id as any)}
                  className={`p-5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F2444] dark:bg-amber-500 text-white dark:text-slate-950 border-[#0F2444] dark:border-amber-400 shadow-lg scale-102'
                      : 'bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-amber-500 dark:bg-slate-950 text-slate-950 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm mb-1">{sec.name}</h4>
                  <p className={`text-[11px] leading-tight ${isSelected ? 'text-slate-300 dark:text-slate-900 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                    {sec.stats}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Active Sector Details Panel */}
          {sectors.find(s => s.id === activeSector) && (
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Featured Capabilities
                </span>
                <h4 className="text-lg font-bold text-[#0F2444] dark:text-white">
                  {sectors.find(s => s.id === activeSector)?.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                  {sectors.find(s => s.id === activeSector)?.description}
                </p>
              </div>

              <button
                onClick={onOpenHireModal}
                className="px-5 py-2.5 rounded-xl bg-[#0F2444] dark:bg-amber-500 hover:bg-[#1A3660] dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Request Workforce Quota</span>
                <ChevronRight className="w-4 h-4 text-amber-400 dark:text-slate-950" />
              </button>
            </motion.div>
          )}
        </div>


        {/* =========================================
            HOW WE WORK: 4-STEP WORKFLOW
           ========================================= */}
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <div className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider mb-1">
              End-to-End Mobilization Standard
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F2444] dark:text-white font-['Space_Grotesk']">
              {t.howWeWorkTitle}
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0, ease: "easeOut" }}
              className="bg-slate-50 dark:bg-slate-950/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center relative group hover:border-amber-400 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold text-sm flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                1
              </div>
              <h4 className="font-bold text-[#0F2444] dark:text-white text-base mb-2">Request Talent</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Client provides job specifications, salary scale, and required skill certifications.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
              className="bg-slate-50 dark:bg-slate-950/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center relative group hover:border-amber-400 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold text-sm flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                2
              </div>
              <h4 className="font-bold text-[#0F2444] dark:text-white text-base mb-2">Screening & Trade Tests</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Candidates undergo live practical assessments at TICE centers with client representatives.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
              className="bg-slate-50 dark:bg-slate-950/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center relative group hover:border-amber-400 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold text-sm flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                3
              </div>
              <h4 className="font-bold text-[#0F2444] dark:text-white text-base mb-2">Workforce Mobilization</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                GAMCA medical, visa stamping, MEA Emigration clearance, and ticketing processed in-house.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
              className="bg-slate-50 dark:bg-slate-950/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center relative group hover:border-amber-400 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold text-sm flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                4
              </div>
              <h4 className="font-bold text-[#0F2444] dark:text-white text-base mb-2">Post-Deployment Support</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Airport dispatch, on-site camp onboarding coordination, and 90-day candidate warranty.
              </p>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
};
