import { BookedSegment, Passenger, PnrSession } from '../types';
import { QR_DAC_LHR_MOCK } from '../data/mockFlights';

export interface CommandResult {
  output: string;
  updatedSession: PnrSession;
  clearTerminal?: boolean;
}

export const createInitialSession = (officeId: string = 'DAC360', dutyCode: string = 'Student'): PnrSession => ({
  pnrLocator: null,
  officeId: officeId || 'DAC360',
  agentDuty: dutyCode || 'Student',
  passengers: [],
  segments: [],
  contacts: [],
  ticketingArrangement: null,
  receivedFrom: null,
  isTicketed: false,
  ticketNumbers: [],
  pricing: undefined,
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

// Helper to format standard PNR display
export const formatPnrDisplay = (session: PnrSession): string => {
  if (session.segments.length === 0 && session.passengers.length === 0) {
    return 'NO PNR IN WORK AREA';
  }

  const pnr = session.pnrLocator || 'WORK AREA';
  const now = new Date();
  const dateStr = '20MAY26';
  const timeStr = '0830Z';

  let lines: string[] = [];
  lines.push('--- RLR ---');
  lines.push(`RP/${session.officeId}/${session.officeId}            AA/SU  ${dateStr}/${timeStr}   ${pnr}`);

  let lineIndex = 1;

  // Passengers
  session.passengers.forEach((p) => {
    lines.push(` ${lineIndex++}.${p.surname}/${p.firstName} ${p.title}`);
  });

  // Segments
  session.segments.forEach((s) => {
    const flightPad = `${s.airline} ${s.flightNumber}`.padEnd(8, ' ');
    lines.push(` ${lineIndex++}  ${flightPad} ${s.bookingClass} ${s.date} 3 ${s.origin}${s.destination} ${s.status}  ${s.depTime} ${s.arrTime}   *1A/E*`);
  });

  // Contacts (AP)
  session.contacts.forEach((c) => {
    lines.push(` ${lineIndex++} AP ${c}`);
  });

  // Ticketing (TK)
  if (session.ticketingArrangement) {
    lines.push(` ${lineIndex++} TK ${session.ticketingArrangement}/${session.officeId}`);
  }

  // Ticket Numbers if issued
  if (session.isTicketed && session.ticketNumbers.length > 0) {
    session.ticketNumbers.forEach((tkt, idx) => {
      const paxName = session.passengers[idx] ? `${session.passengers[idx].surname}/${session.passengers[idx].firstName}` : 'PAX';
      const tot = session.pricing ? session.pricing.total : 99500;
      lines.push(` ${lineIndex++} FA PAX ${tkt}/ETQR/BDT${tot}/${dateStr}/${session.officeId}/21368575`);
    });
  }

  // Received From (RF)
  if (session.receivedFrom) {
    lines.push(`\nRECEIVED FROM - ${session.receivedFrom}`);
  }

  return lines.join('\n');
};

export const executeGdsCommand = (
  rawInput: string,
  currentSession: PnrSession,
  savedPnrs: Map<string, PnrSession>
): CommandResult => {
  const input = rawInput.trim();
  const upper = input.toUpperCase();

  // 1. Availability: AN (e.g. AN20MAYDACLHR/AQR, AN20MAYDACLHR, AN...)
  if (upper.startsWith('AN')) {
    // Exact representation matching screenshots 12 & 13
    const output = [
      `AN20MAYDACLHR/AQR`,
      `** AMADEUS AVAILABILITY - AN ** LHR HEATHROW.GB          69 WE 20MAY 0000`,
      ` 1  QR 639  J9 C9 D9 I9 R9 P9 Y9 /DAC 1 DOH    0410   0620   E0/77W`,
      `            B9 H9 K9 M9 L9 V9 S9 N9 Q9 T9 O9 W9`,
      `   BA:QR9709 J9 C9 D9 I9 R4 P4 Y9 /DOH    LHR 5 0755   1325   E0/777     14:15`,
      `            B9 H9 K9 M9 L9 V9 S9 N9 Q9 T9 O9 W9`,
      ` 2  QR 641  J9 C9 D9 I1 Y9 B9 H9 /DAC 1 DOH    1055   1305   E0/77W`,
      `            K9 M9 L9 V9 S9 N9 Q9 T9`,
      `    QR 015  J9 C9 D9 I1 Y9 B9 H9 /DOH    LHR 4 1510   2025   E0/359     14:30`,
      `            K9 M9 L9 V9 S9 N9 Q9 T9`,
      ` 3  QR 639  J9 C9 D8 Y9 B9 H9 K9 /DAC 1 DOH    0410   0620   E0/77W`,
      `            M9 L9 V9 S9 N9 Q9 T9 O9 W9`,
      `    QR 109  J9 C9 D8 Y9 B9 H9 K9 /DOH    LHR 4 0850   1405   E0/77W     14:55`,
      `            M9 L9 V9 S9 N9 Q9 T9 O9 W9`,
      ` 4  QR 641  J9 C9 D9 I9 R7 Y9 B9 /DAC 1 DOH    1055   1305   E0/77W`,
      `            H9 K9 M9 L9 V9 S9 N9 Q9 T9 O9 W9`,
      `    QR 111  J9 C9 D9 I9 R7 Y9 B9 /DOH    LHR 4 1655   2210   E0/351     16:15`,
      `            H9 K9 M9 L9 V9 S9 N9 Q9 T9 O9 W9`,
    ].join('\n');

    return {
      output,
      updatedSession: currentSession,
    };
  }

  // 2. Flight Details: DO (e.g. DO1, DO 1, DO)
  if (upper.startsWith('DO')) {
    // Match Screenshot 11 exactly!
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

  // 3. Sell Segment: SS<SEATS><CLASS><LINE_NO> (e.g. SS1Y1, SS2J1, SS1Y2)
  if (upper.startsWith('SS')) {
    // Parse format SS [seats] [class] [line]
    const match = upper.match(/^SS(\d+)([A-Z])(\d+)$/);
    if (!match) {
      return {
        output: 'FORMAT: SS<SEATS><CLASS><LINE> (e.g. SS1Y1 or SS2J1)',
        updatedSession: currentSession,
      };
    }

    const seats = parseInt(match[1], 10);
    const bookingClass = match[2];
    const lineNum = parseInt(match[3], 10);

    const flightOpt = QR_DAC_LHR_MOCK.find((f) => f.lineNum === lineNum) || QR_DAC_LHR_MOCK[0];

    const seg1: BookedSegment = {
      segmentNumber: currentSession.segments.length + 1,
      airline: flightOpt.flight1.airline,
      flightNumber: flightOpt.flight1.flightNumber,
      bookingClass,
      date: '20MAY',
      origin: flightOpt.flight1.origin,
      destination: flightOpt.flight1.destination,
      status: `HK${seats}`,
      depTime: flightOpt.flight1.depTime,
      arrTime: flightOpt.flight1.arrTime,
    };

    const newSegments = [...currentSession.segments, seg1];

    let confirmation = ` ${seg1.segmentNumber}  ${seg1.airline} ${seg1.flightNumber} ${seg1.bookingClass} ${seg1.date} ${seg1.origin}${seg1.destination} ${seg1.status} ${seg1.depTime} ${seg1.arrTime}  *1A/E*`;

    if (flightOpt.flight2) {
      const seg2: BookedSegment = {
        segmentNumber: currentSession.segments.length + 2,
        airline: flightOpt.flight2.airline,
        flightNumber: flightOpt.flight2.flightNumber,
        bookingClass,
        date: '20MAY',
        origin: flightOpt.flight2.origin,
        destination: flightOpt.flight2.destination,
        status: `HK${seats}`,
        depTime: flightOpt.flight2.depTime,
        arrTime: flightOpt.flight2.arrTime,
      };
      newSegments.push(seg2);
      const flightCode = flightOpt.flight2.codeshare ? 'BA9709' : `${seg2.airline} ${seg2.flightNumber}`;
      confirmation += `\n ${seg2.segmentNumber}  ${flightCode} ${seg2.bookingClass} ${seg2.date} ${seg2.origin}${seg2.destination} ${seg2.status} ${seg2.depTime} ${seg2.arrTime}  *1A/E*`;
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

  // 4. Passenger Name: NM1<SURNAME>/<FIRSTNAME> <TITLE> (e.g. NM1ISLAM/MOHAMMAD MR)
  if (upper.startsWith('NM')) {
    const match = upper.match(/^NM(\d+)([A-Z]+)\/([A-Z]+(?:\s+[A-Z]+)?)\s+([A-Z]+)$/);
    if (!match) {
      // General match
      const fallback = upper.replace(/^NM\d*/, '').trim();
      const parts = fallback.split('/');
      if (parts.length >= 2) {
        const surname = parts[0];
        const rest = parts[1].split(' ');
        const firstName = rest[0] || 'PAX';
        const title = rest[1] || 'MR';

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
        output: 'FORMAT: NM1SURNAME/FIRSTNAME TITLE (e.g. NM1ISLAM/MOHAMMAD MR)',
        updatedSession: currentSession,
      };
    }

    const surname = match[2];
    const firstName = match[3];
    const title = match[4];

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

  // 5. Contact Element: AP (e.g. AP +8801700000000, AP DAC 01700000000-M)
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

  // 6. Ticketing Arrangement: TKOK or TKTL<DATE> (e.g. TKOK, TKTL20MAY)
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

  // 7. Received From: RF (e.g. RF PASSPORT, RF AGENT)
  if (upper.startsWith('RF')) {
    const name = input.substring(2).trim() || 'PASSPORT';
    const updated = {
      ...currentSession,
      receivedFrom: name,
    };
    return {
      output: `RF ${name}`,
      updatedSession: updated,
    };
  }

  // 8. End and Retrieve (PNR Generation): ER or ET
  if (upper === 'ER' || upper === 'ET') {
    // Validation checks for mandatory elements
    if (currentSession.passengers.length === 0) {
      return {
        output: 'NEED PASSENGER NAME - NM1SURNAME/FIRSTNAME TITLE',
        updatedSession: currentSession,
      };
    }
    if (currentSession.segments.length === 0) {
      return {
        output: 'NO ITINERARY - SELL SEGMENT WITH SS COMMAND',
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

  // 9. Retrieve PNR: RT or RT <PNR>
  if (upper.startsWith('RT')) {
    const target = upper.substring(2).trim();
    if (!target) {
      // Return current working PNR
      return {
        output: formatPnrDisplay(currentSession),
        updatedSession: currentSession,
      };
    }

    const found = savedPnrs.get(target);
    if (found) {
      return {
        output: formatPnrDisplay(found),
        updatedSession: found,
      };
    }

    return {
      output: `NO PNR FOUND FOR RECORD LOCATOR: ${target}`,
      updatedSession: currentSession,
    };
  }

  // 10. Fare Pricing: FXP or FXX
  if (upper === 'FXP' || upper === 'FXX') {
    if (currentSession.segments.length === 0) {
      return {
        output: 'NO ITINERARY TO PRICE',
        updatedSession: currentSession,
      };
    }

    const baseFare = 85000;
    const taxes = 14500;
    const total = baseFare + taxes;

    const pricing = {
      baseFare,
      taxes,
      total,
      currency: 'BDT',
      fareBasis: 'YLRBD1',
    };

    const paxName = currentSession.passengers[0]
      ? `${currentSession.passengers[0].surname}/${currentSession.passengers[0].firstName} ${currentSession.passengers[0].title}`
      : 'ISLAM/MOHAMMAD MR';

    const output = [
      `01 ${paxName}`,
      `LAST TKT DTE 20MAY26 - DATE OF ORIGIN`,
      `------------------------------------------------------------`,
      `AL FLGT  BK T DATE  TIME  FARE BASIS      NVB  NVA   BG`,
      `DAC`,
      `DOH QR  639 Y Y 20MAY 0410 YLRBD1                  2PC`,
      `LHR BA 9709 Y Y 20MAY 0755 YLRBD1                  2PC`,
      ``,
      `BDT       ${baseFare.toLocaleString()}                   20MAY26DAC QR X/DOH BA LON804.82NUC`,
      `BDT       ${taxes.toLocaleString()}TAX                804.82END ROE105.613XT2000BD7500QA5000GB`,
      `BDT       ${total.toLocaleString()}TOT`,
      `PAGE 1/1`,
      upper === 'FXP' ? `TST 00001 CREATED` : `NO TST CREATED (QUOTATION ONLY)`,
    ].join('\n');

    const updated = {
      ...currentSession,
      pricing,
    };

    return {
      output,
      updatedSession: updated,
    };
  }

  // 11. Ticket Issuance: TTP or TTP/RT
  if (upper.startsWith('TTP')) {
    if (!currentSession.pnrLocator) {
      return {
        output: 'PNR MUST BE ENDED AND RETRIEVED (ER) BEFORE ISSUING TICKET',
        updatedSession: currentSession,
      };
    }

    if (!currentSession.pricing) {
      return {
        output: 'NEED TST - RUN FXP TO PRICE ITINERARY BEFORE ISSUANCE',
        updatedSession: currentSession,
      };
    }

    if (currentSession.isTicketed) {
      return {
        output: 'ALREADY TICKETED - TICKET NUMBERS ISSUED',
        updatedSession: currentSession,
      };
    }

    // Generate 13-digit Amadeus e-ticket number
    // Airline code 157 (Qatar Airways)
    const tktNumber = `157-${Math.floor(2000000000 + Math.random() * 8000000000)}`;
    const ticketNumbers = [tktNumber];

    const updated: PnrSession = {
      ...currentSession,
      isTicketed: true,
      ticketNumbers,
    };

    savedPnrs.set(currentSession.pnrLocator, updated);

    const totalAmount = updated.pricing ? updated.pricing.total : 99500;
    const output = [
      `OK ETICKET ISSUED`,
      `FA PAX ${tktNumber}/ETQR/BDT${totalAmount}/20MAY26/${updated.officeId}/21368575`,
      `TKT ISSUED / OK`,
    ].join('\n');

    return {
      output,
      updatedSession: updated,
    };
  }

  // 12. Ignore: IG (matching screenshot 10)
  if (upper === 'IG') {
    const freshSession = createInitialSession(currentSession.officeId, currentSession.agentDuty);
    return {
      output: 'IGNORED',
      updatedSession: freshSession,
    };
  }

  // 12b. Clear Screen: CLEAR / CLS
  if (upper === 'CLEAR' || upper === 'CLS') {
    return {
      output: '',
      updatedSession: currentSession,
    };
  }

  // 13. Cancel segments: XI
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

  // 14. Cancel element: XE<NUM>
  if (upper.startsWith('XE')) {
    const segNum = parseInt(upper.substring(2), 10);
    const updatedSegments = currentSession.segments.filter((s) => s.segmentNumber !== segNum);
    return {
      output: `CANCELLED ELEMENT ${segNum}`,
      updatedSession: {
        ...currentSession,
        segments: updatedSegments,
      },
    };
  }

  // 15. Decode Airport: DAC <CODE>
  if (upper.startsWith('DAC ')) {
    const code = upper.substring(4).trim();
    const map: Record<string, string> = {
      DAC: 'DAC  DHAKA / BANGLADESH (HAZRAT SHAHJALAL INTL)',
      LHR: 'LHR  LONDON / UNITED KINGDOM (HEATHROW)',
      DOH: 'DOH  DOHA / QATAR (HAMAD INTL)',
      DXB: 'DXB  DUBAI / UNITED ARAB EMIRATES',
      JFK: 'JFK  NEW YORK / NY USA (JOHN F KENNEDY)',
      SIN: 'SIN  SINGAPORE / SINGAPORE (CHANGI)',
      BKK: 'BKK  BANGKOK / THAILAND (SUVARNABHUMI)',
      KUL: 'KUL  KUALA LUMPUR / MALAYSIA',
      IST: 'IST  ISTANBUL / TURKEY',
    };
    return {
      output: map[code] || `${code}  DECODED CITY / AIRPORT RECORD FOUND`,
      updatedSession: currentSession,
    };
  }

  // 16. Decode Airline: DNA <CODE>
  if (upper.startsWith('DNA ')) {
    const code = upper.substring(4).trim();
    const map: Record<string, string> = {
      QR: 'QR  157  QATAR AIRWAYS',
      BA: 'BA  125  BRITISH AIRWAYS',
      EK: 'EK  176  EMIRATES',
      BG: 'BG  997  BIMAN BANGLADESH AIRLINES',
      TK: 'TK  235  TURKISH AIRLINES',
      SQ: 'SQ  618  SINGAPORE AIRLINES',
      SV: 'SV  065  SAUDIA',
      KU: 'KU  229  KUWAIT AIRWAYS',
    };
    return {
      output: map[code] || `${code}  AIRLINE RECORD LOCATED`,
      updatedSession: currentSession,
    };
  }

  // 17. Help / Cheat sheet command
  if (upper === 'HE' || upper === 'HELP') {
    const output = [
      `AMADEUS BASIC COMMAND HELP GUIDE:`,
      ` 1. AVAILABILITY : AN<DATE><DEP><ARR>/A<AIRLINE> (e.g. AN20MAYDACLHR/AQR)`,
      ` 2. FLIGHT INFO  : DO<LINE_NO> (e.g. DO1)`,
      ` 3. SELL SEAT    : SS<SEATS><CLASS><LINE> (e.g. SS1Y1)`,
      ` 4. PASSENGER    : NM1<SURNAME>/<FIRSTNAME> <TITLE> (e.g. NM1ISLAM/MOHAMMAD MR)`,
      ` 5. CONTACT      : AP <PHONE/EMAIL> (e.g. AP +8801700000000)`,
      ` 6. TICKET ELEM  : TKOK or TKTL<DATE> (e.g. TKOK)`,
      ` 7. RECEIVED FROM: RF <NAME> (e.g. RF PASSPORT)`,
      ` 8. END & RETRIVE: ER or ET (Generates 6-letter PNR)`,
      ` 9. RETRIEVE PNR : RT or RT <PNR>`,
      `10. PRICE FARE   : FXP (Stores TST) or FXX (Quote only)`,
      `11. ISSUE TICKET : TTP (Issues 13-digit E-Ticket)`,
      `12. IGNORE WORK  : IG (Clears work area & resets screen)`,
      `13. CLEAR SCREEN : CLEAR or CLS (Wipes screen clean)`,
      `14. CANCEL SEG   : XI (Cancels segments)`,
    ].join('\n');
    return {
      output,
      updatedSession: currentSession,
    };
  }

  // Default / Unrecognized command
  return {
    output: `INVALID COMMAND OR ENTRY FORMAT: ${upper}\nTYPE 'HE' OR CLICK 'Hi, can I help you ?' FOR HELP`,
    updatedSession: currentSession,
  };
};
