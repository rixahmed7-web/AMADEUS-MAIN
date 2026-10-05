import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  Terminal,
  ExternalLink,
  MessageCircle,
  FileText,
  Plane,
  User,
  Hash,
  CreditCard,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { ItrReceiptData } from '../types';

interface ShareCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData: ItrReceiptData | null;
  commandHistory?: string[];
  onRunCommandInTerminal?: (cmd: string) => void;
}

export const generateStandardGdsWorkflow = (ticket: ItrReceiptData): string[] => {
  const seg1 = ticket.segments[0];
  const pax1 = ticket.passengers[0] || {
    surname: ticket.passengerName.split('/')[0] || 'HOSSAIN',
    firstName: ticket.passengerName.split('/')[1]?.split(' ')[0] || 'ABUL',
    title: 'MR',
  };
  const air = seg1?.airline || ticket.issuingAirline || 'BG';
  const flt = seg1?.flightNumber || '433';
  const cls = seg1?.bookingClass || 'Y';
  const date = seg1?.date || '20OCT';
  const orig = seg1?.origin || 'DAC';
  const dest = seg1?.destination || 'CGP';
  const fop = ticket.formOfPayment || 'CASH';

  return [
    `FXD${date}${orig}${dest}`,
    `FXZ1`,
    `NM1${pax1.surname}/${pax1.firstName} ${pax1.title || 'MR'}`,
    `SRDOCS HK1-P-BD-EF0123456-BD-10FEB95-M-18NOV28-${pax1.surname}/${pax1.firstName}/P1`,
    `AP ${orig} 01711223344-A`,
    `TKOK`,
    `FP ${fop}`,
    `RF AGENT;ER`,
    `FXP`,
    `TTP/RT`,
    `ITR`,
  ];
};

export const ShareCommandModal: React.FC<ShareCommandModalProps> = ({
  isOpen,
  onClose,
  ticketData,
  commandHistory = [],
  onRunCommandInTerminal,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'user' | 'workflow'>('user');

  if (!isOpen || !ticketData) return null;

  const standardWorkflow = generateStandardGdsWorkflow(ticketData);

  // Filter commands relevant to booking and ticketing (avoiding pure navigation/clear clutter)
  const filteredUserCommands = (
    commandHistory.length > 0 ? commandHistory : ticketData.commandHistory || []
  ).filter((cmd) => {
    const c = cmd.trim().toUpperCase();
    return c && c !== 'CLEAR' && c !== 'CLS' && c !== 'MD' && c !== 'MU' && c !== 'MT' && c !== 'MB';
  });

  const displayUserCommands =
    filteredUserCommands.length > 0 ? filteredUserCommands : standardWorkflow;

  const currentCommandsList = activeTab === 'user' ? displayUserCommands : standardWorkflow;

  const formatTicketShareText = (): string => {
    const lines = [
      `✈️ AMADEUS E-TICKET CONFIRMATION & COMMAND BLUEPRINT`,
      `----------------------------------------------------`,
      `Passenger   : ${ticketData.passengerName} (${ticketData.paxType || 'ADT'})`,
      `Route       : ${ticketData.routeJourney || 'DAC ✈ CGP'}`,
      `Airline     : ${ticketData.issuingAirlineName} (${ticketData.issuingAirline})`,
      `PNR Locator : ${ticketData.pnrLocator}`,
      `Ticket No   : ${ticketData.ticketNumber}`,
      `Total Fare  : ${ticketData.currency} ${ticketData.grandTotalFare.toLocaleString()}`,
      `Issue Date  : ${ticketData.formattedIssueDate || ticketData.issueDate}`,
      `----------------------------------------------------`,
      `COMMAND HISTORY (GDS SEQUENCE):`,
      ...currentCommandsList.map((cmd, idx) => `${String(idx + 1).padStart(2, '0')}. ${cmd}`),
      `----------------------------------------------------`,
      `Generated via Amadeus Selling Platform Connect Web Simulator`,
    ];
    return lines.join('\n');
  };

  const handleCopyCommandsOnly = () => {
    const text = currentCommandsList.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedType('commands');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyFullTicket = () => {
    const text = formatTicketShareText();
    navigator.clipboard.writeText(text);
    setCopiedType('full');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopySingle = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedType(`single-${index}`);
    setTimeout(() => setCopiedType(null), 1500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(formatTicketShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Amadeus E-Ticket - ${ticketData.pnrLocator}`,
          text: formatTicketShareText(),
        });
      } catch {
        handleCopyFullTicket();
      }
    } else {
      handleCopyFullTicket();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      id="share-command-modal-overlay"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200"
        id="share-command-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0b3b60] via-[#005eb8] to-[#0b3b60] text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center border border-white/20">
              <Share2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>Share Your Command</span>
                <span className="text-xs bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-medium">
                  E-Ticket Command History
                </span>
              </h3>
              <p className="text-xs text-blue-100/90 font-medium">
                এই টিকিটটি ইস্যু করার সমস্ত কমান্ড হিস্ট্রি কপি ও শেয়ার করুন।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 flex-1">
          {/* Ticket Information Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-[#005eb8]" />
                <span>Ticket &amp; PNR Overview</span>
              </span>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                PNR: {ticketData.pnrLocator}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[11px] block">Passenger:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-600" />
                  {ticketData.passengerName}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-500 text-[11px] block">Route &amp; Carrier:</span>
                <span className="font-bold text-slate-900 truncate block">
                  {ticketData.routeJourney || 'DAC ✈ CGP'} ({ticketData.issuingAirline})
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-500 text-[11px] block">Ticket Number:</span>
                <span className="font-mono font-bold text-emerald-700 block">
                  {ticketData.ticketNumber}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-500 text-[11px] block">Total Amount:</span>
                <span className="font-bold text-slate-900">
                  {ticketData.currency} {ticketData.grandTotalFare.toLocaleString()}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-500 text-[11px] block">Issuing Office:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {ticketData.officeId} / {ticketData.iataNumber}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-500 text-[11px] block">Form of Payment:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {ticketData.formOfPayment}
                </span>
              </div>
            </div>
          </div>

          {/* Command History View Mode Selector */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 flex-wrap">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('user')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'user'
                    ? 'bg-[#005eb8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>My Executed Commands ({displayUserCommands.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('workflow')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'workflow'
                    ? 'bg-[#005eb8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Standard Amadeus Blueprint ({standardWorkflow.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-medium">
              Click individual <Copy className="w-3 h-3 inline text-slate-400" /> to copy single command
            </span>
          </div>

          {/* Commands List Display Container */}
          <div className="bg-slate-900 rounded-lg p-3 text-slate-100 border border-slate-700 font-mono text-xs max-h-56 overflow-y-auto space-y-1.5 select-text shadow-inner">
            {currentCommandsList.map((cmd, idx) => {
              const isSingleCopied = copiedType === `single-${idx}`;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500 text-[10px] w-5 select-none">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="text-emerald-400 font-bold select-none">&gt;</span>
                    <span className="text-emerald-300 font-semibold truncate tracking-wide">
                      {cmd}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopySingle(cmd, idx)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy this command"
                    >
                      {isSingleCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-sans">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-sans">Copy</span>
                        </>
                      )}
                    </button>

                    {onRunCommandInTerminal && (
                      <button
                        type="button"
                        onClick={() => {
                          onRunCommandInTerminal(cmd);
                          onClose();
                        }}
                        className="px-2 py-0.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-[10px] font-sans transition-colors cursor-pointer"
                        title="Run directly in terminal"
                      >
                        Run
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Copy / Share Success Feedback Banner */}
          {copiedType && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-md text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {copiedType === 'commands'
                  ? 'সবগুলো কমান্ড ক্লিপবোর্ডে কপি করা হয়েছে! (All commands copied)'
                  : copiedType === 'full'
                  ? 'টিকিট বিবরণ ও সম্পূর্ণ কমান্ড হিস্ট্রি কপি করা হয়েছে!'
                  : 'কমান্ড ক্লিপবোর্ডে কপি করা হয়েছে!'}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-copy-commands-only"
              onClick={handleCopyCommandsOnly}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-md shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
              title="Copy list of GDS commands only"
            >
              {copiedType === 'commands' ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied All Commands!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Commands</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-copy-full-summary"
              onClick={handleCopyFullTicket}
              className="px-4 py-2 bg-[#005eb8] hover:bg-[#00478c] text-white font-bold text-xs sm:text-sm rounded-md shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
              title="Copy complete ticket details + command sequence"
            >
              {copiedType === 'full' ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied Full Summary!</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Copy Ticket &amp; Commands</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-share-whatsapp"
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm rounded-md shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs sm:text-sm rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
              title="Native share sheet"
            >
              <ExternalLink className="w-4 h-4 text-slate-700" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-md border border-slate-300 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
