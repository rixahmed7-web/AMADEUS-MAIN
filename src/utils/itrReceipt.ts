import { ItrFlightSegment, ItrReceiptData, ItrPassengerDetail, ItrBaggageAllowance, PnrSession, TicketSaleRecord } from '../types';
import { AIRLINES, AIRPORTS } from '../data/gdsDatabase';
import { MONTHS } from './flightScheduleGenerator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface AirlineBrandConfig {
  bg: string;
  text: string;
  logoUrl: string;
  name: string;
  slogan: string;
  sloganColor: string;
  prefix: string;
}

export const AIRLINE_BRAND_INFO: Record<string, AirlineBrandConfig> = {
  BS: {
    bg: '#0B3B60',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BS.svg',
    name: 'US-BANGLA AIRLINES',
    slogan: 'FLY FAST FLY SAFE',
    sloganColor: '#E31B23',
    prefix: '779',
  },
  BG: {
    bg: '#006A4E',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BG.svg',
    name: 'BIMAN BANGLADESH AIRLINES',
    slogan: 'YOUR HOME IN THE SKY',
    sloganColor: '#006A4E',
    prefix: '997',
  },
  SV: {
    bg: '#006C35',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/SV.svg',
    name: 'SAUDIA',
    slogan: 'WELCOME TO YOUR WORLD',
    sloganColor: '#006C35',
    prefix: '065',
  },
  QR: {
    bg: '#5C0632',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/QR.svg',
    name: 'QATAR AIRWAYS',
    slogan: 'GOING PLACES TOGETHER',
    sloganColor: '#5C0632',
    prefix: '157',
  },
  EK: {
    bg: '#D71921',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/EK.svg',
    name: 'EMIRATES',
    slogan: 'FLY BETTER',
    sloganColor: '#D71921',
    prefix: '176',
  },
  GF: {
    bg: '#8E7238',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/GF.svg',
    name: 'GULF AIR',
    slogan: 'A SMART WAY TO FLY',
    sloganColor: '#8E7238',
    prefix: '072',
  },
  KU: {
    bg: '#002D62',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/KU.svg',
    name: 'KUWAIT AIRWAYS',
    slogan: 'REACHING NEW HORIZONS',
    sloganColor: '#002D62',
    prefix: '229',
  },
  J9: {
    bg: '#008080',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/J9.svg',
    name: 'JAZEERA AIRWAYS',
    slogan: 'WINGS OF FREEDOM',
    sloganColor: '#008080',
    prefix: '555',
  },
  TK: {
    bg: '#C70000',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/TK.svg',
    name: 'TURKISH AIRLINES',
    slogan: 'WIDEN YOUR WORLD',
    sloganColor: '#C70000',
    prefix: '235',
  },
  SQ: {
    bg: '#00205B',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/SQ.svg',
    name: 'SINGAPORE AIRLINES',
    slogan: 'A GREAT WAY TO FLY',
    sloganColor: '#00205B',
    prefix: '618',
  },
  EY: {
    bg: '#BD8B31',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/EY.svg',
    name: 'ETIHAD AIRWAYS',
    slogan: 'CHOOSE WELL',
    sloganColor: '#BD8B31',
    prefix: '607',
  },
  WY: {
    bg: '#C52033',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/WY.svg',
    name: 'OMAN AIR',
    slogan: 'FLY WITH OMAN AIR',
    sloganColor: '#C52033',
    prefix: '910',
  },
  FZ: {
    bg: '#F58220',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/FZ.svg',
    name: 'FLYDUBAI',
    slogan: 'OPENING UP THE WORLD',
    sloganColor: '#F58220',
    prefix: '141',
  },
  G9: {
    bg: '#ED1C24',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/G9.svg',
    name: 'AIR ARABIA',
    slogan: 'WHERE NEXT',
    sloganColor: '#ED1C24',
    prefix: '514',
  },
  VQ: {
    bg: '#E31B23',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/VQ.svg',
    name: 'NOVOAIR',
    slogan: 'TRULY YOURS',
    sloganColor: '#E31B23',
    prefix: '907',
  },
  AI: {
    bg: '#E11B22',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/AI.svg',
    name: 'AIR INDIA',
    slogan: 'FLY THE NEW AIR INDIA',
    sloganColor: '#E11B22',
    prefix: '098',
  },
  '6E': {
    bg: '#001B94',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/6E.svg',
    name: 'INDIGO',
    slogan: 'GO INDIGO',
    sloganColor: '#001B94',
    prefix: '312',
  },
  BA: {
    bg: '#075AAA',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg',
    name: 'BRITISH AIRWAYS',
    slogan: 'TO FLY. TO SERVE.',
    sloganColor: '#075AAA',
    prefix: '125',
  },
  LH: {
    bg: '#05164D',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/LH.svg',
    name: 'LUFTHANSA',
    slogan: 'SAY YES TO THE WORLD',
    sloganColor: '#05164D',
    prefix: '220',
  },
  TG: {
    bg: '#4B1869',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/TG.svg',
    name: 'THAI AIRWAYS',
    slogan: 'SMOOTH AS SILK',
    sloganColor: '#4B1869',
    prefix: '217',
  },
  MH: {
    bg: '#004899',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/MH.svg',
    name: 'MALAYSIA AIRLINES',
    slogan: 'MALAYSIAN HOSPITALITY',
    sloganColor: '#004899',
    prefix: '232',
  },
  CX: {
    bg: '#006564',
    text: '#ffffff',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/CX.svg',
    name: 'CATHAY PACIFIC',
    slogan: 'MOVE BEYOND',
    sloganColor: '#006564',
    prefix: '160',
  },
};

export const getAirlineLogoUrl = (airlineCode: string): string => {
  if (AIRLINE_BRAND_INFO[airlineCode]?.logoUrl) {
    return AIRLINE_BRAND_INFO[airlineCode].logoUrl;
  }
  return `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${airlineCode}.svg`;
};

export const formatGdsTime = (timeStr: string): string => {
  if (!timeStr) return '08:35 AM';
  const clean = timeStr.replace(/[^0-9]/g, '');
  if (clean.length === 4) {
    let hours = parseInt(clean.substring(0, 2), 10);
    const mins = clean.substring(2, 4);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
  }
  return timeStr;
};

export const formatGdsDatePretty = (dateStr: string): string => {
  if (!dateStr) return 'Wed, 20 May 2026';
  const m = dateStr.match(/^(\d{1,2})([A-Z]{3})/i);
  if (!m) return dateStr;
  const day = m[1];
  const mon = m[2].toUpperCase();
  const monthMap: Record<string, { full: string; dayName: string }> = {
    JAN: { full: 'Jan', dayName: 'Thu' },
    FEB: { full: 'Feb', dayName: 'Sun' },
    MAR: { full: 'Mar', dayName: 'Sun' },
    APR: { full: 'Apr', dayName: 'Wed' },
    MAY: { full: 'May', dayName: 'Wed' },
    JUN: { full: 'Jun', dayName: 'Mon' },
    JUL: { full: 'Jul', dayName: 'Wed' },
    AUG: { full: 'Aug', dayName: 'Sat' },
    SEP: { full: 'Sep', dayName: 'Tue' },
    OCT: { full: 'Oct', dayName: 'Thu' },
    NOV: { full: 'Nov', dayName: 'Sun' },
    DEC: { full: 'Dec', dayName: 'Tue' },
  };
  const info = monthMap[mon] || { full: mon, dayName: 'Wed' };
  return `${info.dayName}, ${day} ${info.full} 2026`;
};

export const formatPassengerDisplayName = (p: {
  surname?: string;
  firstName?: string;
  title?: string;
  fullName?: string;
  type?: string;
  paxType?: string;
}): string => {
  let surname = p.surname || '';
  let firstName = p.firstName || '';
  let title = p.title || '';
  const type = p.paxType || p.type || 'ADT';
  const typeLabel = type === 'ADT' ? 'Adult' : type === 'CHD' ? 'Child' : type === 'INF' ? 'Infant' : type;

  if (!surname && p.fullName) {
    const parts = p.fullName.split('/');
    if (parts.length === 2) {
      surname = parts[0].trim();
      const rest = parts[1].trim().split(' ');
      const possibleTitle = rest[rest.length - 1]?.toUpperCase();
      if (['MR', 'MRS', 'MS', 'MISS', 'MSTR'].includes(possibleTitle)) {
        title = possibleTitle;
        firstName = rest.slice(0, -1).join(' ');
      } else {
        firstName = parts[1].trim();
      }
    } else {
      surname = p.fullName;
    }
  }

  let formattedTitle = '';
  if (title) {
    const t = title.toUpperCase().replace(/\./g, '');
    if (t === 'MR') formattedTitle = 'Mr.';
    else if (t === 'MRS') formattedTitle = 'Mrs.';
    else if (t === 'MS') formattedTitle = 'Ms.';
    else if (t === 'MISS') formattedTitle = 'Miss';
    else if (t === 'MSTR') formattedTitle = 'Mstr.';
    else formattedTitle = title;
  }

  const nameParts = [surname, formattedTitle, firstName].filter(Boolean).join(' ');
  return `${nameParts} (${typeLabel})`.trim();
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
  const primaryCarrierCode = session.segments[0]?.airline || saleMatch?.airline || 'BS';
  const airlineObj = AIRLINES.find((a) => a.code === primaryCarrierCode) || {
    code: primaryCarrierCode,
    numericCode: '779',
    name: 'US-BANGLA AIRLINES',
    country: 'BANGLADESH',
  };

  const brandInfo = AIRLINE_BRAND_INFO[airlineObj.code] || {
    bg: '#0B3B60',
    text: '#ffffff',
    logoUrl: `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${airlineObj.code}.svg`,
    name: airlineObj.name,
    slogan: 'FLY FAST FLY SAFE',
    sloganColor: '#E31B23',
    prefix: airlineObj.numericCode || '779',
  };

  const prefix = brandInfo.prefix || airlineObj.numericCode || '779';

  // 3. Dynamic Multi-Passenger Resolution
  const paxDetails: ItrPassengerDetail[] = [];
  const baseSerialSeed = 2412284512;

  // Pricing values: prioritize session pricing, then saleMatch, or realistic defaults
  const baseFarePerAdt =
    session.pricing?.baseFare ||
    (saleMatch?.grossFare ? Math.round(saleMatch.grossFare * 0.7668) : 35151);
  const taxPerAdt = session.pricing?.taxes || saleMatch?.tax || 10694;
  const totalPerAdt = baseFarePerAdt + taxPerAdt;

  const baseFarePerChd = Math.round(baseFarePerAdt * 0.75);
  const taxPerChd = Math.round(taxPerAdt * 0.85);
  const totalPerChd = baseFarePerChd + taxPerChd;

  const baseFarePerInf = Math.round(baseFarePerAdt * 0.1);
  const taxPerInf = Math.round(taxPerAdt * 0.3);
  const totalPerInf = baseFarePerInf + taxPerInf;

  if (session.passengers && session.passengers.length > 0) {
    session.passengers.forEach((p, idx) => {
      const surname = (p.surname || 'PASSENGER').toUpperCase();
      const firstName = (p.firstName || '').toUpperCase();
      const title = (p.title || (p.type === 'CHD' ? 'MSTR' : 'MR')).toUpperCase();
      const paxType = p.type || 'ADT';

      // 13-digit ticket number: 3-digit prefix + 10-digit serial number
      const serial = String(baseSerialSeed + idx);
      const rawTkt = p.ticketNumber || session.ticketNumbers?.[idx] || (saleMatch && idx === 0 ? saleMatch.ticketNumber : null);
      let tktNum = `${prefix}${serial}`;
      if (rawTkt) {
        const digits = rawTkt.replace(/[^0-9]/g, '');
        if (digits.length >= 13) {
          tktNum = digits.substring(0, 13);
        } else if (digits.length === 10) {
          tktNum = `${prefix}${digits}`;
        }
      }

      const fullName = firstName ? `${surname} / ${firstName} ${title}`.trim() : `${surname} ${title}`.trim();
      const displayName = formatPassengerDisplayName({ surname, firstName, title, paxType });

      // Calculate fare breakdown for this specific passenger
      const paxBase = paxType === 'CHD' ? baseFarePerChd : paxType === 'INF' ? baseFarePerInf : baseFarePerAdt;
      const paxTax = paxType === 'CHD' ? taxPerChd : paxType === 'INF' ? taxPerInf : taxPerAdt;
      const paxTotal = paxBase + paxTax;

      // Extract FOID (Passport) from SSR DOCS
      const paxRefStr = `P${idx + 1}`;
      const docsSsr = session.ssrs?.find(
        (s) => s.type === 'DOCS' && (s.paxRef === paxRefStr || s.text.includes(`/${paxRefStr}`))
      );
      let foid = '';
      if (docsSsr) {
        const match = docsSsr.text.match(/P-([A-Z]{2})-([A-Z0-9]+)/i);
        if (match) {
          foid = `PP ${match[1]} ${match[2]}`;
        } else {
          const parts = docsSsr.text.split('-');
          foid = `PP BD ${parts[3] || 'A04829104'}`;
        }
      } else {
        foid = `PP BD A0${String(4829104 + idx * 372).padStart(7, '0')}`;
      }

      // Extract Frequent Flyer (FFA / FQTV)
      const fqtvSsr = session.ssrs?.find(
        (s) =>
          (s.code === 'FQTV' || s.text.includes('FQTV') || s.text.includes('FFA')) &&
          (s.paxRef === paxRefStr || s.text.includes(`/${paxRefStr}`))
      );
      let frequentFlyer = 'NOT RECORDED';
      if (fqtvSsr) {
        const ffMatch = fqtvSsr.text.match(/([A-Z0-9]{2,}\s*[0-9]{5,})/i);
        frequentFlyer = ffMatch ? ffMatch[1].toUpperCase() : fqtvSsr.text.replace(/.*HK\d+[-]?/i, '').trim();
      }

      paxDetails.push({
        passengerIndex: idx + 1,
        surname,
        firstName,
        title,
        fullName,
        displayName,
        paxType,
        ticketNumber: tktNum,
        fare: paxBase,
        taxes: paxTax,
        totalAmount: paxTotal,
        couponStatus: 'OPEN FOR USE / CONFIRMED',
        foid,
        frequentFlyer,
      });
    });
  } else {
    // Realistic fallback passengers matching official reference layout
    const samplePassengers = [
      { surname: 'ARSHAD', firstName: 'MD', title: 'MR', type: 'ADT' },
      { surname: 'SHEPON', firstName: 'MD SAIYED RAHMAN', title: 'MR', type: 'ADT' },
    ];

    samplePassengers.forEach((p, idx) => {
      const serial = String(baseSerialSeed + idx);
      const tktNum = `${prefix}${serial}`;
      const fullName = `${p.surname} / ${p.firstName} ${p.title}`;
      const displayName = formatPassengerDisplayName({ surname: p.surname, firstName: p.firstName, title: p.title, paxType: p.type });

      paxDetails.push({
        passengerIndex: idx + 1,
        surname: p.surname,
        firstName: p.firstName,
        title: p.title,
        fullName,
        displayName,
        paxType: p.type,
        ticketNumber: tktNum,
        fare: baseFarePerAdt,
        taxes: taxPerAdt,
        totalAmount: totalPerAdt,
        couponStatus: 'OPEN FOR USE / CONFIRMED',
        foid: `PP BD A0${String(4829104 + idx * 372).padStart(7, '0')}`,
        frequentFlyer: 'NOT RECORDED',
      });
    });
  }

  const primaryTicket = paxDetails[0]?.ticketNumber || `${prefix}2412284512`;
  const allTicketNumbers = paxDetails.map((p) => p.ticketNumber);

  // 4. Resolve segments
  const now = new Date();
  const defaultDay = String(now.getDate()).padStart(2, '0');
  const defaultMonth = MONTHS[now.getMonth()] || 'SEP';
  const defaultDateToken = `${defaultDay}${defaultMonth}`;

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
        date: seg.date || defaultDateToken,
        origin: seg.origin,
        originName: origAirport ? `${origAirport.city} (${origAirport.code})` : seg.origin,
        originTerminal: origAirport?.terminal || (seg.origin === 'DAC' ? '1' : '2'),
        destination: seg.destination,
        destName: destAirport ? `${destAirport.city} (${destAirport.code})` : seg.destination,
        destTerminal: destAirport?.terminal || (seg.destination === 'DOH' || seg.destination === 'DXB' ? '3' : '1'),
        depTime: seg.depTime || '0835',
        arrTime: seg.arrTime || '1130',
        status: 'OK / HK1',
        nvb: seg.date || defaultDateToken,
        nva: seg.date || defaultDateToken,
        baggage: seg.bookingClass === 'J' || seg.bookingClass === 'C' ? '2PC (32KG)' : '2PC (23KG)',
        equip: seg.equip || 'Boeing 737-800',
      });
    });
  } else {
    // Default fallback flight segment matching the reference flight (BS 343 DAC -> DXB)
    segments.push({
      segNum: '01',
      airline: airlineObj.code,
      airlineName: airlineObj.name,
      flightNumber: '343',
      bookingClass: 'Y',
      date: defaultDateToken,
      origin: 'DAC',
      originName: 'Dhaka (DAC)',
      originTerminal: '1',
      destination: 'DXB',
      destName: 'Dubai (DXB)',
      destTerminal: '3',
      depTime: '0835',
      arrTime: '1130',
      status: 'OK / HK1',
      nvb: defaultDateToken,
      nva: defaultDateToken,
      baggage: '2PC (23KG)',
      equip: 'Boeing 737-800',
    });
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
      let cabinBag = 'Up to 7 kg allowance per passenger';

      if (isInfant) {
        checkedBag = '1 Piece (up to 10 KG) + 1 Collapsible Stroller';
        cabinBag = '1 Infant Care Bag (up to 5 KG)';
      } else if (isDomestic) {
        checkedBag = isBusiness ? '30 KG (2 Pieces max)' : '20 KG (1 Piece)';
        cabinBag = '1 Hand Carry (up to 7 KG)';
      } else if (isBusiness) {
        checkedBag = '2 Pieces (up to 32 KG each)';
        cabinBag = '2 Pieces (up to 14 KG total)';
      }

      baggageAllowances.push({
        paxName: pax.displayName || pax.fullName,
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

  const grandTotalFare =
    adtCount * totalPerAdt +
    chdCount * totalPerChd +
    infCount * totalPerInf;

  const currency = 'BDT';
  const fop = session.formOfPayment || saleMatch?.formOfPayment || 'CASH / INVOICE';
  const pnrLocator = session.pnrLocator || saleMatch?.pnrLocator || '0A4TBG';

  // Live booking date in GDS standard format
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dayStr = String(now.getDate()).padStart(2, '0');
  const monthStr = months[now.getMonth()];
  const issueDate = `${dayStr}${monthStr}2026`;
  const formattedIssueDate = `${now.getDate()} ${monthStr.substring(0, 1)}${monthStr.substring(1).toLowerCase()} 2026`;

  // Route & Journey representation
  const origSeg = segments[0];
  const destSeg = segments[segments.length - 1];
  const origName = origSeg?.originName || 'Dhaka (DAC)';
  const destName = destSeg?.destName || 'Dubai (DXB)';
  const isRoundTrip = segments.length > 1 && destSeg.destination === origSeg.origin;
  const routeJourney = `${origName} ✈ ${destName}`;
  const journeySubtitle = `${isRoundTrip ? 'Round Trip' : 'One Way'} | ${adtCount} Adult${adtCount > 1 ? 's' : ''}${chdCount > 0 ? `, ${chdCount} Child` : ''}`;

  return {
    ticketNumber: primaryTicket,
    ticketNumbers: allTicketNumbers,
    pnrLocator,
    airlineLocator: `${airlineObj.code}/8N4KQ9`,
    passengerName: paxDetails[0]?.fullName || 'ARSHAD / MD MR',
    paxType: paxDetails[0]?.paxType || 'ADT',
    passengers: paxDetails,
    issuingAirline: airlineObj.code,
    issuingAirlineName: brandInfo.name,
    issuingAirlineNumeric: prefix,
    airlineSlogan: brandInfo.slogan,
    airlineSloganColor: brandInfo.sloganColor,
    airlineLogoUrl: brandInfo.logoUrl,
    airlineBrandColor: brandInfo.bg,
    issuingAgent: 'SHOHOJ TRAVELS / DAC360',
    officeId: session.officeId || saleMatch?.officeId || 'DAC360',
    iataNumber: '21368575',
    issueDate,
    formattedIssueDate,
    routeJourney,
    journeySubtitle,
    segments,
    baggageAllowances,
    baseFare: baseFarePerAdt,
    tax: taxPerAdt,
    totalFare: totalPerAdt,
    grandTotalFare,
    currency,
    formOfPayment: fop,
    fareBasis: session.pricing?.fareBasis || 'YLRBD1',
    fareCalculation: `DAC ${airlineObj.code} X/DXB ${airlineObj.code} NUC702.82END ROE105.613XT2000BD7500TR5000GB`,
    endorsements: `NON-REFUNDABLE / DATE CHANGE PENALTY APPLIES / VALID ON ${airlineObj.code} ONLY`,
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
    (p) => `  ${String(p.passengerIndex).padStart(2, ' ')}. ${(p.displayName || p.fullName).padEnd(36, ' ')} TKT: ${p.ticketNumber}  FARE: ৳ ${p.fare?.toLocaleString() || '35,151'}  TAX: ৳ ${p.taxes?.toLocaleString() || '10,694'}  TOTAL: ৳ ${p.totalAmount?.toLocaleString() || '45,845'}`
  );

  const segLines: string[] = [];
  data.segments.forEach((s) => {
    segLines.push(
      `${s.segNum}  ${s.airline.padEnd(2, ' ')} ${s.flightNumber.padEnd(4, ' ')} ${s.bookingClass}  ${s.date.padEnd(5, ' ')}  ${s.origin} - ${s.destination}      ${s.depTime}   ${s.status} ${s.nvb} ${s.nva} ${s.baggage}`
    );
    segLines.push(
      `             DEP: ${formatGdsTime(s.depTime)} / ${s.originName} ${s.originTerminal ? 'TERM ' + s.originTerminal : ''}`
    );
    segLines.push(
      `             ARR: ${formatGdsTime(s.arrTime)} / ${s.destName} ${s.destTerminal ? 'TERM ' + s.destTerminal : ''}`
    );
  });

  return [
    `=============================================================================`,
    `E-TICKET / BOOKING CONFIRMATION & OFFICIAL PASSENGER ITINERARY`,
    `OPERATING CARRIER: ${data.issuingAirlineName} (${data.issuingAirline})`,
    `MOTTO / SLOGAN   : ${data.airlineSlogan || 'FLY FAST FLY SAFE'}`,
    `PNR REFERENCE    : ${data.pnrLocator} [ISSUED]    DATE: ${data.formattedIssueDate || data.issueDate}`,
    `ROUTE & JOURNEY  : ${data.routeJourney} (${data.journeySubtitle})`,
    `TOTAL AMOUNT     : ৳ ${data.grandTotalFare.toLocaleString()}`,
    `=============================================================================`,
    `PASSENGER & TICKET DETAILS:`,
    ...paxLines,
    `=============================================================================`,
    `FLIGHT INFORMATION:`,
    ...segLines,
    `=============================================================================`,
    `BAGGAGE & FARE RULES:`,
    `  • Hand Baggage   : Up to 7 kg allowance per passenger.`,
    `  • Check-in Baggage: Standard allowance as per airline ticket fare rule (e.g. 2PC / 30KG).`,
    `  • Identification : Passport valid for at least 6 months is required.`,
    `=============================================================================`,
    `FARE BREAKDOWN:`,
    `  Base Fare (${data.passengers.length} Pax) : ৳ ${(data.baseFare * data.passengers.length).toLocaleString()}`,
    `  Total Taxes & Fees   : ৳ ${(data.tax * data.passengers.length).toLocaleString()}`,
    `  GRAND TOTAL AMOUNT   : ৳ ${data.grandTotalFare.toLocaleString()}`,
    `=============================================================================`,
    `IMPORTANT TRAVEL INSTRUCTIONS:`,
    `  • Please reach the airport at least 3 hours prior to international departure.`,
    `  • Carry a printed or digital copy of this E-ticket along with your passport.`,
    `  • Boarding gate closes 20 minutes before departure time.`,
    `=============================================================================`,
  ].join('\n');
};

export const generateItrHtmlDocument = (data: ItrReceiptData): string => {
  const paxRows = data.passengers
    .map(
      (p) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <td style="padding: 10px 12px; font-weight: 700; color: #1e3a8a; text-align: center;">${p.passengerIndex}</td>
        <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">${p.displayName || p.fullName}</td>
        <td style="padding: 10px 12px; font-family: 'Courier New', Courier, monospace; font-weight: 700; color: #0b3b60; font-size: 13.5px;">${p.ticketNumber}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #334155;">৳ ${(p.fare || data.baseFare).toLocaleString()}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #334155;">৳ ${(p.taxes || data.tax).toLocaleString()}</td>
        <td style="padding: 10px 12px; font-weight: 700; color: #0b3b60;">৳ ${(p.totalAmount || data.totalFare).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const flightCards = data.segments
    .map(
      (seg, idx) => `
      <div style="border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; margin-bottom: 16px;">
        <div style="display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; gap: 16px; padding: 18px 20px; background: #ffffff;">
          <!-- Origin Box -->
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Departure</div>
            <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 2px;">${seg.originName}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 1px;">Terminal ${seg.originTerminal || '1'}</div>
            <div style="font-size: 22px; font-weight: 900; color: #0b3b60; margin-top: 6px;">${formatGdsTime(seg.depTime)}</div>
            <div style="font-size: 12px; font-weight: 600; color: #475569; margin-top: 2px;">${formatGdsDatePretty(seg.date)}</div>
          </div>

          <!-- Middle Flight Badge & Arrow -->
          <div style="display: flex; flex-col; align-items: center; justify-content: center; text-align: center; border-left: 1px dashed #e2e8f0; border-right: 1px dashed #e2e8f0; padding: 0 10px;">
            <div style="background: #e0f2fe; color: #0369a1; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 4px; display: inline-block;">
              Flight ${seg.airline} ${seg.flightNumber}
            </div>
            <div style="font-size: 24px; color: #0b3b60; margin: 6px 0;">➔</div>
            <div style="font-size: 11px; font-weight: 700; color: #047857; background: #dcfce7; padding: 2px 8px; border-radius: 4px;">
              ${data.segments.length > 1 ? `Leg ${idx + 1} of ${data.segments.length}` : 'Direct Flight'}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${seg.equip || 'Boeing 737-800'}</div>
          </div>

          <!-- Destination Box -->
          <div style="text-align: right;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Arrival</div>
            <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 2px;">${seg.destName}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 1px;">Terminal ${seg.destTerminal || '3'}</div>
            <div style="font-size: 22px; font-weight: 900; color: #0b3b60; margin-top: 6px;">${formatGdsTime(seg.arrTime)}</div>
            <div style="font-size: 12px; font-weight: 600; color: #475569; margin-top: 2px;">${formatGdsDatePretty(seg.date)}</div>
          </div>
        </div>

        <!-- Segment Footer Strip -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 8px 18px; font-size: 11.5px; color: #334155; display: flex; justify-content: space-between; flex-wrap: wrap;">
          <span><strong>Operating Carrier:</strong> ${data.issuingAirlineName}</span>
          <span><strong>Flight No:</strong> ${seg.airline} ${seg.flightNumber}</span>
          <span><strong>Class:</strong> ${seg.bookingClass === 'J' ? 'Business (J)' : 'Economy (Y)'}</span>
          <span style="color: #047857; font-weight: 700;">● Confirmed &amp; Issued</span>
        </div>
      </div>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>E-Ticket / Booking Confirmation - ${data.ticketNumber}</title>
  <style>
    @media print {
      body {
        margin: 0 !important;
        padding: 6mm !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .ticket-container {
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
        padding: 0 !important;
      }
      @page {
        margin: 8mm;
        size: A4 portrait;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #1e293b;
      margin: 0;
      padding: 24px;
      line-height: 1.4;
    }
    .ticket-container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      padding: 32px 36px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0b3b60;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .airline-brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .airline-logo {
      height: 48px;
      max-width: 160px;
      object-fit: contain;
    }
    .airline-name {
      font-size: 22px;
      font-weight: 900;
      color: #0b3b60;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }
    .airline-slogan {
      font-size: 11px;
      font-weight: 800;
      color: ${data.airlineSloganColor || '#E31B23'};
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .header-right {
      text-align: right;
    }
    .doc-title {
      font-size: 15px;
      font-weight: 900;
      color: #0b3b60;
      letter-spacing: 0.5px;
    }
    .doc-date {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      margin-top: 3px;
    }
    .summary-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      background: #f0f7ff;
      border: 1px solid #bcd0e8;
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 22px;
    }
    .metric-box {
      border-right: 1px solid #cbd5e1;
      padding-right: 12px;
    }
    .metric-box:last-child {
      border-right: none;
      padding-right: 0;
    }
    .metric-label {
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-val {
      font-size: 16px;
      font-weight: 900;
      color: #0b3b60;
      margin-top: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge-issued {
      font-size: 10px;
      font-weight: 800;
      background: #dcfce7;
      color: #166534;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #86efac;
    }
    .section-banner {
      background: #0b3b60;
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 7px 14px;
      border-radius: 4px 4px 0 0;
      margin-top: 20px;
      margin-bottom: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
      border-top: none;
      border-radius: 0 0 6px 6px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    th {
      background: #f8fafc;
      color: #475569;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 9px 12px;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
    }
    .footer-split {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 16px;
      margin-top: 8px;
      margin-bottom: 20px;
    }
    .rules-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 14px 16px;
      font-size: 12px;
    }
    .rules-title {
      font-size: 11.5px;
      font-weight: 800;
      color: #0b3b60;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .rule-item {
      margin-bottom: 6px;
      color: #334155;
      line-height: 1.4;
    }
    .fare-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .fare-line {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      color: #475569;
      margin-bottom: 6px;
    }
    .fare-line strong {
      color: #0f172a;
    }
    .grand-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 2px solid #0b3b60;
      padding-top: 8px;
      margin-top: 6px;
    }
    .grand-total-label {
      font-size: 13px;
      font-weight: 800;
      color: #0b3b60;
    }
    .grand-total-val {
      font-size: 22px;
      font-weight: 900;
      color: #0b3b60;
    }
    .instructions-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #78350f;
      border-radius: 6px;
      padding: 14px 18px;
      font-size: 12px;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .instructions-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      color: #92400e;
    }
    .btn-bar {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      max-width: 860px;
      margin: 0 auto 16px auto;
    }
    .btn-action {
      background: #0b3b60;
      color: #ffffff;
      border: none;
      padding: 9px 18px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn-action" onclick="window.print()">🖨️ Print Ticket / Save PDF</button>
    <button class="btn-action" style="background: #475569;" onclick="window.close()">✕ Close</button>
  </div>

  <div class="ticket-container" id="itr-printable-receipt">
    <!-- Header & Top Banner -->
    <div class="header-bar">
      <div class="airline-brand">
        <img 
          src="${data.airlineLogoUrl}" 
          alt="${data.issuingAirlineName}" 
          class="airline-logo"
          onerror="this.style.display='none'"
        />
        <div>
          <div class="airline-name">${data.issuingAirlineName}</div>
          <div class="airline-slogan">${data.airlineSlogan || 'FLY FAST FLY SAFE'}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="doc-title">E-TICKET / BOOKING CONFIRMATION</div>
        <div class="doc-date">Date: ${data.formattedIssueDate || data.issueDate}</div>
      </div>
    </div>

    <!-- Top Summary Metrics Bar -->
    <div class="summary-metrics">
      <div class="metric-box">
        <div class="metric-label">Booking Reference (PNR)</div>
        <div class="metric-val">
          <span>${data.pnrLocator}</span>
          <span class="badge-issued">[ISSUED]</span>
        </div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Route &amp; Journey</div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 3px;">
          ${data.routeJourney}
        </div>
        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 1px;">
          ${data.journeySubtitle}
        </div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Booking Total Amount</div>
        <div style="font-size: 20px; font-weight: 900; color: #0b3b60; margin-top: 2px;">
          ৳ ${data.grandTotalFare.toLocaleString()}
        </div>
      </div>
    </div>

    <!-- Flight Information Section -->
    <div class="section-banner">✈ Flight Information</div>
    ${flightCards}

    <!-- Passenger & Ticket Details Table -->
    <div class="section-banner">👤 Passenger &amp; Ticket Details</div>
    <table>
      <thead>
        <tr>
          <th style="width: 35px; text-align: center;">#</th>
          <th>Passenger Name</th>
          <th>Ticket Number</th>
          <th>Fare</th>
          <th>Taxes</th>
          <th>Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${paxRows}
      </tbody>
    </table>

    <!-- Baggage, Fare Rules & Total Breakdown -->
    <div class="footer-split">
      <!-- Left Box -->
      <div class="rules-card">
        <div class="rules-title">Baggage &amp; Fare Rules</div>
        <div class="rule-item"><strong>• Hand Baggage:</strong> Up to 7 kg allowance per passenger.</div>
        <div class="rule-item"><strong>• Check-in Baggage:</strong> Standard allowance as per airline ticket fare rule (e.g. 2PC / 30KG).</div>
        <div class="rule-item"><strong>• Identification:</strong> Passport valid for at least 6 months is required.</div>
        <div class="rule-item"><strong>• Changes &amp; Refunds:</strong> Permitted subject to airline fare conditions and applicable penalties.</div>
      </div>

      <!-- Right Box -->
      <div class="fare-card">
        <div>
          <div class="fare-line">
            <span>Base Fare (${data.passengers.length} Passenger${data.passengers.length > 1 ? 's' : ''}):</span>
            <strong>৳ ${(data.baseFare * data.passengers.length).toLocaleString()}</strong>
          </div>
          <div class="fare-line">
            <span>Total Taxes &amp; Surcharges:</span>
            <strong>৳ ${(data.tax * data.passengers.length).toLocaleString()}</strong>
          </div>
        </div>
        <div class="grand-total">
          <span class="grand-total-label">Grand Total:</span>
          <span class="grand-total-val">৳ ${data.grandTotalFare.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Important Travel Instructions -->
    <div class="instructions-box">
      <div class="instructions-title">⚠ Important Travel Instructions</div>
      <div>• Please reach the airport at least 3 hours prior to international departure (or 1.5 hours for domestic).</div>
      <div>• Carry a printed or digital copy of this E-ticket along with your original passport and visa.</div>
      <div>• Boarding gate closes 20 minutes before departure time.</div>
    </div>

    <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
      This is a computer-generated official electronic booking confirmation and does not require a physical signature.
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
  link.download = `ETicket_${data.pnrLocator}_${data.ticketNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printItrDocument = (data: ItrReceiptData): void => {
  const html = generateItrHtmlDocument(data);

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

declare global {
  interface Window {
    html2pdf?: any;
  }
}

export const downloadItrPdfFile = async (
  data: ItrReceiptData,
  sourceElement?: HTMLElement | null
): Promise<void> => {
  const pnr = data.pnrLocator || 'TKT';
  const filename = `E-Ticket_${pnr}_${Date.now()}.pdf`;

  // Target the inner ticket container element (the clean white ticket confirmation card)
  let elementToCapture = sourceElement || document.getElementById('itr-printable-receipt');
  let tempContainer: HTMLElement | null = null;

  if (!elementToCapture) {
    tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '840px';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.zIndex = '-9999';
    tempContainer.innerHTML = generateItrHtmlDocument(data);
    document.body.appendChild(tempContainer);
    elementToCapture = (tempContainer.querySelector('#itr-printable-receipt') as HTMLElement) || tempContainer;
  }

  // Exact html2pdf options specified by user:
  const opt = {
    margin: [4, 4, 4, 4],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  try {
    // If html2pdf is available globally on window, use it
    if (typeof window !== 'undefined' && !window.html2pdf) {
      // Load CDN dynamically if not yet attached
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load html2pdf.js bundle'));
        document.head.appendChild(script);
      });
    }

    if (typeof window !== 'undefined' && window.html2pdf) {
      await window.html2pdf().set(opt).from(elementToCapture).save();
    } else {
      // Direct jsPDF fallback without triggering print
      const canvas = await html2canvas(elementToCapture, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 12;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 6;

      pdf.addImage(imgData, 'JPEG', 6, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 12;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 6;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 6, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 12;
      }

      pdf.save(filename);
    }
  } catch (err) {
    console.error('Direct PDF export error:', err);
    // STRICT: DO NOT call window.print() or printItrDocument()
  } finally {
    if (tempContainer && document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
};
