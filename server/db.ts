import fs from 'fs';
import path from 'path';
import { Job, Application, InterviewDrive, AppSettings, StageNumber, STAGE_NAMES, Enquiry, EnquiryStatus } from '../src/types';

interface DatabaseSchema {
  jobs: Job[];
  applications: Application[];
  interviewDrives: InterviewDrive[];
  appSettings: AppSettings;
  enquiries: Enquiry[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_JOBS: Job[] = [
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

const INITIAL_APPLICATIONS: Application[] = [
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

const INITIAL_DRIVES: InterviewDrive[] = [
  {
    id: "drv-1",
    city: "Delhi",
    venue: "TICE Corporate HQ, Unit No. UG-1 & 2, Westend Mall, Janakpuri District Center, New Delhi - 110058",
    driveDate: "Oct 22, 2026 (10:00 AM - 05:30 PM)",
    tradesAllowed: ["Civil Mason", "Electrician", "HVAC Technician", "Logistics Van Driver"],
    countryDestination: "Qatar, Oman & Russia"
  },
  {
    id: "drv-2",
    city: "Mumbai",
    venue: "TICE Trade Testing Centre, Plot 14-B, MIDC Andheri East, Mumbai, Maharashtra - 400093",
    driveDate: "Oct 18, 2026 (09:30 AM - 06:00 PM)",
    tradesAllowed: ["6G Pipe Welder", "MEP Technician", "HVAC Technician", "Structural Fitter"],
    countryDestination: "Oman (Duqm Refinery Project) & Russia"
  },
  {
    id: "drv-3",
    city: "Gorakhpur",
    venue: "TICE Regional Center, Hotel Royal Residency Complex, University Road, Gorakhpur, UP - 273009",
    driveDate: "Oct 14, 2026 (09:00 AM - 05:00 PM)",
    tradesAllowed: ["Logistics Van Driver", "Heavy Trailer Driver", "Warehouse Staff", "6G Welder"],
    countryDestination: "Russia & Kuwait"
  }
];

const INITIAL_SETTINGS: AppSettings = {
  id: "global",
  googleSheetsWebhookUrl: "",
  adminPasscode: "trehan2026"
};

const INITIAL_ENQUIRIES: Enquiry[] = [
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

class DatabaseManager {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Verify essential collections exist
        return {
          jobs: parsed.jobs || INITIAL_JOBS,
          applications: parsed.applications || INITIAL_APPLICATIONS,
          interviewDrives: parsed.interviewDrives || INITIAL_DRIVES,
          appSettings: parsed.appSettings || INITIAL_SETTINGS,
          enquiries: parsed.enquiries || INITIAL_ENQUIRIES
        };
      }
    } catch (err) {
      console.error("Error reading db file, re-initializing:", err);
    }

    // Default seed
    const defaultData: DatabaseSchema = {
      jobs: INITIAL_JOBS,
      applications: INITIAL_APPLICATIONS,
      interviewDrives: INITIAL_DRIVES,
      appSettings: INITIAL_SETTINGS,
      enquiries: INITIAL_ENQUIRIES
    };
    this.saveDatabase(defaultData);
    return defaultData;
  }

  private saveDatabase(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error("Error writing db file:", err);
    }
  }

  // --- Jobs ---
  public getJobs(params?: { country?: string; trade?: string; status?: string }): Job[] {
    let result = [...this.db.jobs];
    if (params?.status) {
      result = result.filter(j => j.status.toLowerCase() === params.status?.toLowerCase());
    } else {
      // By default public API shows Active jobs
      result = result.filter(j => j.status === "Active");
    }

    if (params?.country && params.country !== 'all') {
      const q = params.country.toLowerCase();
      result = result.filter(j => j.country.toLowerCase().includes(q));
    }

    if (params?.trade && params.trade !== 'all') {
      const q = params.trade.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.category.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getAllJobsAdmin(): Job[] {
    return [...this.db.jobs];
  }

  public getJobById(id: string): Job | undefined {
    return this.db.jobs.find(j => j.id === id);
  }

  public createJob(jobData: Omit<Job, 'id' | 'createdAt'>): Job {
    const newJob: Job = {
      ...jobData,
      id: "job-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      status: jobData.status || "Active"
    };
    this.db.jobs.unshift(newJob);
    this.saveDatabase(this.db);
    return newJob;
  }

  public updateJob(id: string, updates: Partial<Job>): Job | null {
    const index = this.db.jobs.findIndex(j => j.id === id);
    if (index === -1) return null;

    this.db.jobs[index] = {
      ...this.db.jobs[index],
      ...updates,
      id // preserve ID
    };
    this.saveDatabase(this.db);
    return this.db.jobs[index];
  }

  public deleteJob(id: string): boolean {
    const initialLen = this.db.jobs.length;
    this.db.jobs = this.db.jobs.filter(j => j.id !== id);
    if (this.db.jobs.length !== initialLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  // --- Applications & Tracker ---
  public getApplicationByPassport(passportNumber: string): { application: Application; timeline: any[] } | null {
    const raw = passportNumber.trim().toUpperCase();
    const alphanumeric = raw.replace(/[^A-Z0-9]/g, '');
    
    const app = this.db.applications.find(a => {
      const aPassport = a.passportNumber.trim().toUpperCase();
      const aId = a.id.trim().toUpperCase();
      const aPassportAlpha = aPassport.replace(/[^A-Z0-9]/g, '');
      const aIdAlpha = aId.replace(/[^A-Z0-9]/g, '');
      
      return (
        aPassport === raw ||
        aId === raw ||
        (alphanumeric.length >= 4 && (aPassportAlpha === alphanumeric || aIdAlpha === alphanumeric))
      );
    });
    
    if (!app) return null;

    // Generate accurate timeline based on currentStage (1 to 7)
    const stages: StageNumber[] = [1, 2, 3, 4, 5, 6, 7];
    const createdDate = new Date(app.createdAt);
    const updatedDate = new Date(app.updatedAt);

    const timeline = stages.map((stg) => {
      const isCompleted = app.currentStage >= stg;
      const isCurrent = app.currentStage === stg;
      
      // Calculate realistic stage date offsets
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
        isCurrent: isCurrent,
        remarks: isCurrent ? app.remarks : stageRemarks
      };
    });

    return { application: app, timeline };
  }

  public getApplications(params: { page?: number; limit?: number; search?: string; stage?: number }): {
    items: Application[];
    total: number;
    page: number;
    totalPages: number;
  } {
    let result = [...this.db.applications];
    const search = params.search?.trim().toLowerCase();

    if (search) {
      result = result.filter(a => 
        a.fullName.toLowerCase().includes(search) ||
        a.passportNumber.toLowerCase().includes(search) ||
        a.trade.toLowerCase().includes(search) ||
        a.targetCountry.toLowerCase().includes(search) ||
        a.id.toLowerCase().includes(search)
      );
    }

    if (params.stage && params.stage >= 1 && params.stage <= 7) {
      result = result.filter(a => a.currentStage === params.stage);
    }

    // Sort by updatedAt desc
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const total = result.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const startIndex = (page - 1) * limit;
    const items = result.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  public createApplication(data: {
    fullName: string;
    phone: string;
    passportNumber: string;
    trade: string;
    targetCountry: string;
    interviewCity?: "Delhi" | "Mumbai" | "Gorakhpur" | string;
    currentStage?: StageNumber;
    remarks?: string;
    id?: string;
  }): Application {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const token = data.id || `TRH-${randomNum}`;
    const now = new Date().toISOString();

    const stageNum = (data.currentStage && data.currentStage >= 1 && data.currentStage <= 7)
      ? (data.currentStage as StageNumber)
      : 1;

    let defaultRemarks = "Application received and under preliminary review.";
    if (stageNum === 2) defaultRemarks = "Scheduled / Cleared technical trade interview.";
    else if (stageNum === 3) defaultRemarks = "Medical examination completed (GAMCA/Authorized Center).";
    else if (stageNum === 4) defaultRemarks = `Work permit & visa documents submitted to ${data.targetCountry || 'destination'} embassy.`;
    else if (stageNum === 5) defaultRemarks = `Work visa officially issued by ${data.targetCountry || 'destination'} immigration.`;
    else if (stageNum === 6) defaultRemarks = "Police Clearance & Protector of Emigrants (eMigrate) clearance approved.";
    else if (stageNum === 7) defaultRemarks = "Flight ticket confirmed & pre-departure orientation completed.";

    const newApp: Application = {
      id: token,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      passportNumber: data.passportNumber.trim().toUpperCase(),
      trade: data.trade.trim(),
      targetCountry: data.targetCountry.trim(),
      interviewCity: data.interviewCity || "Delhi",
      currentStage: stageNum,
      remarks: data.remarks?.trim() || defaultRemarks,
      createdAt: now,
      updatedAt: now
    };

    this.db.applications.unshift(newApp);
    this.saveDatabase(this.db);
    return newApp;
  }

  public deleteApplication(id: string): boolean {
    const initialLen = this.db.applications.length;
    this.db.applications = this.db.applications.filter(a => a.id !== id);
    if (this.db.applications.length !== initialLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  public updateApplicationStatus(id: string, stage: StageNumber, remarks?: string): Application | null {
    const app = this.db.applications.find(a => a.id === id);
    if (!app) return null;

    app.currentStage = stage;
    if (remarks !== undefined && remarks !== null) {
      app.remarks = remarks;
    }
    app.updatedAt = new Date().toISOString();

    this.saveDatabase(this.db);
    return app;
  }

  // --- Drives ---
  public getDrives(): InterviewDrive[] {
    return [...this.db.interviewDrives];
  }

  // --- App Settings ---
  public getSettings(): AppSettings {
    return { ...this.db.appSettings };
  }

  public updateSettings(updates: Partial<AppSettings>): AppSettings {
    this.db.appSettings = {
      ...this.db.appSettings,
      ...updates,
      id: "global"
    };
    this.saveDatabase(this.db);
    return this.db.appSettings;
  }

  // --- Enquiries & Workforce Quota Requests ---
  public getEnquiries(params?: { type?: string; status?: string; search?: string }): Enquiry[] {
    let result = [...(this.db.enquiries || [])];

    if (params?.type && params.type !== 'All') {
      result = result.filter(e => e.type === params.type);
    }

    if (params?.status && params.status !== 'All') {
      result = result.filter(e => e.status === params.status);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(e =>
        e.fullName.toLowerCase().includes(q) ||
        (e.companyName && e.companyName.toLowerCase().includes(q)) ||
        e.phone.toLowerCase().includes(q) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        e.locationOrCountry.toLowerCase().includes(q) ||
        e.tradesOrSubject.toLowerCase().includes(q) ||
        (e.message && e.message.toLowerCase().includes(q)) ||
        e.id.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createEnquiry(data: {
    type: "Contact Enquiry" | "Workforce Quota Request";
    fullName: string;
    companyName?: string;
    phone: string;
    email?: string;
    locationOrCountry: string;
    tradesOrSubject: string;
    headcount?: number;
    message?: string;
    status?: EnquiryStatus;
  }): Enquiry {
    if (!this.db.enquiries) {
      this.db.enquiries = [];
    }

    const id = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEnquiry: Enquiry = {
      id,
      type: data.type,
      fullName: data.fullName.trim(),
      companyName: data.companyName ? data.companyName.trim() : 'N/A',
      phone: data.phone.trim(),
      email: data.email ? data.email.trim() : undefined,
      locationOrCountry: data.locationOrCountry.trim(),
      tradesOrSubject: data.tradesOrSubject.trim(),
      headcount: data.headcount ? Number(data.headcount) : undefined,
      message: data.message ? data.message.trim() : '',
      status: data.status || 'New',
      createdAt: new Date().toISOString()
    };

    this.db.enquiries.unshift(newEnquiry);
    this.saveDatabase(this.db);
    return newEnquiry;
  }

  public updateEnquiryStatus(id: string, status: EnquiryStatus): Enquiry | null {
    if (!this.db.enquiries) return null;
    const item = this.db.enquiries.find(e => e.id === id);
    if (!item) return null;

    item.status = status;
    item.updatedAt = new Date().toISOString();
    this.saveDatabase(this.db);
    return item;
  }

  public deleteEnquiry(id: string): boolean {
    if (!this.db.enquiries) return false;
    const initialLen = this.db.enquiries.length;
    this.db.enquiries = this.db.enquiries.filter(e => e.id !== id);
    if (this.db.enquiries.length !== initialLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }
}

export const dbManager = new DatabaseManager();
