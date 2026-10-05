import React, { useState, useEffect, useRef } from 'react';
import { ItrReceiptData } from '../types';
import {
  formatGdsTime,
  formatGdsDatePretty,
  downloadItrPdfFile,
  downloadItrHtmlFile,
  downloadItrTextFile,
  buildItrReceiptData,
} from '../utils/itrReceipt';
import { createInitialSession, ticketSalesDatabase } from '../utils/gdsEngine';
import {
  Printer,
  Download,
  ArrowLeft,
  FileText,
  Plane,
  AlertTriangle,
  Loader2,
  Check,
  RefreshCw,
} from 'lucide-react';

interface StandaloneTicketViewProps {
  initialData?: ItrReceiptData | null;
  onBack?: () => void;
}

export const StandaloneTicketView: React.FC<StandaloneTicketViewProps> = ({
  initialData,
  onBack,
}) => {
  const [data, setData] = useState<ItrReceiptData | null>(() => {
    if (initialData) return initialData;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('amadeus_active_ticket');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse stored ticket data:', e);
      }
    }
    return buildItrReceiptData(createInitialSession(), ticketSalesDatabase);
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [logoImgError, setLogoImgError] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!data) return;
    setIsGeneratingPdf(true);
    try {
      const res = await downloadItrPdfFile(data, ticketRef.current);
      setDownloadSuccess('PDF ফাইল ডাউনলোড সম্পন্ন হয়েছে');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error('PDF download error:', e);
      downloadItrTextFile(data);
      setDownloadSuccess('টেক্সট ফরম্যাটে ডাউনলোড করা হয়েছে');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    if (!data) return;
    downloadItrHtmlFile(data);
    setDownloadSuccess('HTML টিকিট ফাইল ডাউনলোড সম্পন্ন হয়েছে');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadTxt = () => {
    if (!data) return;
    downloadItrTextFile(data);
    setDownloadSuccess('টেক্সট রসিদ ডাউনলোড সম্পন্ন হয়েছে');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleReturnToTerminal = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('ticket');
      url.searchParams.delete('pnr');
      window.location.href = url.pathname || '/';
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-white text-slate-800 rounded-lg p-6 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-lg text-slate-900">
            টিকিট ডেটা পাওয়া যায়নি (No Ticket Loaded)
          </h2>
          <p className="text-sm text-slate-600">
            বর্তমানে কোনো সক্রিয় টিকিট রেকর্ড পাওয়া যায়নি। টার্মিনালে বুকিং নিশ্চিত করার পর TTP কমান্ড দিয়ে টিকিট ইস্যু করুন।
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                const sample = buildItrReceiptData(createInitialSession(), ticketSalesDatabase);
                setData(sample);
              }}
              className="px-4 py-2 bg-[#005eb8] hover:bg-[#00478c] text-white font-bold text-sm rounded shadow cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>নমুনা টিকিট লোড করুন (Load Sample)</span>
            </button>
            <button
              type="button"
              onClick={handleReturnToTerminal}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm rounded cursor-pointer"
            >
              টার্মিনালে ফিরে যান (Back to Terminal)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const primaryAirlineName = data.issuingAirlineName || 'US-BANGLA AIRLINES';
  const primarySlogan = data.airlineSlogan || 'FLY FAST FLY SAFE';
  const sloganColor = data.airlineSloganColor || '#E31B23';
  const passengers = data.passengers || [];
  const segments = data.segments || [];
  const grandTotal = Number(data.grandTotalFare ?? data.totalFare ?? 0);
  const baseFare = Number(data.baseFare ?? 0);
  const taxFare = Number(data.tax ?? 0);

  return (
    <div className="min-h-screen bg-[#cbd5e1] text-[#1e293b] flex flex-col font-sans select-text" id="standalone-ticket-view">
      {/* Top Floating Action Bar (Hidden during printing) */}
      <header className="sticky top-0 z-40 bg-[#0b3b60] text-white shadow-md px-4 py-3 border-b border-blue-900 no-print">
        <div className="max-w-[880px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReturnToTerminal}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Return to Amadeus Terminal Simulator"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>টার্মিনালে ফিরে যান</span>
            </button>
            <div className="text-xs sm:text-sm font-bold tracking-tight">
              <span>ই-টিকিট রসিদ &bull; </span>
              <span className="text-amber-300 font-mono font-bold">PNR: {data.pnrLocator}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print on Clean A4 Sheet"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট (Print)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-[#0b3b60] font-black text-xs sm:text-sm rounded shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-75"
              title="Download A4 PDF File"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PDF তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#0b3b60]" />
                  <span>PDF ডাউনলোড</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded transition-colors cursor-pointer"
              title="Download Standalone HTML file"
            >
              HTML
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded transition-colors cursor-pointer"
              title="Download Plain Text Format"
            >
              TXT
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="max-w-[880px] mx-auto mt-2 bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </header>

      {/* Main Printable Ticket Card */}
      <main className="flex-1 p-3 sm:p-6 md:p-8">
        <div
          ref={ticketRef}
          id="ticketPrintArea"
          className="ticket-card-content max-w-[840px] mx-auto bg-white rounded-md shadow-lg border border-slate-300 p-5 sm:p-8 space-y-4"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }}
        >
          {/* 1. Header & Airline Branding */}
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
                  <div className="font-black text-sm tracking-wider">{data.issuingAirline || 'AIRLINE'}</div>
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
                Date: <strong className="text-slate-900">{data.formattedIssueDate || data.issueDate || 'Today'}</strong>
              </div>
            </div>
          </div>

          {/* 2. Top Summary Metrics */}
          <div className="bg-[#f0f7ff] border border-[#bcd0e8] rounded-md p-3 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                BOOKING REFERENCE (PNR)
              </div>
              <div className="font-black text-lg sm:text-xl text-[#0b3b60] flex items-center gap-2 mt-0.5 font-mono">
                <span>{data.pnrLocator || 'XFV45T'}</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                  [ISSUED]
                </span>
              </div>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                ROUTE &amp; JOURNEY
              </div>
              <div className="font-bold text-sm sm:text-base text-slate-900 mt-0.5">
                {data.routeJourney || 'Dhaka (DAC) ✈ Destination'}
              </div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                {data.journeySubtitle || `${passengers.length} Passenger${passengers.length > 1 ? 's' : ''}`}
              </div>
            </div>

            <div className="pt-2 md:pt-0 md:pl-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                BOOKING TOTAL AMOUNT
              </div>
              <div className="font-black text-xl sm:text-2xl text-[#0b3b60] mt-0.5">
                ৳ {grandTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 3. Flight Segments */}
          <div>
            <div className="bg-[#0b3b60] text-white px-3.5 py-1.5 rounded-t font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Plane className="w-3.5 h-3.5 text-amber-300" />
              <span>FLIGHT INFORMATION</span>
            </div>

            <div className="space-y-3 mt-0">
              {segments.map((seg, idx) => {
                const isTransit = segments.length > 1;
                const flightTypeLabel = isTransit
                  ? `Leg ${idx + 1} of ${segments.length}`
                  : 'Direct Flight';
                const origCityName = seg.originName || seg.origin || 'Departure';
                const destCityName = seg.destName || seg.destination || 'Arrival';

                return (
                  <div
                    key={seg.segNum || idx}
                    className="border border-slate-300 border-t-0 rounded-b overflow-hidden shadow-2xs bg-white"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 items-center">
                      <div className="text-left">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Origin / Departure
                        </div>
                        <div className="font-bold text-sm text-slate-900 mt-0.5">{origCityName}</div>
                        <div className="text-xs text-slate-600">
                          {seg.origin === 'DAC' ? 'Hazrat Shahjalal Intl Airport' : `${origCityName} Airport`}
                          {seg.originTerminal ? `, Terminal ${seg.originTerminal}` : ''}
                        </div>
                        <div className="font-black text-xl sm:text-2xl text-[#0b3b60] mt-1.5 font-mono">
                          {formatGdsTime(seg.depTime || '0830')}
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">
                          {formatGdsDatePretty(seg.date || '30SEP')}
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center text-center py-2 border-y sm:border-y-0 sm:border-x border-slate-200 sm:px-2">
                        <div className="px-3 py-1 bg-sky-50 border border-sky-200 text-sky-900 font-extrabold text-xs rounded">
                          Flight {seg.airline} {seg.flightNumber}
                        </div>
                        <div className="text-2xl text-[#0b3b60] my-1 font-black">➔</div>
                        <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                          {flightTypeLabel}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">{seg.equip || 'Boeing 737-800'}</div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Destination / Arrival
                        </div>
                        <div className="font-bold text-sm text-slate-900 mt-0.5">{destCityName}</div>
                        <div className="text-xs text-slate-600">
                          {destCityName && (destCityName.includes('DXB') || destCityName.includes('Dubai'))
                            ? 'Dubai Intl Airport'
                            : `${destCityName} Airport`}
                          {seg.destTerminal ? `, Terminal ${seg.destTerminal}` : ''}
                        </div>
                        <div className="font-black text-xl sm:text-2xl text-[#0b3b60] mt-1.5 font-mono">
                          {formatGdsTime(seg.arrTime || '1230')}
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">
                          {formatGdsDatePretty(seg.date || '30SEP')}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f8fafc] border-t border-slate-200 px-4 py-2 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <strong>Operating Carrier:</strong> {seg.airlineName || primaryAirlineName}
                      </div>
                      <div>
                        <strong>Flight No:</strong> {seg.airline} {seg.flightNumber}
                      </div>
                      <div>
                        <strong>Class:</strong> {seg.bookingClass === 'J' ? 'Business' : 'Economy'} ({seg.bookingClass || 'Y'})
                      </div>
                      <div className="text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                        <span>Status: Confirmed &amp; Issued</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Passenger Details Table */}
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
                  {passengers.map((p, pIdx) => {
                    const pFare = Number(p.fare ?? baseFare ?? 0);
                    const pTax = Number(p.taxes ?? taxFare ?? 0);
                    const pTotal = Number(p.totalAmount ?? (pFare + pTax));

                    return (
                      <tr key={p.passengerIndex || pIdx} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          {p.passengerIndex || pIdx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                            {p.displayName || p.fullName || 'PASSENGER'}
                          </div>
                          {p.foid && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.foid}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#0b3b60] text-xs sm:text-[13px]">
                          {p.ticketNumber || 'TKT ISSUED'}
                        </td>
                        <td className="py-3 px-3 text-slate-800">৳ {pFare.toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-800">৳ {pTax.toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold text-[#0b3b60]">৳ {pTotal.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Baggage & Fare Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
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
                    <strong>• Check-in Baggage:</strong> Standard airline allowance (2PC / 23KG or 30KG).
                  </div>
                  <div>
                    <strong>• Identification:</strong> Passport valid for at least 6 months is required.
                  </div>
                  <div>
                    <strong>• Changes &amp; Refunds:</strong> Permitted subject to airline fare conditions.
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[10.5px] text-slate-500 font-mono pt-1.5 border-t border-slate-200">
                REFUND POLICY: NON-REFUNDABLE / DATE CHANGE PENALTY APPLIES
              </div>
            </div>

            <div className="bg-white border border-slate-300 rounded p-3.5 flex flex-col justify-between">
              <div>
                <div className="font-bold text-xs uppercase tracking-wider text-[#0b3b60] mb-2 border-b border-slate-200 pb-1">
                  Fare Summary
                </div>
                <div className="space-y-2 text-slate-700">
                  <div className="flex justify-between items-center">
                    <span>Base Fare ({passengers.length} Pax):</span>
                    <span className="font-bold text-slate-900">
                      ৳ {(baseFare * (passengers.length || 1)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Taxes:</span>
                    <span className="font-bold text-slate-900">
                      ৳ {(taxFare * (passengers.length || 1)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-[#0b3b60] pt-2.5 mt-3 flex justify-between items-center">
                <span className="font-black text-sm text-[#0b3b60]">Grand Total:</span>
                <span className="font-black text-xl sm:text-2xl text-[#0b3b60]">
                  ৳ {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Important Instructions */}
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-md p-3.5 text-xs text-[#78350f]">
            <div className="font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 mb-1.5 text-[#92400e]">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Important Travel Instructions</span>
            </div>
            <ul className="space-y-1 pl-1 list-none leading-relaxed">
              <li>• Please reach the airport at least 3 hours prior to international departure.</li>
              <li>• Carry a printed or digital copy of this E-ticket along with your original passport and visa.</li>
              <li>• Boarding gate closes 20 minutes before departure time.</li>
            </ul>
          </div>

          <div className="text-[10.5px] text-slate-400 text-center border-t border-slate-200 pt-2.5">
            This is a computer-generated official airline electronic booking confirmation &bull; Issued via Amadeus Certified GDS Interface
          </div>
        </div>
      </main>
    </div>
  );
};
