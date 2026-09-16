import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Briefcase, FileCheck, Building2, HelpCircle, PhoneCall, Sparkles, CheckCircle2 } from 'lucide-react';
import { Language } from '../translations';

interface FloatingWhatsAppButtonProps {
  lang: Language;
  defaultPhoneNumber?: string;
}

const SUPPORT_PRESETS = {
  en: [
    {
      id: 'jobs',
      icon: Briefcase,
      title: 'Job Vacancies & Walk-in Drives',
      subtitle: 'Apply for Gulf, Russia & Europe vacancies',
      query: 'Hello TICE Team, I want information regarding current overseas job vacancies and upcoming walk-in interview drives.'
    },
    {
      id: 'tracker',
      icon: FileCheck,
      title: 'Passport & Visa Application Status',
      subtitle: 'Check biometric & embassy visa progress',
      query: 'Hello TICE Support, I need assistance checking my passport/visa application processing stage.'
    },
    {
      id: 'employer',
      icon: Building2,
      title: 'Employer Workforce Quota Request',
      subtitle: 'B2B overseas manpower recruitment',
      query: 'Hello TICE Overseas Board, I represent a company and would like to request manpower requisition details.'
    },
    {
      id: 'general',
      icon: HelpCircle,
      title: 'General Helpdesk & Janakpuri HQ',
      subtitle: 'Office timings, documents & guidance',
      query: 'Hello TICE Janakpuri Helpdesk, I need general guidance regarding certified overseas employment.'
    }
  ],
  hi: [
    {
      id: 'jobs',
      icon: Briefcase,
      title: 'विदेश नौकरी एवं वॉक-इन इंटरव्यू',
      subtitle: 'रूस, खाड़ी देश और यूरोप की रिक्तियां',
      query: 'नमस्ते त्रेहन टीम, मुझे वर्तमान विदेश नौकरी रिक्तियों और वॉक-इन इंटरव्यू की जानकारी चाहिए।'
    },
    {
      id: 'tracker',
      icon: FileCheck,
      title: 'पासपोर्ट एवं वीजा स्टेटस सहायता',
      subtitle: 'बायोमेट्रिक और दूतावास वीजा प्रगति',
      query: 'नमस्ते त्रेहन सपोर्ट, मुझे अपने पासपोर्ट/वीजा आवेदन की स्थिति जानने में सहायता चाहिए।'
    },
    {
      id: 'employer',
      icon: Building2,
      title: 'नियोक्ता कार्यबल कोटा (B2B Quota)',
      subtitle: 'भारतीय कुशल मैनपावर भर्ती मांग',
      query: 'नमस्ते त्रेहन इंटरनेशनल, मुझे अपनी कंपनी के लिए मैनपावर कोटा और भर्ती प्रक्रिया की जानकारी चाहिए।'
    },
    {
      id: 'general',
      icon: HelpCircle,
      title: 'सामान्य पूछताछ एवं जनकपुरी कार्यालय',
      subtitle: 'समय, आवश्यक दस्तावेज एवं मार्गदर्शन',
      query: 'नमस्ते त्रेहन टीम, मुझे विदेश रोजगार प्रक्रिया के संबंध में सामान्य मार्गदर्शन चाहिए।'
    }
  ]
};

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  lang,
  defaultPhoneNumber = '919910044590'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  const presets = SUPPORT_PRESETS[lang] || SUPPORT_PRESETS.en;

  // Handle clicking outside to close the quick chat popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const openWhatsApp = (messageText: string) => {
    const encoded = encodeURIComponent(messageText);
    const url = `https://wa.me/${defaultPhoneNumber}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowNotificationBadge(false);
    setIsOpen(false);
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMsg.trim()) {
      openWhatsApp(customMsg.trim());
      setCustomMsg('');
    } else {
      openWhatsApp('Hello TICE Support Team, I need assistance regarding overseas recruitment.');
    }
  };

  return (
    <div
      ref={popoverRef}
      id="floating-whatsapp-container"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-auto"
      aria-label="WhatsApp Support Button"
    >
      {/* Quick Access Popover Card */}
      {isOpen && (
        <div
          id="whatsapp-quick-menu"
          className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-slate-800"
          role="dialog"
          aria-modal="true"
          aria-labelledby="whatsapp-support-header"
        >
          {/* Card Header (WhatsApp Green Gradient) */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 p-4 text-white relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-700/50 transition cursor-pointer"
              aria-label="Close WhatsApp menu"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-inner">
                  {/* Official style WhatsApp SVG */}
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.94 0.812 2.796.812 3.179 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.998-5.767-5.998zm7.394 5.764c0 4.079-3.317 7.397-7.394 7.397-.001 0-.001 0 0 0-.002 0-.002 0 0 0-1.229 0-2.428-.31-3.488-.897l-4.543 1.192 1.216-4.428c-.657-1.129-1.005-2.426-1.005-3.764 0-4.078 3.318-7.396 7.397-7.396 4.078 0 7.397 3.318 7.397 7.396z" />
                  </svg>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-emerald-600 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                </span>
              </div>

              <div>
                <h3 id="whatsapp-support-header" className="font-bold text-sm font-['Space_Grotesk'] text-white">
                  Trehan Overseas Support Desk
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
                  <span>Direct MEA Helpdesk • Online Now</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-emerald-50/90 mt-2.5 leading-relaxed bg-emerald-700/30 p-2 rounded-xl border border-emerald-400/20">
              {lang === 'hi'
                ? 'नमस्कार! हम आपकी क्या सहायता कर सकते हैं? नीचे दिए गए विकल्प चुनें या सीधे संदेश भेजें।'
                : 'Hello! How can we assist you today? Choose a quick topic or message our official desk directly.'}
            </p>
          </div>

          {/* Quick Presets List */}
          <div className="p-3 bg-slate-50 space-y-1.5 max-h-60 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 pb-1">
              {lang === 'hi' ? 'त्वरित सहायता विकल्प' : 'Quick Inquiry Topics'}
            </div>

            {presets.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => openWhatsApp(item.query)}
                  className="w-full text-left p-2.5 rounded-2xl bg-white hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-300 transition-all duration-150 flex items-center gap-3 group cursor-pointer shadow-2xs hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-950 truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-500 group-hover:text-emerald-700 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                  <Send className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 shrink-0 -translate-x-1 group-hover:translate-x-0 transition-transform" />
                </button>
              );
            })}
          </div>

          {/* Custom Message Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form onSubmit={handleCustomSend} className="flex gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder={lang === 'hi' ? 'कस्टम मैसेज लिखें...' : 'Type a custom question...'}
                className="flex-1 bg-slate-100 border border-slate-300 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0 shadow-xs"
                title="Send on WhatsApp"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'hi' ? 'भेजें' : 'Send'}</span>
              </button>
            </form>

            <div className="mt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Direct WhatsApp Line: +91 99100 44590</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-2 group">
        {/* Expanded Desktop Hover Label Pill */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 py-2 px-3.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700/80 backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer opacity-90 group-hover:opacity-100"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{lang === 'hi' ? 'व्हाट्सएप सहायता' : 'WhatsApp Support'}</span>
          </button>
        )}

        {/* Circular Action Button */}
        <button
          id="btn-floating-whatsapp"
          onClick={() => {
            setIsOpen(!isOpen);
            setShowNotificationBadge(false);
          }}
          className={`relative w-14 h-14 sm:w-15 sm:h-15 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
            isOpen
              ? 'bg-slate-900 text-white hover:bg-slate-800 rotate-90 scale-95'
              : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-emerald-400 text-white hover:scale-110 shadow-emerald-500/30 ring-4 ring-emerald-500/20'
          }`}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={isOpen ? 'Close WhatsApp support' : 'Open WhatsApp instant support'}
          title={lang === 'hi' ? 'व्हाट्सएप पर सहायता प्राप्त करें' : 'Quick WhatsApp Support'}
        >
          {isOpen ? (
            <X className="w-6 h-6 -rotate-90 transition-transform" />
          ) : (
            <>
              {/* WhatsApp Icon */}
              <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-xs" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.94 0.812 2.796.812 3.179 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.998-5.767-5.998zm7.394 5.764c0 4.079-3.317 7.397-7.394 7.397-.001 0-.001 0 0 0-.002 0-.002 0 0 0-1.229 0-2.428-.31-3.488-.897l-4.543 1.192 1.216-4.428c-.657-1.129-1.005-2.426-1.005-3.764 0-4.078 3.318-7.396 7.397-7.396 4.078 0 7.397 3.318 7.397 7.396z" />
              </svg>

              {/* Ping Ring Effect */}
              <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping pointer-events-none -z-10"></span>

              {/* Notification Badge Dot */}
              {showNotificationBadge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center border-2 border-white shadow-xs">
                  1
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
