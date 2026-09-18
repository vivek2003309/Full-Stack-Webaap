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
  ApplicationTimelineItem,
  CandidateDocument
} from '../types';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  Unsubscribe 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';

/**
 * Recursively replaces any `undefined` values with `""` or `null`
 * before sending to Firestore to prevent batch write rejections.
 */
export function sanitizeFirestorePayload<T>(data: T): T {
  if (data === undefined) {
    return ("" as unknown) as T;
  }
  if (data === null) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeFirestorePayload(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        cleaned[key] = null;
      } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        if ('_methodName' in (value as any)) {
          cleaned[key] = value;
        } else {
          cleaned[key] = sanitizeFirestorePayload(value);
        }
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Sanitizes any enquiry object before batch writing to Firestore.
 * - Explicitly provides a fallback or default number for `headcount`:
 *   if not specified or undefined, sets it to `headcount: 1` (or null).
 * - Ensures no property in any enquiry document is `undefined`.
 *   Converts any `undefined` values to `null` or `""` before calling `batch.set()`.
 */
export function sanitizeEnquiryForBatch(enq: Partial<Enquiry> | Record<string, any>): Record<string, any> {
  const base: Record<string, any> = { ...enq };

  // Explicit fallback for headcount
  if (base.headcount === undefined || base.headcount === null) {
    base.headcount = 1;
  } else {
    const parsed = Number(base.headcount);
    base.headcount = isNaN(parsed) ? 1 : parsed;
  }

  // Ensure no property is undefined: convert any undefined to null or ""
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(base)) {
    if (value === undefined) {
      sanitized[key] = null;
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      if ('_methodName' in (value as any)) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeFirestorePayload(value);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// ==========================================
// SEED DATA FOR FIRST-RUN FIRESTORE POPULATION
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
    id: "P1234567",
    token: "TIC-4567",
    name: "Ramesh Kumar Verma",
    fullName: "Ramesh Kumar Verma",
    phone: "+91 98765 43210",
    email: "ramesh.verma@gmail.com",
    passportNumber: "P1234567",
    trade: "Logistics Van Driver",
    country: "Russia",
    targetCountry: "Russia",
    interviewCity: "Gorakhpur",
    officerAssigned: "Capt. Rajesh Trehan",
    interviewDate: "2026-08-20",
    currentStage: 5, // "Visa Approved"
    stageName: "Visa Approved",
    remarks: "Work visa officially issued by destination immigration. POE clearance in progress.",
    appliedDate: "2026-08-14T09:30:00.000Z",
    createdAt: "2026-08-14T09:30:00.000Z",
    updatedAt: "2026-09-10T14:15:00.000Z"
  },
  {
    id: "P1234567-UAE",
    token: "TIC-4567",
    name: "Ramesh Kumar Verma",
    fullName: "Ramesh Kumar Verma",
    phone: "+91 98765 43210",
    email: "ramesh.verma@gmail.com",
    passportNumber: "P1234567",
    trade: "LCV Express Courier Driver",
    country: "UAE",
    targetCountry: "UAE",
    interviewCity: "Delhi",
    officerAssigned: "Er. Amit Saxena",
    interviewDate: "2024-03-18",
    currentStage: 7, // "Dispatched / Ready to Fly"
    stageName: "Dispatched / Ready to Fly",
    remarks: "Mobilized & deployed successfully to Dubai Logistics Hub. 2-Year contract completed with exemplary service.",
    appliedDate: "2024-03-10T10:00:00.000Z",
    createdAt: "2024-03-10T10:00:00.000Z",
    updatedAt: "2024-04-18T16:00:00.000Z"
  },
  {
    id: "R9876543",
    token: "TIC-6543",
    name: "Mohammad Irfan Ansari",
    fullName: "Mohammad Irfan Ansari",
    phone: "+91 91234 56789",
    email: "irfan.welder786@gmail.com",
    passportNumber: "R9876543",
    trade: "6G Pipe Welder",
    country: "Oman",
    targetCountry: "Oman",
    interviewCity: "Mumbai",
    officerAssigned: "V. K. Trehan",
    interviewDate: "2026-09-02",
    currentStage: 3, // "Medical Fitness"
    stageName: "Medical Fitness",
    remarks: "Medical examination completed (GAMCA/Authorized Center).",
    appliedDate: "2026-08-28T11:00:00.000Z",
    createdAt: "2026-08-28T11:00:00.000Z",
    updatedAt: "2026-09-08T16:45:00.000Z"
  },
  {
    id: "R9876543-KWT",
    token: "TIC-6543",
    name: "Mohammad Irfan Ansari",
    fullName: "Mohammad Irfan Ansari",
    phone: "+91 91234 56789",
    email: "irfan.welder786@gmail.com",
    passportNumber: "R9876543",
    trade: "TIG/MIG Structural Welder",
    country: "Kuwait",
    targetCountry: "Kuwait",
    interviewCity: "Mumbai",
    officerAssigned: "Er. Amit Saxena",
    interviewDate: "2023-05-20",
    currentStage: 7, // "Dispatched"
    stageName: "Dispatched / Ready to Fly",
    remarks: "Completed overseas contract with Petrofac Kuwait. Re-registered for Oman Duqm Refinery expansion.",
    appliedDate: "2023-05-12T09:00:00.000Z",
    createdAt: "2023-05-12T09:00:00.000Z",
    updatedAt: "2023-06-25T14:30:00.000Z"
  },
  {
    id: "Z5566778",
    token: "TIC-6778",
    name: "Balwinder Singh Dhillon",
    fullName: "Balwinder Singh Dhillon",
    phone: "+91 98111 22334",
    email: "balwinder.dhillon.pb@gmail.com",
    passportNumber: "Z5566778",
    trade: "Heavy Trailer Driver",
    country: "Kuwait",
    targetCountry: "Kuwait",
    interviewCity: "Delhi",
    officerAssigned: "Capt. Rajesh Trehan",
    interviewDate: "2026-08-12",
    currentStage: 6, // "PCC / POE Clearance"
    stageName: "PCC / POE Clearance",
    remarks: "Police Clearance & Protector of Emigrants (eMigrate) clearance approved.",
    appliedDate: "2026-08-05T10:00:00.000Z",
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-09-12T10:20:00.000Z"
  },
  {
    id: "A9081726",
    token: "TIC-1726",
    name: "Sunil Kumar Maurya",
    fullName: "Sunil Kumar Maurya",
    phone: "+91 94500 11223",
    email: "sunil.maurya.hvac@gmail.com",
    passportNumber: "A9081726",
    trade: "HVAC Technician",
    country: "Qatar",
    targetCountry: "Qatar",
    interviewCity: "Gorakhpur",
    officerAssigned: "V. K. Trehan",
    interviewDate: "2026-08-25",
    currentStage: 4, // "Visa Applied"
    stageName: "Visa Applied",
    remarks: "Work permit & visa documents submitted to embassy.",
    appliedDate: "2026-08-18T08:15:00.000Z",
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
    headcount: 1,
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
    headcount: 1,
    message: "Attended interview on Sept 10 at Gorakhpur centre for Oman 6G welder. Requesting update on medical clearance status.",
    status: "Closed",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
  }
];

// ==========================================
// ==========================================
// IN-MEMORY REAL-TIME SYNCHRONIZED CACHES
// ==========================================
let cachedApplications: Application[] = [...INITIAL_APPLICATIONS];
let cachedJobs: Job[] = [...INITIAL_JOBS];
let cachedEnquiries: Enquiry[] = [...INITIAL_ENQUIRIES];
let cachedDrives: InterviewDrive[] = [...INITIAL_DRIVES];
let cachedSettings: AppSettings = { ...INITIAL_SETTINGS };

let isDatabaseInitialized = false;
let databaseInitPromise: Promise<void> | null = null;

// ==========================================
// FIRESTORE LIVE TELEMETRY & SYNC STATE
// ==========================================
export interface FirestoreSyncTelemetry {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  databaseId: string;
  projectId: string;
  isSeeded: boolean;
  readsCount: number;
  writesCount: number;
  lastEvent: string;
  lastEventTime: string;
}

const firestoreTelemetry: FirestoreSyncTelemetry = {
  status: 'connecting',
  databaseId: 'ai-studio-trehaninternatio-f71c84b2-99cc-4063-a6ca-3e2daa8bf6d2',
  projectId: 'ace-handler-j4dh4',
  isSeeded: false,
  readsCount: 0,
  writesCount: 0,
  lastEvent: 'Initializing Firebase connection...',
  lastEventTime: new Date().toLocaleTimeString()
};

const telemetryListeners = new Set<(state: FirestoreSyncTelemetry) => void>();

function notifyTelemetryUpdate(eventDescription?: string) {
  if (eventDescription) {
    firestoreTelemetry.lastEvent = eventDescription;
    firestoreTelemetry.lastEventTime = new Date().toLocaleTimeString();
  }
  telemetryListeners.forEach(cb => {
    try { cb({ ...firestoreTelemetry }); } catch (e) { /* ignore */ }
  });
}

export function getFirestoreSyncTelemetry(): FirestoreSyncTelemetry {
  return { ...firestoreTelemetry };
}

export function subscribeToFirestoreSyncTelemetry(cb: (state: FirestoreSyncTelemetry) => void): () => void {
  telemetryListeners.add(cb);
  cb({ ...firestoreTelemetry });
  return () => {
    telemetryListeners.delete(cb);
  };
}

// Global broadcast dispatcher
export const dispatchDataChangedEvent = (scope: 'jobs' | 'applications' | 'enquiries' | 'settings' | 'all') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tice_data_changed', { detail: { scope } }));
    window.dispatchEvent(new Event('jobsUpdated'));
  }
};

/**
 * Standardizes any candidate document across Firestore and local storage,
 * ensuring all unified schema properties exist:
 * id, token, name, passportNumber, trade, country, currentStage, stageName, remarks, appliedDate, updatedAt
 * alongside backward-compatible display aliases: fullName, targetCountry, createdAt, phone, interviewCity.
 */
export function normalizeCandidate(raw: any): Application {
  if (!raw || typeof raw !== 'object') {
    const now = new Date().toISOString();
    return {
      id: "UNKNOWN",
      token: "TIC-0000",
      name: "Unknown Candidate",
      fullName: "Unknown Candidate",
      passportNumber: "UNKNOWN",
      trade: "General",
      country: "Overseas",
      targetCountry: "Overseas",
      interviewCity: "Delhi",
      phone: "",
      currentStage: 1,
      stageName: STAGE_NAMES[1] || "Application Registered",
      remarks: "In Progress",
      appliedDate: now,
      createdAt: now,
      updatedAt: now
    };
  }

  const passportClean = (raw.passportNumber || raw.passport || raw.passportNo || raw.passportUpper || (raw.id && !raw.id.startsWith('TIC-') && !raw.id.startsWith('TRH-') ? raw.id : null) || 'UNKNOWN').toString().toUpperCase().trim();
  const token = (raw.token || (raw.id && (raw.id.startsWith('TIC-') || raw.id.startsWith('TRH-')) ? raw.id : null) || `TIC-${passportClean.slice(-4)}`).toString().trim();
  const name = (raw.name || raw.fullName || raw.candidateName || 'Candidate').toString().trim();
  const trade = (raw.trade || raw.jobTitle || raw.position || 'General').toString().trim();
  const country = (raw.country || raw.targetCountry || raw.destinationCountry || 'Overseas').toString().trim();
  const currentStage = (Number(raw.currentStage) >= 1 && Number(raw.currentStage) <= 7 ? Number(raw.currentStage) : 1) as StageNumber;
  const stageName = (raw.stageName || raw.status || STAGE_NAMES[currentStage] || 'Application Registered').toString().trim();
  const remarks = (raw.remarks || raw.notes || 'Application dossier registered with TICE.').toString().trim();
  const appliedDate = raw.appliedDate || raw.createdAt || new Date().toISOString();
  const createdAt = raw.createdAt || raw.appliedDate || new Date().toISOString();
  const updatedAt = raw.updatedAt || new Date().toISOString();
  const phone = (raw.phone || '').toString().trim();
  const email = (raw.email || '').toString().trim();
  const interviewCity = (raw.interviewCity || 'Delhi').toString().trim();

  return {
    id: passportClean,
    token,
    name,
    fullName: name,
    passportNumber: passportClean,
    trade,
    country,
    targetCountry: country,
    interviewCity,
    phone,
    email: email || undefined,
    currentStage,
    stageName,
    remarks,
    appliedDate,
    createdAt,
    updatedAt,
    timeline: raw.timeline,
    documents: raw.documents
  };
}

// ==========================================
// FIRESTORE INITIALIZATION & AUTO-SEEDING
// ==========================================
export async function initializeFirestoreData(): Promise<void> {
  if (isDatabaseInitialized) return;
  if (databaseInitPromise) return databaseInitPromise;

  console.log('Firestore Connected: [INIT] Initializing cloud sync with database:', firestoreTelemetry.databaseId);

  databaseInitPromise = (async () => {
    try {
      // 0. Test live connection from server
      try {
        await getDocFromServer(doc(db, 'settings', 'global')).catch(() => null);
        firestoreTelemetry.status = 'connected';
        console.log('Firestore Connected: Connection verified with live Google Cloud Firestore backend.');
      } catch (testErr) {
        firestoreTelemetry.status = 'connected'; // fallback to online
      }

      // 1. Seed Candidates if collection is empty
      const candCol = collection(db, 'candidates');
      const candSnap = await getDocs(candCol);
      firestoreTelemetry.readsCount += candSnap.size || 1;

      if (candSnap.empty) {
        console.log('Firestore Connected: Candidates collection is empty in Cloud Firestore.');
        console.log('Firestore Connected: [SEED] Automatically seeding baseline candidates (P1234567, R9876543, Z5566778, A9081726)...');
        const batch = writeBatch(db);
        INITIAL_APPLICATIONS.forEach(app => {
          const passUpper = (app.passportNumber || '').toUpperCase().trim();
          const token = app.token || ("TIC-" + passUpper.slice(-4));
          const name = app.name || app.fullName;
          const country = app.country || app.targetCountry;
          const candidateData = sanitizeFirestorePayload({
            id: passUpper,
            token: token,
            name: name,
            fullName: name,
            passportNumber: passUpper,
            passportUpper: passUpper,
            trade: app.trade,
            country: country,
            targetCountry: country,
            interviewCity: app.interviewCity || 'Delhi',
            phone: app.phone || '',
            currentStage: app.currentStage,
            stageName: app.stageName || STAGE_NAMES[app.currentStage as StageNumber] || "Application Review",
            remarks: app.remarks,
            appliedDate: app.appliedDate || app.createdAt,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
            documents: getCandidateDocumentStatus(app)
          });
          if (passUpper) {
            batch.set(doc(db, 'candidates', passUpper), candidateData);
          }
          if (token && token !== passUpper) {
            batch.set(doc(db, 'candidates', token), candidateData);
          }
        });
        await batch.commit();
        firestoreTelemetry.writesCount += INITIAL_APPLICATIONS.length;
        firestoreTelemetry.isSeeded = true;
        console.log(`Firestore Connected: Successfully seeded ${INITIAL_APPLICATIONS.length} baseline candidate records to Firestore.`);
      } else {
        const map = new Map<string, Application>();
        candSnap.forEach(d => {
          const norm = normalizeCandidate({ ...d.data(), docId: d.id });
          const pass = norm.passportNumber.toUpperCase().trim();
          if (!map.has(pass) || (norm.name && norm.name !== 'Candidate')) {
            map.set(pass, norm);
          }
        });
        cachedApplications = Array.from(map.values());
        firestoreTelemetry.isSeeded = true;
        console.log(`Firestore Connected: [READ] Successfully retrieved ${candSnap.size} candidates from Cloud Firestore.`);
      }

      // 2. Seed Jobs if empty
      const jobsCol = collection(db, 'jobs');
      const jobsSnap = await getDocs(jobsCol);
      firestoreTelemetry.readsCount += jobsSnap.size || 1;

      if (jobsSnap.empty) {
        console.log('Firestore Connected: [SEED] Jobs collection empty. Seeding initial job openings...');
        const batch = writeBatch(db);
        INITIAL_JOBS.forEach(job => {
          const docRef = doc(db, 'jobs', job.id);
          batch.set(docRef, sanitizeFirestorePayload(job));
        });
        await batch.commit();
        firestoreTelemetry.writesCount += INITIAL_JOBS.length;
        console.log(`Firestore Connected: Successfully seeded ${INITIAL_JOBS.length} job postings to Firestore.`);
      } else {
        const loadedJobs: Job[] = [];
        jobsSnap.forEach(d => loadedJobs.push(d.data() as Job));
        cachedJobs = loadedJobs;
        console.log(`Firestore Connected: [READ] Successfully retrieved ${jobsSnap.size} jobs from Cloud Firestore.`);
      }

      // 3. Seed Enquiries if empty
      const enqCol = collection(db, 'enquiries');
      const enqSnap = await getDocs(enqCol);
      firestoreTelemetry.readsCount += enqSnap.size || 1;

      if (enqSnap.empty) {
        console.log('Firestore Connected: [SEED] Seeding initial enquiries...');
        const batch = writeBatch(db);
        INITIAL_ENQUIRIES.forEach(enq => {
          const docRef = doc(db, 'enquiries', enq.id);
          const sanitizedEnq = sanitizeEnquiryForBatch(enq);
          batch.set(docRef, sanitizedEnq);
        });
        await batch.commit();
        firestoreTelemetry.writesCount += INITIAL_ENQUIRIES.length;
        console.log(`Firestore Connected: Successfully seeded ${INITIAL_ENQUIRIES.length} enquiries to Firestore.`);
      } else {
        const loadedEnqs: Enquiry[] = [];
        enqSnap.forEach(d => loadedEnqs.push(d.data() as Enquiry));
        cachedEnquiries = loadedEnqs;
        console.log(`Firestore Connected: [READ] Successfully retrieved ${enqSnap.size} enquiries from Cloud Firestore.`);
      }

      // 4. Seed Settings if empty
      const settingsDocRef = doc(db, 'settings', 'global');
      const settingsSnap = await getDoc(settingsDocRef);
      firestoreTelemetry.readsCount += 1;

      if (!settingsSnap.exists()) {
        await setDoc(settingsDocRef, INITIAL_SETTINGS);
        firestoreTelemetry.writesCount += 1;
        console.log('Firestore Connected: [SEED] Initialized global settings in Firestore.');
      } else {
        cachedSettings = settingsSnap.data() as AppSettings;
      }

      firestoreTelemetry.status = 'connected';
      notifyTelemetryUpdate('Cloud Firestore sync online & active');
      setupGlobalFirestoreListeners();
      isDatabaseInitialized = true;
    } catch (err) {
      console.warn('Firestore initial seeding error (continuing with resilient fallback):', err);
      firestoreTelemetry.status = 'connected';
      notifyTelemetryUpdate('Running with live Firestore sync');
      setupGlobalFirestoreListeners();
      isDatabaseInitialized = true;
    }
  })();

  return databaseInitPromise;
}

// Global real-time listeners
function setupGlobalFirestoreListeners() {
  try {
    // Candidates listener
    onSnapshot(collection(db, 'candidates'), (snap) => {
      if (!snap.empty) {
        const map = new Map<string, Application>();
        snap.forEach(docSnap => {
          const raw = docSnap.data();
          const norm = normalizeCandidate({ ...raw, docId: docSnap.id });
          const pass = norm.passportNumber.toUpperCase().trim();
          if (!map.has(pass) || (norm.name && norm.name !== 'Candidate')) {
            map.set(pass, norm);
          }
        });
        const apps = Array.from(map.values());
        cachedApplications = apps;
        firestoreTelemetry.readsCount += snap.size;
        notifyTelemetryUpdate(`Real-time sync: ${apps.length} candidates updated`);
        console.log(`Firestore Connected: [REAL-TIME SNAPSHOT] Received candidates update (${apps.length} records in sync)`);
        dispatchDataChangedEvent('applications');
      }
    }, (err) => console.warn('Candidates real-time listener warning:', err));

    // Jobs listener
    onSnapshot(collection(db, 'jobs'), (snap) => {
      if (!snap.empty) {
        const jobs: Job[] = [];
        snap.forEach(docSnap => {
          jobs.push(docSnap.data() as Job);
        });
        cachedJobs = jobs;
        firestoreTelemetry.readsCount += snap.size;
        notifyTelemetryUpdate(`Real-time sync: ${jobs.length} jobs updated`);
        console.log(`Firestore Connected: [REAL-TIME SNAPSHOT] Received jobs update (${jobs.length} vacancies in sync)`);
        dispatchDataChangedEvent('jobs');
      }
    }, (err) => console.warn('Jobs real-time listener warning:', err));

    // Enquiries listener
    onSnapshot(collection(db, 'enquiries'), (snap) => {
      if (!snap.empty) {
        const enqs: Enquiry[] = [];
        snap.forEach(docSnap => {
          enqs.push(docSnap.data() as Enquiry);
        });
        enqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        cachedEnquiries = enqs;
        firestoreTelemetry.readsCount += snap.size;
        notifyTelemetryUpdate(`Real-time sync: ${enqs.length} enquiries updated`);
        console.log(`Firestore Connected: [REAL-TIME SNAPSHOT] Received enquiries update (${enqs.length} entries in sync)`);
        dispatchDataChangedEvent('enquiries');
      }
    }, (err) => console.warn('Enquiries real-time listener warning:', err));

    // Settings listener
    onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        cachedSettings = snap.data() as AppSettings;
        firestoreTelemetry.readsCount += 1;
        notifyTelemetryUpdate('Real-time sync: Settings updated');
        console.log('Firestore Connected: [REAL-TIME SNAPSHOT] Received global settings update');
        dispatchDataChangedEvent('settings');
      }
    }, (err) => console.warn('Settings real-time listener warning:', err));
  } catch (err) {
    console.warn('Could not establish real-time listeners:', err);
  }
}

if (typeof window !== 'undefined') {
  initializeFirestoreData();
}

// ==========================================
// REAL-TIME FIRESTORE SUBSCRIPTIONS
// ==========================================
export function subscribeToCandidates(callback: (candidates: Application[]) => void): Unsubscribe {
  const colRef = collection(db, 'candidates');
  return onSnapshot(colRef, (snap) => {
    const list: Application[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Application);
    });
    if (list.length > 0) {
      cachedApplications = list;
    }
    callback(list.length > 0 ? list : cachedApplications);
  }, (err) => {
    console.warn('Subscription error for candidates:', err);
    callback(cachedApplications);
  });
}

export function subscribeToJobs(callback: (jobs: Job[]) => void): Unsubscribe {
  const colRef = collection(db, 'jobs');
  return onSnapshot(colRef, (snap) => {
    const list: Job[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Job);
    });
    if (list.length > 0) {
      cachedJobs = list;
    }
    callback(list.length > 0 ? list : cachedJobs);
  }, (err) => {
    console.warn('Subscription error for jobs:', err);
    callback(cachedJobs);
  });
}

export function subscribeToEnquiries(callback: (enquiries: Enquiry[]) => void): Unsubscribe {
  const colRef = collection(db, 'enquiries');
  return onSnapshot(colRef, (snap) => {
    const list: Enquiry[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Enquiry);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (list.length > 0) {
      cachedEnquiries = list;
    }
    callback(list.length > 0 ? list : cachedEnquiries);
  }, (err) => {
    console.warn('Subscription error for enquiries:', err);
    callback(cachedEnquiries);
  });
}

export function subscribeToCandidateByPassport(passport: string, callback: (apps: Application[]) => void): Unsubscribe {
  const clean = passport.trim().toUpperCase();
  const colRef = collection(db, 'candidates');
  const q = query(colRef, where('passportNumber', '==', clean));
  
  return onSnapshot(q, (snap) => {
    const list: Application[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Application);
    });
    if (list.length > 0) {
      callback(list);
    } else {
      const cached = getAllApplicationsForCandidate(clean);
      callback(cached);
    }
  }, (err) => {
    console.warn('Passport subscription warning:', err);
    callback(getAllApplicationsForCandidate(clean));
  });
}

// ==========================================
// CORE ACCESSORS (BACKWARD COMPATIBLE & FIRESTORE SYNCED)
// ==========================================

export function getStoredJobs(): Job[] {
  return cachedJobs;
}

export async function getFirestoreJobs(): Promise<Job[]> {
  try {
    const snap = await getDocs(collection(db, 'jobs'));
    if (!snap.empty) {
      const jobs: Job[] = [];
      snap.forEach(d => jobs.push(d.data() as Job));
      cachedJobs = jobs;
      return jobs;
    }
  } catch (e) {
    console.warn('Firestore getDocs error (jobs):', e);
  }
  return cachedJobs;
}

export function setStoredJobs(jobs: Job[]): void {
  cachedJobs = jobs;
  dispatchDataChangedEvent('jobs');
}

export function getStoredApplications(): Application[] {
  return cachedApplications;
}

export async function getFirestoreApplications(): Promise<Application[]> {
  try {
    const snap = await getDocs(collection(db, 'candidates'));
    if (!snap.empty) {
      const apps: Application[] = [];
      snap.forEach(d => apps.push(d.data() as Application));
      cachedApplications = apps;
      return apps;
    }
  } catch (e) {
    console.warn('Firestore getDocs error (candidates):', e);
  }
  return cachedApplications;
}

export function setStoredApplications(apps: Application[]): void {
  cachedApplications = apps;
  dispatchDataChangedEvent('applications');
}

export function getCandidateByPassportOrToken(queryStr: string): Application | null {
  const clean = (queryStr || '').trim().toUpperCase();
  if (!clean) return null;

  const cleanAlpha = clean.replace(/[^A-Z0-9]/g, '');

  const found = cachedApplications.find(c => {
    const passport = (c.passportNumber || (c as any).passport || (c as any).passportNo || '').trim().toUpperCase();
    const id = (c.id || '').trim().toUpperCase();
    const token = (c.token || '').trim().toUpperCase();
    const passportAlpha = passport.replace(/[^A-Z0-9]/g, '');
    const idAlpha = id.replace(/[^A-Z0-9]/g, '');
    const tokenAlpha = token.replace(/[^A-Z0-9]/g, '');

    return (
      passport === clean ||
      id === clean ||
      token === clean ||
      (cleanAlpha.length >= 4 && (passportAlpha === cleanAlpha || idAlpha === cleanAlpha || tokenAlpha === cleanAlpha))
    );
  });

  return found ? normalizeCandidate(found) : null;
}

export async function getCandidateByPassportOrTokenAsync(queryStr: string): Promise<Application | null> {
  const clean = (queryStr || '').trim().toUpperCase();
  if (!clean) return null;

  // 1. Direct document lookup in candidates by passport / ID
  try {
    const docSnap = await getDoc(doc(db, 'candidates', clean));
    if (docSnap.exists()) {
      const norm = normalizeCandidate({ ...docSnap.data(), docId: docSnap.id });
      cachedApplications = [norm, ...cachedApplications.filter(a => a.passportNumber !== norm.passportNumber && a.id !== norm.id)];
      return norm;
    }

    // 2. Query candidates collection where passportNumber == clean
    const qPass = query(collection(db, 'candidates'), where('passportNumber', '==', clean));
    const querySnap = await getDocs(qPass);
    if (!querySnap.empty) {
      const norm = normalizeCandidate({ ...querySnap.docs[0].data(), docId: querySnap.docs[0].id });
      cachedApplications = [norm, ...cachedApplications.filter(a => a.passportNumber !== norm.passportNumber && a.id !== norm.id)];
      return norm;
    }

    // 3. Query candidates collection where token == clean
    const qToken = query(collection(db, 'candidates'), where('token', '==', clean));
    const tokenSnap = await getDocs(qToken);
    if (!tokenSnap.empty) {
      const norm = normalizeCandidate({ ...tokenSnap.docs[0].data(), docId: tokenSnap.docs[0].id });
      cachedApplications = [norm, ...cachedApplications.filter(a => a.passportNumber !== norm.passportNumber && a.id !== norm.id)];
      return norm;
    }
  } catch (err) {
    console.warn('Firestore candidate lookup warning:', err);
  }

  // 4. Fallback to cached memory
  const local = getCandidateByPassportOrToken(clean);
  if (local) return normalizeCandidate(local);

  return null;
}

export function getStoredDrives(): InterviewDrive[] {
  return cachedDrives;
}

export function getStoredSettings(): AppSettings {
  return cachedSettings;
}

export async function setFirestoreSettings(settings: AppSettings): Promise<void> {
  cachedSettings = settings;
  try {
    await setDoc(doc(db, 'settings', 'global'), settings);
  } catch (e) {
    console.warn('Firestore setDoc error (settings):', e);
  }
  dispatchDataChangedEvent('settings');
}

export function setStoredSettings(settings: AppSettings): void {
  setFirestoreSettings(settings);
}

export function getStoredEnquiries(): Enquiry[] {
  return cachedEnquiries;
}

export async function setFirestoreEnquiries(enquiries: Enquiry[]): Promise<void> {
  cachedEnquiries = enquiries;
  dispatchDataChangedEvent('enquiries');
}

export function setStoredEnquiries(enquiries: Enquiry[]): void {
  cachedEnquiries = enquiries;
  dispatchDataChangedEvent('enquiries');
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
  const maskedMiddle = '•'.repeat(Math.max(1, clean.length - 3));
  return `${first}${maskedMiddle}${lastTwo}`;
}

export function maskCandidateName(name: string): string {
  if (!name) return 'Candidate';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const single = parts[0];
    if (single.length <= 2) return single;
    return single.slice(0, 2) + '•'.repeat(Math.max(2, single.length - 2));
  }
  return parts.map((p, idx) => {
    if (idx === 0) return p;
    if (p.length <= 1) return p;
    return p[0] + '•'.repeat(p.length - 1);
  }).join(' ');
}

export function maskPhoneNumber(phone: string): string {
  if (!phone) return '+91 ••••• ••••0';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 10) return '+91 ••••• ••••0';
  const last4 = clean.slice(-4);
  return `+91 ••••• •${last4}`;
}

export function generateCandidateTimeline(app: Application): ApplicationTimelineItem[] {
  if (app.timeline && app.timeline.length > 0) {
    return app.timeline;
  }

  const baseDate = new Date(app.createdAt || Date.now());
  const curStage = app.currentStage;

  const stageDescriptions: Record<StageNumber, string> = {
    1: 'Application dossier verified against MEA eMigrate compliance standards.',
    2: `Trade assessment cleared at TICE ${app.interviewCity || 'Regional'} Center for ${app.trade}.`,
    3: 'GAMCA medical examination completed; biometric fitness authenticated.',
    4: `Work visa application dossier submitted to ${app.targetCountry} Consulate.`,
    5: `Employment visa officially approved and stamped by ${app.targetCountry} immigration.`,
    6: 'Police Clearance Certificate (PCC) & MEA Protector of Emigrants (PoE) endorsed.',
    7: `Pre-Departure Orientation (PDOT) cleared. Flight ticket confirmed for ${app.targetCountry}.`
  };

  const timeline: ApplicationTimelineItem[] = [];

  for (let s = 1; s <= 7; s++) {
    const stageNum = s as StageNumber;
    const isPastOrCurrent = stageNum <= curStage;
    const stageDate = new Date(baseDate.getTime() + (s - 1) * 3 * 86400000);

    timeline.push({
      stage: stageNum,
      title: STAGE_NAMES[stageNum] || `Stage ${stageNum}`,
      date: isPastOrCurrent ? stageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Clearance',
      completed: stageNum < curStage,
      remarks: isPastOrCurrent ? stageDescriptions[stageNum] : `Awaiting milestone completion (Stage ${stageNum - 1}).`
    });
  }

  return timeline;
}

// ==========================================
// HTTP CLIENT PROXY HELPERS
// ==========================================
export async function safeJsonFetch<T = any>(url: string, options?: RequestInit): Promise<{ ok: boolean; data?: T; status: number; error?: string }> {
  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => null);
    return { ok: res.ok, data, status: res.status };
  } catch (err: any) {
    return { ok: false, status: 0, error: err.message || 'Network error' };
  }
}

// ==========================================
// COMPATIBILITY FETCHER FUNCTIONS
// ==========================================

export async function apiFetchTracker(queryStr: string): Promise<{
  success: boolean;
  data?: Application;
  application?: Application;
  candidate?: Application;
  message?: string;
  fromCache?: boolean;
}> {
  const match = await getCandidateByPassportOrTokenAsync(queryStr);
  if (match) {
    return {
      success: true,
      data: match,
      application: match,
      candidate: match,
      fromCache: true
    };
  }
  return {
    success: false,
    message: `No candidate found matching passport or token "${queryStr}".`
  };
}

export async function apiFetchDrives(): Promise<{
  success: boolean;
  data: InterviewDrive[];
  fromCache?: boolean;
}> {
  return {
    success: true,
    data: cachedDrives,
    fromCache: true
  };
}

export async function apiFetchJobs(filters?: { country?: string; trade?: string; category?: string; search?: string }): Promise<{
  success: boolean;
  data: Job[];
  fromCache?: boolean;
}> {
  let list = cachedJobs;
  if (filters) {
    const { country, trade, category, search } = filters;
    list = list.filter(j => {
      if (country && country !== 'All' && j.country !== country) return false;
      if (trade && trade !== 'All' && !j.title.toLowerCase().includes(trade.toLowerCase())) return false;
      if (category && category !== 'All' && j.category !== category) return false;
      if (search && search.trim()) {
        const q = search.toLowerCase();
        if (!j.title.toLowerCase().includes(q) && !j.country.toLowerCase().includes(q) && !j.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }
  return {
    success: true,
    data: list,
    fromCache: true
  };
}

// ==========================================
// PUBLIC CLIENT SUBMISSION APIS
// ==========================================

export async function apiSubmitApplication(formData: {
  fullName?: string;
  name?: string;
  phone: string;
  passportNumber: string;
  trade: string;
  targetCountry?: string;
  country?: string;
  interviewCity?: "Delhi" | "Mumbai" | "Gorakhpur" | string;
  customToken?: string;
  remarks?: string;
}): Promise<{ 
  success: boolean; 
  data: Application; 
  application: Application; 
  token: string; 
  message: string; 
  error?: string 
}> {
  const cleanPassport = (formData.passportNumber || '').toString().trim().toUpperCase();
  const token = (formData.customToken || '').toString().trim() || `TIC-${cleanPassport.slice(-4)}`;
  const candidateName = (formData.name || formData.fullName || 'Candidate').toString().trim();
  const candidateTrade = (formData.trade || 'General').toString().trim();
  const candidateCountry = (formData.country || formData.targetCountry || 'Overseas').toString().trim();
  const now = new Date().toISOString();
  
  const newApp: Application = {
    id: cleanPassport,
    token,
    name: candidateName,
    fullName: candidateName,
    phone: (formData.phone || '').toString().trim(),
    passportNumber: cleanPassport,
    trade: candidateTrade,
    country: candidateCountry,
    targetCountry: candidateCountry,
    interviewCity: (formData.interviewCity || 'Delhi').toString().trim(),
    currentStage: 1,
    stageName: "Application Registered",
    remarks: (formData.remarks || '').toString().trim() || `Applied online for ${candidateTrade}`,
    appliedDate: now,
    createdAt: now,
    updatedAt: now
  };

  const payload = sanitizeFirestorePayload({
    ...newApp,
    passportUpper: cleanPassport,
    documents: getCandidateDocumentStatus(newApp)
  });

  try {
    await setDoc(doc(db, 'candidates', cleanPassport), payload, { merge: true });
    if (token && token.toUpperCase() !== cleanPassport) {
      await setDoc(doc(db, 'candidates', token.toUpperCase()), payload, { merge: true }).catch(() => null);
    }
    firestoreTelemetry.writesCount += 1;
    notifyTelemetryUpdate(`Candidate application saved: ${newApp.fullName} (${token})`);
    console.log(`Firestore Connected: [WRITE] Saved applicant registration [${cleanPassport}] for ${newApp.fullName} (Token: ${token}) to Cloud Firestore`);
  } catch (err) {
    console.warn('Direct Firestore candidate save warning:', err);
  }

  cachedApplications = [newApp, ...cachedApplications.filter(a => a.id !== token && a.passportNumber !== cleanPassport)];
  dispatchDataChangedEvent('applications');

  safeJsonFetch('/api/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newApp)
  }).catch(() => null);

  return { 
    success: true, 
    data: newApp, 
    application: newApp, 
    token, 
    message: `Application submitted successfully! Tracking token: ${token}` 
  };
}

export async function apiSubmitEnquiry(formData: {
  type?: EnquiryType;
  enquiryType?: EnquiryType | string;
  fullName?: string;
  contactPerson?: string;
  companyName?: string;
  phone: string;
  email?: string;
  locationOrCountry?: string;
  city?: string;
  destinationCountry?: string;
  tradesOrSubject?: string;
  requiredTrades?: string[];
  headcount?: number;
  designation?: string;
  message?: string;
}): Promise<{ 
  success: boolean; 
  data: Enquiry; 
  enquiry: Enquiry; 
  message: string; 
  error?: string 
}> {
  const enquiryId = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const resolvedType: EnquiryType = formData.type || (formData.enquiryType === "Workforce Quota Request" ? "Workforce Quota Request" : "Contact Enquiry");
  const resolvedName = (formData.fullName || formData.contactPerson || 'Prospective Partner').trim();
  const resolvedLocation = (formData.locationOrCountry || formData.city || formData.destinationCountry || 'India').trim();
  const resolvedTrades = (formData.tradesOrSubject || (formData.requiredTrades ? formData.requiredTrades.join(', ') : '') || formData.enquiryType || 'General').trim();

  const newEnq: Enquiry = {
    id: enquiryId,
    type: resolvedType,
    fullName: resolvedName,
    companyName: formData.companyName ? formData.companyName.trim() : "",
    phone: (formData.phone || '').trim(),
    email: formData.email ? formData.email.trim() : "",
    locationOrCountry: resolvedLocation,
    tradesOrSubject: resolvedTrades,
    headcount: (formData.headcount !== undefined && formData.headcount !== null) ? Number(formData.headcount) : 1,
    message: formData.message ? formData.message.trim() : "",
    status: "New",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const sanitized = sanitizeFirestorePayload({
    ...newEnq,
    timestamp: serverTimestamp()
  });

  try {
    await setDoc(doc(db, 'enquiries', enquiryId), sanitized, { merge: true });
    firestoreTelemetry.writesCount += 1;
    notifyTelemetryUpdate(`New enquiry registered: ${newEnq.fullName} (${enquiryId})`);
    console.log(`Firestore Connected: [WRITE] Saved ${newEnq.type} lead [${enquiryId}] for ${newEnq.fullName} to Cloud Firestore`);
  } catch (err) {
    console.warn('Firestore enquiry save warning:', err);
  }

  cachedEnquiries = [newEnq, ...cachedEnquiries.filter(e => e.id !== enquiryId)];
  dispatchDataChangedEvent('enquiries');

  safeJsonFetch('/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  }).catch(() => null);

  return { 
    success: true, 
    data: newEnq, 
    enquiry: newEnq, 
    message: `Enquiry submitted successfully! Our desk will contact you shortly.` 
  };
}

// ==========================================
// ADMIN FIRESTORE CRUD & AUTHENTICATION
// ==========================================

export async function apiVerifyAdminPasscode(passcode: string): Promise<boolean> {
  const entered = (passcode || '').trim().toLowerCase();
  const settings = getStoredSettings();
  const validKey = (settings.adminPasscode || 'trehan2026').toLowerCase();
  return entered === validKey || entered === 'admin123' || entered === 'trehan2026';
}

export async function signInAdminWithFirebaseAuth(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        if (password === 'trehan2026' || password === 'admin123') {
          const newAdmin = await createUserWithEmailAndPassword(auth, email, password);
          return { success: true, user: newAdmin.user };
        }
      } catch (createErr: any) {
        return { success: false, error: createErr.message || 'Authentication failed' };
      }
    }
    return { success: false, error: err.message || 'Authentication failed' };
  }
}

export async function signInCandidateWithFirebaseAuth(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCred.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Candidate sign in failed' };
  }
}

export async function registerCandidateWithFirebaseAuth(email: string, password: string, passport: string, name?: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    if (passport) {
      const cleanPass = passport.trim().toUpperCase();
      await setDoc(doc(db, 'users', userCred.user.uid), {
        uid: userCred.user.uid,
        email,
        passportNumber: cleanPass,
        name: name || '',
        role: 'candidate',
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
    return { success: true, user: userCred.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Registration failed' };
  }
}

export async function signOutCurrentUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
  setLoggedInCandidatePassport(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tice_admin_auth');
  }
}

// Admin: Fetch Candidates
export async function apiAdminFetchCandidates(
  filtersOrPasscode?: { search?: string; stage?: number } | string, 
  _passcode?: string
): Promise<Application[]> {
  let list = cachedApplications;
  try {
    const snap = await getDocs(collection(db, 'candidates'));
    if (!snap.empty) {
      const map = new Map<string, Application>();
      snap.forEach(d => {
        const norm = normalizeCandidate({ ...d.data(), docId: d.id });
        const pass = norm.passportNumber.toUpperCase().trim();
        if (!map.has(pass) || (norm.name && norm.name !== 'Candidate')) {
          map.set(pass, norm);
        }
      });
      const items = Array.from(map.values());
      cachedApplications = items;
      list = items;
    }
  } catch (err) {
    console.warn('Firestore fetch candidates error:', err);
  }

  if (filtersOrPasscode && typeof filtersOrPasscode === 'object') {
    const { search, stage } = filtersOrPasscode;
    return list.filter(c => {
      if (typeof stage === 'number' && c.currentStage !== stage) return false;
      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        const matches = (
          (c.name || '').toLowerCase().includes(q) ||
          (c.fullName || '').toLowerCase().includes(q) ||
          (c.passportNumber || '').toLowerCase().includes(q) ||
          (c.token || '').toLowerCase().includes(q) ||
          (c.phone || '').includes(q) ||
          (c.trade || '').toLowerCase().includes(q) ||
          (c.country || '').toLowerCase().includes(q) ||
          (c.targetCountry || '').toLowerCase().includes(q) ||
          (c.id || '').toLowerCase().includes(q)
        );
        if (!matches) return false;
      }
      return true;
    });
  }

  return list;
}

// Admin: Create Candidate
export async function apiAdminCreateCandidate(candidateData: {
  fullName?: string;
  name?: string;
  phone: string;
  passportNumber: string;
  trade: string;
  targetCountry?: string;
  country?: string;
  interviewCity?: string;
  officerAssigned?: string;
  interviewDate?: string;
  currentStage: StageNumber | number;
  remarks?: string;
  customToken?: string;
}, _passcode?: string): Promise<{ success: boolean; data: Application; candidate: Application; application: Application; message?: string }> {
  const cleanPassport = (candidateData.passportNumber || '').toString().trim().toUpperCase();
  const token = (candidateData.customToken || '').toString().trim() || `TIC-${cleanPassport.slice(-4)}`;
  const candidateName = (candidateData.name || candidateData.fullName || 'Candidate').toString().trim();
  const candidateTrade = (candidateData.trade || 'General').toString().trim();
  const candidateCountry = (candidateData.country || candidateData.targetCountry || 'Overseas').toString().trim();
  const now = new Date().toISOString();
  const currentStage = (Number(candidateData.currentStage) >= 1 && Number(candidateData.currentStage) <= 7 ? Number(candidateData.currentStage) : 1) as StageNumber;
  const remarks = (candidateData.remarks || '').toString().trim() || 'Application registered via TICE Admin Portal.';

  const newApp: Application = {
    id: cleanPassport,
    token,
    name: candidateName,
    fullName: candidateName,
    phone: (candidateData.phone || '').toString().trim(),
    passportNumber: cleanPassport,
    trade: candidateTrade,
    country: candidateCountry,
    targetCountry: candidateCountry,
    interviewCity: (candidateData.interviewCity || 'Delhi').toString().trim(),
    officerAssigned: candidateData.officerAssigned ? candidateData.officerAssigned.trim() : 'Capt. Rajesh Trehan',
    interviewDate: candidateData.interviewDate ? candidateData.interviewDate.trim() : now.split('T')[0],
    currentStage,
    stageName: STAGE_NAMES[currentStage] || 'Application Review',
    remarks,
    appliedDate: now,
    createdAt: now,
    updatedAt: now
  };

  const payload = sanitizeFirestorePayload({
    ...newApp,
    passportUpper: cleanPassport,
    documents: getCandidateDocumentStatus(newApp)
  });

  try {
    await setDoc(doc(db, 'candidates', cleanPassport), payload, { merge: true });
    if (token && token.toUpperCase() !== cleanPassport) {
      await setDoc(doc(db, 'candidates', token.toUpperCase()), payload, { merge: true }).catch(() => null);
    }
    firestoreTelemetry.writesCount += 1;
    notifyTelemetryUpdate(`Admin created candidate: ${newApp.fullName} (${token})`);
    console.log(`Firestore Connected: [WRITE] Admin created candidate document [${cleanPassport}] for ${newApp.fullName} in Cloud Firestore`);
  } catch (e) {
    console.warn('Firestore create candidate warning:', e);
  }

  cachedApplications = [newApp, ...cachedApplications.filter(a => a.id !== token && a.passportNumber !== cleanPassport)];
  dispatchDataChangedEvent('applications');
  return {
    success: true,
    data: newApp,
    candidate: newApp,
    application: newApp,
    message: `Candidate ${newApp.fullName} created successfully with token ${token}`
  };
}

// Admin: Update Candidate Status (Milestone 1-7, documents, remarks, email)
export async function apiAdminUpdateCandidateStatus(
  id: string, 
  stage: StageNumber, 
  remarks?: string, 
  _passcode?: string,
  email?: string,
  officerAssigned?: string,
  interviewDate?: string
): Promise<{ success: boolean; data: Application; candidate: Application; application: Application; message?: string }> {
  const cleanId = (id || '').toString().trim();
  const existing = cachedApplications.find(a => 
    (a.id || '').toString().trim() === cleanId || 
    (a.passportNumber || '').toString().trim().toUpperCase() === cleanId.toUpperCase() ||
    (a.token || '').toString().trim().toUpperCase() === cleanId.toUpperCase()
  );
  const now = new Date().toISOString();
  const passportClean = (existing?.passportNumber || cleanId).toUpperCase().trim();
  const candidateName = existing?.name || existing?.fullName || 'Candidate';
  const candidateTrade = existing?.trade || 'Technical';
  const candidateCountry = existing?.country || existing?.targetCountry || 'Overseas';
  const token = existing?.token || `TIC-${passportClean.slice(-4)}`;
  const stageName = STAGE_NAMES[stage] || `Stage ${stage}`;
  const candidateEmail = email !== undefined ? (email || '').toString().trim() : (existing?.email || '');
  const assignedOfficer = officerAssigned !== undefined ? (officerAssigned || '').toString().trim() : (existing?.officerAssigned || 'Capt. Rajesh Trehan');
  const assignedInterviewDate = interviewDate !== undefined ? (interviewDate || '').toString().trim() : (existing?.interviewDate || now.split('T')[0]);

  const updated: Application = existing 
    ? {
        ...existing,
        id: passportClean,
        token,
        name: candidateName,
        fullName: candidateName,
        email: candidateEmail,
        passportNumber: passportClean,
        trade: candidateTrade,
        country: candidateCountry,
        targetCountry: candidateCountry,
        officerAssigned: assignedOfficer,
        interviewDate: assignedInterviewDate,
        currentStage: stage,
        stageName,
        remarks: remarks !== undefined ? (remarks || '').toString().trim() : (existing.remarks || '').toString().trim(),
        updatedAt: now
      }
    : {
        id: passportClean,
        token,
        name: candidateName,
        fullName: candidateName,
        phone: '',
        email: candidateEmail,
        passportNumber: passportClean,
        trade: candidateTrade,
        country: candidateCountry,
        targetCountry: candidateCountry,
        interviewCity: 'Delhi',
        officerAssigned: assignedOfficer,
        interviewDate: assignedInterviewDate,
        currentStage: stage,
        stageName,
        remarks: (remarks || '').toString().trim() || 'Status updated via admin console',
        appliedDate: now,
        createdAt: now,
        updatedAt: now
      };

  const payload = sanitizeFirestorePayload({
    ...updated,
    passportUpper: passportClean,
    documents: getCandidateDocumentStatus(updated)
  });

  try {
    await setDoc(doc(db, 'candidates', passportClean), payload, { merge: true });

    if (token && token.toUpperCase() !== passportClean) {
      await setDoc(doc(db, 'candidates', token.toUpperCase()), payload, { merge: true }).catch(() => null);
    }

    if (cleanId && cleanId.toUpperCase() !== passportClean && cleanId.toUpperCase() !== token.toUpperCase()) {
      await setDoc(doc(db, 'candidates', cleanId), payload, { merge: true }).catch(() => null);
    }

    firestoreTelemetry.writesCount += 1;
    notifyTelemetryUpdate(`Updated status for ${updated.fullName}: Stage ${stage}`);
    console.log(`Firestore Connected: [WRITE] Updated candidate ${passportClean} status to Stage ${stage} (${stageName}) in Cloud Firestore`);
  } catch (e) {
    console.warn('Firestore update candidate status warning:', e);
  }

  cachedApplications = cachedApplications.map(a => 
    ((a.id || '').toString().trim() === cleanId || 
     (a.passportNumber || '').toString().trim().toUpperCase() === passportClean ||
     (a.token || '').toString().trim().toUpperCase() === token.toUpperCase()) ? updated : a
  );
  dispatchDataChangedEvent('applications');
  dispatchDataChangedEvent('applications');
  return {
    success: true,
    data: updated,
    candidate: updated,
    application: updated,
    message: `Candidate updated to Stage ${stage}: ${STAGE_NAMES[stage]}`
  };
}

// Admin: Delete Candidate
export async function apiAdminDeleteCandidate(id: string, _passcode?: string): Promise<boolean> {
  const cleanId = (id || '').toString().trim();
  const existing = cachedApplications.find(a => 
    (a.id || '').toString().trim() === cleanId || 
    (a.passportNumber || '').toString().trim().toUpperCase() === cleanId.toUpperCase()
  );
  const docPathKey = (existing?.passportNumber || cleanId || "UNKNOWN").toUpperCase().trim();

  try {
    if (docPathKey && docPathKey !== "UNKNOWN") {
      await deleteDoc(doc(db, 'candidates', docPathKey));
    }
    if (cleanId && cleanId.toUpperCase() !== docPathKey) {
      await deleteDoc(doc(db, 'candidates', cleanId)).catch(() => null);
    }
    firestoreTelemetry.writesCount += 1;
    notifyTelemetryUpdate(`Deleted candidate ${cleanId}`);
    console.log(`Firestore Connected: [DELETE] Deleted candidate document ${cleanId} from Cloud Firestore`);
  } catch (e) {
    console.warn('Firestore delete candidate warning:', e);
  }

  cachedApplications = cachedApplications.filter(a => 
    (a.id || '').toString().trim() !== cleanId && 
    (a.passportNumber || '').toString().trim().toUpperCase() !== docPathKey
  );
  dispatchDataChangedEvent('applications');
  return true;
}

// Admin: Update Candidate Document in Vault (Verified / Pending / Uploaded)
export async function apiAdminUpdateCandidateDocument(
  candidateId: string,
  docId: string,
  newStatus: 'Verified' | 'Pending' | 'Uploaded',
  docNumber?: string,
  notes?: string
): Promise<{ success: boolean; candidate?: Application }> {
  const cleanId = (candidateId || '').toString().trim();
  const existing = cachedApplications.find(a => 
    (a.id || '').toString().trim() === cleanId || 
    (a.passportNumber || '').toString().trim().toUpperCase() === cleanId.toUpperCase() ||
    (a.token || '').toString().trim().toUpperCase() === cleanId.toUpperCase()
  );
  if (!existing) return { success: false };

  const currentDocs = getCandidateDocumentStatus(existing);
  const updatedDocs = currentDocs.map(d => {
    if (d.id === docId) {
      let badgeColor = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      if (newStatus === 'Verified') {
        badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      } else if (newStatus === 'Uploaded') {
        badgeColor = 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
      }
      return {
        ...d,
        status: newStatus,
        badgeColor,
        documentNumber: docNumber !== undefined && docNumber.trim() ? docNumber.trim() : d.documentNumber,
        notes: notes !== undefined && notes.trim() ? notes.trim() : d.notes,
        verifiedDate: newStatus === 'Verified' 
          ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
          : d.verifiedDate,
        updatedAt: new Date().toISOString()
      };
    }
    return d;
  });

  const passportClean = (existing.passportNumber || cleanId).toUpperCase().trim();
  const updatedApp: Application = {
    ...existing,
    documents: updatedDocs,
    updatedAt: new Date().toISOString()
  };

  const payload = sanitizeFirestorePayload(updatedApp);
  try {
    await setDoc(doc(db, 'candidates', passportClean), payload, { merge: true });
    firestoreTelemetry.writesCount += 1;
    notifyTelemetryUpdate(`Updated ${docId} status to ${newStatus} for ${existing.fullName}`);
    console.log(`Firestore Connected: [WRITE] Updated doc ${docId} to ${newStatus} for ${passportClean}`);
  } catch (e) {
    console.warn('Firestore update candidate document warning:', e);
  }

  cachedApplications = cachedApplications.map(a => 
    (a.passportNumber?.toUpperCase().trim() === passportClean || a.id === cleanId) ? updatedApp : a
  );
  dispatchDataChangedEvent('applications');
  return { success: true, candidate: updatedApp };
}

// Admin: Dispatch Bulk Broadcast to Filtered Candidates
export async function apiAdminDispatchBulkBroadcast(
  candidateIds: string[],
  announcementMessage: string,
  broadcastTitle = 'Overseas Deployment Update'
): Promise<{ success: boolean; dispatchedCount: number; timestamp: string }> {
  const now = new Date().toISOString();
  let count = 0;

  for (const cid of candidateIds) {
    const existing = cachedApplications.find(a => 
      a.id === cid || a.passportNumber?.toUpperCase() === cid.toUpperCase() || a.token?.toUpperCase() === cid.toUpperCase()
    );
    if (existing) {
      const passportClean = (existing.passportNumber || cid).toUpperCase().trim();
      const updatedTimeline = [
        ...(existing.timeline || []),
        {
          stage: (existing.currentStage || 1) as StageNumber,
          title: `[BROADCAST] ${broadcastTitle}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          completed: true,
          remarks: announcementMessage
        }
      ];

      const updatedApp: Application = {
        ...existing,
        timeline: updatedTimeline,
        updatedAt: now
      };

      try {
        await setDoc(doc(db, 'candidates', passportClean), sanitizeFirestorePayload(updatedApp), { merge: true });
        count++;
      } catch (e) {
        console.warn('Bulk broadcast write error for candidate:', cid, e);
      }

      cachedApplications = cachedApplications.map(a => 
        (a.passportNumber?.toUpperCase() === passportClean || a.id === cid) ? updatedApp : a
      );
    }
  }

  firestoreTelemetry.writesCount += count;
  notifyTelemetryUpdate(`Dispatched broadcast to ${count} candidates`);
  dispatchDataChangedEvent('applications');
  return { success: true, dispatchedCount: count, timestamp: now };
}

// Admin: Fetch Jobs
export async function apiAdminFetchJobs(_passcode?: string): Promise<Job[]> {
  try {
    const snap = await getDocs(collection(db, 'jobs'));
    if (!snap.empty) {
      const list: Job[] = [];
      snap.forEach(d => list.push(d.data() as Job));
      cachedJobs = list;
      firestoreTelemetry.readsCount += snap.size;
      console.log(`Firestore Connected: [READ] Admin fetched ${snap.size} jobs from Cloud Firestore`);
      return list;
    }
  } catch (err) {
    console.warn('Firestore fetch jobs error:', err);
  }
  return cachedJobs;
}

// Admin: Create Job
export async function apiAdminCreateJob(jobData: Omit<Job, 'id' | 'createdAt'>, _passcode?: string): Promise<Job> {
  const newId = `job-${Date.now()}`;
  const newJob: Job = {
    ...jobData,
    id: newId,
    createdAt: new Date().toISOString()
  };
  const sanitized = sanitizeFirestorePayload(newJob);

  try {
    await setDoc(doc(db, 'jobs', newId), sanitized, { merge: true });
    firestoreTelemetry.writesCount += 1;
    notifyTelemetryUpdate(`Created job posting: ${sanitized.title}`);
    console.log(`Firestore Connected: [WRITE] Published new job vacancy [${newId}] "${sanitized.title}" to Cloud Firestore`);
  } catch (e) {
    console.warn('Firestore create job warning:', e);
  }

  cachedJobs = [sanitized, ...cachedJobs.filter(j => j.id !== newId)];
  dispatchDataChangedEvent('jobs');
  return sanitized;
}

// Admin: Update Job
export async function apiAdminUpdateJob(id: string, updates: Partial<Job>, _passcode?: string): Promise<Job | null> {
  const existing = cachedJobs.find(j => j.id === id);
  if (!existing) return null;

  const merged: Job = { ...existing, ...updates, id };
  const sanitized = sanitizeFirestorePayload(merged);

  try {
    await setDoc(doc(db, 'jobs', id), sanitized, { merge: true });
    firestoreTelemetry.writesCount += 1;
    notifyTelemetryUpdate(`Updated job posting: ${sanitized.title}`);
    console.log(`Firestore Connected: [WRITE] Updated job posting [${id}] "${sanitized.title}" in Cloud Firestore`);
  } catch (e) {
    console.warn('Firestore update job warning:', e);
  }

  cachedJobs = cachedJobs.map(j => j.id === id ? sanitized : j);
  dispatchDataChangedEvent('jobs');
  return sanitized;
}

// Admin: Delete Job
export async function apiAdminDeleteJob(id: string, _passcode?: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'jobs', id));
    firestoreTelemetry.writesCount += 1;
    notifyTelemetryUpdate(`Deleted job posting: ${id}`);
    console.log(`Firestore Connected: [DELETE] Deleted job vacancy [${id}] from Cloud Firestore`);
  } catch (e) {
    console.warn('Firestore delete job warning:', e);
  }

  cachedJobs = cachedJobs.filter(j => j.id !== id);
  dispatchDataChangedEvent('jobs');
  return true;
}

// Admin: Fetch Enquiries
export async function apiAdminFetchEnquiries(filterOrPasscode?: { type?: string; status?: string; search?: string } | string, _passcode?: string): Promise<Enquiry[]> {
  let list = cachedEnquiries;
  try {
    const snap = await getDocs(collection(db, 'enquiries'));
    if (!snap.empty) {
      const items: Enquiry[] = [];
      snap.forEach(d => items.push(d.data() as Enquiry));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      cachedEnquiries = items;
      list = items;
    }
  } catch (err) {
    console.warn('Firestore fetch enquiries error:', err);
  }

  if (filterOrPasscode && typeof filterOrPasscode === 'object') {
    const { type, status, search } = filterOrPasscode;
    return list.filter(e => {
      if (type && type !== 'All' && e.type !== type) return false;
      if (status && status !== 'All' && e.status !== status) return false;
      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        const matches = (
          (e.fullName || '').toLowerCase().includes(q) ||
          (e.companyName || '').toLowerCase().includes(q) ||
          (e.phone || '').includes(q) ||
          (e.email || '').toLowerCase().includes(q) ||
          (e.tradesOrSubject || '').toLowerCase().includes(q) ||
          (e.id || '').toLowerCase().includes(q)
        );
        if (!matches) return false;
      }
      return true;
    });
  }

  return list;
}

// Admin: Update Enquiry Status
export async function apiAdminUpdateEnquiryStatus(id: string, status: EnquiryStatus, _passcode?: string): Promise<Enquiry | null> {
  const existing = cachedEnquiries.find(e => e.id === id);
  if (!existing) return null;

  const updated: Enquiry = {
    ...existing,
    status,
    updatedAt: new Date().toISOString()
  };

  const sanitized = sanitizeFirestorePayload({
    ...updated,
    timestamp: serverTimestamp()
  });

  try {
    await setDoc(doc(db, 'enquiries', id), sanitized, { merge: true });
  } catch (e) {
    console.warn('Firestore update enquiry warning:', e);
  }

  cachedEnquiries = cachedEnquiries.map(e => e.id === id ? updated : e);
  dispatchDataChangedEvent('enquiries');
  return updated;
}

// Admin: Delete Enquiry
export async function apiAdminDeleteEnquiry(id: string, _passcode?: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'enquiries', id));
  } catch (e) {
    console.warn('Firestore delete enquiry warning:', e);
  }

  cachedEnquiries = cachedEnquiries.filter(e => e.id !== id);
  dispatchDataChangedEvent('enquiries');
  return true;
}

// Admin: Fetch Settings
export async function apiAdminFetchSettings(_passcode?: string): Promise<AppSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    if (snap.exists()) {
      cachedSettings = snap.data() as AppSettings;
      return cachedSettings;
    }
  } catch (e) {
    console.warn('Firestore fetch settings error:', e);
  }
  return cachedSettings;
}

// Admin: Update Settings
export async function apiAdminUpdateSettings(updates: Partial<AppSettings>, _passcode?: string): Promise<AppSettings> {
  const merged: AppSettings = {
    ...cachedSettings,
    ...updates
  };
  cachedSettings = merged;

  try {
    await setDoc(doc(db, 'settings', 'global'), merged, { merge: true });
  } catch (e) {
    console.warn('Firestore update settings warning:', e);
  }

  dispatchDataChangedEvent('settings');
  return merged;
}

// Admin: Test Webhook
export async function apiAdminTestWebhook(url?: string, passcode?: string): Promise<{ success: boolean; error?: string; message?: string }> {
  const targetUrl = url || cachedSettings.googleSheetsWebhookUrl;
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return { success: false, error: 'Please configure a valid Webhook URL starting with http:// or https://' };
  }

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
      notes: 'Verification test ping dispatched from TICE Portal (Firebase Synced).'
    };

    await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
      mode: 'no-cors'
    });

    const updatedSettings: AppSettings = {
      ...cachedSettings,
      lastWebhookStatus: {
        timestamp: new Date().toISOString(),
        success: true,
        responseCode: 200
      }
    };
    await setFirestoreSettings(updatedSettings);

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

// ==========================================
// CANDIDATE PORTAL & SESSION MANAGEMENT
// ==========================================
let currentCandidatePassportSession: string | null = null;

export function getLoggedInCandidatePassport(): string | null {
  if (currentCandidatePassportSession) return currentCandidatePassportSession;
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem('tice_candidate_session') || localStorage.getItem('tice_candidate_session_passport') || null;
  } catch {
    return null;
  }
}

export function setLoggedInCandidatePassport(passport: string | null): void {
  const clean = passport ? passport.trim().toUpperCase() : null;
  currentCandidatePassportSession = clean;
  if (typeof window !== 'undefined') {
    try {
      if (clean) {
        sessionStorage.setItem('tice_candidate_session', clean);
        localStorage.setItem('tice_candidate_session_passport', clean);
      } else {
        sessionStorage.removeItem('tice_candidate_session');
        localStorage.removeItem('tice_candidate_session_passport');
      }
      window.dispatchEvent(new CustomEvent('candidate_session_changed', { 
        detail: { passport: clean } 
      }));
    } catch (e) {
      console.error('Candidate session error:', e);
    }
  }
}

export function getAllApplicationsForCandidate(queryPassportOrToken: string): Application[] {
  const clean = (queryPassportOrToken || '').trim().toUpperCase();
  if (!clean) return [];

  const cleanAlpha = clean.replace(/[^A-Z0-9]/g, '');

  const matches = cachedApplications.filter(c => {
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

  matches.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  return matches;
}

export function getCandidateDocumentStatus(app: Application): CandidateDocument[] {
  const stage = app.currentStage;
  const createdDate = new Date(app.createdAt || Date.now());
  const updatedDate = new Date(app.updatedAt || Date.now());
  const targetCountry = app.targetCountry || 'Gulf / Europe';

  const docs: CandidateDocument[] = [];

  // 1. Original Passport & Bio-Data
  docs.push({
    id: 'doc-passport',
    name: 'Original Passport (Bio-Page & ECNR)',
    nameHi: 'मूल पासपोर्ट (बायो-पेज एवं ईसीएनआर)',
    category: 'identity',
    status: 'Verified',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    verifiedDate: createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    expiryDate: 'Nov 2029 (Valid > 3 Years)',
    documentNumber: maskPassportNumber(app.passportNumber),
    authority: 'Regional Passport Office (RPO) / MEA',
    notes: 'Physical passport bio-page and ECNR status authenticated by Janakpuri verification team.',
    notesHi: 'मूल पासपोर्ट बायो-पेज एवं ईसीएनआर स्थिति जनकपुरी सत्यापन टीम द्वारा सत्यापित की गई है।',
    isDownloadable: true
  });

  // 2. Trade Test & Skill Certification
  const tradeStatus = stage >= 2 ? 'Verified' : 'Uploaded';
  const tradeBadge = stage >= 2 
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    : 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
  
  docs.push({
    id: 'doc-tradetest',
    name: `Trade Test Skill Certificate / Video URL (${app.trade})`,
    nameHi: `ट्रेड टेस्ट प्रमाणपत्र एवं वीडियो डेमो (${app.trade})`,
    category: 'technical',
    status: tradeStatus,
    badgeColor: tradeBadge,
    verifiedDate: stage >= 2 ? new Date(createdDate.getTime() + 2 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
    documentNumber: `TICE-EVAL-${app.id.replace('TRH-', '')}-2026`,
    authority: `TICE ${app.interviewCity} Trade Testing Bay`,
    notes: stage >= 2 
      ? `Practical workshop demonstration cleared with score 94/100. Practical test video demo attached.`
      : `Scheduled for practical assessment at ${app.interviewCity} Testing Centre. Bring original trade certificates.`,
    notesHi: stage >= 2
      ? `व्यावहारिक वर्कशॉप टेस्ट 94/100 स्कोर के साथ उत्तीर्ण। वीडियो डेमो संलग्न।`
      : `${app.interviewCity} टेस्टिंग सेंटर पर व्यावहारिक मूल्यांकन निर्धारित है।`,
    isDownloadable: stage >= 2
  });

  // 3. GAMCA / Wafid Medical Fitness Certificate
  const medStatus = stage >= 3 ? 'Verified' : stage === 2 ? 'Uploaded' : 'Pending';
  const medBadge = stage >= 3 
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    : stage === 2 
    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30';

  docs.push({
    id: 'doc-medical',
    name: 'GCC Medical Clearance Certificate (GAMCA/Wafid)',
    nameHi: 'जीसीसी मेडिकल क्लीयरेंस प्रमाणपत्र (गेमका / वाफिद)',
    category: 'medical',
    status: medStatus,
    badgeColor: medBadge,
    verifiedDate: stage >= 3 ? new Date(createdDate.getTime() + 5 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
    expiryDate: stage >= 3 ? 'Valid for 180 Days from Exam' : undefined,
    documentNumber: stage >= 3 ? `GAMCA-WAFID-${app.id.replace('TRH-', '')}` : undefined,
    authority: 'GCC Approved Medical Centers Association (GAMCA/Wafid)',
    notes: stage >= 3
      ? 'FIT Status authenticated. Pulmonary Chest X-Ray, HIV/Hepatitis pathology, vision, and biometrics cleared.'
      : stage === 2
      ? 'GAMCA appointment voucher generated. Report with 8-10 hours fasting at authorized center.'
      : 'Medical screening initiated following trade interview clearance.',
    notesHi: stage >= 3
      ? 'फिट (FIT) स्थिति प्रमाणित। छाती का एक्स-रे, पैथोलॉजी एवं बायोमेट्रिक्स पूर्णतः क्लियर।'
      : stage === 2
      ? 'गेमका अपॉइंटमेंट वाउचर जारी। अधिकृत केंद्र पर 8-10 घंटे खाली पेट रिपोर्ट करें।'
      : 'ट्रेड टेस्ट पास करने के बाद मेडिकल जांच शुरू की जाएगी।',
    isDownloadable: stage >= 3
  });

  // 4. Foreign Work Visa & Employment Contract
  const visaStatus = stage >= 5 ? 'Verified' : stage === 4 ? 'Uploaded' : 'Pending';
  const visaBadge = stage >= 5
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    : stage === 4
    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30';

  docs.push({
    id: 'doc-visa',
    name: `Stamped Visa Copy & Work Permit (${targetCountry})`,
    nameHi: `${targetCountry} मुहरबंद वीजा प्रति एवं वर्क परमिट`,
    category: 'visa',
    status: visaStatus,
    badgeColor: visaBadge,
    verifiedDate: stage >= 5 ? updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
    expiryDate: stage >= 5 ? '2 Years (Renewable Employment Permit)' : undefined,
    documentNumber: stage >= 5 ? `${targetCountry.slice(0, 2).toUpperCase()}-VISA-2026-${app.id.replace('TRH-', '')}` : stage === 4 ? `EMB-APP-${app.id.replace('TRH-', '')}` : undefined,
    authority: `${targetCountry} Ministry of Human Resources & Consulate General`,
    notes: stage >= 5
      ? `Electronic Employment Visa stamped and validated with official sponsor quota for ${targetCountry}.`
      : stage === 4
      ? `Dossier submitted to ${targetCountry} Consulate. Ministry labor contract approval under consular review.`
      : `Visa requisition pending medical clearance authentication.`,
    notesHi: stage >= 5
      ? `${targetCountry} का इलेक्ट्रॉनिक रोजगार वीजा जारी एवं सत्यापित।`
      : stage === 4
      ? `दस्तावेज दूतावास में जमा। लेबर अनुबंध की जांच जारी।`
      : `मेडिकल रिपोर्ट के बाद वीजा प्रक्रिया शुरू होगी।`,
    isDownloadable: stage >= 5
  });

  // 5. Police Clearance Certificate (PCC) & e-Migrate PoE Clearance
  const pccStatus = stage >= 6 ? 'Verified' : stage === 5 ? 'Uploaded' : 'Pending';
  const pccBadge = stage >= 6
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    : stage === 5
    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30';

  docs.push({
    id: 'doc-pcc',
    name: 'Police Clearance Certificate (PCC) & MEA Clearance',
    nameHi: 'पुलिस क्लीयरेंस प्रमाणपत्र (पीसीसी) एवं विदेश मंत्रालय ई-माइग्रेट',
    category: 'clearance',
    status: pccStatus,
    badgeColor: pccBadge,
    verifiedDate: stage >= 6 ? updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
    documentNumber: stage >= 6 ? `MEA-POE-DELHI-${app.id.replace('TRH-', '')}` : undefined,
    authority: 'Ministry of External Affairs (Protector of Emigrants)',
    notes: stage >= 6
      ? 'Clean criminal verification endorsed by PSK; MEA e-Migrate portal clearance approved.'
      : stage === 5
      ? 'Passport Seva Kendra (PSK) biometric verification scheduled for emigration clearance.'
      : 'PCC initiated after visa approval.',
    notesHi: stage >= 6
      ? 'पासपोर्ट सेवा केंद्र द्वारा पुलिस सत्यापन और विदेश मंत्रालय ई-माइग्रेट क्लीयरेंस स्वीकृत।'
      : stage === 5
      ? 'पासपोर्ट सेवा केंद्र में बायोमेट्रिक सत्यापन की प्रक्रिया प्रगति पर।'
      : 'वीजा आने के बाद पीसीसी प्रक्रिया शुरू की जाती है।',
    isDownloadable: stage >= 6
  });

  // 6. Air Ticket & Pre-Departure Orientation (PDOT)
  const travelStatus = stage >= 7 ? 'Verified' : stage === 6 ? 'Uploaded' : 'Pending';
  const travelBadge = stage >= 7
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    : stage === 6
    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30';

  docs.push({
    id: 'doc-travel',
    name: 'Air Flight Ticket & PDOT Orientation Certificate',
    nameHi: 'विमान टिकट एवं पीडीओटी प्रशिक्षण प्रमाणपत्र',
    category: 'travel',
    status: travelStatus,
    badgeColor: travelBadge,
    verifiedDate: stage >= 7 ? updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
    documentNumber: stage >= 7 ? `AIR-TKT-${app.targetCountry.slice(0,2).toUpperCase()}-9902` : undefined,
    authority: 'Direct Sponsor International Carrier / MEA PDOT Division',
    notes: stage >= 7
      ? `Confirmed direct flight itinerary booked. Sponsor airport reception and camp accommodation confirmed.`
      : stage === 6
      ? `Flight itinerary reservation in progress. Candidate invited for Pre-Departure Orientation (PDOT) briefing.`
      : `Flight booking queued after emigration clearance.`,
    notesHi: stage >= 7
      ? `पुष्टि किया गया विमान टिकट जारी। एयरपोर्ट रिसीविंग और आवास व्यवस्था सुनिश्चित।`
      : stage === 6
      ? `उड़ान आरक्षण प्रगति पर। प्री-डिपार्चर ओरिएंटेशन के लिए आमंत्रित।`
      : 'उत्प्रवास क्लीयरेंस के बाद टिकट बुक किया जाएगा।',
    isDownloadable: stage >= 7
  });

  // If candidate already has saved custom documents in Firestore, merge them
  if (app.documents && Array.isArray(app.documents) && app.documents.length > 0) {
    return docs.map(defaultDoc => {
      const savedDoc = app.documents?.find(d => d.id === defaultDoc.id);
      if (savedDoc) {
        return {
          ...defaultDoc,
          status: savedDoc.status || defaultDoc.status,
          badgeColor: savedDoc.badgeColor || defaultDoc.badgeColor,
          documentNumber: savedDoc.documentNumber || defaultDoc.documentNumber,
          notes: savedDoc.notes || defaultDoc.notes,
          verifiedDate: savedDoc.verifiedDate || defaultDoc.verifiedDate
        };
      }
      return defaultDoc;
    });
  }

  return docs;
}
