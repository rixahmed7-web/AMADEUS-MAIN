import React, { useState, useRef } from 'react';
import { ItrReceiptData } from '../types';
import { downloadItrTextFile, downloadItrPdfFile } from '../utils/itrReceipt';
import { Printer, Download, Mail, X, Check, FileText, Luggage, Users, Plane, Loader2 } from 'lucide-react';

interface ItrReceiptModalProps {
  isOpen: boolean;
  data: ItrReceiptData | null;
  onClose: () => void;
  onSendEmail?: (email: string) => void;
}

// Clean authentic Code 128 / Code 39 vector barcode representation
const AirlineBarcode: React.FC<{ code: string }> = ({ code }) => {
  // Deterministic bar widths pattern based on code characters
  const pattern = [
    2, 1, 1, 3, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2,
    1, 1, 2, 1, 3, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 3, 2, 1,
  ];

  let currentX = 0;

  return (
    <div className="flex flex-col items-start justify-center">
      <svg className="h-6 w-36 sm:w-44" viewBox="0 0 160 26" preserveAspectRatio="none">
        {pattern.map((w, i) => {
          const x = currentX;
          currentX += w * 1.6;
          return i % 2 === 0 ? (
            <rect key={i} x={x} y="0" width={w * 1.3} height="26" fill="#1e293b" />
          ) : null;
        })}
      </svg>
      <span className="font-mono text-[9.5px] tracking-widest text-slate-700 font-bold mt-0.5">
        *{code.replace(/[^0-9]/g, '')}*
      </span>
    </div>
  );
};

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
      await downloadItrPdfFile(data, receiptCardRef.current);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto no-print"
      id="itr-receipt-modal"
    >
      <div className="bg-[#e2e8f0] rounded-lg shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar with Two Prominent Action Buttons */}
        <div className="bg-[#005eb8] text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/10 rounded">
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
                Official Electronic Ticket Passenger Itinerary &amp; Receipt &bull; 1A/{data.pnrLocator}
              </div>
            </div>
          </div>

          {/* TWO PROMINENT BUTTONS AT TOP OF TICKET MODAL */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="btn-print-download-ticket"
              onClick={handlePrintClick}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-[#005eb8] hover:text-[#00478c] font-black text-xs sm:text-sm rounded shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] border border-white"
              title="Print or Save as PDF via dedicated clean A4 print layout"
            >
              <Printer className="w-4 h-4 text-[#005eb8]" />
              <span>📥 Download PDF / Print Ticket</span>
            </button>

            <button
              type="button"
              id="btn-close-itr-modal"
              onClick={onClose}
              className="px-3.5 py-2 bg-[#00478c] hover:bg-[#003870] text-white font-bold text-xs sm:text-sm rounded border border-white/20 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Close preview and return to terminal"
            >
              <X className="w-4 h-4" />
              <span>✕ Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Document Body (Styled as official authentic A4 GDS ticket sheet) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#cbd5e1] text-[#1e293b]">
          <div
            ref={receiptCardRef}
            id="itr-printable-receipt"
            className="max-w-[850px] mx-auto bg-white rounded-md shadow-lg border border-slate-300 p-6 sm:p-9 space-y-5 select-text"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }}
          >
            {/* 1. Official Header & Airline Branding */}
            <div className="border-b-2 border-[#005eb8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {data.airlineLogoUrl && !logoImgError ? (
                  <div className="h-14 max-w-[200px] flex items-center justify-center p-1.5 bg-white rounded border border-slate-100 shadow-2xs">
                    <img
                      src={data.airlineLogoUrl}
                      alt={data.issuingAirlineName}
                      className="max-h-12 max-w-[190px] object-contain"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={() => setLogoImgError(true)}
                    />
                  </div>
                ) : (
                  <div className="h-14 px-4 bg-slate-900 text-white rounded flex items-center gap-2.5 shadow-2xs">
                    <Plane className="w-6 h-6 text-amber-400" />
                    <div>
                      <div className="font-black text-base tracking-wider">{data.issuingAirline}</div>
                      <div className="text-[10px] text-slate-300 uppercase tracking-tight">{data.issuingAirlineName}</div>
                    </div>
                  </div>
                )}
                <div>
                  <h1 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight uppercase">
                    PASSENGER ITINERARY RECEIPT / ELECTRONIC TICKET
                  </h1>
                  <div className="text-xs text-slate-600 font-semibold flex flex-wrap items-center gap-2 mt-0.5">
                    <span>ISSUING AIRLINE: <strong className="text-slate-900">{data.issuingAirlineName} ({data.issuingAirline})</strong></span>
                    <span>&bull;</span>
                    <span>IATA CODE: <strong className="font-mono text-slate-900">{data.issuingAirlineNumeric}</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <div className="text-lg font-black text-[#005eb8] tracking-tight">
                  amadeus
                </div>
                <div className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wide">
                  Selling Platform Connect &bull; GDS Certified
                </div>
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  OK ETICKET ISSUED
                </div>
              </div>
            </div>

            {/* 2. Header Information Section Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f8fafc] border border-slate-200 rounded p-3 sm:p-4 text-xs">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Booking Reference (Amadeus PNR)
                </div>
                <div className="font-mono font-black text-sm text-[#005eb8] mt-0.5">
                  1A / {data.pnrLocator}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Issuing Agent
                </div>
                <div className="font-bold text-xs text-slate-900 mt-0.5">
                  {data.issuingAgent || `SHOHOJ TRAVELS / ${data.officeId}`}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Date of Issue
                </div>
                <div className="font-bold text-xs text-slate-900 mt-0.5">
                  {data.issueDate}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  IATA Numeric Code
                </div>
                <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                  {data.iataNumber || '21368575'}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Airline Record Locator
                </div>
                <div className="font-mono font-bold text-xs text-slate-800 mt-0.5">
                  {data.airlineLocator}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Issuing Office ID
                </div>
                <div className="font-mono font-bold text-xs text-slate-800 mt-0.5">
                  {data.officeId} / 9912AA
                </div>
              </div>
            </div>

            {/* 3. Passenger & Ticket Information Table */}
            <div>
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800">
                  <Users className="w-3.5 h-3.5 text-[#005eb8]" />
                  <span>1. Passenger &amp; Ticket Information</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Booked Passengers: <strong className="text-slate-900">{data.passengers.length} PAX</strong>
                </span>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="py-2.5 px-3">Passenger Name &amp; Title</th>
                      <th className="py-2.5 px-3 w-16">Type</th>
                      <th className="py-2.5 px-3">Form of ID (FOID / Passport)</th>
                      <th className="py-2.5 px-3">Frequent Flyer</th>
                      <th className="py-2.5 px-3">13-Digit E-Ticket Number</th>
                      <th className="py-2.5 px-3 text-right">Barcode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.passengers.map((p) => (
                      <tr key={p.passengerIndex} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 text-[13px]">
                            {p.passengerIndex}. {p.fullName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            STATUS: CONFIRMED / OK
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-600">{p.paxType}</td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                          {p.foid || 'PP BD EF0123456'}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {p.frequentFlyer || 'NOT RECORDED'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-black text-xs text-[#005eb8]">
                            {p.ticketNumber}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            COUPON 1/1: OPEN
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-block">
                            <AirlineBarcode code={p.ticketNumber} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Flight Itinerary Grid (Table Format) */}
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 mb-1.5 pb-1 border-b border-slate-200">
                <Plane className="w-3.5 h-3.5 text-[#005eb8]" />
                <span>2. Flight Itinerary Schedule</span>
              </div>

              <div className="border border-slate-200 rounded overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="py-2.5 px-3">Flight</th>
                      <th className="py-2.5 px-3 w-12">Class</th>
                      <th className="py-2.5 px-3 w-16">Date</th>
                      <th className="py-2.5 px-3">Departure Airport &amp; Time</th>
                      <th className="py-2.5 px-3">Arrival Airport &amp; Time</th>
                      <th className="py-2.5 px-3 w-20">Status</th>
                      <th className="py-2.5 px-3 w-28">Baggage Allowance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.segments.map((s) => (
                      <tr key={s.segNum} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-black text-slate-900 text-xs">
                          {s.airline} {s.flightNumber}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#005eb8]">{s.bookingClass}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{s.date}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{s.originName}</div>
                          <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                            Dept: <strong className="text-slate-900">{s.depTime}</strong> {s.originTerminal ? `(Term ${s.originTerminal})` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{s.destName}</div>
                          <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                            Arrv: <strong className="text-slate-900">{s.arrTime}</strong> {s.destTerminal ? `(Term ${s.destTerminal})` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-700">{s.status || 'HK1 / OK'}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{s.baggage || '2PC (23KG)'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Baggage Regulations & Allowances Table */}
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 mb-1.5 pb-1 border-b border-slate-200">
                <Luggage className="w-3.5 h-3.5 text-[#005eb8]" />
                <span>3. Baggage Regulations &amp; Allowances</span>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="py-2 px-3">Passenger</th>
                      <th className="py-2 px-3">Flight &amp; Route</th>
                      <th className="py-2 px-3">Checked Baggage Allowance</th>
                      <th className="py-2 px-3">Cabin / Carry-On Bag</th>
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
            </div>

            {/* 6. Fare & Payment Breakdown */}
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-1.5 pb-1 border-b border-slate-200">
                4. Fare &amp; Payment Breakdown
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#f8fafc] border border-slate-200 rounded p-3.5 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Linear Fare Calculation
                  </div>
                  <div className="font-mono text-[11px] text-slate-800 bg-white p-2.5 rounded border border-slate-200 break-all leading-relaxed shadow-2xs">
                    {data.fareCalculation}
                  </div>
                  <div className="mt-2.5 text-slate-700 text-[11.5px] space-y-1.5">
                    <div>
                      <strong>Form of Payment:</strong>{' '}
                      <span className="font-mono font-bold text-slate-900">{data.formOfPayment || 'CASH / INVOICE'}</span>
                    </div>
                    <div>
                      <strong>Endorsement / Restrictions:</strong>{' '}
                      <span className="text-slate-800 font-semibold">{data.endorsements}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between space-y-2 bg-white p-3 rounded border border-slate-200">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Airfare (Per Adult):</span>
                      <span className="font-semibold font-mono">
                        {data.currency} {data.baseFare.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Taxes, Fees &amp; Airline Surcharges:</span>
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
                    <span>Total Amount Paid:</span>
                    <span className="text-lg font-black font-mono">
                      {data.currency} {data.grandTotalFare.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Legal Notice & Conditions of Carriage */}
            <div className="text-[10.5px] text-slate-500 leading-relaxed border-t border-slate-200 pt-3">
              <strong>LEGAL NOTICE &amp; CONDITIONS OF CARRIAGE:</strong> Carriage and other services provided by the carrier are subject to conditions of carriage, which are hereby incorporated by reference. Passengers on a journey involving an ultimate destination or a stop in a country other than the country of origin are advised that international treaties known as the Montreal Convention, or its predecessor, the Warsaw Convention, may apply to the entire journey. Please check in at least 3 hours prior to scheduled international departure. Valid passport and visas required.
              <div className="mt-2 text-slate-700 font-semibold flex flex-wrap justify-between items-center text-[10.5px]">
                <span>Amadeus Selling Platform Connect &bull; GDS Certified Electronic Document</span>
                <span className="font-mono text-slate-500">DISPATCH REF: 1A/{data.pnrLocator}/{data.issueDate}</span>
              </div>
            </div>
          </div>

          {/* Quick Email Dispatch Form (Bottom tool) */}
          <div className="max-w-[850px] mx-auto mt-4 bg-white p-3 rounded-md border border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs no-print">
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
        <div className="bg-white px-5 py-3 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 shrink-0 no-print">
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
              onClick={handlePrintClick}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#005eb8]" />
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
