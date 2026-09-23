import { AvailabilityOption, FareSearchOption, FareSearchFlight } from '../types';
import { AIRPORTS, AIRLINES } from '../data/gdsDatabase';

// Recognized GDS 3-letter months
export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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

// Accurate day-of-week calculator for GDS date (e.g. "30SEP" -> "WE", "15OCT" -> "TH", "25NOV" -> "WE")
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
  const bdAirports = ['DAC', 'CGP', 'ZYL', 'CXB', 'CXE', 'JSR', 'BZL', 'RJH', 'SPD'];
  return bdAirports.includes(code.toUpperCase());
};

// Lookup country code for airport
export const getAirportCountry = (code: string): string => {
  const c = code.toUpperCase();
  const ap = AIRPORTS.find((a) => a.code === c);
  if (ap) return ap.countryCode;

  if (isDomesticAirport(c)) return 'BD';
  if (['JED', 'RUH', 'MED', 'DMM', 'AHB', 'GIZ'].includes(c)) return 'SA';
  if (['DXB', 'AUH', 'SHJ', 'DWC'].includes(c)) return 'AE';
  if (['DOH'].includes(c)) return 'QA';
  if (['KWI'].includes(c)) return 'KW';
  if (['BAH'].includes(c)) return 'BH';
  if (['MCT', 'SLL'].includes(c)) return 'OM';
  if (['LHR', 'LGW', 'LON', 'MAN', 'BHX', 'EDI'].includes(c)) return 'GB';
  if (['JFK', 'EWR', 'NYC', 'ORD', 'ATL', 'DFW', 'IAH', 'LAX', 'SFO', 'IAD', 'MIA', 'BOS'].includes(c)) return 'US';
  if (['YYZ', 'YVR', 'YUL', 'YYC'].includes(c)) return 'CA';
  if (['SIN'].includes(c)) return 'SG';
  if (['KUL', 'PEN'].includes(c)) return 'MY';
  if (['BKK', 'DMK', 'HKT'].includes(c)) return 'TH';
  if (['IST', 'SAW', 'AYT'].includes(c)) return 'TR';
  if (['DEL', 'BOM', 'CCU', 'MAA', 'BLR', 'HYD'].includes(c)) return 'IN';
  if (['CDG', 'ORY', 'NCE'].includes(c)) return 'FR';
  if (['FRA', 'MUC', 'BER'].includes(c)) return 'DE';
  if (['AMS'].includes(c)) return 'NL';
  if (['FCO', 'MXP'].includes(c)) return 'IT';
  if (['CAI', 'HBE'].includes(c)) return 'EG';
  if (['ADD'].includes(c)) return 'ET';
  if (['HKG'].includes(c)) return 'HK';
  if (['NRT', 'HND', 'KIX'].includes(c)) return 'JP';
  if (['ICN', 'GMP'].includes(c)) return 'KR';
  if (['SYD', 'MEL', 'BNE', 'PER'].includes(c)) return 'AU';
  if (['CAN', 'PVG', 'PEK', 'PKX'].includes(c)) return 'CN';
  return 'XX';
};

// ======================================================================
// 1. AIRLINE HUB & COUNTRY PROFILES
// ======================================================================

export interface AirlineHubProfile {
  code: string;
  name: string;
  country: string;
  hubs: string[];
  aircraft: string[];
  directDestinations: string[];
}

export const AIRLINE_HUB_PROFILES: Record<string, AirlineHubProfile> = {
  // Bangladesh (Strict rule: ONLY operate if origin or destination is BD)
  BG: {
    code: 'BG',
    name: 'BIMAN BANGLADESH AIRLINES',
    country: 'BD',
    hubs: ['DAC', 'CGP', 'ZYL'],
    aircraft: ['788', '789', '77W', '738', 'DH4'],
    directDestinations: ['LHR', 'JED', 'MED', 'RUH', 'DMM', 'DXB', 'AUH', 'SHJ', 'DOH', 'KWI', 'MCT', 'SIN', 'KUL', 'BKK', 'CCU', 'DEL', 'CAN', 'NRT', 'CGP', 'ZYL', 'CXB', 'CXE', 'JSR', 'BZL', 'RJH', 'SPD'],
  },
  BS: {
    code: 'BS',
    name: 'US-BANGLA AIRLINES',
    country: 'BD',
    hubs: ['DAC', 'CGP'],
    aircraft: ['333', '738', 'AT7'],
    directDestinations: ['DXB', 'SHJ', 'DOH', 'MCT', 'SIN', 'KUL', 'BKK', 'CCU', 'JED', 'RUH', 'MAA', 'MLE', 'CGP', 'ZYL', 'CXB', 'CXE', 'JSR', 'BZL', 'RJH', 'SPD'],
  },
  VQ: {
    code: 'VQ',
    name: 'NOVOAIR',
    country: 'BD',
    hubs: ['DAC'],
    aircraft: ['AT7'],
    directDestinations: ['CGP', 'ZYL', 'CXB', 'CXE', 'JSR', 'BZL', 'RJH', 'SPD', 'CCU'],
  },
  '2A': {
    code: '2A',
    name: 'AIR ASTRA',
    country: 'BD',
    hubs: ['DAC'],
    aircraft: ['AT7'],
    directDestinations: ['CGP', 'ZYL', 'CXB', 'CXE', 'SPD'],
  },

  // Saudi Arabia
  SV: {
    code: 'SV',
    name: 'SAUDIA',
    country: 'SA',
    hubs: ['JED', 'RUH'],
    aircraft: ['77W', '789', '78X', '333', '321'],
    directDestinations: ['DAC', 'CGP', 'DXB', 'AUH', 'SHJ', 'DOH', 'KWI', 'BAH', 'MCT', 'LHR', 'LGW', 'MAN', 'CDG', 'FRA', 'AMS', 'IST', 'FCO', 'MXP', 'JFK', 'IAD', 'LAX', 'YYZ', 'CAI', 'DEL', 'BOM', 'KUL', 'SIN', 'CAN', 'RUH', 'JED', 'MED', 'DMM'],
  },
  XY: {
    code: 'XY',
    name: 'FLYNAS',
    country: 'SA',
    hubs: ['RUH', 'JED'],
    aircraft: ['320', '321'],
    directDestinations: ['DAC', 'DXB', 'DOH', 'KWI', 'BAH', 'MCT', 'CAI', 'IST', 'RUH', 'JED', 'MED', 'DMM'],
  },

  // United Arab Emirates
  EK: {
    code: 'EK',
    name: 'EMIRATES',
    country: 'AE',
    hubs: ['DXB'],
    aircraft: ['380', '77W'],
    directDestinations: ['DAC', 'CGP', 'LHR', 'LGW', 'MAN', 'JFK', 'EWR', 'ORD', 'LAX', 'SFO', 'IAD', 'YYZ', 'YVR', 'YUL', 'CDG', 'FRA', 'MUC', 'AMS', 'IST', 'SIN', 'BKK', 'KUL', 'DEL', 'BOM', 'CCU', 'MAA', 'JED', 'RUH', 'MED', 'DMM', 'DOH', 'KWI', 'BAH', 'MCT', 'SYD', 'MEL', 'HKG', 'NRT', 'HND', 'ICN', 'CAI', 'ADD'],
  },
  FZ: {
    code: 'FZ',
    name: 'FLYDUBAI',
    country: 'AE',
    hubs: ['DXB'],
    aircraft: ['738', '739'],
    directDestinations: ['DAC', 'CGP', 'ZYL', 'JED', 'RUH', 'MED', 'DMM', 'DOH', 'KWI', 'BAH', 'MCT', 'DEL', 'BOM', 'CCU', 'CAI', 'IST'],
  },
  EY: {
    code: 'EY',
    name: 'ETIHAD AIRWAYS',
    country: 'AE',
    hubs: ['AUH'],
    aircraft: ['789', '78X', '77W', '351'],
    directDestinations: ['DAC', 'LHR', 'MAN', 'JFK', 'ORD', 'CDG', 'FRA', 'AMS', 'SIN', 'BKK', 'KUL', 'DEL', 'BOM', 'JED', 'RUH', 'DOH', 'KWI', 'BAH', 'MCT', 'SYD', 'MEL', 'CAI'],
  },
  G9: {
    code: 'G9',
    name: 'AIR ARABIA',
    country: 'AE',
    hubs: ['SHJ'],
    aircraft: ['320', '321'],
    directDestinations: ['DAC', 'CGP', 'JED', 'RUH', 'DMM', 'DOH', 'KWI', 'BAH', 'MCT', 'DEL', 'BOM', 'CCU', 'CAI', 'IST'],
  },

  // Qatar
  QR: {
    code: 'QR',
    name: 'QATAR AIRWAYS',
    country: 'QA',
    hubs: ['DOH'],
    aircraft: ['77W', '359', '351', '789', '788'],
    directDestinations: ['DAC', 'CGP', 'DXB', 'AUH', 'SHJ', 'JED', 'RUH', 'MED', 'DMM', 'KWI', 'BAH', 'MCT', 'LHR', 'LGW', 'MAN', 'CDG', 'FRA', 'MUC', 'AMS', 'IST', 'SAW', 'FCO', 'MXP', 'JFK', 'EWR', 'ORD', 'LAX', 'SFO', 'IAD', 'ATL', 'DFW', 'IAH', 'YYZ', 'YVR', 'YUL', 'SIN', 'BKK', 'KUL', 'DEL', 'BOM', 'CCU', 'MAA', 'SYD', 'MEL', 'HKG', 'NRT', 'HND', 'ICN', 'CAI', 'ADD'],
  },

  // Canada
  AC: {
    code: 'AC',
    name: 'AIR CANADA',
    country: 'CA',
    hubs: ['YYZ', 'YVR', 'YUL'],
    aircraft: ['789', '77W', '333', '788'],
    directDestinations: ['LHR', 'LGW', 'CDG', 'FRA', 'AMS', 'FCO', 'DXB', 'DOH', 'RUH', 'JED', 'DEL', 'BOM', 'NRT', 'HND', 'HKG', 'ICN', 'SYD', 'JFK', 'EWR', 'ORD', 'LAX', 'SFO', 'IAD', 'ATL', 'DFW', 'IAH', 'YYZ', 'YVR', 'YUL'],
  },

  // United Kingdom
  BA: {
    code: 'BA',
    name: 'BRITISH AIRWAYS',
    country: 'GB',
    hubs: ['LHR'],
    aircraft: ['77W', '351', '789', '78X', '380'],
    directDestinations: ['JFK', 'EWR', 'ORD', 'LAX', 'SFO', 'IAD', 'ATL', 'DFW', 'IAH', 'YYZ', 'YVR', 'YUL', 'DXB', 'DOH', 'JED', 'RUH', 'KWI', 'BAH', 'SIN', 'BKK', 'KUL', 'DEL', 'BOM', 'CCU', 'MAA', 'HKG', 'NRT', 'HND', 'SYD', 'CDG', 'FRA', 'MUC', 'AMS', 'FCO', 'MXP', 'IST', 'CAI'],
  },

  // Turkey
  TK: {
    code: 'TK',
    name: 'TURKISH AIRLINES',
    country: 'TR',
    hubs: ['IST'],
    aircraft: ['359', '789', '77W', '333', '321'],
    directDestinations: ['DAC', 'LHR', 'LGW', 'MAN', 'JFK', 'EWR', 'ORD', 'LAX', 'SFO', 'IAD', 'ATL', 'DFW', 'IAH', 'YYZ', 'YVR', 'YUL', 'CDG', 'FRA', 'MUC', 'AMS', 'FCO', 'MXP', 'DXB', 'AUH', 'SHJ', 'DOH', 'JED', 'RUH', 'MED', 'DMM', 'KWI', 'BAH', 'MCT', 'DEL', 'BOM', 'SIN', 'BKK', 'KUL', 'HKG', 'NRT', 'ICN', 'CAI', 'ADD'],
  },

  // Singapore
  SQ: {
    code: 'SQ',
    name: 'SINGAPORE AIRLINES',
    country: 'SG',
    hubs: ['SIN'],
    aircraft: ['359', '78X', '77W', '380', '738'],
    directDestinations: ['DAC', 'LHR', 'MAN', 'CDG', 'FRA', 'MUC', 'AMS', 'FCO', 'MXP', 'JFK', 'EWR', 'LAX', 'SFO', 'DXB', 'DOH', 'BKK', 'KUL', 'DEL', 'BOM', 'CCU', 'MAA', 'SYD', 'MEL', 'HKG', 'NRT', 'HND', 'ICN'],
  },

  // Malaysia
  MH: {
    code: 'MH',
    name: 'MALAYSIA AIRLINES',
    country: 'MY',
    hubs: ['KUL'],
    aircraft: ['359', '333', '738'],
    directDestinations: ['DAC', 'LHR', 'DXB', 'DOH', 'JED', 'MED', 'SIN', 'BKK', 'DEL', 'BOM', 'SYD', 'MEL', 'HKG', 'NRT', 'ICN'],
  },
  OD: {
    code: 'OD',
    name: 'BATIK AIR MALAYSIA',
    country: 'MY',
    hubs: ['KUL'],
    aircraft: ['738', '739', '333'],
    directDestinations: ['DAC', 'SIN', 'BKK', 'DEL', 'BOM', 'DXB', 'JED', 'SYD', 'MEL'],
  },

  // India
  AI: {
    code: 'AI',
    name: 'AIR INDIA',
    country: 'IN',
    hubs: ['DEL', 'BOM'],
    aircraft: ['788', '77W', '359', '321'],
    directDestinations: ['DAC', 'LHR', 'LGW', 'JFK', 'EWR', 'ORD', 'SFO', 'IAD', 'YYZ', 'YVR', 'CDG', 'FRA', 'AMS', 'DXB', 'AUH', 'DOH', 'JED', 'RUH', 'DMM', 'KWI', 'BAH', 'MCT', 'SIN', 'BKK', 'KUL', 'HKG', 'NRT', 'SYD', 'MEL', 'DEL', 'BOM', 'CCU', 'MAA'],
  },
  '6E': {
    code: '6E',
    name: 'INDIGO',
    country: 'IN',
    hubs: ['DEL', 'BOM', 'CCU'],
    aircraft: ['321', '320', '77W'],
    directDestinations: ['DAC', 'DXB', 'SHJ', 'AUH', 'DOH', 'JED', 'RUH', 'DMM', 'KWI', 'BAH', 'MCT', 'SIN', 'BKK', 'KUL', 'IST', 'DEL', 'BOM', 'CCU', 'MAA'],
  },

  // Thailand
  TG: {
    code: 'TG',
    name: 'THAI AIRWAYS',
    country: 'TH',
    hubs: ['BKK'],
    aircraft: ['359', '77W', '788', '789'],
    directDestinations: ['DAC', 'LHR', 'CDG', 'FRA', 'MUC', 'AMS', 'FCO', 'MXP', 'DXB', 'DOH', 'JED', 'SIN', 'KUL', 'DEL', 'BOM', 'CCU', 'MAA', 'SYD', 'MEL', 'HKG', 'NRT', 'HND', 'ICN'],
  },

  // Kuwait
  KU: {
    code: 'KU',
    name: 'KUWAIT AIRWAYS',
    country: 'KW',
    hubs: ['KWI'],
    aircraft: ['77W', '332', '320', '321'],
    directDestinations: ['DAC', 'DXB', 'AUH', 'DOH', 'BAH', 'MCT', 'JED', 'RUH', 'MED', 'DMM', 'LHR', 'CDG', 'FRA', 'IST', 'JFK', 'DEL', 'BOM', 'BKK', 'CAI'],
  },

  // Bahrain
  GF: {
    code: 'GF',
    name: 'GULF AIR',
    country: 'BH',
    hubs: ['BAH'],
    aircraft: ['789', '321'],
    directDestinations: ['DAC', 'DXB', 'AUH', 'DOH', 'KWI', 'MCT', 'JED', 'RUH', 'MED', 'DMM', 'LHR', 'MAN', 'CDG', 'FRA', 'IST', 'DEL', 'BOM', 'BKK', 'SIN', 'CAI'],
  },

  // Oman
  WY: {
    code: 'WY',
    name: 'OMAN AIR',
    country: 'OM',
    hubs: ['MCT'],
    aircraft: ['789', '788', '738'],
    directDestinations: ['DAC', 'CGP', 'DXB', 'AUH', 'DOH', 'KWI', 'BAH', 'JED', 'RUH', 'MED', 'DMM', 'LHR', 'CDG', 'FRA', 'IST', 'DEL', 'BOM', 'BKK', 'KUL', 'CAI'],
  },

  // Germany
  LH: {
    code: 'LH',
    name: 'LUFTHANSA',
    country: 'DE',
    hubs: ['FRA', 'MUC'],
    aircraft: ['359', '744', '789', '321'],
    directDestinations: ['LHR', 'JFK', 'EWR', 'ORD', 'LAX', 'SFO', 'IAD', 'YYZ', 'YVR', 'DXB', 'DOH', 'JED', 'RUH', 'DEL', 'BOM', 'SIN', 'BKK', 'HKG', 'NRT', 'HND', 'CAI', 'ADD', 'FRA', 'MUC'],
  },
};

// ======================================================================
// 2. HUB & FREEDOMS VERIFICATION
// ======================================================================

export const canAirlineOperateDirect = (airlineCode: string, orig: string, dest: string): boolean => {
  const air = airlineCode.toUpperCase();
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();
  const profile = AIRLINE_HUB_PROFILES[air];
  if (!profile) return false;

  const origCountry = getAirportCountry(o);
  const destCountry = getAirportCountry(d);

  // STRICT BANGLADESH RULE:
  if (['BG', 'BS', 'VQ', '2A'].includes(air)) {
    if (origCountry !== 'BD' && destCountry !== 'BD') {
      return false;
    }
  }

  // Domestic Bangladesh
  if (origCountry === 'BD' && destCountry === 'BD') {
    return ['BG', 'BS', 'VQ', '2A'].includes(air);
  }

  // Carrier must connect to hub or direct network
  const connectsToHub = profile.hubs.includes(o) || profile.hubs.includes(d);
  const servesOrigin = profile.hubs.includes(o) || profile.directDestinations.includes(o);
  const servesDest = profile.hubs.includes(d) || profile.directDestinations.includes(d);

  if (connectsToHub && servesOrigin && servesDest) {
    return true;
  }

  // Codeshares and recognized 5th freedoms
  if (air === 'SV' && ((o === 'YYZ' && d === 'RUH') || (o === 'RUH' && d === 'YYZ'))) return true;
  if (air === 'AC' && ((o === 'YYZ' && d === 'RUH') || (o === 'RUH' && d === 'YYZ'))) return true;

  return false;
};

export const getAirlineConnectingHub = (airlineCode: string, orig: string, dest: string): string | null => {
  const air = airlineCode.toUpperCase();
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();
  const profile = AIRLINE_HUB_PROFILES[air];
  if (!profile) return null;

  // STRICT BANGLADESH RULE
  if (['BG', 'BS', 'VQ', '2A'].includes(air)) {
    return null;
  }

  // Cannot transit if origin or destination is already a hub of this airline
  if (profile.hubs.includes(o) || profile.hubs.includes(d)) {
    return null;
  }

  for (const hub of profile.hubs) {
    if (hub === o || hub === d) continue;
    const servesOrig = profile.directDestinations.includes(o);
    const servesDest = profile.directDestinations.includes(d);
    if (servesOrig && servesDest) {
      return hub;
    }
  }

  return null;
};

// ======================================================================
// 3. MULTI-AIRLINE DIVERSITY ROSTER GENERATOR
// ======================================================================

export interface ScheduledFlightOption {
  airline: string;
  flightNumber: string;
  depTime: string;
  arrTime: string;
  equip: string;
  transitHub?: string;
  transitFlightNumber?: string;
  transitDepTime?: string;
  transitArrTime?: string;
  transitEquip?: string;
  elapsedTime?: string;
  codeshare?: string;
  classes1: string;
  classes2?: string;
  transitClasses1?: string;
  transitClasses2?: string;
}

// Realistic Amadeus class distributions
const CLASS_TEMPLATES = [
  { c1: 'J9 C9 D9 Y9 B9 M9', c2: 'Q9 T9 V9 L9 K9' },
  { c1: 'J9 C7 D4 Y9 B9 M9', c2: 'Q9 T7 V4 L2 K0' },
  { c1: 'J9 C9 D6 Y9 B9 M7', c2: 'Q9 T9 V8 L5 K2' },
  { c1: 'J4 C2 D0 Y9 B7 M4', c2: 'Q7 T4 V2 L0 K0' },
  { c1: 'J9 C8 D5 Y9 B9 M9', c2: 'Q9 T4 V2 L0 K0' },
  { c1: 'J9 C9 D9 Y9 B9 M9', c2: 'Q9 T7 V4 L2 K1' },
  { c1: 'J7 C4 D1 Y9 B8 M5', c2: 'Q4 T2 V1 L0 K0' },
  { c1: 'J9 C9 D7 Y9 B9 M9', c2: 'Q9 T8 V5 L3 K1' },
  { c1: 'J8 C6 D3 Y9 B8 M6', c2: 'Q8 T5 V2 L1 K0' },
  { c1: 'J9 C9 D8 Y9 B9 M9', c2: 'Q9 T9 V7 L4 K1' },
  { c1: 'J6 C4 D1 Y8 B7 M4', c2: 'Q6 T3 V1 L0 K0' },
  { c1: 'J9 C9 D9 Y9 B9 M9', c2: 'Q9 T9 V9 L9 K9' },
];

export const getDiverseFlightRoster = (
  orig: string,
  dest: string,
  airlineFilter?: string
): ScheduledFlightOption[] => {
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();
  const oCountry = getAirportCountry(o);
  const dCountry = getAirportCountry(d);

  // -------------------------------------------------------------------
  // SCENARIO A: User entered a specific airline qualifier (e.g. /ASV or /AQR)
  // ONLY then restrict to that airline and show 10-12 flights for that carrier.
  // -------------------------------------------------------------------
  if (airlineFilter) {
    const air = airlineFilter.toUpperCase();
    const isDirect = canAirlineOperateDirect(air, o, d);
    const transitHub = isDirect ? undefined : getAirlineConnectingHub(air, o, d);
    const profile = AIRLINE_HUB_PROFILES[air] || {
      code: air,
      name: air,
      country: 'XX',
      hubs: ['DXB'],
      aircraft: ['77W', '789'],
      directDestinations: [],
    };

    const depTimes = ['0230', '0355', '0620', '0830', '1015', '1240', '1415', '1630', '1945', '2115', '2255', '2345'];
    return depTimes.map((dep, idx) => {
      const cls = CLASS_TEMPLATES[idx % CLASS_TEMPLATES.length];
      const eq1 = profile.aircraft[idx % profile.aircraft.length];
      const eq2 = profile.aircraft[(idx + 1) % profile.aircraft.length];
      const numBase = 100 + idx * 14 + (air.charCodeAt(0) % 30);

      if (isDirect) {
        const arrDirectH = (parseInt(dep.substring(0, 2), 10) + 4) % 24;
        const arrDirect = `${String(arrDirectH).padStart(2, '0')}${dep.substring(2)}`;
        return {
          airline: air,
          flightNumber: String(numBase),
          depTime: dep,
          arrTime: arrDirect,
          equip: eq1,
          classes1: cls.c1,
          classes2: cls.c2,
        };
      }

      const hub = transitHub || profile.hubs[0] || 'DXB';
      const arrH1H = (parseInt(dep.substring(0, 2), 10) + 4) % 24;
      const depH2H = (arrH1H + 2) % 24;
      const arrDestH = (depH2H + 5) % 24;
      return {
        airline: air,
        flightNumber: String(numBase),
        depTime: dep,
        arrTime: `${String(arrH1H).padStart(2, '0')}${dep.substring(2)}`,
        equip: eq1,
        transitHub: hub,
        transitFlightNumber: String(numBase + 101),
        transitDepTime: `${String(depH2H).padStart(2, '0')}15`,
        transitArrTime: `${String(arrDestH).padStart(2, '0')}45`,
        transitEquip: eq2,
        elapsedTime: '13:45',
        classes1: cls.c1,
        classes2: cls.c2,
        transitClasses1: cls.c1,
        transitClasses2: cls.c2,
      };
    });
  }

  // -------------------------------------------------------------------
  // SCENARIO B: Multi-Airline Diversity (NO filter provided)
  // Display a diverse mix of 4 to 8 competing airlines (1-2 flights each)
  // sorted strictly by departure time!
  // -------------------------------------------------------------------

  // 1. ROUTE: YYZ to RUH (Canada to Saudi Arabia)
  if ((o === 'YYZ' && d === 'RUH') || (o === 'RUH' && d === 'YYZ')) {
    return [
      { airline: 'QR', flightNumber: '764', depTime: '0815', arrTime: '0450', equip: '359', transitHub: 'DOH', transitFlightNumber: '1164', transitDepTime: '0715', transitArrTime: '0845', transitEquip: '77W', elapsedTime: '17:30', classes1: CLASS_TEMPLATES[0].c1, classes2: CLASS_TEMPLATES[0].c2 },
      { airline: 'AC', flightNumber: '858', depTime: '0930', arrTime: '2145', equip: '789', transitHub: 'LHR', transitFlightNumber: '213', transitDepTime: '2330', transitArrTime: '0745', transitEquip: '77W', elapsedTime: '15:15', codeshare: 'AC:SV115', classes1: CLASS_TEMPLATES[1].c1, classes2: CLASS_TEMPLATES[1].c2 },
      { airline: 'TK', flightNumber: '018', depTime: '1130', arrTime: '0545', equip: '789', transitHub: 'IST', transitFlightNumber: '140', transitDepTime: '0815', transitArrTime: '1240', transitEquip: '321', elapsedTime: '18:10', classes1: CLASS_TEMPLATES[2].c1, classes2: CLASS_TEMPLATES[2].c2 },
      { airline: 'SV', flightNumber: '062', depTime: '1245', arrTime: '0715', equip: '77W', classes1: CLASS_TEMPLATES[3].c1, classes2: CLASS_TEMPLATES[3].c2 }, // Saudia Direct
      { airline: 'EK', flightNumber: '242', depTime: '1415', arrTime: '1115', equip: '380', transitHub: 'DXB', transitFlightNumber: '2063', transitDepTime: '1430', transitArrTime: '1525', transitEquip: '77W', elapsedTime: '18:10', classes1: CLASS_TEMPLATES[4].c1, classes2: CLASS_TEMPLATES[4].c2 },
      { airline: 'BA', flightNumber: '098', depTime: '1830', arrTime: '0645', equip: '77W', transitHub: 'LHR', transitFlightNumber: '263', transitDepTime: '0915', transitArrTime: '1745', transitEquip: '789', elapsedTime: '16:15', classes1: CLASS_TEMPLATES[5].c1, classes2: CLASS_TEMPLATES[5].c2 },
      { airline: 'QR', flightNumber: '768', depTime: '2030', arrTime: '1645', equip: '359', transitHub: 'DOH', transitFlightNumber: '1168', transitDepTime: '1900', transitArrTime: '2030', transitEquip: '77W', elapsedTime: '17:00', classes1: CLASS_TEMPLATES[6].c1, classes2: CLASS_TEMPLATES[6].c2 },
      { airline: 'TK', flightNumber: '020', depTime: '2150', arrTime: '1605', equip: '77W', transitHub: 'IST', transitFlightNumber: '144', transitDepTime: '1830', transitArrTime: '2255', transitEquip: '333', elapsedTime: '18:05', classes1: CLASS_TEMPLATES[7].c1, classes2: CLASS_TEMPLATES[7].c2 },
      { airline: 'EK', flightNumber: '244', depTime: '2200', arrTime: '1900', equip: '380', transitHub: 'DXB', transitFlightNumber: '2065', transitDepTime: '2145', transitArrTime: '2240', transitEquip: '77W', elapsedTime: '17:40', classes1: CLASS_TEMPLATES[8].c1, classes2: CLASS_TEMPLATES[8].c2 },
      { airline: 'SV', flightNumber: '068', depTime: '2330', arrTime: '1815', equip: '789', classes1: CLASS_TEMPLATES[9].c1, classes2: CLASS_TEMPLATES[9].c2 }, // Saudia Direct
    ];
  }

  // 2. ROUTE: DAC to DXB (Bangladesh to UAE)
  if ((o === 'DAC' && (d === 'DXB' || d === 'SHJ' || d === 'AUH')) || ((o === 'DXB' || o === 'SHJ' || o === 'AUH') && d === 'DAC')) {
    return [
      { airline: 'EK', flightNumber: '585', depTime: '0140', arrTime: '0445', equip: '77W', classes1: CLASS_TEMPLATES[0].c1, classes2: CLASS_TEMPLATES[0].c2 }, // Emirates Direct
      { airline: 'BS', flightNumber: '341', depTime: '0715', arrTime: '1045', equip: '738', classes1: CLASS_TEMPLATES[1].c1, classes2: CLASS_TEMPLATES[1].c2 }, // US-Bangla Direct
      { airline: 'EK', flightNumber: '583', depTime: '1015', arrTime: '1320', equip: '77W', classes1: CLASS_TEMPLATES[2].c1, classes2: CLASS_TEMPLATES[2].c2 }, // Emirates Direct
      { airline: 'BG', flightNumber: '047', depTime: '1245', arrTime: '1615', equip: '77W', classes1: CLASS_TEMPLATES[3].c1, classes2: CLASS_TEMPLATES[3].c2 }, // Biman Direct
      { airline: 'FZ', flightNumber: '584', depTime: '1530', arrTime: '1900', equip: '738', classes1: CLASS_TEMPLATES[4].c1, classes2: CLASS_TEMPLATES[4].c2 }, // Flydubai Direct
      { airline: 'GF', flightNumber: '251', depTime: '1700', arrTime: '1945', equip: '789', transitHub: 'BAH', transitFlightNumber: '504', transitDepTime: '2115', transitArrTime: '2245', transitEquip: '321', elapsedTime: '07:45', classes1: CLASS_TEMPLATES[5].c1, classes2: CLASS_TEMPLATES[5].c2 },
      { airline: 'BG', flightNumber: '147', depTime: '1800', arrTime: '2130', equip: '789', classes1: CLASS_TEMPLATES[6].c1, classes2: CLASS_TEMPLATES[6].c2 }, // Biman Direct
      { airline: 'EK', flightNumber: '587', depTime: '1930', arrTime: '2240', equip: '77W', classes1: CLASS_TEMPLATES[7].c1, classes2: CLASS_TEMPLATES[7].c2 }, // Emirates Direct
      { airline: 'QR', flightNumber: '643', depTime: '2000', arrTime: '2210', equip: '359', transitHub: 'DOH', transitFlightNumber: '1004', transitDepTime: '2330', transitArrTime: '0145', transitEquip: '77W', elapsedTime: '07:45', classes1: CLASS_TEMPLATES[8].c1, classes2: CLASS_TEMPLATES[8].c2 },
      { airline: 'BS', flightNumber: '343', depTime: '2115', arrTime: '0045', equip: '333', classes1: CLASS_TEMPLATES[9].c1, classes2: CLASS_TEMPLATES[9].c2 }, // US-Bangla Direct
      { airline: 'FZ', flightNumber: '586', depTime: '2245', arrTime: '0215', equip: '739', classes1: CLASS_TEMPLATES[10].c1, classes2: CLASS_TEMPLATES[10].c2 }, // Flydubai Direct
      { airline: 'BG', flightNumber: '247', depTime: '2330', arrTime: '0300', equip: '77W', classes1: CLASS_TEMPLATES[11].c1, classes2: CLASS_TEMPLATES[11].c2 }, // Biman Direct
    ];
  }

  // 3. ROUTE: DAC to LHR (Bangladesh to UK)
  if ((o === 'DAC' && (d === 'LHR' || d === 'LGW' || d === 'MAN')) || ((o === 'LHR' || o === 'LGW' || o === 'MAN') && d === 'DAC')) {
    return [
      { airline: 'QR', flightNumber: '639', depTime: '0410', arrTime: '0620', equip: '77W', transitHub: 'DOH', transitFlightNumber: '015', transitDepTime: '0815', transitArrTime: '1325', transitEquip: '359', elapsedTime: '14:15', classes1: CLASS_TEMPLATES[0].c1, classes2: CLASS_TEMPLATES[0].c2 },
      { airline: 'BA', flightNumber: '106', depTime: '0410', arrTime: '0620', equip: '77W', transitHub: 'DOH', transitFlightNumber: '9709', transitDepTime: '0755', transitArrTime: '1325', transitEquip: '777', elapsedTime: '14:15', codeshare: 'BA:QR9709', classes1: CLASS_TEMPLATES[1].c1, classes2: CLASS_TEMPLATES[1].c2 },
      { airline: 'TK', flightNumber: '713', depTime: '0615', arrTime: '1210', equip: '359', transitHub: 'IST', transitFlightNumber: '1979', transitDepTime: '1430', transitArrTime: '1645', transitEquip: '321', elapsedTime: '14:30', classes1: CLASS_TEMPLATES[2].c1, classes2: CLASS_TEMPLATES[2].c2 },
      { airline: 'EK', flightNumber: '581', depTime: '0830', arrTime: '1135', equip: '77W', transitHub: 'DXB', transitFlightNumber: '007', transitDepTime: '1300', transitArrTime: '1745', transitEquip: '77W', elapsedTime: '14:15', classes1: CLASS_TEMPLATES[3].c1, classes2: CLASS_TEMPLATES[3].c2 },
      { airline: 'BG', flightNumber: '201', depTime: '1045', arrTime: '1615', equip: '77W', classes1: CLASS_TEMPLATES[4].c1, classes2: CLASS_TEMPLATES[4].c2 }, // Biman Non-stop Direct
      { airline: 'QR', flightNumber: '641', depTime: '1055', arrTime: '1305', equip: '77W', transitHub: 'DOH', transitFlightNumber: '003', transitDepTime: '1510', transitArrTime: '2025', transitEquip: '77W', elapsedTime: '14:30', classes1: CLASS_TEMPLATES[5].c1, classes2: CLASS_TEMPLATES[5].c2 },
      { airline: 'BG', flightNumber: '203', depTime: '1215', arrTime: '1745', equip: '789', classes1: CLASS_TEMPLATES[6].c1, classes2: CLASS_TEMPLATES[6].c2 }, // Biman Non-stop Direct
      { airline: 'SV', flightNumber: '803', depTime: '1215', arrTime: '1640', equip: '789', transitHub: 'JED', transitFlightNumber: '119', transitDepTime: '1945', transitArrTime: '2355', transitEquip: '77W', elapsedTime: '14:50', classes1: CLASS_TEMPLATES[7].c1, classes2: CLASS_TEMPLATES[7].c2 },
      { airline: 'EK', flightNumber: '587', depTime: '1930', arrTime: '2240', equip: '77W', transitHub: 'DXB', transitFlightNumber: '005', transitDepTime: '0215', transitArrTime: '0705', transitEquip: '380', elapsedTime: '14:35', classes1: CLASS_TEMPLATES[8].c1, classes2: CLASS_TEMPLATES[8].c2 },
      { airline: 'SV', flightNumber: '807', depTime: '1930', arrTime: '2355', equip: '333', transitHub: 'RUH', transitFlightNumber: '111', transitDepTime: '0230', transitArrTime: '0645', transitEquip: '789', elapsedTime: '14:25', classes1: CLASS_TEMPLATES[9].c1, classes2: CLASS_TEMPLATES[9].c2 },
      { airline: 'QR', flightNumber: '643', depTime: '2000', arrTime: '2210', equip: '359', transitHub: 'DOH', transitFlightNumber: '007', transitDepTime: '0200', transitArrTime: '0715', transitEquip: '789', elapsedTime: '14:15', classes1: CLASS_TEMPLATES[10].c1, classes2: CLASS_TEMPLATES[10].c2 },
      { airline: 'TK', flightNumber: '715', depTime: '2255', arrTime: '0450', equip: '789', transitHub: 'IST', transitFlightNumber: '1983', transitDepTime: '0715', transitArrTime: '0930', transitEquip: '321', elapsedTime: '14:35', classes1: CLASS_TEMPLATES[11].c1, classes2: CLASS_TEMPLATES[11].c2 },
    ];
  }

  // 4. ROUTE: Domestic Bangladesh (DAC to CGP, CXB, CXE, ZYL, JSR, etc.)
  if (oCountry === 'BD' && dCountry === 'BD') {
    return [
      { airline: 'BG', flightNumber: '433', depTime: '0730', arrTime: '0815', equip: 'DH4', classes1: CLASS_TEMPLATES[0].c1, classes2: CLASS_TEMPLATES[0].c2 },
      { airline: 'BS', flightNumber: '141', depTime: '0845', arrTime: '0930', equip: 'AT7', classes1: CLASS_TEMPLATES[1].c1, classes2: CLASS_TEMPLATES[1].c2 },
      { airline: 'VQ', flightNumber: '943', depTime: '1015', arrTime: '1100', equip: 'AT7', classes1: CLASS_TEMPLATES[2].c1, classes2: CLASS_TEMPLATES[2].c2 },
      { airline: '2A', flightNumber: '451', depTime: '1130', arrTime: '1215', equip: 'AT7', classes1: CLASS_TEMPLATES[3].c1, classes2: CLASS_TEMPLATES[3].c2 },
      { airline: 'BG', flightNumber: '435', depTime: '1315', arrTime: '1400', equip: '738', classes1: CLASS_TEMPLATES[4].c1, classes2: CLASS_TEMPLATES[4].c2 },
      { airline: 'BS', flightNumber: '143', depTime: '1445', arrTime: '1530', equip: 'AT7', classes1: CLASS_TEMPLATES[5].c1, classes2: CLASS_TEMPLATES[5].c2 },
      { airline: 'VQ', flightNumber: '945', depTime: '1600', arrTime: '1645', equip: 'AT7', classes1: CLASS_TEMPLATES[6].c1, classes2: CLASS_TEMPLATES[6].c2 },
      { airline: '2A', flightNumber: '453', depTime: '1715', arrTime: '1800', equip: 'AT7', classes1: CLASS_TEMPLATES[7].c1, classes2: CLASS_TEMPLATES[7].c2 },
      { airline: 'BS', flightNumber: '147', depTime: '1830', arrTime: '1915', equip: '738', classes1: CLASS_TEMPLATES[8].c1, classes2: CLASS_TEMPLATES[8].c2 },
      { airline: 'BG', flightNumber: '437', depTime: '2000', arrTime: '2045', equip: '738', classes1: CLASS_TEMPLATES[9].c1, classes2: CLASS_TEMPLATES[9].c2 },
      { airline: 'VQ', flightNumber: '947', depTime: '2115', arrTime: '2200', equip: 'AT7', classes1: CLASS_TEMPLATES[10].c1, classes2: CLASS_TEMPLATES[10].c2 },
      { airline: 'BS', flightNumber: '149', depTime: '2200', arrTime: '2245', equip: 'AT7', classes1: CLASS_TEMPLATES[11].c1, classes2: CLASS_TEMPLATES[11].c2 },
    ];
  }

  // 5. ROUTE: Bangladesh to Saudi Arabia (DAC to RUH, JED, MED, DMM)
  if ((o === 'DAC' && (d === 'RUH' || d === 'JED' || d === 'MED' || d === 'DMM')) || ((o === 'RUH' || o === 'JED' || o === 'MED') && d === 'DAC')) {
    return [
      { airline: 'SV', flightNumber: '805', depTime: '0355', arrTime: '0820', equip: '77W', classes1: CLASS_TEMPLATES[0].c1, classes2: CLASS_TEMPLATES[0].c2 }, // Saudia Direct
      { airline: 'BG', flightNumber: '049', depTime: '0830', arrTime: '1215', equip: '77W', classes1: CLASS_TEMPLATES[1].c1, classes2: CLASS_TEMPLATES[1].c2 }, // Biman Direct
      { airline: 'EK', flightNumber: '581', depTime: '1015', arrTime: '1320', equip: '77W', transitHub: 'DXB', transitFlightNumber: '2063', transitDepTime: '1500', transitArrTime: '1615', transitEquip: '77W', elapsedTime: '08:00', classes1: CLASS_TEMPLATES[2].c1, classes2: CLASS_TEMPLATES[2].c2 },
      { airline: 'QR', flightNumber: '641', depTime: '1055', arrTime: '1305', equip: '77W', transitHub: 'DOH', transitFlightNumber: '1164', transitDepTime: '1430', transitArrTime: '1545', transitEquip: '359', elapsedTime: '07:50', classes1: CLASS_TEMPLATES[3].c1, classes2: CLASS_TEMPLATES[3].c2 },
      { airline: 'XY', flightNumber: '852', depTime: '1100', arrTime: '1515', equip: '320', classes1: CLASS_TEMPLATES[4].c1, classes2: CLASS_TEMPLATES[4].c2 }, // Flynas Direct
      { airline: 'BS', flightNumber: '335', depTime: '1630', arrTime: '2015', equip: '333', classes1: CLASS_TEMPLATES[5].c1, classes2: CLASS_TEMPLATES[5].c2 }, // US-Bangla Direct
      { airline: 'GF', flightNumber: '251', depTime: '1700', arrTime: '1945', equip: '789', transitHub: 'BAH', transitFlightNumber: '167', transitDepTime: '2045', transitArrTime: '2150', transitEquip: '321', elapsedTime: '06:50', classes1: CLASS_TEMPLATES[6].c1, classes2: CLASS_TEMPLATES[6].c2 },
      { airline: 'SV', flightNumber: '807', depTime: '1930', arrTime: '2355', equip: '333', classes1: CLASS_TEMPLATES[7].c1, classes2: CLASS_TEMPLATES[7].c2 }, // Saudia Direct
      { airline: 'BG', flightNumber: '039', depTime: '1945', arrTime: '2330', equip: '788', classes1: CLASS_TEMPLATES[8].c1, classes2: CLASS_TEMPLATES[8].c2 }, // Biman Direct
      { airline: 'XY', flightNumber: '854', depTime: '2130', arrTime: '0145', equip: '321', classes1: CLASS_TEMPLATES[9].c1, classes2: CLASS_TEMPLATES[9].c2 }, // Flynas Direct
      { airline: 'SV', flightNumber: '815', depTime: '2200', arrTime: '0215', equip: '789', classes1: CLASS_TEMPLATES[10].c1, classes2: CLASS_TEMPLATES[10].c2 }, // Saudia Direct
      { airline: 'BG', flightNumber: '041', depTime: '2315', arrTime: '0300', equip: '77W', classes1: CLASS_TEMPLATES[11].c1, classes2: CLASS_TEMPLATES[11].c2 }, // Biman Direct
    ];
  }

  // 6. GENERAL INTERNATIONAL SECTOR: Mix of 5 to 7 eligible airlines
  const candidates = Object.keys(AIRLINE_HUB_PROFILES);
  const eligibleAirlines: string[] = [];

  for (const air of candidates) {
    if (['BG', 'BS', 'VQ', '2A'].includes(air) && oCountry !== 'BD' && dCountry !== 'BD') {
      continue;
    }
    if (canAirlineOperateDirect(air, o, d) || getAirlineConnectingHub(air, o, d)) {
      eligibleAirlines.push(air);
    }
  }

  // Ensure minimum diverse pool (5 to 8 airlines)
  const defaultIntlPool = (oCountry === 'BD' || dCountry === 'BD')
    ? ['BG', 'BS', 'EK', 'QR', 'SV', 'TK', 'GF', 'KU']
    : ['EK', 'QR', 'TK', 'BA', 'LH', 'AF', 'SV', 'SQ'];

  for (const defAir of defaultIntlPool) {
    if (!eligibleAirlines.includes(defAir)) {
      if (['BG', 'BS'].includes(defAir) && oCountry !== 'BD' && dCountry !== 'BD') continue;
      eligibleAirlines.push(defAir);
    }
  }

  const selectedAirlines = eligibleAirlines.slice(0, 7);
  const slots: { air: string; dep: string }[] = [];
  const hours = ['0215', '0440', '0715', '0930', '1145', '1350', '1530', '1745', '1930', '2115', '2245', '2350'];

  hours.forEach((dep, idx) => {
    const air = selectedAirlines[idx % selectedAirlines.length];
    slots.push({ air, dep });
  });

  return slots.map((slot, idx) => {
    const air = slot.air;
    const dep = slot.dep;
    const cls = CLASS_TEMPLATES[idx % CLASS_TEMPLATES.length];
    const isDirect = canAirlineOperateDirect(air, o, d);
    const transitHub = isDirect ? undefined : getAirlineConnectingHub(air, o, d);
    const profile = AIRLINE_HUB_PROFILES[air] || {
      code: air,
      name: air,
      country: 'XX',
      hubs: ['DXB'],
      aircraft: ['77W', '789'],
      directDestinations: [],
    };

    const eq1 = profile.aircraft[idx % profile.aircraft.length];
    const eq2 = profile.aircraft[(idx + 1) % profile.aircraft.length];
    const fltNum = String(100 + idx * 17 + (air.charCodeAt(0) % 40));

    if (isDirect) {
      const arrH = (parseInt(dep.substring(0, 2), 10) + 4) % 24;
      return {
        airline: air,
        flightNumber: fltNum,
        depTime: dep,
        arrTime: `${String(arrH).padStart(2, '0')}${dep.substring(2)}`,
        equip: eq1,
        classes1: cls.c1,
        classes2: cls.c2,
      };
    }

    const hub = transitHub || profile.hubs[0] || 'DXB';
    const arrH1H = (parseInt(dep.substring(0, 2), 10) + 4) % 24;
    const depH2H = (arrH1H + 2) % 24;
    const arrDestH = (depH2H + 5) % 24;

    return {
      airline: air,
      flightNumber: fltNum,
      depTime: dep,
      arrTime: `${String(arrH1H).padStart(2, '0')}${dep.substring(2)}`,
      equip: eq1,
      transitHub: hub,
      transitFlightNumber: String(parseInt(fltNum, 10) + 102),
      transitDepTime: `${String(depH2H).padStart(2, '0')}15`,
      transitArrTime: `${String(arrDestH).padStart(2, '0')}45`,
      transitEquip: eq2,
      elapsedTime: '13:45',
      classes1: cls.c1,
      classes2: cls.c2,
      transitClasses1: cls.c1,
      transitClasses2: cls.c2,
    };
  });
};

// ======================================================================
// 4. PARSERS FOR AN AND FXD (ELIMINATES DUPLICATE MONTH & 'SEP' BUGS)
// ======================================================================

export interface ParsedAnParams {
  orig: string;
  dest: string;
  date: string;
  airlineFilter?: string;
}

export const parseAnInput = (rawCmd: string): ParsedAnParams => {
  const upper = rawCmd.toUpperCase().trim();
  let rem = upper.replace(/^AN\s*/, '').trim();

  // 1. Extract Airline Qualifier (/AQR, //AQR, /ASV, //ASV, /ABG, /ABS, /A SV, etc.)
  let airlineFilter: string | undefined = undefined;
  const airMatch = rem.match(/(?:\/\/|\/|\s)A\s*([A-Z0-9]{2})(?:\s|$)/);
  if (airMatch) {
    airlineFilter = airMatch[1];
    rem = rem.replace(airMatch[0], ' ').trim();
  } else {
    const trailingSlashAir = rem.match(/(?:\/\/|\/)([A-Z0-9]{2})$/);
    if (trailingSlashAir) {
      airlineFilter = trailingSlashAir[1];
      rem = rem.replace(trailingSlashAir[0], ' ').trim();
    }
  }

  // 2. Strip any time qualifiers (e.g. 1800, /1800) or class qualifiers (/CY, etc.)
  rem = rem.replace(/(?:\/\/|\/|\s)[0-2]\d[0-5]\d(?:\s|$)/g, ' ');
  rem = rem.replace(/(?:\/\/|\/)[A-Z]{1,2}(?:\s|$)/g, ' ');

  // 3. Compact string for unambiguous pattern matching
  const compact = rem.replace(/[\s\/-]+/g, '');

  let date = '30SEP';
  let orig = 'DAC';
  let dest = 'DXB';

  // Pattern 1: Day (1-2 digits) + 3-letter Month + Optional Year (2 or 4 digits) + Orig (3 letters) + Dest (3 letters)
  // e.g. "30SEPYYZRUH", "20NOVDACCXE", "30SEPDACDXB", "25OCTDACJED", "30SEP26YYZRUH"
  const standardMatch = compact.match(/^(\d{1,2})([A-Z]{3})(?:\d{2}|\d{4})?([A-Z]{3})([A-Z]{3})$/);
  if (standardMatch && MONTHS.includes(standardMatch[2])) {
    date = `${standardMatch[1].padStart(2, '0')}${standardMatch[2]}`;
    orig = standardMatch[3];
    dest = standardMatch[4];
  } else {
    // Pattern 2: Day only (1-2 digits) + Orig (3 letters) + Dest (3 letters)
    // e.g. "15YYZRUH", "30DACDXB"
    const dayOnlyMatch = compact.match(/^(\d{1,2})([A-Z]{3})([A-Z]{3})$/);
    if (dayOnlyMatch && !MONTHS.includes(dayOnlyMatch[2])) {
      date = `${dayOnlyMatch[1].padStart(2, '0')}SEP`;
      orig = dayOnlyMatch[2];
      dest = dayOnlyMatch[3];
    } else {
      // Pattern 3: No date specified, just Orig (3 letters) + Dest (3 letters)
      // e.g. "YYZRUH", "DACDXB"
      const citiesOnlyMatch = compact.match(/^([A-Z]{3})([A-Z]{3})$/);
      if (citiesOnlyMatch && !MONTHS.includes(citiesOnlyMatch[1]) && !MONTHS.includes(citiesOnlyMatch[2])) {
        orig = citiesOnlyMatch[1];
        dest = citiesOnlyMatch[2];
        date = '30SEP';
      } else {
        // Pattern 4: Fallback with token search
        const dateToken = rem.match(/(?:^|[\s\/-])(\d{1,2})([A-Z]{3})(?:\d{2}|\d{4})?(?:[\s\/-]|$)/);
        if (dateToken && MONTHS.includes(dateToken[2])) {
          date = `${dateToken[1].padStart(2, '0')}${dateToken[2]}`;
          rem = rem.replace(dateToken[0], ' ').trim();
        }

        const cleanTokens = rem.replace(/[^A-Z]/g, ' ').split(/\s+/).filter((t) => t.length === 3 && !MONTHS.includes(t));
        if (cleanTokens.length >= 2) {
          orig = cleanTokens[0];
          dest = cleanTokens[1];
        } else if (cleanTokens.length === 1) {
          if (cleanTokens[0] === 'DAC') {
            orig = 'DAC';
            dest = 'DXB';
          } else {
            orig = 'DAC';
            dest = cleanTokens[0];
          }
        }
      }
    }
  }

  // Safety sanitization: NEVER allow 'SEP' or any month string to be an origin or destination!
  if (orig === 'SEP' || MONTHS.includes(orig)) {
    orig = 'DAC';
  }
  if (dest === 'SEP' || MONTHS.includes(dest)) {
    dest = orig === 'DAC' ? 'DXB' : 'DAC';
  }
  if (orig === dest) {
    dest = orig === 'DAC' ? 'DXB' : 'DAC';
  }

  return {
    orig,
    dest,
    date: cleanGdsDate(date),
    airlineFilter,
  };
};

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

  // 1. Airline filter
  let airlineFilter: string | undefined = undefined;
  const airMatch = body.match(/(?:\/\/|\/|\s)A\s*([A-Z0-9]{2})/);
  if (airMatch) {
    airlineFilter = airMatch[1];
  } else {
    const trailingAir = body.match(/(?:\/\/|\/)([A-Z0-9]{2})$/);
    if (trailingAir && AIRLINES.some((a) => a.code === trailingAir[1])) {
      airlineFilter = trailingAir[1];
    }
  }

  // 2. Cabin class
  const isBusiness = body.includes('//KC') || body.includes('/KC') || body.includes('//C') || body.includes('/C');

  // 3. Passenger counts
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

  // 4. Dates
  const dateMatches: string[] = [];
  const dateRegex = /(?:^|[\s\/-])(?:D)?(\d{1,2}[A-Z]{3})(?:\d{2,4})?(?:[\s\/-]|$)/g;
  let dMatch;
  while ((dMatch = dateRegex.exec(body)) !== null) {
    const rawD = dMatch[1];
    if (!dateMatches.includes(rawD)) {
      dateMatches.push(rawD);
    }
  }

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
  let dest = 'DXB';

  const origFromStart = body.match(/^([A-Z]{3})/);
  if (origFromStart && !MONTHS.includes(origFromStart[1])) {
    orig = origFromStart[1];
  }

  if (legMatches.length > 0) {
    dest = legMatches[0][2];
  } else {
    const cleanTokens = body
      .replace(/(?:\/\/|\/|\s)A\s*[A-Z0-9]{2}/g, '')
      .replace(/\/D\d{1,2}[A-Z]{3}/g, '')
      .replace(/\d{1,2}[A-Z]{3}/g, '')
      .replace(/\/\/[A-Z0-9\/]+/g, '')
      .replace(/[^A-Z]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length === 3 && !MONTHS.includes(t));

    if (cleanTokens.length >= 2) {
      orig = cleanTokens[0];
      dest = cleanTokens[1];
    } else if (cleanTokens.length === 1) {
      if (cleanTokens[0] === 'DAC') {
        orig = 'DAC';
        dest = 'DXB';
      } else {
        orig = 'DAC';
        dest = cleanTokens[0];
      }
    }
  }

  if (orig === 'SEP' || MONTHS.includes(orig)) orig = 'DAC';
  if (dest === 'SEP' || MONTHS.includes(dest)) dest = orig === 'DAC' ? 'DXB' : 'DAC';
  if (orig === dest) dest = orig === 'DAC' ? 'DXB' : 'DAC';

  return {
    orig,
    dest,
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

// ======================================================================
// 5. GENERATE FLIGHT AVAILABILITY (AN) - DIVERSE MULTI-AIRLINE MIX
// ======================================================================

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

  const oCountry = getAirportCountry(orig);
  const dCountry = getAirportCountry(dest);

  // STRICT BANGLADESH RESTRICTION FOR BG/BS/VQ/2A
  if (air && ['BG', 'BS', 'VQ', '2A'].includes(air) && oCountry !== 'BD' && dCountry !== 'BD') {
    const lines = [
      `AN${dte}${orig}${dest}/A${air}`,
      `NO SCHEDULED FLIGHTS FOR CARRIER ${air} ON SECTOR ${orig}-${dest}`,
      `NOTE: ${air} ONLY OPERATES ROUTES TO/FROM BANGLADESH (FREEDOMS OF THE AIR RESTRICTION)`,
    ];
    return { options: [], displayText: lines.join('\n') };
  }

  // Get diverse flight roster (5 to 8 airlines when no filter; single airline when filter is set)
  const roster = getDiverseFlightRoster(orig, dest, air);

  const options: AvailabilityOption[] = [];

  roster.forEach((plan, index) => {
    const lineNum = index + 1;

    if (plan.transitHub && plan.transitFlightNumber) {
      // Connecting flight (Leg 1: Orig -> Hub, Leg 2: Hub -> Dest)
      // Guaranteed: Leg 2 destination is strictly 'dest', NEVER 'orig'!
      options.push({
        lineNum,
        date: dte,
        flight1: {
          airline: plan.airline,
          flightNumber: plan.flightNumber,
          classes1: plan.classes1,
          classes2: plan.classes2,
          origin: orig,
          originTerm: '1',
          destination: plan.transitHub,
          depTime: plan.depTime,
          arrTime: plan.arrTime,
          equip: plan.equip,
        },
        flight2: {
          airline: plan.airline,
          flightNumber: plan.transitFlightNumber,
          codeshare: plan.codeshare,
          classes1: plan.transitClasses1 || plan.classes1,
          classes2: plan.transitClasses2 || plan.classes2,
          origin: plan.transitHub,
          destination: dest, // Strictly the final destination!
          destTerm: '2',
          depTime: plan.transitDepTime || '0900',
          arrTime: plan.transitArrTime || '1415',
          equip: plan.transitEquip || '789',
          elapsedTime: plan.elapsedTime || '13:45',
        },
      });
    } else {
      // Direct flight (Non-stop: Orig -> Dest)
      options.push({
        lineNum,
        date: dte,
        flight1: {
          airline: plan.airline,
          flightNumber: plan.flightNumber,
          classes1: plan.classes1,
          classes2: plan.classes2,
          origin: orig,
          originTerm: '1',
          destination: dest,
          destTerm: '1',
          depTime: plan.depTime,
          arrTime: plan.arrTime,
          equip: plan.equip,
        },
      });
    }
  });

  // Build authentic Amadeus AN GDS display
  const lines: string[] = [];
  // Echo line strictly echos requested date, origin, and destination!
  lines.push(`AN${dte}${orig}${dest}${air ? '/A' + air : ''}`);

  const destAirport = AIRPORTS.find((a) => a.code === dest);
  const destCity = destAirport ? destAirport.city : dest;
  const apClean = destAirport ? destAirport.name.replace(/\s+(AIRPORT|INTL|INTERNATIONAL)$/i, '').trim() : dest;
  const destCountry = destAirport ? destAirport.countryCode : getAirportCountry(dest);
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
      const f2Code = f2.codeshare || `${f2.airline} ${f2.flightNumber}`;
      const f2AirPad = f2Code.padEnd(8, ' ');
      lines.push(
        `    ${f2AirPad} ${f2.classes1}  ${f2.origin} ${f2.destination}  ${f2.depTime} ${f2.arrTime}  E0/${f2.equip}  ${f2.elapsedTime || '13:45'}`
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

// ======================================================================
// 6. GENERATE LOWEST FARE SEARCH (FXD) - DIVERSE MULTI-AIRLINE MIX
// ======================================================================

export const calculateSectorFare = (
  orig: string,
  dest: string,
  isBusiness: boolean = false,
  isRoundTrip: boolean = false
): { base: number; tax: number; total: number } => {
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();
  const oCountry = getAirportCountry(o);
  const dCountry = getAirportCountry(d);

  let base = 70000;
  let tax = 20000;

  if (oCountry === 'BD' && dCountry === 'BD') {
    base = 5200;
    tax = 1400;
  } else if (['CCU', 'DEL', 'BOM', 'MAA', 'KTM', 'CMB'].includes(d) || ['CCU', 'DEL', 'BOM'].includes(o)) {
    base = 16500;
    tax = 5800;
  } else if (['SIN', 'BKK', 'KUL', 'HKG', 'CAN'].includes(d) || ['SIN', 'BKK', 'KUL'].includes(o)) {
    base = 39500;
    tax = 13800;
  } else if (['JED', 'MED', 'RUH', 'DMM', 'DXB', 'SHJ', 'AUH', 'DOH', 'KWI', 'BAH', 'MCT'].includes(d) || ['JED', 'RUH', 'DXB', 'DOH'].includes(o)) {
    base = 54500;
    tax = 18500;
  } else if (['LHR', 'LGW', 'MAN', 'CDG', 'FRA', 'MUC', 'AMS', 'FCO', 'MXP', 'IST'].includes(d) || ['LHR', 'CDG', 'FRA', 'AMS'].includes(o)) {
    base = 98000;
    tax = 29500;
  } else if (['JFK', 'EWR', 'NYC', 'YYZ', 'YVR', 'YUL', 'ORD', 'LAX', 'SFO', 'IAD', 'ATL', 'DFW', 'IAH'].includes(d) || ['JFK', 'ORD', 'YYZ'].includes(o)) {
    base = 112000;
    tax = 33000;
  } else {
    base = 86000;
    tax = 26000;
  }

  if (isBusiness) {
    base = Math.round(base * 2.5);
    tax = Math.round(tax * 1.5);
  }

  if (isRoundTrip) {
    base = Math.round(base * 1.78);
    tax = Math.round(tax * 1.72);
  }

  return {
    base,
    tax,
    total: base + tax,
  };
};

export const generateLowestFareSearch = (
  rawCmd: string
): { options: FareSearchOption[]; displayText: string } => {
  const params = parseFxdInput(rawCmd);
  const { orig, dest, outboundDate, isRoundTrip, returnDate, airlineFilter, isBusiness, adt, chd, inf } = params;

  const oCountry = getAirportCountry(orig);
  const dCountry = getAirportCountry(dest);

  // STRICT BANGLADESH RESTRICTION
  if (airlineFilter && ['BG', 'BS', 'VQ', '2A'].includes(airlineFilter) && oCountry !== 'BD' && dCountry !== 'BD') {
    const text = [
      `FXD BEST BUY - FARE SEARCH RESULTS: ${orig}-${dest} / ${outboundDate}`,
      `NO FARES AVAILABLE FOR CARRIER ${airlineFilter} ON SECTOR ${orig}-${dest}`,
      `NOTE: ${airlineFilter} IS RESTRICTED TO ROUTES TO/FROM BANGLADESH.`,
    ].join('\n');
    return { options: [], displayText: text };
  }

  const roster = getDiverseFlightRoster(orig, dest, airlineFilter);
  const sectorFare = calculateSectorFare(orig, dest, isBusiness, isRoundTrip);
  const options: FareSearchOption[] = [];

  const bookingClasses = isBusiness ? ['J', 'C', 'D'] : ['T', 'Q', 'V', 'L', 'M', 'K', 'B', 'Y'];

  roster.forEach((plan, index) => {
    const optNum = index + 1;
    const priceStep = 1 + index * 0.042;
    const basePerPax = Math.round(sectorFare.base * priceStep);
    const taxPerPax = Math.round(sectorFare.tax * priceStep);

    const baseTotal = basePerPax * adt + Math.round(basePerPax * 0.75) * chd + Math.round(basePerPax * 0.1) * inf;
    const taxesTotal = taxPerPax * (adt + chd + inf);
    const totalFare = baseTotal + taxesTotal;

    const bookingClass = isBusiness
      ? bookingClasses[index % bookingClasses.length]
      : bookingClasses[Math.min(index, bookingClasses.length - 1)];

    const flights: FareSearchFlight[] = [];

    // Outbound leg 1
    flights.push({
      airline: plan.airline,
      flightNumber: plan.flightNumber,
      origin: orig,
      destination: plan.transitHub || dest,
      date: outboundDate,
      depTime: plan.depTime,
      arrTime: plan.arrTime,
      bookingClass,
      equip: plan.equip,
    });

    // Outbound connecting leg 2 if applicable
    if (plan.transitHub && plan.transitFlightNumber) {
      flights.push({
        airline: plan.airline,
        flightNumber: plan.transitFlightNumber,
        origin: plan.transitHub,
        destination: dest, // Strictly the final destination!
        date: outboundDate,
        depTime: plan.transitDepTime || '0945',
        arrTime: plan.transitArrTime || '1455',
        bookingClass,
        equip: plan.transitEquip || '789',
      });
    }

    // Inbound return flights if round-trip
    if (isRoundTrip && returnDate) {
      if (plan.transitHub && plan.transitFlightNumber) {
        // Return Leg 1: Dest -> Hub
        flights.push({
          airline: plan.airline,
          flightNumber: String(parseInt(plan.transitFlightNumber, 10) + 1),
          origin: dest,
          destination: plan.transitHub,
          date: returnDate,
          depTime: '1530',
          arrTime: '2245',
          bookingClass,
          equip: plan.transitEquip || '789',
        });
        // Return Leg 2: Hub -> Orig
        flights.push({
          airline: plan.airline,
          flightNumber: String(parseInt(plan.flightNumber, 10) + 1),
          origin: plan.transitHub,
          destination: orig,
          date: returnDate,
          depTime: '0130',
          arrTime: '0815',
          bookingClass,
          equip: plan.equip,
        });
      } else {
        // Direct Return: Dest -> Orig
        flights.push({
          airline: plan.airline,
          flightNumber: String(parseInt(plan.flightNumber, 10) + 1),
          origin: dest,
          destination: orig,
          date: returnDate,
          depTime: '1400',
          arrTime: '2130',
          bookingClass,
          equip: plan.equip,
        });
      }
    }

    options.push({
      optionNumber: optNum,
      airline: plan.airline,
      flights,
      fareBasis: `${bookingClass}LRBD1`,
      currency: 'BDT',
      baseFare: baseTotal,
      taxes: taxesTotal,
      totalFare,
      paxCount: { adt, chd, inf },
    });
  });

  // Sort ascending by total fare
  options.sort((a, b) => a.totalFare - b.totalFare);
  options.forEach((opt, idx) => {
    opt.optionNumber = idx + 1;
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

// ======================================================================
// 7. TIMETABLE (TN)
// ======================================================================

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
  let dest = 'DXB';

  const pairMatch = afterTn.match(/([A-Z]{3})[\s\/-]*([A-Z]{3})/);
  if (pairMatch && !MONTHS.includes(pairMatch[1]) && !MONTHS.includes(pairMatch[2])) {
    orig = pairMatch[1];
    dest = pairMatch[2];
  } else {
    const cleanTokens = afterTn
      .replace(/\d{1,2}[A-Z]{3}/g, '')
      .replace(/[^A-Z]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length === 3 && !MONTHS.includes(t));
    if (cleanTokens[0] && cleanTokens[1]) {
      orig = cleanTokens[0];
      dest = cleanTokens[1];
    }
  }

  if (orig === 'SEP' || MONTHS.includes(orig)) orig = 'DAC';
  if (dest === 'SEP' || MONTHS.includes(dest)) dest = orig === 'DAC' ? 'DXB' : 'DAC';

  const destAirport = AIRPORTS.find((a) => a.code === dest);
  const destName = destAirport ? `${destAirport.city} ${destAirport.name}.${destAirport.countryCode}` : `${dest}.${dest}`;

  const roster = getDiverseFlightRoster(orig, dest, air);
  const lines: string[] = [];
  lines.push(`** AMADEUS TIMETABLE - TN ** ${dest} ${destName.padEnd(26, ' ')} ${date}`);

  roster.forEach((plan, index) => {
    const optNum = index + 1;
    const fltPad = `${plan.airline} ${plan.flightNumber}`.padEnd(8, ' ');
    const isStop = plan.transitHub ? 1 : 0;
    const elapsed = isStop ? (plan.elapsedTime || '13:45') : (isDomesticAirport(orig) && isDomesticAirport(dest) ? '1:00' : '6:25');
    const days = index % 2 === 0 ? '1234567' : '1.3.5.7';

    lines.push(
      `${String(optNum).padStart(2, ' ')}   ${fltPad} ${days}  ${orig}   ${plan.depTime}    ${dest} ${plan.arrTime}  ${isStop}  ${date} 28OCT26 ${plan.equip}  ${elapsed}`
    );
  });

  return lines.join('\n');
};

// ======================================================================
// 8. FARE DISPLAY (FQD) & DYNAMIC AIRLINE PRICING ENGINE
// ======================================================================

export interface FqdQuery {
  orig: string;
  dest: string;
  airline: string;
  travelDateStr: string; // e.g. "30SEP26"
  dateToken: string; // e.g. "30SEP"
  year: number; // e.g. 2026
  directionFilter?: 'OW' | 'RT';
  cabinFilter?: 'ECONOMY' | 'BUSINESS';
}

export const parseFqdInput = (rawCmd: string): FqdQuery => {
  const upper = rawCmd.toUpperCase().trim();
  let rest = upper.replace(/^FQD\s*/, '').trim();

  let airline = '';
  let dateToken = '';
  let year = 2026;
  let directionFilter: 'OW' | 'RT' | undefined = undefined;
  let cabinFilter: 'ECONOMY' | 'BUSINESS' | undefined = undefined;

  // Check cabin filter: /KC, /KD, /KJ, /C (Business) or /KY, /Y (Economy)
  if (/\/(?:KC|KD|KJ|C)\b/.test(rest)) {
    cabinFilter = 'BUSINESS';
    rest = rest.replace(/\/(?:KC|KD|KJ|C)\b/g, '');
  } else if (/\/(?:KY|Y)\b/.test(rest)) {
    cabinFilter = 'ECONOMY';
    rest = rest.replace(/\/(?:KY|Y)\b/g, '');
  }

  // Check direction: /IO (One Way) or /IR (Round Trip)
  if (/\/IO\b/.test(rest)) {
    directionFilter = 'OW';
    rest = rest.replace(/\/IO\b/g, '');
  } else if (/\/IR\b/.test(rest)) {
    directionFilter = 'RT';
    rest = rest.replace(/\/IR\b/g, '');
  }

  // Check /A<AIRLINE> e.g. /ABG, /AEK, /ASV, /AFZ
  const airMatch = rest.match(/\/A([A-Z0-9]{2})\b/);
  if (airMatch) {
    airline = airMatch[1];
    rest = rest.replace(/\/A[A-Z0-9]{2}\b/g, '');
  }

  // Check /D<DATE> or /<DATE> e.g. /D30SEP, /D30SEP26, /D15MAY22, /30SEP
  const dateMatch = rest.match(/\/(?:D)?(\d{1,2}[A-Z]{3}(\d{2,4})?)\b/);
  if (dateMatch) {
    const fullDate = dateMatch[1];
    const dMatch = fullDate.match(/^(\d{1,2})([A-Z]{3})(\d{2,4})?/);
    if (dMatch) {
      dateToken = `${dMatch[1].padStart(2, '0')}${dMatch[2]}`;
      if (dMatch[3]) {
        year = dMatch[3].length === 2 ? 2000 + parseInt(dMatch[3], 10) : parseInt(dMatch[3], 10);
      }
    }
    rest = rest.replace(/\/(?:D)?\d{1,2}[A-Z]{3}(?:\d{2,4})?\b/g, '');
  }

  // Inspect remaining string for orig/dest and potential leading date e.g. "30SEPDACDXB" or "DACDXB"
  rest = rest.replace(/[\/\s-]+/g, ' ').trim();

  const leadingDateMatch = rest.match(/^(\d{1,2})([A-Z]{3})(\d{2,4})?\s*(.*)$/);
  if (leadingDateMatch && !dateToken && MONTHS.includes(leadingDateMatch[2])) {
    dateToken = `${leadingDateMatch[1].padStart(2, '0')}${leadingDateMatch[2]}`;
    if (leadingDateMatch[3]) {
      year = leadingDateMatch[3].length === 2 ? 2000 + parseInt(leadingDateMatch[3], 10) : parseInt(leadingDateMatch[3], 10);
    }
    rest = leadingDateMatch[4].trim();
  }

  const pairParts = rest.split(/\s+/).filter(Boolean);
  let orig = 'DAC';
  let dest = 'DXB';

  if (pairParts.length >= 2 && pairParts[0].length === 3 && pairParts[1].length === 3) {
    orig = pairParts[0];
    dest = pairParts[1];
  } else if (pairParts.length >= 1 && pairParts[0].length === 6) {
    orig = pairParts[0].substring(0, 3);
    dest = pairParts[0].substring(3, 6);
  }

  if (MONTHS.includes(orig)) orig = 'DAC';
  if (MONTHS.includes(dest)) dest = orig === 'DAC' ? 'DXB' : 'DAC';

  if (!dateToken) {
    dateToken = '30SEP';
    year = 2026;
  }

  const travelDateStr = `${dateToken}${String(year).slice(-2)}`;

  if (!airline) {
    if (orig === 'DAC' && ['DXB', 'AUH', 'SHJ'].includes(dest)) airline = 'EK';
    else if (orig === 'DAC' && ['JED', 'RUH', 'MED'].includes(dest)) airline = 'SV';
    else if (orig === 'DAC' && ['DOH'].includes(dest)) airline = 'QR';
    else if (isDomesticAirport(orig) && isDomesticAirport(dest)) airline = 'BG';
    else airline = 'EK';
  }

  return {
    orig,
    dest,
    airline,
    travelDateStr,
    dateToken,
    year,
    directionFilter,
    cabinFilter,
  };
};

const getSectorMiles = (orig: string, dest: string): { tpm: number; mpm: number } => {
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();
  const pair = [o, d].sort().join('-');
  const mileTable: Record<string, number> = {
    'DAC-DXB': 2186,
    'AUH-DAC': 2195,
    'DAC-SHJ': 2174,
    'DAC-JED': 3244,
    'DAC-RUH': 2780,
    'DAC-MED': 3190,
    'DAC-DOH': 2435,
    'DAC-KWI': 2680,
    'DAC-BAH': 2490,
    'DAC-MCT': 2020,
    'DAC-SIN': 1798,
    'DAC-KUL': 1632,
    'DAC-BKK': 976,
    'DAC-LHR': 5012,
    'DAC-JFK': 7984,
    'DAC-YYZ': 7650,
    'RUH-YYZ': 6350,
    'DAC-CGP': 141,
    'DAC-CXB': 186,
    'DAC-CXE': 186,
    'DAC-ZYL': 122,
    'DAC-JSR': 85,
    'DAC-RJH': 125,
    'DAC-SPD': 175,
    'DAC-BZL': 74,
  };

  const tpm = mileTable[pair] || Math.max(140, Math.round(calculateSectorFare(orig, dest).base / 22));
  const mpm = Math.round(tpm * 1.2);
  return { tpm, mpm };
};

interface FqdRowItem {
  fareBasis: string;
  owRt: 'OW' | 'RT';
  fareAmt: number;
  bk: string;
  seas: string;
  ap: string;
  min: string;
  max: string;
  resTkt: string;
  adv: string;
  bg: string;
  pen: string;
  isBusiness: boolean;
}

export const generateFareDisplay = (rawCmd: string): string => {
  const query = parseFqdInput(rawCmd);
  const { orig, dest, airline, travelDateStr, dateToken, year, directionFilter, cabinFilter } = query;

  // 1. Calculate SYSTEM DATE (never exceeds queried travel date)
  const now = new Date();
  const todayDay = now.getDate();
  const todayMonthStr = MONTHS[now.getMonth()] || 'SEP';
  const todayYear = now.getFullYear();
  const todayDateObj = new Date(todayYear, now.getMonth(), todayDay);

  const travelDayMatch = dateToken.match(/^(\d{1,2})([A-Z]{3})/);
  const travelDay = travelDayMatch ? parseInt(travelDayMatch[1], 10) : 30;
  const travelMonthStr = travelDayMatch ? travelDayMatch[2] : 'SEP';
  const travelMonthIdx = MONTHS.indexOf(travelMonthStr);
  const travelDateObj = new Date(year, travelMonthIdx !== -1 ? travelMonthIdx : 8, travelDay);

  let systemDateStr = '';
  if (travelDateObj >= todayDateObj) {
    systemDateStr = `${String(todayDay).padStart(2, '0')}${todayMonthStr}${String(todayYear).slice(-2)}`;
  } else {
    systemDateStr = `${String(travelDay).padStart(2, '0')}${travelMonthStr}${String(year).slice(-2)}`;
  }

  // 2. Sector ratio to scale fares realistically across different routes
  // Reference route is DAC-DXB where standard economy base is 54,500
  const sectorFare = calculateSectorFare(orig, dest, false, false);
  const sectorRatio = sectorFare.base / 54500;

  const roundTo100 = (val: number): number => Math.round((val * sectorRatio) / 100) * 100;

  // 3. Airline-specific fare definitions & Fare Basis codes
  let fareItems: FqdRowItem[] = [];

  const air = airline.toUpperCase();
  const isLcc = ['FZ', 'BS', 'G9', 'VQ', '2A', 'J9', '6E', 'IX', 'SG'].includes(air);
  const isNational = ['BG', 'SV', 'GF', 'KU', 'AI', 'MS', 'ET', 'MH', 'TG', 'UL'].includes(air);
  const isPremium = ['EK', 'QR', 'SQ', 'TK', 'BA', 'CX', 'EY', 'LH', 'AF', 'KL', 'AC', 'JL', 'NH'].includes(air);

  if (air === 'EK') {
    // Premium Full-Service: Economy BDT 55,000 - 78,000; Business BDT 145,000 - 220,000
    fareItems = [
      { fareBasis: 'TLRBD1', owRt: 'OW', fareAmt: roundTo100(55200), bk: 'T', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'QLRBD1', owRt: 'OW', fareAmt: roundTo100(59500), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'VEEBD1', owRt: 'OW', fareAmt: roundTo100(63800), bk: 'V', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'KEEBD1', owRt: 'OW', fareAmt: roundTo100(68400), bk: 'K', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '35K', pen: '+', isBusiness: false },
      { fareBasis: 'MLRBD1', owRt: 'OW', fareAmt: roundTo100(73200), bk: 'M', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '35K', pen: '+', isBusiness: false },
      { fareBasis: 'YEEBD1', owRt: 'OW', fareAmt: roundTo100(78000), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'TRTBD1', owRt: 'RT', fareAmt: roundTo100(96500), bk: 'T', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'QEEBD1', owRt: 'RT', fareAmt: roundTo100(104000), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YRTBD1', owRt: 'RT', fareAmt: roundTo100(128000), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'OEEBD1', owRt: 'OW', fareAmt: roundTo100(148000), bk: 'O', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '40K', pen: '+', isBusiness: true },
      { fareBasis: 'CFLBD1', owRt: 'OW', fareAmt: roundTo100(178000), bk: 'C', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'JFLBD1', owRt: 'OW', fareAmt: roundTo100(215000), bk: 'J', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'CRTBD1', owRt: 'RT', fareAmt: roundTo100(285000), bk: 'C', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'JRTBD1', owRt: 'RT', fareAmt: roundTo100(340000), bk: 'J', seas: dateToken, ap: '--', min: '3D', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
    ];
  } else if (air === 'BG') {
    // National Carrier: Economy BDT 42,000 - 58,000; Business BDT 118,000 - 165,000
    fareItems = [
      { fareBasis: 'TERBD1', owRt: 'OW', fareAmt: roundTo100(42500), bk: 'T', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'VERBD1', owRt: 'OW', fareAmt: roundTo100(45800), bk: 'V', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'QEEBD1', owRt: 'OW', fareAmt: roundTo100(49200), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'MERBD1', owRt: 'OW', fareAmt: roundTo100(52600), bk: 'M', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'KERBD1', owRt: 'OW', fareAmt: roundTo100(55800), bk: 'K', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YOWBD1', owRt: 'OW', fareAmt: roundTo100(58000), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'TEEBD1', owRt: 'RT', fareAmt: roundTo100(74500), bk: 'T', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'QEEBD1', owRt: 'RT', fareAmt: roundTo100(84200), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YRTBD1', owRt: 'RT', fareAmt: roundTo100(99500), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'DEEBD1', owRt: 'OW', fareAmt: roundTo100(118000), bk: 'D', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '+', isBusiness: true },
      { fareBasis: 'CEEBD1', owRt: 'OW', fareAmt: roundTo100(138000), bk: 'C', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'JFLBD1', owRt: 'OW', fareAmt: roundTo100(165000), bk: 'J', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'CRTBD1', owRt: 'RT', fareAmt: roundTo100(225000), bk: 'C', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'JRTBD1', owRt: 'RT', fareAmt: roundTo100(265000), bk: 'J', seas: dateToken, ap: '--', min: '3D', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
    ];
  } else if (air === 'SV') {
    // National Carrier (Saudia): Economy BDT 43,000 - 57,500; Business BDT 122,000 - 172,000
    fareItems = [
      { fareBasis: 'TORBD1', owRt: 'OW', fareAmt: roundTo100(43200), bk: 'T', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '1PC', pen: '+', isBusiness: false },
      { fareBasis: 'VORBD1', owRt: 'OW', fareAmt: roundTo100(46500), bk: 'V', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '1PC', pen: '+', isBusiness: false },
      { fareBasis: 'QEEBD1', owRt: 'OW', fareAmt: roundTo100(49800), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '+', isBusiness: false },
      { fareBasis: 'MERBD1', owRt: 'OW', fareAmt: roundTo100(53400), bk: 'M', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '+', isBusiness: false },
      { fareBasis: 'YOWBD1', owRt: 'OW', fareAmt: roundTo100(57500), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'TEEBD1', owRt: 'RT', fareAmt: roundTo100(76000), bk: 'T', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '+', isBusiness: false },
      { fareBasis: 'QEEBD1', owRt: 'RT', fareAmt: roundTo100(86500), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '+', isBusiness: false },
      { fareBasis: 'YRTBD1', owRt: 'RT', fareAmt: roundTo100(102000), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'DERBD1', owRt: 'OW', fareAmt: roundTo100(122000), bk: 'D', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '+', isBusiness: true },
      { fareBasis: 'CFLBD1', owRt: 'OW', fareAmt: roundTo100(145000), bk: 'C', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'JFLBD1', owRt: 'OW', fareAmt: roundTo100(172000), bk: 'J', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'CRTBD1', owRt: 'RT', fareAmt: roundTo100(230000), bk: 'C', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'JRTBD1', owRt: 'RT', fareAmt: roundTo100(275000), bk: 'J', seas: dateToken, ap: '--', min: '3D', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
    ];
  } else if (air === 'FZ') {
    // Low-cost (Flydubai): Economy BDT 32,000 - 45,000; Business BDT 110,000 - 135,000
    fareItems = [
      { fareBasis: 'NLIBD1', owRt: 'OW', fareAmt: roundTo100(32500), bk: 'N', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '20K', pen: '+', isBusiness: false },
      { fareBasis: 'TLIBD1', owRt: 'OW', fareAmt: roundTo100(35200), bk: 'T', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '20K', pen: '+', isBusiness: false },
      { fareBasis: 'QVLBD1', owRt: 'OW', fareAmt: roundTo100(38400), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'LVLBD1', owRt: 'OW', fareAmt: roundTo100(41500), bk: 'L', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YFLBD1', owRt: 'OW', fareAmt: roundTo100(44800), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '35K', pen: '+', isBusiness: false },
      { fareBasis: 'NRTBD1', owRt: 'RT', fareAmt: roundTo100(58000), bk: 'N', seas: dateToken, ap: '--', min: '2D', max: '1M', resTkt: '1A/E', adv: '--', bg: '20K', pen: '+', isBusiness: false },
      { fareBasis: 'QRTBD1', owRt: 'RT', fareAmt: roundTo100(68500), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YRTBD1', owRt: 'RT', fareAmt: roundTo100(79000), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '6M', resTkt: '1A/E', adv: '--', bg: '35K', pen: '+', isBusiness: false },
      { fareBasis: 'IFLBD1', owRt: 'OW', fareAmt: roundTo100(110000), bk: 'I', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '40K', pen: '+', isBusiness: true },
      { fareBasis: 'JFLBD1', owRt: 'OW', fareAmt: roundTo100(135000), bk: 'J', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '40K', pen: '-', isBusiness: true },
      { fareBasis: 'JRTBD1', owRt: 'RT', fareAmt: roundTo100(215000), bk: 'J', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '40K', pen: '-', isBusiness: true },
    ];
  } else if (air === 'BS') {
    // Regional / Low-cost (US-Bangla): Economy BDT 33,000 - 44,500; Business BDT 105,000 - 128,000
    fareItems = [
      { fareBasis: 'TSVBD1', owRt: 'OW', fareAmt: roundTo100(33500), bk: 'T', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '20K', pen: '+', isBusiness: false },
      { fareBasis: 'WSVBD1', owRt: 'OW', fareAmt: roundTo100(36000), bk: 'W', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '25K', pen: '+', isBusiness: false },
      { fareBasis: 'QVLBD1', owRt: 'OW', fareAmt: roundTo100(39200), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'LVLBD1', owRt: 'OW', fareAmt: roundTo100(42000), bk: 'L', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YFLBD1', owRt: 'OW', fareAmt: roundTo100(44500), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '35K', pen: '-', isBusiness: false },
      { fareBasis: 'TRTBD1', owRt: 'RT', fareAmt: roundTo100(59500), bk: 'T', seas: dateToken, ap: '--', min: '2D', max: '1M', resTkt: '1A/E', adv: '--', bg: '20K', pen: '+', isBusiness: false },
      { fareBasis: 'QRTBD1', owRt: 'RT', fareAmt: roundTo100(69800), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YRTBD1', owRt: 'RT', fareAmt: roundTo100(80000), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '6M', resTkt: '1A/E', adv: '--', bg: '35K', pen: '-', isBusiness: false },
      { fareBasis: 'CFLBD1', owRt: 'OW', fareAmt: roundTo100(105000), bk: 'C', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '40K', pen: '+', isBusiness: true },
      { fareBasis: 'JFLBD1', owRt: 'OW', fareAmt: roundTo100(128000), bk: 'J', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '40K', pen: '-', isBusiness: true },
      { fareBasis: 'JRTBD1', owRt: 'RT', fareAmt: roundTo100(205000), bk: 'J', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '40K', pen: '-', isBusiness: true },
    ];
  } else if (air === 'G9') {
    // Low-cost (Air Arabia): Economy BDT 32,000 - 43,500
    fareItems = [
      { fareBasis: 'NBA1BD', owRt: 'OW', fareAmt: roundTo100(32200), bk: 'N', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '20K', pen: '+', isBusiness: false },
      { fareBasis: 'TBA1BD', owRt: 'OW', fareAmt: roundTo100(35000), bk: 'T', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '20K', pen: '+', isBusiness: false },
      { fareBasis: 'QVA1BD', owRt: 'OW', fareAmt: roundTo100(38000), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'LVA1BD', owRt: 'OW', fareAmt: roundTo100(40800), bk: 'L', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YEX1BD', owRt: 'OW', fareAmt: roundTo100(43500), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'TRT1BD', owRt: 'RT', fareAmt: roundTo100(57000), bk: 'T', seas: dateToken, ap: '--', min: '2D', max: '1M', resTkt: '1A/E', adv: '--', bg: '20K', pen: '+', isBusiness: false },
      { fareBasis: 'QRT1BD', owRt: 'RT', fareAmt: roundTo100(67000), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YRT1BD', owRt: 'RT', fareAmt: roundTo100(77500), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '6M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
    ];
  } else if (air === 'QR') {
    // Premium Full-Service (Qatar Airways): Economy BDT 56,000 - 77,500; Business BDT 152,000 - 220,000
    fareItems = [
      { fareBasis: 'TRTBD1', owRt: 'OW', fareAmt: roundTo100(56000), bk: 'T', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'QCLBD1', owRt: 'OW', fareAmt: roundTo100(60500), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'VCLBD1', owRt: 'OW', fareAmt: roundTo100(64800), bk: 'V', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'SCNBD1', owRt: 'OW', fareAmt: roundTo100(69500), bk: 'S', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '35K', pen: '+', isBusiness: false },
      { fareBasis: 'MCNBD1', owRt: 'OW', fareAmt: roundTo100(74000), bk: 'M', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '35K', pen: '+', isBusiness: false },
      { fareBasis: 'YELBD1', owRt: 'OW', fareAmt: roundTo100(77500), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'TRTBD1', owRt: 'RT', fareAmt: roundTo100(98000), bk: 'T', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'QEEBD1', owRt: 'RT', fareAmt: roundTo100(106000), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YRTBD1', owRt: 'RT', fareAmt: roundTo100(130000), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'RCLBD1', owRt: 'OW', fareAmt: roundTo100(152000), bk: 'R', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '40K', pen: '+', isBusiness: true },
      { fareBasis: 'ICNBD1', owRt: 'OW', fareAmt: roundTo100(182000), bk: 'I', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '40K', pen: '+', isBusiness: true },
      { fareBasis: 'DCMBD1', owRt: 'OW', fareAmt: roundTo100(205000), bk: 'D', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'JELBD1', owRt: 'OW', fareAmt: roundTo100(220000), bk: 'J', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'CRTBD1', owRt: 'RT', fareAmt: roundTo100(290000), bk: 'C', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'JRTBD1', owRt: 'RT', fareAmt: roundTo100(350000), bk: 'J', seas: dateToken, ap: '--', min: '3D', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
    ];
  } else if (air === 'SQ') {
    // Singapore Airlines: Premium Full-Service
    fareItems = [
      { fareBasis: 'VLTBD1', owRt: 'OW', fareAmt: roundTo100(56500), bk: 'V', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'KLTBD1', owRt: 'OW', fareAmt: roundTo100(61000), bk: 'K', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'QSTBD1', owRt: 'OW', fareAmt: roundTo100(66000), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'MSTBD1', owRt: 'OW', fareAmt: roundTo100(72000), bk: 'M', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '35K', pen: '+', isBusiness: false },
      { fareBasis: 'YFLBD1', owRt: 'OW', fareAmt: roundTo100(77800), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'VRTBD1', owRt: 'RT', fareAmt: roundTo100(99000), bk: 'V', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'QRTBD1', owRt: 'RT', fareAmt: roundTo100(108000), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YRTBD1', owRt: 'RT', fareAmt: roundTo100(132000), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'DFLBD1', owRt: 'OW', fareAmt: roundTo100(185000), bk: 'D', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'JFLBD1', owRt: 'OW', fareAmt: roundTo100(218000), bk: 'J', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'JRTBD1', owRt: 'RT', fareAmt: roundTo100(345000), bk: 'J', seas: dateToken, ap: '--', min: '3D', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
    ];
  } else if (air === 'TK') {
    // Turkish Airlines: Premium Full-Service
    fareItems = [
      { fareBasis: 'UEFBD1', owRt: 'OW', fareAmt: roundTo100(55500), bk: 'U', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'VEFBD1', owRt: 'OW', fareAmt: roundTo100(60000), bk: 'V', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'QEXBD1', owRt: 'OW', fareAmt: roundTo100(65000), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'MEXBD1', owRt: 'OW', fareAmt: roundTo100(71500), bk: 'M', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '35K', pen: '+', isBusiness: false },
      { fareBasis: 'YPRBD1', owRt: 'OW', fareAmt: roundTo100(77200), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'URTBD1', owRt: 'RT', fareAmt: roundTo100(97000), bk: 'U', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'QRTBD1', owRt: 'RT', fareAmt: roundTo100(105000), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: 'YRTBD1', owRt: 'RT', fareAmt: roundTo100(129000), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: 'JPRBD1', owRt: 'OW', fareAmt: roundTo100(165000), bk: 'J', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '+', isBusiness: true },
      { fareBasis: 'CFLBD1', owRt: 'OW', fareAmt: roundTo100(198000), bk: 'C', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: 'JRTBD1', owRt: 'RT', fareAmt: roundTo100(320000), bk: 'J', seas: dateToken, ap: '--', min: '3D', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
    ];
  } else if (isLcc) {
    // Generic Low-cost / Regional Carrier
    fareItems = [
      { fareBasis: `T${air}1BD`, owRt: 'OW', fareAmt: roundTo100(33000), bk: 'T', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '20K', pen: '+', isBusiness: false },
      { fareBasis: `V${air}1BD`, owRt: 'OW', fareAmt: roundTo100(36500), bk: 'V', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '25K', pen: '+', isBusiness: false },
      { fareBasis: `Q${air}1BD`, owRt: 'OW', fareAmt: roundTo100(40000), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `Y${air}1BD`, owRt: 'OW', fareAmt: roundTo100(44500), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `TRT${air}1`, owRt: 'RT', fareAmt: roundTo100(58500), bk: 'T', seas: dateToken, ap: '--', min: '2D', max: '1M', resTkt: '1A/E', adv: '--', bg: '20K', pen: '+', isBusiness: false },
      { fareBasis: `QRT${air}1`, owRt: 'RT', fareAmt: roundTo100(68000), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `YRT${air}1`, owRt: 'RT', fareAmt: roundTo100(78500), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '6M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `JFL${air}1`, owRt: 'OW', fareAmt: roundTo100(115000), bk: 'J', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '40K', pen: '-', isBusiness: true },
      { fareBasis: `JRT${air}1`, owRt: 'RT', fareAmt: roundTo100(185000), bk: 'J', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '40K', pen: '-', isBusiness: true },
    ];
  } else if (isNational) {
    // Generic National Carrier
    fareItems = [
      { fareBasis: `T${air}BD1`, owRt: 'OW', fareAmt: roundTo100(43000), bk: 'T', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `V${air}BD1`, owRt: 'OW', fareAmt: roundTo100(46500), bk: 'V', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `Q${air}BD1`, owRt: 'OW', fareAmt: roundTo100(50000), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `M${air}BD1`, owRt: 'OW', fareAmt: roundTo100(54000), bk: 'M', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `Y${air}BD1`, owRt: 'OW', fareAmt: roundTo100(57800), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: `TRT${air}1`, owRt: 'RT', fareAmt: roundTo100(75000), bk: 'T', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `QRT${air}1`, owRt: 'RT', fareAmt: roundTo100(85000), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `YRT${air}1`, owRt: 'RT', fareAmt: roundTo100(101000), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: `C${air}BD1`, owRt: 'OW', fareAmt: roundTo100(135000), bk: 'C', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: `J${air}BD1`, owRt: 'OW', fareAmt: roundTo100(168000), bk: 'J', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: `CRT${air}1`, owRt: 'RT', fareAmt: roundTo100(220000), bk: 'C', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: `JRT${air}1`, owRt: 'RT', fareAmt: roundTo100(270000), bk: 'J', seas: dateToken, ap: '--', min: '3D', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
    ];
  } else {
    // Generic Premium Full-Service Carrier
    fareItems = [
      { fareBasis: `T${air}BD1`, owRt: 'OW', fareAmt: roundTo100(55500), bk: 'T', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `Q${air}BD1`, owRt: 'OW', fareAmt: roundTo100(60000), bk: 'Q', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `V${air}BD1`, owRt: 'OW', fareAmt: roundTo100(64500), bk: 'V', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `M${air}BD1`, owRt: 'OW', fareAmt: roundTo100(72500), bk: 'M', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '35K', pen: '+', isBusiness: false },
      { fareBasis: `Y${air}BD1`, owRt: 'OW', fareAmt: roundTo100(77500), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: `TRT${air}1`, owRt: 'RT', fareAmt: roundTo100(97500), bk: 'T', seas: dateToken, ap: '--', min: '3D', max: '3M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `QRT${air}1`, owRt: 'RT', fareAmt: roundTo100(105500), bk: 'Q', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '30K', pen: '+', isBusiness: false },
      { fareBasis: `YRT${air}1`, owRt: 'RT', fareAmt: roundTo100(129500), bk: 'Y', seas: dateToken, ap: '--', min: '--', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: false },
      { fareBasis: `C${air}BD1`, owRt: 'OW', fareAmt: roundTo100(175000), bk: 'C', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: `J${air}BD1`, owRt: 'OW', fareAmt: roundTo100(215000), bk: 'J', seas: dateToken, ap: '--', min: '--', max: '--', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: `CRT${air}1`, owRt: 'RT', fareAmt: roundTo100(280000), bk: 'C', seas: dateToken, ap: '--', min: '3D', max: '6M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
      { fareBasis: `JRT${air}1`, owRt: 'RT', fareAmt: roundTo100(340000), bk: 'J', seas: dateToken, ap: '--', min: '3D', max: '12M', resTkt: '1A/E', adv: '--', bg: '2PC', pen: '-', isBusiness: true },
    ];
  }

  // 4. Apply optional filters (/IO, /IR, /KC, /KY)
  if (directionFilter) {
    fareItems = fareItems.filter((f) => f.owRt === directionFilter);
  }
  if (cabinFilter === 'BUSINESS') {
    fareItems = fareItems.filter((f) => f.isBusiness);
  } else if (cabinFilter === 'ECONOMY') {
    fareItems = fareItems.filter((f) => !f.isBusiness);
  }

  // 5. Format Amadeus lines
  const { tpm, mpm } = getSectorMiles(orig, dest);
  const outLines: string[] = [];

  const displayCmd = rawCmd.toUpperCase().trim();
  outLines.push(displayCmd);
  outLines.push(`ROE 119.50 BDT - SYSTEM DATE ${systemDateStr}`);
  outLines.push(`${travelDateStr}**${travelDateStr}/${air} ${orig}${dest}/NSP;EH/TPM  ${String(tpm).padStart(4, ' ')}/MPM  ${String(mpm).padStart(4, ' ')}`);
  outLines.push(`-----------------------------------------------------------------------------`);
  outLines.push(`LN FARE BASIS  OW/RT BDT FARE   BK SEAS  AP MIN MAX RES/TKT ADV BG  PEN`);

  fareItems.forEach((item, index) => {
    const lnStr = String(index + 1).padStart(2, '0');
    const fbStr = item.fareBasis.padEnd(11, ' ');
    const owRtStr = item.owRt.padEnd(5, ' ');
    const fareStr = String(item.fareAmt).padStart(9, ' ');
    const bkStr = item.bk.padEnd(2, ' ');
    const seasStr = item.seas.padEnd(5, ' ');
    const apStr = item.ap.padEnd(2, ' ');
    const minStr = item.min.padEnd(3, ' ');
    const maxStr = item.max.padEnd(3, ' ');
    const resStr = item.resTkt.padEnd(7, ' ');
    const advStr = item.adv.padEnd(3, ' ');
    const bgStr = item.bg.padEnd(4, ' ');
    const penStr = item.pen;

    outLines.push(`${lnStr} ${fbStr} ${owRtStr} ${fareStr}  ${bkStr} ${seasStr} ${apStr} ${minStr} ${maxStr} ${resStr} ${advStr} ${bgStr} ${penStr}`);
  });

  outLines.push(`-----------------------------------------------------------------------------`);
  outLines.push(`FOR RULE PARAGRAPHS ENTER FQN<LINE_NO>*<RULE_CODE> (e.g. FQN1*PE)`);

  return outLines.join('\n');
};

// ======================================================================
// 9. FARE NOTES & PENALTIES (FQN)
// ======================================================================

export const generateFareNotes = (rawCmd: string): string => {
  const upper = rawCmd.toUpperCase().trim();
  const ruleMatch = upper.match(/FQN\s*(?:\d+)?(?:\*([A-Z0-9]+))?/);
  const ruleCode = ruleMatch && ruleMatch[1] ? ruleMatch[1] : 'PE';

  if (ruleCode === 'PE' || ruleCode === '16') {
    return [
      `FQN 1*PE - PENALTIES CATEGORY 16`,
      `TARIFF: INT-BDT PUBLISHED FARES   CARRIER: GENERAL GDS`,
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

// ======================================================================
// 10. CURRENCY CONVERSION (FQC)
// ======================================================================

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
