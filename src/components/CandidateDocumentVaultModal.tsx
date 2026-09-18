import React, { useState } from 'react';
import { 
  FolderLock, 
  FileText, 
  CheckCircle2, 
  Clock, 
  UploadCloud, 
  ExternalLink, 
  Eye, 
  Download, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Award, 
  FileCheck, 
  Video, 
  Play, 
  Printer, 
  Building2, 
  Calendar, 
  User, 
  Globe, 
  Save, 
  RefreshCw,
  Check
} from 'lucide-react';
import { Application, CandidateDocument } from '../types';
import { getCandidateDocumentStatus, apiAdminUpdateCandidateDocument } from '../services/apiService';
import { QRCodeSVG } from 'qrcode.react';

interface CandidateDocumentVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Application;
  isAdmin?: boolean;
  onDocumentUpdated?: (updatedCandidate: Application) => void;
}

export const CandidateDocumentVaultModal: React.FC<CandidateDocumentVaultModalProps> = ({
  isOpen,
  onClose,
  candidate,
  isAdmin = false,
  onDocumentUpdated
}) => {
  const [activeDocPreview, setActiveDocPreview] = useState<CandidateDocument | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<'Verified' | 'Pending' | 'Uploaded'>('Verified');
  const [tempDocNumber, setTempDocNumber] = useState<string>('');
  const [tempNotes, setTempNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Retrieve or compute current documents
  const documents: CandidateDocument[] = getCandidateDocumentStatus(candidate);

  // Stats calculation
  const verifiedCount = documents.filter(d => d.status === 'Verified' || d.status === 'Approved' || d.status === 'Issued').length;
  const uploadedCount = documents.filter(d => d.status === 'Uploaded' || d.status === 'Under Review').length;
  const pendingCount = documents.filter(d => d.status === 'Pending' || d.status === 'Pending Action' || d.status === 'Pending Stage').length;

  const candidateName = candidate.fullName || candidate.name || 'Candidate';
  const passportNo = candidate.passportNumber || candidate.id;
  const token = candidate.token || `TIC-${passportNo.slice(-4)}`;
  const trade = candidate.trade || 'Technical Trade';
  const targetCountry = candidate.targetCountry || candidate.country || 'Overseas';

  const handleStartEdit = (doc: CandidateDocument) => {
    setEditingDocId(doc.id);
    let s: 'Verified' | 'Pending' | 'Uploaded' = 'Verified';
    if (doc.status === 'Pending' || doc.status === 'Pending Action' || doc.status === 'Pending Stage') s = 'Pending';
    else if (doc.status === 'Uploaded' || doc.status === 'Under Review') s = 'Uploaded';
    setTempStatus(s);
    setTempDocNumber(doc.documentNumber || '');
    setTempNotes(doc.notes || '');
  };

  const handleSaveDocStatus = async (docId: string) => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const res = await apiAdminUpdateCandidateDocument(
        passportNo,
        docId,
        tempStatus,
        tempDocNumber,
        tempNotes
      );
      if (res.success && res.candidate) {
        setSaveSuccessMsg(`Updated document to [${tempStatus}]`);
        if (onDocumentUpdated) {
          onDocumentUpdated(res.candidate);
        }
        setEditingDocId(null);
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error('Failed to update document status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Top Header */}
        <div className="px-6 py-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <FolderLock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-white text-lg font-['Space_Grotesk']">
                  Candidate Document Vault
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isAdmin ? 'Recruiter Admin Vault' : 'Official Candidate Dossier'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified overseas deployment scans, GCC clearances, trade certifications & consular permits.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close Vault"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Profile Strip */}
        <div className="bg-slate-950/60 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">{candidateName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="font-mono text-amber-300">Token: {token}</span>
              <span>•</span>
              <span className="font-mono text-slate-300">Passport: {passportNo}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <span>•</span>
              <span className="text-sky-300 font-medium">{trade}</span>
              <span>•</span>
              <span className="text-slate-300">{targetCountry}</span>
            </div>
          </div>

          {/* Counts pill */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              {verifiedCount} Verified
            </span>
            <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[11px] font-bold border border-sky-500/30">
              {uploadedCount} Uploaded
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
              {pendingCount} Pending
            </span>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Documents Grid / List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => {
              const isEditing = editingDocId === doc.id;
              let normalizedStatus: 'Verified' | 'Pending' | 'Uploaded' = 'Verified';
              if (doc.status === 'Pending' || doc.status === 'Pending Action' || doc.status === 'Pending Stage') {
                normalizedStatus = 'Pending';
              } else if (doc.status === 'Uploaded' || doc.status === 'Under Review') {
                normalizedStatus = 'Uploaded';
              }

              const isTradeTest = doc.id.includes('tradetest') || doc.category === 'technical';

              return (
                <div 
                  key={doc.id}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-3.5 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                        {doc.id.includes('passport') && <FileText className="w-5 h-5 text-sky-400" />}
                        {doc.id.includes('medical') && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                        {doc.id.includes('tradetest') && <Award className="w-5 h-5 text-amber-400" />}
                        {doc.id.includes('visa') && <FileCheck className="w-5 h-5 text-indigo-400" />}
                        {doc.id.includes('pcc') && <Building2 className="w-5 h-5 text-teal-400" />}
                        {!doc.id.includes('passport') && !doc.id.includes('medical') && !doc.id.includes('tradetest') && !doc.id.includes('visa') && !doc.id.includes('pcc') && (
                          <FileText className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">
                            {doc.name}
                          </h4>
                          {isTradeTest && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Video className="w-3 h-3" /> Video Demo
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span className="text-[11px] font-medium text-slate-300">{doc.authority}</span>
                          {doc.documentNumber && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-amber-300/90 text-[11px]">Ref: {doc.documentNumber}</span>
                            </>
                          )}
                          {doc.verifiedDate && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 text-[11px]">Auth: {doc.verifiedDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status Badge: [Verified / Pending / Uploaded] */}
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        normalizedStatus === 'Verified'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : normalizedStatus === 'Uploaded'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {normalizedStatus === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {normalizedStatus === 'Uploaded' && <UploadCloud className="w-3.5 h-3.5 text-sky-400" />}
                        {normalizedStatus === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                        <span>[{normalizedStatus}]</span>
                      </span>

                      {/* Preview Scan CTA */}
                      <button
                        type="button"
                        onClick={() => setActiveDocPreview(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer"
                        title="View high-resolution official document scan"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>Preview Scan</span>
                      </button>

                      {/* Admin Edit Trigger */}
                      {isAdmin && !isEditing && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(doc)}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                          title="Change verification status or edit notes"
                        >
                          Edit Status
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes & Description */}
                  <p className="text-xs text-slate-300/90 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    {doc.notes}
                  </p>

                  {/* Inline Admin Editor */}
                  {isAdmin && isEditing && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3 animate-in fade-in text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                          Admin Document Controls: {doc.name}
                        </span>
                        <button
                          onClick={() => setEditingDocId(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Set Document Status</label>
                          <div className="flex items-center gap-2">
                            {(['Verified', 'Uploaded', 'Pending'] as const).map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setTempStatus(s)}
                                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs border transition cursor-pointer ${
                                  tempStatus === s 
                                    ? s === 'Verified' ? 'bg-emerald-600 text-white border-emerald-500'
                                      : s === 'Uploaded' ? 'bg-sky-600 text-white border-sky-500'
                                      : 'bg-amber-600 text-white border-amber-500'
                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Official Reference / Certificate No.</label>
                          <input
                            type="text"
                            value={tempDocNumber}
                            onChange={(e) => setTempDocNumber(e.target.value)}
                            placeholder="e.g. GAMCA-WAFID-9021 or RPO-DEL-7729"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Verification Remarks / Officer Note</label>
                        <input
                          type="text"
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="Add consular / inspection details"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingDocId(null)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleSaveDocStatus(doc.id)}
                          className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Save to Dossier</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ministry of External Affairs (MEA) Registered Agency • RC No. B-0613</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            Close Vault
          </button>
        </div>

      </div>

      {/* ----------------------------------------------------
          DOCUMENT SCAN PREVIEW SUB-MODAL
         ---------------------------------------------------- */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Preview Header */}
            <div className="p-4 bg-slate-950 text-white border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-bold text-sm">{activeDocPreview.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Ref: {activeDocPreview.documentNumber || `DOC-${candidate.passportNumber}`} • Auth: {activeDocPreview.authority}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDocPreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Scan Replica Canvas */}
            <div className="p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center">
              
              {/* Specialized rendering for Trade Test Video */}
              {activeDocPreview.id.includes('tradetest') ? (
                <div className="w-full bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-xl space-y-3 p-4">
                  <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-800 group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                    <div className="z-20 text-center space-y-2 p-4">
                      <div className="w-14 h-14 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition cursor-pointer">
                        <Play className="w-7 h-7 fill-current ml-1" />
                      </div>
                      <p className="font-bold text-sm text-white">
                        Practical Workshop Trade Test Assessment Recording
                      </p>
                      <p className="text-xs text-amber-300 font-mono">
                        {candidate.trade} Practical Demonstration • Janakpuri Testing Bay #4
                      </p>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                      <span>Recorded: {candidate.appliedDate?.split('T')[0] || '2026-03-12'}</span>
                      <span>Duration: 02:45 • Score: 94/100 (Cleared)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Chief Assessor:</span>
                      <span className="font-semibold text-white">Er. Vikramjit Trehan (Lead Technical Assessor)</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Technical Competencies Cleared:</span>
                      <span className="text-emerald-400 font-medium">Safety Protocols, Tool Rigidity, Machine Operation</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* High-fidelity official document scan frame */
                <div className="w-full max-w-lg bg-amber-50/90 text-slate-900 p-6 sm:p-8 rounded-2xl border-4 border-double border-amber-900/30 shadow-2xl relative space-y-4">
                  
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <span className="text-5xl font-black uppercase transform -rotate-45">
                      TREHAN VERIFIED
                    </span>
                  </div>

                  {/* Document Header */}
                  <div className="text-center border-b-2 border-slate-400/60 pb-3">
                    <span className="text-[10px] font-mono tracking-widest text-slate-600 uppercase">
                      OFFICIAL OVERSEAS RECRUITMENT DOSSIER • SECURE ARCHIVE
                    </span>
                    <h3 className="text-lg font-black tracking-wide text-[#0F2444] uppercase mt-0.5">
                      {activeDocPreview.authority}
                    </h3>
                    <p className="text-xs font-bold text-amber-900/80">
                      {activeDocPreview.name}
                    </p>
                  </div>

                  {/* Document Attributes */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Candidate Name</span>
                      <span className="font-bold text-slate-900">{candidateName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Passport Number</span>
                      <span className="font-mono font-bold text-slate-900">{passportNo}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Designated Trade</span>
                      <span className="font-bold text-slate-900">{trade}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Destination</span>
                      <span className="font-bold text-slate-900">{targetCountry}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Serial / Certificate ID</span>
                      <span className="font-mono font-bold text-blue-900">
                        {activeDocPreview.documentNumber || `REG-${passportNo}-01`}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Verification Date</span>
                      <span className="font-medium text-slate-900">
                        {activeDocPreview.verifiedDate || 'March 2026'}
                      </span>
                    </div>
                  </div>

                  {/* Stamp & QR Code */}
                  <div className="pt-3 border-t border-slate-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-white border border-slate-300 rounded-lg shadow-sm">
                        <QRCodeSVG 
                          value={`https://trehaninternational.com/?doc=${activeDocPreview.id}&pass=${passportNo}`} 
                          size={64}
                          level="M"
                        />
                      </div>
                      <div className="text-[10px] text-slate-600">
                        <span className="block font-bold text-slate-800">Tamper-Proof Digital Verification</span>
                        <span>Scan with government reader to validate authenticity</span>
                      </div>
                    </div>

                    {/* Official Embossed Stamp */}
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-700 flex flex-col items-center justify-center text-emerald-800 rotate-12 bg-emerald-50/50 text-center p-1">
                      <span className="text-[8px] font-black uppercase tracking-tighter">AUTHENTICATED</span>
                      <Check className="w-4 h-4 text-emerald-700 my-0.5" />
                      <span className="text-[7px] font-mono">TICE MEA-B0613</span>
                    </div>
                  </div>

                  {/* Footer Machine Readable Zone */}
                  <div className="bg-slate-200/90 p-2 rounded text-[10px] font-mono tracking-widest text-slate-700 select-all overflow-hidden text-center">
                    P&lt;IND{passportNo}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br/>
                    TICE9928198M2911281IND&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;04
                  </div>
                </div>
              )}

            </div>

            {/* Preview Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Official Document Scan • Authorized for Embassy & Emigration Clearances
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Scan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocPreview(null)}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
