/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TopBar } from './components/TopBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { JobBoard } from './components/JobBoard';
import { CareerGuidance } from './components/CareerGuidance';
import { InterviewCalendar } from './components/InterviewCalendar';
import { InfrastructureShowcase } from './components/InfrastructureShowcase';
import { TestimonialsAndStats } from './components/TestimonialsAndStats';
import { Footer } from './components/Footer';
import { LicenseVerificationModal } from './components/LicenseVerificationModal';
import { ApplicationModal } from './components/ApplicationModal';
import { EmployerEnquiryModal } from './components/EmployerEnquiryModal';
import { ContactModal } from './components/ContactModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { Preloader } from './components/Preloader';
import { CheckCircle2, X } from 'lucide-react';
import { Language } from './translations';
import { Job, InterviewDrive } from './types';

export default function App() {
  const [lang, setLang] = useState<Language>('en');

  // Modal States
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isEmployerOpen, setIsEmployerOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  // Synchronize hash & path routes (e.g. /admin or #admin)
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (hash === '#admin' || path.includes('/admin')) {
        setIsAdminOpen(true);
      } else if (hash === '#license' || hash === '#certificate') {
        setIsLicenseOpen(true);
      } else if (hash === '#contact') {
        setIsContactOpen(true);
      } else if (hash === '#hire' || hash === '#employer') {
        setIsEmployerOpen(true);
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);
  
  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 6000);
  };
  
  // Selected context for application modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedDrive, setSelectedDrive] = useState<InterviewDrive | null>(null);

  // Controlled tracker trigger from application success
  const [prefilledPassport, setPrefilledPassport] = useState<string | null>(null);

  // JobBoard filter synchronization from hero or drives
  const [filterTrade, setFilterTrade] = useState<string>('All');
  const [filterCountry, setFilterCountry] = useState<string>('All');

  // Triggered when candidate applies from job board
  const handleApplyJob = (job: Job) => {
    setSelectedJob(job);
    setSelectedDrive(null);
    setIsApplicationOpen(true);
  };

  // Triggered when candidate registers for a walk-in drive
  const handleRegisterDrive = (drive: InterviewDrive) => {
    setSelectedDrive(drive);
    setSelectedJob(null);
    setIsApplicationOpen(true);
  };

  // Triggered when candidate clicks drive trade badge in hero
  const handleSelectDriveTrade = (trade: string, country: string) => {
    setUserMode('seeker');
    setFilterTrade(trade);
    setFilterCountry(country);
    document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Triggered when candidate successfully submits application and clicks "Track Now"
  const handleApplicationSuccess = (passport: string) => {
    setPrefilledPassport(passport);
    const trackerEl = document.getElementById('passport-tracker-card');
    if (trackerEl) {
      trackerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [userMode, setUserMode] = useState<'seeker' | 'employer'>('seeker');

  const handleToggleMode = (mode: 'seeker' | 'employer') => {
    setUserMode(mode);
    if (mode === 'employer') {
      const employerSection = document.getElementById('infrastructure') || document.getElementById('sectors');
      employerSection?.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToJobs = () => {
    setUserMode('seeker');
    document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
        {/* High-End Brand Preloader Screen */}
        <Preloader />
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div 
          id="global-success-toast"
          className="fixed top-6 right-6 z-50 max-w-md w-full bg-emerald-950/95 border border-emerald-500/50 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3.5 animate-in slide-in-from-top-4 duration-300"
          role="status"
          aria-live="polite"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
            {toastMessage}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/50 transition cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Official MEA & Language Top Bar */}
      <TopBar 
        lang={lang} 
        setLang={setLang}
        onOpenLicense={() => setIsLicenseOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 2. Navigation Header */}
      <Navbar 
        lang={lang}
        userMode={userMode}
        onToggleMode={handleToggleMode}
        onOpenHireModal={() => setIsEmployerOpen(true)}
        onOpenContactModal={() => setIsContactOpen(true)}
        onOpenLicense={() => setIsLicenseOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onScrollToJobs={handleScrollToJobs}
      />

      {/* 3. Hero Section with Live Passport & Visa Tracker */}
      <HeroSection 
        lang={lang}
        onScrollToJobs={handleScrollToJobs}
        onOpenLicense={() => setIsLicenseOpen(true)}
        prefilledPassport={prefilledPassport}
        onSelectDriveTrade={handleSelectDriveTrade}
      />

      {/* 4. Active Overseas Jobs Board */}
      <JobBoard 
        lang={lang}
        onApplyJob={handleApplyJob}
        filterTrade={filterTrade}
        filterCountry={filterCountry}
      />

      {/* 5. Career Guidance & Interview Preparation Tips */}
      <CareerGuidance 
        lang={lang}
      />

      {/* 6. Client Walk-In Interview Calendar */}
      <InterviewCalendar 
        lang={lang}
        onRegisterDrive={handleRegisterDrive}
      />

      {/* 6. Technical Infrastructure & Trade Testing Facilities */}
      <InfrastructureShowcase 
        lang={lang}
        onOpenHireModal={() => setIsEmployerOpen(true)}
      />

      {/* 7. Client Testimonials & Social Proof */}
      <TestimonialsAndStats 
        lang={lang}
      />

      {/* 8. Comprehensive Footer with MEA Compliance Disclaimers */}
      <Footer 
        lang={lang}
        onOpenLicense={() => setIsLicenseOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenHireModal={() => setIsEmployerOpen(true)}
        onScrollToTop={handleScrollToTop}
      />

      {/* =========================================
          MODALS & OVERLAYS (Conditionally Mounted)
         ========================================= */}
      
      {/* MEA Registration Certificate Verification */}
      {isLicenseOpen && (
        <LicenseVerificationModal 
          isOpen={isLicenseOpen}
          onClose={() => setIsLicenseOpen(false)}
        />
      )}

      {/* Candidate Job Application & Drive Pre-registration */}
      {isApplicationOpen && (
        <ApplicationModal 
          isOpen={isApplicationOpen}
          onClose={() => {
            setIsApplicationOpen(false);
            setSelectedJob(null);
            setSelectedDrive(null);
          }}
          selectedJob={selectedJob}
          selectedDrive={selectedDrive}
          onRegisteredSuccess={handleApplicationSuccess}
        />
      )}

      {/* B2B Hire Manpower Requisition */}
      {isEmployerOpen && (
        <EmployerEnquiryModal 
          isOpen={isEmployerOpen}
          onClose={() => setIsEmployerOpen(false)}
          onSuccessToast={showToast}
        />
      )}

      {/* Candidate / General Contact Modal */}
      {isContactOpen && (
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          lang={lang}
          onSuccessToast={showToast}
        />
      )}

      {/* Admin Management Portal & API Explorer */}
      {isAdminOpen && (
        <AdminPortalModal 
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onJobsUpdated={() => {
            window.dispatchEvent(new Event('jobsUpdated'));
          }}
          onTestTracker={(passport) => {
            setIsAdminOpen(false);
            handleApplicationSuccess(passport);
          }}
        />
      )}

      {/* Floating WhatsApp Action Button for Quick Overseas Support */}
      <FloatingWhatsAppButton lang={lang} />

    </div>
    </ThemeProvider>
  );
}
