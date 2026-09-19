import { ItrFlightSegment, ItrReceiptData, ItrPassengerDetail, ItrBaggageAllowance, PnrSession, TicketSaleRecord } from '../types';
import { AIRLINES, AIRPORTS } from '../data/gdsDatabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const AIRLINE_BRAND_INFO: Record<string, { bg: string; text: string; logoUrl: string; name: string }> = {
  QR: {
    bg: '#5C0632',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/QR.svg',
    name: 'QATAR AIRWAYS',
  },
  EK: {
    bg: '#D71921',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/EK.svg',
    name: 'EMIRATES',
  },
  SV: {
    bg: '#006C35',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/SV.svg',
    name: 'SAUDIA',
  },
  BG: {
    bg: '#006A4E',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BG.svg',
    name: 'BIMAN BANGLADESH AIRLINES',
  },
  BS: {
    bg: '#0B3B60',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BS.svg',
    name: 'US-BANGLA AIRLINES',
  },
  VQ: {
    bg: '#E31B23',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/VQ.svg',
    name: 'NOVOAIR',
  },
  SQ: {
    bg: '#00205B',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/SQ.svg',
    name: 'SINGAPORE AIRLINES',
  },
  TK: {
    bg: '#C70000',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/TK.svg',
    name: 'TURKISH AIRLINES',
  },
  EY: {
    bg: '#BD8B31',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/EY.svg',
    name: 'ETIHAD AIRWAYS',
  },
  WY: {
    bg: '#C52033',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/WY.svg',
    name: 'OMAN AIR',
  },
  KU: {
    bg: '#002D62',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/KU.svg',
    name: 'KUWAIT AIRWAYS',
  },
  GF: {
    bg: '#8E7238',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/GF.svg',
    name: 'GULF AIR',
  },
  G9: {
    bg: '#ED1C24',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/G9.svg',
    name: 'AIR ARABIA',
  },
  FZ: {
    bg: '#F58220',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/FZ.svg',
    name: 'FLYDUBAI',
  },
  '6E': {
    bg: '#001B94',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/6E.svg',
    name: 'INDIGO',
  },
  AI: {
    bg: '#E11B22',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/AI.svg',
    name: 'AIR INDIA',
  },
  BA: {
    bg: '#075AAA',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg',
    name: 'BRITISH AIRWAYS',
  },
  LH: {
    bg: '#05164D',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/LH.svg',
    name: 'LUFTHANSA',
  },
  TG: {
    bg: '#4B1869',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/TG.svg',
    name: 'THAI AIRWAYS',
  },
  MH: {
    bg: '#004899',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/MH.svg',
    name: 'MALAYSIA AIRLINES',
  },
  CX: {
    bg: '#006564',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/CX.svg',
    name: 'CATHAY PACIFIC',
  },
};

export const getAirlineLogoUrl = (airlineCode: string): string => {
  if (AIRLINE_BRAND_INFO[airlineCode]?.logoUrl) {
    return AIRLINE_BRAND_INFO[airlineCode].logoUrl;
  }
  return `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${airlineCode}.svg`;
};

export const buildItrReceiptData = (
  session: PnrSession,
  ticketSalesDb: TicketSaleRecord[]
): ItrReceiptData | null => {
  // 1. Check if an active ticket exists
  const saleMatch = ticketSalesDb.find(
    (s) =>
      (session.pnrLocator && s.pnrLocator === session.pnrLocator) ||
      (session.ticketNumbers && session.ticketNumbers.includes(s.ticketNumber))
  );

  const hasTicket =
    session.isTicketed ||
    (session.ticketNumbers && session.ticketNumbers.length > 0) ||
    (session.pnrLocator && saleMatch);

  if (!hasTicket) {
    return null;
  }

  // 2. Resolve operating carrier & numeric code
  const primaryCarrierCode = session.segments[0]?.airline || saleMatch?.airline || 'QR';
  const airlineObj = AIRLINES.find((a) => a.code === primaryCarrierCode) || {
    code: primaryCarrierCode,
    numericCode: '157',
    name: 'QATAR AIRWAYS',
    country: 'QATAR',
  };

  const prefix = airlineObj.numericCode || '157';
  const brandInfo = AIRLINE_BRAND_INFO[airlineObj.code] || {
    bg: '#005eb8',
    text: '#ffffff',
    logoUrl: `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${airlineObj.code}.svg`,
    name: airlineObj.name,
  };

  // 3. Dynamic Multi-Passenger Resolution
  const paxDetails: ItrPassengerDetail[] = [];
  const baseTicketNumSeed = 4835976385;

  if (session.passengers && session.passengers.length > 0) {
    session.passengers.forEach((p, idx) => {
      const surname = (p.surname || 'PASSENGER').toUpperCase();
      const firstName = (p.firstName || '').toUpperCase();
      const title = (p.title || (p.type === 'CHD' ? 'MSTR' : 'MR')).toUpperCase();
      const paxType = p.type || 'ADT';

      const tktNum =
        p.ticketNumber ||
        session.ticketNumbers?.[idx] ||
        (saleMatch && idx === 0 ? saleMatch.ticketNumber : null) ||
        `${prefix}-${baseTicketNumSeed + idx}`;

      const fullName = firstName ? `${surname}/${firstName} ${title}`.trim() : `${surname} ${title}`.trim();

      paxDetails.push({
        passengerIndex: idx + 1,
        surname,
        firstName,
        title,
        fullName,
        paxType,
        ticketNumber: tktNum,
        couponStatus: 'OPEN FOR USE / CONFIRMED',
      });
    });
  } else {
    // If session has no explicit passenger array, create from saleMatch or default
    const pName = saleMatch?.passengerName || 'RAHMAN/ANIS MR';
    const parts = pName.split('/');
    const surname = parts[0] || 'RAHMAN';
    const rest = (parts[1] || 'ANIS MR').split(' ');
    const firstName = rest[0] || 'ANIS';
    const title = rest.slice(1).join(' ') || 'MR';
    const primaryTicket = session.ticketNumbers?.[0] || saleMatch?.ticketNumber || `${prefix}-4835976385`;

    paxDetails.push({
      passengerIndex: 1,
      surname,
      firstName,
      title,
      fullName: `${surname}/${firstName} ${title}`.trim(),
      paxType: 'ADT',
      ticketNumber: primaryTicket,
      couponStatus: 'OPEN FOR USE / CONFIRMED',
    });
  }

  const primaryTicket = paxDetails[0]?.ticketNumber || `${prefix}-4835976385`;
  const allTicketNumbers = paxDetails.map((p) => p.ticketNumber);

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
        originTerminal: origAirport?.terminal || (seg.origin === 'DAC' ? '1' : '2'),
        destination: seg.destination,
        destName: destAirport ? `${destAirport.city} (${destAirport.code})` : seg.destination,
        destTerminal: destAirport?.terminal || (seg.destination === 'DOH' || seg.destination === 'DXB' ? '3' : '1'),
        depTime: seg.depTime || '0410',
        arrTime: seg.arrTime || '0655',
        status: 'OK / HK1',
        nvb: seg.date || '20MAY',
        nva: seg.date || '20MAY',
        baggage: seg.bookingClass === 'J' || seg.bookingClass === 'C' ? '2PC (32KG)' : '2PC (23KG)',
      });
    });
  } else {
    // Default fallback segments if none booked in session
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
        baggage: '2PC (23KG)',
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
        baggage: '2PC (23KG)',
      }
    );
  }

  // 5. Build Detailed Baggage Allowance for each segment and passenger
  const baggageAllowances: ItrBaggageAllowance[] = [];
  paxDetails.forEach((pax) => {
    segments.forEach((seg) => {
      const isDomestic =
        ['DAC', 'CGP', 'CXB', 'ZYL', 'JSR', 'SPD', 'BZL', 'RJH'].includes(seg.origin) &&
        ['DAC', 'CGP', 'CXB', 'ZYL', 'JSR', 'SPD', 'BZL', 'RJH'].includes(seg.destination);

      const isBusiness = ['J', 'C', 'D', 'I'].includes(seg.bookingClass);
      const isInfant = pax.paxType === 'INF';

      let checkedBag = '2 Pieces (up to 23 KG / 50 LBS each)';
      let cabinBag = '1 Piece (up to 7 KG / 15 LBS) + 1 Personal item (Laptop/Handbag)';

      if (isInfant) {
        checkedBag = '1 Piece (up to 10 KG / 22 LBS) + 1 Fully Collapsible Stroller';
        cabinBag = '1 Infant Care Bag (up to 5 KG)';
      } else if (isDomestic) {
        checkedBag = isBusiness ? '30 KG (2 Pieces max)' : '20 KG (1 Piece)';
        cabinBag = '1 Hand Carry (up to 7 KG, 55x40x20 cm) + 1 Small item';
      } else if (isBusiness) {
        checkedBag = '2 Pieces (up to 32 KG / 70 LBS each)';
        cabinBag = '2 Pieces (up to 15 KG total) + 1 Garment Bag';
      } else if (
        ['DOH', 'DXB', 'JED', 'MED', 'RUH', 'KWI', 'BAH', 'MCT', 'AUH', 'SHJ'].includes(seg.destination) ||
        ['DOH', 'DXB', 'JED', 'MED', 'RUH'].includes(seg.origin)
      ) {
        checkedBag = '2 Pieces (up to 23 KG / 50 LBS each) - 158 cm linear';
        cabinBag = '1 Piece (up to 7 KG / 15 LBS) + 1 Duty Free bag';
      }

      baggageAllowances.push({
        paxName: pax.fullName,
        paxType: pax.paxType,
        segmentNum: seg.segNum,
        flight: `${seg.airline} ${seg.flightNumber}`,
        route: `${seg.origin} → ${seg.destination}`,
        checkedBag,
        cabinBag,
      });
    });
  });

  // 6. Financial Calculations across all passengers
  const adtPax = paxDetails.filter((p) => p.paxType === 'ADT');
  const chdPax = paxDetails.filter((p) => p.paxType === 'CHD');
  const infPax = paxDetails.filter((p) => p.paxType === 'INF');

  const adtCount = adtPax.length > 0 ? adtPax.length : 1;
  const chdCount = chdPax.length;
  const infCount = infPax.length;

  const baseFarePerAdt =
    session.pricing?.baseFare ||
    (saleMatch?.grossFare ? Math.round(saleMatch.grossFare * 0.85) : 85000);
  const taxPerAdt = session.pricing?.taxes || saleMatch?.tax || 14500;
  const totalPerAdt = baseFarePerAdt + taxPerAdt;

  const baseFarePerChd = Math.round(baseFarePerAdt * 0.75);
  const taxPerChd = Math.round(taxPerAdt * 0.85);
  const totalPerChd = baseFarePerChd + taxPerChd;

  const baseFarePerInf = Math.round(baseFarePerAdt * 0.1);
  const taxPerInf = Math.round(taxPerAdt * 0.3);
  const totalPerInf = baseFarePerInf + taxPerInf;

  const grandTotalFare =
    adtCount * totalPerAdt +
    chdCount * totalPerChd +
    infCount * totalPerInf;

  const currency = session.pricing?.currency || 'BDT';
  const fop = session.formOfPayment || saleMatch?.formOfPayment || 'IN VAGT*SHOHOJ';
  const pnrLocator = session.pnrLocator || saleMatch?.pnrLocator || 'X7K9LP';

  // Format today's date in GDS standard format (e.g. 19SEP26)
  const now = new Date();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dayStr = String(now.getDate()).padStart(2, '0');
  const monthStr = months[now.getMonth()];
  const yearStr = String(now.getFullYear()).slice(-2);
  const issueDateFormatted = `${dayStr}${monthStr}${yearStr}`;

  return {
    ticketNumber: primaryTicket,
    ticketNumbers: allTicketNumbers,
    pnrLocator,
    airlineLocator: `${airlineObj.code}/8N4KQ9`,
    passengerName: paxDetails[0]?.fullName || 'RAHMAN/ANIS MR',
    paxType: paxDetails[0]?.paxType || 'ADT',
    passengers: paxDetails,
    issuingAirline: airlineObj.code,
    issuingAirlineName: airlineObj.name,
    issuingAirlineNumeric: airlineObj.numericCode,
    airlineLogoUrl: brandInfo.logoUrl,
    airlineBrandColor: brandInfo.bg,
    issuingAgent: 'SHOHOJ TRAVELS LTD / BANGLADESH',
    officeId: session.officeId || saleMatch?.officeId || 'DAC360',
    iataNumber: '21368575',
    issueDate: issueDateFormatted,
    segments,
    baggageAllowances,
    baseFare: baseFarePerAdt,
    tax: taxPerAdt,
    totalFare: totalPerAdt,
    grandTotalFare,
    currency,
    formOfPayment: fop,
    fareBasis: session.pricing?.fareBasis || 'YLRBD1',
    fareCalculation: `DAC ${airlineObj.code} X/DOH ${airlineObj.code} LON804.82NUC804.82END ROE105.613XT2000BD7500QA5000GB`,
    endorsements: 'NON-REFUNDABLE / DATE CHANGE PENALTY APPLIES / VALID ON CARRIER ONLY',
    commission: session.commission || `${saleMatch?.commissionPct || 7}%`,
    fareBreakdownPerPax: {
      adt: { count: adtCount, base: baseFarePerAdt, tax: taxPerAdt, total: totalPerAdt },
      ...(chdCount > 0 ? { chd: { count: chdCount, base: baseFarePerChd, tax: taxPerChd, total: totalPerChd } } : {}),
      ...(infCount > 0 ? { inf: { count: infCount, base: baseFarePerInf, tax: taxPerInf, total: totalPerInf } } : {}),
    },
  };
};

export const formatItrTerminalOutput = (data: ItrReceiptData): string => {
  const paxLines = data.passengers.map(
    (p) => `  ${String(p.passengerIndex).padStart(2, ' ')}. ${p.fullName.padEnd(28, ' ')} (${p.paxType.padEnd(3, ' ')})  TKT: ${p.ticketNumber}`
  );

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

  const baggageLines = data.baggageAllowances.map(
    (b) => `  ${b.paxName.padEnd(24, ' ')} ${b.route.padEnd(14, ' ')} CHECKED: ${b.checkedBag} | CABIN: ${b.cabinBag}`
  );

  return [
    `-----------------------------------------------------------------------------`,
    `AMADEUS OFFICIAL ELECTRONIC PASSENGER ITINERARY & RECEIPT (ITR)`,
    `CARRIER: ${data.issuingAirlineName} (${data.issuingAirline}) / IATA ${data.iataNumber} / CODE: ${data.issuingAirlineNumeric}`,
    `DATE OF ISSUE: ${data.issueDate}     OFFICE: ${data.officeId} / BD / SINE: 9912AA/SU`,
    `RLOC: 1A/${data.pnrLocator}            AIRLINE RECORD LOCATOR: ${data.airlineLocator}`,
    `-----------------------------------------------------------------------------`,
    `PASSENGER(S) AND E-TICKET NUMBER(S):`,
    ...paxLines,
    `-----------------------------------------------------------------------------`,
    `FLIGHT ITINERARY:`,
    `SEG AL FLT   CLS DATE   DEP-ARR        TIME   STATUS NVB   NVA   BAG`,
    ...segLines,
    `-----------------------------------------------------------------------------`,
    `BAGGAGE ALLOWANCE PER PASSENGER & SECTOR:`,
    ...baggageLines,
    `-----------------------------------------------------------------------------`,
    `FARE CALCULATION   : ${data.fareCalculation}`,
    `AIR FARE (PER ADT) : ${data.currency} ${data.baseFare.toLocaleString()}`,
    `TAXES / FEES / CHG : ${data.currency} ${data.tax.toLocaleString()} XT (BD2000 QA7500 GB5000)`,
    `PER PASSENGER TOTAL: ${data.currency} ${data.totalFare.toLocaleString()}`,
    `TOTAL PASSENGERS   : ${data.passengers.length} PAX`,
    `GRAND TOTAL PNR    : ${data.currency} ${data.grandTotalFare.toLocaleString()}`,
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
  const paxRows = data.passengers
    .map(
      (p) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <td style="padding: 10px 8px; font-weight: bold; color: #1e3a8a; width: 40px;">${p.passengerIndex}.</td>
        <td style="padding: 10px 8px; font-weight: 700; color: #0f172a;">${p.fullName}</td>
        <td style="padding: 10px 8px; color: #475569; font-weight: 600;">${p.paxType}</td>
        <td style="padding: 10px 8px; font-family: 'Courier New', Courier, monospace; font-weight: bold; color: #005eb8; font-size: 14px;">
          ${p.ticketNumber}
        </td>
        <td style="padding: 10px 8px; color: #047857; font-weight: 700; font-size: 11px;">
          <span style="background: #dcfce7; padding: 3px 8px; border-radius: 4px; border: 1px solid #86efac;">
            OPEN FOR USE / CONFIRMED
          </span>
        </td>
      </tr>
    `
    )
    .join('');

  const segRows = data.segments
    .map(
      (s) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
        <td style="padding: 9px 8px; font-weight: bold; color: #1e3a8a;">${s.segNum}</td>
        <td style="padding: 9px 8px; font-weight: 700; font-family: 'Courier New', Courier, monospace; font-size: 13px;">
          ${s.airline} ${s.flightNumber}
        </td>
        <td style="padding: 9px 8px; font-weight: 600; font-family: 'Courier New', Courier, monospace;">${s.bookingClass}</td>
        <td style="padding: 9px 8px; font-weight: 600;">${s.date}</td>
        <td style="padding: 9px 8px;">
          <div style="font-weight: 700; color: #0f172a;">${s.originName}</div>
          <div style="font-size: 11px; color: #475569; font-family: 'Courier New', Courier, monospace;">
            Dept: <strong>${s.depTime}</strong> ${s.originTerminal ? '(Term ' + s.originTerminal + ')' : ''}
          </div>
        </td>
        <td style="padding: 9px 8px;">
          <div style="font-weight: 700; color: #0f172a;">${s.destName}</div>
          <div style="font-size: 11px; color: #475569; font-family: 'Courier New', Courier, monospace;">
            Arrv: <strong>${s.arrTime}</strong> ${s.destTerminal ? '(Term ' + s.destTerminal + ')' : ''}
          </div>
        </td>
        <td style="padding: 9px 8px; color: #047857; font-weight: 700; font-size: 11px;">${s.status}</td>
        <td style="padding: 9px 8px; font-weight: 600; color: #334155;">${s.baggage}</td>
      </tr>
    `
    )
    .join('');

  const baggageRows = data.baggageAllowances
    .map(
      (b) => `
      <tr style="border-bottom: 1px solid #f1f5f9; font-size: 12px;">
        <td style="padding: 8px 6px; font-weight: 600; color: #1e293b;">${b.paxName}</td>
        <td style="padding: 8px 6px; font-family: 'Courier New', Courier, monospace; font-weight: 600; color: #005eb8;">${b.flight}</td>
        <td style="padding: 8px 6px; font-weight: 600;">${b.route}</td>
        <td style="padding: 8px 6px; color: #0f172a; font-weight: 600;">${b.checkedBag}</td>
        <td style="padding: 8px 6px; color: #475569;">${b.cabinBag}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Electronic Passenger Itinerary & Receipt - ${data.ticketNumber}</title>
  <style>
    @media print {
      body {
        margin: 0 !important;
        padding: 8mm !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .receipt-card {
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
        padding: 0 !important;
      }
      @page {
        margin: 10mm;
        size: A4 portrait;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f1f5f9;
      color: #1e293b;
      margin: 0;
      padding: 24px;
      line-height: 1.4;
    }
    .receipt-card {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      padding: 36px 40px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #005eb8;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .airline-brand-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .airline-logo-img {
      max-height: 48px;
      max-width: 180px;
      object-fit: contain;
    }
    .airline-info-name {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
    }
    .airline-code-badge {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.5px;
    }
    .gds-brand-group {
      text-align: right;
    }
    .amadeus-brand {
      font-size: 20px;
      font-weight: 800;
      color: #005eb8;
      letter-spacing: -0.5px;
    }
    .document-title {
      font-size: 11px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .grid-meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 16px 20px;
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
      font-size: 13px;
      font-weight: 700;
    }
    .mono {
      font-family: 'Courier New', Courier, monospace;
    }
    .section-heading {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #f1f5f9;
      padding: 6px 12px;
      border-left: 4px solid #005eb8;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th {
      background: #f8fafc;
      color: #475569;
      font-size: 11px;
      text-align: left;
      padding: 8px 8px;
      border-bottom: 2px solid #cbd5e1;
      text-transform: uppercase;
      font-weight: 700;
    }
    .financials {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px 20px;
      margin-top: 20px;
      margin-bottom: 24px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 800;
      color: #005eb8;
      border-top: 2px solid #cbd5e1;
      padding-top: 8px;
      margin-top: 8px;
    }
    .notice-box {
      font-size: 10.5px;
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
      padding: 9px 18px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .btn-action:hover {
      background: #00478c;
    }
  </style>
</head>
<body>
  <div class="no-print action-controls" style="max-width: 860px; margin: 0 auto 16px auto;">
    <button class="btn-action" onclick="window.print()">
      🖨️ Print / Save as PDF
    </button>
    <button class="btn-action" style="background: #475569;" onclick="window.close()">
      ✖ Close
    </button>
  </div>

  <div class="receipt-card" id="itr-printable-receipt">
    <!-- Brand Header -->
    <div class="header-bar">
      <div class="airline-brand-group">
        <img 
          src="${data.airlineLogoUrl}" 
          alt="${data.issuingAirlineName}" 
          class="airline-logo-img"
          onerror="this.style.display='none'"
        />
        <div>
          <div class="airline-info-name">${data.issuingAirlineName}</div>
          <div class="airline-code-badge">
            IATA CARRIER CODE: <strong>${data.issuingAirline}</strong> &bull; NUMERIC: <strong>${data.issuingAirlineNumeric}</strong>
          </div>
        </div>
      </div>
      <div class="gds-brand-group">
        <div class="amadeus-brand">amadeus</div>
        <div class="document-title">
          Selling Platform Connect &bull; Electronic Ticket Receipt
        </div>
        <div style="font-size: 11px; color: #047857; font-weight: 700; margin-top: 4px;">
          ✓ VALIDATED ELECTRONIC TICKET
        </div>
      </div>
    </div>

    <!-- Audit & Control Box -->
    <div class="grid-meta">
      <div class="meta-item">
        <div class="meta-label">Amadeus Reference (RLOC)</div>
        <div class="meta-val mono" style="color: #005eb8; font-size: 14px;">1A / ${data.pnrLocator}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Airline Record Locator</div>
        <div class="meta-val mono">${data.airlineLocator}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Date of Issue</div>
        <div class="meta-val">${data.issueDate}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Issuing Agency</div>
        <div class="meta-val">${data.issuingAgent}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">IATA Accreditation No.</div>
        <div class="meta-val mono">${data.iataNumber}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Agent Sine &amp; Office ID</div>
        <div class="meta-val mono">9912AA/SU / ${data.officeId}</div>
      </div>
    </div>

    <!-- Passenger Details (Multi-Passenger Support) -->
    <div class="section-heading">
      1. Passenger Details &amp; 13-Digit E-Ticket Number(s)
    </div>
    <table>
      <thead>
        <tr>
          <th>No.</th>
          <th>Passenger Name</th>
          <th>Type</th>
          <th>E-Ticket Number</th>
          <th>Coupon Status</th>
        </tr>
      </thead>
      <tbody>
        ${paxRows}
      </tbody>
    </table>

    <!-- Flight Itinerary -->
    <div class="section-heading">
      2. Flight Itinerary Schedule
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

    <!-- Detailed Baggage Allowance (Section 3) -->
    <div class="section-heading">
      3. Baggage Allowance &amp; Policies
    </div>
    <table>
      <thead>
        <tr>
          <th>Passenger Name</th>
          <th>Flight</th>
          <th>Sector</th>
          <th>Checked Baggage</th>
          <th>Cabin / Hand Baggage</th>
        </tr>
      </thead>
      <tbody>
        ${baggageRows}
      </tbody>
    </table>
    <div style="font-size: 11px; color: #64748b; margin-top: -6px; margin-bottom: 16px; padding: 0 4px;">
      * Maximum dimensions per checked bag: 158 cm (62 inches) length + width + height. Excess baggage charges apply for weight or piece limits exceeded.
    </div>

    <!-- Fare & Financial Details -->
    <div class="section-heading">
      4. Fare Calculation, Taxes &amp; Payment Details
    </div>
    <div class="financials">
      <div>
        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">
          GDS Linear Fare Calculation
        </div>
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #334155; line-height: 1.4; word-break: break-all; margin-bottom: 10px; background: #ffffff; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
          ${data.fareCalculation}
        </div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
          <strong>Endorsements / Restrictions:</strong> ${data.endorsements}
        </div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
          <strong>Form of Payment:</strong> ${data.formOfPayment}
        </div>
        <div style="font-size: 11px; color: #475569;">
          <strong>Agency Commission:</strong> ${data.commission || '7%'}
        </div>
      </div>
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
          <span style="color: #64748b;">Air Fare (Per Adult):</span>
          <strong>${data.currency} ${data.baseFare.toLocaleString()}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
          <span style="color: #64748b;">Taxes &amp; Carrier Surcharges:</span>
          <strong>${data.currency} ${data.tax.toLocaleString()}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
          <span style="color: #64748b;">Per Passenger Total:</span>
          <strong>${data.currency} ${data.totalFare.toLocaleString()}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #475569;">
          <span>Passengers in PNR:</span>
          <span><strong>${data.passengers.length} PAX</strong></span>
        </div>
        <div class="total-row">
          <span>Grand Total Fare:</span>
          <span>${data.currency} ${data.grandTotalFare.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Legal Notice -->
    <div class="notice-box">
      <strong>LEGAL NOTICE &amp; CONDITIONS OF CARRIAGE:</strong> Carriage and other services provided by the carrier are subject to conditions of carriage, which are hereby incorporated by reference. These conditions may be obtained from the issuing carrier. Passengers on a journey involving an ultimate destination or a stop in a country other than the country of origin are advised that international treaties known as the Montreal Convention, or its predecessor, the Warsaw Convention, may apply to the entire journey. Check-in counters close 60 minutes prior to scheduled international departure. Valid passport with minimum 6 months validity and appropriate visas are strictly required.
      <div style="margin-top: 10px; font-weight: 700; color: #334155; display: flex; justify-content: space-between; align-items: center;">
        <span>Amadeus Selling Platform Connect &bull; GDS Certified Ticket</span>
        <span style="font-family: 'Courier New', Courier, monospace; color: #64748b;">DISPATCH REF: 1A/${data.pnrLocator}/${data.issueDate}</span>
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
  link.download = `Amadeus_Receipt_${data.pnrLocator}_${data.ticketNumber.replace(/[^a-zA-Z0-9-]/g, '')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printItrDocument = (data: ItrReceiptData): void => {
  const html = generateItrHtmlDocument(data);

  // Use a printable iframe to seamlessly trigger printing
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
        // Fallback to new window if iframe print is restricted
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(html);
          win.document.close();
          win.focus();
          win.print();
        }
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1200);
      }
    }, 400);
  }
};

/**
 * Automatically triggers immediate PDF download of the entire official document
 * without showing the browser print dialog first.
 */
export const downloadItrPdfFile = async (
  data: ItrReceiptData,
  sourceElement?: HTMLElement | null
): Promise<void> => {
  try {
    let elementToCapture = sourceElement;
    let tempContainer: HTMLElement | null = null;

    if (!elementToCapture) {
      // Create a temporary off-screen container rendered with authentic styles
      tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '840px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.zIndex = '-9999';

      const tempIframe = document.createElement('iframe');
      tempIframe.style.width = '840px';
      tempIframe.style.height = '1400px';
      tempContainer.appendChild(tempIframe);
      document.body.appendChild(tempContainer);

      const iframeDoc = tempIframe.contentDocument || tempIframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(generateItrHtmlDocument(data));
        iframeDoc.close();

        // Wait slightly for fonts and images to load
        await new Promise((resolve) => setTimeout(resolve, 300));
        elementToCapture = iframeDoc.getElementById('itr-printable-receipt') as HTMLElement;
      }
    }

    if (!elementToCapture) {
      throw new Error('Receipt DOM element could not be found for PDF export.');
    }

    const canvas = await html2canvas(elementToCapture, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 860,
    });

    if (tempContainer && document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // top margin

    // First page
    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20;

    // Additional pages if receipt content overflows 1 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;
    }

    const filename = `E-Ticket_Receipt_${data.pnrLocator}_${data.ticketNumber.replace(/[^a-zA-Z0-9-]/g, '')}.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error('Direct PDF export error, falling back to print dialog:', err);
    printItrDocument(data);
  }
};
