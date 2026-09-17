import React, { useState, useEffect } from 'react';
import { X, Building2, Mail, Phone, Users, Globe2, CheckCircle2, Shield, Loader2, Send, Tag, Briefcase } from 'lucide-react';
import { apiSubmitEnquiry } from '../services/apiService';

interface EmployerEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

const AVAILABLE_TRADES = [
  "Drivers (Light / Heavy / Van)",
  "6G / 3G Welders",
  "Civil Masons & Tile Layers",
  "Electricians & MEP Techs",
  "Warehouse & Logistics Staff",
  "HVAC & Refrigeration Techs",
  "Pipe Fitters & Fabricators",
  "Scaffolders & Riggers"
];

const DESTINATION_COUNTRIES = [
  "Oman",
  "Russia",
  "Qatar",
  "Saudi Arabia",
  "Kuwait",
  "United Arab Emirates",
  "Bahrain",
  "Europe (Poland / Germany)"
];

export const EmployerEnquiryModal: React.FC<EmployerEnquiryModalProps> = ({ isOpen, onClose, onSuccessToast }) => {
  const [companyName, setCompanyName] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('Oman');
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTrades, setSelectedTrades] = useState<string[]>(["6G / 3G Welders", "Drivers (Light / Heavy / Van)"]);
  const [customTrade, setCustomTrade] = useState('');
  const [headcount, setHeadcount] = useState<number | ''>(50);
  const [projectRequirements, setProjectRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTrade = (trade: string) => {
    if (selectedTrades.includes(trade)) {
      setSelectedTrades(selectedTrades.filter(t => t !== trade));
    } else {
      setSelectedTrades([...selectedTrades, trade]);
    }
  };

  const handleAddCustomTrade = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      e.preventDefault();
      if (customTrade.trim() && !selectedTrades.includes(customTrade.trim())) {
        setSelectedTrades([...selectedTrades, customTrade.trim()]);
        setCustomTrade('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim() || !phone.trim() || !headcount) {
      setError('Please fill in all mandatory fields (Company Name, Contact Person, Phone, and Headcount).');
      return;
    }

    if (selectedTrades.length === 0) {
      setError('Please select at least one trade category for the workforce quota.');
      return;
    }

    setLoading(true);
    setError(null);

    const messageCombined = [
      designation ? `Designation: ${designation}` : '',
      projectRequirements ? `Project Details & Duration:\n${projectRequirements}` : ''
    ].filter(Boolean).join('\n\n');

    try {
      const result = await apiSubmitEnquiry({
        type: "Workforce Quota Request",
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        fullName: contactPerson.trim(),
        designation: designation.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        destinationCountry,
        locationOrCountry: `${destinationCountry}`,
        requiredTrades: selectedTrades,
        tradesOrSubject: selectedTrades.join(', '),
        headcount: Number(headcount),
        message: messageCombined
      });

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to submit workforce quota request');
      }

      setLoading(false);
      setSubmitted(true);

      if (onSuccessToast) {
        onSuccessToast(`Workforce quota demand for ${companyName} (${headcount} positions) submitted successfully!`);
      }
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check network.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="b2b-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                Workforce Quota Request Logged
              </span>
              <h3 className="text-2xl font-black text-[#0F2444] dark:text-white mt-1 font-['Space_Grotesk']">
                Thank You, {contactPerson}!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                Our Overseas Client Operations Director will review your manpower demand for <strong className="text-slate-800 dark:text-slate-200">{companyName}</strong> ({headcount} positions in {destinationCountry}) and issue an official mobilization proposal within 4 hours.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 text-left">
              <div><strong className="text-slate-900 dark:text-slate-100">Company:</strong> {companyName}</div>
              <div><strong className="text-slate-900 dark:text-slate-100">Project Destination:</strong> {destinationCountry}</div>
              <div><strong className="text-slate-900 dark:text-slate-100">Requested Quota:</strong> {headcount} Workers</div>
              <div><strong className="text-slate-900 dark:text-slate-100">Trades:</strong> {selectedTrades.join(', ')}</div>
              <div className="text-amber-600 dark:text-amber-400 text-[11px]"><strong>Official MEA Channel:</strong> Direct Government Licensed Processing (B-0613/DEL/COM/1000+/5/5374/1999)</div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-[#0F2444] dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs hover:bg-[#1A3660] dark:hover:bg-amber-400 transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-5 pr-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Shield className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>B2B Overseas Manpower Requisition</span>
              </div>
              <h2 id="b2b-modal-title" className="text-2xl font-bold text-[#0F2444] dark:text-white font-['Space_Grotesk'] tracking-tight">
                Request Workforce Quota
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Source pre-screened, trade-tested Indian technical &amp; logistics workforce for GCC, Russia &amp; European mega projects.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Company & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Al-Mansoor Group"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Destination Country <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition font-medium"
                    >
                      {DESTINATION_COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <Globe2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Contact Person & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Eng. Tariq Al-Harthy"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation / Title
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Project Director / HR Head"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Corporate Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tariq@almansoor-om.com"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp / Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+968 9123 4567"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition font-mono"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Required Trades (Multi-select Tag Chips) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Required Trades (Select all that apply) <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {AVAILABLE_TRADES.map(trade => {
                    const isSelected = selectedTrades.includes(trade);
                    return (
                      <button
                        type="button"
                        key={trade}
                        onClick={() => toggleTrade(trade)}
                        className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#0F2444] dark:bg-amber-500 text-white dark:text-slate-950 border-[#0F2444] dark:border-amber-400 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{trade}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Trade */}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customTrade}
                    onChange={(e) => setCustomTrade(e.target.value)}
                    onKeyDown={handleAddCustomTrade}
                    placeholder="Other trade (e.g. CNC Operator, Crane Driver) + press Enter"
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-1.5 px-3 text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTrade}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Total Headcount / Quota */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Total Headcount / Quota Required <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={1}
                    max={5000}
                    value={headcount}
                    onChange={(e) => setHeadcount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g. 50, 150, 300"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition font-mono font-bold"
                  />
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
                <div className="flex gap-2 mt-1.5">
                  {[25, 50, 100, 250, 500].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setHeadcount(n)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition ${
                        headcount === n ? 'bg-amber-400 text-slate-950 border-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {n} Pax
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Duration & Requirements */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Project Duration &amp; Special Requirements
                </label>
                <textarea
                  rows={3}
                  value={projectRequirements}
                  onChange={(e) => setProjectRequirements(e.target.value)}
                  placeholder="e.g. 2-Year EPC contract for Duqm Refinery. Client trade testing team visiting Delhi on 15th next month. Food & accommodation provided."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl p-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition leading-relaxed resize-none"
                />
              </div>

              {/* MEA Unlimited License Assurance */}
              <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Government MEA Unlimited 1000+ Capacity
                </span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">Response &lt; 4 Hrs</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Transmitting Quota Requisition...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Quota Demand to TICE Overseas Board</span>
                  </>
                )}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
