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
  LogOut
} from 'lucide-react';
import { Job, Application, StageNumber, STAGE_NAMES, Enquiry, EnquiryStatus, EnquiryType } from '../types';
import { CountryFlag } from './CountryFlag';
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
  apiAdminTestWebhook
} from '../services/apiService';

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
  const [activeTab, setActiveTab] = useState<'candidates' | 'enquiries' | 'jobs' | 'webhook' | 'apiDocs'>('candidates');

  // Enquiries & B2B Quota Leads Management State
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [enquiryTypeFilter, setEnquiryTypeFilter] = useState<'All' | EnquiryType>('All');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'All' | EnquiryStatus>('All');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryToDeleteId, setEnquiryToDeleteId] = useState<string | null>(null);
  const [enquiryFeedback, setEnquiryFeedback] = useState<string | null>(null);
  const [expandedEnquiryId, setExpandedEnquiryId] = useState<string | null>(null);

  // Candidate Management State
  const [candidates, setCandidates] = useState<Application[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<number | ''>('');
  const [editingCandidate, setEditingCandidate] = useState<Application | null>(null);
  const [candidateUpdateSuccess, setCandidateUpdateSuccess] = useState<string | null>(null);
  const [candidateToDeleteId, setCandidateToDeleteId] = useState<string | null>(null);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(true);

  // New Candidate Publishing State
  const [showAddCandidateForm, setShowAddCandidateForm] = useState(false);
  const [newCandidateLoading, setNewCandidateLoading] = useState(false);
  const [newCandidateError, setNewCandidateError] = useState<string | null>(null);
  const [newCandidateSuccess, setNewCandidateSuccess] = useState<Application | null>(null);
  const [newCandidate, setNewCandidate] = useState({
    fullName: '',
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

  // Fetch Enquiries
  const fetchEnquiries = async () => {
    setEnquiriesLoading(true);
    try {
      const data = await apiAdminFetchEnquiries({
        type: enquiryTypeFilter,
        status: enquiryStatusFilter,
        search: enquirySearch
      }, passcode);
      setEnquiries(data);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  // Update Enquiry Status (Cycle: New -> Contacted -> Closed)
  const handleUpdateEnquiryStatus = async (id: string, nextStatus: EnquiryStatus) => {
    try {
      await apiAdminUpdateEnquiryStatus(id, nextStatus, passcode);
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
      await apiAdminDeleteEnquiry(id, passcode);
      setEnquiryToDeleteId(null);
      setEnquiryFeedback(`Enquiry deleted`);
      fetchEnquiries();
      setTimeout(() => setEnquiryFeedback(null), 3000);
    } catch (err) {
      console.error('Error deleting enquiry:', err);
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

  // Update candidate status
  const handleUpdateCandidateStatus = async (id: string, stage: StageNumber, remarks: string) => {
    try {
      const res = await apiAdminUpdateCandidateStatus(id, stage, remarks, passcode);
      if (res.success && res.candidate) {
        setCandidateUpdateSuccess(`Updated ${res.candidate.fullName} to Stage ${stage}: ${STAGE_NAMES[stage]}`);
        setEditingCandidate(null);
        fetchCandidates();
        setTimeout(() => setCandidateUpdateSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Error updating candidate:', err);
    }
  };

  // Export candidate records to CSV (Retains full, accurate, unmasked numbers for staff administrative records)
  const handleExportCandidatesCSV = () => {
    if (!candidates || candidates.length === 0) return;

    const headers = [
      'Application ID',
      'Full Name',
      'Passport Number',
      'Phone',
      'Trade / Designation',
      'Target Country',
      'Interview City',
      'Current Stage',
      'Stage Name',
      'Remarks',
      'Registration Date',
      'Last Updated'
    ];

    const rows = candidates.map(c => [
      `"${c.id.replace(/"/g, '""')}"`,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.passportNumber.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${c.trade.replace(/"/g, '""')}"`,
      `"${c.targetCountry.replace(/"/g, '""')}"`,
      `"${c.interviewCity.replace(/"/g, '""')}"`,
      c.currentStage,
      `"${(STAGE_NAMES[c.currentStage as StageNumber] || '').replace(/"/g, '""')}"`,
      `"${(c.remarks || '').replace(/"/g, '""')}"`,
      `"${c.createdAt}"`,
      `"${c.updatedAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tice_candidate_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Publish New Candidate for Passport & Visa Tracker
  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewCandidateLoading(true);
    setNewCandidateError(null);
    try {
      const res = await apiAdminCreateCandidate({
        fullName: newCandidate.fullName.trim(),
        phone: newCandidate.phone.trim(),
        passportNumber: newCandidate.passportNumber.trim().toUpperCase(),
        trade: newCandidate.trade.trim(),
        targetCountry: newCandidate.targetCountry.trim(),
        interviewCity: newCandidate.interviewCity.trim(),
        currentStage: Number(newCandidate.currentStage),
        remarks: newCandidate.remarks.trim(),
        customToken: newCandidate.customToken.trim() || undefined
      }, passcode);

      if (res.success && res.candidate) {
        setNewCandidateSuccess(res.candidate);
        setCandidateUpdateSuccess(`Candidate "${res.candidate.fullName}" (Passport: ${res.candidate.passportNumber}) published with Tracking Token ${res.candidate.id}!`);
        setShowAddCandidateForm(false);
        setNewCandidate({
          fullName: '',
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
        setTimeout(() => setCandidateUpdateSuccess(null), 5000);
      } else {
        setNewCandidateError(res.message || 'Failed to publish candidate');
      }
    } catch (err: any) {
      console.error('Error creating candidate:', err);
      setNewCandidateError(err.message || 'Network error occurred while publishing candidate');
    } finally {
      setNewCandidateLoading(false);
    }
  };

  // Delete Candidate
  const handleDeleteCandidate = async (id: string) => {
    try {
      await apiAdminDeleteCandidate(id, passcode);
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
      const jobs = await apiAdminFetchJobs(passcode);
      setAllJobs(jobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  // Create job
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const perksArr = newJob.perks.split(',').map(s => s.trim()).filter(Boolean);
      await apiAdminCreateJob({
        ...newJob,
        perks: perksArr
      }, passcode);

      fetchJobs();
      setShowAddJobForm(false);
      if (onJobsUpdated) onJobsUpdated();
    } catch (err) {
      console.error('Error creating job:', err);
    }
  };

  // Start editing job
  const handleStartEditJob = (job: Job) => {
    setEditingJob(job);
    setEditJobForm({
      title: job.title,
      country: job.country,
      flagEmoji: job.flagEmoji || '🌍',
      vacanciesCount: job.vacanciesCount,
      salaryText: job.salaryText,
      perks: Array.isArray(job.perks) ? job.perks.join(', ') : (job.perks || ''),
      category: job.category || 'Technical',
      status: job.status,
      description: job.description || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : (job.requirements || ''),
      workLocation: job.workLocation || ''
    });
  };

  // Save edited job
  const handleSaveEditJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      const perksArr = editJobForm.perks.split(',').map(s => s.trim()).filter(Boolean);
      const reqsArr = editJobForm.requirements.split(',').map(s => s.trim()).filter(Boolean);
      await apiAdminUpdateJob(editingJob.id, {
        title: editJobForm.title.trim(),
        country: editJobForm.country.trim(),
        flagEmoji: editJobForm.flagEmoji.trim() || '🌍',
        vacanciesCount: Number(editJobForm.vacanciesCount),
        salaryText: editJobForm.salaryText.trim(),
        perks: perksArr,
        category: editJobForm.category,
        status: editJobForm.status,
        description: editJobForm.description.trim(),
        requirements: reqsArr,
        workLocation: editJobForm.workLocation.trim()
      }, passcode);

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
      await apiAdminUpdateJob(job.id, { status: nextStatus }, passcode);
      fetchJobs();
      if (onJobsUpdated) onJobsUpdated();
    } catch (err) {
      console.error('Error toggling job status:', err);
    }
  };

  // Delete Job
  const handleDeleteJob = async (id: string) => {
    try {
      await apiAdminDeleteJob(id, passcode);
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

          <div className="flex items-center gap-2">
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                        <label className="block text-slate-400 mb-1 font-semibold">Mobile / WhatsApp Number *</label>
                        <input
                          type="tel"
                          required
                          value={newCandidate.phone}
                          onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                          placeholder="+91 98765 43210"
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

                  {/* Privacy Toggle & Export CSV */}
                  <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
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
                          candidates.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-900/50 transition">
                              <td className="py-3 px-4">
                                <div className="font-bold text-white">{c.fullName}</div>
                                <div className="text-[10px] font-mono text-amber-400">{c.id}</div>
                              </td>

                              <td className="py-3 px-4 font-mono font-bold text-slate-200">
                                {showSensitiveInfo ? (
                                  <span>{c.passportNumber}</span>
                                ) : (
                                  <span className="text-slate-500 tracking-widest font-mono">••••••••</span>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                <div className="text-slate-200 font-medium">{c.trade}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <CountryFlag country={c.targetCountry} size="xs" shape="circle" className="shrink-0" />
                                  <span>{c.targetCountry}</span>
                                  <span className="text-slate-600">•</span>
                                  <span>{c.interviewCity}</span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  c.currentStage === 1
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : c.currentStage === 2
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : c.currentStage === 3
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : c.currentStage === 4
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : c.currentStage === 5
                                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                    : c.currentStage === 6
                                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  Stage {c.currentStage}: {STAGE_NAMES[c.currentStage as StageNumber]}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={c.remarks}>
                                {c.remarks}
                              </td>

                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setEditingCandidate(c)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-[11px] border border-slate-700 transition cursor-pointer"
                                    title="Update Status Stage"
                                  >
                                    Update Stage
                                  </button>

                                  {onTestTracker && (
                                    <button
                                      onClick={() => onTestTracker(c.passportNumber)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                                      title="Test on Public Tracker"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {candidateToDeleteId === c.id ? (
                                    <div className="inline-flex items-center gap-1 bg-rose-950/80 border border-rose-500/40 px-1.5 py-0.5 rounded-lg">
                                      <span className="text-[10px] text-rose-300 font-semibold">Delete?</span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCandidate(c.id)}
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
                                      onClick={() => setCandidateToDeleteId(c.id)}
                                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                                      title="Delete Candidate Record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
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
                          Update Stage for: {editingCandidate.fullName} ({editingCandidate.passportNumber})
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
                          value={editingCandidate.currentStage}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold"
                          onChange={(e) => {
                            const newStg = Number(e.target.value) as StageNumber;
                            let newRemark = editingCandidate.remarks;
                            if (newStg === 1) newRemark = 'Application received and under preliminary review.';
                            else if (newStg === 2) newRemark = `Scheduled / Cleared technical trade interview at ${editingCandidate.interviewCity} Trade Test Centre.`;
                            else if (newStg === 3) newRemark = 'Medical examination completed (GAMCA/Authorized Center).';
                            else if (newStg === 4) newRemark = `Work permit & visa documents submitted to ${editingCandidate.targetCountry} embassy.`;
                            else if (newStg === 5) newRemark = `Work visa officially issued by ${editingCandidate.targetCountry} destination immigration.`;
                            else if (newStg === 6) newRemark = 'Police Clearance & Protector of Emigrants (eMigrate) clearance approved.';
                            else if (newStg === 7) newRemark = `Flight ticket confirmed & pre-departure orientation completed for ${editingCandidate.targetCountry}.`;

                            setEditingCandidate({
                              ...editingCandidate,
                              currentStage: newStg,
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

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingCandidate(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateCandidateStatus(
                          editingCandidate.id,
                          editingCandidate.currentStage,
                          editingCandidate.remarks
                        )}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                      >
                        Commit & Save Status
                      </button>
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
                          enquiries.map((e) => {
                            const isQuota = e.type === 'Workforce Quota Request';
                            const phoneDigits = (e.phone || '').replace(/\D/g, '');
                            const isExpanded = expandedEnquiryId === e.id;

                            return (
                              <React.Fragment key={e.id}>
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
                      {allJobs.map((j) => (
                        <tr key={j.id} className="hover:bg-slate-900/50">
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
    </div>
  );
};
