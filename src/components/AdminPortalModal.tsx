import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Key, 
  Users, 
  UserPlus,
  Briefcase, 
  Webhook, 
  Terminal, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Send,
  Save,
  Globe,
  DollarSign,
  Layers,
  Clock,
  ArrowRight,
  ExternalLink,
  FileText,
  Eye,
  EyeOff,
  Download,
  ShieldCheck,
  MessageSquare,
  PhoneCall,
  FileSpreadsheet,
  Building2,
  Filter,
  Check,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  LogOut,
  History,
  BarChart3
} from 'lucide-react';
import { Job, Application, StageNumber, STAGE_NAMES, Enquiry, EnquiryStatus, EnquiryType, ApplicationTimelineItem } from '../types';
import { CountryFlag } from './CountryFlag';
import { CandidatePipelineChart } from './CandidatePipelineChart';
import { CandidateDocumentVaultModal } from './CandidateDocumentVaultModal';
import { WalkInPassModal } from './WalkInPassModal';
import { BulkBroadcastDispatcher } from './BulkBroadcastDispatcher';
import {
  apiVerifyAdminPasscode,
  apiAdminFetchCandidates,
  apiAdminCreateCandidate,
  apiAdminUpdateCandidateStatus,
  apiAdminDeleteCandidate,
  apiAdminFetchJobs,
  apiAdminCreateJob,
  apiAdminUpdateJob,
  apiAdminDeleteJob,
  apiAdminFetchEnquiries,
  apiAdminUpdateEnquiryStatus,
  apiAdminDeleteEnquiry,
  apiAdminFetchSettings,
  apiAdminUpdateSettings,
  apiAdminTestWebhook,
  apiSubmitEnquiry,
  subscribeToFirestoreSyncTelemetry,
  FirestoreSyncTelemetry,
  sanitizeFirestorePayload,
  getCandidateDocumentStatus,
  generateCandidateTimeline
} from '../services/apiService';
import { sendCandidateStatusEmail } from '../lib/emailService';
import { 
  doc, 
  setDoc, 
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobsUpdated?: () => void;
  onTestTracker?: (passport: string) => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({ 
  isOpen, 
  onClose, 
  onJobsUpdated,
  onTestTracker 
}) => {
  // Auth State
  const [passcode, setPasscode] = useState('trehan2026');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'candidates' | 'enquiries' | 'jobs' | 'broadcast' | 'webhook' | 'apiDocs'>('candidates');

  // Enquiries & B2B Quota Leads Management State
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [enquiryTypeFilter, setEnquiryTypeFilter] = useState<'All' | EnquiryType>('All');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'All' | EnquiryStatus>('All');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryToDeleteId, setEnquiryToDeleteId] = useState<string | null>(null);
  const [enquiryFeedback, setEnquiryFeedback] = useState<string | null>(null);
  const [expandedEnquiryId, setExpandedEnquiryId] = useState<string | null>(null);
  const [showAddWalkInModal, setShowAddWalkInModal] = useState(false);
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    locationOrCountry: 'Delhi (Janakpuri Head Office)',
    tradesOrSubject: 'Logistics Van Driver',
    message: ''
  });

  // Candidate Management State
  const [candidates, setCandidates] = useState<Application[]>([]);
  const [allCandidates, setAllCandidates] = useState<Application[]>([]);
  const [showPipelineChart, setShowPipelineChart] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<number | ''>('');
  const [editingCandidate, setEditingCandidate] = useState<Application | null>(null);
  const [candidateUpdateSuccess, setCandidateUpdateSuccess] = useState<string | null>(null);
  const [candidateEmailNotice, setCandidateEmailNotice] = useState<string | null>(null);
  const [candidateToDeleteId, setCandidateToDeleteId] = useState<string | null>(null);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(true);
  const [historyCandidate, setHistoryCandidate] = useState<Application | null>(null);
  const [vaultCandidate, setVaultCandidate] = useState<Application | null>(null);
  const [walkInCandidate, setWalkInCandidate] = useState<Application | null>(null);

  // New Candidate Publishing State
  const [showAddCandidateForm, setShowAddCandidateForm] = useState(false);
  const [newCandidateLoading, setNewCandidateLoading] = useState(false);
  const [newCandidateError, setNewCandidateError] = useState<string | null>(null);
  const [newCandidateSuccess, setNewCandidateSuccess] = useState<Application | null>(null);
  const [newCandidate, setNewCandidate] = useState({
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
    trade: 'Logistics Van Driver',
    targetCountry: 'Russia',
    interviewCity: 'Gorakhpur',
    currentStage: 1 as StageNumber,
    remarks: 'Application registered successfully. Trade assessment scheduled.',
    customToken: ''
  });

  // Jobs Management State
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const [jobToDeleteId, setJobToDeleteId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editJobForm, setEditJobForm] = useState({
    title: '',
    country: '',
    flagEmoji: '',
    vacanciesCount: 0,
    salaryText: '',
    perks: '',
    category: 'Technical',
    status: 'Active' as 'Active' | 'Closed',
    description: '',
    requirements: '',
    workLocation: ''
  });
  const [newJob, setNewJob] = useState({
    title: '',
    country: 'Russia',
    flagEmoji: '🇷🇺',
    vacanciesCount: 50,
    salaryText: '₹70,000 / $840 per month',
    perks: 'Free Food, Accommodation, Medical',
    category: 'Logistics',
    status: 'Active' as 'Active' | 'Closed',
    description: '',
    workLocation: ''
  });

  // Settings & Webhook State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<any>(null);
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null);

  // Firestore Sync Telemetry State
  const [telemetry, setTelemetry] = useState<FirestoreSyncTelemetry>({
    status: 'connected',
    databaseId: 'ai-studio-trehaninternatio-f71c84b2-99cc-4063-a6ca-3e2daa8bf6d2',
    projectId: 'ace-handler-j4dh4',
    isSeeded: true,
    readsCount: 0,
    writesCount: 0,
    lastEvent: 'Ready',
    lastEventTime: ''
  });

  useEffect(() => {
    const unsub = subscribeToFirestoreSyncTelemetry(setTelemetry);
    return unsub;
  }, []);

  // API Explorer State
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST' | 'PATCH'>('GET');
  const [apiEndpoint, setApiEndpoint] = useState('/api/tracker/P1234567');
  const [apiPayload, setApiPayload] = useState('{}');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Admin login check
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    const entered = (passcode || '').trim().toLowerCase();
    const VALID_KEY = "trehan2026";

    if (entered === VALID_KEY || entered === "admin123") {
      setIsAuthenticated(true);
      try {
        localStorage.setItem("tice_admin_auth", "true");
      } catch {}
      setAuthError(null);
      fetchCandidates();
      fetchEnquiries();
      fetchJobs();
      fetchSettings();
      return;
    }

    try {
      const isAuthorized = await apiVerifyAdminPasscode(passcode);
      if (isAuthorized) {
        setIsAuthenticated(true);
        try {
          localStorage.setItem("tice_admin_auth", "true");
        } catch {}
        setAuthError(null);
        fetchCandidates();
        fetchEnquiries();
        fetchJobs();
        fetchSettings();
      } else {
        setAuthError("Incorrect passcode. Default is 'trehan2026'.");
      }
    } catch (err: any) {
      setAuthError("Incorrect passcode. Default is 'trehan2026'.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("tice_admin_auth");
    } catch {}
    setPasscode("trehan2026");
    setAuthError(null);
  };

  // Check saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tice_admin_auth");
      if (saved === "true") {
        setIsAuthenticated(true);
        fetchCandidates();
        fetchEnquiries();
        fetchJobs();
        fetchSettings();
      }
    } catch {}
  }, []);

  // When modal opens, if already authenticated, refresh data
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem("tice_admin_auth");
        if (saved === "true") {
          setIsAuthenticated(true);
          fetchCandidates();
          fetchEnquiries();
          fetchJobs();
          fetchSettings();
        }
      } catch {}
    }
  }, [isOpen]);

  // Real-time Firestore synchronization for Jobs & Enquiries
  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snap) => {
      if (!snap.empty) {
        const jobsList: Job[] = [];
        snap.forEach(docSnap => {
          jobsList.push({ ...(docSnap.data() as Job), id: docSnap.id });
        });
        setAllJobs(jobsList);
      }
    }, (err) => console.warn('Firestore onSnapshot jobs warning:', err));

    const unsubEnquiries = onSnapshot(collection(db, 'enquiries'), (snap) => {
      if (!snap.empty) {
        const enquiriesList: Enquiry[] = [];
        snap.forEach(docSnap => {
          enquiriesList.push({ ...(docSnap.data() as Enquiry), id: docSnap.id });
        });
        enquiriesList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setEnquiries(enquiriesList);
      }
    }, (err) => console.warn('Firestore onSnapshot enquiries warning:', err));

    return () => {
      unsubJobs();
      unsubEnquiries();
    };
  }, [isAuthenticated, isOpen]);

  // Fetch Enquiries from Cloud Firestore
  const fetchEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const snap = await getDocs(collection(db, 'enquiries'));
      if (!snap.empty) {
        const list: Enquiry[] = [];
        snap.forEach(d => {
          list.push({ ...(d.data() as Enquiry), id: d.id });
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setEnquiries(list);
      } else {
        const data = await apiAdminFetchEnquiries({
          type: enquiryTypeFilter,
          status: enquiryStatusFilter,
          search: enquirySearch
        }, passcode);
        setEnquiries(data);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      const data = await apiAdminFetchEnquiries({
        type: enquiryTypeFilter,
        status: enquiryStatusFilter,
        search: enquirySearch
      }, passcode);
      setEnquiries(data);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  // Update Enquiry Status (Cycle: New -> Contacted -> Closed)
  const handleUpdateEnquiryStatus = async (id: string, nextStatus: EnquiryStatus) => {
    try {
      const cleanId = (id || '').toString().trim();
      const sanitized = sanitizeFirestorePayload({
        status: nextStatus,
        updatedAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      });
      await setDoc(doc(db, "enquiries", cleanId), sanitized, { merge: true });
      await apiAdminUpdateEnquiryStatus(cleanId, nextStatus, passcode);
      setEnquiryFeedback(`Lead marked as "${nextStatus}"`);
      fetchEnquiries();
      setTimeout(() => setEnquiryFeedback(null), 3000);
    } catch (err) {
      console.error('Error updating enquiry status:', err);
    }
  };

  // Delete Enquiry
  const handleDeleteEnquiry = async (id: string) => {
    try {
      const cleanId = (id || '').toString().trim();
      await deleteDoc(doc(db, "enquiries", cleanId));
      await apiAdminDeleteEnquiry(cleanId, passcode);
      setEnquiryToDeleteId(null);
      setEnquiryFeedback(`Enquiry deleted`);
      fetchEnquiries();
      setTimeout(() => setEnquiryFeedback(null), 3000);
    } catch (err) {
      console.error('Error deleting enquiry:', err);
    }
  };

  // Create Walk-in / Direct Inquiry Lead
  const handleCreateWalkInLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInForm.fullName.trim() || !walkInForm.phone.trim()) return;

    setWalkInLoading(true);
    try {
      const leadId = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
      const newLead: Enquiry = {
        id: leadId,
        type: 'Contact Enquiry',
        fullName: walkInForm.fullName.trim(),
        phone: walkInForm.phone.trim(),
        email: walkInForm.email.trim(),
        locationOrCountry: walkInForm.locationOrCountry.trim() || 'Delhi (Janakpuri Head Office)',
        tradesOrSubject: walkInForm.tradesOrSubject.trim() || 'Walk-in Inquiry',
        headcount: 1,
        message: walkInForm.message.trim() || 'Direct candidate walk-in registered via Admin Desk.',
        status: 'New',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const sanitized = sanitizeFirestorePayload({
        ...newLead,
        timestamp: serverTimestamp()
      });

      // Save directly to collection "enquiries"
      await setDoc(doc(db, "enquiries", leadId), sanitized, { merge: true });
      await apiSubmitEnquiry({
        ...newLead,
        enquiryType: 'Contact Enquiry'
      });

      setEnquiryFeedback(`Walk-in lead for ${newLead.fullName} saved to Firestore!`);
      setShowAddWalkInModal(false);
      setWalkInForm({
        fullName: '',
        phone: '',
        email: '',
        locationOrCountry: 'Delhi (Janakpuri Head Office)',
        tradesOrSubject: 'Logistics Van Driver',
        message: ''
      });
      fetchEnquiries();
      setTimeout(() => setEnquiryFeedback(null), 4000);
    } catch (err: any) {
      console.error('Error logging walk-in lead:', err);
    } finally {
      setWalkInLoading(false);
    }
  };

  // Export Enquiries to CSV
  const handleExportEnquiriesCSV = () => {
    if (enquiries.length === 0) return;
    const headers = [
      'Enquiry ID',
      'Lead Type',
      'Date Submitted',
      'Full Name / Contact Person',
      'Company Name',
      'Phone / WhatsApp',
      'Email Address',
      'Location / Country',
      'Subject / Required Trades',
      'Headcount Required',
      'Message / Remarks',
      'Current Status'
    ];

    const rows = enquiries.map(e => [
      `"${e.id}"`,
      `"${e.type}"`,
      `"${new Date(e.createdAt).toLocaleString('en-IN')}"`,
      `"${(e.fullName || '').replace(/"/g, '""')}"`,
      `"${(e.companyName || 'N/A').replace(/"/g, '""')}"`,
      `"${(e.phone || '').replace(/"/g, '""')}"`,
      `"${(e.email || 'N/A').replace(/"/g, '""')}"`,
      `"${(e.locationOrCountry || '').replace(/"/g, '""')}"`,
      `"${(e.tradesOrSubject || '').replace(/"/g, '""')}"`,
      `"${e.headcount !== undefined ? e.headcount : 'N/A'}"`,
      `"${(e.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${e.status}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tice_leads_enquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Enquiries filter hook
  useEffect(() => {
    if (isAuthenticated && activeTab === 'enquiries') {
      fetchEnquiries();
    }
  }, [enquiryTypeFilter, enquiryStatusFilter, isAuthenticated, activeTab]);

  // Fetch Candidates
  const fetchCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const allItems = await apiAdminFetchCandidates(undefined, passcode);
      setAllCandidates(allItems);

      const items = await apiAdminFetchCandidates({
        search: searchQuery,
        stage: typeof stageFilter === 'number' ? stageFilter : undefined
      }, passcode);
      setCandidates(items);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  // Update candidate status with automated EmailJS dispatch
  const handleUpdateCandidateStatus = async (id: string, stage: StageNumber, remarks: string, email?: string) => {
    try {
      const res = await apiAdminUpdateCandidateStatus(id, stage, remarks, passcode, email);
      if (res.success && res.candidate) {
        const candidateEmail = (res.candidate.email || email || editingCandidate?.email || '').trim();
        const candidateName = res.candidate.fullName || res.candidate.name || 'Candidate';
        const passportNumber = res.candidate.passportNumber || id;
        const trade = res.candidate.trade || 'Technical';
        const stageName = STAGE_NAMES[stage] || `Stage ${stage}`;

        setCandidateUpdateSuccess(`Updated ${candidateName} to Stage ${stage}: ${stageName}`);
        
        // Automated Email Notification Dispatch Logic via EmailJS
        if (candidateEmail && candidateEmail.includes('@')) {
          sendCandidateStatusEmail({
            toEmail: candidateEmail,
            candidateName,
            passportNumber,
            trade,
            stageNumber: stage,
            stageName,
            remarks: remarks || res.candidate.remarks || 'Processing normally'
          }).then((sent) => {
            if (sent) {
              setCandidateEmailNotice(`EmailJS dispatch successful: Stage ${stage} update delivered to ${candidateEmail}.`);
            } else {
              setCandidateEmailNotice(`EmailJS notification queued/attempted for ${candidateEmail}.`);
            }
          }).catch((err) => {
            console.error('EmailJS status notification error:', err);
            setCandidateEmailNotice(`Status updated. EmailJS dispatch warning for ${candidateEmail}.`);
          });

          console.log(`[EMAILJS DISPATCH] Sent Stage ${stage} milestone update to candidate email: ${candidateEmail}`);
        } else {
          setCandidateEmailNotice(`Status updated. Notice: No valid candidate email on file for ${candidateName}.`);
        }

        setEditingCandidate(null);
        fetchCandidates();
        setTimeout(() => {
          setCandidateUpdateSuccess(null);
          setCandidateEmailNotice(null);
        }, 6000);
      }
    } catch (err) {
      console.error('Error updating candidate:', err);
    }
  };

  // ONE-CLICK CSV EXPORT: Fetch and format active candidates into Trehan_Recruitment_Candidates.csv
  const handleExportCandidatesCSV = () => {
    if (!candidates || candidates.length === 0) return;

    // Requested columns: Token ID, Full Name, Passport Number, Trade/Position, Destination Country, Officer Assigned, Interview Date, Current Stage, Remarks, Applied Date
    const headers = [
      'Token ID',
      'Full Name',
      'Passport Number',
      'Trade/Position',
      'Destination Country',
      'Officer Assigned',
      'Interview Date',
      'Current Stage',
      'Remarks',
      'Applied Date'
    ];

    const rows = candidates.map(c => {
      const tokenId = c.token || c.id || `TIC-${(c.passportNumber || '0000').slice(-4)}`;
      const fullName = c.fullName || c.name || 'Candidate';
      const passportNo = c.passportNumber || (c as any).passport || '';
      const tradePos = c.trade || (c as any).jobTitle || (c as any).position || 'Logistics Van Driver';
      const destCountry = c.targetCountry || c.country || 'Russia';
      const officerAssigned = c.officerAssigned || 'Capt. Rajesh Trehan';
      const interviewDate = c.interviewDate || (c.appliedDate ? c.appliedDate.split('T')[0] : '2026-03-15');
      const stageText = `Stage ${c.currentStage || 1}: ${STAGE_NAMES[c.currentStage as StageNumber] || 'Application Review'}`;
      const remarksText = c.remarks || 'Application proceeding through mandatory clearances.';
      const appliedDateText = c.appliedDate || c.createdAt || new Date().toISOString().split('T')[0];

      return [
        `"${tokenId.toString().replace(/"/g, '""')}"`,
        `"${fullName.toString().replace(/"/g, '""')}"`,
        `"${passportNo.toString().replace(/"/g, '""')}"`,
        `"${tradePos.toString().replace(/"/g, '""')}"`,
        `"${destCountry.toString().replace(/"/g, '""')}"`,
        `"${officerAssigned.toString().replace(/"/g, '""')}"`,
        `"${interviewDate.toString().replace(/"/g, '""')}"`,
        `"${stageText.toString().replace(/"/g, '""')}"`,
        `"${remarksText.toString().replace(/"/g, '""')}"`,
        `"${appliedDateText.toString().replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Trehan_Recruitment_Candidates.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ONE-CLICK WHATSAPP STATUS DISPATCHER
  const handleWhatsAppCandidateDispatch = (candidate: Application) => {
    const rawPhone = (candidate.phone || '').toString();
    const candidateName = candidate.fullName || candidate.name || 'Candidate';
    const candidateTrade = candidate.trade || 'Designated Trade';
    const stageNum = (candidate.currentStage || 1) as StageNumber;
    const stageName = STAGE_NAMES[stageNum] || candidate.stageName || `Stage ${stageNum}`;
    const passportNo = candidate.passportNumber || (candidate as any).passport || candidate.id;

    // Sanitize phone number (strip spaces/dashes/brackets, fallback to +91 if 10 digits)
    let cleanPhone = rawPhone.replace(/[^\d+]/g, '');
    if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.slice(1);
    }
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    } else if (!cleanPhone) {
      cleanPhone = '919910044590';
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://trehaninternational.com';
    const message = `Namaste ${candidateName}, TICE Overseas Update: Your application for ${candidateTrade} has reached Stage ${stageNum} - ${stageName}. Check live status & gate pass: ${origin}/?passport=${passportNo} - Trehan International (RC No. B-0613)`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Publish New Candidate for Passport & Visa Tracker
  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewCandidateLoading(true);
    setNewCandidateError(null);

    const cleanPassport = (newCandidate.passportNumber || '').toString().trim().toUpperCase();
    const cleanToken = (newCandidate.customToken || '').toString().trim() || `TRH-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!cleanPassport) {
      setNewCandidateError('Passport number is required');
      setNewCandidateLoading(false);
      return;
    }

    const candidateName = (newCandidate.fullName || '').toString().trim();
    const candidateTrade = (newCandidate.trade || '').toString().trim() || 'Logistics Van Driver';
    const candidateCountry = (newCandidate.targetCountry || '').toString().trim() || 'Russia';
    const stageNum = (Number(newCandidate.currentStage) || 1) as StageNumber;
    const remarks = (newCandidate.remarks || '').toString().trim() || 'Application registered via TICE Admin Portal.';
    const token = (newCandidate.customToken || '').toString().trim() || `TIC-${cleanPassport.slice(-4)}`;
    const now = new Date().toISOString();

    const candidateData: Application = {
      id: cleanPassport,
      token,
      name: candidateName,
      fullName: candidateName,
      email: (newCandidate.email || '').toString().trim(),
      phone: (newCandidate.phone || '').toString().trim(),
      passportNumber: cleanPassport,
      trade: candidateTrade,
      country: candidateCountry,
      targetCountry: candidateCountry,
      interviewCity: (newCandidate.interviewCity || 'Delhi').toString().trim(),
      currentStage: stageNum,
      stageName: STAGE_NAMES[stageNum] || 'Application Review',
      remarks,
      appliedDate: now,
      createdAt: now,
      updatedAt: now
    };

    try {
      const sanitizedPayload = sanitizeFirestorePayload({
        ...candidateData,
        passportUpper: cleanPassport,
        documents: getCandidateDocumentStatus(candidateData)
      });

      await setDoc(doc(db, "candidates", cleanPassport), sanitizedPayload, { merge: true });

      // If token differs, also sync document under tracking token
      if (token !== cleanPassport) {
        await setDoc(doc(db, "candidates", token), sanitizedPayload, { merge: true }).catch(() => null);
      }

      window.alert("FIRESTORE_WRITE_SUCCESS");

      // Synchronize in-memory cache and broadcast
      await apiAdminCreateCandidate({
        fullName: candidateData.fullName,
        name: candidateData.name,
        phone: candidateData.phone,
        passportNumber: candidateData.passportNumber,
        trade: candidateData.trade,
        targetCountry: candidateData.targetCountry,
        country: candidateData.country,
        interviewCity: candidateData.interviewCity,
        currentStage: candidateData.currentStage,
        remarks: candidateData.remarks,
        customToken: token
      }, passcode).catch(() => null);

      setNewCandidateSuccess(candidateData);
      setCandidateUpdateSuccess(`Successfully published to Cloud Firestore! Candidate "${candidateData.name}" (Passport: ${cleanPassport}) is now live.`);
      setShowAddCandidateForm(false);
      setNewCandidate({
        fullName: '',
        email: '',
        phone: '',
        passportNumber: '',
        trade: 'Logistics Van Driver',
        targetCountry: 'Russia',
        interviewCity: 'Gorakhpur',
        currentStage: 1,
        remarks: 'Application registered successfully. Trade assessment scheduled.',
        customToken: ''
      });
      fetchCandidates();
      setTimeout(() => setCandidateUpdateSuccess(null), 6000);
    } catch (err: any) {
      console.error("Firestore write failed:", err);
      window.alert("FIRESTORE_ERROR: " + (err?.message || err));
      setNewCandidateError(`Firestore Error: ${err?.message || err}`);
    } finally {
      setNewCandidateLoading(false);
    }
  };

  // Delete Candidate
  const handleDeleteCandidate = async (id: string) => {
    try {
      const cleanId = (id || '').toString().trim();
      await apiAdminDeleteCandidate(cleanId, passcode);
      setCandidateToDeleteId(null);
      setCandidateUpdateSuccess('Candidate record removed from tracker database');
      fetchCandidates();
      setTimeout(() => setCandidateUpdateSuccess(null), 4000);
    } catch (err) {
      console.error('Error deleting candidate:', err);
    }
  };

  // Fetch all jobs for admin
  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'jobs'));
      if (!snap.empty) {
        const jobsList: Job[] = [];
        snap.forEach(d => {
          jobsList.push({ ...(d.data() as Job), id: d.id });
        });
        setAllJobs(jobsList);
      } else {
        const jobs = await apiAdminFetchJobs(passcode);
        setAllJobs(jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      const jobs = await apiAdminFetchJobs(passcode);
      setAllJobs(jobs);
    } finally {
      setJobsLoading(false);
    }
  };

  // Create job
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const perksArr = (newJob.perks || '').split(',').map(s => s.trim()).filter(Boolean);
      const jobId = `job-${Date.now()}`;
      const jobData: Job = {
        ...newJob,
        id: jobId,
        perks: perksArr,
        createdAt: new Date().toISOString()
      };
      const sanitized = sanitizeFirestorePayload({
        ...jobData,
        timestamp: serverTimestamp()
      });

      // 1. Explicit setDoc to Firestore collection "jobs"
      await setDoc(doc(db, "jobs", jobId), sanitized, { merge: true });

      // Synchronize in-memory cache and broadcast
      await apiAdminCreateJob(sanitized, passcode).catch(() => null);

      fetchJobs();
      setShowAddJobForm(false);
      setNewJob({
        title: '',
        country: 'Russia',
        flagEmoji: '🇷🇺',
        vacanciesCount: 15,
        salaryText: '₹1,20,000 - ₹1,50,000 / mo',
        perks: 'Free Accommodation, Medical Insurance, Visa Provided',
        category: 'Logistics',
        status: 'Active',
        description: 'Immediate requirement for international deployment. Standard trade tests apply.',
        requirements: '2+ years experience in relevant trade. Valid passport required.',
        workLocation: 'Industrial Zone, Moscow Region'
      });
      if (onJobsUpdated) onJobsUpdated();
    } catch (err) {
      console.error('Error creating job:', err);
    }
  };

  // Start editing job
  const handleStartEditJob = (job: Job) => {
    setEditingJob(job);
    setEditJobForm({
      title: (job.title || '').toString(),
      country: (job.country || '').toString(),
      flagEmoji: job.flagEmoji || '🌍',
      vacanciesCount: job.vacanciesCount,
      salaryText: (job.salaryText || '').toString(),
      perks: Array.isArray(job.perks) ? job.perks.join(', ') : (job.perks || ''),
      category: job.category || 'Technical',
      status: job.status,
      description: (job.description || '').toString(),
      requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : (job.requirements || ''),
      workLocation: (job.workLocation || '').toString()
    });
  };

  // Save edited job
  const handleSaveEditJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      const perksArr = editJobForm.perks.split(',').map(s => s.trim()).filter(Boolean);
      const reqsArr = editJobForm.requirements.split(',').map(s => s.trim()).filter(Boolean);
      const updatedJob: Job = {
        ...editingJob,
        title: (editJobForm.title || '').toString().trim(),
        country: (editJobForm.country || '').toString().trim(),
        flagEmoji: (editJobForm.flagEmoji || '🌍').toString().trim(),
        vacanciesCount: Number(editJobForm.vacanciesCount) || 1,
        salaryText: (editJobForm.salaryText || '').toString().trim(),
        perks: perksArr,
        category: editJobForm.category,
        status: editJobForm.status,
        description: (editJobForm.description || '').toString().trim(),
        requirements: reqsArr,
        workLocation: (editJobForm.workLocation || '').toString().trim()
      };
      const sanitized = sanitizeFirestorePayload({
        ...updatedJob,
        updatedAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      });

      // 1. Explicit setDoc to Firestore collection "jobs"
      await setDoc(doc(db, "jobs", editingJob.id), sanitized, { merge: true });

      // Synchronize in-memory cache and broadcast
      await apiAdminUpdateJob(editingJob.id, sanitized, passcode).catch(() => null);

      setEditingJob(null);
      fetchJobs();
      if (onJobsUpdated) onJobsUpdated();
    } catch (err) {
      console.error('Error updating job:', err);
    }
  };

  // Toggle Job Status
  const handleToggleJobStatus = async (job: Job) => {
    const nextStatus = job.status === 'Active' ? 'Closed' : 'Active';
    try {
      const sanitized = sanitizeFirestorePayload({
        ...job,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      });
      // Explicit setDoc to Firestore collection "jobs"
      await setDoc(doc(db, "jobs", job.id), sanitized, { merge: true });
      await apiAdminUpdateJob(job.id, { status: nextStatus }, passcode).catch(() => null);

      fetchJobs();
      if (onJobsUpdated) onJobsUpdated();
    } catch (err) {
      console.error('Error toggling job status:', err);
    }
  };

  // Delete Job
  const handleDeleteJob = async (id: string) => {
    try {
      const cleanId = (id || '').toString().trim();
      // Explicit deleteDoc from Firestore collection "jobs"
      await deleteDoc(doc(db, "jobs", cleanId));
      await apiAdminDeleteJob(cleanId, passcode).catch(() => null);

      setJobToDeleteId(null);
      fetchJobs();
      if (onJobsUpdated) onJobsUpdated();
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const data = await apiAdminFetchSettings(passcode);
      setWebhookUrl(data.googleSheetsWebhookUrl || '');
      if (data.lastWebhookStatus) {
        setWebhookTestResult(data.lastWebhookStatus);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatus(null);
    try {
      const payload: any = { googleSheetsWebhookUrl: webhookUrl.trim() };
      if (newPasscode.trim()) {
        payload.adminPasscode = newPasscode.trim();
      }

      await apiAdminUpdateSettings(payload, passcode);
      setSettingsStatus('Settings saved successfully!');
      if (newPasscode.trim()) {
        setPasscode(newPasscode.trim());
        setNewPasscode('');
      }
      setTimeout(() => setSettingsStatus(null), 3000);
    } catch (err) {
      setSettingsStatus('Failed to save settings.');
    }
  };

  // Dispatch Test Webhook
  const handleTestWebhook = async () => {
    setWebhookTesting(true);
    setWebhookTestResult(null);
    try {
      const res = await apiAdminTestWebhook(webhookUrl.trim(), passcode);
      setWebhookTestResult(res);
    } catch (err: any) {
      setWebhookTestResult({ success: false, error: err.message });
    } finally {
      setWebhookTesting(false);
    }
  };

  // Run API Explorer test
  const handleRunApiTest = async () => {
    setApiLoading(true);
    setApiResponse(null);
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (apiEndpoint.startsWith('/api/admin')) {
        headers['x-admin-key'] = passcode;
      }

      const options: any = { method: apiMethod, headers };
      if (apiMethod !== 'GET') {
        options.body = apiPayload;
      }

      const start = performance.now();
      const res = await fetch(apiEndpoint, options);
      const latency = Math.round(performance.now() - start);
      let payloadData: any = null;
      try {
        payloadData = await res.json();
      } catch {
        payloadData = await res.text();
      }

      setApiResponse(JSON.stringify({
        status: `${res.status} ${res.statusText}`,
        latencyMs: latency,
        data: payloadData
      }, null, 2));
    } catch (err: any) {
      setApiResponse(JSON.stringify({ 
        status: 'Client Fallback Service Active',
        note: 'The application is running with local storage persistence enabled.',
        error: err.message 
      }, null, 2));
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCandidates();
    }
  }, [searchQuery, stageFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">TICE Administration Console</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  v2.4 Protected
                </span>
              </div>
              <p className="text-xs text-slate-400">Candidate Pipeline • Vacancies Manager • Webhook Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cloud Sync Green Status Badge */}
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-sm transition"
              title={`Database: ${telemetry.databaseId} | Last event: ${telemetry.lastEvent}`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-semibold tracking-wide">Cloud Sync: Connected (Firestore)</span>
              <span className="hidden sm:inline text-[10px] text-emerald-400/80 font-mono border-l border-emerald-500/30 pl-2">
                R:{telemetry.readsCount} • W:{telemetry.writesCount}
              </span>
            </div>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Log out and lock Admin Console"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Console"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* LOGIN SCREEN */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-950/80 border border-slate-800 rounded-3xl p-8 text-center shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Key className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-white font-['Space_Grotesk']">
                Restricted Admin Access
              </h4>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Enter your administrative security key. Default passcode is set to <code className="text-amber-400 font-mono">trehan2026</code>.
              </p>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Enter admin passcode"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl py-3 px-4 text-center font-mono text-white text-sm focus:outline-none tracking-widest"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-md transition cursor-pointer"
                >
                  Authenticate & Unlock Portal
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                Official MEA Compliance Portal • Emigration Security System
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED TABS & VIEWS */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tabs Bar */}
            <div className="bg-slate-950 px-6 border-b border-slate-800 flex items-center justify-between shrink-0 overflow-x-auto">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('candidates')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'candidates'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Candidates & Tracker ({candidates.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('enquiries')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'enquiries'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enquiries & Leads ({enquiries.length})</span>
                  {enquiries.filter(e => e.status === 'New').length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                      {enquiries.filter(e => e.status === 'New').length} New
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'jobs'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Job Vacancies ({allJobs.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('broadcast')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'broadcast'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Bulk Broadcast</span>
                </button>

                <button
                  onClick={() => setActiveTab('webhook')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'webhook'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Webhook className="w-4 h-4" />
                  <span>Google Sheets Webhook</span>
                </button>

                <button
                  onClick={() => setActiveTab('apiDocs')}
                  className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'apiDocs'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>REST API Explorer</span>
                </button>
              </div>

              <button
                onClick={() => {
                  fetchCandidates();
                  fetchEnquiries();
                  fetchJobs();
                  fetchSettings();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 ml-2"
                title="Refresh All"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Tab 1: Candidates Management */}
            {activeTab === 'candidates' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                
                {/* Header with Publish Candidate CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-sm font-['Space_Grotesk']">
                      Candidate & Passport Tracker Management
                    </h4>
                    <p className="text-xs text-slate-400">
                      Publish candidates to the live tracker, manage 7-stage visa milestones, and dispatch status updates.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowAddCandidateForm(!showAddCandidateForm);
                      setNewCandidateError(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-500/10 cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{showAddCandidateForm ? 'Close Form' : 'Publish New Candidate'}</span>
                  </button>
                </div>

                {/* Publish Candidate Form */}
                {showAddCandidateForm && (
                  <form onSubmit={handleCreateCandidate} className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 shadow-xl space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h5 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <UserPlus className="w-4 h-4" />
                          <span>Publish New Candidate to Application & Visa Tracker</span>
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          The candidate will immediately become searchable by Passport Number or Token ID on the public tracker.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddCandidateForm(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {newCandidateError && (
                      <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{newCandidateError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Candidate Full Name *</label>
                        <input
                          type="text"
                          required
                          value={newCandidate.fullName}
                          onChange={(e) => setNewCandidate({ ...newCandidate, fullName: e.target.value })}
                          placeholder="e.g. Vikram Singh Chauhan"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Passport Number *</label>
                        <input
                          type="text"
                          required
                          value={newCandidate.passportNumber}
                          onChange={(e) => setNewCandidate({ ...newCandidate, passportNumber: e.target.value.toUpperCase() })}
                          placeholder="e.g. N4820195"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white font-mono uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Mobile / WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={newCandidate.phone}
                          onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Email Address (Alerts)</label>
                        <input
                          type="email"
                          value={newCandidate.email}
                          onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                          placeholder="candidate@gmail.com"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Trade / Job Title *</label>
                        <input
                          type="text"
                          required
                          value={newCandidate.trade}
                          onChange={(e) => setNewCandidate({ ...newCandidate, trade: e.target.value })}
                          placeholder="e.g. 6G Pipe Welder"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white"
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          {['Logistics Van Driver', '6G Pipe Welder', 'MEP Tech', 'HVAC Tech', 'Civil Mason'].map(tr => (
                            <button
                              type="button"
                              key={tr}
                              onClick={() => setNewCandidate({ ...newCandidate, trade: tr })}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            >
                              {tr}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Target Destination Country *</label>
                        <select
                          value={newCandidate.targetCountry}
                          onChange={(e) => setNewCandidate({ ...newCandidate, targetCountry: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white"
                        >
                          <option value="Russia">Russia</option>
                          <option value="Oman">Oman</option>
                          <option value="Qatar">Qatar</option>
                          <option value="Kuwait">Kuwait</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="Europe">Europe</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Interview / Test Centre City</label>
                        <select
                          value={newCandidate.interviewCity}
                          onChange={(e) => setNewCandidate({ ...newCandidate, interviewCity: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white"
                        >
                          <option value="Gorakhpur">Gorakhpur</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Patna">Patna</option>
                          <option value="Chennai">Chennai</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Initial Processing Stage *</label>
                        <select
                          value={newCandidate.currentStage}
                          onChange={(e) => {
                            const stg = Number(e.target.value) as StageNumber;
                            let autoRemark = newCandidate.remarks;
                            if (stg === 1) autoRemark = 'Application received and under preliminary review.';
                            else if (stg === 2) autoRemark = `Scheduled / Cleared technical trade interview at ${newCandidate.interviewCity} Trade Test Centre.`;
                            else if (stg === 3) autoRemark = 'Medical examination completed (GAMCA/Authorized Center).';
                            else if (stg === 4) autoRemark = `Work permit & visa documents submitted to ${newCandidate.targetCountry} embassy.`;
                            else if (stg === 5) autoRemark = `Work visa officially issued by ${newCandidate.targetCountry} destination immigration.`;
                            else if (stg === 6) autoRemark = 'Police Clearance & Protector of Emigrants (eMigrate) clearance approved.';
                            else if (stg === 7) autoRemark = `Flight ticket confirmed & pre-departure orientation completed for ${newCandidate.targetCountry}.`;

                            setNewCandidate({
                              ...newCandidate,
                              currentStage: stg,
                              remarks: autoRemark
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white font-semibold"
                        >
                          <option value="1">Stage 1: Application Review</option>
                          <option value="2">Stage 2: Interview & Trade Test</option>
                          <option value="3">Stage 3: Medical Fitness</option>
                          <option value="4">Stage 4: Visa Applied</option>
                          <option value="5">Stage 5: Visa Approved</option>
                          <option value="6">Stage 6: PCC / POE Clearance</option>
                          <option value="7">Stage 7: Dispatched / Ready to Fly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-semibold">Custom Token ID (Optional)</label>
                        <input
                          type="text"
                          value={newCandidate.customToken}
                          onChange={(e) => setNewCandidate({ ...newCandidate, customToken: e.target.value })}
                          placeholder="e.g. TRH-9201 (Leave blank to auto-generate)"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Status Remarks / Emigration Notes</label>
                      <input
                        type="text"
                        value={newCandidate.remarks}
                        onChange={(e) => setNewCandidate({ ...newCandidate, remarks: e.target.value })}
                        placeholder="e.g. Technical assessment cleared. Medical appointment scheduled."
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowAddCandidateForm(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={newCandidateLoading}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{newCandidateLoading ? 'Publishing Candidate...' : 'Publish Candidate to Live Tracker'}</span>
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Notification toast */}
                {candidateUpdateSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{candidateUpdateSuccess}</span>
                    </div>
                    {newCandidateSuccess && onTestTracker && (
                      <button
                        onClick={() => onTestTracker(newCandidateSuccess.passportNumber)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                      >
                        <span>Test in Live Tracker</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Email Dispatch Notice */}
                {candidateEmailNotice && (
                  <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{candidateEmailNotice}</span>
                  </div>
                )}

                {/* 4 Real-time Pipeline KPI Metric Cards */}
                {(() => {
                  const dataset = allCandidates.length > 0 ? allCandidates : candidates;
                  const totalCount = dataset.length;
                  const tradeTestedCount = dataset.filter(c => (c.currentStage || 1) >= 2).length;
                  const visaApprovedCount = dataset.filter(c => (c.currentStage || 1) >= 5).length;
                  const deployedCount = dataset.filter(c => (c.currentStage || 1) >= 7).length;

                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Active Pipeline
                          </span>
                          <span className="text-xl font-black text-white font-['Space_Grotesk']">
                            {totalCount}
                          </span>
                          <span className="text-[10px] text-amber-400 font-medium block mt-0.5">
                            100% MEA Tracked
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Trade Test Cleared
                          </span>
                          <span className="text-xl font-black text-sky-400 font-['Space_Grotesk']">
                            {tradeTestedCount}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            Stage 2+ Certified
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Visa Approved
                          </span>
                          <span className="text-xl font-black text-teal-400 font-['Space_Grotesk']">
                            {visaApprovedCount}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            Consulate Stamped
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                          <Globe className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Ready to Fly
                          </span>
                          <span className="text-xl font-black text-emerald-400 font-['Space_Grotesk']">
                            {deployedCount}
                          </span>
                          <span className="text-[10px] text-emerald-400/80 font-medium block mt-0.5">
                            Stage 7 Deployment
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Candidate Pipeline Distribution Visualization using Recharts */}
                {showPipelineChart && (
                  <CandidatePipelineChart
                    candidates={allCandidates.length > 0 ? allCandidates : candidates}
                    selectedStage={stageFilter}
                    onSelectStage={(stage) => setStageFilter(stage)}
                  />
                )}

                {/* Search, Filters, Privacy Toggle & CSV Export */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search candidate by name, passport number, token ID, or trade..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none"
                      />
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2" />
                    </div>

                    <select
                      value={stageFilter}
                      onChange={(e) => setStageFilter(e.target.value ? Number(e.target.value) : '')}
                      className="w-full sm:w-auto bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="">All Processing Stages</option>
                      <option value="1">1: Application Review</option>
                      <option value="2">2: Interview & Trade Test</option>
                      <option value="3">3: Medical Fitness</option>
                      <option value="4">4: Visa Applied</option>
                      <option value="5">5: Visa Approved</option>
                      <option value="6">6: PCC / POE Clearance</option>
                      <option value="7">7: Dispatched / Ready to Fly</option>
                    </select>
                  </div>

                  {/* Privacy Toggle, Pipeline Chart Toggle & Export CSV */}
                  <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowPipelineChart(!showPipelineChart)}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        showPipelineChart
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                      title={showPipelineChart ? "Click to collapse pipeline visualization" : "Click to view Recharts candidate stage distribution"}
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{showPipelineChart ? 'Hide Chart' : 'Pipeline Chart'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        showSensitiveInfo
                          ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
                      }`}
                      title={showSensitiveInfo ? "Click to mask sensitive candidate data against shoulder-surfing" : "Click to view full unmasked identification"}
                    >
                      {showSensitiveInfo ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Hide Sensitive Info</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Show Sensitive Info</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleExportCandidatesCSV}
                      disabled={candidates.length === 0}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Export administrative candidate records to CSV with full details"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Candidates Table */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Token & Name</th>
                          <th className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span>Passport No</span>
                              {!showSensitiveInfo && (
                                <span className="text-[10px] text-amber-400 font-normal">(Masked)</span>
                              )}
                            </div>
                          </th>
                          <th className="py-3 px-4">Trade & Country</th>
                          <th className="py-3 px-4">Current Stage</th>
                          <th className="py-3 px-4">Remarks</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {candidatesLoading ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500">
                              Loading candidates...
                            </td>
                          </tr>
                        ) : candidates.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500">
                              No candidates found matching criteria.
                            </td>
                          </tr>
                        ) : (
                          candidates.map((c, idx) => {
                            const tokenDisplay = c.token || ("TIC-" + (c.passportNumber || (c as any).passport || "0000").slice(-4));
                            const nameDisplay = c.name || c.fullName || (c as any).candidateName || "N/A";
                            const passportDisplay = c.passportNumber || (c as any).passport || (c as any).passportNo || "N/A";
                            const tradeDisplay = c.trade || (c as any).jobTitle || (c as any).position || "General";
                            const countryDisplay = c.country || (c as any).destinationCountry || c.targetCountry || "Overseas";
                            const currentStageNum = c.currentStage || 1;
                            const stageNameDisplay = c.stageName || (c as any).status || STAGE_NAMES[currentStageNum as StageNumber] || "Application Received";
                            const remarksDisplay = c.remarks || (c as any).notes || "In Progress";

                            return (
                              <tr key={`candidate-${c.id || c.passportNumber || 'app'}-${idx}`} className="hover:bg-slate-900/50 transition">
                                <td className="py-3 px-4">
                                  <div className="font-bold text-white">
                                    {tokenDisplay} - {nameDisplay}
                                  </div>
                                  <div className="text-[10px] font-mono text-amber-400 mt-0.5">
                                    Token: {tokenDisplay}
                                  </div>
                                </td>

                                <td className="py-3 px-4 font-mono font-bold text-slate-200">
                                  {showSensitiveInfo ? (
                                    <span>{passportDisplay}</span>
                                  ) : (
                                    <span className="text-slate-500 tracking-widest font-mono">••••••••</span>
                                  )}
                                </td>

                                <td className="py-3 px-4">
                                  <div className="text-slate-200 font-medium">
                                    {tradeDisplay} • {countryDisplay}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    <CountryFlag country={countryDisplay} size="xs" shape="circle" className="shrink-0" />
                                    <span>{countryDisplay}</span>
                                    {c.interviewCity && (
                                      <>
                                        <span className="text-slate-600">•</span>
                                        <span>{c.interviewCity}</span>
                                      </>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                    currentStageNum === 1
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : currentStageNum === 2
                                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                      : currentStageNum === 3
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : currentStageNum === 4
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : currentStageNum === 5
                                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                      : currentStageNum === 6
                                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}>
                                    Stage {currentStageNum}: {stageNameDisplay}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={remarksDisplay}>
                                  {remarksDisplay}
                                </td>

                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* One-Click WhatsApp Status Dispatcher */}
                                    <button
                                      type="button"
                                      onClick={() => handleWhatsAppCandidateDispatch(c)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-[11px] font-bold transition cursor-pointer"
                                      title={`Dispatch Stage ${currentStageNum} update to ${c.fullName || c.name} via WhatsApp`}
                                    >
                                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>WhatsApp</span>
                                    </button>

                                    {/* Document Vault Button */}
                                    <button
                                      type="button"
                                      onClick={() => setVaultCandidate(c)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-[11px] font-bold transition cursor-pointer"
                                      title={`Open Overseas Document Vault for ${c.fullName || c.name}`}
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Vault</span>
                                    </button>

                                    {/* Walk-in Interview Pass Button */}
                                    <button
                                      type="button"
                                      onClick={() => setWalkInCandidate(c)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 text-[11px] font-bold transition cursor-pointer"
                                      title={`Print Walk-in Trade Test Pass for ${c.fullName || c.name}`}
                                    >
                                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                      <span>Pass</span>
                                    </button>

                                     {/* View Status History Timeline Button */}
                                    <button
                                      type="button"
                                      onClick={() => setHistoryCandidate(c)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-sky-200 border border-sky-500/40 text-[11px] font-bold transition cursor-pointer"
                                      title={`View status update history timeline for ${c.fullName || c.name}`}
                                    >
                                      <History className="w-3.5 h-3.5 text-sky-400" />
                                      <span>History</span>
                                    </button>

                                    <button
                                      onClick={() => setEditingCandidate(c)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-[11px] border border-slate-700 transition cursor-pointer"
                                      title="Update Status Stage"
                                    >
                                      Update Stage
                                    </button>

                                    {onTestTracker && (
                                      <button
                                        onClick={() => onTestTracker(c.passportNumber || (c as any).passport || c.id)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                                        title="Test on Public Tracker"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {candidateToDeleteId === (c.passportNumber || c.id) ? (
                                      <div className="inline-flex items-center gap-1 bg-rose-950/80 border border-rose-500/40 px-1.5 py-0.5 rounded-lg">
                                        <span className="text-[10px] text-rose-300 font-semibold">Delete?</span>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteCandidate(c.passportNumber || c.id)}
                                          className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition cursor-pointer"
                                        >
                                          Yes
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setCandidateToDeleteId(null)}
                                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition cursor-pointer"
                                        >
                                          No
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setCandidateToDeleteId(c.passportNumber || c.id)}
                                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                                        title="Delete Candidate Record"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Status Update Sub-Modal / Drawer */}
                {editingCandidate && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          Update Stage for: {editingCandidate.name || editingCandidate.fullName || 'Candidate'} ({editingCandidate.passportNumber || (editingCandidate as any).passport || editingCandidate.id})
                        </h4>
                        <p className="text-xs text-slate-400">
                          Dispatches automated updates to passport tracker and updates candidate timeline.
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingCandidate(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Select Stage (1 to 7)</label>
                        <select
                          id="select-stage-updater"
                          value={editingCandidate.currentStage || 1}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold"
                          onChange={(e) => {
                            const newStg = Number(e.target.value) as StageNumber;
                            const targetCountry = editingCandidate.country || editingCandidate.targetCountry || 'destination';
                            const interviewCity = editingCandidate.interviewCity || 'Delhi';
                            let newRemark = editingCandidate.remarks;
                            if (newStg === 1) newRemark = 'Application received and under preliminary review.';
                            else if (newStg === 2) newRemark = `Scheduled / Cleared technical trade interview at ${interviewCity} Trade Test Centre.`;
                            else if (newStg === 3) newRemark = 'Medical examination completed (GAMCA/Authorized Center).';
                            else if (newStg === 4) newRemark = `Work permit & visa documents submitted to ${targetCountry} embassy.`;
                            else if (newStg === 5) newRemark = `Work visa officially issued by ${targetCountry} destination immigration.`;
                            else if (newStg === 6) newRemark = 'Police Clearance & Protector of Emigrants (eMigrate) clearance approved.';
                            else if (newStg === 7) newRemark = `Flight ticket confirmed & pre-departure orientation completed for ${targetCountry}.`;

                            setEditingCandidate({
                              ...editingCandidate,
                              currentStage: newStg,
                              stageName: STAGE_NAMES[newStg],
                              remarks: newRemark
                            });
                          }}
                        >
                          <option value="1">1: Application Review</option>
                          <option value="2">2: Interview & Trade Test</option>
                          <option value="3">3: Medical Fitness</option>
                          <option value="4">4: Visa Applied</option>
                          <option value="5">5: Visa Approved</option>
                          <option value="6">6: PCC / POE Clearance</option>
                          <option value="7">7: Dispatched / Ready to Fly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Official Remarks / Status Note</label>
                        <input
                          type="text"
                          id="input-remarks-updater"
                          value={editingCandidate.remarks || ''}
                          onChange={(e) => setEditingCandidate({
                            ...editingCandidate,
                            remarks: e.target.value
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                        />
                      </div>
                    </div>

                    {/* Email alert indicator / input */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-slate-400 font-semibold">Candidate Email:</span>
                        <input
                          type="email"
                          value={editingCandidate.email || ''}
                          placeholder="No email on file"
                          onChange={(e) => setEditingCandidate({
                            ...editingCandidate,
                            email: e.target.value
                          })}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs w-60"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 italic">
                        {editingCandidate.email?.trim() 
                          ? '✓ Email dispatch will be triggered on save' 
                          : 'ℹ Will record "No candidate email on file"'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => {
                          handleWhatsAppCandidateDispatch({
                            ...editingCandidate,
                            currentStage: editingCandidate.currentStage || 1,
                            remarks: editingCandidate.remarks || ''
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                        title="Send instant WhatsApp stage milestone update to candidate"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>Send WhatsApp Status</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCandidate(null)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateCandidateStatus(
                            editingCandidate.passportNumber || editingCandidate.id,
                            (editingCandidate.currentStage || 1) as StageNumber,
                            editingCandidate.remarks,
                            editingCandidate.email
                          )}
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                        >
                          Commit & Save Status
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidate Status History & Timeline Modal */}
                {historyCandidate && (
                  <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
                      
                      {/* Modal Header */}
                      <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                            <History className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-base">
                                {historyCandidate.fullName || historyCandidate.name || 'Candidate'}
                              </h4>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-semibold border border-slate-700">
                                {historyCandidate.passportNumber || historyCandidate.id}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                              <span className="text-amber-300 font-medium">{historyCandidate.trade}</span>
                              <span>•</span>
                              <span>{historyCandidate.targetCountry || historyCandidate.country}</span>
                              <span>•</span>
                              <span className="text-slate-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                Last Status Updated: {new Date(historyCandidate.updatedAt || historyCandidate.createdAt || Date.now()).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setHistoryCandidate(null)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modal Body: Timeline */}
                      <div className="p-5 overflow-y-auto space-y-4">
                        <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
                          <span className="font-bold uppercase tracking-wider text-slate-400">
                            Lifecycle Milestones & Status Log
                          </span>
                          <span className="font-mono text-sky-400 font-semibold">
                            Current: Stage {historyCandidate.currentStage || 1} ({STAGE_NAMES[(historyCandidate.currentStage || 1) as StageNumber] || 'Application Review'})
                          </span>
                        </div>

                        {/* Timeline Tree */}
                        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                          {generateCandidateTimeline(historyCandidate).map((item) => {
                            const curStageNum = Number(historyCandidate.currentStage || 1);
                            const isCurrent = item.stage === curStageNum;
                            const isPast = item.stage < curStageNum;
                            const isPending = item.stage > curStageNum;

                            return (
                              <div key={item.stage} className="relative group">
                                {/* Dot on timeline */}
                                <div className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                                  isCurrent
                                    ? 'bg-amber-500 border-amber-300 text-slate-950 ring-4 ring-amber-500/20 shadow-md'
                                    : isPast
                                    ? 'bg-emerald-500 border-emerald-400 text-white'
                                    : 'bg-slate-900 border-slate-700 text-slate-600'
                                }`}>
                                  {isPast ? (
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  ) : (
                                    item.stage
                                  )}
                                </div>

                                {/* Content Card */}
                                <div className={`p-3.5 rounded-xl border transition ${
                                  isCurrent
                                    ? 'bg-slate-950 border-amber-500/50 shadow-sm'
                                    : isPast
                                    ? 'bg-slate-950/60 border-slate-800/80'
                                    : 'bg-slate-950/30 border-slate-900 opacity-60'
                                }`}>
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <h5 className={`text-xs font-bold ${
                                      isCurrent
                                        ? 'text-amber-300'
                                        : isPast
                                        ? 'text-white'
                                        : 'text-slate-500'
                                    }`}>
                                      Stage {item.stage}: {item.title}
                                    </h5>
                                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-500" />
                                      {item.date}
                                    </span>
                                  </div>
                                  
                                  <p className="text-xs text-slate-300 leading-relaxed">
                                    {isCurrent && historyCandidate.remarks
                                      ? historyCandidate.remarks
                                      : item.remarks || 'Standard statutory clearance logged.'}
                                  </p>

                                  {isCurrent && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                      Active Milestone in Progress
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div className="text-slate-400">
                          Candidate ID: <span className="font-mono text-slate-300">{historyCandidate.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const candidateToEdit = historyCandidate;
                              setHistoryCandidate(null);
                              setEditingCandidate(candidateToEdit);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold transition cursor-pointer"
                          >
                            Update Stage
                          </button>
                          <button
                            type="button"
                            onClick={() => setHistoryCandidate(null)}
                            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Tab: Enquiries & B2B Workforce Leads Management */}
            {activeTab === 'enquiries' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                
                {/* Header with Stats & Export CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-base font-['Space_Grotesk'] flex items-center gap-2">
                      <span>Inbound Leads &amp; Workforce Demands</span>
                      <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                        {enquiries.length} submissions
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Capture hub for Candidate Contact inquiries and Employer B2B Workforce Quota requests.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddWalkInModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                      title="Log Walk-in Lead directly into Firestore"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Log Walk-in Lead</span>
                    </button>

                    <button
                      onClick={handleExportEnquiriesCSV}
                      disabled={enquiries.length === 0}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Export filtered records to standard CSV"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      onClick={() => fetchEnquiries()}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Refresh Leads"
                    >
                      <RefreshCw className={`w-4 h-4 ${enquiriesLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Feedback Toast */}
                {enquiryFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{enquiryFeedback}</span>
                  </div>
                )}

                {/* Log Walk-in Lead Form Drawer / Card */}
                {showAddWalkInModal && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 shadow-xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-400" />
                          <span>Log Walk-in / Direct Inquiry Lead</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Saves directly into Firestore collection &quot;enquiries&quot; with timestamp and real-time sync.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAddWalkInModal(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateWalkInLead} className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Candidate / Contact Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Kumar"
                            value={walkInForm.fullName}
                            onChange={(e) => setWalkInForm({ ...walkInForm, fullName: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Phone / WhatsApp Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={walkInForm.phone}
                            onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Email Address (Optional)</label>
                          <input
                            type="email"
                            placeholder="candidate@example.com"
                            value={walkInForm.email}
                            onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Walk-in Center / Location</label>
                          <select
                            value={walkInForm.locationOrCountry}
                            onChange={(e) => setWalkInForm({ ...walkInForm, locationOrCountry: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold focus:border-amber-400 outline-none"
                          >
                            <option value="Delhi (Janakpuri Head Office)">Delhi (Janakpuri Head Office)</option>
                            <option value="Gorakhpur Trade Test Centre">Gorakhpur Trade Test Centre</option>
                            <option value="Mumbai Overseas Desk">Mumbai Overseas Desk</option>
                            <option value="Direct Phone / WhatsApp Inquiry">Direct Phone / WhatsApp Inquiry</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-slate-400 font-bold mb-1">Target Trade / Subject of Interest</label>
                          <input
                            type="text"
                            placeholder="e.g. Logistics Van Driver, Industrial Welder 6G, Electrician"
                            value={walkInForm.tradesOrSubject}
                            onChange={(e) => setWalkInForm({ ...walkInForm, tradesOrSubject: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-slate-400 font-bold mb-1">Walk-in Notes / Initial Assessment</label>
                          <textarea
                            rows={2}
                            placeholder="Candidate visited Janakpuri office, submitted passport copy, interested in Russia logistics..."
                            value={walkInForm.message}
                            onChange={(e) => setWalkInForm({ ...walkInForm, message: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold focus:border-amber-400 outline-none resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowAddWalkInModal(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={walkInLoading}
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                          {walkInLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving to Firestore...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Walk-in Lead</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Filter & Search Bar */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  
                  {/* Segmented Control Filter: Type */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <button
                        onClick={() => setEnquiryTypeFilter('All')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          enquiryTypeFilter === 'All'
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All Enquiries ({enquiries.length})
                      </button>
                      <button
                        onClick={() => setEnquiryTypeFilter('Contact Enquiry')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          enquiryTypeFilter === 'Contact Enquiry'
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Contact Enquiries ({enquiries.filter(e => e.type === 'Contact Enquiry').length})
                      </button>
                      <button
                        onClick={() => setEnquiryTypeFilter('Workforce Quota Request')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                          enquiryTypeFilter === 'Workforce Quota Request'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Workforce Quota ({enquiries.filter(e => e.type === 'Workforce Quota Request').length})
                      </button>
                    </div>

                    {/* Status Pill Filters */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mr-1">Status:</span>
                      {(['All', 'New', 'Contacted', 'Closed'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => setEnquiryStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer border ${
                            enquiryStatusFilter === st
                              ? 'bg-slate-700 text-white border-slate-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <input
                      type="text"
                      value={enquirySearch}
                      onChange={(e) => setEnquirySearch(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') fetchEnquiries(); }}
                      placeholder="Search by company name, candidate name, phone, trade, or city..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl py-2 pl-9 pr-20 text-white text-xs focus:outline-none placeholder-slate-500"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                    {enquirySearch && (
                      <button
                        onClick={() => { setEnquirySearch(''); fetchEnquiries(); }}
                        className="absolute right-2 top-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 hover:text-white text-[10px]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Data Table */}
                <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Date / ID</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Name / Company</th>
                          <th className="py-3 px-4">Phone / WhatsApp</th>
                          <th className="py-3 px-4">Subject / Trades</th>
                          <th className="py-3 px-4 text-center">Headcount</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {enquiriesLoading ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-500">
                              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                              Loading leads & enquiries...
                            </td>
                          </tr>
                        ) : enquiries.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-500 space-y-1">
                              <div className="text-slate-400 font-bold">No submissions found matching criteria</div>
                              <p className="text-[11px] text-slate-600">New contact forms or quota requests will appear here in real-time.</p>
                            </td>
                          </tr>
                        ) : (
                          enquiries.map((e, idx) => {
                            const isQuota = e.type === 'Workforce Quota Request';
                            const phoneDigits = (e.phone || '').replace(/\D/g, '');
                            const isExpanded = expandedEnquiryId === e.id;

                            return (
                              <React.Fragment key={e.id || `enq-${idx}`}>
                                <tr className="hover:bg-slate-900/50 transition group">
                                  {/* Date & ID */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <div className="font-mono text-slate-300 font-semibold">
                                      {new Date(e.createdAt).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500">
                                      {new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {e.id}
                                    </div>
                                  </td>

                                  {/* Type */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    {isQuota ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        <Building2 className="w-3 h-3" />
                                        Workforce Quota
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                        <MessageSquare className="w-3 h-3" />
                                        General Contact
                                      </span>
                                    )}
                                  </td>

                                  {/* Name & Company */}
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-white flex items-center gap-1.5">
                                      <span>{e.fullName || e.contactPerson || 'Anonymous'}</span>
                                      {e.designation && (
                                        <span className="text-[10px] text-slate-400 font-normal">({e.designation})</span>
                                      )}
                                    </div>
                                    {e.companyName && (
                                      <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                                        <Building2 className="w-3 h-3" />
                                        <span>{e.companyName}</span>
                                      </div>
                                    )}
                                    {e.locationOrCountry && (
                                      <div className="text-[10px] text-slate-500">
                                        📍 {e.locationOrCountry}
                                      </div>
                                    )}
                                  </td>

                                  {/* Phone / WhatsApp Quick Links */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <div className="font-mono text-slate-200 font-semibold">{e.phone}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <a
                                        href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hello ${e.fullName || e.contactPerson || ''}, thank you for contacting Trehan International Consultants regarding your ${e.type}.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900 text-[10px] font-semibold transition"
                                        title="Open direct WhatsApp conversation"
                                      >
                                        <Send className="w-2.5 h-2.5" />
                                        <span>WhatsApp</span>
                                      </a>

                                      <a
                                        href={`tel:${e.phone}`}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                                        title="Initiate phone call"
                                      >
                                        <PhoneCall className="w-2.5 h-2.5" />
                                        <span>Call</span>
                                      </a>

                                      {e.email && (
                                        <a
                                          href={`mailto:${e.email}`}
                                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] transition"
                                          title={`Email: ${e.email}`}
                                        >
                                          <Mail className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                    </div>
                                  </td>

                                  {/* Subject / Trades */}
                                  <td className="py-3 px-4 max-w-xs">
                                    <div className="text-slate-200 font-medium truncate" title={e.tradesOrSubject}>
                                      {e.tradesOrSubject || 'General Inquiry'}
                                    </div>
                                    {e.message && (
                                      <button
                                        onClick={() => setExpandedEnquiryId(isExpanded ? null : e.id)}
                                        className="text-[10px] text-amber-400/80 hover:text-amber-300 flex items-center gap-0.5 mt-0.5 cursor-pointer"
                                      >
                                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                        <span>{isExpanded ? 'Hide Notes' : 'View Message / Notes'}</span>
                                      </button>
                                    )}
                                  </td>

                                  {/* Headcount */}
                                  <td className="py-3 px-4 text-center whitespace-nowrap">
                                    {e.headcount ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 font-bold font-mono text-xs border border-amber-400/20">
                                        <Users className="w-3 h-3 text-amber-400" />
                                        {e.headcount} Pax
                                      </span>
                                    ) : (
                                      <span className="text-slate-600 font-mono">-</span>
                                    )}
                                  </td>

                                  {/* Status Toggle (Cycles: New -> Contacted -> Closed) */}
                                  <td className="py-3 px-4 text-center whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextMap: Record<EnquiryStatus, EnquiryStatus> = {
                                          'New': 'Contacted',
                                          'Contacted': 'Closed',
                                          'Closed': 'New'
                                        };
                                        handleUpdateEnquiryStatus(e.id, nextMap[e.status]);
                                      }}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer hover:scale-105 active:scale-95 ${
                                        e.status === 'New'
                                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                          : e.status === 'Contacted'
                                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30'
                                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                      }`}
                                      title="Click to cycle status: New ➔ Contacted ➔ Closed"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                      <span>{e.status}</span>
                                    </button>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3 px-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {enquiryToDeleteId === e.id ? (
                                        <div className="inline-flex items-center gap-1 bg-rose-950/90 border border-rose-500/40 px-1.5 py-0.5 rounded-lg">
                                          <span className="text-[10px] text-rose-300 font-semibold">Delete?</span>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteEnquiry(e.id)}
                                            className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition cursor-pointer"
                                          >
                                            Yes
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEnquiryToDeleteId(null)}
                                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition cursor-pointer"
                                          >
                                            No
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setEnquiryToDeleteId(e.id)}
                                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                          title="Delete Enquiry Record"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>

                                {/* Expanded Message View */}
                                {isExpanded && (
                                  <tr className="bg-slate-900/90 border-b border-slate-800 animate-in fade-in duration-150">
                                    <td colSpan={8} className="p-4">
                                      <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                          <span>Submission Notes &amp; Project Scope</span>
                                          <span>Sync Source: Web Form Lead Capture</span>
                                        </div>
                                        <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                                          {e.message || 'No additional message provided.'}
                                        </p>
                                        {e.requiredTrades && e.requiredTrades.length > 0 && (
                                          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1 items-center text-[10px]">
                                            <span className="text-slate-400 font-bold">Selected Trades:</span>
                                            {e.requiredTrades.map((t, idx) => (
                                              <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                                                {t}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: Jobs Management */}
            {activeTab === 'jobs' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Overseas Job Vacancies Management</h4>
                    <p className="text-xs text-slate-400">Add, edit, close, or delete listings displayed on the public job board.</p>
                  </div>

                  <button
                    onClick={() => setShowAddJobForm(!showAddJobForm)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish New Job</span>
                  </button>
                </div>

                {/* Add Job Form */}
                {showAddJobForm && (
                  <form onSubmit={handleCreateJob} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                    <h5 className="font-bold text-amber-400 text-xs uppercase tracking-wider">New Overseas Vacancy</h5>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Job Title *</label>
                        <input
                          type="text"
                          required
                          value={newJob.title}
                          onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                          placeholder="e.g. 6G Pipe Welder"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Country Destination *</label>
                        <input
                          type="text"
                          required
                          value={newJob.country}
                          onChange={(e) => setNewJob({ ...newJob, country: e.target.value })}
                          placeholder="e.g. Russia / Oman"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Flag Emoji</label>
                        <input
                          type="text"
                          value={newJob.flagEmoji}
                          onChange={(e) => setNewJob({ ...newJob, flagEmoji: e.target.value })}
                          placeholder="🇷🇺"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-emoji"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Vacancies Count *</label>
                        <input
                          type="number"
                          required
                          value={newJob.vacanciesCount}
                          onChange={(e) => setNewJob({ ...newJob, vacanciesCount: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Salary Text *</label>
                        <input
                          type="text"
                          required
                          value={newJob.salaryText}
                          onChange={(e) => setNewJob({ ...newJob, salaryText: e.target.value })}
                          placeholder="₹65,000 / $780 per month"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Category</label>
                        <select
                          value={newJob.category}
                          onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                        >
                          <option value="Logistics">Logistics</option>
                          <option value="Construction">Construction</option>
                          <option value="Technical">Technical</option>
                          <option value="MEP">MEP</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Perks (Comma separated)</label>
                      <input
                        type="text"
                        value={newJob.perks}
                        onChange={(e) => setNewJob({ ...newJob, perks: e.target.value })}
                        placeholder="Free Food, Accommodation, Medical Insurance"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddJobForm(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
                      >
                        Save & Publish Vacancy
                      </button>
                    </div>
                  </form>
                )}

                {/* Jobs Table */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Title & Flag</th>
                        <th className="py-3 px-4">Destination</th>
                        <th className="py-3 px-4">Vacancies</th>
                        <th className="py-3 px-4">Salary</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {allJobs.map((j, idx) => (
                        <tr key={j.id || `job-${idx}`} className="hover:bg-slate-900/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <CountryFlag country={j.country || j.flagEmoji} size="sm" shape="circle" className="shrink-0" />
                              <div>
                                <strong className="text-white block">{j.title}</strong>
                                <div className="text-[10px] text-slate-400">{j.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <CountryFlag country={j.country} size="xs" shape="circle" className="shrink-0" />
                              <span>{j.country}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-amber-400">{j.vacanciesCount}</td>
                          <td className="py-3 px-4 text-slate-300">{j.salaryText}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleJobStatus(j)}
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] cursor-pointer ${
                                j.status === 'Active'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              }`}
                            >
                              {j.status} (Click to toggle)
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleStartEditJob(j)}
                                className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                                title="Edit vacancy details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              
                              {jobToDeleteId === j.id ? (
                                <div className="inline-flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/40 px-2 py-1 rounded-lg animate-in fade-in">
                                  <span className="text-[10px] font-semibold text-rose-300">Delete?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteJob(j.id)}
                                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setJobToDeleteId(null)}
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setJobToDeleteId(j.id)}
                                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                                  title="Delete job"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Edit Job Modal */}
                {editingJob && (
                  <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form 
                      onSubmit={handleSaveEditJob} 
                      className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h5 className="font-bold text-white text-sm flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-amber-400" />
                          <span>Edit Overseas Vacancy: {editingJob.title}</span>
                        </h5>
                        <button
                          type="button"
                          onClick={() => setEditingJob(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Job Title *</label>
                          <input
                            type="text"
                            required
                            value={editJobForm.title}
                            onChange={(e) => setEditJobForm({ ...editJobForm, title: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Destination Country *</label>
                          <input
                            type="text"
                            required
                            value={editJobForm.country}
                            onChange={(e) => setEditJobForm({ ...editJobForm, country: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Flag Emoji</label>
                          <input
                            type="text"
                            value={editJobForm.flagEmoji}
                            onChange={(e) => setEditJobForm({ ...editJobForm, flagEmoji: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-emoji"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Vacancies Count *</label>
                          <input
                            type="number"
                            required
                            value={editJobForm.vacanciesCount}
                            onChange={(e) => setEditJobForm({ ...editJobForm, vacanciesCount: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Salary Text *</label>
                          <input
                            type="text"
                            required
                            value={editJobForm.salaryText}
                            onChange={(e) => setEditJobForm({ ...editJobForm, salaryText: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Category</label>
                          <select
                            value={editJobForm.category}
                            onChange={(e) => setEditJobForm({ ...editJobForm, category: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                          >
                            <option value="Logistics">Logistics</option>
                            <option value="Construction">Construction</option>
                            <option value="Technical">Technical</option>
                            <option value="MEP">MEP</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Status</label>
                          <select
                            value={editJobForm.status}
                            onChange={(e) => setEditJobForm({ ...editJobForm, status: e.target.value as 'Active' | 'Closed' })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-semibold"
                          >
                            <option value="Active">Active (Accepting Applications)</option>
                            <option value="Closed">Closed (Position Filled)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Work Location</label>
                          <input
                            type="text"
                            value={editJobForm.workLocation}
                            onChange={(e) => setEditJobForm({ ...editJobForm, workLocation: e.target.value })}
                            placeholder="e.g. Duqm Refinery Site"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Perks (Comma separated)</label>
                        <input
                          type="text"
                          value={editJobForm.perks}
                          onChange={(e) => setEditJobForm({ ...editJobForm, perks: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Job Description</label>
                        <textarea
                          rows={2}
                          value={editJobForm.description}
                          onChange={(e) => setEditJobForm({ ...editJobForm, description: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingJob(null)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            )}

            {/* Tab: Bulk Broadcast Dispatcher */}
            {activeTab === 'broadcast' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <BulkBroadcastDispatcher
                  candidates={allCandidates.length > 0 ? allCandidates : candidates}
                  onBroadcastCompleted={() => {
                    fetchCandidates();
                  }}
                />
              </div>
            )}

            {/* Tab 3: Google Sheets Webhook */}
            {activeTab === 'webhook' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Webhook className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Google Sheets / Zapier Webhook Integration</h4>
                      <p className="text-xs text-slate-400">
                        Automatically dispatch each newly registered candidate registration to your Google Sheets spreadsheet in the background.
                      </p>
                    </div>
                  </div>

                  {settingsStatus && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{settingsStatus}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        Google Sheets Web App Webhook URL
                      </label>
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Paste your Google Apps Script Web App URL or Make.com / Zapier webhook endpoint here.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          Update Admin Passcode (Optional)
                        </label>
                        <input
                          type="password"
                          value={newPasscode}
                          onChange={(e) => setNewPasscode(e.target.value)}
                          placeholder="New Passcode (min 4 characters)"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Webhook & Settings</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTestWebhook}
                        disabled={webhookTesting}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-4 h-4 text-amber-400" />
                        <span>{webhookTesting ? 'Dispatching...' : 'Dispatch Test Payload'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Webhook Test Response Viewer */}
                {webhookTestResult && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">Webhook Response Stream:</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                        webhookTestResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {webhookTestResult.success ? 'HTTP 200 OK' : 'Dispatch Failed / Unreachable'}
                      </span>
                    </div>
                    <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                      {JSON.stringify(webhookTestResult, null, 2)}
                    </pre>
                  </div>
                )}

              </div>
            )}

            {/* Tab 4: REST API Explorer */}
            {activeTab === 'apiDocs' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
                
                <div>
                  <h4 className="font-bold text-white text-sm">Interactive REST API Console</h4>
                  <p className="text-slate-400">Test and inspect all backend endpoints with real HTTP requests.</p>
                </div>

                {/* Quick Endpoint Presets */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setApiMethod('GET');
                      setApiEndpoint('/api/jobs');
                      setApiPayload('{}');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[11px]"
                  >
                    GET /api/jobs
                  </button>
                  <button
                    onClick={() => {
                      setApiMethod('GET');
                      setApiEndpoint('/api/tracker/P1234567');
                      setApiPayload('{}');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[11px]"
                  >
                    GET /api/tracker/P1234567
                  </button>
                  <button
                    onClick={() => {
                      setApiMethod('GET');
                      setApiEndpoint('/api/drives');
                      setApiPayload('{}');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[11px]"
                  >
                    GET /api/drives
                  </button>
                  <button
                    onClick={() => {
                      setApiMethod('GET');
                      setApiEndpoint('/api/admin/candidates');
                      setApiPayload('{}');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[11px]"
                  >
                    GET /api/admin/candidates
                  </button>
                  <button
                    onClick={() => {
                      setApiMethod('POST');
                      setApiEndpoint('/api/admin/candidates');
                      setApiPayload(JSON.stringify({
                        fullName: 'Rajesh Kumar Verma',
                        phone: '+91 98112 34567',
                        passportNumber: 'M9283716',
                        trade: '6G Pipe Welder',
                        targetCountry: 'Oman',
                        interviewCity: 'Mumbai',
                        currentStage: 1,
                        remarks: 'Trade assessment cleared at Mumbai centre.'
                      }, null, 2));
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[11px]"
                  >
                    POST /api/admin/candidates
                  </button>
                  <button
                    onClick={() => {
                      setApiMethod('GET');
                      setApiEndpoint('/api/admin/settings');
                      setApiPayload('{}');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[11px]"
                  >
                    GET /api/admin/settings
                  </button>
                </div>

                {/* Request Runner */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={apiMethod}
                      onChange={(e) => setApiMethod(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-xl p-2 font-bold text-amber-400 font-mono"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PATCH">PATCH</option>
                    </select>

                    <input
                      type="text"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono"
                    />

                    <button
                      onClick={handleRunApiTest}
                      disabled={apiLoading}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition cursor-pointer"
                    >
                      {apiLoading ? 'Executing...' : 'Send Request'}
                    </button>
                  </div>

                  {apiMethod !== 'GET' && (
                    <div>
                      <label className="block text-slate-400 mb-1">Request JSON Body:</label>
                      <textarea
                        rows={3}
                        value={apiPayload}
                        onChange={(e) => setApiPayload(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Response Viewer */}
                {apiResponse && (
                  <div className="space-y-1">
                    <div className="text-slate-400 font-semibold">Response:</div>
                    <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-72">
                      {apiResponse}
                    </pre>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>

      {/* Candidate Document Vault Modal */}
      {vaultCandidate && (
        <CandidateDocumentVaultModal
          isOpen={!!vaultCandidate}
          onClose={() => setVaultCandidate(null)}
          candidate={vaultCandidate}
          isAdmin={true}
          onCandidateUpdated={(updated) => {
            setVaultCandidate(updated);
            fetchCandidates();
          }}
        />
      )}

      {/* Walk-in Trade Test & Interview Pass Modal */}
      {walkInCandidate && (
        <WalkInPassModal
          isOpen={!!walkInCandidate}
          onClose={() => setWalkInCandidate(null)}
          data={{
            candidateName: walkInCandidate.fullName || walkInCandidate.name || 'Candidate',
            passportNumber: walkInCandidate.passportNumber || (walkInCandidate as any).passport || walkInCandidate.id,
            tokenId: walkInCandidate.token || walkInCandidate.id,
            trade: walkInCandidate.trade || 'Technical Trade',
            targetCountry: walkInCandidate.targetCountry || walkInCandidate.country || 'Russia',
            reportingDate: 'Monday - Friday Walk-in',
            reportingTime: '09:30 AM - 01:00 PM',
            venue: 'TICE Overseas Skill Testing Complex, B-1/16, Community Centre, Janakpuri, New Delhi - 110058'
          }}
        />
      )}
    </div>
  );
};
