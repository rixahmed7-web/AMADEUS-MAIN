import React, { useState, useRef } from 'react';
import { ItrReceiptData } from '../types';
import { printItrDocument, downloadItrTextFile, downloadItrPdfFile } from '../utils/itrReceipt';
import { Printer, Download, Mail, X, Check, FileText, Luggage, Users, Plane, Loader2 } from 'lucide-react';

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
  const receiptCardRef = useRef<HTMLDivElement>(null);

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

  const handleDirectPdfDownload = async () => {
    try {
      setIsGeneratingPdf(true);
      await downloadItrPdfFile(data, receiptCardRef.current);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto"
      id="itr-receipt-modal"
    >
      <div className="bg-[#e2e8f0] rounded-lg shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Non-printed modal toolbar) */}
        <div className="bg-[#005eb8] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-sm">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>amadeus</span>
                <span className="text-[10px] sm:text-xs font-semibold text-blue-100 uppercase tracking-wider bg-[#00478c] px-2 py-0.5 rounded-xs">
                  Selling Platform Connect
                </span>
              </div>
              <div className="text-[11px] text-blue-100 font-medium">
                Official Electronic Passenger Itinerary &amp; Receipt (ITR) &bull; 1A/{data.pnrLocator}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => printItrDocument(data)}
              className="px-3 py-1.5 bg-white hover:bg-blue-50 text-[#005eb8] font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save as PDF via Print Dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              onClick={handleDirectPdfDownload}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-75"
              title="Download PDF directly without print dialog"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-colors cursor-pointer ml-1"
              title="Close document"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Body (Styled as a standard professional A4 GDS document sheet) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#cbd5e1] text-[#1e293b]">
          <div
            ref={receiptCardRef}
            id="itr-printable-receipt"
            className="max-w-[850px] mx-auto bg-white rounded-md shadow-lg border border-slate-300 p-6 sm:p-9 space-y-5 select-text"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }}
          >
            {/* 1. Official Header & Airline Branding */}
            <div className="border-b-2 border-[#005eb8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {data.airlineLogoUrl && (
                  <div className="h-12 max-w-[190px] flex items-center justify-center p-1 bg-white rounded">
                    <img
                      src={data.airlineLogoUrl}
                      alt={data.issuingAirlineName}
                      className="max-h-11 max-w-[180px] object-contain"
                      onError={(e) => {
                        // Fallback to text badge if logo fails
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div>
                  <div className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                    {data.issuingAirlineName}
                  </div>
                  <div className="text-xs text-slate-600 font-semibold flex items-center gap-2 mt-0.5">
                    <span>CARRIER: <strong className="text-slate-900">{data.issuingAirline}</strong></span>
                    <span>&bull;</span>
                    <span>IATA NUMERIC: <strong className="font-mono text-slate-900">{data.issuingAirlineNumeric}</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <div className="text-lg font-black text-[#005eb8] tracking-tight">
                  amadeus
                </div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Selling Platform Connect &bull; Electronic Ticket Receipt
                </div>
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  ELECTRONIC TICKET CONFIRMED
                </div>
              </div>
            </div>

            {/* 2. Document Audit & Booking Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f8fafc] border border-slate-200 rounded p-3 sm:p-4 text-xs">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Amadeus Booking Ref (RLOC)
                </div>
                <div className="font-mono font-bold text-sm text-[#005eb8] mt-0.5">
                  1A / {data.pnrLocator}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Airline Record Locator
                </div>
                <div className="font-mono font-bold text-sm text-slate-800 mt-0.5">
                  {data.airlineLocator}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Date of Issue
                </div>
                <div className="font-bold text-xs text-slate-800 mt-0.5">
                  {data.issueDate}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Issuing Agency
                </div>
                <div className="font-bold text-xs text-slate-800 mt-0.5">
                  {data.issuingAgent}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  IATA Accreditation No.
                </div>
                <div className="font-mono font-bold text-xs text-slate-800 mt-0.5">
                  {data.iataNumber}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Office ID / Sine
                </div>
                <div className="font-mono font-bold text-xs text-slate-800 mt-0.5">
                  {data.officeId} / 9912AA/SU
                </div>
              </div>
            </div>

            {/* 3. Dynamic Multi-Passenger Roster & 13-Digit E-Ticket Numbers */}
            <div>
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800">
                  <Users className="w-3.5 h-3.5 text-[#005eb8]" />
                  <span>1. Passenger Details &amp; E-Ticket Number(s)</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Total Passengers: <strong>{data.passengers.length} PAX</strong>
                </span>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="py-2 px-3 w-10">No.</th>
                      <th className="py-2 px-3">Passenger Name</th>
                      <th className="py-2 px-3 w-20">Type</th>
                      <th className="py-2 px-3">13-Digit E-Ticket Number</th>
                      <th className="py-2 px-3 text-right">Coupon Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.passengers.map((p) => (
                      <tr key={p.passengerIndex} className="hover:bg-blue-50/50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-[#005eb8]">{p.passengerIndex}.</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 text-[13px]">{p.fullName}</div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-600">{p.paxType}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-xs text-[#005eb8]">
                          {p.ticketNumber}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                            OPEN FOR USE / CONFIRMED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Flight Itinerary Schedule Table */}
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 mb-1.5 pb-1 border-b border-slate-200">
                <Plane className="w-3.5 h-3.5 text-[#005eb8]" />
                <span>2. Flight Itinerary Schedule</span>
              </div>

              <div className="border border-slate-200 rounded overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="py-2 px-3 w-10">Seg</th>
                      <th className="py-2 px-3">Flight</th>
                      <th className="py-2 px-3 w-12">Cls</th>
                      <th className="py-2 px-3 w-16">Date</th>
                      <th className="py-2 px-3">Departure</th>
                      <th className="py-2 px-3">Arrival</th>
                      <th className="py-2 px-3 w-20">Status</th>
                      <th className="py-2 px-3 w-20">Baggage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.segments.map((s) => (
                      <tr key={s.segNum} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-[#005eb8]">{s.segNum}</td>
                        <td className="py-2.5 px-3 font-bold font-mono text-slate-900">
                          {s.airline} {s.flightNumber}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold">{s.bookingClass}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{s.date}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{s.originName}</div>
                          <div className="text-[11px] text-slate-600 font-mono">
                            Dept: <strong className="text-slate-900">{s.depTime}</strong> {s.originTerminal ? `(Term ${s.originTerminal})` : ''}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{s.destName}</div>
                          <div className="text-[11px] text-slate-600 font-mono">
                            Arrv: <strong className="text-slate-900">{s.arrTime}</strong> {s.destTerminal ? `(Term ${s.destTerminal})` : ''}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">{s.status}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{s.baggage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Explicit Detailed Baggage Allowance Section */}
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 mb-1.5 pb-1 border-b border-slate-200">
                <Luggage className="w-3.5 h-3.5 text-[#005eb8]" />
                <span>3. Baggage Allowance &amp; Regulations</span>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="py-2 px-3">Passenger</th>
                      <th className="py-2 px-3">Flight &amp; Route</th>
                      <th className="py-2 px-3">Checked Baggage</th>
                      <th className="py-2 px-3">Cabin / Carry-On Baggage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.baggageAllowances.map((b, bIdx) => (
                      <tr key={bIdx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {b.paxName} <span className="text-[10px] text-slate-500 font-normal">({b.paxType})</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-mono font-bold text-[#005eb8] mr-1.5">{b.flight}</span>
                          <span className="font-semibold text-slate-700">{b.route}</span>
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-800">{b.checkedBag}</td>
                        <td className="py-2 px-3 text-slate-600">{b.cabinBag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 pl-1">
                * Maximum dimensions per checked bag: 158 cm (62 in) linear. Excess baggage fees apply if weight or piece allowances are exceeded.
              </div>
            </div>

            {/* 6. Pricing, Multi-Passenger Calculation & Payment Details */}
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-1.5 pb-1 border-b border-slate-200">
                4. Fare Calculation, Taxes &amp; Financial Summary
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#f8fafc] border border-slate-200 rounded p-3.5 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    GDS Linear Fare Calculation
                  </div>
                  <div className="font-mono text-[11px] text-slate-800 bg-white p-2.5 rounded border border-slate-200 break-all leading-relaxed shadow-2xs">
                    {data.fareCalculation}
                  </div>
                  <div className="mt-2 text-slate-700 text-[11px] space-y-1">
                    <div><strong>Endorsements:</strong> {data.endorsements}</div>
                    <div><strong>Form of Payment:</strong> <span className="font-mono">{data.formOfPayment}</span></div>
                    <div><strong>Commission:</strong> {data.commission || '7%'}</div>
                  </div>
                </div>

                <div className="flex flex-col justify-between space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Air Fare (Per Adult):</span>
                      <span className="font-semibold font-mono">
                        {data.currency} {data.baseFare.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Taxes &amp; Airline Surcharges:</span>
                      <span className="font-semibold font-mono">
                        {data.currency} {data.tax.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                      <span>Per Passenger Total:</span>
                      <span className="font-bold font-mono">
                        {data.currency} {data.totalFare.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Booked Passengers:</span>
                      <span className="font-bold text-slate-900">{data.passengers.length} PAX</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-slate-300 pt-2 flex justify-between items-center text-sm font-bold text-[#005eb8]">
                    <span>Grand Total PNR Fare:</span>
                    <span className="text-lg font-black font-mono">
                      {data.currency} {data.grandTotalFare.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Conditions of Carriage & Regulatory Notice */}
            <div className="text-[10.5px] text-slate-500 leading-relaxed border-t border-slate-200 pt-3">
              <strong>LEGAL NOTICE &amp; CONDITIONS OF CARRIAGE:</strong> Carriage and other services provided by the carrier are subject to conditions of carriage, which are hereby incorporated by reference. Passengers on a journey involving an ultimate destination or a stop in a country other than the country of origin are advised that international treaties known as the Montreal Convention, or its predecessor, the Warsaw Convention, may apply to the entire journey. Please check in at least 3 hours prior to scheduled international departure. Valid passport and visas required.
              <div className="mt-2 text-slate-700 font-semibold flex flex-wrap justify-between items-center text-[10.5px]">
                <span>Amadeus Selling Platform Connect &bull; GDS Certified Travel Document</span>
                <span className="font-mono text-slate-500">DISPATCH REF: 1A/{data.pnrLocator}/{data.issueDate}</span>
              </div>
            </div>
          </div>

          {/* Quick Email Dispatch Form (Bottom tool) */}
          <div className="max-w-[850px] mx-auto mt-4 bg-white p-3 rounded-md border border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
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
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#005eb8] focus:bg-white"
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

        {/* Modal Footer Controls */}
        <div className="bg-white px-5 py-3 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            Compliant with IATA Resolution 722g &bull; Amadeus Certified E-Ticket Receipt
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
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDirectPdfDownload}
              disabled={isGeneratingPdf}
              className="px-4 py-1.5 bg-[#005eb8] hover:bg-[#00478c] text-white font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-75"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>📥 Download Itinerary Receipt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
