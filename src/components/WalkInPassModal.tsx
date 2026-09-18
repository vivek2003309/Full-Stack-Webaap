import React from 'react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckSquare, 
  User, 
  Briefcase, 
  Globe, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface WalkInPassData {
  candidateName: string;
  passportNumber: string;
  tokenId: string;
  trade: string;
  targetCountry?: string;
  reportingDate?: string;
  reportingTime?: string;
  venue?: string;
}

interface WalkInPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WalkInPassData;
}

export const WalkInPassModal: React.FC<WalkInPassModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const venueAddress = data.venue || 'TICE Overseas Skill Testing Complex, B-1/16, Community Centre, Janakpuri, New Delhi - 110058';
  const qrTarget = `https://trehaninternational.com/?pass=${data.passportNumber}&token=${data.tokenId}`;

  return (
    <div className="fixed inset-0 z-[140] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border-2 border-amber-400/80 print:border-none print:shadow-none print:m-0">
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Official Pre-Registration Trade Test & Interview Pass</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print Walk-in Pass</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE SLIP CONTENT */}
        <div id="walkin-slip-printable" className="p-6 sm:p-8 space-y-6">
          
          {/* Slip Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-amber-700 uppercase bg-amber-100 px-2.5 py-0.5 rounded">
                  Govt. of India Approved • MEA Reg: B-0613
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#0F2444] tracking-tight uppercase mt-1 font-['Space_Grotesk']">
                Trehan International Consultants
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Trade Testing, Skill Assessment & Overseas Recruitment Directorate
              </p>
            </div>

            <div className="text-right sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Candidate Entry Pass</span>
              <span className="text-lg font-mono font-black text-[#0F2444] bg-slate-100 px-3 py-1 rounded border border-slate-300 inline-block">
                {data.tokenId}
              </span>
            </div>
          </div>

          {/* Candidate & Trade Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Candidate Name</span>
              <span className="text-sm font-black text-slate-900">{data.candidateName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Passport Number</span>
              <span className="text-sm font-mono font-bold text-blue-900">{data.passportNumber}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Target Trade</span>
              <span className="text-sm font-bold text-amber-900">{data.trade}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Destination Country</span>
              <span className="text-sm font-bold text-slate-900">{data.targetCountry || 'Russia / GCC'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Reporting Schedule</span>
              <span className="text-sm font-bold text-slate-900">{data.reportingDate || 'Mon - Fri (Walk-in)'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Allocated Time Slot</span>
              <span className="text-sm font-bold text-emerald-800">{data.reportingTime || '09:30 AM - 01:00 PM'}</span>
            </div>
          </div>

          {/* Designated Venue Card */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold uppercase tracking-wider text-[11px]">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Designated Assessment Venue</span>
            </div>
            <p className="font-semibold text-slate-900 leading-relaxed text-sm">
              {venueAddress}
            </p>
            <p className="text-[11px] text-slate-600">
              Landmark: Near District Centre Metro Station (Blue Line), Janakpuri, West Delhi.
            </p>
          </div>

          {/* Mandatory Candidate Checklist */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Mandatory Candidate Reporting Checklist</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span className="text-slate-700"><strong>8 Passport Photos:</strong> White background, matte finish (35x45mm).</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span className="text-slate-700"><strong>Original Passport:</strong> Minimum 2 years remaining validity + 2 color copies.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span className="text-slate-700"><strong>Experience & ITI:</strong> Original trade diplomas, apprenticeships & service letters.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                <span className="text-slate-700"><strong>Safety Gear / Tools:</strong> Safety shoes & personal trade kit (for welders/electricians).</span>
              </div>
            </div>
          </div>

          {/* Verification Bar & Stamp */}
          <div className="pt-4 border-t-2 border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-1 bg-white border border-slate-300 rounded-lg shadow-sm">
                <QRCodeSVG value={qrTarget} size={72} level="M" />
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <span className="font-bold text-slate-900 block">Security Verification Barcode</span>
                <span>Scan at gate reception to bypass queuing.</span>
                <span className="block font-mono text-[10px] text-slate-500">AUTH: TICE-DEL-{data.tokenId}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="w-28 border-b-2 border-slate-800 pb-1 mb-1"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Recruitment Officer Seal
              </span>
              <span className="text-[10px] text-slate-500">Trehan International (RC No. B-0613)</span>
            </div>
          </div>

        </div>

        {/* Modal Actions Footer (Hidden on Print) */}
        <div className="bg-slate-100 px-6 py-4 flex items-center justify-between text-xs print:hidden border-t border-slate-200">
          <span className="text-slate-600">
            Please print or screenshot this pass and present it upon arrival at the Janakpuri center.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
