import { AvailabilityOption, FareSearchOption, FareSearchFlight } from '../types';
import { AIRPORTS, AIRLINES } from '../data/gdsDatabase';

// Helper to format date string e.g. "20MAY" or "15OCT"
export const cleanGdsDate = (rawDate?: string): string => {
  if (!rawDate) return '20MAY';
  const clean = rawDate.toUpperCase().trim();
  return clean || '20MAY';
};

// Generate authentic Amadeus AN availability display
export const generateAvailability = (
  date: string,
  origin: string,
  destination: string,
  airlineFilter?: string
): { options: AvailabilityOption[]; displayText: string } => {
  const orig = origin.toUpperCase().substring(0, 3);
  const dest = destination.toUpperCase().substring(0, 3);
  const dte = cleanGdsDate(date);
  const air = airlineFilter ? airlineFilter.toUpperCase().substring(0, 2) : undefined;

  const destAirport = AIRPORTS.find((a) => a.code === dest);
  const destName = destAirport ? `${destAirport.city} ${destAirport.name}.${destAirport.countryCode}` : `${dest}.${dest}`;

  // Build standard 4 options based on route & airline filter
  const options: AvailabilityOption[] = [];

  // Determine dominant airlines for this route
  let preferredAirlines = air ? [air] : ['QR', 'EK', 'BG', 'SV', 'TK', 'SQ'];
  if (air && !preferredAirlines.includes(air)) preferredAirlines = [air];

  if (orig === 'DAC' && dest === 'LHR') {
    if (!air || air === 'QR') {
      options.push({
        lineNum: 1,
        date: dte,
        flight1: {
          airline: 'QR',
          flightNumber: '639',
          classes1: 'J9 C9 D9 I9 R9 P9 Y9',
          classes2: 'B9 H9 K9 M9 L9 V9 S9 N9 Q9 T9 O9 W9',
          origin: 'DAC',
          originTerm: '1',
          destination: 'DOH',
          depTime: '0410',
          arrTime: '0620',
          equip: '77W',
        },
        flight2: {
          airline: 'QR',
          flightNumber: '9709',
          codeshare: 'BA:QR9709',
          classes1: 'J9 C9 D9 I9 R4 P4 Y9',
          classes2: 'B9 H9 K9 M9 L9 V9 S9 N9 Q9 T9 O9 W9',
          origin: 'DOH',
          destination: 'LHR',
          destTerm: '5',
          depTime: '0755',
          arrTime: '1325',
          equip: '777',
          elapsedTime: '14:15',
        },
      });

      options.push({
        lineNum: 2,
        date: dte,
        flight1: {
          airline: 'QR',
          flightNumber: '641',
          classes1: 'J9 C9 D9 I1 Y9 B9 H9',
          classes2: 'K9 M9 L9 V9 S9 N9 Q9 T9',
          origin: 'DAC',
          originTerm: '1',
          destination: 'DOH',
          depTime: '1055',
          arrTime: '1305',
          equip: '77W',
        },
        flight2: {
          airline: 'QR',
          flightNumber: '015',
          classes1: 'J9 C9 D9 I1 Y9 B9 H9',
          classes2: 'K9 M9 L9 V9 S9 N9 Q9 T9',
          origin: 'DOH',
          destination: 'LHR',
          destTerm: '4',
          depTime: '1510',
          arrTime: '2025',
          equip: '359',
          elapsedTime: '14:30',
        },
      });

      options.push({
        lineNum: 3,
        date: dte,
        flight1: {
          airline: 'QR',
          flightNumber: '639',
          classes1: 'J9 C9 D8 Y9 B9 H9 K9',
          classes2: 'M9 L9 V9 S9 N9 Q9 T9 O9 W9',
          origin: 'DAC',
          originTerm: '1',
          destination: 'DOH',
          depTime: '0410',
          arrTime: '0620',
          equip: '77W',
        },
        flight2: {
          airline: 'QR',
          flightNumber: '109',
          classes1: 'J9 C9 D8 Y9 B9 H9 K9',
          classes2: 'M9 L9 V9 S9 N9 Q9 T9 O9 W9',
          origin: 'DOH',
          destination: 'LHR',
          destTerm: '4',
          depTime: '0850',
          arrTime: '1405',
          equip: '77W',
          elapsedTime: '14:55',
        },
      });

      options.push({
        lineNum: 4,
        date: dte,
        flight1: {
          airline: 'QR',
          flightNumber: '641',
          classes1: 'J9 C9 D9 I9 R7 Y9 B9',
          classes2: 'H9 K9 M9 L9 V9 S9 N9 Q9 T9 O9 W9',
          origin: 'DAC',
          originTerm: '1',
          destination: 'DOH',
          depTime: '1055',
          arrTime: '1305',
          equip: '77W',
        },
        flight2: {
          airline: 'QR',
          flightNumber: '111',
          classes1: 'J9 C9 D9 I9 R7 Y9 B9',
          classes2: 'H9 K9 M9 L9 V9 S9 N9 Q9 T9 O9 W9',
          origin: 'DOH',
          destination: 'LHR',
          destTerm: '4',
          depTime: '1655',
          arrTime: '2210',
          equip: '351',
          elapsedTime: '16:15',
        },
      });
    } else if (air === 'EK') {
      options.push({
        lineNum: 1,
        date: dte,
        flight1: {
          airline: 'EK',
          flightNumber: '583',
          classes1: 'F4 A4 J7 C7 I4 Y9 B9',
          classes2: 'M9 K9 H9 Q9 L9 T9 V9',
          origin: 'DAC',
          destination: 'DXB',
          depTime: '0955',
          arrTime: '1300',
          equip: '77W',
        },
        flight2: {
          airline: 'EK',
          flightNumber: '029',
          classes1: 'F4 A4 J7 C7 I4 Y9 B9',
          classes2: 'M9 K9 H9 Q9 L9 T9 V9',
          origin: 'DXB',
          destination: 'LHR',
          destTerm: '3',
          depTime: '1545',
          arrTime: '2015',
          equip: '380',
          elapsedTime: '15:20',
        },
      });
      options.push({
        lineNum: 2,
        date: dte,
        flight1: {
          airline: 'EK',
          flightNumber: '587',
          classes1: 'J7 C7 Y9 B9 M9 K9 H9',
          classes2: 'Q9 L9 T9 V9',
          origin: 'DAC',
          destination: 'DXB',
          depTime: '1930',
          arrTime: '2240',
          equip: '77W',
        },
        flight2: {
          airline: 'EK',
          flightNumber: '001',
          classes1: 'J7 C7 Y9 B9 M9 K9 H9',
          classes2: 'Q9 L9 T9 V9',
          origin: 'DXB',
          destination: 'LHR',
          destTerm: '3',
          depTime: '0245',
          arrTime: '0650',
          equip: '380',
          elapsedTime: '16:20',
        },
      });
    }
  } else if (orig === 'DAC' && dest === 'DXB') {
    // Direct flights
    options.push({
      lineNum: 1,
      date: dte,
      flight1: {
        airline: 'EK',
        flightNumber: '585',
        classes1: 'F4 A2 J9 C9 I7 Y9 B9',
        classes2: 'M9 K9 H9 Q9 L9 T9 V9',
        origin: 'DAC',
        originTerm: '1',
        destination: 'DXB',
        destTerm: '3',
        depTime: '0140',
        arrTime: '0510',
        equip: '77W',
      },
    });
    options.push({
      lineNum: 2,
      date: dte,
      flight1: {
        airline: 'BG',
        flightNumber: '347',
        classes1: 'J4 C2 D1 Y9 B9 M9 K9',
        classes2: 'H9 Q9 L9 V9',
        origin: 'DAC',
        originTerm: '1',
        destination: 'DXB',
        destTerm: '1',
        depTime: '0700',
        arrTime: '1040',
        equip: '788',
      },
    });
    options.push({
      lineNum: 3,
      date: dte,
      flight1: {
        airline: 'EK',
        flightNumber: '583',
        classes1: 'F2 J9 C7 Y9 B9 M9 K9',
        classes2: 'H9 Q9 L9 V9',
        origin: 'DAC',
        originTerm: '1',
        destination: 'DXB',
        destTerm: '3',
        depTime: '0955',
        arrTime: '1300',
        equip: '77W',
      },
    });
    options.push({
      lineNum: 4,
      date: dte,
      flight1: {
        airline: 'BS',
        flightNumber: '341',
        classes1: 'J4 C4 Y9 B9 M9 K9 L9',
        origin: 'DAC',
        originTerm: '1',
        destination: 'DXB',
        destTerm: '1',
        depTime: '1830',
        arrTime: '2215',
        equip: '738',
      },
    });
  } else if (orig === 'DAC' && dest === 'JFK') {
    const mainAir = air || 'QR';
    if (mainAir === 'EK') {
      options.push({
        lineNum: 1,
        date: dte,
        flight1: {
          airline: 'EK',
          flightNumber: '585',
          classes1: 'F4 A4 J7 C7 Y9 B9 M9',
          classes2: 'K9 H9 Q9 L9',
          origin: 'DAC',
          originTerm: '1',
          destination: 'DXB',
          destTerm: '3',
          depTime: '0140',
          arrTime: '0510',
          equip: '77W',
        },
        flight2: {
          airline: 'EK',
          flightNumber: '201',
          classes1: 'F4 A4 J7 C7 Y9 B9 M9',
          classes2: 'K9 H9 Q9 L9',
          origin: 'DXB',
          destination: 'JFK',
          destTerm: '4',
          depTime: '0830',
          arrTime: '1425',
          equip: '380',
          elapsedTime: '21:45',
        },
      });
      options.push({
        lineNum: 2,
        date: dte,
        flight1: {
          airline: 'EK',
          flightNumber: '583',
          classes1: 'J7 C7 Y9 B9 M9 K9',
          origin: 'DAC',
          destination: 'DXB',
          depTime: '0955',
          arrTime: '1300',
          equip: '77W',
        },
        flight2: {
          airline: 'EK',
          flightNumber: '203',
          classes1: 'J7 C7 Y9 B9 M9 K9',
          origin: 'DXB',
          destination: 'JFK',
          destTerm: '4',
          depTime: '1615',
          arrTime: '2210',
          equip: '380',
          elapsedTime: '21:15',
        },
      });
    } else {
      options.push({
        lineNum: 1,
        date: dte,
        flight1: {
          airline: 'QR',
          flightNumber: '639',
          classes1: 'J9 C9 D9 I9 Y9 B9 H9',
          classes2: 'K9 M9 L9 V9 S9 N9 Q9',
          origin: 'DAC',
          originTerm: '1',
          destination: 'DOH',
          depTime: '0410',
          arrTime: '0620',
          equip: '77W',
        },
        flight2: {
          airline: 'QR',
          flightNumber: '701',
          classes1: 'J9 C9 D9 I9 Y9 B9 H9',
          classes2: 'K9 M9 L9 V9 S9 N9 Q9',
          origin: 'DOH',
          destination: 'JFK',
          destTerm: '8',
          depTime: '0815',
          arrTime: '1440',
          equip: '351',
          elapsedTime: '21:30',
        },
      });
      options.push({
        lineNum: 2,
        date: dte,
        flight1: {
          airline: 'QR',
          flightNumber: '641',
          classes1: 'J9 C9 D7 Y9 B9 H9 K9',
          origin: 'DAC',
          originTerm: '1',
          destination: 'DOH',
          depTime: '1055',
          arrTime: '1305',
          equip: '77W',
        },
        flight2: {
          airline: 'QR',
          flightNumber: '703',
          classes1: 'J9 C9 D7 Y9 B9 H9 K9',
          origin: 'DOH',
          destination: 'JFK',
          destTerm: '8',
          depTime: '1730',
          arrTime: '2355',
          equip: '77W',
          elapsedTime: '22:00',
        },
      });
    }
  }

  // If no predefined options were matched, generate standard realistic options
  if (options.length === 0) {
    const selectedAirline = air || (preferredAirlines[0] || 'QR');
    const transitHub = selectedAirline === 'QR' ? 'DOH' : selectedAirline === 'EK' ? 'DXB' : selectedAirline === 'SV' ? 'JED' : 'IST';

    options.push({
      lineNum: 1,
      date: dte,
      flight1: {
        airline: selectedAirline,
        flightNumber: '639',
        classes1: 'J9 C9 D9 I9 Y9 B9 H9',
        classes2: 'K9 M9 L9 V9 S9 N9 Q9',
        origin: orig,
        originTerm: '1',
        destination: transitHub,
        depTime: '0410',
        arrTime: '0620',
        equip: '77W',
      },
      flight2: {
        airline: selectedAirline,
        flightNumber: '105',
        classes1: 'J9 C9 D9 I9 Y9 B9 H9',
        classes2: 'K9 M9 L9 V9 S9 N9 Q9',
        origin: transitHub,
        destination: dest,
        destTerm: '2',
        depTime: '0830',
        arrTime: '1340',
        equip: '789',
        elapsedTime: '14:30',
      },
    });

    options.push({
      lineNum: 2,
      date: dte,
      flight1: {
        airline: selectedAirline,
        flightNumber: '641',
        classes1: 'J9 C9 D8 Y9 B9 H9 K9',
        classes2: 'M9 L9 V9 S9 N9 Q9 T9',
        origin: orig,
        originTerm: '1',
        destination: transitHub,
        depTime: '1055',
        arrTime: '1305',
        equip: '77W',
      },
      flight2: {
        airline: selectedAirline,
        flightNumber: '111',
        classes1: 'J9 C9 D8 Y9 B9 H9 K9',
        classes2: 'M9 L9 V9 S9 N9 Q9 T9',
        origin: transitHub,
        destination: dest,
        destTerm: '2',
        depTime: '1540',
        arrTime: '2050',
        equip: '359',
        elapsedTime: '14:55',
      },
    });
  }

  // Format into authentic Amadeus text output
  const lines: string[] = [];
  const headerAir = air ? `/A${air}` : '';
  lines.push(`AN${dte}${orig}${dest}${headerAir}`);
  lines.push(`** AMADEUS AVAILABILITY - AN ** ${dest} ${destName.padEnd(28, ' ')} 69 WE ${dte} 0000`);

  options.forEach((opt) => {
    const f1 = opt.flight1;
    const f1Term = f1.originTerm ? ` ${f1.originTerm}` : '  ';
    const f1DestTerm = f1.destTerm ? ` ${f1.destTerm}` : '  ';
    const f1Line = ` ${opt.lineNum}  ${f1.airline} ${f1.flightNumber.padEnd(4, ' ')} ${f1.classes1} /${f1.origin}${f1Term} ${f1.destination}${f1DestTerm}  ${f1.depTime}   ${f1.arrTime}   E0/${f1.equip}`;
    lines.push(f1Line);

    if (f1.classes2) {
      lines.push(`            ${f1.classes2}`);
    }

    if (opt.flight2) {
      const f2 = opt.flight2;
      const f2Code = f2.codeshare ? `${f2.codeshare}`.padEnd(10, ' ') : `   ${f2.airline} ${f2.flightNumber.padEnd(4, ' ')}`;
      const f2Term = f2.originTerm ? ` ${f2.originTerm}` : '  ';
      const f2DestTerm = f2.destTerm ? ` ${f2.destTerm}` : '  ';
      const elapsed = f2.elapsedTime ? `     ${f2.elapsedTime}` : '';
      const f2Line = `   ${f2Code} ${f2.classes1} /${f2.origin}${f2Term} ${f2.destination}${f2DestTerm} ${f2.depTime}   ${f2.arrTime}   E0/${f2.equip}${elapsed}`;
      lines.push(f2Line);

      if (f2.classes2) {
        lines.push(`            ${f2.classes2}`);
      }
    }
  });

  return {
    options,
    displayText: lines.join('\n'),
  };
};

// Generate Lowest Fare Search (FXD - Best Buy Search)
export const generateLowestFareSearch = (
  rawCmd: string
): { options: FareSearchOption[]; displayText: string } => {
  const upper = rawCmd.toUpperCase().trim();

  // Parsing:
  // e.g. FXDDAC/D20NOVJFK
  // e.g. FXDDAC/D20NOVJFK//AQR
  // e.g. FXDDAC/D20NOVJFK/D19DECDAC
  // e.g. FXDDAC/D20NOVJFK//KC
  // e.g. FXDDAC/D20NOVJFK//PAX/2/RCH/INF/1

  // Extract origin
  const origMatch = upper.match(/^FXD([A-Z]{3})/);
  const orig = origMatch ? origMatch[1] : 'DAC';

  // Extract dates and cities: /D20NOVJFK or /D19DECDAC
  const legMatches = [...upper.matchAll(/\/D(\d{1,2}[A-Z]{3})([A-Z]{3})/g)];
  const leg1Date = legMatches[0] ? legMatches[0][1] : '20NOV';
  const dest1 = legMatches[0] ? legMatches[0][2] : 'JFK';
  const isRoundTrip = legMatches.length >= 2;
  const leg2Date = isRoundTrip ? legMatches[1][1] : undefined;
  const dest2 = isRoundTrip ? legMatches[1][2] : undefined;

  // Extract airline filter: //AQR or //AEK
  const airMatch = upper.match(/\/\/A([A-Z0-9]{2})/);
  const airlineFilter = airMatch ? airMatch[1] : undefined;

  // Extract cabin class: //KC (Club/Business), //KY (Economy)
  const isBusiness = upper.includes('//KC') || upper.includes('/KC');

  // Extract passenger counts: e.g. //PAX/2/RCH/INF/1
  let adt = 1;
  let chd = 0;
  let inf = 0;

  const paxMatch = upper.match(/PAX\/(\d+)/);
  if (paxMatch) adt = parseInt(paxMatch[1], 10);

  if (upper.includes('/RCH') || upper.includes('/CHD')) chd = 1;
  const infMatch = upper.match(/INF\/(\d+)/);
  if (infMatch) inf = parseInt(infMatch[1], 10);

  // Available airlines for fare search
  // If specific airline requested: generate 3-4 varied schedule options for that carrier
  // If no airline filter: generate 6 diverse options across QR, EK, BG, SV, SQ, TK
  const airlinesToUse = airlineFilter
    ? [airlineFilter, airlineFilter, airlineFilter, airlineFilter]
    : ['QR', 'EK', 'BG', 'SV', 'SQ', 'TK'];

  const options: FareSearchOption[] = [];

  const timeSlots = [
    { dep1: '0410', arr1: '0620', dep2: '0815', arr2: '1440', retDep1: '1630', retArr1: '0910', retDep2: '1240', retArr2: '1955', cls: 'O' },
    { dep1: '1055', arr1: '1305', dep2: '1730', arr2: '2355', retDep1: '2100', retArr1: '1340', retDep2: '1800', retArr2: '0115', cls: 'T' },
    { dep1: '1945', arr1: '2200', dep2: '0140', arr2: '0815', retDep1: '1130', retArr1: '0415', retDep2: '0845', retArr2: '1600', cls: 'Q' },
    { dep1: '2315', arr1: '0130', dep2: '0320', arr2: '0955', retDep1: '1400', retArr1: '0640', retDep2: '1015', retArr2: '1730', cls: 'M' },
    { dep1: '0730', arr1: '1005', dep2: '1345', arr2: '2010', retDep1: '1830', retArr1: '1110', retDep2: '1540', retArr2: '2255', cls: 'V' },
    { dep1: '1520', arr1: '1745', dep2: '2115', arr2: '0340', retDep1: '2300', retArr1: '1540', retDep2: '2000', retArr2: '0315', cls: 'L' },
  ];

  airlinesToUse.forEach((airline, index) => {
    const optNum = index + 1;
    const slot = timeSlots[index % timeSlots.length];

    let baseUnitFare = isBusiness
      ? (dest1 === 'JFK' ? 320000 : dest1 === 'LHR' ? 260000 : dest1 === 'SIN' ? 140000 : 180000)
      : (dest1 === 'JFK' ? 115000 : dest1 === 'LHR' ? 95000 : dest1 === 'SIN' ? 45000 : 65000);

    // Apply variation per airline
    if (airline === 'BG') baseUnitFare = Math.round(baseUnitFare * 0.88);
    if (airline === 'SV') baseUnitFare = Math.round(baseUnitFare * 0.92);
    if (airline === 'SQ') baseUnitFare = Math.round(baseUnitFare * 1.05);

    const taxUnit = isBusiness ? 35000 : 22000;
    const roundTripMultiplier = isRoundTrip ? 1.75 : 1.0;

    const adtFare = Math.round((baseUnitFare + taxUnit) * roundTripMultiplier);
    const chdFare = Math.round(((baseUnitFare * 0.75) + (taxUnit * 0.85)) * roundTripMultiplier);
    const infFare = Math.round(((baseUnitFare * 0.1) + 4000) * roundTripMultiplier);

    const totalFare = (adtFare * adt) + (chdFare * chd) + (infFare * inf);
    const baseTotal = Math.round(baseUnitFare * roundTripMultiplier * (adt + chd * 0.75 + inf * 0.1));
    const taxesTotal = totalFare - baseTotal;

    const flights: FareSearchFlight[] = [];

    // Outbound flight 1 (e.g. DAC to transit)
    const transit = airline === 'QR' ? 'DOH' : airline === 'EK' ? 'DXB' : airline === 'SV' ? 'JED' : airline === 'SQ' ? 'SIN' : airline === 'TK' ? 'IST' : 'DXB';
    const bookClass = isBusiness ? 'J' : (airline === 'QR' ? 'O' : airline === 'EK' ? 'T' : slot.cls);

    flights.push({
      airline,
      flightNumber: airline === 'QR' ? (639 + index * 2).toString() : airline === 'EK' ? (585 + index).toString() : airline === 'BG' ? (index === 0 ? '084' : '086') : (347 + index).toString(),
      origin: orig,
      destination: transit,
      date: leg1Date,
      depTime: slot.dep1,
      arrTime: slot.arr1,
      bookingClass: bookClass,
      equip: '77W',
    });

    // Outbound flight 2 (transit to dest1)
    flights.push({
      airline,
      flightNumber: airline === 'QR' ? (701 + index * 2).toString() : airline === 'EK' ? (201 + index).toString() : (101 + index).toString(),
      origin: transit,
      destination: dest1,
      date: leg1Date,
      depTime: slot.dep2,
      arrTime: slot.arr2,
      bookingClass: bookClass,
      equip: airline === 'EK' ? '380' : '351',
    });

    // If round-trip, add inbound flights
    if (isRoundTrip && leg2Date && dest2) {
      flights.push({
        airline,
        flightNumber: airline === 'QR' ? (702 + index * 2).toString() : airline === 'EK' ? (202 + index).toString() : (102 + index).toString(),
        origin: dest1,
        destination: transit,
        date: leg2Date,
        depTime: slot.retDep1,
        arrTime: slot.retArr1,
        bookingClass: bookClass,
        equip: airline === 'EK' ? '380' : '351',
      });
      flights.push({
        airline,
        flightNumber: airline === 'QR' ? (640 + index * 2).toString() : airline === 'EK' ? (586 + index).toString() : (348 + index).toString(),
        origin: transit,
        destination: dest2,
        date: leg2Date,
        depTime: slot.retDep2,
        arrTime: slot.retArr2,
        bookingClass: bookClass,
        equip: '77W',
      });
    }

    options.push({
      optionNumber: optNum,
      airline,
      flights,
      fareBasis: isBusiness ? 'JLRBD1' : `${bookClass}LRBD1`,
      currency: 'BDT',
      baseFare: baseTotal,
      taxes: taxesTotal,
      totalFare,
      paxCount: { adt, chd, inf },
    });
  });

  // Build authentic Amadeus FXD text output
  const lines: string[] = [];
  lines.push(`FXD BEST BUY - FARE SEARCH RESULTS: ${orig} TO ${dest1}${isRoundTrip ? ' / ' + dest1 + ' TO ' + dest2 : ''}`);
  lines.push(`CURRENCY: BDT   PASSENGERS: ${adt} ADT${chd > 0 ? `, ${chd} CHD` : ''}${inf > 0 ? `, ${inf} INF` : ''}   CABIN: ${isBusiness ? 'BUSINESS (C)' : 'ECONOMY (Y)'}`);
  lines.push(`-----------------------------------------------------------------------------`);

  options.forEach((opt) => {
    const optNumPad = String(opt.optionNumber).padStart(2, '0');
    const airInfo = AIRLINES.find((a) => a.code === opt.airline);
    const airName = airInfo ? airInfo.name : opt.airline;

    lines.push(`OPTION ${optNumPad} - ${airName} (${opt.airline})`);
    lines.push(`TOTAL FARE: ${opt.currency} ${opt.totalFare.toLocaleString()} (BASE: ${opt.currency} ${opt.baseFare.toLocaleString()} + TAX: ${opt.currency} ${opt.taxes.toLocaleString()})`);
    lines.push(`ITINERARY:`);

    opt.flights.forEach((flt, fIdx) => {
      const segNum = fIdx + 1;
      lines.push(` ${segNum}  ${flt.airline} ${flt.flightNumber.padEnd(4, ' ')} ${flt.bookingClass} ${flt.date} ${flt.origin}${flt.destination} ${flt.depTime} ${flt.arrTime}  ${flt.equip}`);
    });

    lines.push(`FARE BASIS: ${opt.fareBasis}    BAGGAGE: 2PC`);
    lines.push(``);
  });

  lines.push(`-----------------------------------------------------------------------------`);
  lines.push(`>>> TO BOOK USE FXZ1, FXZ2, FXZ3... <<<`);

  return {
    options,
    displayText: lines.join('\n'),
  };
};

// 3. Timetable Search (TN): e.g. TN20SEPDACSIN/ABG, TNDACCCU/ABG, TNDACCCU, TN20MAYDACLHR
export const generateTimetable = (rawCmd: string): string => {
  const upper = rawCmd.toUpperCase().trim();
  const afterTn = upper.substring(2).trim();

  // Parsing: date (optional), origin (3), destination (3), /A airline (optional)
  const match = afterTn.match(/^(?:(\d{1,2}[A-Z]{3}))?([A-Z]{3})([A-Z]{3})(?:\/A([A-Z0-9]{2}))?/);

  let date = '20SEP26';
  let orig = 'DAC';
  let dest = 'SIN';
  let air: string | undefined = undefined;

  if (match) {
    if (match[1]) date = match[1] + (match[1].length <= 5 ? '26' : '');
    orig = match[2];
    dest = match[3];
    air = match[4];
  } else {
    // fallback extraction
    const pairMatch = afterTn.match(/([A-Z]{3})([A-Z]{3})/);
    if (pairMatch) {
      orig = pairMatch[1];
      dest = pairMatch[2];
    }
    const airMatch = afterTn.match(/\/A([A-Z0-9]{2})/);
    if (airMatch) air = airMatch[1];
  }

  const destAirport = AIRPORTS.find((a) => a.code === dest);
  const destName = destAirport ? `${destAirport.city} ${destAirport.name}.${destAirport.countryCode}` : `${dest}.${dest}`;

  const lines: string[] = [];
  lines.push(`** AMADEUS TIMETABLE - TN ** ${dest} ${destName.padEnd(26, ' ')} ${date}`);

  if (orig === 'DAC' && dest === 'SIN') {
    lines.push(`1   BG 084  1.3.5.7  DAC   0830    SIN 1445  0  ${date} 28OCT26 738  4:15`);
    lines.push(`2   BG 086  .2.4.6.  DAC   2355    SIN 0610+1 0 ${date} 28OCT26 77W  4:15`);
    lines.push(`3   SQ 447  1234567  DAC   2355    SIN 0605+1 0 ${date} 28OCT26 359  4:10`);
    lines.push(`4   BS 307  1234567  DAC   2230    SIN 0445+1 0 ${date} 28OCT26 738  4:15`);
  } else if (orig === 'DAC' && dest === 'CCU') {
    lines.push(`1   BG 391  1234567  DAC   0730    CCU 0815  0  ${date} 28OCT26 DH8  0:45`);
    lines.push(`2   BG 395  1234567  DAC   1645    CCU 1730  0  ${date} 28OCT26 DH8  0:45`);
    lines.push(`3   6E 1108 1234567  DAC   1900    CCU 1945  0  ${date} 28OCT26 320  0:45`);
    lines.push(`4   BS 201  1.3.5.7  DAC   1115    CCU 1200  0  ${date} 28OCT26 ATR  0:45`);
  } else if (orig === 'DAC' && dest === 'LHR') {
    lines.push(`1   BG 201  ..3...7  DAC   1005    LHR 1600  0  ${date} 28OCT26 77W 10:55`);
    lines.push(`2   BG 205  .2...6.  DAC   0330    LHR 0925  0  ${date} 28OCT26 789 10:55`);
    lines.push(`3   QR 639  1234567  DAC   0410    LHR 1325  1  ${date} 28OCT26 77W 14:15`);
    lines.push(`4   EK 585  1234567  DAC   0140    LHR 1200  1  ${date} 28OCT26 380 15:20`);
  } else if (orig === 'DAC' && dest === 'KUL') {
    lines.push(`1   MH 197  1234567  DAC   0055    KUL 0655  0  ${date} 28OCT26 738  4:00`);
    lines.push(`2   MH 113  1234567  DAC   1220    KUL 1820  0  ${date} 28OCT26 738  4:00`);
    lines.push(`3   BG 082  1.3.5.7  DAC   2230    KUL 0430+1 0 ${date} 28OCT26 738  4:00`);
    lines.push(`4   OD 163  1234567  DAC   0210    KUL 0810  0  ${date} 28OCT26 738  4:00`);
  } else {
    const selectedAir = air || 'BG';
    lines.push(`1   ${selectedAir} 101  1.3.5.7  ${orig}   0800    ${dest} 1430  0  ${date} 28OCT26 77W  6:30`);
    lines.push(`2   ${selectedAir} 103  .2.4.6.  ${orig}   2030    ${dest} 0300+1 0 ${date} 28OCT26 789  6:30`);
    lines.push(`3   QR 639  1234567  ${orig}   0410    ${dest} 1340  1  ${date} 28OCT26 77W 14:30`);
    lines.push(`4   EK 585  1234567  ${orig}   0140    ${dest} 1420  1  ${date} 28OCT26 380 15:40`);
  }

  return lines.join('\n');
};

// 4. Fare Display (FQD):
// Formats:
// FQDDACJFK/AEK/IO/D15MAY22 (One Way)
// FQDDACJFK/AEK/IR/D15MAY22 (Return)
// FQDDACJFK/AEK/IR/D15MAY22/KC (Business)
// FQDDACJFK/AEK/IR/D15MAY22/R,05AUG22 (Historical)
export const generateFareDisplay = (rawCmd: string): string => {
  const upper = rawCmd.toUpperCase().trim();
  const afterFqd = upper.substring(3).trim();

  // Extract cities
  const cityMatch = afterFqd.match(/^([A-Z]{3})([A-Z]{3})/);
  const orig = cityMatch ? cityMatch[1] : 'DAC';
  const dest = cityMatch ? cityMatch[2] : 'JFK';

  // Airline
  const airMatch = afterFqd.match(/\/A([A-Z0-9]{2})/);
  const airline = airMatch ? airMatch[1] : 'EK';

  // Trip type: /IO (One Way), /IR (Return)
  const isOneWay = afterFqd.includes('/IO');
  const isReturn = afterFqd.includes('/IR') || !isOneWay;

  // Cabin: /KC (Business/Club), /KY (Economy)
  const isBusiness = afterFqd.includes('/KC');

  // Dates
  const dateMatch = afterFqd.match(/\/D(\d{1,2}[A-Z]{3}\d{0,2})/);
  const travelDate = dateMatch ? dateMatch[1] : '15MAY26';

  const histMatch = afterFqd.match(/\/R,(\d{1,2}[A-Z]{3}\d{0,2})/);
  const histText = histMatch ? `HISTORICAL FARES AS OF ${histMatch[1]}` : `UP TO ${travelDate}`;

  const lines: string[] = [];
  lines.push(`FQD ${orig}${dest}/A${airline}/${isOneWay ? 'IO' : 'IR'}/D${travelDate}`);
  lines.push(`ROE 119.50 BDT   ${histText}`);
  lines.push(`${orig}-${dest}   ${airline}      TAXES/FEES NOT INCLUDED   CURRENCY: BDT`);
  lines.push(`LN FARE BASIS      OW BDT       RT BDT     BK  SEASON    AP MIN MAX`);

  if (isBusiness) {
    lines.push(`01 JLRBD1          280000       420000     J   --        -- +   12M`);
    lines.push(`02 CLRBD1          330000       490000     C   --        -- +   12M`);
    lines.push(`03 DFFBD1          390000       580000     D   --        -- +   12M`);
    lines.push(`04 IPROMO          250000       370000     I   --        3D +   3M `);
  } else {
    lines.push(`01 TLRBD1           95000       145000     T   --        -- +   12M`);
    lines.push(`02 QLRBD1          110000       165000     Q   --        -- +   12M`);
    lines.push(`03 MLRBD1          128000       192000     M   --        -- +   12M`);
    lines.push(`04 BLRBD1          150000       225000     B   --        -- +   12M`);
    lines.push(`05 YFFBD1          175000       260000     Y   --        -- +   12M`);
    lines.push(`06 OPROMO           82000       125000     O   --        7D +   1M `);
  }

  return lines.join('\n');
};

// 5. Fare Notes & Rules (FQN):
// Formats: FQN01, FQN1, FQN1*PE (Penalties)
export const generateFareNotes = (rawCmd: string): string => {
  const upper = rawCmd.toUpperCase().trim();

  if (upper.includes('*PE') || upper.includes('PE')) {
    return [
      `FQN 1*PE`,
      `CATEGORY 16 - PENALTIES`,
      `ORIGIN: DAC  DESTINATION: JFK  CARRIER: EK  FARE BASIS: TLRBD1`,
      ``,
      `CANCELLATIONS`,
      `  BEFORE DEPARTURE:`,
      `    CHARGE BDT 15000 FOR CANCEL/REFUND.`,
      `    INFANT FREE OF CHARGE.`,
      `  AFTER DEPARTURE:`,
      `    TICKET IS NON-REFUNDABLE IN CASE OF CANCEL/REFUND.`,
      ``,
      `CHANGES`,
      `  BEFORE DEPARTURE:`,
      `    CHARGE BDT 8000 FOR REISSUE/DATE CHANGE PLUS ANY FARE DIFFERENCE.`,
      `  AFTER DEPARTURE:`,
      `    CHARGE BDT 10000 FOR REISSUE/DATE CHANGE PLUS ANY FARE DIFFERENCE.`,
      `  NO-SHOW:`,
      `    CHARGE BDT 20000 FOR NO-SHOW PLUS CHANGE FEE.`,
    ].join('\n');
  }

  return [
    `FQN 01`,
    `RULE DISPLAY - FARE BASIS: TLRBD1   CARRIER: EK`,
    `-----------------------------------------------------------------------------`,
    `PARAGRAPHS:`,
    ` 01 ELIGIBILITY          09 TRANSFERS            16 PENALTIES`,
    ` 02 DAY/TIME             10 COMBINATIONS         17 HIP EXCEPTIONS`,
    ` 03 SEASONALITY          11 BLACKOUT DATES       18 TICKET ENDORSEMENT`,
    ` 04 FLIGHT APPLICATION   12 SURCHARGES           19 CHILDREN DISCOUNTS`,
    ` 05 ADVANCE RES/TICKETING 13 ACCOMPANIED TRAVEL  21 AGENT DISCOUNTS`,
    ` 06 MINIMUM STAY         14 TRAVEL RESTRICTIONS  31 VOLUNTARY CHANGES`,
    ` 07 MAXIMUM STAY         15 SALES RESTRICTIONS   33 VOLUNTARY REFUNDS`,
    ` 08 STOPOVERS`,
    `-----------------------------------------------------------------------------`,
    `ENTER FQN 1*<PARAGRAPH_CODE> (e.g. FQN 1*PE FOR PENALTIES)`,
  ].join('\n');
};

// 6. Currency Conversion (FQC):
// Formats: FQC100USD/BDT, FQC500EUR/BDT, FQC100GBP/BDT, etc.
export const convertCurrency = (rawCmd: string): string => {
  const upper = rawCmd.toUpperCase().trim();
  const match = upper.match(/^FQC\s*(\d+(?:\.\d+)?)\s*([A-Z]{3})\/([A-Z]{3})$/);

  if (!match) {
    return 'FORMAT: FQC<AMOUNT><CURR1>/<CURR2> (e.g. FQC100USD/BDT or FQC50000BDT/USD)';
  }

  const amount = parseFloat(match[1]);
  const fromCurr = match[2];
  const toCurr = match[3];

  // Benchmark exchange rates to BDT
  const ratesToBdt: Record<string, number> = {
    USD: 119.50,
    EUR: 130.20,
    GBP: 153.80,
    SAR: 31.85,
    AED: 32.55,
    QAR: 32.80,
    SGD: 89.20,
    MYR: 26.90,
    INR: 1.43,
    BDT: 1.0,
  };

  const rateFrom = ratesToBdt[fromCurr] || 1.0;
  const rateTo = ratesToBdt[toCurr] || 1.0;

  // Convert amount from fromCurr to toCurr
  const amountInBdt = amount * rateFrom;
  const converted = amountInBdt / rateTo;
  const effectiveRoe = (rateFrom / rateTo).toFixed(6);

  return [
    `FQC ${amount.toFixed(2)} ${fromCurr} / ${toCurr}`,
    `BSR ROE ${effectiveRoe} - IATA BSR 20MAY26`,
    `${amount.toFixed(2)} ${fromCurr} = ${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`,
    `ROUNDED TOTAL: ${Math.round(converted).toLocaleString('en-US')} ${toCurr}`,
  ].join('\n');
};
