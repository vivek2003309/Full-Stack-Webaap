import React from 'react';
import { 
  Globe, 
  Wrench, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck2, 
  ExternalLink,
  Lock,
  ArrowUp
} from 'lucide-react';
import { Language, translations } from '../translations';
import { MinistryComplianceBar } from './MinistryComplianceBar';

interface FooterProps {
  lang: Language;
  onOpenLicense: () => void;
  onOpenAdmin: () => void;
  onScrollToTop: () => void;
  onOpenContact?: () => void;
  onOpenHireModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  lang, 
  onOpenLicense, 
  onOpenAdmin, 
  onScrollToTop,
  onOpenContact,
  onOpenHireModal
}) => {
  const t = translations[lang];

  return (
    <>
      <MinistryComplianceBar 
        lang={lang}
        onOpenLicense={onOpenLicense}
        onOpenContact={onOpenContact}
      />
      <footer id="contact" className="bg-[#09172B] text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Anti-Fraud Disclaimer Banner */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-5 mb-14 text-amber-200 text-xs flex flex-col md:flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-bold text-sm text-amber-300 mb-0.5">
              Official Anti-Fraud & Sub-Agent Advisory
            </h4>
            <p className="text-amber-200/90 leading-relaxed">
              {t.footerDisclaimer}
            </p>
          </div>
          <button
            onClick={onOpenLicense}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shrink-0 hover:bg-amber-400 transition cursor-pointer"
          >
            Verify RC Certificate
          </button>
        </div>

        {/* 4-Column Footer Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          
          {/* Col 1: Brand & MEA Seal */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold text-white font-['Space_Grotesk']">TICE</span>
                <p className="text-xs font-semibold text-slate-200 leading-tight">Trehan International</p>
                <p className="text-[10px] text-amber-400/90 leading-tight">त्रेहन इंटरनेशनल कंसल्टेंट्स &amp; इंजीनियर्स</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Premier overseas recruitment and engineering manpower consultancy established in 1999, licensed under the Emigration Act 1983 by the Ministry of External Affairs (MEA), Government of India.
            </p>

            {/* Operating Hours Badge */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Business Hours:</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-tight font-medium">
                Monday – Saturday: Opens 10:00 AM
              </p>
              <p className="text-rose-400/90 text-[10px]">
                Closed on Sundays &amp; National Holidays
              </p>
            </div>

            <div className="pt-1">
              <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 w-full">
                <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">RC: B-0613/DEL/COM/1000+/5/5374/1999</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Status: Active &amp; Valid (1000+ Capacity)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Head Office & Branches */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Office Locations
            </h4>

            {/* Delhi HQ */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-1.5 shadow-sm">
              <div className="font-bold text-amber-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>New Delhi (Corporate HQ)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  HQ
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed font-medium">
                Unit No. UG-1 &amp; 2, Westend Mall, Janakpuri District Center, Janakpuri, New Delhi, Delhi, 110058
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                <span className="text-amber-300/90">Plus Code:</span>
                <span>J3HH+VV New Delhi, Delhi</span>
              </div>
            </div>

            {/* Mumbai Branch */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Mumbai Trade Testing Centre</span>
              </div>
              <p className="text-slate-400 pl-5 leading-relaxed">
                Plot 14-B, Near MIDC Andheri East, Mumbai, Maharashtra - 400093
              </p>
            </div>

            {/* Gorakhpur Branch */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Gorakhpur Branch</span>
              </div>
              <p className="text-slate-400 pl-5 leading-relaxed">
                Hotel Royal Residency Complex, University Road, Gorakhpur, UP - 273009
              </p>
            </div>
          </div>

          {/* Col 3: Direct Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Official Helpline &amp; Map
            </h4>

            <div className="space-y-2">
              {onOpenContact && (
                <button
                  id="btn-footer-open-contact"
                  onClick={onOpenContact}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer text-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send Direct Enquiry</span>
                </button>
              )}

              {/* Primary Calling Line */}
              <a 
                id="footer-primary-phone"
                href="tel:+919910044590" 
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-400 border border-slate-800 transition group"
              >
                <Phone className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Primary Calling Line</span>
                  <span className="font-bold font-mono text-xs text-white group-hover:text-amber-400">+91 99100 44590</span>
                </div>
              </a>

              {/* Official WhatsApp Hotline */}
              <a 
                id="footer-whatsapp-hotline"
                href="https://wa.me/919910044590" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-200 border border-emerald-500/30 transition group"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
                  <span className="text-[10px]">W</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">WhatsApp Hotline</span>
                  <span className="font-bold font-mono text-xs text-emerald-200">+91 99100 44590</span>
                </div>
              </a>

              <a 
                href="mailto:recruitment@trehaninternational.com" 
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">recruitment@trehaninternational.com</span>
              </a>
            </div>

            {/* Interactive Google Map Embed with Directions Button */}
            <div className="pt-1">
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 relative shadow-sm">
                <iframe
                  title="Trehan International New Delhi Office Map"
                  src="https://maps.google.com/maps?q=Westend+Mall+Janakpuri+District+Centre+New+Delhi+Delhi+110058&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="110"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full opacity-90 hover:opacity-100 transition-opacity"
                ></iframe>
                <div className="p-2 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-300 truncate">
                    <span className="font-bold text-white">Westend Mall, Janakpuri</span>
                  </div>
                  <a
                    id="btn-footer-get-directions"
                    href="https://maps.google.com/?q=Unit+No.+UG-1+%26+2+Westend+Mall+Janakpuri+District+Center+New+Delhi+Delhi+110058"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shrink-0 inline-flex items-center gap-1 transition"
                  >
                    <MapPin className="w-2.5 h-2.5" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Portals & Administration */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Portals & Services
            </h4>

            <ul className="space-y-2">
              <li>
                <a href="#jobs" className="hover:text-amber-400 transition flex items-center justify-between">
                  <span>Overseas Job Board</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="#drives-calendar" className="hover:text-amber-400 transition flex items-center justify-between">
                  <span>Client Interview Calendar</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="#passport-tracker-card" className="hover:text-amber-400 transition flex items-center justify-between">
                  <span>Passport & Visa Tracker</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="#infrastructure" className="hover:text-amber-400 transition flex items-center justify-between">
                  <span>Trade Testing Facilities</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <button 
                  onClick={onOpenLicense} 
                  className="hover:text-amber-400 transition flex items-center justify-between w-full text-left"
                >
                  <span>MEA Govt. License Verification</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </li>
              <li className="pt-3 border-t border-slate-800">
                <button
                  id="btn-footer-admin-login"
                  onClick={onOpenAdmin}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Management Console</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & MEA stamp */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Trehan International Consultants & Engineers (TICE). All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <button 
              onClick={onOpenLicense}
              className="hover:text-slate-300 transition"
            >
              Privacy Policy & MEA Disclosures
            </button>
            <span>•</span>
            <button
              onClick={onScrollToTop}
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 transition"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Creator Credit Line */}
        <div className="mt-4 pt-4 border-t border-slate-800/60 text-center text-xs text-slate-400">
          <p>
            Designed &amp; Developed by{' '}
            <a
              id="link-creator-credit"
              href="https://wa.me/918929194345?text=Hi%20Vivek,%20I%20saw%20the%20Trehan%20International%20website%20you%20built%20and%20wanted%20to%20connect."
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 hover:text-amber-400 hover:underline transition-colors cursor-pointer"
            >
              Vivek Verma
            </a>
          </p>
        </div>

      </div>
    </footer>
    </>
  );
};
