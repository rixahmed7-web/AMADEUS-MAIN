import React, { useState, useRef } from 'react';
import { ItrReceiptData } from '../types';
import {
  downloadItrTextFile,
  downloadItrPdfFile,
  formatGdsTime,
  formatGdsDatePretty,
} from '../utils/itrReceipt';
import {
  Printer,
  Download,
  Mail,
  X,
  Check,
  Plane,
  AlertTriangle,
  Loader2,
  FileText,
} from 'lucide-react';

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [logoImgError, setLogoImgError] = useState(false);
  const receiptCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const handlePrintClick = () => {
    window.print();
  };

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

  const handleDirectPdfDownload = async () => {
    try {
      setIsGeneratingPdf(true);
      const element = receiptCardRef.current || document.getElementById('itr-printable-receipt');
      const pnr = data.pnrLocator || 'TKT';
      const opt = {
        margin: [4, 4, 4, 4],
        filename: `E-Ticket_${pnr}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      if (element && typeof window !== 'undefined' && window.html2pdf) {
        await window.html2pdf().set(opt).from(element).save();
      } else {
        await downloadItrPdfFile(data, element);
      }
    } catch (err) {
      console.error('PDF direct download error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const primaryAirlineName = data.issuingAirlineName || 'US-BANGLA AIRLINES';
  const primarySlogan = data.airlineSlogan || 'FLY FAST FLY SAFE';
  const sloganColor = data.airlineSloganColor || '#E31B23';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto no-print"
      id="itr-receipt-modal"
    >
      <div className="bg-[#e2e8f0] rounded-lg shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden flex flex-col max-h-[96vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar with Quick Action Buttons */}
        <div className="bg-[#0b3b60] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/10 rounded">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>E-Ticket &amp; Booking Confirmation</span>
                <span className="text-[10px] font-semibold text-blue-100 uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded-xs">
                  {primaryAirlineName}
                </span>
              </div>
              <div className="text-[11px] text-blue-100 font-medium">
                PNR: {data.pnrLocator} &bull; Issue Date: {data.formattedIssueDate || data.issueDate}
              </div>
            </div>
          </div>

          {/* Action Buttons at Top of Modal */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-download-pdf-top"
              onClick={handleDirectPdfDownload}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-[#0b3b60] font-black text-xs sm:text-sm rounded shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
              title="Download clean A4 PDF file"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#0b3b60]" />
                  <span>📥 Download PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-print-ticket-top"
              onClick={handlePrintClick}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print ticket on clean A4 sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>🖨️ Print Ticket</span>
            </button>

            <button
              type="button"
              id="btn-close-itr-modal"
              onClick={onClose}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded transition-colors cursor-pointer"
              title="Close window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas (Single-Page A4 Printable Ticket Container) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#cbd5e1] text-[#1e293b]">
          <div
            ref={receiptCardRef}
            id="itr-printable-receipt"
            className="max-w-[840px] mx-auto bg-white rounded-md shadow-lg border border-slate-300 p-5 sm:p-8 space-y-4 select-text"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }}
          >
            {/* 1. HEADER & TOP BANNER (DYNAMIC AIRLINE BRANDING) */}
            <div className="border-b-2 border-[#0b3b60] pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                {data.airlineLogoUrl && !logoImgError ? (
                  <div className="h-12 max-w-[160px] flex items-center justify-center p-1 bg-white rounded border border-slate-100">
                    <img
                      src={data.airlineLogoUrl}
                      alt={primaryAirlineName}
                      className="max-h-10 max-w-[150px] object-contain"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={() => setLogoImgError(true)}
                    />
                  </div>
                ) : (
                  <div className="h-11 px-3 bg-[#0b3b60] text-white rounded flex items-center gap-2">
                    <Plane className="w-5 h-5 text-amber-300" />
                    <div className="font-black text-sm tracking-wider">{data.issuingAirline}</div>
                  </div>
                )}
                <div>
                  <div className="font-black text-xl sm:text-2xl text-[#0b3b60] tracking-tight leading-none uppercase">
                    {primaryAirlineName}
                  </div>
                  <div
                    className="text-[11px] sm:text-xs font-black tracking-widest uppercase mt-1"
                    style={{ color: sloganColor }}
                  >
                    {primarySlogan}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <h1 className="font-black text-sm sm:text-base text-[#0b3b60] tracking-wide uppercase">
                  E-TICKET / BOOKING CONFIRMATION
                </h1>
                <div className="text-xs text-slate-600 font-semibold mt-0.5">
                  Date: <strong className="text-slate-900">{data.formattedIssueDate || data.issueDate}</strong>
                </div>
              </div>
            </div>

            {/* 2. TOP SUMMARY METRICS BAR (3 TILES / BOXES) */}
            <div className="bg-[#f0f7ff] border border-[#bcd0e8] rounded-md p-3 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Tile 1: Booking Reference */}
              <div className="pt-2 md:pt-0">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  BOOKING REFERENCE (PNR)
                </div>
                <div className="font-black text-lg sm:text-xl text-[#0b3b60] flex items-center gap-2 mt-0.5 font-mono">
                  <span>{data.pnrLocator}</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded tracking-normal">
                    [ISSUED]
                  </span>
                </div>
              </div>

              {/* Tile 2: Route & Journey */}
              <div className="pt-2 md:pt-0 md:pl-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  ROUTE &amp; JOURNEY
                </div>
                <div className="font-bold text-sm sm:text-base text-slate-900 mt-0.5">
                  {data.routeJourney || 'Dhaka (DAC) ✈ Dubai (DXB)'}
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {data.journeySubtitle || 'One Way | 2 Adults'}
                </div>
              </div>

              {/* Tile 3: Total Booking Amount */}
              <div className="pt-2 md:pt-0 md:pl-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  BOOKING TOTAL AMOUNT
                </div>
                <div className="font-black text-xl sm:text-2xl text-[#0b3b60] mt-0.5">
                  ৳ {data.grandTotalFare.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 3. FLIGHT INFORMATION SECTION (DEEP BLUE HEADER BAR) */}
            <div>
              <div className="bg-[#0b3b60] text-white px-3.5 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <Plane className="w-3.5 h-3.5 text-amber-300" />
                <span>FLIGHT INFORMATION</span>
              </div>

              <div className="space-y-3 mt-0">
                {data.segments.map((seg, idx) => {
                  const isTransit = data.segments.length > 1;
                  const flightTypeLabel = isTransit
                    ? `Transit Leg ${idx + 1} of ${data.segments.length}`
                    : 'Direct Flight';

                  return (
                    <div
                      key={seg.segNum}
                      className="border border-slate-300 border-t-0 rounded-b overflow-hidden shadow-2xs bg-white"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 items-center">
                        {/* Origin Box (Left) */}
                        <div className="text-left">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Origin / Departure
                          </div>
                          <div className="font-bold text-sm text-slate-900 mt-0.5">
                            {seg.originName}
                          </div>
                          <div className="text-xs text-slate-600">
                            {seg.origin === 'DAC'
                              ? 'Hazrat Shahjalal Intl Airport'
                              : `${seg.originName} Airport`}
                            {seg.originTerminal ? `, Terminal ${seg.originTerminal}` : ''}
                          </div>
                          <div className="font-black text-xl sm:text-2xl text-[#0b3b60] mt-1.5 font-mono">
                            {formatGdsTime(seg.depTime)}
                          </div>
                          <div className="text-xs font-semibold text-slate-700 mt-0.5">
                            {formatGdsDatePretty(seg.date)}
                          </div>
                        </div>

                        {/* Middle Box (Center) */}
                        <div className="flex flex-col items-center justify-center text-center py-2 border-y sm:border-y-0 sm:border-x border-slate-200 sm:px-2">
                          <div className="px-3 py-1 bg-sky-50 border border-sky-200 text-sky-900 font-extrabold text-xs rounded">
                            Flight {seg.airline} {seg.flightNumber}
                          </div>
                          <div className="text-2xl text-[#0b3b60] my-1 font-black">➔</div>
                          <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                            {flightTypeLabel}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {seg.equip || 'Boeing 737-800'}
                          </div>
                        </div>

                        {/* Destination Box (Right) */}
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Destination / Arrival
                          </div>
                          <div className="font-bold text-sm text-slate-900 mt-0.5">
                            {seg.destName}
                          </div>
                          <div className="text-xs text-slate-600">
                            {seg.destName.includes('DXB') || seg.destName.includes('Dubai')
                              ? 'Dubai Intl Airport'
                              : `${seg.destName} Airport`}
                            {seg.destTerminal ? `, Terminal ${seg.destTerminal}` : ''}
                          </div>
                          <div className="font-black text-xl sm:text-2xl text-[#0b3b60] mt-1.5 font-mono">
                            {formatGdsTime(seg.arrTime)}
                          </div>
                          <div className="text-xs font-semibold text-slate-700 mt-0.5">
                            {formatGdsDatePretty(seg.date)}
                          </div>
                        </div>
                      </div>

                      {/* Segment Footer Strip */}
                      <div className="bg-[#f8fafc] border-t border-slate-200 px-4 py-2 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <strong>Operating Carrier:</strong> {primaryAirlineName}
                        </div>
                        <div>
                          <strong>Flight No:</strong> {seg.airline} {seg.flightNumber}
                        </div>
                        <div>
                          <strong>Class:</strong> {seg.bookingClass === 'J' ? 'Business' : 'Economy'} ({seg.bookingClass})
                        </div>
                        <div className="text-emerald-700 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                          <span>Booking Status: Confirmed &amp; Issued</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. PASSENGER & TICKET DETAILS TABLE */}
            <div>
              <div className="bg-[#0b3b60] text-white px-3.5 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider">
                PASSENGER &amp; TICKET DETAILS
              </div>

              <div className="border border-slate-300 border-t-0 rounded-b overflow-x-auto bg-white">
                <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">PASSENGER NAME</th>
                      <th className="py-2.5 px-3">TICKET NUMBER</th>
                      <th className="py-2.5 px-3">FARE</th>
                      <th className="py-2.5 px-3">TAXES</th>
                      <th className="py-2.5 px-3">TOTAL AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {data.passengers.map((p) => (
                      <tr key={p.passengerIndex} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          {p.passengerIndex}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                            {p.displayName || p.fullName}
                          </div>
                          {p.foid && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {p.foid}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#0b3b60] text-xs sm:text-[13px]">
                          {p.ticketNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-800">
                          ৳ {(p.fare || data.baseFare).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-slate-800">
                          ৳ {(p.taxes || data.tax).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#0b3b60]">
                          ৳ {(p.totalAmount || data.totalFare).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. BAGGAGE, FARE RULES & TOTAL BREAKDOWN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* Left Box: Baggage & Fare Rules */}
              <div className="bg-[#f8fafc] border border-slate-300 rounded p-3.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider text-[#0b3b60] mb-2 border-b border-slate-200 pb-1">
                    Baggage &amp; Fare Rules
                  </div>
                  <div className="space-y-1.5 text-slate-700 leading-relaxed">
                    <div>
                      <strong>• Hand Baggage:</strong> Up to 7 kg allowance per passenger.
                    </div>
                    <div>
                      <strong>• Check-in Baggage:</strong> Standard allowance as per airline ticket fare rule (e.g. 2PC / 30KG).
                    </div>
                    <div>
                      <strong>• Identification:</strong> Passport valid for at least 6 months is required.
                    </div>
                    <div>
                      <strong>• Changes &amp; Refunds:</strong> Permitted subject to airline fare conditions and applicable penalties.
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10.5px] text-slate-500 font-mono pt-1.5 border-t border-slate-200">
                  REFUND POLICY: NON-REFUNDABLE / DATE CHANGE PENALTY APPLIES
                </div>
              </div>

              {/* Right Box: Fare Summary */}
              <div className="bg-white border border-slate-300 rounded p-3.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider text-[#0b3b60] mb-2 border-b border-slate-200 pb-1">
                    Fare Summary
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between items-center">
                      <span>Base Fare ({data.passengers.length} Passenger{data.passengers.length > 1 ? 's' : ''}):</span>
                      <span className="font-bold text-slate-900">
                        ৳ {(data.baseFare * data.passengers.length).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Taxes:</span>
                      <span className="font-bold text-slate-900">
                        ৳ {(data.tax * data.passengers.length).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-[#0b3b60] pt-2.5 mt-3 flex justify-between items-center">
                  <span className="font-black text-sm text-[#0b3b60]">Grand Total:</span>
                  <span className="font-black text-xl sm:text-2xl text-[#0b3b60]">
                    ৳ {data.grandTotalFare.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. IMPORTANT TRAVEL INSTRUCTIONS (YELLOW/CREAM CALLOUT BOX) */}
            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-md p-3.5 text-xs text-[#78350f]">
              <div className="font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 mb-1.5 text-[#92400e]">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Important Travel Instructions</span>
              </div>
              <ul className="space-y-1 pl-1 list-none leading-relaxed">
                <li>• Please reach the airport at least 3 hours prior to international departure (or 1.5 hours for domestic).</li>
                <li>• Carry a printed or digital copy of this E-ticket along with your original passport and visa.</li>
                <li>• Boarding gate closes 20 minutes before departure time.</li>
              </ul>
            </div>

            {/* Document Verification Notice */}
            <div className="text-[10.5px] text-slate-400 text-center border-t border-slate-200 pt-2.5">
              This is a computer-generated official airline electronic booking confirmation and does not require a physical signature &bull; Issued via Amadeus GDS Certified Interface
            </div>
          </div>

          {/* Quick Email Dispatch Form */}
          <div className="max-w-[840px] mx-auto mt-4 bg-white p-3 rounded-md border border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs no-print">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0b3b60]" />
              <span className="font-semibold text-slate-800">
                Email E-Ticket Confirmation:
              </span>
            </div>
            <form onSubmit={handleEmailSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="customer@email.com"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0b3b60] focus:bg-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#0b3b60] hover:bg-[#082a45] text-white font-bold rounded text-xs transition-colors cursor-pointer shrink-0"
              >
                Send E-Ticket
              </button>
            </form>
            {emailSentSuccess && (
              <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Sent Successfully!
              </span>
            )}
          </div>
        </div>

        {/* Modal Bottom Control Strip */}
        <div className="bg-white px-5 py-3 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 shrink-0 no-print">
          <div className="text-[11px] text-slate-500 font-medium">
            Official E-Ticket Format &bull; IATA Resolution 722g Compliant
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadItrTextFile(data)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Text</span>
            </button>
            <button
              type="button"
              onClick={handlePrintClick}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#0b3b60]" />
              <span>🖨️ Print Ticket</span>
            </button>
            <button
              type="button"
              onClick={handleDirectPdfDownload}
              disabled={isGeneratingPdf}
              className="px-4 py-1.5 bg-[#0b3b60] hover:bg-[#082a45] text-white font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-75"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>📥 Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
