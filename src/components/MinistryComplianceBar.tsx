import React, { useState } from 'react';
import { ShieldCheck, Award, FileCheck2, ExternalLink, X, Building2, Phone, Mail, UserCheck, AlertCircle } from 'lucide-react';
import { Language } from '../translations';

interface MinistryComplianceBarProps {
  lang: Language;
  onOpenLicense: () => void;
  onOpenContact?: () => void;
}

export const MinistryComplianceBar: React.FC<MinistryComplianceBarProps> = ({
  lang,
  onOpenLicense,
  onOpenContact
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div 
        id="ministry-compliance-badge-bar"
        className="relative z-20 bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-y border-amber-500/30 text-amber-200 px-3 py-2 shadow-inner"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          {/* Main Gold-Accented Trust Line */}
          <div className="flex items-center gap-2.5 text-center sm:text-left flex-wrap justify-center sm:justify-start">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-400 shrink-0">
              <Award className="w-3.5 h-3.5" />
            </span>

            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="font-bold tracking-tight text-amber-300">
                {lang === 'hi'
                  ? 'भारत सरकार अनुमोदित विदेशी भर्ती एजेंसी | MEA RC No. B-0613 | 100% ई-माइग्रेट अनुपालित एवं कानूनी रूप से सुरक्षित'
                  : lang === 'ar'
                  ? 'وكالة توظيف دولي معتمدة من حكومة الهند | ترخيص MEA رقم B-0613 | متوافقة 100% مع نظام eMigrate ومحمية قانونياً'
                  : 'Government of India Approved Overseas Recruiting Agency | MEA RC No. B-0613 | 100% eMigrate Compliant & Legally Protected'}
              </span>
            </div>
          </div>

          {/* Action / Tooltip Popup Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-verify-compliance-badge"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 text-[11px] font-bold transition cursor-pointer hover:shadow-xs hover:shadow-amber-400/20"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'मंत्रालय सत्यापन विवरण' : lang === 'ar' ? 'تفاصيل ترخيص الوزارة' : 'Ministry Verification Details'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official MEA & Compliance Verification Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400">
                  Statutory Emigration Authority
                </span>
                <h3 className="text-lg font-black text-white">
                  Ministry of External Affairs (MEA) Certification
                </h3>
              </div>
            </div>

            {/* Compliance Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Registration Certificate:</span>
                <div className="font-mono font-bold text-amber-300 text-sm">
                  B-0613/DEL/COM/1000+/5/5374/1999
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Unlimited 1000+ Capacity (Active & In Good Standing)
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">eMigrate Portal Integration:</span>
                <div className="font-bold text-white text-sm">
                  100% FE / PBBY Verified
                </div>
                <div className="text-[10px] text-slate-300">
                  Zero sub-agent policy with digital job order attestation.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  Grievance Redressal Officer:
                </span>
                <div className="font-bold text-white">
                  Capt. Rajesh Trehan (Founder &amp; MD)
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  grievance@trehaninternational.com
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  Official Janakpuri Office:
                </span>
                <div className="text-slate-200 leading-snug">
                  Unit UG-1 &amp; 2, Westend Mall, District Centre, Janakpuri, New Delhi - 110058
                </div>
              </div>
            </div>

            {/* Advisory note */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Under Emigration Act 1983 regulations, candidates deployed via Trehan International are enrolled in the Pravasi Bharatiya Bima Yojana (PBBY) insurance scheme with free consulate protection.
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  onOpenLicense();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Full RC Certificate &amp; Ministry Records</span>
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
