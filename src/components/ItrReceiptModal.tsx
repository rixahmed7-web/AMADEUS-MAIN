import React, { useState } from 'react';
import { ItrReceiptData } from '../types';
import { printItrDocument, downloadItrTextFile } from '../utils/itrReceipt';
import { Printer, Download, Mail, X, Check, FileText } from 'lucide-react';

interface ItrReceiptModalProps {
  isOpen: boolean;
  data: ItrReceiptData | null;
  onClose: () => void;
  onSendEmail?: (email: string) => void;
}

export const ItrReceiptModal: React.FC<ItrReceiptModalProps> = ({
  isOpen,
  data,
  onClose,
  onSendEmail,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  if (!isOpen || !data) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    if (onSendEmail) {
      onSendEmail(emailInput.trim());
    }
    setEmailSentSuccess(true);
    setTimeout(() => {
      setEmailSentSuccess(false);
    }, 3500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto"
      id="itr-receipt-modal"
    >
      <div className="bg-white rounded-md shadow-2xl border border-[#cbd5e1] w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-[#005eb8] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-300" />
            <div>
              <div className="font-bold text-base tracking-tight flex items-center gap-2">
                <span>amadeus</span>
                <span className="text-xs font-normal text-blue-100 uppercase tracking-wider bg-[#00478c] px-2 py-0.5 rounded-xs">
                  Selling Platform Connect
                </span>
              </div>
              <div className="text-xs text-blue-100">
                Official Electronic Passenger Itinerary & Receipt (ITR)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => printItrDocument(data)}
              className="px-3 py-1.5 bg-white hover:bg-blue-50 text-[#005eb8] font-bold text-xs rounded-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f8fafc] text-sm text-[#1e293b]">
          {/* Status & Barcode simulation */}
          <div className="bg-white p-4 rounded border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-block px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded border border-emerald-300 mr-2">
                ELECTRONIC TICKET CONFIRMED
              </span>
              <span className="text-xs text-slate-500">
                Issue Date: <strong className="text-slate-800">{data.issueDate}</strong>
              </span>
            </div>
            <div className="text-right font-mono text-xs text-slate-600">
              <span className="tracking-widest font-bold text-sm text-slate-900 block">
                |||| | ||||| || |||||| | ||||
              </span>
              <span>TKT {data.ticketNumber}</span>
            </div>
          </div>

          {/* Passenger & Booking Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-4 rounded border border-slate-200 text-xs">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Passenger Name
              </div>
              <div className="font-bold text-sm text-slate-800 mt-0.5">
                {data.passengerName}
              </div>
              <div className="text-slate-500 text-[11px]">Type: {data.paxType || 'Adult'}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Amadeus Reference (RLOC)
              </div>
              <div className="font-mono font-bold text-sm text-[#005eb8] mt-0.5">
                1A / {data.pnrLocator}
              </div>
              <div className="text-slate-500 text-[11px]">
                Airline PNR: {data.airlineLocator}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Issuing Airline / IATA
              </div>
              <div className="font-bold text-slate-800 mt-0.5">
                {data.issuingAirlineName} ({data.issuingAirline})
              </div>
              <div className="text-slate-500 text-[11px]">IATA: {data.iataNumber}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Issuing Agency
              </div>
              <div className="font-semibold text-slate-800 mt-0.5">
                {data.issuingAgent}
              </div>
              <div className="text-slate-500 text-[11px]">Office ID: {data.officeId}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Form of Payment
              </div>
              <div className="font-mono font-semibold text-slate-800 mt-0.5">
                {data.formOfPayment}
              </div>
              <div className="text-slate-500 text-[11px]">Commission: {data.commission || '7%'}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ticket Status
              </div>
              <div className="font-semibold text-emerald-700 mt-0.5">
                OK / ISSUED &amp; AUDITED
              </div>
              <div className="text-slate-500 text-[11px]">Endorsement: NON-REFUNDABLE</div>
            </div>
          </div>

          {/* Flight Segments Table */}
          <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700">
              Flight Itinerary Schedule
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-2 px-3">Seg</th>
                    <th className="py-2 px-3">Flight</th>
                    <th className="py-2 px-3">Cls</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Origin</th>
                    <th className="py-2 px-3">Destination</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Baggage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.segments.map((s) => (
                    <tr key={s.segNum} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#005eb8]">{s.segNum}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {s.airline} {s.flightNumber}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{s.bookingClass}</td>
                      <td className="py-2.5 px-3 font-medium">{s.date}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{s.originName}</div>
                        <div className="text-[11px] text-slate-500">
                          {s.depTime} {s.originTerminal ? `(Term ${s.originTerminal})` : ''}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{s.destName}</div>
                        <div className="text-[11px] text-slate-500">
                          {s.arrTime} {s.destTerminal ? `(Term ${s.destTerminal})` : ''}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">{s.status}</td>
                      <td className="py-2.5 px-3">{s.baggage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing and Fare Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded border border-slate-200 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Fare Calculation &amp; Rules
              </div>
              <div className="font-mono text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 break-all leading-relaxed">
                {data.fareCalculation}
              </div>
              <div className="mt-2 text-slate-600 text-[11px]">
                <strong>Endorsements:</strong> {data.endorsements}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded border border-slate-200 text-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Base Air Fare:</span>
                  <span className="font-semibold">
                    {data.currency} {data.baseFare.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes &amp; Airline Surcharges:</span>
                  <span className="font-semibold">
                    {data.currency} {data.tax.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2 mt-2 flex justify-between items-center text-sm font-bold text-[#005eb8]">
                <span>Total Ticket Price:</span>
                <span className="text-base font-extrabold">
                  {data.currency} {data.totalFare.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Email Dispatch Form */}
          <div className="bg-blue-50/70 p-3 rounded border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#005eb8]" />
              <span className="font-semibold text-slate-800">
                Email Receipt to Customer:
              </span>
            </div>
            <form onSubmit={handleEmailSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="customer@email.com"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#005eb8]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#005eb8] hover:bg-[#00478c] text-white font-bold rounded text-xs transition-colors cursor-pointer shrink-0"
              >
                Send (ITR-EML)
              </button>
            </form>
            {emailSentSuccess && (
              <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Dispatched!
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-500">
            Compliant with IATA Reso 722g &amp; Amadeus Selling Platform Connect Standard
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadItrTextFile(data)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Text (.txt)</span>
            </button>
            <button
              type="button"
              onClick={() => printItrDocument(data)}
              className="px-4 py-1.5 bg-[#005eb8] hover:bg-[#00478c] text-white font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>📥 Download / Print Itinerary Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
