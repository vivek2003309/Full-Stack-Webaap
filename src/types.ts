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
  id: string; // e.g. "TRH-8821"
  fullName: string;
  phone: string;
  passportNumber: string; // Uppercase
  trade: string;
  targetCountry: string;
  interviewCity: "Delhi" | "Mumbai" | "Gorakhpur" | string;
  currentStage: StageNumber;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  timeline?: ApplicationTimelineItem[];
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
  headcount?: number;
  message?: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt?: string;
}
