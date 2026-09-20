import { BookedSegment, Passenger, PnrSession, SsrItem, TicketSaleRecord, ItrReceiptData } from '../types';
import { handleEncodeDecodeCommand } from './encodeDecode';
import {
  generateAvailability,
  generateLowestFareSearch,
  generateTimetable,
  generateFareDisplay,
  generateFareNotes,
  convertCurrency,
  parseAnInput,
  calculateSectorFare,
} from './flightScheduleGenerator';
import { AIRLINES } from '../data/gdsDatabase';
import { buildItrReceiptData, formatItrTerminalOutput } from './itrReceipt';

export interface CommandResult {
  output: string;
  updatedSession: PnrSession;
  clearTerminal?: boolean;
  navAction?: 'down' | 'up' | 'top' | 'bottom';
  triggerPrint?: boolean;
  isItr?: boolean;
  isTtp?: boolean;
  emailSent?: {
    type: 'receipt' | 'itinerary';
    email: string;
    message: string;
  };
  itrData?: ItrReceiptData;
}

// Global in-memory ticket sales database for TJQ, TWD, and TRDC
export const ticketSalesDatabase: TicketSaleRecord[] = [
  {
    ticketNumber: '157-2489102941',
    pnrLocator: 'X7K9LP',
    passengerName: 'HOSSAIN/ABUL MR',
    airline: 'QR',
    issueDate: '20MAY26',
    officeId: 'DAC360',
    grossFare: 85000,
    tax: 14500,
    commissionPct: 7,
    commissionAmount: 5950,
    netPayable: 93550,
    formOfPayment: 'IN VAGT*SHOHOJ',
    status: 'OK',
    itinerarySummary: 'DAC DOH LHR',
  },
];

export const createInitialSession = (officeId: string = 'DAC360', dutyCode: string = 'Student'): PnrSession => ({
  pnrLocator: null,
  officeId: officeId || 'DAC360',
  agentDuty: dutyCode || 'Student',
  passengers: [],
  segments: [],
  contacts: [],
  ticketingArrangement: null,
  receivedFrom: null,
  ssrs: [],
  isTicketed: false,
  ticketNumbers: [],
  pricing: undefined,
  lastAvailability: undefined,
  lastFareSearch: undefined,
});

// Helper to generate a 6-character alpha-numeric PNR locator
export const generatePnrLocator = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
};

// Helper to format standard PNR display (matches authentic Amadeus RLR layout)
export const formatPnrDisplay = (session: PnrSession): string => {
  if (session.segments.length === 0 && session.passengers.length === 0 && session.contacts.length === 0) {
    return 'NO PNR IN WORK AREA';
  }

  const pnr = session.pnrLocator || 'WORK AREA';
  const now = new Date();
  const dateStr = '20MAY26';
  const timeStr = '0830Z';

  const lines: string[] = [];
  lines.push('--- RLR ---');
  lines.push(`RP/${session.officeId}/${session.officeId}            AA/SU  ${dateStr}/${timeStr}   ${pnr}`);

  let lineIndex = 1;

  // 1. Passengers
  session.passengers.forEach((p) => {
    let paxLine = ` ${lineIndex++}.${p.surname}/${p.firstName} ${p.title}`;
    if (p.type === 'CHD' && p.dob) {
      paxLine += `(CHD/${p.dob})`;
    } else if (p.type === 'INF' && p.dob) {
      paxLine += `(INF ${p.firstName}/${p.title}/${p.dob})`;
    }
    lines.push(paxLine);
  });

  // 2. Segments
  session.segments.forEach((s) => {
    const flightPad = `${s.airline} ${s.flightNumber}`.padEnd(8, ' ');
    lines.push(` ${lineIndex++}  ${flightPad} ${s.bookingClass} ${s.date} 3 ${s.origin}${s.destination} ${s.status}  ${s.depTime} ${s.arrTime}   *1A/E*`);
  });

  // 3. SSRs (Special Service Requests)
  if (session.ssrs && session.ssrs.length > 0) {
    session.ssrs.forEach((ssr) => {
      const air = ssr.airline || (session.segments[0] ? session.segments[0].airline : '1A');
      const paxRef = ssr.paxRef ? `/${ssr.paxRef}` : '';
      lines.push(` ${lineIndex++} SSR ${ssr.code} ${air} ${ssr.status} ${ssr.text}${paxRef}`);
    });
  }

  // 4. Contacts (AP)
  session.contacts.forEach((c) => {
    lines.push(` ${lineIndex++} AP ${c}`);
  });

  // 5. Ticketing (TK)
  if (session.ticketingArrangement) {
    lines.push(` ${lineIndex++} TK ${session.ticketingArrangement}/${session.officeId}`);
  }

  // 6. Commission (FM)
  if (session.commission) {
    lines.push(` ${lineIndex++} FM *${session.commission}`);
  }

  // 7. Form of Payment (FP)
  if (session.formOfPayment) {
    lines.push(` ${lineIndex++} FP ${session.formOfPayment}`);
  }

  // 8. Shared / Bridged Offices (ES)
  if (session.sharedWithOffices && session.sharedWithOffices.length > 0) {
    session.sharedWithOffices.forEach((off) => {
      lines.push(` ${lineIndex++} ES ${off}`);
    });
  }

  // 9. Ticket Numbers if issued (FA PAX)
  if (session.isTicketed && session.ticketNumbers.length > 0) {
    session.ticketNumbers.forEach((tkt, idx) => {
      const pax = session.passengers[idx];
      const paxName = pax ? `${pax.surname}/${pax.firstName}` : 'PAX';
      const tot = session.pricing ? session.pricing.total : 99500;
      const air = session.segments[0] ? session.segments[0].airline : 'QR';
      const isVoid = session.voidTickets?.includes(tkt);
      lines.push(` ${lineIndex++} FA PAX ${tkt}/ET${air}/BDT${tot}/${dateStr}/${session.officeId}/21368575/P${idx + 1}${isVoid ? '/VOID' : ''}`);
    });
  }

  // 10. Received From (RF)
  if (session.receivedFrom) {
    lines.push(`\nRECEIVED FROM - ${session.receivedFrom}`);
  }

  return lines.join('\n');
};

// Semicolon-chained command processor
export const executeGdsCommand = (
  rawInput: string,
  currentSession: PnrSession,
  savedPnrs: Map<string, PnrSession>
): CommandResult => {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { output: '', updatedSession: currentSession };
  }

  // Support chaining: e.g. RFKARIM;ER or RF KARIM;ET or TKOK;RF KARIM;ER
  if (trimmed.includes(';')) {
    const parts = trimmed.split(';').map((p) => p.trim()).filter(Boolean);
    let activeSession = currentSession;
    const outputs: string[] = [];
    let triggerPrint = false;
    let emailSent: CommandResult['emailSent'] = undefined;
    let itrData: CommandResult['itrData'] = undefined;

    for (const part of parts) {
      const res = executeSingleGdsCommand(part, activeSession, savedPnrs);
      activeSession = res.updatedSession;
      if (res.output) outputs.push(res.output);
      if (res.triggerPrint) triggerPrint = true;
      if (res.emailSent) emailSent = res.emailSent;
      if (res.itrData) itrData = res.itrData;
    }

    return {
      output: outputs.join('\n\n'),
      updatedSession: activeSession,
      triggerPrint,
      emailSent,
      itrData,
    };
  }

  return executeSingleGdsCommand(trimmed, currentSession, savedPnrs);
};

const executeSingleGdsCommand = (
  rawInput: string,
  currentSession: PnrSession,
  savedPnrs: Map<string, PnrSession>
): CommandResult => {
  const input = rawInput.trim();
  const upper = input.toUpperCase();

  // Navigation shortcuts: MD, MU, MT, MB
  if (upper === 'MD') {
    return {
      output: 'SCROLLED DOWN',
      updatedSession: currentSession,
      navAction: 'down',
    };
  }
  if (upper === 'MU') {
    return {
      output: 'SCROLLED UP',
      updatedSession: currentSession,
      navAction: 'up',
    };
  }
  if (upper === 'MT') {
    return {
      output: 'TOP OF SCREEN',
      updatedSession: currentSession,
      navAction: 'top',
    };
  }
  if (upper === 'MB') {
    return {
      output: 'BOTTOM OF SCREEN',
      updatedSession: currentSession,
      navAction: 'bottom',
    };
  }

  // Encode & Decode: DAN, DAC, DNA, DC, DNE
  // Notice: Distinguish between DAC decode (`DACDAC`, `DACLHR`, `DAC DAC`) and Availability AN
  if (
    upper.startsWith('DAN') ||
    upper.startsWith('DNA') ||
    upper.startsWith('DC') ||
    upper.startsWith('DNE') ||
    (upper.startsWith('DAC') && !upper.startsWith('DACL') && !upper.startsWith('DACD') && !upper.startsWith('DACE')) ||
    /^DAC\s*[A-Z]{3}$/.test(upper) ||
    /^DAC[A-Z]{3}$/.test(upper)
  ) {
    const encodeRes = handleEncodeDecodeCommand(input);
    if (encodeRes.matched) {
      return {
        output: encodeRes.output,
        updatedSession: currentSession,
      };
    }
  }

  // 1. Availability: AN (e.g. AN20MAYDACLHR/AQR, AN15OCTDACDXB, AN25DECDACJFK/AEK, AN25OCTDACJED/ASV)
  if (upper.startsWith('AN')) {
    const { orig, dest, date, airlineFilter } = parseAnInput(input);
    const { options, displayText } = generateAvailability(date, orig, dest, airlineFilter);

    const updated = {
      ...currentSession,
      lastAvailability: options,
    };

    return {
      output: displayText,
      updatedSession: updated,
    };
  }

  // 1b. Timetable Search: TN (e.g. TN20SEPDACSIN/ABG, TNDACCCU/ABG, TNDACCCU, TN20MAYDACLHR)
  if (upper.startsWith('TN')) {
    return {
      output: generateTimetable(input),
      updatedSession: currentSession,
    };
  }

  // 1c. Fare Display: FQD (e.g. FQDDACJFK/AEK/IO/D15MAY22, FQDDACJFK/AEK/IR/D15MAY22/KC)
  if (upper.startsWith('FQD')) {
    return {
      output: generateFareDisplay(input),
      updatedSession: currentSession,
    };
  }

  // 1d. Fare Notes & Penalties: FQN (e.g. FQN01, FQN1, FQN1*PE)
  if (upper.startsWith('FQN')) {
    return {
      output: generateFareNotes(input),
      updatedSession: currentSession,
    };
  }

  // 1e. Currency Conversion: FQC (e.g. FQC100USD/BDT, FQC50000BDT/USD)
  if (upper.startsWith('FQC')) {
    return {
      output: convertCurrency(input),
      updatedSession: currentSession,
    };
  }

  // 1f. Display Transitional Stored Ticket (TST): TQT
  if (upper === 'TQT') {
    if (!currentSession.pricing) {
      return {
        output: 'NO STORED TST IN WORK AREA. RUN FXP FIRST.',
        updatedSession: currentSession,
      };
    }
    const p = currentSession.pricing;
    const firstPax = currentSession.passengers[0]
      ? `${currentSession.passengers[0].surname}/${currentSession.passengers[0].firstName} ${currentSession.passengers[0].title}`
      : 'HOSSAIN/ABUL MR';
    const firstSeg = currentSession.segments[0];
    const air = firstSeg?.airline || 'QR';
    const orig = firstSeg?.origin || 'DAC';
    const dest = currentSession.segments[currentSession.segments.length - 1]?.destination || 'LHR';

    const output = [
      `--- TST DISPLAY 00001 ---`,
      `PAX: 1.${firstPax}`,
      `FARE: BDT ${p.baseFare.toLocaleString()}`,
      `TAX : BDT 2000BD BDT 7500QA BDT 8000GB BDT 5000XT`,
      `TOTAL: BDT ${p.total.toLocaleString()}`,
      `FARE CALC: ${orig} ${air} ${dest} 804.82 NUC END ROE 119.50`,
      `NVB: 20MAY26 NVA: 20MAY27 BG: 2PC`,
      `STATUS: VALIDATED FOR ISSUANCE (TTP)`,
    ].join('\n');

    return {
      output,
      updatedSession: currentSession,
    };
  }

  // 1g. Delete Stored TST: TTE
  if (upper === 'TTE') {
    return {
      output: 'TST 00001 DELETED',
      updatedSession: {
        ...currentSession,
        pricing: undefined,
      },
    };
  }

  // 1h. Lowest Available Fare (Quote only, no rebook): FXR
  if (upper === 'FXR') {
    if (currentSession.segments.length === 0) {
      return {
        output: 'NO ITINERARY TO PRICE. SELL SEGMENTS (SS OR FXZ) FIRST.',
        updatedSession: currentSession,
      };
    }
    const currentClass = currentSession.segments[0]?.bookingClass || 'Y';
    const lowestClass = 'T';
    const currentFare = currentClass === 'J' ? 280000 : (currentClass === 'Y' ? 120000 : 95000);
    const lowestFare = 78000;
    const savings = Math.max(0, currentFare - lowestFare);

    const output = [
      `FXR - LOWEST AVAILABLE FARE QUOTE (NO REBOOK):`,
      `CURRENT BOOKED : CLASS ${currentClass} (BDT ${currentFare.toLocaleString()})`,
      `BEST BUY OPTION: CLASS ${lowestClass} (BDT ${lowestFare.toLocaleString()})`,
      `POTENTIAL SAVINGS: BDT ${savings.toLocaleString()} PER PASSENGER`,
      `-----------------------------------------------------------------------------`,
      `>>> TO REBOOK TO BEST BUY CLASS USE FXB <<<`,
    ].join('\n');

    return {
      output,
      updatedSession: currentSession,
    };
  }

  // 1i. Lowest Available Fare and Rebook: FXB
  if (upper === 'FXB') {
    if (currentSession.segments.length === 0) {
      return {
        output: 'NO ITINERARY TO REBOOK. SELL SEGMENTS (SS OR FXZ) FIRST.',
        updatedSession: currentSession,
      };
    }
    const lowestClass = 'T';
    const rebookedSegments = currentSession.segments.map((s) => ({
      ...s,
      bookingClass: lowestClass,
    }));

    const adtCount = currentSession.passengers.filter((p) => !p.type || p.type === 'ADT').length || 1;
    const lowestBase = 65000 * adtCount;
    const lowestTax = 13000 * adtCount;
    const lowestTotal = lowestBase + lowestTax;

    const newPricing = {
      baseFare: lowestBase,
      taxes: lowestTax,
      total: lowestTotal,
      currency: 'BDT',
      fareBasis: `${lowestClass}LRBD1`,
      paxBreakdown: `${adtCount} ADT`,
    };

    const output = [
      `FXB - BEST BUY REBOOK EXECUTED:`,
      `ALL SEGMENTS REBOOKED TO LOWEST AVAILABLE CLASS ${lowestClass}`,
      `TST 00001 CREATED: BDT ${lowestTotal.toLocaleString()} (BASE: BDT ${lowestBase.toLocaleString()} + TAX: BDT ${lowestTax.toLocaleString()})`,
      `FARE BASIS: ${newPricing.fareBasis}    BG: 2PC`,
    ].join('\n');

    return {
      output,
      updatedSession: {
        ...currentSession,
        segments: rebookedSegments,
        pricing: newPricing,
      },
    };
  }

  // 2. Lowest Fare Search: FXD (Best Buy Search)
  // Formats:
  // FXDDAC/D20NOVJFK, FXDDAC/D20NOVJFK//AQR
  // FXDDAC/D20NOVJFK/D19DECDAC, FXDDAC/D20NOVJFK/D19DECDAC//AEK
  // FXDDAC/D20NOVJFK//KC, FXDDAC/D20NOVJFK//PAX/2/RCH/INF/1
  if (upper.startsWith('FXD')) {
    const { options, displayText } = generateLowestFareSearch(upper);

    const updated: PnrSession = {
      ...currentSession,
      lastFareSearch: options,
    };

    return {
      output: displayText,
      updatedSession: updated,
    };
  }

  // 3. Book directly from Lowest Fare Search: FXZ<OPTION_NO> (e.g. FXZ1, FXZ2, FXZ3)
  if (upper.startsWith('FXZ')) {
    const optNum = parseInt(upper.substring(3).trim(), 10) || 1;
    const fareOptions = currentSession.lastFareSearch;

    if (!fareOptions || fareOptions.length === 0) {
      return {
        output: 'NO FARE SEARCH AVAILABLE. RUN FXD COMMAND FIRST (e.g. FXDDAC/D20NOVJFK).',
        updatedSession: currentSession,
      };
    }

    const selectedOption = fareOptions.find((o) => o.optionNumber === optNum) || fareOptions[0];

    // Convert fare search flights into booked segments
    const paxStatus = `HK${(selectedOption.paxCount?.adt || 1) + (selectedOption.paxCount?.chd || 0)}`;
    const newSegments: BookedSegment[] = selectedOption.flights.map((flt, idx) => ({
      segmentNumber: idx + 1,
      airline: flt.airline,
      flightNumber: flt.flightNumber,
      bookingClass: flt.bookingClass,
      date: flt.date,
      origin: flt.origin,
      destination: flt.destination,
      status: paxStatus,
      depTime: flt.depTime,
      arrTime: flt.arrTime,
      equip: flt.equip,
    }));

    const updatedPricing = {
      baseFare: selectedOption.baseFare,
      taxes: selectedOption.taxes,
      total: selectedOption.totalFare,
      currency: selectedOption.currency,
      fareBasis: selectedOption.fareBasis,
      paxBreakdown: `${selectedOption.paxCount?.adt || 1} ADT${selectedOption.paxCount?.chd ? `, ${selectedOption.paxCount.chd} CHD` : ''}${selectedOption.paxCount?.inf ? `, ${selectedOption.paxCount.inf} INF` : ''}`,
    };

    const updated: PnrSession = {
      ...currentSession,
      segments: newSegments,
      pricing: updatedPricing,
    };

    const confirmationLines: string[] = [];
    confirmationLines.push(`BOOKED OPTION ${String(selectedOption.optionNumber).padStart(2, '0')} (${selectedOption.airline})`);
    newSegments.forEach((s) => {
      confirmationLines.push(` ${s.segmentNumber}  ${s.airline} ${s.flightNumber.padEnd(4, ' ')} ${s.bookingClass} ${s.date} ${s.origin}${s.destination} ${s.status} ${s.depTime} ${s.arrTime}  *1A/E*`);
    });
    confirmationLines.push(`TST STORED: ${updatedPricing.currency} ${updatedPricing.total.toLocaleString()} (${updatedPricing.fareBasis})`);

    return {
      output: confirmationLines.join('\n'),
      updatedSession: updated,
    };
  }

  // 4. Flight Planned Info: DO (e.g. DO1, DO 1, DO)
  if (upper.startsWith('DO')) {
    const output = [
      `*A PLANNED FLIGHT INFO*                 QR9709  70 WE 20MAY26`,
      `  QRAPT ARR   DY DEP   DY CLASS/MEAL    EQP   GRND  EFT   TTL`,
      `  DOH         0755  WE JCDIRPYBHKM/-    777         7:30`,
      `  LHR   1325  WE       LVSNQTOW/-                         7:30`,
      `  COMMENTS-`,
      `  QR 1.DOH LHR - COMMERCIAL DUPLICATE - OPERATED BY`,
      `                 BRITISH AIRWAYS`,
      `  QR 2.DOH LHR - AIRCRAFT OWNER BRITISH AIRWAYS`,
      `     3.DOH LHR - OPERATIONAL LEG BA 0122`,
      `  QR 4.DOH LHR - ARRIVES TERMINAL 5`,
      `     5.DOH LHR -   9/ NON-SMOKING`,
      `     6.DOH LHR -  ET/ ELECTRONIC TKT CANDIDATE`,
      `     7.DOH LHR -  CO2/PAX* 314.81 KG ECO, 629.63 KG PRE`,
      `                 (*):SOURCE:ICAO CARBON EMISSIONS CALCULATOR`,
      `  CONFIGURATION-`,
      `     777  J 14  W 40  Y 183`,
    ].join('\n');

    return {
      output,
      updatedSession: currentSession,
    };
  }

  // 5. Sell Segment:
  // Format A (from Availability): SS<SEATS><CLASS><LINE_NO> (e.g. SS1Y1, SS2J1, SS1M2)
  // Format B (direct entry): SS <AIRLINE><FLT> <CLASS> <DATE> <PAIR> <STATUS> (e.g. SS QR639 Y 20MAY DACDOH HK1)
  if (upper.startsWith('SS')) {
    // Check Format B: Direct entry e.g. SS QR639 Y 20MAY DACDOH HK1 or SS BG084 Y 20SEP DACSIN HK1
    const directMatch = upper.match(/^SS\s+([A-Z0-9]{2})\s*(\d+)\s+([A-Z])\s+(\d{1,2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z0-9]+)$/);
    if (directMatch) {
      const air = directMatch[1];
      const flt = directMatch[2];
      const cls = directMatch[3];
      const dt = directMatch[4];
      const org = directMatch[5];
      const dst = directMatch[6];
      const st = directMatch[7];

      const newSeg: BookedSegment = {
        segmentNumber: currentSession.segments.length + 1,
        airline: air,
        flightNumber: flt,
        bookingClass: cls,
        date: dt,
        origin: org,
        destination: dst,
        status: st,
        depTime: '0830',
        arrTime: '1345',
      };

      const newSegments = [...currentSession.segments, newSeg];
      const confirmation = ` ${newSeg.segmentNumber}  ${newSeg.airline} ${newSeg.flightNumber.padEnd(4, ' ')} ${newSeg.bookingClass} ${newSeg.date} ${newSeg.origin}${newSeg.destination} ${newSeg.status} ${newSeg.depTime} ${newSeg.arrTime}  *1A/E*`;

      return {
        output: confirmation,
        updatedSession: {
          ...currentSession,
          segments: newSegments,
        },
      };
    }

    // Format A: SS<SEATS><CLASS><LINE> (e.g. SS1Y1, SS 1 Y 1, SS2J1)
    const match = upper.match(/^SS\s*(\d+)\s*([A-Z])\s*(\d+)$/);
    if (!match) {
      return {
        output: 'FORMAT: SS<SEATS><CLASS><LINE> (e.g. SS1Y1 or SS2J1) OR SS <AIRLINE><FLT> <CLASS> <DATE> <PAIR> <STATUS>',
        updatedSession: currentSession,
      };
    }

    const seats = parseInt(match[1], 10);
    const bookingClass = match[2];
    const lineNum = parseInt(match[3], 10);

    // Look up in last availability or default to standard QR DAC-LHR
    let flightOpt = currentSession.lastAvailability?.find((f) => f.lineNum === lineNum);
    if (!flightOpt) {
      const fallback = generateAvailability('20MAY', 'DAC', 'LHR');
      flightOpt = fallback.options.find((f) => f.lineNum === lineNum) || fallback.options[0];
    }

    const seg1: BookedSegment = {
      segmentNumber: currentSession.segments.length + 1,
      airline: flightOpt.flight1.airline,
      flightNumber: flightOpt.flight1.flightNumber,
      bookingClass,
      date: flightOpt.date,
      origin: flightOpt.flight1.origin,
      destination: flightOpt.flight1.destination,
      status: `HK${seats}`,
      depTime: flightOpt.flight1.depTime,
      arrTime: flightOpt.flight1.arrTime,
      equip: flightOpt.flight1.equip,
    };

    const newSegments = [...currentSession.segments, seg1];
    let confirmation = ` ${seg1.segmentNumber}  ${seg1.airline} ${seg1.flightNumber.padEnd(4, ' ')} ${seg1.bookingClass} ${seg1.date} ${seg1.origin}${seg1.destination} ${seg1.status} ${seg1.depTime} ${seg1.arrTime}  *1A/E*`;

    if (flightOpt.flight2) {
      const seg2: BookedSegment = {
        segmentNumber: newSegments.length + 1,
        airline: flightOpt.flight2.airline,
        flightNumber: flightOpt.flight2.flightNumber,
        bookingClass,
        date: flightOpt.date,
        origin: flightOpt.flight2.origin,
        destination: flightOpt.flight2.destination,
        status: `HK${seats}`,
        depTime: flightOpt.flight2.depTime,
        arrTime: flightOpt.flight2.arrTime,
        equip: flightOpt.flight2.equip,
      };
      newSegments.push(seg2);
      const fCode = flightOpt.flight2.codeshare || `${seg2.airline} ${seg2.flightNumber}`;
      confirmation += `\n ${seg2.segmentNumber}  ${fCode.padEnd(8, ' ')} ${seg2.bookingClass} ${seg2.date} ${seg2.origin}${seg2.destination} ${seg2.status} ${seg2.depTime} ${seg2.arrTime}  *1A/E*`;
    }

    const updated = {
      ...currentSession,
      segments: newSegments,
    };

    return {
      output: confirmation,
      updatedSession: updated,
    };
  }

  // 6. Passenger Name: NM
  // Adult: NM1HOSSAIN/ABUL MR
  // Child: NM1HOSSAIN/MD MSTR(CHD/21JUL12)
  // Infant: NM1HOSSAIN/ABUL MR(INF HASAN/ABUL MSTR/25FEB22)
  // Multiple: NM2HOSSAIN/ABUL MR/FATEMA MRS
  if (upper.startsWith('NM')) {
    const rawNameCmd = upper.substring(2).trim();

    // Check for Child format: NM1HOSSAIN/MD MSTR(CHD/21JUL12)
    const chdMatch = rawNameCmd.match(/^(\d*)([A-Z]+)\/([A-Z\s]+)\(CHD\/([0-9A-Z]+)\)$/);
    if (chdMatch) {
      const surname = chdMatch[2];
      const rest = chdMatch[3].trim().split(/\s+/);
      const title = rest.length > 1 ? rest.pop() || 'MSTR' : 'MSTR';
      const firstName = rest.join(' ') || 'CHILD';
      const dob = chdMatch[4];

      const newPax: Passenger = {
        id: currentSession.passengers.length + 1,
        surname,
        firstName,
        title,
        type: 'CHD',
        dob,
      };

      const updated = {
        ...currentSession,
        passengers: [...currentSession.passengers, newPax],
      };

      return {
        output: ` ${newPax.id}.${newPax.surname}/${newPax.firstName} ${newPax.title}(CHD/${dob})`,
        updatedSession: updated,
      };
    }

    // Check for Infant format: NM1HOSSAIN/ABUL MR(INF HASAN/ABUL MSTR/25FEB22)
    const infMatch = rawNameCmd.match(/^(\d*)([A-Z]+)\/([A-Z\s]+)\(INF\s+([A-Z]+)\/([A-Z\s]+)\/([0-9A-Z]+)\)$/);
    if (infMatch) {
      const adultSurname = infMatch[2];
      const adultRest = infMatch[3].trim().split(/\s+/);
      const adultTitle = adultRest.length > 1 ? adultRest.pop() || 'MR' : 'MR';
      const adultFirstName = adultRest.join(' ') || 'PAX';

      const infSurname = infMatch[4];
      const infRest = infMatch[5].trim().split(/\s+/);
      const infTitle = infRest.length > 1 ? infRest.pop() || 'MSTR' : 'MSTR';
      const infFirstName = infRest.join(' ') || 'INFANT';
      const infDob = infMatch[6];

      const adultPax: Passenger = {
        id: currentSession.passengers.length + 1,
        surname: adultSurname,
        firstName: adultFirstName,
        title: adultTitle,
        type: 'ADT',
      };

      const infPax: Passenger = {
        id: currentSession.passengers.length + 2,
        surname: infSurname,
        firstName: infFirstName,
        title: infTitle,
        type: 'INF',
        dob: infDob,
        associatedWithPaxId: adultPax.id,
      };

      const updated = {
        ...currentSession,
        passengers: [...currentSession.passengers, adultPax, infPax],
      };

      return {
        output: ` ${adultPax.id}.${adultPax.surname}/${adultPax.firstName} ${adultPax.title}(INF ${infPax.surname}/${infPax.firstName} ${infPax.title}/${infDob})`,
        updatedSession: updated,
      };
    }

    // Check for standard Adult name: NM1SURNAME/FIRSTNAME TITLE
    const adultMatch = rawNameCmd.match(/^(\d*)([A-Z]+)\/([A-Z\s]+)$/);
    if (adultMatch) {
      const surname = adultMatch[2];
      const rest = adultMatch[3].trim().split(/\s+/);
      const title = rest.length > 1 ? rest.pop() || 'MR' : 'MR';
      const firstName = rest.join(' ') || 'PAX';

      const newPax: Passenger = {
        id: currentSession.passengers.length + 1,
        surname,
        firstName,
        title,
        type: 'ADT',
      };

      const updated = {
        ...currentSession,
        passengers: [...currentSession.passengers, newPax],
      };

      return {
        output: ` ${newPax.id}.${newPax.surname}/${newPax.firstName} ${newPax.title}`,
        updatedSession: updated,
      };
    }

    // Flexible fallback
    const parts = rawNameCmd.replace(/^\d+/, '').split('/');
    if (parts.length >= 2) {
      const surname = parts[0].trim();
      const rest = parts[1].trim().split(/\s+/);
      const title = rest.length > 1 ? rest.pop() || 'MR' : 'MR';
      const firstName = rest.join(' ') || 'PAX';

      const newPax: Passenger = {
        id: currentSession.passengers.length + 1,
        surname,
        firstName,
        title,
        type: 'ADT',
      };

      const updated = {
        ...currentSession,
        passengers: [...currentSession.passengers, newPax],
      };

      return {
        output: ` ${newPax.id}.${newPax.surname}/${newPax.firstName} ${newPax.title}`,
        updatedSession: updated,
      };
    }

    return {
      output: 'FORMAT: NM1SURNAME/FIRSTNAME TITLE (e.g. NM1HOSSAIN/ABUL MR)',
      updatedSession: currentSession,
    };
  }

  // 6b. Frequent Flyer Number: FFN (e.g. FFNEK-1234567/P1, FFNQR-123456789/P1)
  if (upper.startsWith('FFN')) {
    const match = upper.match(/^FFN([A-Z0-9]{2})-?([A-Z0-9]+)(?:\/P(\d+))?/);
    const air = match ? match[1] : 'QR';
    const num = match ? match[2] : '123456789';
    const paxRef = match && match[3] ? `P${match[3]}` : 'P1';

    const newSsr: SsrItem = {
      id: currentSession.ssrs.length + 1,
      type: 'OTHER',
      code: 'FQTV',
      airline: air,
      status: 'HK1',
      text: `${air}${num}`,
      paxRef,
    };

    return {
      output: `SSR FQTV ${air} HK1/${air}${num}/${paxRef}`,
      updatedSession: {
        ...currentSession,
        ssrs: [...currentSession.ssrs, newSsr],
      },
    };
  }

  // 7. Special Service Requests (SSR): SR
  // Examples:
  // SRDOCS HK1-P-BD-EF0123456-BD-10FEB95-M-18NOV25-HOSSAIN/ABUL/P1
  // SR CTCE HK1-ABCD//GMAIL.COM/P1
  // SR CTCM HK1-01912345678/P1
  // SR DOCO HK1-PARIS FR-V 12345123-LONDON GB-14NOV11-US-23SEP15/P1
  // SR DOCA HK1-D-ROAD 8 SECTOR 11 UTTARA/DHAKA-1230/P1
  // SR MOML/P1, SR AVML/P1, SR DBML/P1, SR CHML/P1, SR VGML/P1, SR KSML/P1
  // SR WCHR-NON MEDA PAX IS OLD/P1, SR WCHC/P1, SR WCHS/P1
  // SR MAAS-PAX KNOWS ONLY BENGALI/P1
  // SR BIKE, SR BSCT, SR CBBG, SR DEPA, SR EXST, SR FRAG, SR UMNR, SR XBAG
  if (upper.startsWith('SR')) {
    const afterSr = upper.substring(2).trim();

    let ssrType: SsrItem['type'] = 'OTHER';
    let ssrCode = 'OTHS';
    let status = 'HK1';
    let text = afterSr;
    let paxRef = 'P1';

    // Match 4-character code (DOCS, CTCE, CTCM, DOCO, DOCA, MOML, WCHR, MAAS, etc.)
    const codeMatch = afterSr.match(/^([A-Z0-9]{4})/);
    if (codeMatch) {
      ssrCode = codeMatch[1];
      if (['DOCS'].includes(ssrCode)) ssrType = 'DOCS';
      else if (['CTCE'].includes(ssrCode)) ssrType = 'CTCE';
      else if (['CTCM'].includes(ssrCode)) ssrType = 'CTCM';
      else if (['DOCO'].includes(ssrCode)) ssrType = 'DOCO';
      else if (['DOCA'].includes(ssrCode)) ssrType = 'DOCA';
      else if (['MOML', 'AVML', 'DBML', 'CHML', 'VGML', 'KSML'].includes(ssrCode)) ssrType = 'MOML';
      else if (['WCHR', 'WCHC', 'WCHS'].includes(ssrCode)) ssrType = 'WCHR';
      else if (['MAAS'].includes(ssrCode)) ssrType = 'MAAS';
      else ssrType = 'OTHER';
    }

    // Extract Pax Ref (e.g. /P1, /P2)
    const paxMatch = afterSr.match(/\/P(\d+)/);
    if (paxMatch) {
      paxRef = `P${paxMatch[1]}`;
    }

    // Extract status (HK1, NN1)
    const statusMatch = afterSr.match(/\b(HK\d+|NN\d+)\b/);
    if (statusMatch) {
      status = statusMatch[1];
    }

    // Clean up content body
    let body = afterSr
      .replace(new RegExp(`^${ssrCode}\\s*`, 'i'), '')
      .replace(new RegExp(`\\b${status}[\\s-]*`), '')
      .replace(new RegExp(`\\/P\\d+`), '')
      .trim();

    if (!body) body = afterSr;

    const newSsr: SsrItem = {
      id: currentSession.ssrs.length + 1,
      type: ssrType,
      code: ssrCode,
      airline: currentSession.segments[0]?.airline || 'QR',
      status,
      text: body,
      paxRef,
    };

    const updated = {
      ...currentSession,
      ssrs: [...currentSession.ssrs, newSsr],
    };

    return {
      output: `SSR ${newSsr.code} ${newSsr.airline} ${newSsr.status} ${newSsr.text}/${newSsr.paxRef}`,
      updatedSession: updated,
    };
  }

  // 8. Contact Element: AP (e.g. AP SHOHOJ 01958658524 REF KARIM or AP +8801700000000)
  if (upper.startsWith('AP')) {
    const contactInfo = input.substring(2).trim() || '+8801700000000';
    const updated = {
      ...currentSession,
      contacts: [...currentSession.contacts, contactInfo],
    };
    return {
      output: ` ${updated.contacts.length}. AP ${contactInfo}`,
      updatedSession: updated,
    };
  }

  // 9. Ticketing Arrangement: TK (e.g. TKOK, TKTL20MAY)
  if (upper.startsWith('TK')) {
    let arrangement = 'OK';
    if (upper.startsWith('TKTL')) {
      arrangement = `TL${upper.substring(4)}` || 'TL20MAY';
    } else if (upper.startsWith('TKOK')) {
      arrangement = 'OK20MAY';
    } else {
      arrangement = upper.substring(2).trim() || 'OK20MAY';
    }

    const updated = {
      ...currentSession,
      ticketingArrangement: arrangement,
    };
    return {
      output: ` 1. TK ${arrangement}/${updated.officeId}`,
      updatedSession: updated,
    };
  }

  // 10. Received From: RF (e.g. RF KARIM, RF AGENT)
  if (upper.startsWith('RF')) {
    const name = input.substring(2).trim() || 'KARIM';
    const updated = {
      ...currentSession,
      receivedFrom: name,
    };
    return {
      output: `RF ${name}`,
      updatedSession: updated,
    };
  }

  // 11. End and Retrieve (PNR Generation): ER or ET
  if (upper === 'ER' || upper === 'ET') {
    // Mandatory 5 PNR fields check (PRINT: Phone, Received, Itinerary, Name, Ticketing)
    if (currentSession.passengers.length === 0) {
      return {
        output: 'NEED PASSENGER NAME - NM1SURNAME/FIRSTNAME TITLE',
        updatedSession: currentSession,
      };
    }
    if (currentSession.segments.length === 0) {
      return {
        output: 'NO ITINERARY - SELL SEGMENT WITH SS OR FXZ COMMAND',
        updatedSession: currentSession,
      };
    }
    if (currentSession.contacts.length === 0) {
      return {
        output: 'NEED AP ELEMENT - ENTER CONTACT WITH AP COMMAND',
        updatedSession: currentSession,
      };
    }
    if (!currentSession.ticketingArrangement) {
      return {
        output: 'NEED TK ELEMENT - ENTER TICKETING WITH TKOK OR TKTL',
        updatedSession: currentSession,
      };
    }
    if (!currentSession.receivedFrom) {
      return {
        output: 'RECEIVED FROM REQUIRED - ENTER RF <NAME>',
        updatedSession: currentSession,
      };
    }

    const pnrLocator = currentSession.pnrLocator || generatePnrLocator();
    const updated: PnrSession = {
      ...currentSession,
      pnrLocator,
    };

    savedPnrs.set(pnrLocator, updated);

    return {
      output: formatPnrDisplay(updated),
      updatedSession: updated,
    };
  }

  // 12. Ignore and Retrieve: IR
  if (upper === 'IR') {
    if (currentSession.pnrLocator && savedPnrs.has(currentSession.pnrLocator)) {
      const restored = savedPnrs.get(currentSession.pnrLocator)!;
      return {
        output: formatPnrDisplay(restored),
        updatedSession: restored,
      };
    }
    return {
      output: 'NO SAVED PNR TO RETRIEVE',
      updatedSession: currentSession,
    };
  }

  // 13. Retrieve PNR: RT, RT <PNR>, RT/<SURNAME>
  if (upper.startsWith('RT')) {
    const target = input.substring(2).trim();

    // Plain RT -> Display current work area
    if (!target) {
      return {
        output: formatPnrDisplay(currentSession),
        updatedSession: currentSession,
      };
    }

    // RT/<SURNAME> search
    if (target.startsWith('/')) {
      const surnameQuery = target.substring(1).toUpperCase().trim();
      const matchingLocators: string[] = [];

      savedPnrs.forEach((pnrData, loc) => {
        const hasMatch = pnrData.passengers.some((p) =>
          p.surname.toUpperCase().includes(surnameQuery)
        );
        if (hasMatch) {
          matchingLocators.push(loc);
        }
      });

      if (matchingLocators.length === 1) {
        const found = savedPnrs.get(matchingLocators[0])!;
        return {
          output: formatPnrDisplay(found),
          updatedSession: found,
        };
      }

      if (matchingLocators.length > 1) {
        const listLines = [`MATCHING PNR RECORD LOCATORS FOR /${surnameQuery}:`];
        matchingLocators.forEach((loc, idx) => {
          const pnr = savedPnrs.get(loc)!;
          const paxNames = pnr.passengers.map((p) => `${p.surname}/${p.firstName}`).join(' ');
          listLines.push(` ${idx + 1}. ${loc}  ${paxNames}  (${pnr.segments.length} SEGS)`);
        });
        listLines.push(`\nUSE RT <LOCATOR> TO RETRIEVE SPECIFIC BOOKING.`);
        return {
          output: listLines.join('\n'),
          updatedSession: currentSession,
        };
      }

      return {
        output: `NO BOOKING FOUND FOR SURNAME: ${surnameQuery}`,
        updatedSession: currentSession,
      };
    }

    // RT <PNR_LOCATOR>
    const locQuery = target.toUpperCase();
    const found = savedPnrs.get(locQuery);
    if (found) {
      return {
        output: formatPnrDisplay(found),
        updatedSession: found,
      };
    }

    return {
      output: `NO PNR FOUND FOR RECORD LOCATOR: ${locQuery}`,
      updatedSession: currentSession,
    };
  }

  // 14. Fare Pricing: FXP (Creates TST) or FXX (Informative only)
  // Formats: FXP, FXP/P1, FXP/S1-2, FXX, FXX/P1
  if (upper.startsWith('FXP') || upper.startsWith('FXX')) {
    if (currentSession.segments.length === 0) {
      return {
        output: 'NO ITINERARY TO PRICE. SELL SEGMENTS (SS OR FXZ) FIRST.',
        updatedSession: currentSession,
      };
    }

    // Calculate dynamic pricing based on itinerary and passenger count
    const adtCount = currentSession.passengers.filter((p) => !p.type || p.type === 'ADT').length || 1;
    const chdCount = currentSession.passengers.filter((p) => p.type === 'CHD').length;
    const infCount = currentSession.passengers.filter((p) => p.type === 'INF').length;

    const firstSeg = currentSession.segments[0];
    const lastSeg = currentSession.segments[currentSession.segments.length - 1];
    const isBusiness = firstSeg?.bookingClass === 'J' || firstSeg?.bookingClass === 'C';
    const isRoundTrip = currentSession.segments.length > 1 && lastSeg?.destination === firstSeg?.origin;

    const dynamicSector = calculateSectorFare(firstSeg?.origin || 'DAC', lastSeg?.destination || 'JED', isBusiness, isRoundTrip);
    const baseUnitFare = currentSession.pricing?.baseFare ? Math.round(currentSession.pricing.baseFare / (adtCount || 1)) : dynamicSector.base;
    const taxesUnit = currentSession.pricing?.taxes ? Math.round(currentSession.pricing.taxes / (adtCount || 1)) : dynamicSector.tax;

    const adtTotal = (baseUnitFare + taxesUnit) * adtCount;
    const chdTotal = Math.round(((baseUnitFare * 0.75) + (taxesUnit * 0.85)) * chdCount);
    const infTotal = Math.round(((baseUnitFare * 0.1) + 4000) * infCount);

    const grandTotal = adtTotal + chdTotal + infTotal;
    const grandBase = (baseUnitFare * adtCount) + Math.round(baseUnitFare * 0.75 * chdCount) + Math.round(baseUnitFare * 0.1 * infCount);
    const grandTax = grandTotal - grandBase;

    const pricing = {
      baseFare: grandBase,
      taxes: grandTax,
      total: grandTotal,
      currency: 'BDT',
      fareBasis: 'YLRBD1',
      paxBreakdown: `${adtCount} ADT${chdCount ? ` ${chdCount} CHD` : ''}${infCount ? ` ${infCount} INF` : ''}`,
    };

    const firstPax = currentSession.passengers[0]
      ? `${currentSession.passengers[0].surname}/${currentSession.passengers[0].firstName} ${currentSession.passengers[0].title}`
      : 'HOSSAIN/ABUL MR';

    const segLines: string[] = [];
    if (firstSeg) {
      segLines.push(firstSeg.origin);
      currentSession.segments.forEach((seg) => {
        segLines.push(
          `${seg.destination} ${seg.airline}  ${seg.flightNumber.padEnd(4, ' ')} ${seg.bookingClass} Y ${seg.date} ${seg.depTime} ${pricing.fareBasis}                  2PC`
        );
      });
    }

    const isStored = upper.startsWith('FXP');
    const fareCalcRoute = currentSession.segments.length > 0
      ? currentSession.segments.map((s) => `${s.origin} ${s.airline}`).join(' ') + ` ${lastSeg?.destination || ''}`
      : 'DAC SV JED';

    const output = [
      `01 ${firstPax}`,
      `LAST TKT DTE ${firstSeg ? firstSeg.date : '25OCT26'} - DATE OF ORIGIN`,
      `------------------------------------------------------------`,
      `AL FLGT  BK T DATE  TIME  FARE BASIS      NVB  NVA   BG`,
      ...segLines,
      ``,
      `BDT       ${grandBase.toLocaleString()}                   ${firstSeg ? firstSeg.date : '25OCT26'}${fareCalcRoute} NUC`,
      `BDT       ${grandTax.toLocaleString()}TAX                END ROE119.50XT${grandTax}XT`,
      `BDT       ${grandTotal.toLocaleString()}TOT`,
      `PAGE 1/1`,
      isStored ? `TST 00001 CREATED` : `NO TST CREATED (QUOTATION ONLY)`,
    ].filter(Boolean).join('\n');

    const updated = {
      ...currentSession,
      pricing: isStored ? pricing : currentSession.pricing,
    };

    return {
      output,
      updatedSession: updated,
    };
  }

  // 15. Ticket Issuance: TTP (e.g. TTP, TTP/RT, TTP/P1, TTP/S2, TTP/TKT)
  if (upper.startsWith('TTP')) {
    let sessionToIssue: PnrSession = { ...currentSession };

    // Auto-complete essential fields if practicing directly with TTP
    if (!sessionToIssue.pnrLocator) {
      sessionToIssue.pnrLocator = 'XFV45T';
    }

    if (!sessionToIssue.pricing) {
      sessionToIssue.pricing = {
        baseFare: 85000,
        taxes: 22000,
        total: 107000,
        currency: 'BDT',
        fareBasis: 'YLRBD1',
      };
    }

    if (sessionToIssue.passengers.length === 0) {
      sessionToIssue.passengers = [
        { id: 1, surname: 'SHARIF', firstName: 'HRIDOY', title: 'MR', type: 'ADT' },
      ];
    }

    if (sessionToIssue.segments.length === 0) {
      sessionToIssue.segments = [
        {
          segmentNumber: 1,
          airline: 'TK',
          flightNumber: '144',
          bookingClass: 'Y',
          date: '20MAY',
          origin: 'DAC',
          destination: 'IST',
          status: 'HK1',
          depTime: '0410',
          arrTime: '0835',
        },
      ];
    }

    if (currentSession.isTicketed && currentSession.ticketNumbers.length > 0) {
      const existingItr = buildItrReceiptData(currentSession, ticketSalesDatabase);
      return {
        output: [
          'OK ETICKET ISSUED',
          ...currentSession.ticketNumbers.map(
            (tkt, idx) =>
              `FA PAX ${tkt}/ET${currentSession.segments[0]?.airline || 'TK'}/BDT${currentSession.pricing?.total || 107000}/20MAY26/${currentSession.officeId || 'DAC360'}/21368575/P${idx + 1}`
          ),
          'TKT ISSUED / OK',
        ].join('\n'),
        updatedSession: currentSession,
        isTtp: true,
        itrData: existingItr || undefined,
      };
    }

    // Determine airline numeric prefix (e.g. 235 for TK, 157 for QR, 176 for EK, 997 for BG, 065 for SV, 618 for SQ)
    const airCode = sessionToIssue.segments[0]?.airline || 'TK';
    const airInfo = AIRLINES.find((a) => a.code === airCode);
    const prefix = airInfo ? airInfo.numericCode : (airCode === 'TK' ? '235' : '157');

    // Issue 13-digit ticket for every passenger: e.g. 235-6408283586
    const ticketNumbers: string[] = [];
    sessionToIssue.passengers.forEach((p, idx) => {
      // Use standard deterministic or high-quality 10-digit number
      const random10 = idx === 0 ? '6408283586' : String(Math.floor(1000000000 + Math.random() * 9000000000));
      ticketNumbers.push(`${prefix}-${random10}`);
    });

    if (ticketNumbers.length === 0) {
      ticketNumbers.push(`${prefix}-6408283586`);
    }

    const updated: PnrSession = {
      ...sessionToIssue,
      isTicketed: true,
      ticketNumbers,
    };

    savedPnrs.set(updated.pnrLocator!, updated);

    const totalAmount = updated.pricing ? updated.pricing.total : 107000;

    // Register into ticket sales database (for TJQ, TWD, TRDC, ITR)
    ticketNumbers.forEach((tkt, idx) => {
      const pax = updated.passengers[idx];
      const paxName = pax ? `${pax.surname}/${pax.firstName} ${pax.title}` : 'SHARIF/HRIDOY MR';
      const gross = totalAmount;
      const commPct = parseFloat(updated.commission || '7') || 7;
      const commAmt = Math.round(gross * (commPct / 100));
      const net = gross - commAmt;

      ticketSalesDatabase.push({
        ticketNumber: tkt,
        pnrLocator: updated.pnrLocator || 'XFV45T',
        passengerName: paxName,
        airline: airCode,
        issueDate: '20MAY26',
        officeId: updated.officeId || 'DAC360',
        grossFare: gross,
        tax: Math.round(gross * 0.15),
        commissionPct: commPct,
        commissionAmount: commAmt,
        netPayable: net,
        formOfPayment: updated.formOfPayment || 'CASH / INVOICE',
        status: 'OK',
        itinerarySummary: updated.segments.map((s) => `${s.origin} ${s.destination}`).join(' '),
      });
    });

    const outputLines = [
      `OK ETICKET ISSUED`,
      ...ticketNumbers.map(
        (tkt, idx) =>
          `FA PAX ${tkt}/ET${airCode}/BDT${totalAmount}/20MAY26/${updated.officeId || 'DAC360'}/21368575/P${idx + 1}`
      ),
      `TKT ISSUED / OK`,
    ];

    const itrData = buildItrReceiptData(updated, ticketSalesDatabase);

    return {
      output: outputLines.join('\n'),
      updatedSession: updated,
      isTtp: true,
      itrData: itrData || undefined,
    };
  }

  // 15b. Daily TINS Sales Report: TJQ (e.g. TJQ, TJQ/D-10SEP, TJQ/D-20MAY)
  if (upper.startsWith('TJQ')) {
    const lines: string[] = [];
    lines.push(`TJQ - TINS DAILY SALES REPORT FOR ${currentSession.officeId} / AGT ${currentSession.agentDuty}`);
    lines.push(`DATE: 20MAY26    CURRENCY: BDT`);
    lines.push(`------------------------------------------------------------------------------------------------`);
    lines.push(`AGT  DOC NUMBER       PAX NAME                  GROSS FARE       COMM      NET AMNT  STAT`);
    lines.push(`------------------------------------------------------------------------------------------------`);

    let totalGross = 0;
    let totalComm = 0;
    let totalNet = 0;

    ticketSalesDatabase.forEach((sale) => {
      totalGross += sale.grossFare;
      totalComm += sale.commissionAmount;
      totalNet += sale.netPayable;
      const agtPad = 'AA'.padEnd(4, ' ');
      const tktPad = sale.ticketNumber.padEnd(16, ' ');
      const namePad = sale.passengerName.substring(0, 24).padEnd(25, ' ');
      const grossPad = sale.grossFare.toLocaleString().padStart(11, ' ');
      const commPad = sale.commissionAmount.toLocaleString().padStart(10, ' ');
      const netPad = sale.netPayable.toLocaleString().padStart(12, ' ');
      lines.push(`${agtPad} ${tktPad} ${namePad} ${grossPad} ${commPad} ${netPad}  ${sale.status}`);
    });

    lines.push(`------------------------------------------------------------------------------------------------`);
    lines.push(`TOTAL TICKETS : ${ticketSalesDatabase.length.toString().padStart(4, ' ')}`);
    lines.push(`TOTAL GROSS   : BDT ${totalGross.toLocaleString().padStart(12, ' ')}`);
    lines.push(`TOTAL COMM    : BDT ${totalComm.toLocaleString().padStart(12, ' ')}`);
    lines.push(`TOTAL NET DUE : BDT ${totalNet.toLocaleString().padStart(12, ' ')}`);
    lines.push(`FORM OF PAY   : IN VAGT*SHOHOJ (BDT ${totalNet.toLocaleString()})`);

    return {
      output: lines.join('\n'),
      updatedSession: currentSession,
    };
  }

  // 15c. Electronic Ticket Mask Display: TWD (e.g. TWD/TKT-176-1234567890, TWD/TK-176-1234567890, TWD/L6, TWD)
  if (upper.startsWith('TWD')) {
    let tktNum = currentSession.ticketNumbers[0] || ticketSalesDatabase[ticketSalesDatabase.length - 1]?.ticketNumber || '157-2489102941';

    const tktMatch = upper.match(/TWD\/(?:TKT-|TK-)?(\d{3}-\d{10})/);
    if (tktMatch) {
      tktNum = tktMatch[1];
    } else {
      const lineMatch = upper.match(/TWD\/L(\d+)/);
      if (lineMatch) {
        const lIdx = parseInt(lineMatch[1], 10) - 1;
        if (currentSession.ticketNumbers[lIdx]) {
          tktNum = currentSession.ticketNumbers[lIdx];
        }
      }
    }

    const sale = ticketSalesDatabase.find((s) => s.ticketNumber === tktNum) || ticketSalesDatabase[ticketSalesDatabase.length - 1];
    const isVoid = sale?.status === 'VOID' || currentSession.voidTickets?.includes(tktNum);
    const air = sale?.airline || 'QR';
    const paxName = sale?.passengerName || (currentSession.passengers[0] ? `${currentSession.passengers[0].surname}/${currentSession.passengers[0].firstName} ${currentSession.passengers[0].title}` : 'HOSSAIN/ABUL MR');
    const tot = sale?.grossFare || currentSession.pricing?.total || 99500;
    const base = sale?.grossFare ? Math.round(sale.grossFare * 0.85) : (currentSession.pricing?.baseFare || 85000);
    const tax = tot - base;

    const lines = [
      `TWD/TKT-${tktNum}`,
      `ELECTRONIC TICKET RECORD - TWD`,
      `INV: ${sale?.officeId || currentSession.officeId}    RLOC: 1A/${sale?.pnrLocator || currentSession.pnrLocator || 'X7K9LP'}`,
      `NAME: ${paxName}`,
      `TKT: ${tktNum}    ISS: 20MAY26    IATA: 21368575`,
      `-----------------------------------------------------------------------------`,
      `CPN A/L FLT  CLS DATE   BRD OFF TIME  ST F/B      STAT  NVB   NVA   BG`,
      ` 1  ${air}  639  Y   20MAY  DAC DOH 0410  OK YLRBD1   ${isVoid ? 'VOID' : 'OPEN'} 20MAY 20MAY 2PC`,
      ` 2  ${air}  701  Y   20MAY  DOH LHR 0815  OK YLRBD1   ${isVoid ? 'VOID' : 'OPEN'} 20MAY 20MAY 2PC`,
      `-----------------------------------------------------------------------------`,
      `FARE        : BDT ${base.toLocaleString()}`,
      `TAX/FEE/CHG : BDT ${tax.toLocaleString()}XT (BD2000 QA7500 GB5000)`,
      `TOTAL       : BDT ${tot.toLocaleString()}`,
      `FORM OF PAY : ${sale?.formOfPayment || currentSession.formOfPayment || 'IN VAGT*SHOHOJ'}`,
      `ENDORSEMENTS: NONREF/CHG FEE APPLIES`,
    ];

    return {
      output: lines.join('\n'),
      updatedSession: currentSession,
    };
  }

  // 15d. Ticket Void: TRDC (e.g. TRDC/TK-176-1234567890, TRDC/TKT-176-1234567890, TRDC/L6)
  if (upper.startsWith('TRDC')) {
    let tktNum = currentSession.ticketNumbers[0] || ticketSalesDatabase[ticketSalesDatabase.length - 1]?.ticketNumber || '157-2489102941';

    const tktMatch = upper.match(/TRDC\/(?:TKT-|TK-)?(\d{3}-\d{10})/);
    if (tktMatch) {
      tktNum = tktMatch[1];
    } else {
      const lineMatch = upper.match(/TRDC\/L(\d+)/);
      if (lineMatch) {
        const lIdx = parseInt(lineMatch[1], 10) - 1;
        if (currentSession.ticketNumbers[lIdx]) {
          tktNum = currentSession.ticketNumbers[lIdx];
        }
      }
    }

    // Update sale record in database
    const foundSale = ticketSalesDatabase.find((s) => s.ticketNumber === tktNum);
    if (foundSale) {
      foundSale.status = 'VOID';
    }

    const voidList = currentSession.voidTickets || [];
    const updatedVoids = [...voidList, tktNum];

    const updated = {
      ...currentSession,
      voidTickets: updatedVoids,
    };

    if (currentSession.pnrLocator) {
      savedPnrs.set(currentSession.pnrLocator, updated);
    }

    return {
      output: `OK VOID - TICKET ${tktNum} HAS BEEN CANCELLED/VOIDED\nSTATUS UPDATED IN TINS SALES REPORT (TJQ)`,
      updatedSession: updated,
    };
  }

  // 15e. Commission: FM (e.g. FM7, FM 7, FM9%)
  if (upper.startsWith('FM')) {
    const rate = upper.substring(2).replace('%', '').trim() || '7';
    const updated = {
      ...currentSession,
      commission: `${rate}%`,
    };
    return {
      output: `FM ${rate}% COMMISSION STORED`,
      updatedSession: updated,
    };
  }

  // 15f. Form of Payment: FP (e.g. FP IN VAGT*SHOHOJ, FP CASH, FP CC)
  if (upper.startsWith('FP')) {
    const fop = input.substring(2).trim() || 'IN VAGT*SHOHOJ';
    const updated = {
      ...currentSession,
      formOfPayment: fop,
    };
    return {
      output: `FP ${fop} STORED`,
      updatedSession: updated,
    };
  }

  // 15g. Copy PNR Elements: RRP (Passengers), RRN / RRI (Itinerary)
  if (upper === 'RRP') {
    if (currentSession.passengers.length === 0) {
      return {
        output: 'NO PASSENGER DETAILS TO COPY',
        updatedSession: currentSession,
      };
    }
    return {
      output: `COPIED ${currentSession.passengers.length} PASSENGER(S) TO WORK AREA FOR NEW BOOKING`,
      updatedSession: {
        ...currentSession,
        pnrLocator: null,
        segments: [],
        pricing: undefined,
        isTicketed: false,
        ticketNumbers: [],
      },
    };
  }

  if (upper === 'RRN' || upper === 'RRI') {
    if (currentSession.segments.length === 0) {
      return {
        output: 'NO ITINERARY SEGMENTS TO COPY',
        updatedSession: currentSession,
      };
    }
    return {
      output: `COPIED ${currentSession.segments.length} ITINERARY SEGMENT(S) TO WORK AREA FOR NEW BOOKING`,
      updatedSession: {
        ...currentSession,
        pnrLocator: null,
        passengers: [],
        pricing: undefined,
        isTicketed: false,
        ticketNumbers: [],
      },
    };
  }

  // 15h. Divide PNR: SP (e.g. SP1, SP2) and EF (End File for divided PNR)
  if (upper.startsWith('SP')) {
    const arg = upper.substring(2).trim() || '1';
    const paxNum = parseInt(arg, 10) || 1;
    const targetPax = currentSession.passengers[paxNum - 1];

    if (!targetPax) {
      return {
        output: `PASSENGER ${paxNum} NOT FOUND IN RECORD`,
        updatedSession: currentSession,
      };
    }

    if (currentSession.passengers.length <= 1) {
      return {
        output: `CANNOT SPLIT SINGLE PASSENGER RECORD`,
        updatedSession: currentSession,
      };
    }

    const updated = {
      ...currentSession,
      splitPassengerBuffer: [targetPax],
    };

    return {
      output: [
        `PASSENGER ${paxNum} SPLIT FROM RECORD`,
        `ASSOCIATED FILE GENERATED: RECORD SPLIT IN PROGRESS`,
        `ENTER 'RF <NAME>;EF' TO FILE AND FINALIZE DIVIDED RECORD`,
      ].join('\n'),
      updatedSession: updated,
    };
  }

  if (upper === 'EF') {
    if (!currentSession.splitPassengerBuffer || currentSession.splitPassengerBuffer.length === 0) {
      return {
        output: 'NO RECORD SPLIT IN PROGRESS. USE SP1 FIRST.',
        updatedSession: currentSession,
      };
    }

    const splitPax = currentSession.splitPassengerBuffer;
    const parentLocator = currentSession.pnrLocator || generatePnrLocator();
    const childLocator = generatePnrLocator();

    // Remaining passengers in parent
    const remainingPax = currentSession.passengers
      .filter((p) => !splitPax.some((sp) => sp.surname === p.surname && sp.firstName === p.firstName))
      .map((p, idx) => ({ ...p, id: idx + 1 }));

    const updatedParent: PnrSession = {
      ...currentSession,
      pnrLocator: parentLocator,
      passengers: remainingPax,
      splitPassengerBuffer: undefined,
    };

    const childSession: PnrSession = {
      ...currentSession,
      pnrLocator: childLocator,
      passengers: splitPax.map((p, idx) => ({ ...p, id: idx + 1 })),
      splitPassengerBuffer: undefined,
    };

    savedPnrs.set(parentLocator, updatedParent);
    savedPnrs.set(childLocator, childSession);

    const splitNames = splitPax.map((p) => `${p.surname}/${p.firstName}`).join(', ');

    return {
      output: [
        `SPLIT COMPLETED`,
        `PARENT RECORD: ${parentLocator} (REMAINDER PAX: ${remainingPax.length})`,
        `CHILD RECORD : ${childLocator} (DIVIDED PAX: ${splitNames})`,
      ].join('\n'),
      updatedSession: updatedParent,
    };
  }

  // 15i. Share PNR: ES (e.g. ESDACVS12XY-B)
  if (upper.startsWith('ES')) {
    const office = upper.substring(2).trim() || 'DACVS12XY-B';
    const existing = currentSession.sharedWithOffices || [];
    const updated = {
      ...currentSession,
      sharedWithOffices: [...existing, office],
    };
    if (currentSession.pnrLocator) {
      savedPnrs.set(currentSession.pnrLocator, updated);
    }
    return {
      output: `OK BRIDGED TO OFFICE ${office}\nSECURITY PASSWORDS AND BRIDGE ACCESS EXTENDED`,
      updatedSession: updated,
    };
  }

  // 15j. Itinerary Modification: SB (e.g. SBY2, SB25NOV4, SBEK585*3)
  if (upper.startsWith('SB')) {
    // Class change: SBY2 or SB J 1
    const classMatch = upper.match(/^SB([A-Z])(\d+)$/);
    if (classMatch) {
      const newClass = classMatch[1];
      const segNum = parseInt(classMatch[2], 10);
      const seg = currentSession.segments.find((s) => s.segmentNumber === segNum);
      if (!seg) {
        return { output: `SEGMENT ${segNum} NOT FOUND`, updatedSession: currentSession };
      }
      const updatedSegs = currentSession.segments.map((s) =>
        s.segmentNumber === segNum ? { ...s, bookingClass: newClass } : s
      );
      return {
        output: `SEGMENT ${segNum} CLASS CHANGED TO ${newClass}`,
        updatedSession: { ...currentSession, segments: updatedSegs, pricing: undefined },
      };
    }

    // Date change: SB25NOV4
    const dateMatch = upper.match(/^SB(\d{1,2}[A-Z]{3})(\d+)$/);
    if (dateMatch) {
      const newDate = dateMatch[1];
      const segNum = parseInt(dateMatch[2], 10);
      const seg = currentSession.segments.find((s) => s.segmentNumber === segNum);
      if (!seg) {
        return { output: `SEGMENT ${segNum} NOT FOUND`, updatedSession: currentSession };
      }
      const updatedSegs = currentSession.segments.map((s) =>
        s.segmentNumber === segNum ? { ...s, date: newDate } : s
      );
      return {
        output: `SEGMENT ${segNum} TRAVEL DATE CHANGED TO ${newDate}`,
        updatedSession: { ...currentSession, segments: updatedSegs, pricing: undefined },
      };
    }

    // Flight change: SBEK585*3 or SBEK585/3
    const fltMatch = upper.match(/^SB([A-Z0-9]{2})(\d+)[*\/](\d+)$/);
    if (fltMatch) {
      const air = fltMatch[1];
      const flt = fltMatch[2];
      const segNum = parseInt(fltMatch[3], 10);
      const updatedSegs = currentSession.segments.map((s) =>
        s.segmentNumber === segNum ? { ...s, airline: air, flightNumber: flt } : s
      );
      return {
        output: `SEGMENT ${segNum} CHANGED TO ${air} ${flt}`,
        updatedSession: { ...currentSession, segments: updatedSegs, pricing: undefined },
      };
    }
  }

  // 16. Electronic Ticket Itinerary Receipt & Email Dispatch:
  // - ITR (Display and trigger download/print for Electronic Ticket Receipt)
  // - ITR-EML-<EMAIL> / ITR/EML-<EMAIL> / ITR -EML-<EMAIL> / ITR-EMLA-<EMAIL> / itr-emla-<email>
  // - IEPJ-EML-<EMAIL> / IEPJ/EML-<EMAIL> / IEPJ -EML-<EMAIL> / IEPJ-EMLA-<EMAIL> / iepj-emla-<email>

  // A. ITR Email Dispatch:
  const itrEmailMatch = input.match(/^(?:ITR)\s*[-/]?\s*EML[A]?[-:]\s*(.+)$/i);
  if (itrEmailMatch) {
    const rawEmail = itrEmailMatch[1].replace('//', '@').trim();
    const itrData = buildItrReceiptData(currentSession, ticketSalesDatabase);
    if (!itrData) {
      return {
        output: 'NO ACTIVE ELECTRONIC TICKET RECORD - ISSUE TICKET FIRST (TTP)',
        updatedSession: currentSession,
      };
    }

    const emailUpper = rawEmail.toUpperCase();
    const output = [
      `OK - ITINERARY RECEIPT SENT TO ${emailUpper}`,
      `MAIL TRANSMISSION SUCCESSFUL`,
      `RLOC: 1A/${itrData.pnrLocator}    TKT: ${itrData.ticketNumber}    PAX: ${itrData.passengerName}`,
      `TOTAL: ${itrData.currency} ${itrData.totalFare.toLocaleString()}`,
    ].join('\n');

    return {
      output,
      updatedSession: currentSession,
      emailSent: {
        type: 'receipt',
        email: rawEmail,
        message: `Success: Electronic Ticket Receipt successfully dispatched to ${rawEmail}`,
      },
      itrData,
    };
  }

  // B. IEPJ Itinerary Email Dispatch:
  const iepjEmailMatch = input.match(/^(?:IEPJ)\s*[-/]?\s*EML[A]?[-:]\s*(.+)$/i);
  if (iepjEmailMatch) {
    const rawEmail = iepjEmailMatch[1].replace('//', '@').trim();
    if (!currentSession.pnrLocator && currentSession.segments.length === 0) {
      return {
        output: 'NO ACTIVE RECORD LOCATOR IN WORK AREA. SAVE WITH ER FIRST.',
        updatedSession: currentSession,
      };
    }

    const emailUpper = rawEmail.toUpperCase();
    const pnr = currentSession.pnrLocator || 'X7K9LP';
    const output = [
      `OK - ITINERARY RECEIPT SENT TO ${emailUpper}`,
      `MAIL TRANSMISSION SUCCESSFUL`,
      `RECORD LOCATOR: ${pnr}`,
    ].join('\n');

    return {
      output,
      updatedSession: currentSession,
      emailSent: {
        type: 'itinerary',
        email: rawEmail,
        message: `Success: Electronic Ticket Receipt successfully dispatched to ${rawEmail}`,
      },
    };
  }

  // C. ITR Display & Print:
  // Matches: ITR, itr, ITR/P1, ITR/L1, ITR/TKT, ITR-L1, ITR -L1, etc.
  const isItrDisplay = /^ITR(?:\s*|\/.*|-L\d+)?$/i.test(input);
  if (isItrDisplay) {
    const itrData = buildItrReceiptData(currentSession, ticketSalesDatabase);
    if (!itrData) {
      return {
        output: 'NO ACTIVE ELECTRONIC TICKET RECORD - ISSUE TICKET FIRST (TTP)',
        updatedSession: currentSession,
      };
    }

    const formattedOutput = formatItrTerminalOutput(itrData);

    return {
      output: formattedOutput,
      updatedSession: currentSession,
      isItr: true,
      itrData,
    };
  }

  // 17. Cancel Segments:
  // - XI: Cancel entire itinerary
  // - XE<N>, XE<N-M>, XE<N,M>: Cancel single segment, range, or list
  if (upper === 'XI') {
    const updated = {
      ...currentSession,
      segments: [],
      pricing: undefined,
    };
    return {
      output: 'ITINERARY CANCELLED',
      updatedSession: updated,
    };
  }

  if (upper.startsWith('XE')) {
    const arg = upper.substring(2).trim();

    // Range e.g. XE1-2
    if (arg.includes('-')) {
      const [startStr, endStr] = arg.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      const filtered = currentSession.segments
        .filter((s) => s.segmentNumber < start || s.segmentNumber > end)
        .map((s, idx) => ({ ...s, segmentNumber: idx + 1 }));

      return {
        output: `CANCELLED ELEMENTS ${start}-${end}`,
        updatedSession: {
          ...currentSession,
          segments: filtered,
          pricing: undefined,
        },
      };
    }

    // Comma-separated list e.g. XE1,3 or XE1,4
    if (arg.includes(',')) {
      const toRemove = arg.split(',').map((n) => parseInt(n.trim(), 10));
      const filtered = currentSession.segments
        .filter((s) => !toRemove.includes(s.segmentNumber))
        .map((s, idx) => ({ ...s, segmentNumber: idx + 1 }));

      return {
        output: `CANCELLED ELEMENTS ${toRemove.join(',')}`,
        updatedSession: {
          ...currentSession,
          segments: filtered,
          pricing: undefined,
        },
      };
    }

    // Single element e.g. XE1
    const segNum = parseInt(arg, 10);
    if (!isNaN(segNum)) {
      const filtered = currentSession.segments
        .filter((s) => s.segmentNumber !== segNum)
        .map((s, idx) => ({ ...s, segmentNumber: idx + 1 }));

      return {
        output: `CANCELLED ELEMENT ${segNum}`,
        updatedSession: {
          ...currentSession,
          segments: filtered,
          pricing: undefined,
        },
      };
    }
  }

  // 18. Ignore: IG
  if (upper === 'IG') {
    const freshSession = createInitialSession(currentSession.officeId, currentSession.agentDuty);
    return {
      output: 'IGNORED',
      updatedSession: freshSession,
    };
  }

  // 19. Clear Screen: CLEAR or CLS
  if (upper === 'CLEAR' || upper === 'CLS') {
    return {
      output: '',
      updatedSession: currentSession,
      clearTerminal: true,
    };
  }

  // 20. Help / Cheat sheet command: HE or HELP
  if (upper === 'HE' || upper === 'HELP') {
    const output = [
      `AMADEUS SELLING PLATFORM CONNECT - TRAINING COMMAND REFERENCE`,
      `-----------------------------------------------------------------------------`,
      `1. AVAILABILITY & FARE SEARCH:`,
      `   AN<DATE><ORIG><DEST>/A<AIRLINE>   : Flight Availability (e.g. AN20MAYDACLHR/AQR)`,
      `   FXD<ORIG>/D<DATE><DEST>           : Lowest Fare Search (e.g. FXDDAC/D20NOVJFK)`,
      `   FXDDAC/D20NOVJFK/D19DECDAC//AEK   : Round-Trip Fare Search with Airline Filter`,
      `   FXZ<OPTION_NO>                    : Book Option from Fare Search (e.g. FXZ1)`,
      `   DO<LINE_NO>                       : Flight planned information & aircraft specs`,
      ``,
      `2. ENCODE & DECODE:`,
      `   DAN<CITY>                         : Encode City/Airport (e.g. DANDHAKA, DANLONDON)`,
      `   DAC<CODE>                         : Decode City/Airport (e.g. DACDAC, DACLHR)`,
      `   DNA<AIRLINE_OR_CODE>              : Airline Encode/Decode (e.g. DNAQATAR, DNAQR)`,
      `   DC<COUNTRY_OR_CODE>               : Country Encode/Decode (e.g. DCCANADA, DCBD)`,
      `   DNE<AIRCRAFT_OR_CODE>             : Aircraft Encode/Decode (e.g. DNEBOEING, DNE777)`,
      ``,
      `3. PNR CREATION (MANDATORY 5 ELEMENTS):`,
      `   NM1<SURNAME>/<FIRSTNAME> <TITLE>  : Adult (e.g. NM1HOSSAIN/ABUL MR)`,
      `   NM1<SURNAME>/<NAME>(CHD/<DOB>)    : Child (e.g. NM1HOSSAIN/MD MSTR(CHD/21JUL12))`,
      `   NM1<ADULT>(INF <NAME>/<TITLE>/DOB): Infant (e.g. NM1HOSSAIN/ABUL MR(INF HASAN/MSTR/25FEB22))`,
      `   SS<SEATS><CLASS><LINE>            : Sell from AN (e.g. SS1Y1, SS2J1)`,
      `   AP <CONTACT>                      : Contact (e.g. AP SHOHOJ 01958658524 REF KARIM)`,
      `   TKOK / TKTL<DATE>                 : Ticketing Limit (e.g. TKOK, TKTL20MAY)`,
      `   RF <NAME>                         : Received From (e.g. RF KARIM or RFKARIM;ER)`,
      `   ER / ET                           : End & Retrieve (generates 6-letter PNR)`,
      `   IR                                : Ignore and Retrieve stored PNR`,
      `   RT / RT <PNR> / RT/<SURNAME>      : Retrieve active or specific PNR`,
      ``,
      `4. SPECIAL SERVICE REQUESTS (SSR):`,
      `   SR DOCS HK1-P-BD-EF0123456-BD-10FEB95-M-18NOV25-HOSSAIN/ABUL/P1 (Passport)`,
      `   SR CTCE HK1-ABCD//GMAIL.COM/P1    : Passenger Email`,
      `   SR CTCM HK1-01912345678/P1        : Passenger Mobile`,
      `   SR DOCO HK1-.../P1                : Visa / Resident Details`,
      `   SR DOCA HK1-D-.../P1              : Passenger Address Details`,
      `   SR MOML/P1                        : Muslim Meal`,
      `   SR MAAS-PAX KNOWS ONLY BENGALI/P1 : Meet & Assist`,
      ``,
      `5. PRICING & TICKETING:`,
      `   FXP                               : Price & Create TST (with BDT breakdown)`,
      `   FXX                               : Informative Pricing (Quote only)`,
      `   TTP                               : Issue 13-digit E-Ticket (e.g. 157-...)`,
      `   IEPJ-EML-ABCD@GMAIL.COM           : Send Itinerary Email`,
      `   ITR-EML-ABD@GMAIL.COM             : Send E-Ticket Receipt Copy`,
      ``,
      `6. NAVIGATION & SHORTCUTS:`,
      `   MD / MU / MT / MB                 : Move Down / Up / Top / Bottom`,
      `   CLEAR / CLS                       : Clear Terminal Canvas`,
      `   IG                                : Ignore work buffer`,
      `   XE<N> / XE<N-M> / XI              : Cancel segment(s) or whole itinerary`,
    ].join('\n');

    return {
      output,
      updatedSession: currentSession,
    };
  }

  // Default unrecognized command response
  return {
    output: `INVALID COMMAND OR ENTRY FORMAT: ${upper}\nTYPE 'HE' OR CLICK 'Hi, can I help you ?' FOR HELP`,
    updatedSession: currentSession,
  };
};
