import React from 'react';
import { X, ShieldCheck, CheckCircle2, Award, QrCode, Printer, ExternalLink } from 'lucide-react';

interface LicenseVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseVerificationModal: React.FC<LicenseVerificationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-3">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full">
            Ministry of External Affairs • Govt. of India
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2444] dark:text-white mt-2 font-['Space_Grotesk']">
            Registration Certificate Verification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Issued under Section 11 of the Emigration Act, 1983 (Protector General of Emigrants)
          </p>
        </div>

        {/* Certificate Card Preview */}
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-b from-amber-50/50 to-slate-50 dark:from-slate-950 dark:to-slate-900 border-2 border-amber-300/80 dark:border-amber-500/40 relative">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200/80 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Registration Certificate No:</span>
              <div className="text-base sm:text-lg font-mono font-black text-amber-950 dark:text-amber-400">
                B-0613/DEL/COM/1000+/5/5374/1999
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-bold border border-emerald-300 dark:border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Active & Compliant</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-xs text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Agency Legal Name</span>
              <strong className="text-slate-900 dark:text-white text-sm">Trehan International Consultants & Engineers</strong>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Category of Authorization</span>
              <strong className="text-slate-900 dark:text-white text-sm">1000+ Unlimited Deployments</strong>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Registered Office</span>
              <p className="text-slate-800 dark:text-slate-200">
                Unit No. UG-1 &amp; 2, Westend Mall, Janakpuri District Center, Janakpuri, New Delhi - 110058
              </p>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Initial Granted Year</span>
              <strong className="text-slate-900 dark:text-white text-sm">1999 (25+ Years Continuous Legacy)</strong>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Bank Guarantee & Security</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Lodged with Protector General of Emigrants (PGE)</span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[10px] font-bold">e-Migrate System ID</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">EMIG-DEL-5374</span>
            </div>
          </div>

          {/* Legal Note */}
          <div className="mt-5 p-3 rounded-xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-500/30 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>Mandatory Candidate Advisory:</strong> Job seekers are advised that as per MEA guidelines, recruitment service charges are strictly regulated and no unauthorized commission may be charged by any person.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <a
            href="https://emigrate.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold inline-flex items-center gap-1.5"
          >
            <span>Verify independently on official MEA e-Migrate Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#0F2444] dark:bg-amber-500 text-white dark:text-slate-950 font-bold hover:bg-[#1A3660] dark:hover:bg-amber-400 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
