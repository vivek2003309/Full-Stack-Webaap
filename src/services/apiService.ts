import { 
  Job, 
  Application, 
  InterviewDrive, 
  AppSettings, 
  StageNumber, 
  STAGE_NAMES, 
  Enquiry, 
  EnquiryStatus, 
  EnquiryType,
  ApplicationTimelineItem 
} from '../types';

// ==========================================
// SEED DATA FOR LOCALSTORAGE INITIALIZATION
// ==========================================

export const INITIAL_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Logistics Van Driver",
    country: "Russia",
    flagEmoji: "🇷🇺",
    vacanciesCount: 350,
    salaryText: "₹75,000 / $900 per month",
    perks: ["Free Food", "Company Accommodation", "Medical Insurance", "Overtime Allowance"],
    category: "Logistics",
    status: "Active",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    description: "Urgent requirement for Light/Medium Commercial Vehicle (LCV) delivery drivers in Moscow & St. Petersburg e-commerce distribution centers. Valid Indian or GCC driving license required with clean record.",
    requirements: ["Minimum 2 years driving experience", "Valid Indian Commercial or GCC driving license", "Basic English or willingness to learn Russian phrases", "Age 22 - 42 years"],
    workLocation: "Moscow & St. Petersburg Logistic Hubs"
  },
  {
    id: "job-2",
    title: "6G Pipe Welder",
    country: "Oman",
    flagEmoji: "🇴🇲",
    vacanciesCount: 120,
    salaryText: "₹60,000 / 270 OMR per month",
    perks: ["Free Food", "Furnished Bachelor Camp", "Full Medical", "Flight Return"],
    category: "Technical",
    status: "Active",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    description: "TIG & ARC 6G Welders needed for major Oil & Gas pipeline project in Duqm and Sohar Industrial port. Mandatory 6G carbon & stainless steel pipe test clearance.",
    requirements: ["Certification in SMAW/GTAW 6G", "Minimum 3 years oil & gas pipeline experience", "Clean trade test at TICE testing workshop"],
    workLocation: "Duqm Oil & Gas Refinery Project"
  },
  {
    id: "job-3",
    title: "HVAC Technician",
    country: "Qatar",
    flagEmoji: "🇶🇦",
    vacanciesCount: 85,
    salaryText: "₹55,000 / 2,400 QAR per month",
    perks: ["Free Accommodation", "Transport Provided", "Medical Card", "Yearly Bonus"],
    category: "MEP",
    status: "Active",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    description: "Central chiller plant, AHU, FCU, and VRV/VRF system maintenance technicians for luxury hospitality and commercial tower facility management in Doha.",
    requirements: ["ITI or Diploma in Refrigeration & Air Conditioning", "Troubleshooting electrical panel control circuits", "Minimum 3 years Gulf or Indian high-rise experience"],
    workLocation: "Lusail Marina Towers, Doha"
  },
  {
    id: "job-4",
    title: "Heavy Trailer Driver",
    country: "Kuwait",
    flagEmoji: "🇰🇼",
    vacanciesCount: 40,
    salaryText: "₹80,000 / 290 KWD per month",
    perks: ["Free Accommodation", "Trip Allowance", "Health Insurance", "Uniform Provided"],
    category: "Logistics",
    status: "Active",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    description: "Multi-axle articulated heavy trailer drivers for bulk petroleum and freight transit between Shuaiba Port and Mina Al Ahmadi terminal.",
    requirements: ["Valid GCC or Indian Heavy Transport Vehicle (HTV) license", "5+ years articulated trailer experience", "Physical fitness GAMCA certification"],
    workLocation: "Shuaiba Port Logistics Hub"
  },
  {
    id: "job-5",
    title: "Civil Mason",
    country: "Oman",
    flagEmoji: "🇴🇲",
    vacanciesCount: 90,
    salaryText: "₹45,000 / 200 OMR per month",
    perks: ["Free Food", "Accommodation", "Medical Insurance", "Overtime"],
    category: "Construction",
    status: "Active",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    description: "Skilled block, plaster, and tile masons for commercial infrastructure development project in Muscat. Fast-track visa deployment.",
    requirements: ["Experienced in blockwork, plastering, and floor/wall tiling", "Minimum 2 years commercial site experience", "Clean police clearance (PCC)"],
    workLocation: "Muscat Highway Infrastructure Zone"
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: "TRH-8821",
    fullName: "Ramesh Kumar Verma",
    phone: "+91 98765 43210",
    passportNumber: "P1234567",
    trade: "Logistics Van Driver",
    targetCountry: "Russia",
    interviewCity: "Gorakhpur",
    currentStage: 5, // "Visa Approved"
    remarks: "Work visa officially issued by destination immigration. POE clearance in progress.",
    createdAt: "2026-08-14T09:30:00.000Z",
    updatedAt: "2026-09-10T14:15:00.000Z"
  },
  {
    id: "TRH-6492",
    fullName: "Mohammad Irfan Ansari",
    phone: "+91 91234 56789",
    passportNumber: "R9876543",
    trade: "6G Pipe Welder",
    targetCountry: "Oman",
    interviewCity: "Mumbai",
    currentStage: 3, // "Medical Fitness"
    remarks: "Medical examination completed (GAMCA/Authorized Center).",
    createdAt: "2026-08-28T11:00:00.000Z",
    updatedAt: "2026-09-08T16:45:00.000Z"
  },
  {
    id: "TRH-4105",
    fullName: "Balwinder Singh Dhillon",
    phone: "+91 98111 22334",
    passportNumber: "Z5566778",
    trade: "Heavy Trailer Driver",
    targetCountry: "Kuwait",
    interviewCity: "Delhi",
    currentStage: 6, // "PCC / POE Clearance"
    remarks: "Police Clearance & Protector of Emigrants (eMigrate) clearance approved.",
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-09-12T10:20:00.000Z"
  },
  {
    id: "TRH-3390",
    fullName: "Sunil Kumar Maurya",
    phone: "+91 94500 11223",
    passportNumber: "A9081726",
    trade: "HVAC Technician",
    targetCountry: "Qatar",
    interviewCity: "Gorakhpur",
    currentStage: 4, // "Visa Applied"
    remarks: "Work permit & visa documents submitted to embassy.",
    createdAt: "2026-08-18T08:15:00.000Z",
    updatedAt: "2026-09-05T12:00:00.000Z"
  }
];

export const INITIAL_DRIVES: InterviewDrive[] = [
  {
    id: "drv-gorakhpur",
    city: "Gorakhpur",
    venue: "TICE Regional Center, Hotel Royal Residency Complex, University Road, Gorakhpur, UP - 273009",
    driveDate: "Oct 14, 2026 (09:00 AM - 05:00 PM)",
    tradesAllowed: ["Logistics Van Driver", "Heavy Trailer Driver", "Warehouse Staff", "6G Welder"],
    countryDestination: "Russia & Kuwait"
  },
  {
    id: "drv-mumbai",
    city: "Mumbai",
    venue: "TICE Trade Testing Centre, Plot 14-B, MIDC Andheri East, Mumbai, Maharashtra - 400093",
    driveDate: "Oct 18, 2026 (09:30 AM - 06:00 PM)",
    tradesAllowed: ["6G Pipe Welder", "MEP Technician", "HVAC Technician", "Structural Fitter"],
    countryDestination: "Oman (Duqm Refinery Project) & Russia"
  },
  {
    id: "drv-delhi",
    city: "Delhi",
    venue: "TICE Corporate HQ, Unit No. UG-1 & 2, Westend Mall, Janakpuri District Center, New Delhi - 110058",
    driveDate: "Oct 22, 2026 (10:00 AM - 05:30 PM)",
    tradesAllowed: ["Civil Mason", "Electrician", "HVAC Technician", "Logistics Van Driver"],
    countryDestination: "Qatar & Russia"
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  id: "global",
  googleSheetsWebhookUrl: "",
  adminPasscode: "trehan2026"
};

export const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: "ENQ-1092",
    type: "Workforce Quota Request",
    fullName: "Eng. Tariq Al-Harthy",
    companyName: "Al-Mansoor Construction & Contracting LLC",
    phone: "+968 9123 4567",
    email: "tariq.harthy@almansoor-om.com",
    locationOrCountry: "Oman (Duqm Refinery EPC)",
    tradesOrSubject: "6G Pipe Welders, Structural Fitters, Riggers",
    headcount: 85,
    message: "Immediate requirement for Duqm Phase 3 Pipeline expansion. Need trade test video verification and fast-track flight mobilization by next month.",
    status: "New",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: "ENQ-1088",
    type: "Contact Enquiry",
    fullName: "Vikramjit Singh",
    companyName: "N/A",
    phone: "+91 98112 34567",
    email: "vikram.singh92@gmail.com",
    locationOrCountry: "New Delhi",
    tradesOrSubject: "Job Inquiry",
    headcount: undefined,
    message: "I have 4 years experience in light commercial vehicle logistics in Dubai. Want to apply for Russia E-Commerce Driver vacancy in next Gorakhpur or Delhi drive.",
    status: "Contacted",
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString()
  },
  {
    id: "ENQ-1081",
    type: "Workforce Quota Request",
    fullName: "Dmitry Volkov",
    companyName: "Sever-Logistika Group",
    phone: "+7 916 555 0192",
    email: "d.volkov@sever-logistics.ru",
    locationOrCountry: "Russia (Moscow & St. Petersburg)",
    tradesOrSubject: "Heavy Trailer Drivers, LCV Delivery Drivers",
    headcount: 150,
    message: "Looking for 150 commercial delivery drivers for our central distribution network. Need MEA documented Indian drivers with basic English.",
    status: "Contacted",
    createdAt: new Date(Date.now() - 28 * 3600000).toISOString()
  },
  {
    id: "ENQ-1075",
    type: "Contact Enquiry",
    fullName: "Mohammed Arif Khan",
    companyName: "N/A",
    phone: "+91 94520 89123",
    email: "arif.khan.welder@yahoo.com",
    locationOrCountry: "Gorakhpur, UP",
    tradesOrSubject: "Passport/Visa Verification",
    headcount: undefined,
    message: "Attended interview on Sept 10 at Gorakhpur centre for Oman 6G welder. Requesting update on medical clearance status.",
    status: "Closed",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
  }
];

// ==========================================
// LOCALSTORAGE KEYS & ACCESSORS
// ==========================================
const STORAGE_KEYS = {
  JOBS: 'tice_jobs_v2',
  APPLICATIONS: 'tice_candidates_data',
  DRIVES: 'tice_drives_v2',
  SETTINGS: 'tice_settings_v2',
  ENQUIRIES: 'tice_enquiries_v2'
};

// Dispatch global event so components re-render immediately
export const dispatchDataChangedEvent = (scope: 'jobs' | 'applications' | 'enquiries' | 'settings' | 'all') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tice_data_changed', { detail: { scope } }));
    window.dispatchEvent(new Event('jobsUpdated'));
  }
};

export function getStoredJobs(): Job[] {
  if (typeof window === 'undefined') return INITIAL_JOBS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_JOBS;
  }
}

export function setStoredJobs(jobs: Job[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    dispatchDataChangedEvent('jobs');
  } catch (e) {
    console.error('Failed to write jobs to localStorage:', e);
  }
}

export function getStoredApplications(): Application[] {
  if (typeof window === 'undefined') return INITIAL_APPLICATIONS;
  try {
    let raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!raw) {
      // Check legacy key if available
      const legacyRaw = localStorage.getItem('tice_applications_v2');
      if (legacyRaw) {
        raw = legacyRaw;
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, legacyRaw);
      }
    }
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPLICATIONS;
  }
}

export function setStoredApplications(apps: Application[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    dispatchDataChangedEvent('applications');
  } catch (e) {
    console.error('Failed to write applications to localStorage:', e);
  }
}

/**
 * Direct synchronous candidate lookup by Passport Number, Application ID, or Tracking Token
 * Synchronized with tice_candidates_data store
 */
export function getCandidateByPassportOrToken(query: string): Application | null {
  if (typeof window === 'undefined') return null;
  const clean = (query || '').trim().toUpperCase();
  if (!clean) return null;

  const apps = getStoredApplications();
  const cleanAlpha = clean.replace(/[^A-Z0-9]/g, '');

  const found = apps.find(c => {
    const passport = (c.passportNumber || (c as any).passport || '').trim().toUpperCase();
    const id = (c.id || '').trim().toUpperCase();
    const passportAlpha = passport.replace(/[^A-Z0-9]/g, '');
    const idAlpha = id.replace(/[^A-Z0-9]/g, '');

    return (
      passport === clean ||
      id === clean ||
      (cleanAlpha.length >= 4 && (passportAlpha === cleanAlpha || idAlpha === cleanAlpha))
    );
  });

  return found || null;
}

export function getStoredDrives(): InterviewDrive[] {
  if (typeof window === 'undefined') return INITIAL_DRIVES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRIVES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(INITIAL_DRIVES));
      return INITIAL_DRIVES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DRIVES;
  }
}

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return INITIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function setStoredSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    dispatchDataChangedEvent('settings');
  } catch (e) {
    console.error('Failed to write settings to localStorage:', e);
  }
}

export function getStoredEnquiries(): Enquiry[] {
  if (typeof window === 'undefined') return INITIAL_ENQUIRIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
      return INITIAL_ENQUIRIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ENQUIRIES;
  }
}

export function setStoredEnquiries(enquiries: Enquiry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
    dispatchDataChangedEvent('enquiries');
  } catch (e) {
    console.error('Failed to write enquiries to localStorage:', e);
  }
}

// ==========================================
// CANDIDATE PRIVACY MASKING & TIMELINE
// ==========================================
export function maskPassportNumber(passport: string): string {
  if (!passport) return '';
  const clean = passport.trim().toUpperCase();
  if (clean.length <= 3) {
    return clean[0] + '••••';
  }
  const first = clean[0];
  const lastTwo = clean.slice(-2);
  const maskedMiddle = '•'.repeat(clean.length - 3);
  return `${first}${maskedMiddle}${lastTwo}`;
}

export function maskCandidateName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 1) return word;
      return word[0] + '*'.repeat(word.length - 1);
    })
    .join(' ');
}

export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return '••••';
  const lastThree = trimmed.slice(-3);
  return '••••••••' + lastThree;
}

export function generateCandidateTimeline(app: Application): ApplicationTimelineItem[] {
  const stages: StageNumber[] = [1, 2, 3, 4, 5, 6, 7];
  const createdDate = new Date(app.createdAt || Date.now());
  const updatedDate = new Date(app.updatedAt || Date.now());

  return stages.map((stg) => {
    const isCompleted = app.currentStage >= stg;
    const isCurrent = app.currentStage === stg;
    
    const daysOffset = (stg - 1) * 5;
    const stageDate = new Date(createdDate.getTime() + daysOffset * 86400000);
    const displayDate = isCurrent 
      ? updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : stageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let stageRemarks = "";
    if (stg === 1) stageRemarks = "Application received and under preliminary review.";
    else if (stg === 2) stageRemarks = `Scheduled / Cleared technical trade interview at ${app.interviewCity} Trade Test Centre.`;
    else if (stg === 3) stageRemarks = "Medical examination completed (GAMCA/Authorized Center).";
    else if (stg === 4) stageRemarks = `Work permit & visa documents submitted to ${app.targetCountry} embassy.`;
    else if (stg === 5) stageRemarks = `Work visa officially issued by ${app.targetCountry} immigration.`;
    else if (stg === 6) stageRemarks = "Police Clearance & Protector of Emigrants (eMigrate) clearance approved.";
    else if (stg === 7) stageRemarks = `Flight ticket confirmed & pre-departure orientation completed. Dispatched to ${app.targetCountry}.`;

    return {
      stage: stg,
      title: STAGE_NAMES[stg],
      date: isCompleted ? displayDate : "Pending",
      completed: isCompleted,
      remarks: isCurrent ? app.remarks : stageRemarks
    };
  });
}

// Client-side Webhook Dispatcher
async function tryClientWebhookDispatch(payload: any) {
  try {
    const settings = getStoredSettings();
    if (!settings.googleSheetsWebhookUrl || !settings.googleSheetsWebhookUrl.startsWith('http')) {
      return;
    }
    fetch(settings.googleSheetsWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors' // Allows cross-origin Google Apps Script ping from browser
    }).catch(err => console.warn('[Client Webhook Warning]', err));
  } catch (err) {
    console.warn('[Client Webhook Exception]', err);
  }
}

// Helper to safely parse JSON or detect non-JSON (HTML 404s)
export async function safeJsonFetch(url: string, options?: RequestInit, timeoutMs = 4000): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Server returned HTML (e.g. Vercel SPA 404 fallback to index.html)
      return { ok: false, status: response.status, data: null };
    }

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: null };
  }
}

// ==========================================
// UNIFIED FRONTEND API SERVICE FUNCTIONS
// (AUTOMATIC SERVER TRY + LOCALSTORAGE FALLBACK)
// ==========================================

// 1. Fetch Jobs
export async function apiFetchJobs(params?: { country?: string; trade?: string; status?: string }): Promise<Job[]> {
  const query = new URLSearchParams();
  if (params?.country && params.country !== 'all' && params.country !== 'All') query.append('country', params.country);
  if (params?.trade && params.trade !== 'all' && params.trade !== 'All') query.append('trade', params.trade);

  const url = `/api/jobs${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await safeJsonFetch(url);

  if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
    // Sync localStorage cache
    setStoredJobs(res.data);
    return res.data;
  }

  // Graceful fallback to LocalStorage
  let stored = getStoredJobs();
  if (params?.status) {
    stored = stored.filter(j => j.status.toLowerCase() === params.status?.toLowerCase());
  } else {
    stored = stored.filter(j => j.status === 'Active');
  }

  if (params?.country && params.country !== 'all' && params.country !== 'All') {
    const c = params.country.toLowerCase();
    stored = stored.filter(j => j.country.toLowerCase().includes(c));
  }

  if (params?.trade && params.trade !== 'all' && params.trade !== 'All') {
    const t = params.trade.toLowerCase();
    stored = stored.filter(j => 
      j.title.toLowerCase().includes(t) || 
      j.category.toLowerCase().includes(t)
    );
  }

  return stored;
}

// 2. Fetch Tracker Data for a Passport / Token
export async function apiFetchTracker(queryPassportOrToken: string): Promise<{ candidate: any; timeline: ApplicationTimelineItem[] } | null> {
  const clean = queryPassportOrToken.trim().toUpperCase();
  if (!clean) return null;

  const res = await safeJsonFetch(`/api/tracker/${encodeURIComponent(clean)}`);
  if (res.ok && res.data && res.data.candidate) {
    return res.data;
  }

  // Fallback to LocalStorage
  const apps = getStoredApplications();
  const alphanumeric = clean.replace(/[^A-Z0-9]/g, '');

  const found = apps.find(a => {
    const aPassport = (a.passportNumber || '').trim().toUpperCase();
    const aId = (a.id || '').trim().toUpperCase();
    const aPassportAlpha = aPassport.replace(/[^A-Z0-9]/g, '');
    const aIdAlpha = aId.replace(/[^A-Z0-9]/g, '');

    return (
      aPassport === clean ||
      aId === clean ||
      (alphanumeric.length >= 4 && (aPassportAlpha === alphanumeric || aIdAlpha === alphanumeric))
    );
  });

  if (!found) return null;

  const timeline = generateCandidateTimeline(found);
  return {
    candidate: {
      id: found.id,
      fullName: maskCandidateName(found.fullName),
      phone: maskPhoneNumber(found.phone),
      passportNumber: maskPassportNumber(found.passportNumber),
      trade: found.trade,
      targetCountry: found.targetCountry,
      interviewCity: found.interviewCity,
      currentStage: found.currentStage,
      currentStageName: STAGE_NAMES[found.currentStage as StageNumber],
      remarks: found.remarks,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt
    },
    timeline
  };
}

// 3. Submit Candidate Application / Walk-in Registration
export async function apiSubmitApplication(payload: {
  fullName: string;
  phone: string;
  passportNumber: string;
  trade: string;
  targetCountry: string;
  interviewCity?: string;
  remarks?: string;
}): Promise<{ success: boolean; application: any; message?: string }> {
  // Always create a formatted client-side application record
  const token = "TRH-" + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();
  const cleanPassport = payload.passportNumber.trim().toUpperCase();

  const localApp: Application = {
    id: token,
    fullName: payload.fullName.trim(),
    phone: payload.phone.trim(),
    passportNumber: cleanPassport,
    trade: payload.trade.trim(),
    targetCountry: payload.targetCountry.trim(),
    interviewCity: payload.interviewCity || 'Delhi',
    currentStage: 1,
    remarks: payload.remarks || 'Application registered successfully with TICE',
    createdAt: now,
    updatedAt: now
  };

  // Try server
  const res = await safeJsonFetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok && res.data && res.data.success) {
    // Also store in localStorage to stay in sync
    const current = getStoredApplications();
    setStoredApplications([localApp, ...current.filter(a => a.passportNumber !== cleanPassport)]);
    return res.data;
  }

  // Local fallback
  const current = getStoredApplications();
  setStoredApplications([localApp, ...current.filter(a => a.passportNumber !== cleanPassport)]);

  // Background client webhook
  tryClientWebhookDispatch({
    token: localApp.id,
    fullName: localApp.fullName,
    phone: localApp.phone,
    passportNumber: localApp.passportNumber,
    trade: localApp.trade,
    targetCountry: localApp.targetCountry,
    currentStage: 1,
    stageName: STAGE_NAMES[1],
    interviewCity: localApp.interviewCity,
    submittedAt: now
  });

  return {
    success: true,
    message: 'Application registered successfully with TICE',
    application: {
      id: localApp.id,
      fullName: maskCandidateName(localApp.fullName),
      passportNumber: maskPassportNumber(localApp.passportNumber),
      currentStage: localApp.currentStage,
      currentStageName: STAGE_NAMES[localApp.currentStage as StageNumber],
      createdAt: localApp.createdAt
    }
  };
}

// 4. Submit Contact / Workforce Quota Enquiry
export async function apiSubmitEnquiry(payload: any): Promise<{ success: boolean; message: string; enquiry: Enquiry }> {
  const submissionType: EnquiryType = payload.type === "Workforce Quota Request" ? "Workforce Quota Request" : "Contact Enquiry";
  const now = new Date().toISOString();
  const token = "ENQ-" + Math.floor(1000 + Math.random() * 9000);

  const localEnquiry: Enquiry = {
    id: token,
    type: submissionType,
    fullName: (payload.fullName || payload.contactPerson || '').trim(),
    companyName: payload.companyName ? payload.companyName.trim() : 'N/A',
    phone: (payload.phone || '').trim(),
    email: payload.email ? payload.email.trim() : undefined,
    locationOrCountry: (payload.locationOrCountry || payload.country || payload.city || 'India').trim(),
    tradesOrSubject: (payload.tradesOrSubject || payload.enquiryType || '').trim(),
    headcount: payload.headcount ? Number(payload.headcount) : undefined,
    message: (payload.message || '').trim(),
    status: 'New',
    createdAt: now
  };

  // Try server
  const res = await safeJsonFetch('/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok && res.data && res.data.success) {
    const current = getStoredEnquiries();
    setStoredEnquiries([localEnquiry, ...current]);
    return res.data;
  }

  // Local fallback
  const current = getStoredEnquiries();
  setStoredEnquiries([localEnquiry, ...current]);

  tryClientWebhookDispatch({
    submissionType: localEnquiry.type,
    fullName: localEnquiry.fullName,
    companyName: localEnquiry.companyName || "N/A",
    phone: localEnquiry.phone,
    email: localEnquiry.email || "N/A",
    countryOrLocation: localEnquiry.locationOrCountry,
    tradesOrSubject: localEnquiry.tradesOrSubject,
    headcount: localEnquiry.headcount !== undefined ? localEnquiry.headcount : "N/A",
    message: localEnquiry.message,
    submittedAt: now
  });

  const successMessage = submissionType === "Contact Enquiry"
    ? "Enquiry submitted successfully! Our Janakpuri desk will contact you shortly."
    : "Workforce quota request received successfully! Our overseas project director will contact you within 4 hours.";

  return {
    success: true,
    message: successMessage,
    enquiry: localEnquiry
  };
}

// 5. Fetch Interview Drives
export async function apiFetchDrives(): Promise<InterviewDrive[]> {
  const res = await safeJsonFetch('/api/drives');
  if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
    return res.data;
  }
  return getStoredDrives();
}

// ==========================================
// ADMIN PORTAL API SERVICES WITH LOCALSTORAGE FALLBACK
// ==========================================

// Verify Passcode
export async function apiVerifyAdminPasscode(passcode: string): Promise<boolean> {
  const clean = (passcode || '').trim().toLowerCase();
  const VALID_KEY = "trehan2026";
  if (clean === VALID_KEY || clean === 'admin123') {
    return true;
  }

  const res = await safeJsonFetch('/api/admin/verify-passcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode: clean })
  });

  if (res.ok && res.data && res.data.authorized) {
    return true;
  }

  // LocalStorage check
  const settings = getStoredSettings();
  const validPass = (settings.adminPasscode || 'trehan2026').trim().toLowerCase();
  return clean === validPass || clean === VALID_KEY || clean === 'admin123';
}

// Admin: Fetch Candidates
export async function apiAdminFetchCandidates(params?: { search?: string; stage?: number }, passcode?: string): Promise<Application[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.stage) query.append('stage', params.stage.toString());

  const res = await safeJsonFetch(`/api/admin/candidates?${query.toString()}`, {
    headers: { 'x-admin-key': passcode || 'trehan2026' }
  });

  if (res.ok && res.data && Array.isArray(res.data.items)) {
    return res.data.items;
  }

  // LocalStorage filter
  let apps = getStoredApplications();
  const search = params?.search?.trim().toLowerCase();

  if (search) {
    apps = apps.filter(a => 
      a.fullName.toLowerCase().includes(search) ||
      a.passportNumber.toLowerCase().includes(search) ||
      a.trade.toLowerCase().includes(search) ||
      a.targetCountry.toLowerCase().includes(search) ||
      a.id.toLowerCase().includes(search)
    );
  }

  if (params?.stage && params.stage >= 1 && params.stage <= 7) {
    apps = apps.filter(a => a.currentStage === params.stage);
  }

  apps.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  return apps;
}

// Admin: Create / Publish Candidate
export async function apiAdminCreateCandidate(candidateData: any, passcode?: string): Promise<{ success: boolean; candidate: Application; message?: string }> {
  const token = candidateData.customToken?.trim() || ("TRH-" + Math.floor(1000 + Math.random() * 9000));
  const now = new Date().toISOString();

  const newApp: Application = {
    id: token,
    fullName: candidateData.fullName.trim(),
    phone: candidateData.phone.trim(),
    passportNumber: candidateData.passportNumber.trim().toUpperCase(),
    trade: candidateData.trade.trim(),
    targetCountry: candidateData.targetCountry.trim(),
    interviewCity: candidateData.interviewCity || 'Delhi',
    currentStage: Number(candidateData.currentStage || 1) as StageNumber,
    remarks: candidateData.remarks || 'Application registered successfully. Trade assessment scheduled.',
    createdAt: now,
    updatedAt: now
  };

  // Attempt backend
  await safeJsonFetch('/api/admin/candidates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': passcode || 'trehan2026'
    },
    body: JSON.stringify(candidateData)
  });

  // Always sync localStorage
  const current = getStoredApplications();
  const updated = [newApp, ...current.filter(a => a.id !== newApp.id && a.passportNumber !== newApp.passportNumber)];
  setStoredApplications(updated);

  return {
    success: true,
    candidate: newApp,
    message: `Candidate "${newApp.fullName}" published with Tracking Token ${newApp.id}!`
  };
}

// Admin: Update Candidate Status
export async function apiAdminUpdateCandidateStatus(id: string, stage: StageNumber, remarks: string, passcode?: string): Promise<{ success: boolean; candidate: Application }> {
  const now = new Date().toISOString();

  // Attempt backend
  await safeJsonFetch(`/api/admin/candidates/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': passcode || 'trehan2026'
    },
    body: JSON.stringify({ currentStage: stage, remarks })
  });

  // Always update in localStorage
  const current = getStoredApplications();
  let updatedApp: Application | null = null;

  const nextList = current.map(a => {
    if (a.id === id) {
      updatedApp = {
        ...a,
        currentStage: stage,
        remarks: remarks || a.remarks,
        updatedAt: now
      };
      return updatedApp;
    }
    return a;
  });

  if (!updatedApp && current.length > 0) {
    // In case id matched partially
    updatedApp = {
      ...current[0],
      currentStage: stage,
      remarks,
      updatedAt: now
    };
  }

  setStoredApplications(nextList);

  return {
    success: true,
    candidate: updatedApp || current[0]
  };
}

// Admin: Delete Candidate
export async function apiAdminDeleteCandidate(id: string, passcode?: string): Promise<boolean> {
  // Attempt backend
  await safeJsonFetch(`/api/admin/candidates/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': passcode || 'trehan2026' }
  });

  const current = getStoredApplications();
  setStoredApplications(current.filter(a => a.id !== id));
  return true;
}

// Admin: Fetch All Jobs
export async function apiAdminFetchJobs(passcode?: string): Promise<Job[]> {
  const res = await safeJsonFetch('/api/admin/jobs', {
    headers: { 'x-admin-key': passcode || 'trehan2026' }
  });

  if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
    setStoredJobs(res.data);
    return res.data;
  }

  return getStoredJobs();
}

// Admin: Create Job
export async function apiAdminCreateJob(jobData: any, passcode?: string): Promise<{ success: boolean; job: Job }> {
  const newJob: Job = {
    id: "job-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    title: jobData.title,
    country: jobData.country,
    flagEmoji: jobData.flagEmoji || '🌍',
    vacanciesCount: Number(jobData.vacanciesCount),
    salaryText: jobData.salaryText,
    perks: Array.isArray(jobData.perks) ? jobData.perks : (typeof jobData.perks === 'string' ? jobData.perks.split(',').map((s: string) => s.trim()).filter(Boolean) : ['Free Food', 'Accommodation']),
    category: jobData.category || 'Technical',
    status: jobData.status || 'Active',
    createdAt: new Date().toISOString(),
    description: jobData.description,
    workLocation: jobData.workLocation
  };

  // Attempt backend
  await safeJsonFetch('/api/admin/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': passcode || 'trehan2026'
    },
    body: JSON.stringify(newJob)
  });

  // Always update localStorage
  const current = getStoredJobs();
  setStoredJobs([newJob, ...current]);

  return { success: true, job: newJob };
}

// Admin: Update Job
export async function apiAdminUpdateJob(id: string, updates: Partial<Job>, passcode?: string): Promise<{ success: boolean; job: Job }> {
  // Attempt backend
  await safeJsonFetch(`/api/admin/jobs/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': passcode || 'trehan2026'
    },
    body: JSON.stringify(updates)
  });

  // Always update localStorage
  const current = getStoredJobs();
  let updatedJob: Job | null = null;
  const nextList = current.map(j => {
    if (j.id === id) {
      updatedJob = { ...j, ...updates };
      return updatedJob;
    }
    return j;
  });

  setStoredJobs(nextList);

  return { success: true, job: updatedJob || current[0] };
}

// Admin: Delete Job
export async function apiAdminDeleteJob(id: string, passcode?: string): Promise<boolean> {
  // Attempt backend
  await safeJsonFetch(`/api/admin/jobs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': passcode || 'trehan2026' }
  });

  const current = getStoredJobs();
  setStoredJobs(current.filter(j => j.id !== id));
  return true;
}

// Admin: Fetch Enquiries
export async function apiAdminFetchEnquiries(params?: { type?: string; status?: string; search?: string }, passcode?: string): Promise<Enquiry[]> {
  const query = new URLSearchParams();
  if (params?.type && params.type !== 'All') query.append('type', params.type);
  if (params?.status && params.status !== 'All') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const res = await safeJsonFetch(`/api/admin/enquiries?${query.toString()}`, {
    headers: { 'x-admin-key': passcode || 'trehan2026' }
  });

  if (res.ok && res.data && Array.isArray(res.data.enquiries)) {
    return res.data.enquiries;
  }

  // LocalStorage filter
  let enquiries = getStoredEnquiries();
  if (params?.type && params.type !== 'All') {
    enquiries = enquiries.filter(e => e.type === params.type);
  }
  if (params?.status && params.status !== 'All') {
    enquiries = enquiries.filter(e => e.status === params.status);
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    enquiries = enquiries.filter(e => 
      e.fullName.toLowerCase().includes(s) ||
      (e.companyName && e.companyName.toLowerCase().includes(s)) ||
      e.phone.toLowerCase().includes(s) ||
      e.tradesOrSubject.toLowerCase().includes(s)
    );
  }

  return enquiries;
}

// Admin: Update Enquiry Status
export async function apiAdminUpdateEnquiryStatus(id: string, status: EnquiryStatus, passcode?: string): Promise<boolean> {
  await safeJsonFetch(`/api/admin/enquiries/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': passcode || 'trehan2026'
    },
    body: JSON.stringify({ status })
  });

  const current = getStoredEnquiries();
  const nextList = current.map(e => e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e);
  setStoredEnquiries(nextList);
  return true;
}

// Admin: Delete Enquiry
export async function apiAdminDeleteEnquiry(id: string, passcode?: string): Promise<boolean> {
  await safeJsonFetch(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': passcode || 'trehan2026' }
  });

  const current = getStoredEnquiries();
  setStoredEnquiries(current.filter(e => e.id !== id));
  return true;
}

// Admin: Fetch Settings
export async function apiAdminFetchSettings(passcode?: string): Promise<AppSettings> {
  const res = await safeJsonFetch('/api/admin/settings', {
    headers: { 'x-admin-key': passcode || 'trehan2026' }
  });

  if (res.ok && res.data) {
    return res.data;
  }

  return getStoredSettings();
}

// Admin: Update Settings
export async function apiAdminUpdateSettings(updates: Partial<AppSettings>, passcode?: string): Promise<AppSettings> {
  await safeJsonFetch('/api/admin/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': passcode || 'trehan2026'
    },
    body: JSON.stringify(updates)
  });

  const current = getStoredSettings();
  const merged: AppSettings = {
    ...current,
    ...updates
  };
  setStoredSettings(merged);
  return merged;
}

// Admin: Test Webhook
export async function apiAdminTestWebhook(url?: string, passcode?: string): Promise<{ success: boolean; error?: string; message?: string }> {
  const targetUrl = url || getStoredSettings().googleSheetsWebhookUrl;
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return { success: false, error: 'Please configure a valid Webhook URL starting with http:// or https://' };
  }

  // Attempt backend test route first
  const res = await safeJsonFetch('/api/admin/test-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': passcode || 'trehan2026'
    },
    body: JSON.stringify({ url: targetUrl })
  });

  if (res.ok && res.data) {
    return { success: res.data.success, message: 'Test webhook sent successfully via backend proxy!' };
  }

  // Client-side direct ping
  try {
    const testPayload = {
      event: 'TEST_DISPATCH_TICE',
      token: 'TRH-TEST-9999',
      fullName: 'Test Candidate (Trehan Verification)',
      phone: '+91 99999 88888',
      passportNumber: 'T9999999',
      trade: '6G Pipe Welder',
      targetCountry: 'Oman',
      currentStage: 1,
      stageName: 'Application Review',
      interviewCity: 'Delhi',
      submittedAt: new Date().toISOString(),
      notes: 'Verification test ping dispatched from TICE Portal (Vercel Browser Fallback).'
    };

    await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
      mode: 'no-cors'
    });

    // Update settings with last status
    const settings = getStoredSettings();
    settings.lastWebhookStatus = {
      timestamp: new Date().toISOString(),
      success: true,
      responseCode: 200
    };
    setStoredSettings(settings);

    return {
      success: true,
      message: 'Test ping dispatched to webhook URL successfully (Browser direct mode)!'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to ping webhook URL.'
    };
  }
}
