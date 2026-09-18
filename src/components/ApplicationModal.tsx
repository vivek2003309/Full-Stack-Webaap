import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Phone, FileText, MapPin, Globe, Sparkles, AlertCircle, Printer, FileCheck } from 'lucide-react';
import { Job, InterviewDrive } from '../types';
import { apiSubmitApplication, sanitizeFirestorePayload } from '../services/apiService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WalkInPassModal } from './WalkInPassModal';

// Standard alphanumeric passport formatting: 1 letter followed by 7 digits (e.g. P1234567)
const PASSPORT_REGEX = /^[A-Z][0-9]{7}$/;

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob?: Job | null;
  selectedDrive?: InterviewDrive | null;
  onRegisteredSuccess?: (passport: string) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  selectedJob,
  selectedDrive,
  onRegisteredSuccess
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [trade, setTrade] = useState(
    selectedJob?.title || selectedDrive?.tradesAllowed[0] || 'Logistics Van Driver'
  );
  const [targetCountry, setTargetCountry] = useState(
    selectedJob?.country || selectedDrive?.countryDestination || 'Russia'
  );
  const [interviewCity, setInterviewCity] = useState<string>(
    selectedDrive?.city || 'Delhi'
  );
  const [remarks, setRemarks] = useState(
    selectedDrive ? `Registered for walk-in drive at ${selectedDrive.city} (${selectedDrive.driveDate})` : 'Online application through TICE portal'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{ id: string; passportNumber: string; rawPassport: string } | null>(null);
  const [showWalkInPass, setShowWalkInPass] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubmittedData(null);
      setError(null);
      setTrade(selectedJob?.title || selectedDrive?.tradesAllowed[0] || 'Logistics Van Driver');
      setTargetCountry(selectedJob?.country || selectedDrive?.countryDestination || 'Russia');
      setInterviewCity(selectedDrive?.city || 'Delhi');
      setRemarks(
        selectedDrive 
          ? `Registered for walk-in drive at ${selectedDrive.city} (${selectedDrive.driveDate})` 
          : selectedJob 
          ? `Direct application for ${selectedJob.title} (${selectedJob.country})`
          : 'Online application through TICE portal'
      );
    }
  }, [isOpen, selectedJob, selectedDrive]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !passportNumber || !trade || !targetCountry) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    const passportClean = passportNumber.trim().toUpperCase();

    // Client-side regex validation: 1 letter followed by 7 digits (e.g., P1234567)
    if (!PASSPORT_REGEX.test(passportClean)) {
      setError('Invalid passport number format. Must be 1 letter followed by 7 digits (e.g. P1234567).');
      return;
    }

    setLoading(true);
    setError(null);

    const cleanToken = "TIC-" + passportClean.slice(-4);
    const candidateName = fullName.trim();
    const candidateTrade = trade || selectedJob?.title || selectedDrive?.tradesAllowed[0] || "Applicant";
    const candidateCountry = targetCountry || selectedJob?.country || selectedDrive?.countryDestination || "Overseas";
    const candidateRemarks = remarks.trim() || (selectedJob ? ("Applied online for " + (selectedJob.title || "Job")) : "Applied online through TICE portal");
    const now = new Date().toISOString();

    const candidatePayload = {
      id: passportClean,
      token: cleanToken,
      name: candidateName,
      fullName: candidateName,
      passportNumber: passportClean,
      trade: candidateTrade,
      country: candidateCountry,
      targetCountry: candidateCountry,
      currentStage: 1,
      stageName: "Application Registered",
      remarks: candidateRemarks,
      appliedDate: now,
      createdAt: now,
      updatedAt: now,
      phone: phone.trim(),
      interviewCity: interviewCity || 'Delhi'
    };

    try {
      // 1. Direct Firestore write to candidates collection using standardized schema
      await setDoc(doc(db, "candidates", passportClean), sanitizeFirestorePayload(candidatePayload), { merge: true }).catch(err => {
        console.warn("Direct Firestore candidates write warning:", err);
      });
      if (cleanToken !== passportClean) {
        await setDoc(doc(db, "candidates", cleanToken), sanitizeFirestorePayload(candidatePayload), { merge: true }).catch(() => null);
      }

      // 2. Also save a reference into enquiries collection
      const enqId = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
      const enquiryPayload = {
        id: enqId,
        type: "Job Application",
        fullName: candidateName,
        phone: phone.trim(),
        email: "",
        locationOrCountry: candidateCountry,
        tradesOrSubject: candidateTrade,
        headcount: 1,
        message: `${candidateRemarks} [Passport: ${passportClean}, Token: ${cleanToken}]`,
        status: "New",
        createdAt: now,
        updatedAt: now
      };
      await setDoc(doc(db, "enquiries", enqId), sanitizeFirestorePayload(enquiryPayload), { merge: true }).catch(() => null);

      // 3. Keep local cache and background handlers synchronized
      const data = await apiSubmitApplication({
        fullName: candidateName,
        phone: phone.trim(),
        passportNumber: passportClean,
        trade: candidateTrade,
        targetCountry: candidateCountry,
        interviewCity,
        customToken: cleanToken,
        remarks: candidateRemarks
      });

      setSubmittedData({
        id: cleanToken,
        passportNumber: passportClean,
        rawPassport: passportClean
      });
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackNow = () => {
    if (submittedData && onRegisteredSuccess) {
      onRegisteredSuccess(submittedData.rawPassport || submittedData.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto relative text-slate-900 dark:text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedData ? (
          /* SUCCESS STATE */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                Registration Confirmed
              </span>
              <h3 className="text-2xl font-black text-[#0F2444] dark:text-white mt-1 font-['Space_Grotesk']">
                Application Successfully Logged!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Your candidate registration is recorded in the TICE central database and dispatched to the processing queue.
              </p>
            </div>

            {/* Token Badge */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-950 border border-amber-200 dark:border-amber-500/30 inline-block text-left w-full">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>Application Token ID:</span>
                <span className="font-mono text-blue-700 dark:text-sky-400 font-bold">Stage 1: Application Review</span>
              </div>
              <div className="text-2xl font-mono font-black text-[#0F2444] dark:text-amber-400 tracking-wider">
                {submittedData.id}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Passport No: <strong className="text-slate-800 dark:text-slate-200 font-mono">{submittedData.passportNumber}</strong>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowWalkInPass(true)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Generate Walk-in Pass / Interview Slip</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleTrackNow}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Track Live Status in Portal
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-500/30 px-2.5 py-0.5 rounded-full">
                MEA Verified Candidate Gateway
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F2444] dark:text-white mt-1.5 font-['Space_Grotesk']">
                {selectedDrive ? 'Register for Walk-In Drive' : 'Overseas Job Application'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your genuine passport details. Your record will be assigned a unique tracking token.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (As on Passport) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar Verma"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Phone & Passport row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Passport Number *
                    </label>
                    {passportNumber.trim() && (
                      <span className={`text-[10px] font-semibold ${
                        PASSPORT_REGEX.test(passportNumber.trim().toUpperCase())
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : passportNumber.length === 8
                          ? 'text-rose-500'
                          : 'text-slate-400'
                      }`}>
                        {PASSPORT_REGEX.test(passportNumber.trim().toUpperCase())
                          ? '✓ Valid Passport Format'
                          : `${passportNumber.length}/8 chars`}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={8}
                      pattern="^[A-Za-z][0-9]{7}$"
                      title="1 letter followed by 7 digits (e.g. P1234567)"
                      value={passportNumber}
                      onChange={(e) => {
                        setPassportNumber(e.target.value.toUpperCase().replace(/\s/g, ''));
                        if (error) setError(null);
                      }}
                      placeholder="e.g. P1234567"
                      className={`w-full bg-slate-50 dark:bg-slate-950 border ${
                        passportNumber.length === 8 && !PASSPORT_REGEX.test(passportNumber.trim().toUpperCase())
                          ? 'border-rose-400 dark:border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-amber-500/20'
                      } rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 text-xs uppercase`}
                    />
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                    <span>Format: 1 letter followed by 7 digits (e.g. P1234567)</span>
                    <span className="hidden sm:inline">🔒 Protected</span>
                  </p>
                </div>
              </div>

              {/* Trade & Target Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Trade / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    placeholder="e.g. 6G Welder / Logistics Driver"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Destination *
                  </label>
                  <select
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-none text-xs"
                  >
                    <option value="Russia">Russia</option>
                    <option value="Oman">Oman</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Europe">Europe</option>
                  </select>
                </div>
              </div>

              {/* Interview City */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Interview / Trade Test City *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Delhi', 'Mumbai', 'Gorakhpur'].map((city) => (
                    <button
                      type="button"
                      key={city}
                      onClick={() => setInterviewCity(city)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        interviewCity === city
                          ? 'bg-[#0F2444] dark:bg-amber-500 text-white dark:text-slate-950 border-[#0F2444] dark:border-amber-400'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Experience / Remarks
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. 3 years GCC experience with valid heavy driving license."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Submitting Registration...' : 'Submit Application & Generate Token'}
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                Official registration under MEA License B-0613/DEL/COM/1000+/5/5374/1999
              </p>
            </form>
          </div>
        )}

      </div>

      {showWalkInPass && submittedData && (
        <WalkInPassModal
          isOpen={showWalkInPass}
          onClose={() => setShowWalkInPass(false)}
          data={{
            candidateName: fullName || 'Candidate',
            passportNumber: submittedData.rawPassport || submittedData.passportNumber,
            tokenId: submittedData.id,
            trade: trade,
            targetCountry: targetCountry,
            reportingDate: 'Monday - Friday (09:30 AM - 01:00 PM)',
            reportingTime: 'Morning Batch (Slot A)',
            venue: 'Janakpuri Test Center, New Delhi (TICE Overseas Skill Testing Complex, B-1/16, Community Centre, Janakpuri, New Delhi - 110058)'
          }}
        />
      )}
    </div>
  );
};
