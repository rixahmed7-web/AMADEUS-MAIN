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
// 8. FARE DISPLAY (FQD)
// ======================================================================

export const generateFareDisplay = (rawCmd: string): string => {
  const upper = rawCmd.toUpperCase().trim();
  const match = upper.match(/^FQD\s*([A-Z]{3})([A-Z]{3})(?:\/A([A-Z0-9]{2}))?/);

  let orig = match ? match[1] : 'DAC';
  let dest = match ? match[2] : 'DXB';
  const air = match && match[3] ? match[3] : 'EK';

  if (orig === 'SEP' || MONTHS.includes(orig)) orig = 'DAC';
  if (dest === 'SEP' || MONTHS.includes(dest)) dest = orig === 'DAC' ? 'DXB' : 'DAC';

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
    `05 JLRBD1      OW    ${Math.round(baseAmt * 2.5).toLocaleString()}  J   --   -- --  --  1A/E         2PC +`,
    `-----------------------------------------------------------------------------`,
    `FOR RULE PARAGRAPHS ENTER FQN<LINE_NO>*<RULE_CODE> (e.g. FQN1*PE)`,
  ].join('\n');
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
