import React, { useState, useMemo } from 'react';
import { 
  Send, 
  Users, 
  Filter, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  ChevronRight, 
  Globe, 
  Briefcase, 
  Layers, 
  Sparkles,
  ExternalLink,
  History
} from 'lucide-react';
import { Application, BroadcastLog, StageNumber } from '../types';
import { apiAdminDispatchBulkBroadcast } from '../services/apiService';

interface BulkBroadcastDispatcherProps {
  candidates: Application[];
  onBroadcastCompleted?: () => void;
}

const BROADCAST_TEMPLATES = [
  {
    title: 'Trade Test & Interview Alert',
    stage: 2,
    message: 'Namaste {{name}}, Trehan International (RC B-0613) Update: Your technical trade test for {{trade}} has been scheduled at our Janakpuri Testing Center. Report with original passport and 8 photos. Track live details: {{portal_link}}'
  },
  {
    title: 'GAMCA Medical Screening Reminder',
    stage: 3,
    message: 'Namaste {{name}}, Trehan International Update: Your GAMCA/Wafid medical fitness token for {{trade}} is generated. Please complete screening with fasting at your authorized clinic. Check voucher: {{portal_link}}'
  },
  {
    title: 'Consular Visa Endorsement Notification',
    stage: 5,
    message: 'Congratulations {{name}}! Your overseas work permit and employment visa for {{trade}} has been officially endorsed by the destination consulate. Next step is PCC clearance. Check visa copy: {{portal_link}}'
  },
  {
    title: 'Flight Ticket & Pre-Departure Briefing',
    stage: 7,
    message: 'Namaste {{name}}, your final air ticket and deployment clearance for {{trade}} is confirmed! Report for mandatory pre-departure orientation (PDOT) and travel documents collection: {{portal_link}}'
  }
];

export const BulkBroadcastDispatcher: React.FC<BulkBroadcastDispatcherProps> = ({
  candidates,
  onBroadcastCompleted
}) => {
  // Filter states
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedTrade, setSelectedTrade] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Composer states
  const [broadcastTitle, setBroadcastTitle] = useState<string>('Urgent Overseas Deployment Update');
  const [broadcastMessage, setBroadcastMessage] = useState<string>(
    'Namaste {{name}}, TICE Update: Important status bulletin regarding your overseas application for {{trade}}. Please view updated milestone and gate pass: {{portal_link}} - Trehan International (RC No. B-0613)'
  );
  const [selectedChannel, setSelectedChannel] = useState<'WhatsApp' | 'SMS' | 'Email' | 'Multi-Channel'>('WhatsApp');
  
  // Execution states
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<{ count: number; timestamp: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local Broadcast History Log
  const [broadcastLogs, setBroadcastLogs] = useState<BroadcastLog[]>([
    {
      id: 'BC-901',
      timestamp: '2026-03-14 11:30 AM',
      targetCriteria: 'Trade: Structural Welder • Country: Russia',
      recipientCount: 8,
      message: 'Reporting for embassy biometric verification at New Delhi Consulate.',
      channel: 'WhatsApp',
      status: 'Sent'
    },
    {
      id: 'BC-902',
      timestamp: '2026-03-12 04:15 PM',
      targetCriteria: 'Stage 3: Medical Fitness • All Countries',
      recipientCount: 12,
      message: 'GAMCA medical appointment slips uploaded to candidate portal.',
      channel: 'Multi-Channel',
      status: 'Sent'
    }
  ]);

  // Extract unique trades and countries for filter options
  const uniqueTrades = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach(c => {
      if (c.trade) set.add(c.trade);
    });
    return Array.from(set).sort();
  }, [candidates]);

  const uniqueCountries = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach(c => {
      const country = c.targetCountry || c.country;
      if (country) set.add(country);
    });
    return Array.from(set).sort();
  }, [candidates]);

  // Filter candidates dynamically
  const filteredRecipients = useMemo(() => {
    return candidates.filter(c => {
      const country = c.targetCountry || c.country || '';
      if (selectedCountry !== 'ALL' && country.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }
      if (selectedTrade !== 'ALL' && c.trade?.toLowerCase() !== selectedTrade.toLowerCase()) {
        return false;
      }
      if (selectedStage !== 'ALL' && c.currentStage !== selectedStage) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = (
          (c.fullName || c.name || '').toLowerCase().includes(q) ||
          (c.passportNumber || '').toLowerCase().includes(q) ||
          (c.phone || '').includes(q)
        );
        if (!matches) return false;
      }
      return true;
    });
  }, [candidates, selectedCountry, selectedTrade, selectedStage, searchQuery]);

  const handleApplyTemplate = (tpl: typeof BROADCAST_TEMPLATES[0]) => {
    setBroadcastTitle(tpl.title);
    setBroadcastMessage(tpl.message);
    if (typeof tpl.stage === 'number') {
      setSelectedStage(tpl.stage);
    }
  };

  const handleDispatchBroadcast = async () => {
    if (filteredRecipients.length === 0) {
      setErrorMsg('No recipients match the selected criteria.');
      return;
    }
    if (!broadcastMessage.trim()) {
      setErrorMsg('Broadcast message content cannot be empty.');
      return;
    }

    setIsDispatching(true);
    setErrorMsg(null);
    setDispatchResult(null);

    try {
      const ids = filteredRecipients.map(c => c.passportNumber || c.id);
      const res = await apiAdminDispatchBulkBroadcast(ids, broadcastMessage, broadcastTitle);
      
      if (res.success) {
        setDispatchResult({ count: res.dispatchedCount, timestamp: res.timestamp });
        
        // Log to local history
        const newLog: BroadcastLog = {
          id: `BC-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          targetCriteria: `Trade: ${selectedTrade} • Stage: ${selectedStage} • Country: ${selectedCountry}`,
          recipientCount: res.dispatchedCount,
          message: broadcastTitle,
          channel: selectedChannel,
          status: 'Sent'
        };
        setBroadcastLogs(prev => [newLog, ...prev]);

        if (onBroadcastCompleted) {
          onBroadcastCompleted();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing broadcast.');
    } finally {
      setIsDispatching(false);
    }
  };

  const formatCandidateWhatsAppLink = (candidate: Application) => {
    const rawPhone = (candidate.phone || '').toString();
    const candidateName = candidate.fullName || candidate.name || 'Candidate';
    const candidateTrade = candidate.trade || 'Technical Trade';
    const passportNo = candidate.passportNumber || candidate.id;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://trehaninternational.com';
    const portalLink = `${origin}/?passport=${passportNo}`;

    let cleanPhone = rawPhone.replace(/[^\d+]/g, '');
    if (cleanPhone.startsWith('+')) cleanPhone = cleanPhone.slice(1);
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
    if (!cleanPhone) cleanPhone = '919910044590';

    const personalized = broadcastMessage
      .replace(/{{name}}/g, candidateName)
      .replace(/{{trade}}/g, candidateTrade)
      .replace(/{{stage}}/g, `Stage ${candidate.currentStage || 1}`)
      .replace(/{{portal_link}}/g, portalLink);

    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(personalized)}`;
  };

  return (
    <div className="space-y-6 text-xs text-slate-200">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2 font-['Space_Grotesk']">
            <Send className="w-5 h-5 text-amber-400" />
            <span>Bulk Broadcast Dispatcher</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Send targeted batch notifications, WhatsApp status updates, and trade test calls across your recruitment pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            <span>{filteredRecipients.length} Targets Selected</span>
          </span>
        </div>
      </div>

      {/* Grid: Left Composer & Filters, Right Target Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Filter Criteria & Message Editor */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Target Audience Filters */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                1. Target Audience Filters
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCountry('ALL');
                  setSelectedTrade('ALL');
                  setSelectedStage('ALL');
                  setSearchQuery('');
                }}
                className="text-[11px] text-slate-400 hover:text-amber-300"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Country Filter */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs"
                >
                  <option value="ALL">All Countries ({candidates.length})</option>
                  {uniqueCountries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Trade Filter */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Designated Trade</label>
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs"
                >
                  <option value="ALL">All Trades</option>
                  {uniqueTrades.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Stage Filter */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Pipeline Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs font-semibold"
                >
                  <option value="ALL">All Stages (1 - 7)</option>
                  <option value="1">Stage 1: Application Review</option>
                  <option value="2">Stage 2: Trade Test & Interview</option>
                  <option value="3">Stage 3: Medical Fitness</option>
                  <option value="4">Stage 4: Visa Applied</option>
                  <option value="5">Stage 5: Visa Approved</option>
                  <option value="6">Stage 6: PCC / POE Cleared</option>
                  <option value="7">Stage 7: Ready for Flight</option>
                </select>
              </div>
            </div>
          </div>

          {/* Broadcast Message Composer */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                2. Compose Announcement
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Tokens: {'{{name}}'}, {'{{trade}}'}, {'{{portal_link}}'}
              </span>
            </div>

            {/* Quick Templates Bar */}
            <div className="flex flex-wrap gap-1.5">
              {BROADCAST_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition cursor-pointer"
                >
                  ⚡ {tpl.title}
                </button>
              ))}
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Broadcast Subject</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="Announcement Title"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-semibold text-xs"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Message Content</label>
              <textarea
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Compose personalized message..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs leading-relaxed"
              />
            </div>

            {/* Channel Selection & Dispatch Action */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Channel:</span>
                {(['WhatsApp', 'SMS', 'Multi-Channel'] as const).map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSelectedChannel(ch)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      selectedChannel === ch
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={isDispatching || filteredRecipients.length === 0}
                onClick={handleDispatchBroadcast}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition cursor-pointer"
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching {filteredRecipients.length} Messages...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch to {filteredRecipients.length} Candidates</span>
                  </>
                )}
              </button>
            </div>

            {/* Error or Success Alerts */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {dispatchResult && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Successfully recorded bulk broadcast for {dispatchResult.count} candidate timelines!</span>
              </div>
            )}
          </div>

        </div>

        {/* Right 5 Cols: Target Candidates Preview & Direct Dispatch Links */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col h-full max-h-[520px]">
            <div className="flex items-center justify-between shrink-0">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" />
                Selected Recipients ({filteredRecipients.length})
              </span>
              <span className="text-[11px] text-slate-400">
                1-Click Direct Dispatches
              </span>
            </div>

            {/* Recipients Scrollable List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredRecipients.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p>No candidates match current filter filters.</p>
                </div>
              ) : (
                filteredRecipients.map((c) => {
                  const phoneFormatted = c.phone || 'No Phone';
                  return (
                    <div 
                      key={c.id || c.passportNumber}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 flex items-center justify-between gap-2 hover:border-slate-700 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate text-xs">
                            {c.fullName || c.name || 'Candidate'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono shrink-0">
                            Stg {c.currentStage || 1}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {c.trade} • {c.targetCountry || c.country} • <span className="font-mono">{phoneFormatted}</span>
                        </p>
                      </div>

                      <a
                        href={formatCandidateWhatsAppLink(c)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 shrink-0 transition"
                        title="Send personalized WhatsApp status message directly"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        <span>Send</span>
                      </a>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 shrink-0">
              Dispatches log directly into each candidate's official historical timeline.
            </div>
          </div>
        </div>

      </div>

      {/* Broadcast History Log */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-400" />
            Recent Broadcast Dispatch History
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Audit Trail Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                <th className="py-2 px-3">Broadcast ID</th>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Criteria / Target Cohort</th>
                <th className="py-2 px-3">Recipients</th>
                <th className="py-2 px-3">Channel</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {broadcastLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{log.id}</td>
                  <td className="py-2.5 px-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-2.5 px-3 text-white font-medium">{log.targetCriteria}</td>
                  <td className="py-2.5 px-3 font-mono text-sky-300 font-bold">{log.recipientCount} Candidates</td>
                  <td className="py-2.5 px-3 text-slate-300">{log.channel}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
