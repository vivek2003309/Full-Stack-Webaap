import React, { useState } from 'react';
import { X, Send, Phone, Mail, MapPin, MessageSquare, CheckCircle2, Shield, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { Language } from '../translations';
import { apiSubmitEnquiry } from '../services/apiService';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onSuccessToast?: (msg: string) => void;
}

const ENQUIRY_TYPES = [
  "Job Inquiry",
  "Passport/Visa Verification",
  "Interview Schedule",
  "General Query"
] as const;

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSuccessToast }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [enquiryType, setEnquiryType] = useState<string>("Job Inquiry");
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !city.trim()) {
      setError('Please fill in all required fields (Full Name, Phone Number, City/Location).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiSubmitEnquiry({
        type: "Contact Enquiry",
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        tradesOrSubject: enquiryType,
        enquiryType,
        locationOrCountry: city.trim(),
        city: city.trim(),
        message: message.trim() || undefined
      });

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to submit enquiry');
      }

      // Reset form
      setFullName('');
      setPhone('');
      setEmail('');
      setEnquiryType('Job Inquiry');
      setCity('');
      setMessage('');
      setLoading(false);
      onClose();

      if (onSuccessToast) {
        onSuccessToast(result.message || "Enquiry submitted successfully! Our Janakpuri desk will contact you shortly.");
      }
    } catch (err: any) {
      setError(err.message || 'Submission error. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Government MEA Approved Helpdesk</span>
          </div>
          <h2 id="contact-modal-title" className="text-2xl font-bold text-[#0F2444] dark:text-white font-['Space_Grotesk'] tracking-tight">
            Contact &amp; Enquiry Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Have a question about overseas vacancies, client interview drives, or visa status? Submit your details for immediate assistance from our New Delhi headquarters.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar Verma"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 px-3.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
            />
          </div>

          {/* Contact Row: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Enquiry Type & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enquiry Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={enquiryType}
                onChange={(e) => setEnquiryType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition font-medium"
              >
                {ENQUIRY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                City / Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Gorakhpur, Delhi, Patna"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Message / Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Message / Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your trade qualification, GCC experience, passport type (ECR/ECNR), or specific question..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl p-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition leading-relaxed resize-none"
            />
          </div>

          {/* Trust badges */}
          <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              No sub-agents • 100% Direct MEA Office
            </span>
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">Response: &lt; 4 Hrs</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Submitting Enquiry...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Enquiry to Janakpuri Desk</span>
              </>
            )}
          </button>
        </form>

        {/* Footnote */}
        <div className="mt-3 text-center text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
          <div>Unit No. UG-1 &amp; 2, Westend Mall, Janakpuri District Center, New Delhi - 110058</div>
          <div>
            Direct Helpline: <a href="tel:+919910044590" className="text-amber-600 dark:text-amber-400 underline font-semibold">+91 99100 44590</a> • Mon–Sat: Opens 10:00 AM
          </div>
        </div>

      </div>
    </div>
  );
};
