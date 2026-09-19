import { ItrFlightSegment, ItrReceiptData, PnrSession, TicketSaleRecord } from '../types';
import { AIRLINES, AIRPORTS } from '../data/gdsDatabase';

export const buildItrReceiptData = (
  session: PnrSession,
  ticketSalesDb: TicketSaleRecord[]
): ItrReceiptData | null => {
  // 1. Check if an active ticket exists
  let saleMatch = ticketSalesDb.find(
    (s) =>
      (session.pnrLocator && s.pnrLocator === session.pnrLocator) ||
      (session.ticketNumbers && session.ticketNumbers.includes(s.ticketNumber))
  );

  const hasTicket = session.isTicketed || (session.ticketNumbers && session.ticketNumbers.length > 0) || (session.pnrLocator && saleMatch);
  if (!hasTicket) {
    return null;
  }

  // 2. Resolve ticket number & carrier
  const primaryTicket = session.ticketNumbers?.[0] || saleMatch?.ticketNumber || '157-7819365589';
  const prefix = primaryTicket.split('-')[0] || '157';
  const airlineObj = AIRLINES.find((a) => a.numericCode === prefix || a.code === session.segments[0]?.airline) || {
    code: 'QR',
    numericCode: '157',
    name: 'QATAR AIRWAYS',
    country: 'QATAR',
  };

  // 3. Resolve passenger name
  let paxName = 'HOSSAIN/ABUL MR';
  let paxType = 'ADT';
  if (session.passengers && session.passengers.length > 0) {
    const p = session.passengers[0];
    paxName = `${p.surname}/${p.firstName}${p.title ? ' ' + p.title : ''}`;
    paxType = p.type || 'ADT';
  } else if (saleMatch?.passengerName) {
    paxName = saleMatch.passengerName;
  }

  // 4. Resolve segments
  const segments: ItrFlightSegment[] = [];
  if (session.segments && session.segments.length > 0) {
    session.segments.forEach((seg, idx) => {
      const segAir = AIRLINES.find((a) => a.code === seg.airline) || airlineObj;
      const origAirport = AIRPORTS.find((a) => a.code === seg.origin);
      const destAirport = AIRPORTS.find((a) => a.code === seg.destination);

      segments.push({
        segNum: String(idx + 1).padStart(2, '0'),
        airline: seg.airline,
        airlineName: segAir.name,
        flightNumber: seg.flightNumber,
        bookingClass: seg.bookingClass || 'Y',
        date: seg.date || '20MAY',
        origin: seg.origin,
        originName: origAirport ? `${origAirport.city} (${origAirport.code})` : seg.origin,
        originTerminal: origAirport?.terminal || '1',
        destination: seg.destination,
        destName: destAirport ? `${destAirport.city} (${destAirport.code})` : seg.destination,
        destTerminal: destAirport?.terminal || '2',
        depTime: seg.depTime || '0410',
        arrTime: seg.arrTime || '0655',
        status: 'OK / HK1',
        nvb: seg.date || '20MAY',
        nva: seg.date || '20MAY',
        baggage: '2PC',
      });
    });
  } else {
    // Default fallback segments if none booked in session but ticket sales record exists
    segments.push(
      {
        segNum: '01',
        airline: airlineObj.code,
        airlineName: airlineObj.name,
        flightNumber: '639',
        bookingClass: 'Y',
        date: '20MAY',
        origin: 'DAC',
        originName: 'DHAKA (DAC)',
        originTerminal: '1',
        destination: 'DOH',
        destName: 'DOHA (DOH)',
        destTerminal: '1',
        depTime: '0410',
        arrTime: '0655',
        status: 'OK / HK1',
        nvb: '20MAY',
        nva: '20MAY',
        baggage: '2PC',
      },
      {
        segNum: '02',
        airline: airlineObj.code,
        airlineName: airlineObj.name,
        flightNumber: '701',
        bookingClass: 'Y',
        date: '20MAY',
        origin: 'DOH',
        originName: 'DOHA (DOH)',
        originTerminal: '1',
        destination: 'LHR',
        destName: 'LONDON HEATHROW (LHR)',
        destTerminal: '4',
        depTime: '0815',
        arrTime: '1330',
        status: 'OK / HK1',
        nvb: '20MAY',
        nva: '20MAY',
        baggage: '2PC',
      }
    );
  }

  // 5. Financial totals
  const baseFare = session.pricing?.baseFare || saleMatch?.grossFare ? Math.round(saleMatch!.grossFare * 0.85) : 85000;
  const tax = session.pricing?.taxes || saleMatch?.tax || 14500;
  const totalFare = session.pricing?.total || saleMatch?.grossFare || baseFare + tax;
  const currency = session.pricing?.currency || 'BDT';
  const fop = session.formOfPayment || saleMatch?.formOfPayment || 'IN VAGT*SHOHOJ';
  const pnrLocator = session.pnrLocator || saleMatch?.pnrLocator || 'X7K9LP';

  return {
    ticketNumber: primaryTicket,
    pnrLocator,
    airlineLocator: `${airlineObj.code}/8N4KQ9`,
    passengerName: paxName,
    paxType,
    issuingAirline: airlineObj.code,
    issuingAirlineName: airlineObj.name,
    issuingAirlineNumeric: airlineObj.numericCode,
    issuingAgent: 'SHOHOJ TRAVELS LTD / BANGLADESH',
    officeId: session.officeId || saleMatch?.officeId || 'DAC360',
    iataNumber: '21368575',
    issueDate: '20MAY26',
    segments,
    baseFare,
    tax,
    totalFare,
    currency,
    formOfPayment: fop,
    fareBasis: session.pricing?.fareBasis || 'YLRBD1',
    fareCalculation: 'DAC QR X/DOH QR LON804.82NUC804.82END ROE105.613XT2000BD7500QA5000GB',
    endorsements: 'NONREF / CHG FEE APPLIES / VALID ON CARRIER ONLY',
    commission: session.commission || `${saleMatch?.commissionPct || 7}%`,
  };
};

export const formatItrTerminalOutput = (data: ItrReceiptData): string => {
  const segLines: string[] = [];
  data.segments.forEach((s) => {
    segLines.push(
      `${s.segNum}  ${s.airline.padEnd(2, ' ')} ${s.flightNumber.padEnd(4, ' ')} ${s.bookingClass}  ${s.date.padEnd(5, ' ')}  ${s.origin} - ${s.destination}      ${s.depTime}   ${s.status} ${s.nvb} ${s.nva} ${s.baggage}`
    );
    segLines.push(
      `             DEP: ${s.depTime} / ${s.originName} ${s.originTerminal ? 'TERM ' + s.originTerminal : ''}`
    );
    segLines.push(
      `             ARR: ${s.arrTime} / ${s.destName} ${s.destTerminal ? 'TERM ' + s.destTerminal : ''}`
    );
  });

  return [
    `-----------------------------------------------------------------------------`,
    `AMADEUS PASSENGER ITINERARY / RECEIPT`,
    `CARRIER: ${data.issuingAirlineName} (${data.issuingAirline}) / IATA ${data.iataNumber}`,
    `DATE OF ISSUE: ${data.issueDate}     OFFICE: ${data.officeId} / BD`,
    `RLOC: 1A/${data.pnrLocator}            AIRLINE LOCATOR: ${data.airlineLocator}`,
    `-----------------------------------------------------------------------------`,
    `PASSENGER NAME     : ${data.passengerName} (${data.paxType || 'ADT'})`,
    `TICKET NUMBER      : ${data.ticketNumber}`,
    `STATUS             : ELECTRONIC TICKET / CONFIRMED`,
    `ISSUING AGENT      : ${data.issuingAgent}`,
    `-----------------------------------------------------------------------------`,
    `FLIGHT ITINERARY:`,
    `SEG AL FLT   CLS DATE   DEP-ARR        TIME   STATUS NVB   NVA   BAG`,
    ...segLines,
    `-----------------------------------------------------------------------------`,
    `FARE CALCULATION   : ${data.fareCalculation}`,
    `AIR FARE           : ${data.currency} ${data.baseFare.toLocaleString()}`,
    `TAXES / FEES       : ${data.currency} ${data.tax.toLocaleString()} XT (BD2000 QA7500 GB5000)`,
    `TOTAL TICKET FARE  : ${data.currency} ${data.totalFare.toLocaleString()}`,
    `FORM OF PAYMENT    : ${data.formOfPayment}`,
    `COMMISSION         : ${data.commission || '7%'}`,
    `ENDORSEMENTS       : ${data.endorsements}`,
    `-----------------------------------------------------------------------------`,
    `NOTICE:`,
    `CARRIAGE AND OTHER SERVICES PROVIDED BY THE CARRIER ARE SUBJECT TO`,
    `CONDITIONS OF CARRIAGE, WHICH ARE HEREBY INCORPORATED BY REFERENCE.`,
    `PLEASE CHECK IN AT LEAST 3 HOURS PRIOR TO INTERNATIONAL DEPARTURE.`,
    `ELECTRONIC TICKET RECEIPT DISPATCH COMPLETE - USE ITR TO RE-DISPLAY`,
    `-----------------------------------------------------------------------------`,
  ].join('\n');
};

export const generateItrHtmlDocument = (data: ItrReceiptData): string => {
  const segRows = data.segments
    .map(
      (s) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
        <td style="padding: 8px 6px; font-weight: bold; color: #1e3a8a;">${s.segNum}</td>
        <td style="padding: 8px 6px; font-weight: bold;">${s.airline} ${s.flightNumber}</td>
        <td style="padding: 8px 6px;">${s.bookingClass}</td>
        <td style="padding: 8px 6px;">${s.date}</td>
        <td style="padding: 8px 6px;">
          <div style="font-weight: 600; color: #0f172a;">${s.originName}</div>
          <div style="font-size: 11px; color: #64748b;">Dept: ${s.depTime} ${s.originTerminal ? 'Terminal ' + s.originTerminal : ''}</div>
        </td>
        <td style="padding: 8px 6px;">
          <div style="font-weight: 600; color: #0f172a;">${s.destName}</div>
          <div style="font-size: 11px; color: #64748b;">Arrv: ${s.arrTime} ${s.destTerminal ? 'Terminal ' + s.destTerminal : ''}</div>
        </td>
        <td style="padding: 8px 6px; color: #047857; font-weight: bold;">${s.status}</td>
        <td style="padding: 8px 6px;">${s.baggage}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Amadeus Passenger Itinerary & Receipt - ${data.ticketNumber}</title>
  <style>
    @media print {
      body {
        margin: 0;
        padding: 15mm;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 24px;
    }
    .receipt-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      padding: 32px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #005eb8;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .amadeus-brand {
      font-size: 22px;
      font-weight: 800;
      color: #005eb8;
      letter-spacing: -0.5px;
    }
    .badge-eticket {
      display: inline-block;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .grid-meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
      background: #f1f5f9;
      padding: 16px;
      border-radius: 6px;
    }
    .meta-item {
      font-size: 12px;
    }
    .meta-label {
      color: #64748b;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .meta-val {
      color: #0f172a;
      font-size: 14px;
      font-weight: 700;
      font-family: monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #f8fafc;
      color: #475569;
      font-size: 11px;
      text-align: left;
      padding: 8px 6px;
      border-bottom: 2px solid #cbd5e1;
      text-transform: uppercase;
    }
    .financials {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      font-weight: 800;
      color: #005eb8;
      border-top: 2px dashed #cbd5e1;
      padding-top: 8px;
      margin-top: 8px;
    }
    .notice-box {
      font-size: 10px;
      color: #64748b;
      line-height: 1.5;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
    .action-controls {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 20px;
    }
    .btn-action {
      background: #005eb8;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-action:hover {
      background: #00478c;
    }
  </style>
</head>
<body>
  <div class="no-print action-controls" style="max-width: 800px; margin: 0 auto 16px auto;">
    <button class="btn-action" onclick="window.print()">
      🖨️ Print / Save as PDF
    </button>
    <button class="btn-action" style="background: #475569;" onclick="window.close()">
      ✖ Close
    </button>
  </div>

  <div class="receipt-card">
    <div class="header-bar">
      <div>
        <div class="amadeus-brand">amadeus</div>
        <div style="font-size: 11px; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">
          SELLING PLATFORM CONNECT &bull; PASSENGER RECEIPT
        </div>
      </div>
      <div style="text-align: right;">
        <span class="badge-eticket">Electronic Ticket Confirmed</span>
        <div style="font-size: 11px; color: #475569; margin-top: 4px;">Issue Date: <strong>${data.issueDate}</strong></div>
      </div>
    </div>

    <div class="grid-meta">
      <div class="meta-item">
        <div class="meta-label">Passenger Name</div>
        <div class="meta-val">${data.passengerName} (${data.paxType || 'ADT'})</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">e-Ticket Number</div>
        <div class="meta-val" style="color: #005eb8;">${data.ticketNumber}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Amadeus Booking Ref (RLOC)</div>
        <div class="meta-val">1A / ${data.pnrLocator}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Airline Reference</div>
        <div class="meta-val">${data.airlineLocator}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Issuing Carrier</div>
        <div style="font-weight: 600; font-size: 13px;">${data.issuingAirlineName} (${data.issuingAirline} / ${data.issuingAirlineNumeric})</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Issuing Agency / Office ID</div>
        <div style="font-weight: 600; font-size: 13px;">${data.issuingAgent} (${data.officeId} / IATA ${data.iataNumber})</div>
      </div>
    </div>

    <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
      Flight Itinerary Details
    </div>
    <table>
      <thead>
        <tr>
          <th>Seg</th>
          <th>Flight</th>
          <th>Class</th>
          <th>Date</th>
          <th>Departure</th>
          <th>Arrival</th>
          <th>Status</th>
          <th>Baggage</th>
        </tr>
      </thead>
      <tbody>
        ${segRows}
      </tbody>
    </table>

    <div class="financials">
      <div>
        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Fare Calculation</div>
        <div style="font-family: monospace; font-size: 11px; color: #334155; line-height: 1.4; word-break: break-all; margin-bottom: 8px;">
          ${data.fareCalculation}
        </div>
        <div style="font-size: 11px; color: #64748b;">
          <strong>Endorsements:</strong> ${data.endorsements}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
          <strong>Form of Payment:</strong> ${data.formOfPayment}
        </div>
      </div>
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span style="color: #64748b;">Air Fare:</span>
          <strong>${data.currency} ${data.baseFare.toLocaleString()}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span style="color: #64748b;">Taxes & Carrier Fees:</span>
          <strong>${data.currency} ${data.tax.toLocaleString()}</strong>
        </div>
        <div class="total-row">
          <span>Total Ticket Fare:</span>
          <span>${data.currency} ${data.totalFare.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div class="notice-box">
      <strong>NOTICE:</strong> Carriage and other services provided by the carrier are subject to conditions of carriage, which are hereby incorporated by reference. These conditions may be obtained from the issuing carrier. Passengers on a journey involving an ultimate destination or a stop in a country other than the country of origin are advised that the provisions of a treaty known as the Warsaw Convention or the Montreal Convention may be applicable to the entire journey.
      <div style="margin-top: 8px; font-weight: 600; color: #334155;">
        Amadeus GDS Certified Passenger Receipt &bull; System Verified
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export const downloadItrTextFile = (data: ItrReceiptData): void => {
  const content = formatItrTerminalOutput(data);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Amadeus_Receipt_${data.ticketNumber.replace(/[^a-zA-Z0-9-]/g, '')}_${data.pnrLocator}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printItrDocument = (data: ItrReceiptData): void => {
  const html = generateItrHtmlDocument(data);

  // Use a hidden printable iframe to seamlessly trigger printing in standard and iframe sandbox environments
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // Fallback to window.open if iframe print is blocked by sandbox
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(html);
          win.document.close();
          win.focus();
          win.print();
        }
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
    }, 400);
  }
};
