export type StageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const STAGE_NAMES: Record<StageNumber, string> = {
  1: "Application Review",
  2: "Interview & Trade Test",
  3: "Medical Fitness",
  4: "Visa Applied",
  5: "Visa Approved",
  6: "PCC / POE Clearance",
  7: "Dispatched / Ready to Fly",
};

export interface Job {
  id: string;
  title: string;
  country: string;
  flagEmoji: string;
  vacanciesCount: number;
  salaryText: string;
  perks: string[];
  category: "Logistics" | "Construction" | "MEP" | "Technical" | string;
  status: "Active" | "Closed";
  createdAt: string;
  description?: string;
  requirements?: string[];
  workLocation?: string;
}

export interface ApplicationTimelineItem {
  stage: StageNumber;
  title: string;
  date: string;
  completed: boolean;
  remarks?: string;
}

export interface Application {
  id: string; // use passportNumber.toUpperCase().trim()
  token?: string; // e.g., "TIC-" + passportNumber.slice(-4)
  name?: string;
  fullName: string;
  phone?: string;
  email?: string;
  passportNumber: string; // Uppercase
  trade: string; // e.g., "Structural Welder"
  country?: string; // e.g., "Russia", "Saudi Arabia"
  targetCountry: string;
  interviewCity?: "Delhi" | "Mumbai" | "Gorakhpur" | string;
  officerAssigned?: string;
  interviewDate?: string;
  currentStage: StageNumber | number; // 1 to 7
  stageName?: string; // e.g., "Document Verification", "Visa Issued"
  remarks: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt: string;
  timeline?: ApplicationTimelineItem[];
  documents?: CandidateDocument[];
}

export interface InterviewDrive {
  id: string;
  city: "Delhi" | "Mumbai" | "Gorakhpur" | string;
  venue: string;
  driveDate: string;
  tradesAllowed: string[];
  countryDestination: string;
}

export interface AppSettings {
  id: "global";
  googleSheetsWebhookUrl: string;
  adminPasscode: string;
  lastWebhookStatus?: {
    timestamp: string;
    success: boolean;
    responseCode?: number;
    error?: string;
  };
}

export interface TrackerResponse {
  application: Application;
  timeline: ApplicationTimelineItem[];
}

export interface CandidateDocument {
  id: string;
  name: string;
  nameHi: string;
  category: 'identity' | 'technical' | 'medical' | 'visa' | 'clearance' | 'travel';
  status: 'Verified' | 'Pending' | 'Uploaded' | 'Under Review' | 'Pending Action' | 'Approved' | 'Issued' | 'Pending Stage';
  badgeColor: string;
  verifiedDate?: string;
  expiryDate?: string;
  documentNumber?: string;
  authority: string;
  notes: string;
  notesHi: string;
  isDownloadable?: boolean;
  fileUrl?: string;
  videoUrl?: string;
  previewType?: 'pdf' | 'image' | 'video' | 'link';
  updatedAt?: string;
}

export interface BroadcastLog {
  id: string;
  timestamp: string;
  targetCriteria: string;
  recipientCount: number;
  message: string;
  channel: 'WhatsApp' | 'SMS' | 'Email' | 'Multi-Channel';
  status: 'Sent' | 'Scheduled' | 'Failed';
}

export type EnquiryType = "Contact Enquiry" | "Workforce Quota Request";
export type EnquiryStatus = "New" | "Contacted" | "Closed";

export interface Enquiry {
  id: string;
  type: EnquiryType;
  fullName: string;
  companyName?: string;
  phone: string;
  email?: string;
  locationOrCountry: string;
  tradesOrSubject: string;
  headcount?: number | null;
  message?: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt?: string;
}
