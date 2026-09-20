import { AvailabilityOption, FareSearchOption, FareSearchFlight } from '../types';
import { AIRPORTS, AIRLINES } from '../data/gdsDatabase';

// Helper to format/clean date string e.g. "D30SEP" -> "30SEP", "30SEP26" -> "30SEP"
export const cleanGdsDate = (rawDate?: string): string => {
  if (!rawDate) return '30SEP';
  const clean = rawDate.toUpperCase().replace(/^D/, '').trim();
  const match = clean.match(/^(\d{1,2})([A-Z]{3})/);
  if (match && MONTHS.includes(match[2])) {
    return `${match[1].padStart(2, '0')}${match[2]}`;
  }
  return clean || '30SEP';
};

// Recognized GDS 3-letter months
export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Accurate day-of-week calculator for GDS date (e.g. "30SEP" -> "WE", "15OCT" -> "TH", "25NOV" -> "WE", "10JAN" -> "SA")
export const getDayOfWeek = (dte: string, year: number = 2026): string => {
  const match = dte.match(/^(\d{1,2})([A-Z]{3})/);
  if (!match) return 'WE';
  const day = parseInt(match[1], 10);
  const monthStr = match[2];
  const mIndex = MONTHS.indexOf(monthStr);
  if (mIndex === -1) return 'WE';
  const d = new Date(year, mIndex, day);
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  return days[d.getDay()] || 'WE';
};

// Check if an airport is a domestic Bangladesh airport
export const isDomesticAirport = (code: string): boolean => {
  const bdAirports = ['DAC', 'CGP', 'ZYL', 'CXB', 'JSR', 'BZL', 'RJH', 'SPD'];
  return bdAirports.includes(code.toUpperCase());
};

// Airline hubs definition
const AIRLINE_HUBS: Record<string, string[]> = {
  SV: ['JED', 'RUH'],
  BG: ['DAC', 'CGP', 'ZYL'],
  BS: ['DAC'],
  VQ: ['DAC'],
  '2A': ['DAC'],
  QR: ['DOH'],
  EK: ['DXB'],
  FZ: ['DXB'],
  G9: ['SHJ'],
  KU: ['KWI'],
  J9: ['KWI'],
  GF: ['BAH'],
  XY: ['RUH', 'JED'],
  WY: ['MCT'],
  EY: ['AUH'],
  SQ: ['SIN'],
  MH: ['KUL'],
  TG: ['BKK'],
  TK: ['IST'],
  AI: ['DEL', 'BOM'],
  '6E': ['DEL', 'CCU'],
  BA: ['LHR'],
  LH: ['FRA', 'MUC'],
  AF: ['CDG'],
  KL: ['AMS'],
  CX: ['HKG'],
  AA: ['JFK', 'ORD'],
  UA: ['EWR', 'ORD'],
  DL: ['JFK', 'ATL'],
  MS: ['CAI'],
  ET: ['ADD'],
};

// Check if carrier operates non-stop between two points
const isDirectFlight = (orig: string, dest: string, air: string): boolean => {
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();
  const a = air.toUpperCase();
  const isSector = (c1: string, c2: string) => (o === c1 && d === c2) || (o === c2 && d === c1);

  // Domestic Bangladesh
  if (isDomesticAirport(o) && isDomesticAirport(d)) {
    return ['BG', 'BS', 'VQ', '2A'].includes(a);
  }

  // To/From Saudi Arabia (Saudia, Biman, US-Bangla, Flynas)
  if (isSector('DAC', 'JED') || isSector('DAC', 'RUH') || isSector('DAC', 'MED') || isSector('DAC', 'DMM')) {
    return ['SV', 'BG', 'BS', 'XY'].includes(a);
  }

  // To/From UAE (Dubai: EK, BG, FZ, BS)
  if (isSector('DAC', 'DXB')) {
    return ['EK', 'FZ', 'BG', 'BS'].includes(a);
  }
  if (isSector('DAC', 'SHJ')) {
    return ['G9', 'BS'].includes(a);
  }
  if (isSector('DAC', 'AUH')) {
    return ['EY', 'BG'].includes(a);
  }

  // To/From Qatar
  if (isSector('DAC', 'DOH')) {
    return ['QR', 'BG', 'BS'].includes(a);
  }

  // To/From Kuwait
  if (isSector('DAC', 'KWI')) {
    return ['KU', 'J9', 'BG'].includes(a);
  }

  // To/From Bahrain
  if (isSector('DAC', 'BAH')) {
    return a === 'GF';
  }

  // To/From Oman
  if (isSector('DAC', 'MCT')) {
    return ['WY', 'BG', 'BS'].includes(a);
  }

  // To/From Singapore
  if (isSector('DAC', 'SIN')) {
    return ['SQ', 'BG', 'BS'].includes(a);
  }

  // To/From Malaysia
  if (isSector('DAC', 'KUL')) {
    return ['MH', 'BG', 'BS'].includes(a);
  }

  // To/From Thailand
  if (isSector('DAC', 'BKK')) {
    return ['TG', 'BG', 'BS'].includes(a);
  }

  // To/From India (Kolkata & Delhi)
  if (isSector('DAC', 'CCU')) {
    return ['BG', 'BS', '6E', 'AI'].includes(a);
  }
  if (isSector('DAC', 'DEL')) {
    return ['AI', 'BG', '6E'].includes(a);
  }

  // To/From London (Biman non-stop)
  if (isSector('DAC', 'LHR') || isSector('DAC', 'LGW')) {
    return a === 'BG';
  }

  // To/From Istanbul (Turkish non-stop)
  if (isSector('DAC', 'IST')) {
    return a === 'TK';
  }

  return false;
};

// Return realistic carriers for a given origin & destination
export const getCarriersForSector = (orig: string, dest: string, airlineFilter?: string): string[] => {
  if (airlineFilter) {
    const clean = airlineFilter.toUpperCase().trim();
    return Array(10).fill(clean);
  }

  const o = orig.toUpperCase();
  const d = dest.toUpperCase();
  const isSector = (c1: string, c2: string) => (o === c1 && d === c2) || (o === c2 && d === c1);

  // Domestic Bangladesh routes
  if (isDomesticAirport(o) && isDomesticAirport(d)) {
    return ['BG', 'BS', 'VQ', '2A', 'BG', 'BS', 'VQ', 'BS', 'BG', 'VQ'];
  }

  // DAC - RUH (Saudi Capital corridor: BG, SV, BS, QR, EK, GF, KU, J9, XY)
  if (isSector('DAC', 'RUH')) {
    return ['BG', 'SV', 'BS', 'SV', 'BG', 'QR', 'EK', 'GF', 'KU', 'J9', 'XY', 'QR'];
  }

  // DAC - JED (Saudi West Coast / Umrah / Hajj corridor)
  if (isSector('DAC', 'JED') || isSector('DAC', 'MED')) {
    return ['SV', 'BG', 'SV', 'BG', 'BS', 'BG', 'QR', 'EK', 'KU', 'GF', 'J9', 'XY'];
  }

  // Other Saudi Arabia (DMM)
  if (isSector('DAC', 'DMM')) {
    return ['SV', 'BG', 'BS', 'QR', 'EK', 'GF', 'KU', 'J9', 'XY', 'SV', 'BG', 'QR'];
  }

  // DAC - DXB (Dubai corridor: EK, BG, FZ, BS, QR, GF, KU)
  if (isSector('DAC', 'DXB')) {
    return ['EK', 'BG', 'BS', 'FZ', 'EK', 'BG', 'G9', 'QR', 'GF', 'KU', 'EY', 'EK'];
  }

  // Other UAE (SHJ, AUH)
  if (isSector('DAC', 'SHJ')) {
    return ['G9', 'BS', 'G9', 'BS', 'EK', 'BG', 'QR', 'GF'];
  }
  if (isSector('DAC', 'AUH')) {
    return ['EY', 'BG', 'EY', 'BG', 'EK', 'BS', 'QR', 'GF'];
  }

  // DAC - DOH (Qatar corridor)
  if (isSector('DAC', 'DOH')) {
    return ['QR', 'BG', 'QR', 'BS', 'QR', 'EK', 'GF', 'KU'];
  }

  // DAC - KWI (Kuwait corridor)
  if (isSector('DAC', 'KWI')) {
    return ['KU', 'J9', 'BG', 'KU', 'J9', 'QR', 'EK', 'GF'];
  }

  // DAC - BAH (Bahrain corridor)
  if (isSector('DAC', 'BAH')) {
    return ['GF', 'GF', 'BG', 'BS', 'QR', 'EK', 'KU', 'GF'];
  }

  // DAC - MCT (Oman corridor)
  if (isSector('DAC', 'MCT')) {
    return ['WY', 'BG', 'BS', 'WY', 'QR', 'EK', 'GF', 'KU'];
  }

  // DAC - LHR / LON / LGW / MAN (London & UK corridor)
  if (isSector('DAC', 'LHR') || isSector('DAC', 'LGW') || isSector('DAC', 'LON') || isSector('DAC', 'MAN')) {
    return ['BG', 'BG', 'QR', 'EK', 'TK', 'SV', 'GF', 'KU', 'QR', 'EK', 'TK', 'SV'];
  }

  // DAC - CCU (Kolkata corridor)
  if (isSector('DAC', 'CCU')) {
    return ['BG', 'BS', '6E', 'AI', 'BG', 'BS', '6E', 'AI'];
  }

  // DAC - DEL (Delhi corridor)
  if (isSector('DAC', 'DEL') || isSector('DAC', 'BOM')) {
    return ['AI', 'BG', '6E', 'BS', 'AI', 'BG', '6E', 'BS'];
  }

  // DAC - SIN (Singapore corridor)
  if (isSector('DAC', 'SIN')) {
    return ['SQ', 'BG', 'BS', 'SQ', 'TG', 'MH', '6E', 'AI'];
  }

  // DAC - KUL (Kuala Lumpur corridor)
  if (isSector('DAC', 'KUL')) {
    return ['MH', 'BG', 'BS', 'MH', 'SQ', 'TG', '6E', 'BG'];
  }

  // DAC - BKK (Bangkok corridor)
  if (isSector('DAC', 'BKK')) {
    return ['TG', 'BG', 'BS', 'TG', 'SQ', 'MH', '6E', 'BS'];
  }

  // Europe general (CDG, FRA, AMS, IST, FCO, MXP)
  if (['CDG', 'FRA', 'AMS', 'IST', 'FCO', 'MXP'].includes(d) || ['CDG', 'FRA', 'AMS', 'IST'].includes(o)) {
    return ['TK', 'QR', 'EK', 'SV', 'GF', 'KU', 'LH', 'AF', 'BA', 'QR'];
  }

  // USA / Canada (JFK, EWR, YYZ, ORD, LAX, SFO, IAD)
  if (['JFK', 'EWR', 'YYZ', 'ORD', 'LAX', 'SFO', 'IAD'].includes(d) || ['JFK', 'EWR', 'YYZ'].includes(o)) {
    return ['QR', 'EK', 'TK', 'SV', 'BA', 'KU', 'QR', 'EK', 'TK', 'SV'];
  }

  // Default international mix
  return ['QR', 'EK', 'SV', 'BG', 'GF', 'KU', 'TK', 'BS', 'QR', 'EK'];
};

// Dynamic sector fare calculation in BDT
export const calculateSectorFare = (
  orig: string,
  dest: string,
  isBusiness: boolean = false,
  isRoundTrip: boolean = false
): { base: number; tax: number; total: number } => {
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();

  let base = 70000;
  let tax = 20000;

  if (isDomesticAirport(o) && isDomesticAirport(d)) {
    // Domestic: BDT 4,500 - 9,000 range
    base = 5200;
    tax = 1400;
  } else if (['CCU', 'DEL', 'BOM', 'MAA', 'KTM', 'CMB'].includes(d)) {
    // South Asia: BDT 16,000 - 25,000 range
    base = 14500;
    tax = 5500;
  } else if (['SIN', 'BKK', 'KUL', 'HKG', 'CAN'].includes(d)) {
    // Southeast Asia: BDT 45,000 - 62,000 range
    base = 38500;
    tax = 13500;
  } else if (['JED', 'MED', 'RUH', 'DMM', 'DXB', 'SHJ', 'AUH', 'DOH', 'KWI', 'BAH', 'MCT'].includes(d)) {
    // Middle East: BDT 65,000 - 95,000 range
    base = 54500;
    tax = 18000;
  } else if (['LHR', 'LGW', 'MAN', 'CDG', 'FRA', 'AMS', 'FCO', 'MXP', 'IST'].includes(d)) {
    // Europe: BDT 110,000 - 160,000 range
    base = 98000;
    tax = 29500;
  } else if (['JFK', 'EWR', 'NYC', 'YYZ', 'YVR', 'ORD', 'LAX', 'SFO', 'IAD'].includes(d)) {
    // North America: BDT 110,000 - 165,000 range
    base = 108000;
    tax = 32000;
  } else {
    // Long Haul Rest of World
    base = 82000;
    tax = 25000;
  }

  if (isBusiness) {
    base = Math.round(base * 2.4);
    tax = Math.round(tax * 1.5);
  }

  if (isRoundTrip) {
    base = Math.round(base * 1.75);
    tax = Math.round(tax * 1.7);
  }

  return {
    base,
    tax,
    total: base + tax,
  };
};

// Flight schedule catalog for realistic operations
interface FlightSchedulePattern {
  flightNumber: string;
  depTime: string;
  arrTime: string;
  equip: string;
  transit?: string;
  transitFlightNumber?: string;
  transitDepTime?: string;
  transitArrTime?: string;
  transitEquip?: string;
  elapsedTime?: string;
  retFlightNumber?: string;
  retDepTime?: string;
  retArrTime?: string;
  retTransitFlightNumber?: string;
  retTransitDepTime?: string;
  retTransitArrTime?: string;
}

const getScheduleForCarrier = (
  airline: string,
  orig: string,
  dest: string,
  optIndex: number
): FlightSchedulePattern => {
  const air = airline.toUpperCase();
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();

  // 1. SAUDIA (SV)
  if (air === 'SV') {
    if (d === 'RUH' || d === 'JED' || d === 'MED' || d === 'DMM') {
      const svDirect: FlightSchedulePattern[] = [
        { flightNumber: '803', depTime: '1215', arrTime: '1640', equip: '789', retFlightNumber: '804', retDepTime: '1800', retArrTime: '0225' },
        { flightNumber: '801', depTime: '0230', arrTime: '0615', equip: '77W', retFlightNumber: '802', retDepTime: '2030', retArrTime: '0415' },
        { flightNumber: '805', depTime: '0355', arrTime: '0820', equip: '77W', retFlightNumber: '806', retDepTime: '0945', retArrTime: '1810' },
        { flightNumber: '807', depTime: '1930', arrTime: '2355', equip: '333', retFlightNumber: '808', retDepTime: '2115', retArrTime: '0540' },
        { flightNumber: '811', depTime: '1420', arrTime: '1835', equip: '77W', retFlightNumber: '812', retDepTime: '0600', retArrTime: '1330' },
        { flightNumber: '815', depTime: '2200', arrTime: '0215', equip: '789', retFlightNumber: '816', retDepTime: '1000', retArrTime: '1730' },
      ];
      return svDirect[optIndex % svDirect.length];
    }

    // SV to Europe / US / Gulf via JED or RUH
    const svIntl: FlightSchedulePattern[] = [
      {
        flightNumber: '805',
        depTime: '0355',
        arrTime: '0820',
        equip: '77W',
        transit: 'JED',
        transitFlightNumber: d === 'LHR' ? '115' : d === 'DXB' ? '805' : '021',
        transitDepTime: '1040',
        transitArrTime: d === 'LHR' ? '1455' : d === 'DXB' ? '1350' : '1730',
        transitEquip: '77W',
        elapsedTime: '14:20',
        retFlightNumber: d === 'LHR' ? '116' : d === 'DXB' ? '806' : '020',
        retDepTime: '1630',
        retArrTime: '2350',
        retTransitFlightNumber: '806',
        retTransitDepTime: '0245',
        retTransitArrTime: '1110',
      },
      {
        flightNumber: '801',
        depTime: '0230',
        arrTime: '0615',
        equip: '77W',
        transit: 'RUH',
        transitFlightNumber: d === 'LHR' ? '121' : d === 'DXB' ? '801' : '035',
        transitDepTime: '0900',
        transitArrTime: d === 'LHR' ? '1330' : d === 'DXB' ? '1130' : '1600',
        transitEquip: '789',
        elapsedTime: '13:45',
        retFlightNumber: d === 'LHR' ? '122' : d === 'DXB' ? '802' : '036',
        retDepTime: '1515',
        retArrTime: '2330',
        retTransitFlightNumber: '802',
        retTransitDepTime: '0215',
        retTransitArrTime: '1000',
      },
      {
        flightNumber: '803',
        depTime: '1215',
        arrTime: '1640',
        equip: '789',
        transit: 'JED',
        transitFlightNumber: d === 'LHR' ? '119' : d === 'DXB' ? '807' : '023',
        transitDepTime: '1945',
        transitArrTime: d === 'LHR' ? '2355' : d === 'DXB' ? '2250' : '0310',
        transitEquip: '77W',
        elapsedTime: '14:50',
        retFlightNumber: d === 'LHR' ? '120' : d === 'DXB' ? '808' : '024',
        retDepTime: '0630',
        retArrTime: '1410',
        retTransitFlightNumber: '804',
        retTransitDepTime: '1800',
        retTransitArrTime: '0225',
      },
    ];
    return svIntl[optIndex % svIntl.length];
  }

  // 2. BIMAN BANGLADESH (BG)
  if (air === 'BG') {
    if (isDomesticAirport(o) && isDomesticAirport(d)) {
      const bgDom: FlightSchedulePattern[] = [
        { flightNumber: '433', depTime: '0730', arrTime: '0830', equip: 'DH4', retFlightNumber: '434', retDepTime: '0900', retArrTime: '1000' },
        { flightNumber: '435', depTime: '1100', arrTime: '1200', equip: '738', retFlightNumber: '436', retDepTime: '1230', retArrTime: '1330' },
        { flightNumber: '437', depTime: '1430', arrTime: '1530', equip: 'DH4', retFlightNumber: '438', retDepTime: '1600', retArrTime: '1700' },
        { flightNumber: '439', depTime: '1700', arrTime: '1800', equip: '738', retFlightNumber: '440', retDepTime: '1830', retArrTime: '1930' },
      ];
      return bgDom[optIndex % bgDom.length];
    }

    if (d === 'RUH' || d === 'DMM') {
      const bgRuh: FlightSchedulePattern[] = [
        { flightNumber: '039', depTime: '1945', arrTime: '2330', equip: '788', retFlightNumber: '040', retDepTime: '0100', retArrTime: '0930' },
        { flightNumber: '049', depTime: '0830', arrTime: '1215', equip: '77W', retFlightNumber: '050', retDepTime: '1400', retArrTime: '2230' },
        { flightNumber: '037', depTime: '1500', arrTime: '1845', equip: '788', retFlightNumber: '038', retDepTime: '2015', retArrTime: '0445' },
        { flightNumber: '041', depTime: '2315', arrTime: '0300', equip: '77W', retFlightNumber: '042', retDepTime: '0430', retArrTime: '1300' },
      ];
      return bgRuh[optIndex % bgRuh.length];
    }

    if (d === 'DXB') {
      const bgDxb: FlightSchedulePattern[] = [
        { flightNumber: '047', depTime: '1930', arrTime: '2315', equip: '77W', retFlightNumber: '048', retDepTime: '0100', retArrTime: '0745' },
        { flightNumber: '147', depTime: '0900', arrTime: '1245', equip: '788', retFlightNumber: '148', retDepTime: '1430', retArrTime: '2115' },
      ];
      return bgDxb[optIndex % bgDxb.length];
    }

    if (d === 'JED' || d === 'MED') {
      const bgJed: FlightSchedulePattern[] = [
        { flightNumber: '335', depTime: '0215', arrTime: '0645', equip: '77W', retFlightNumber: '336', retDepTime: '0845', retArrTime: '1715' },
        { flightNumber: '135', depTime: '1130', arrTime: '1600', equip: '788', retFlightNumber: '136', retDepTime: '1800', retArrTime: '0230' },
        { flightNumber: '035', depTime: '2045', arrTime: '0115', equip: '789', retFlightNumber: '036', retDepTime: '0315', retArrTime: '1145' },
        { flightNumber: '235', depTime: '1500', arrTime: '1930', equip: '77W', retFlightNumber: '236', retDepTime: '2130', retArrTime: '0600' },
      ];
      return bgJed[optIndex % bgJed.length];
    }

    if (d === 'LHR' || d === 'LGW' || d === 'LON' || d === 'MAN') {
      const bgLhr: FlightSchedulePattern[] = [
        { flightNumber: '201', depTime: '1005', arrTime: '1600', equip: '788', retFlightNumber: '202', retDepTime: '1815', retArrTime: '0945' },
        { flightNumber: '205', depTime: '0330', arrTime: '0925', equip: '789', retFlightNumber: '206', retDepTime: '1145', retArrTime: '0315' },
      ];
      return bgLhr[optIndex % bgLhr.length];
    }

    if (d === 'CCU') {
      const bgCcu: FlightSchedulePattern[] = [
        { flightNumber: '391', depTime: '0730', arrTime: '0815', equip: '738', retFlightNumber: '392', retDepTime: '0900', retArrTime: '0945' },
        { flightNumber: '395', depTime: '1830', arrTime: '1915', equip: '738', retFlightNumber: '396', retDepTime: '2000', retArrTime: '2045' },
      ];
      return bgCcu[optIndex % bgCcu.length];
    }

    if (d === 'SIN') {
      return { flightNumber: '084', depTime: '0815', arrTime: '1430', equip: '738', retFlightNumber: '085', retDepTime: '1530', retArrTime: '1745' };
    }
    if (d === 'KUL') {
      return { flightNumber: '082', depTime: '2300', arrTime: '0445', equip: '738', retFlightNumber: '083', retDepTime: '0600', retArrTime: '0745' };
    }
    if (d === 'BKK') {
      return { flightNumber: '088', depTime: '1145', arrTime: '1515', equip: '738', retFlightNumber: '089', retDepTime: '1615', retArrTime: '1745' };
    }
  }

  // 3. US-BANGLA (BS)
  if (air === 'BS') {
    if (isDomesticAirport(o) && isDomesticAirport(d)) {
      const bsDom: FlightSchedulePattern[] = [
        { flightNumber: '141', depTime: '0715', arrTime: '0815', equip: 'AT7', retFlightNumber: '142', retDepTime: '0845', retArrTime: '0945' },
        { flightNumber: '143', depTime: '1030', arrTime: '1130', equip: '738', retFlightNumber: '144', retDepTime: '1200', retArrTime: '1300' },
        { flightNumber: '145', depTime: '1345', arrTime: '1445', equip: 'AT7', retFlightNumber: '146', retDepTime: '1515', retArrTime: '1615' },
        { flightNumber: '147', depTime: '1620', arrTime: '1720', equip: '738', retFlightNumber: '148', retDepTime: '1750', retArrTime: '1850' },
      ];
      return bsDom[optIndex % bsDom.length];
    }

    if (d === 'RUH' || d === 'DMM') {
      const bsRuh: FlightSchedulePattern[] = [
        { flightNumber: '315', depTime: '2030', arrTime: '0045', equip: '738', retFlightNumber: '316', retDepTime: '0215', retArrTime: '1030' },
        { flightNumber: '317', depTime: '0915', arrTime: '1330', equip: '738', retFlightNumber: '318', retDepTime: '1500', retArrTime: '2315' },
        { flightNumber: '319', depTime: '1445', arrTime: '1900', equip: '738', retFlightNumber: '320', retDepTime: '2030', retArrTime: '0445' },
        { flightNumber: '323', depTime: '0130', arrTime: '0545', equip: '738', retFlightNumber: '324', retDepTime: '0715', retArrTime: '1530' },
      ];
      return bsRuh[optIndex % bsRuh.length];
    }

    if (d === 'JED' || d === 'MED') {
      const bsJed: FlightSchedulePattern[] = [
        { flightNumber: '321', depTime: '1930', arrTime: '0015', equip: '738', retFlightNumber: '322', retDepTime: '0145', retArrTime: '1000' },
        { flightNumber: '323', depTime: '1100', arrTime: '1545', equip: '738', retFlightNumber: '324', retDepTime: '1715', retArrTime: '0130' },
      ];
      return bsJed[optIndex % bsJed.length];
    }

    if (d === 'DXB') {
      return { flightNumber: '341', depTime: '1845', arrTime: '2230', equip: '738', retFlightNumber: '342', retDepTime: '2345', retArrTime: '0630' };
    }
    if (d === 'SHJ') {
      return { flightNumber: '345', depTime: '2015', arrTime: '2355', equip: '738', retFlightNumber: '346', retDepTime: '0115', retArrTime: '0745' };
    }
    if (d === 'DOH') {
      return { flightNumber: '337', depTime: '1900', arrTime: '2215', equip: '738', retFlightNumber: '338', retDepTime: '2330', retArrTime: '0700' };
    }
    if (d === 'MCT') {
      return { flightNumber: '311', depTime: '0930', arrTime: '1300', equip: '738', retFlightNumber: '312', retDepTime: '1415', retArrTime: '2130' };
    }
    if (d === 'CCU') {
      return { flightNumber: '201', depTime: '0815', arrTime: '0900', equip: '738', retFlightNumber: '202', retDepTime: '0945', retArrTime: '1030' };
    }
    if (d === 'SIN') {
      return { flightNumber: '307', depTime: '2230', arrTime: '0445', equip: '738', retFlightNumber: '308', retDepTime: '0545', retArrTime: '0800' };
    }
    if (d === 'KUL') {
      return { flightNumber: '315', depTime: '0830', arrTime: '1415', equip: '738', retFlightNumber: '316', retDepTime: '1515', retArrTime: '1700' };
    }
    if (d === 'BKK') {
      return { flightNumber: '217', depTime: '0945', arrTime: '1315', equip: '738', retFlightNumber: '218', retDepTime: '1415', retArrTime: '1545' };
    }
  }

  // 4. NOVOAIR (VQ)
  if (air === 'VQ' && isDomesticAirport(o) && isDomesticAirport(d)) {
    const vqDom: FlightSchedulePattern[] = [
      { flightNumber: '931', depTime: '0800', arrTime: '0900', equip: 'AT7', retFlightNumber: '932', retDepTime: '0930', retArrTime: '1030' },
      { flightNumber: '933', depTime: '1130', arrTime: '1230', equip: 'AT7', retFlightNumber: '934', retDepTime: '1300', retArrTime: '1400' },
      { flightNumber: '935', depTime: '1400', arrTime: '1500', equip: 'AT7', retFlightNumber: '936', retDepTime: '1530', retArrTime: '1630' },
      { flightNumber: '937', depTime: '1645', arrTime: '1745', equip: 'AT7', retFlightNumber: '938', retDepTime: '1815', retArrTime: '1915' },
    ];
    return vqDom[optIndex % vqDom.length];
  }

  // 5. QATAR AIRWAYS (QR)
  if (air === 'QR') {
    const qrDohDepartures = [
      { flt: '639', dep: '0410', arr: '0620' },
      { flt: '641', dep: '1055', arr: '1305' },
      { flt: '643', dep: '1945', arr: '2200' },
      { flt: '645', dep: '2315', arr: '0130' },
    ];
    const qrLeg1 = qrDohDepartures[optIndex % qrDohDepartures.length];

    if (d === 'DOH') {
      return {
        flightNumber: qrLeg1.flt,
        depTime: qrLeg1.dep,
        arrTime: qrLeg1.arr,
        equip: '77W',
        retFlightNumber: '640',
        retDepTime: '1930',
        retArrTime: '0250',
      };
    }

    const transitFlt = d === 'RUH'
      ? (optIndex % 2 === 0 ? '1164' : '1168')
      : d === 'DXB'
      ? (701 + optIndex * 4).toString()
      : d === 'LHR'
      ? (3 + optIndex * 4).toString()
      : d === 'JED'
      ? (1184 + optIndex * 2).toString()
      : (703 + optIndex * 2).toString();

    const transitDep = d === 'RUH' ? (optIndex % 2 === 0 ? '0845' : '0115') : (optIndex % 2 === 0 ? '0845' : '1530');
    const transitArr = d === 'RUH' ? (optIndex % 2 === 0 ? '1015' : '0245') : (optIndex % 2 === 0 ? '1115' : '1800');
    const transitElapsed = d === 'RUH' ? (optIndex % 2 === 0 ? '09:05' : '10:00') : '10:45';

    return {
      flightNumber: qrLeg1.flt,
      depTime: qrLeg1.dep,
      arrTime: qrLeg1.arr,
      equip: '77W',
      transit: 'DOH',
      transitFlightNumber: transitFlt,
      transitDepTime: transitDep,
      transitArrTime: transitArr,
      transitEquip: '359',
      elapsedTime: transitElapsed,
      retFlightNumber: (parseInt(transitFlt, 10) + 1).toString(),
      retDepTime: '1630',
      retArrTime: '1900',
      retTransitFlightNumber: '640',
      retTransitDepTime: '2045',
      retTransitArrTime: '0400',
    };
  }

  // 6. EMIRATES (EK)
  if (air === 'EK') {
    const ekDxbDepartures = [
      { flt: '583', dep: '0955', arr: '1250' },
      { flt: '585', dep: '0140', arr: '0435' },
      { flt: '587', dep: '1840', arr: '2135' },
      { flt: '589', dep: '2330', arr: '0225' },
    ];
    const ekLeg1 = ekDxbDepartures[optIndex % ekDxbDepartures.length];

    if (d === 'DXB') {
      return {
        flightNumber: ekLeg1.flt,
        depTime: ekLeg1.dep,
        arrTime: ekLeg1.arr,
        equip: '77W',
        retFlightNumber: '584',
        retDepTime: '1910',
        retArrTime: '0140',
      };
    }

    const transitFlt = d === 'RUH'
      ? '819'
      : d === 'JED'
      ? (805 + optIndex * 2).toString()
      : d === 'LHR'
      ? (1 + optIndex * 2).toString()
      : (201 + optIndex * 2).toString();

    const transitDep = d === 'RUH' ? '1515' : (optIndex % 2 === 0 ? '0715' : '1430');
    const transitArr = d === 'RUH' ? '1615' : (optIndex % 2 === 0 ? '0925' : '1640');
    const transitElapsed = d === 'RUH' ? '09:20' : '12:30';

    return {
      flightNumber: ekLeg1.flt,
      depTime: ekLeg1.dep,
      arrTime: ekLeg1.arr,
      equip: '77W',
      transit: 'DXB',
      transitFlightNumber: transitFlt,
      transitDepTime: transitDep,
      transitArrTime: transitArr,
      transitEquip: '380',
      elapsedTime: transitElapsed,
      retFlightNumber: (parseInt(transitFlt, 10) + 1).toString(),
      retDepTime: '1430',
      retArrTime: '2245',
      retTransitFlightNumber: '586',
      retTransitDepTime: '0230',
      retTransitArrTime: '0855',
    };
  }

  // 7. FLYDUBAI (FZ)
  if (air === 'FZ') {
    return {
      flightNumber: optIndex % 2 === 0 ? '584' : '586',
      depTime: optIndex % 2 === 0 ? '0150' : '1400',
      arrTime: optIndex % 2 === 0 ? '0515' : '1725',
      equip: '738',
      retFlightNumber: optIndex % 2 === 0 ? '585' : '587',
      retDepTime: optIndex % 2 === 0 ? '1930' : '0815',
      retArrTime: optIndex % 2 === 0 ? '0100' : '1315',
    };
  }

  // 8. TURKISH AIRLINES (TK)
  if (air === 'TK') {
    if (d === 'IST') {
      return { flightNumber: '713', depTime: '0630', arrTime: '1205', equip: '77W', retFlightNumber: '712', retDepTime: '1845', retArrTime: '0500' };
    }
    return {
      flightNumber: '713',
      depTime: '0630',
      arrTime: '1205',
      equip: '77W',
      transit: 'IST',
      transitFlightNumber: d === 'LHR' ? '1985' : '001',
      transitDepTime: '1430',
      transitArrTime: d === 'LHR' ? '1640' : '1820',
      transitEquip: '359',
      elapsedTime: '15:10',
      retFlightNumber: d === 'LHR' ? '1986' : '002',
      retDepTime: '1800',
      retArrTime: '2355',
      retTransitFlightNumber: '712',
      retTransitDepTime: '0145',
      retTransitArrTime: '1130',
    };
  }

  // 9. INDIGO (6E)
  if (air === '6E') {
    if (d === 'CCU') {
      return { flightNumber: '1122', depTime: '1645', arrTime: '1730', equip: '320', retFlightNumber: '1123', retDepTime: '1815', retArrTime: '1900' };
    }
    if (d === 'DEL') {
      return { flightNumber: '1145', depTime: '1130', arrTime: '1415', equip: '320', retFlightNumber: '1146', retDepTime: '1500', retArrTime: '1745' };
    }
  }

  // 10. AIR INDIA (AI)
  if (air === 'AI') {
    if (d === 'CCU') {
      return { flightNumber: '228', depTime: '1030', arrTime: '1115', equip: '320', retFlightNumber: '229', retDepTime: '1200', retArrTime: '1245' };
    }
    if (d === 'DEL') {
      return { flightNumber: '230', depTime: '1415', arrTime: '1700', equip: '320', retFlightNumber: '231', retDepTime: '1745', retArrTime: '2030' };
    }
  }

  // 11. SINGAPORE AIRLINES (SQ)
  if (air === 'SQ') {
    const sqOptions = [
      { flightNumber: '447', depTime: '2355', arrTime: '0605', equip: '359', retFlightNumber: '446', retDepTime: '2030', retArrTime: '2245' },
      { flightNumber: '449', depTime: '1320', arrTime: '1930', equip: '359', retFlightNumber: '448', retDepTime: '0955', retArrTime: '1210' },
      { flightNumber: '445', depTime: '0815', arrTime: '1425', equip: '787', retFlightNumber: '444', retDepTime: '0450', retArrTime: '0705' },
    ];
    return sqOptions[optIndex % sqOptions.length];
  }

  // 12. KUWAIT AIRWAYS (KU)
  if (air === 'KU') {
    if (d === 'KWI') {
      const kuOptions = [
        { flightNumber: '284', depTime: '0245', arrTime: '0615', equip: '77W', retFlightNumber: '283', retDepTime: '1730', retArrTime: '0115' },
        { flightNumber: '286', depTime: '1410', arrTime: '1740', equip: '77W', retFlightNumber: '285', retDepTime: '0515', retArrTime: '1255' },
      ];
      return kuOptions[optIndex % kuOptions.length];
    }
    return {
      flightNumber: '284',
      depTime: '0245',
      arrTime: '0615',
      equip: '77W',
      transit: 'KWI',
      transitFlightNumber: d === 'RUH' ? '785' : d === 'JED' ? '785' : '101',
      transitDepTime: d === 'RUH' ? '0830' : '0830',
      transitArrTime: d === 'RUH' ? '1000' : (d === 'JED' ? '1045' : '1315'),
      transitEquip: '320',
      elapsedTime: d === 'RUH' ? '10:15' : '11:30',
      retFlightNumber: d === 'RUH' ? '786' : (d === 'JED' ? '786' : '102'),
      retDepTime: '1545',
      retArrTime: '1800',
      retTransitFlightNumber: '283',
      retTransitDepTime: '2015',
      retTransitArrTime: '0445',
    };
  }

  // 13. GULF AIR (GF)
  if (air === 'GF') {
    if (d === 'BAH') {
      return {
        flightNumber: '251',
        depTime: '0530',
        arrTime: '0845',
        equip: '789',
        retFlightNumber: '250',
        retDepTime: '1945',
        retArrTime: '0415',
      };
    }
    return {
      flightNumber: '251',
      depTime: '0530',
      arrTime: '0845',
      equip: '789',
      transit: 'BAH',
      transitFlightNumber: d === 'RUH' ? '163' : d === 'JED' ? '171' : '003',
      transitDepTime: d === 'RUH' ? '1030' : (d === 'JED' ? '1045' : '1100'),
      transitArrTime: d === 'RUH' ? '1145' : (d === 'JED' ? '1315' : '1450'),
      transitEquip: '321',
      elapsedTime: '09:15',
      retFlightNumber: d === 'RUH' ? '164' : (d === 'JED' ? '172' : '004'),
      retDepTime: '1300',
      retArrTime: '1415',
      retTransitFlightNumber: '250',
      retTransitDepTime: '1945',
      retTransitArrTime: '0415',
    };
  }

  // 14. JAZEERA AIRWAYS (J9)
  if (air === 'J9') {
    if (d === 'KWI') {
      return {
        flightNumber: '532',
        depTime: '1830',
        arrTime: '2215',
        equip: '320',
        retFlightNumber: '531',
        retDepTime: '0915',
        retArrTime: '1715',
      };
    }
    return {
      flightNumber: '532',
      depTime: '1830',
      arrTime: '2215',
      equip: '320',
      transit: 'KWI',
      transitFlightNumber: d === 'RUH' ? '123' : d === 'JED' ? '215' : '105',
      transitDepTime: d === 'RUH' ? '0130' : (d === 'JED' ? '0200' : '0230'),
      transitArrTime: d === 'RUH' ? '0300' : (d === 'JED' ? '0415' : '0500'),
      transitEquip: '320',
      elapsedTime: '11:30',
      retFlightNumber: d === 'RUH' ? '124' : (d === 'JED' ? '216' : '106'),
      retDepTime: '0430',
      retArrTime: '0600',
      retTransitFlightNumber: '531',
      retTransitDepTime: '0915',
      retTransitArrTime: '1715',
    };
  }

  // 15. FLYNAS (XY)
  if (air === 'XY') {
    return {
      flightNumber: d === 'JED' ? '881' : '883',
      depTime: d === 'JED' ? '1530' : '1400',
      arrTime: d === 'JED' ? '2010' : '1815',
      equip: '320',
      retFlightNumber: d === 'JED' ? '882' : '884',
      retDepTime: d === 'JED' ? '0600' : '0445',
      retArrTime: d === 'JED' ? '1430' : '1300',
    };
  }

  // 16. AIR ASTRA (2A)
  if (air === '2A' && isDomesticAirport(o) && isDomesticAirport(d)) {
    const astraDom: FlightSchedulePattern[] = [
      { flightNumber: '451', depTime: '0745', arrTime: '0845', equip: 'AT7', retFlightNumber: '452', retDepTime: '0915', retArrTime: '1015' },
      { flightNumber: '453', depTime: '1215', arrTime: '1315', equip: 'AT7', retFlightNumber: '454', retDepTime: '1345', retArrTime: '1445' },
      { flightNumber: '455', depTime: '1600', arrTime: '1700', equip: 'AT7', retFlightNumber: '456', retDepTime: '1730', retArrTime: '1830' },
    ];
    return astraDom[optIndex % astraDom.length];
  }

  // Generic fallback for any other airline
  const hub = (AIRLINE_HUBS[air] && AIRLINE_HUBS[air][0]) || 'DXB';
  const isDirect = isDirectFlight(o, d, air) || d === hub;
  const numBase = 100 + optIndex * 10 + Math.floor(Math.random() * 5);

  if (isDirect) {
    return {
      flightNumber: String(numBase),
      depTime: optIndex % 2 === 0 ? '0815' : '1930',
      arrTime: optIndex % 2 === 0 ? '1245' : '2350',
      equip: '789',
      retFlightNumber: String(numBase + 1),
      retDepTime: optIndex % 2 === 0 ? '1430' : '0115',
      retArrTime: optIndex % 2 === 0 ? '2100' : '0745',
    };
  }

  return {
    flightNumber: String(numBase),
    depTime: '0345',
    arrTime: '0715',
    equip: '77W',
    transit: hub,
    transitFlightNumber: String(numBase + 50),
    transitDepTime: '0930',
    transitArrTime: '1420',
    transitEquip: '789',
    retFlightNumber: String(numBase + 51),
    retDepTime: '1600',
    retArrTime: '2045',
    retTransitFlightNumber: String(numBase + 1),
    retTransitDepTime: '2230',
    retTransitArrTime: '0515',
  };
};

// ----------------------------------------------------------------------
// PARSERS FOR GDS INPUTS
// ----------------------------------------------------------------------

export interface ParsedFxdParams {
  orig: string;
  dest: string;
  outboundDate: string;
  isRoundTrip: boolean;
  returnDate?: string;
  airlineFilter?: string;
  isBusiness: boolean;
  adt: number;
  chd: number;
  inf: number;
}

export const parseFxdInput = (rawCmd: string): ParsedFxdParams => {
  const upper = rawCmd.toUpperCase().trim();
  const body = upper.replace(/^FXD\s*/, '').trim();

  // 1. Airline filter: //ASV, /ASV, /A SV, /AQR, //AEK, etc.
  let airlineFilter: string | undefined = undefined;
  const airMatch = body.match(/(?:\/\/|\/|\s)A\s*([A-Z0-9]{2})/);
  if (airMatch) {
    airlineFilter = airMatch[1];
  } else {
    // Check trailing /XX where XX is airline
    const trailingAir = body.match(/(?:\/\/|\/)([A-Z0-9]{2})$/);
    if (trailingAir && AIRLINES.some((a) => a.code === trailingAir[1])) {
      airlineFilter = trailingAir[1];
    }
  }

  // 2. Cabin class
  const isBusiness = body.includes('//KC') || body.includes('/KC') || body.includes('//C') || body.includes('/C');

  // 3. Passenger counts: //PAX/2/RCH/INF/1
  let adt = 1;
  let chd = 0;
  let inf = 0;

  const paxMatch = body.match(/PAX\/(\d+)/);
  if (paxMatch) adt = parseInt(paxMatch[1], 10);

  if (body.includes('/RCH') || body.includes('/CHD')) chd = 1;
  const chdMatch = body.match(/CHD\/(\d+)/);
  if (chdMatch) chd = parseInt(chdMatch[1], 10);

  const infMatch = body.match(/INF\/(\d+)/);
  if (infMatch) inf = parseInt(infMatch[1], 10);
  else if (body.includes('/INF')) inf = 1;

  // 4. Dates: e.g. /D25OCT, D25OCT, 25OCT, /D10NOV, etc.
  const dateMatches: string[] = [];
  const dateRegex = /(?:^|[\s\/-])(?:D)?(\d{1,2}[A-Z]{3})(?:\d{2,4})?(?:[\s\/-]|$)/g;
  let dMatch;
  while ((dMatch = dateRegex.exec(body)) !== null) {
    const rawD = dMatch[1];
    if (!dateMatches.includes(rawD)) {
      dateMatches.push(rawD);
    }
  }

  // Look for /D25OCTJED format explicitly
  const legMatches = [...body.matchAll(/\/D(\d{1,2}[A-Z]{3})([A-Z]{3})/g)];
  let outboundDate = dateMatches[0] || (legMatches[0] ? legMatches[0][1] : '25OCT');
  let returnDate: string | undefined = undefined;
  let isRoundTrip = false;

  if (legMatches.length >= 2) {
    isRoundTrip = true;
    returnDate = legMatches[1][1];
  } else if (dateMatches.length >= 2) {
    isRoundTrip = true;
    returnDate = dateMatches[1];
  }

  // 5. Origin & Destination cities
  let orig = 'DAC';
  let dest = 'JED';

  // Format: DAC/D25OCTJED or DAC/D20NOVJFK/D19DECDAC
  const origFromStart = body.match(/^([A-Z]{3})/);
  if (origFromStart && AIRPORTS.some((a) => a.code === origFromStart[1])) {
    orig = origFromStart[1];
  }

  if (legMatches.length > 0) {
    dest = legMatches[0][2];
  } else {
    // Look for space/hyphen/slash separated pair: DAC JED or DAC-JED or DAC/JED or DACJED
    const cleanWithoutQualifiers = body
      .replace(/(?:\/\/|\/|\s)A\s*[A-Z0-9]{2}/g, '')
      .replace(/\/D\d{1,2}[A-Z]{3}/g, '')
      .replace(/\d{1,2}[A-Z]{3}/g, '')
      .replace(/\/\/[A-Z0-9\/]+/g, '')
      .trim();

    const pairMatch = cleanWithoutQualifiers.match(/([A-Z]{3})[\s\/-]*([A-Z]{3})/);
    if (pairMatch && !MONTHS.includes(pairMatch[1]) && !MONTHS.includes(pairMatch[2])) {
      orig = pairMatch[1];
      dest = pairMatch[2];
    } else {
      // Find all 3-letter tokens that match known airports, excluding month names
      const threeLetterTokens = (cleanWithoutQualifiers.match(/[A-Z]{3}/g) || []).filter(
        (tok) => !MONTHS.includes(tok)
      );
      const airportTokens = threeLetterTokens.filter((tok) =>
        AIRPORTS.some((a) => a.code === tok)
      );
      if (airportTokens.length >= 2) {
        orig = airportTokens[0];
        dest = airportTokens[1];
      } else if (airportTokens.length === 1) {
        if (airportTokens[0] === 'DAC') {
          dest = 'JED';
        } else {
          orig = 'DAC';
          dest = airportTokens[0];
        }
      }
    }
  }

  return {
    orig: orig || 'DAC',
    dest: dest || 'JED',
    outboundDate: cleanGdsDate(outboundDate),
    isRoundTrip,
    returnDate: returnDate ? cleanGdsDate(returnDate) : undefined,
    airlineFilter,
    isBusiness,
    adt,
    chd,
    inf,
  };
};

export interface ParsedAnParams {
  orig: string;
  dest: string;
  date: string;
  airlineFilter?: string;
}

export const parseAnInput = (rawCmd: string): ParsedAnParams => {
  const upper = rawCmd.toUpperCase().trim();
  let rem = upper.replace(/^AN\s*/, '').trim();

  // 1. Extract Airline Qualifier: /AQR, //AQR, /A QR, /ASV, //ASV, /ABG, /ABS, or trailing /QR, /SV, /BG, /BS
  let airlineFilter: string | undefined = undefined;
  const airMatch = rem.match(/(?:\/\/|\/|\s)A\s*([A-Z0-9]{2})(?:\s|$)/);
  if (airMatch) {
    airlineFilter = airMatch[1];
    rem = rem.replace(airMatch[0], ' ').trim();
  } else {
    const slashAir = rem.match(/(?:\/\/|\/)([A-Z0-9]{2})$/);
    if (
      slashAir &&
      (AIRLINES.some((a) => a.code === slashAir[1]) ||
        ['BG', 'BS', 'VQ', '2A', 'SV', 'QR', 'EK', 'FZ', 'G9', 'GF', 'KU', 'J9', 'XY', 'TK', 'SQ', 'MH', 'TG', 'AI', '6E', 'BA'].includes(slashAir[1]))
    ) {
      airlineFilter = slashAir[1];
      rem = rem.replace(slashAir[0], ' ').trim();
    }
  }

  // 2. Strip any time qualifiers (e.g. 1800, /1800) or class qualifiers (e.g. /CY, /CC, /K)
  rem = rem.replace(/(?:\/\/|\/|\s)[0-2]\d[0-5]\d(?:\s|$)/g, ' ');
  rem = rem.replace(/(?:\/\/|\/)[A-Z]{1,2}(?:\s|$)/g, ' ');

  // 3. Extract Date: Day (1-2 digits) + 3-letter Month from MONTHS (e.g. 30SEP, 15OCT, 25NOV, 10JAN)
  let date = '30SEP';
  const monthListStr = MONTHS.join('|');
  const dateRegex = new RegExp(`(?:^|[\\s\\/-]|D)?(\\d{1,2})(${monthListStr})(?:\\d{2,4})?(?:[\\s\\/-]|$)`);
  const dateMatch = rem.match(dateRegex);

  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2];
    date = `${day}${month}`;
    rem = rem.replace(dateMatch[0], ' ').trim();
  } else {
    // Check if input begins with 1-2 digits without month name (e.g. AN30DACRUH)
    const dayOnlyMatch = rem.match(/^(\d{1,2})([A-Z]{6})/);
    if (dayOnlyMatch) {
      date = `${dayOnlyMatch[1].padStart(2, '0')}SEP`;
      rem = dayOnlyMatch[2];
    }
  }

  // 4. Extract Origin and Destination from remaining letters
  let orig = 'DAC';
  let dest = 'RUH';

  const lettersOnly = rem.replace(/[^A-Z]/g, '');

  if (lettersOnly.length === 6) {
    orig = lettersOnly.substring(0, 3);
    dest = lettersOnly.substring(3, 6);
  } else {
    const tokens = (rem.match(/[A-Z]{3}/g) || []).filter((t) => !MONTHS.includes(t));
    if (tokens.length >= 2) {
      orig = tokens[0];
      dest = tokens[1];
    } else if (tokens.length === 1) {
      if (tokens[0] === 'DAC') {
        orig = 'DAC';
        dest = 'RUH';
      } else {
        orig = 'DAC';
        dest = tokens[0];
      }
    } else if (lettersOnly.length >= 3) {
      if (lettersOnly.startsWith('DAC')) {
        orig = 'DAC';
        dest = lettersOnly.substring(3, 6) || 'RUH';
      } else {
        dest = lettersOnly.substring(0, 3);
        orig = 'DAC';
      }
    }
  }

  return {
    orig: orig || 'DAC',
    dest: dest || 'RUH',
    date: cleanGdsDate(date),
    airlineFilter,
  };
};

// ----------------------------------------------------------------------
// 1. DYNAMIC LOWEST FARE SEARCH (FXD)
// ----------------------------------------------------------------------

export const generateLowestFareSearch = (
  rawCmd: string
): { options: FareSearchOption[]; displayText: string } => {
  const params = parseFxdInput(rawCmd);
  const { orig, dest, outboundDate, isRoundTrip, returnDate, airlineFilter, isBusiness, adt, chd, inf } = params;

  // Determine carriers to display
  const airlinesToUse = getCarriersForSector(orig, dest, airlineFilter);

  // Calculate base sector pricing
  const sectorFare = calculateSectorFare(orig, dest, isBusiness, isRoundTrip);

  const options: FareSearchOption[] = [];

  // Generate varied options
  airlinesToUse.forEach((airline, index) => {
    const optNum = index + 1;
    const sched = getScheduleForCarrier(airline, orig, dest, index);

    // Price step per option (Option 1 lowest promo, Option 2 regular, Option 3 standard, Option 4 flex)
    const priceVarianceMultiplier = 1 + index * 0.04;
    let baseUnit = Math.round(sectorFare.base * priceVarianceMultiplier);
    let taxUnit = sectorFare.tax;

    // Carrier specific subtle realism adjustment
    if (airline === 'BG') baseUnit = Math.round(baseUnit * 0.92);
    if (airline === 'SV') baseUnit = Math.round(baseUnit * 0.95);
    if (airline === 'BS' || airline === 'VQ') baseUnit = Math.round(baseUnit * 0.90);
    if (airline === 'EK' || airline === 'QR') baseUnit = Math.round(baseUnit * 1.05);

    const adtFare = baseUnit + taxUnit;
    const chdFare = Math.round((baseUnit * 0.75) + (taxUnit * 0.85));
    const infFare = Math.round((baseUnit * 0.1) + 4000);

    const totalFare = (adtFare * adt) + (chdFare * chd) + (infFare * inf);
    const baseTotal = Math.round(baseUnit * (adt + chd * 0.75 + inf * 0.1));
    const taxesTotal = totalFare - baseTotal;

    const bookingClass = isBusiness
      ? (index === 0 ? 'J' : 'C')
      : (index === 0 ? 'T' : index === 1 ? 'Q' : index === 2 ? 'M' : 'Y');

    const flights: FareSearchFlight[] = [];

    // Outbound flight 1
    if (sched.transit && sched.transitFlightNumber) {
      // 1-stop connection
      flights.push({
        airline,
        flightNumber: sched.flightNumber,
        origin: orig,
        destination: sched.transit,
        date: outboundDate,
        depTime: sched.depTime,
        arrTime: sched.arrTime,
        bookingClass,
        equip: sched.equip,
      });
      flights.push({
        airline,
        flightNumber: sched.transitFlightNumber,
        origin: sched.transit,
        destination: dest,
        date: outboundDate,
        depTime: sched.transitDepTime || '0900',
        arrTime: sched.transitArrTime || '1400',
        bookingClass,
        equip: sched.transitEquip || '789',
      });
    } else {
      // Direct non-stop flight
      flights.push({
        airline,
        flightNumber: sched.flightNumber,
        origin: orig,
        destination: dest,
        date: outboundDate,
        depTime: sched.depTime,
        arrTime: sched.arrTime,
        bookingClass,
        equip: sched.equip,
      });
    }

    // Inbound flight (if round trip)
    if (isRoundTrip && returnDate) {
      if (sched.transit && sched.retTransitFlightNumber) {
        // 1-stop return
        flights.push({
          airline,
          flightNumber: sched.retFlightNumber || `${parseInt(sched.flightNumber, 10) + 1}`,
          origin: dest,
          destination: sched.transit,
          date: returnDate,
          depTime: sched.retDepTime || '1500',
          arrTime: sched.retArrTime || '1900',
          bookingClass,
          equip: sched.transitEquip || '789',
        });
        flights.push({
          airline,
          flightNumber: sched.retTransitFlightNumber,
          origin: sched.transit,
          destination: orig,
          date: returnDate,
          depTime: sched.retTransitDepTime || '2100',
          arrTime: sched.retTransitArrTime || '0500',
          bookingClass,
          equip: sched.equip,
        });
      } else {
        // Direct non-stop return
        flights.push({
          airline,
          flightNumber: sched.retFlightNumber || `${parseInt(sched.flightNumber, 10) + 1}`,
          origin: dest,
          destination: orig,
          date: returnDate,
          depTime: sched.retDepTime || '1100',
          arrTime: sched.retArrTime || '1800',
          bookingClass,
          equip: sched.equip,
        });
      }
    }

    options.push({
      optionNumber: optNum,
      airline,
      flights,
      fareBasis: `${bookingClass}LRBD1`,
      currency: 'BDT',
      baseFare: baseTotal,
      taxes: taxesTotal,
      totalFare,
      paxCount: { adt, chd, inf },
    });
  });

  // Build authentic Amadeus FXD text output
  const lines: string[] = [];
  lines.push(
    `FXD BEST BUY - FARE SEARCH RESULTS: ${orig}-${dest}${isRoundTrip && returnDate ? ' / ' + outboundDate + ' - ' + returnDate : ' / ' + outboundDate}`
  );
  lines.push(
    `CURRENCY: BDT   PASSENGERS: ${adt} ADT${chd > 0 ? `, ${chd} CHD` : ''}${inf > 0 ? `, ${inf} INF` : ''}   CABIN: ${isBusiness ? 'BUSINESS (C)' : 'ECONOMY (Y)'}`
  );
  lines.push(`-----------------------------------------------------------------------------`);

  options.forEach((opt) => {
    const optNumPad = String(opt.optionNumber).padStart(2, '0');
    const airInfo = AIRLINES.find((a) => a.code === opt.airline);
    const airName = airInfo ? airInfo.name : opt.airline;

    lines.push(`OPTION ${optNumPad} - ${airName} (${opt.airline})`);
    lines.push(
      `TOTAL FARE: ${opt.currency} ${opt.totalFare.toLocaleString()} (BASE: ${opt.currency} ${opt.baseFare.toLocaleString()} + TAX: ${opt.currency} ${opt.taxes.toLocaleString()})`
    );
    lines.push(`ITINERARY:`);

    opt.flights.forEach((flt, fIdx) => {
      const segNum = fIdx + 1;
      lines.push(
        ` ${segNum}  ${flt.airline} ${flt.flightNumber.padEnd(4, ' ')} ${flt.bookingClass} ${flt.date} ${flt.origin}${flt.destination} ${flt.depTime} ${flt.arrTime}  ${flt.equip}`
      );
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

// ----------------------------------------------------------------------
// 2. DYNAMIC FLIGHT AVAILABILITY (AN)
// ----------------------------------------------------------------------

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

  const airlinesToUse = getCarriersForSector(orig, dest, air);
  const options: AvailabilityOption[] = [];

  const REALISTIC_CLASS_PATTERNS: { c1: string; c2: string }[] = [
    { c1: 'J9 C9 D9 Y9 B9 M9', c2: 'Q9 T9 V9 L9 K9' },
    { c1: 'J9 C7 D4 Y9 B9 M9', c2: 'Q9 T7 V4 L2 K0' },
    { c1: 'J9 C9 D6 Y9 B9 M7', c2: 'Q9 T9 V8 L5 K2' },
    { c1: 'J4 C2 D0 Y9 B7 M4', c2: 'Q7 T4 V2 L0 K0' },
    { c1: 'J9 C9 D4 Y9 B9 M9', c2: 'Q9 T5 V3 L1 K0' },
    { c1: 'J9 C8 D5 Y9 B9 M9', c2: 'Q9 T4 V2 L0 K0' },
    { c1: 'J9 C6 D2 Y9 B9 M7', c2: 'Q6 T3 V1 L0 K0' },
    { c1: 'J9 C9 D9 Y9 B9 M9', c2: 'Q9 T7 V4 L2 K1' },
    { c1: 'J7 C4 D1 Y9 B8 M5', c2: 'Q4 T2 V1 L0 K0' },
    { c1: 'J9 C9 D7 Y9 B9 M9', c2: 'Q9 T8 V5 L3 K1' },
    { c1: 'J9 C7 D3 Y9 B9 M9', c2: 'Q9 T6 V3 L1 K0' },
    { c1: 'J9 C9 D9 Y9 B9 M9', c2: 'Q9 T9 V9 L9 K9' },
  ];

  airlinesToUse.forEach((carrier, index) => {
    const lineNum = index + 1;
    const sched = getScheduleForCarrier(carrier, orig, dest, index);
    const cp1 = REALISTIC_CLASS_PATTERNS[index % REALISTIC_CLASS_PATTERNS.length];
    const cp2 = REALISTIC_CLASS_PATTERNS[(index + 3) % REALISTIC_CLASS_PATTERNS.length];

    if (sched.transit && sched.transitFlightNumber) {
      // Connecting option - leg 2 connects strictly to final destination
      options.push({
        lineNum,
        date: dte,
        flight1: {
          airline: carrier,
          flightNumber: sched.flightNumber,
          classes1: cp1.c1,
          classes2: cp1.c2,
          origin: orig,
          originTerm: '1',
          destination: sched.transit,
          depTime: sched.depTime,
          arrTime: sched.arrTime,
          equip: sched.equip,
        },
        flight2: {
          airline: carrier,
          flightNumber: sched.transitFlightNumber,
          classes1: cp2.c1,
          classes2: cp2.c2,
          origin: sched.transit,
          destination: dest,
          destTerm: '2',
          depTime: sched.transitDepTime || '0900',
          arrTime: sched.transitArrTime || '1400',
          equip: sched.transitEquip || '789',
          elapsedTime: sched.elapsedTime || '10:45',
        },
      });
    } else {
      // Direct option
      options.push({
        lineNum,
        date: dte,
        flight1: {
          airline: carrier,
          flightNumber: sched.flightNumber,
          classes1: cp1.c1,
          classes2: cp1.c2,
          origin: orig,
          originTerm: '1',
          destination: dest,
          destTerm: '1',
          depTime: sched.depTime,
          arrTime: sched.arrTime,
          equip: sched.equip,
        },
      });
    }
  });

  // Build authentic Amadeus AN display
  const lines: string[] = [];
  lines.push(`AN${dte}${orig}${dest}${air ? '/A' + air : ''}`);

  const destAirport = AIRPORTS.find((a) => a.code === dest);
  const destCity = destAirport ? destAirport.city : dest;
  const apClean = destAirport ? destAirport.name.replace(/\s+(AIRPORT|INTL|INTERNATIONAL)$/i, '').trim() : dest;
  const destCountry = destAirport ? destAirport.countryCode : 'XX';
  const destLocation = `${dest} ${destCity} ${apClean} INTL.${destCountry}`;
  const dow = getDayOfWeek(dte);

  lines.push(`** AMADEUS AVAILABILITY - AN ** ${destLocation}   69 ${dow} ${dte} 0000`);

  options.forEach((opt) => {
    const lPad = String(opt.lineNum).padStart(2, ' ');
    const f1 = opt.flight1;
    const f1AirPad = `${f1.airline} ${f1.flightNumber}`.padEnd(8, ' ');

    lines.push(
      `${lPad}  ${f1AirPad} ${f1.classes1}  ${f1.origin} ${f1.destination}  ${f1.depTime} ${f1.arrTime}  E0/${f1.equip}`
    );
    if (f1.classes2) {
      lines.push(`            ${f1.classes2}`);
    }

    if (opt.flight2) {
      const f2 = opt.flight2;
      const f2AirPad = `${f2.airline} ${f2.flightNumber}`.padEnd(8, ' ');
      lines.push(
        `    ${f2AirPad} ${f2.classes1}  ${f2.origin} ${f2.destination}  ${f2.depTime} ${f2.arrTime}  E0/${f2.equip}  ${f2.elapsedTime || '10:45'}`
      );
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

// ----------------------------------------------------------------------
// 3. DYNAMIC TIMETABLE SEARCH (TN)
// ----------------------------------------------------------------------

export const generateTimetable = (rawCmd: string): string => {
  const upper = rawCmd.toUpperCase().trim();
  const afterTn = upper.replace(/^TN\s*/, '').trim();

  let air: string | undefined = undefined;
  const airMatch = afterTn.match(/(?:\/\/|\/|\s)A\s*([A-Z0-9]{2})/);
  if (airMatch) {
    air = airMatch[1];
  } else {
    const trailingAir = afterTn.match(/(?:\/\/|\/)([A-Z0-9]{2})$/);
    if (trailingAir && AIRLINES.some((a) => a.code === trailingAir[1])) {
      air = trailingAir[1];
    }
  }

  let date = '25OCT26';
  const dateMatch = afterTn.match(/(\d{1,2}[A-Z]{3})/);
  if (dateMatch) {
    date = dateMatch[1] + (dateMatch[1].length <= 5 ? '26' : '');
  }

  let orig = 'DAC';
  let dest = 'JED';

  const pairMatch = afterTn.match(/([A-Z]{3})[\s\/-]*([A-Z]{3})/);
  if (pairMatch) {
    orig = pairMatch[1];
    dest = pairMatch[2];
  } else {
    const cleanTokens = afterTn.replace(/\d{1,2}[A-Z]{3}/g, '').match(/[A-Z]{3}/g) || [];
    if (cleanTokens[0] && cleanTokens[1]) {
      orig = cleanTokens[0];
      dest = cleanTokens[1];
    }
  }

  const destAirport = AIRPORTS.find((a) => a.code === dest);
  const destName = destAirport ? `${destAirport.city} ${destAirport.name}.${destAirport.countryCode}` : `${dest}.${dest}`;

  const carriers = getCarriersForSector(orig, dest, air);
  const lines: string[] = [];
  lines.push(`** AMADEUS TIMETABLE - TN ** ${dest} ${destName.padEnd(26, ' ')} ${date}`);

  carriers.forEach((carrier, index) => {
    const optNum = index + 1;
    const sched = getScheduleForCarrier(carrier, orig, dest, index);
    const fltPad = `${carrier} ${sched.flightNumber}`.padEnd(8, ' ');
    const isStop = sched.transit ? 1 : 0;
    const elapsed = isStop ? '9:40' : (isDomesticAirport(orig) && isDomesticAirport(dest) ? '1:00' : '6:25');
    const days = index % 2 === 0 ? '1234567' : '1.3.5.7';

    lines.push(
      `${optNum}   ${fltPad} ${days}  ${orig}   ${sched.depTime}    ${dest} ${sched.arrTime}  ${isStop}  ${date} 28OCT26 ${sched.equip}  ${elapsed}`
    );
  });

  return lines.join('\n');
};

// ----------------------------------------------------------------------
// 4. FARE DISPLAY (FQD)
// ----------------------------------------------------------------------

export const generateFareDisplay = (rawCmd: string): string => {
  const upper = rawCmd.toUpperCase().trim();
  const match = upper.match(/^FQD\s*([A-Z]{3})([A-Z]{3})(?:\/A([A-Z0-9]{2}))?/);

  const orig = match ? match[1] : 'DAC';
  const dest = match ? match[2] : 'JED';
  const air = match && match[3] ? match[3] : 'SV';

  const sectorFare = calculateSectorFare(orig, dest, false, false);
  const baseAmt = sectorFare.base;

  return [
    `FQD${orig}${dest}/A${air} - AMADEUS FARE QUOTE DISPLAY`,
    `ROE 119.50 BDT - SYSTEM DATE 25OCT26`,
    `-----------------------------------------------------------------------------`,
    `LN FARE BASIS  OW/RT BDT FARE   BK SEAS AP MIN MAX RES/TKT ADV BG PEN`,
    `01 YLRBD1      OW    ${baseAmt.toLocaleString()}  Y   --   -- --  --  1A/E         2PC +`,
    `02 MLRBD1      OW    ${Math.round(baseAmt * 0.9).toLocaleString()}  M   --   -- --  --  1A/E         2PC +`,
    `03 QLRBD1      OW    ${Math.round(baseAmt * 0.8).toLocaleString()}  Q   --   -- --  --  1A/E         2PC +`,
    `04 TLRBD1      OW    ${Math.round(baseAmt * 0.7).toLocaleString()}  T   --   -- --  --  1A/E         2PC +`,
    `05 JLRBD1      OW    ${Math.round(baseAmt * 2.4).toLocaleString()}  J   --   -- --  --  1A/E         2PC +`,
    `-----------------------------------------------------------------------------`,
    `FOR RULE PARAGRAPHS ENTER FQN<LINE_NO>*<RULE_CODE> (e.g. FQN1*PE)`,
  ].join('\n');
};

// ----------------------------------------------------------------------
// 5. FARE NOTES & PENALTIES (FQN)
// ----------------------------------------------------------------------

export const generateFareNotes = (rawCmd: string): string => {
  const upper = rawCmd.toUpperCase().trim();
  const ruleMatch = upper.match(/FQN\s*(?:\d+)?(?:\*([A-Z0-9]+))?/);
  const ruleCode = ruleMatch && ruleMatch[1] ? ruleMatch[1] : 'PE';

  if (ruleCode === 'PE' || ruleCode === '16') {
    return [
      `FQN 1*PE - PENALTIES CATEGORY 16`,
      `TARIFF: INT-BDT PUBLISHED FARES   CARRIER: SAUDIA / GENERAL GDS`,
      `RULE: BD01   FARE BASIS: YLRBD1`,
      `-----------------------------------------------------------------------------`,
      `CHANGES:`,
      `  BEFORE DEPARTURE: PERMITTED AT BDT 5,000 PER TRANSACTION PLUS ANY FARE`,
      `  DIFFERENCE. CHILD/INFANT DISCOUNTS APPLY.`,
      `  AFTER DEPARTURE: PERMITTED AT BDT 7,500 PER TRANSACTION PLUS ANY FARE`,
      `  DIFFERENCE.`,
      `CANCELLATIONS / REFUNDS:`,
      `  BEFORE DEPARTURE: PERMITTED AT BDT 8,000 CANCELLATION PENALTY.`,
      `  AFTER DEPARTURE: TICKET IS NON-REFUNDABLE FOR UNUSED PORTION.`,
      `NO-SHOW:`,
      `  ADDITIONAL NO-SHOW FEE OF BDT 6,000 CHARGEABLE IF NOT CANCELLED 24 HOURS`,
      `  PRIOR TO SCHEDULED FLIGHT DEPARTURE TIME.`,
      `-----------------------------------------------------------------------------`,
    ].join('\n');
  }

  return [
    `FQN MENU - AVAILABLE CATEGORIES FOR FARE BASIS YLRBD1:`,
    `-----------------------------------------------------------------------------`,
    ` 01 ELIGIBILITY           09 TRANSFERS            16 PENALTIES (PE)`,
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

// ----------------------------------------------------------------------
// 6. CURRENCY CONVERSION (FQC)
// ----------------------------------------------------------------------

export const convertCurrency = (rawCmd: string): string => {
  const upper = rawCmd.toUpperCase().trim();
  const match = upper.match(/^FQC\s*(\d+(?:\.\d+)?)\s*([A-Z]{3})\/([A-Z]{3})$/);

  if (!match) {
    return 'FORMAT: FQC<AMOUNT><CURR1>/<CURR2> (e.g. FQC100USD/BDT or FQC50000BDT/USD)';
  }

  const amount = parseFloat(match[1]);
  const fromCurr = match[2];
  const toCurr = match[3];

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

  const amountInBdt = amount * rateFrom;
  const converted = amountInBdt / rateTo;
  const effectiveRoe = (rateFrom / rateTo).toFixed(6);

  return [
    `FQC ${amount.toFixed(2)} ${fromCurr} / ${toCurr}`,
    `BSR ROE ${effectiveRoe} - IATA BSR 25OCT26`,
    `${amount.toFixed(2)} ${fromCurr} = ${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`,
    `ROUNDED TOTAL: ${Math.round(converted).toLocaleString('en-US')} ${toCurr}`,
  ].join('\n');
};
