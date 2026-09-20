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
  const bdAirports = ['DAC', 'CGP', 'ZYL', 'CXB', 'JSR', 'BZL', 'RJH', 'SPD'];
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
// 1. AIRLINE HUB & COUNTRY REGISTRY (FREEDOMS OF THE AIR)
// ======================================================================

export interface AirlineHubProfile {
  code: string;
  name: string;
  country: string;
  hubs: string[];
  aircraft: string[];
  directDestinations: string[]; // Key destinations served directly from primary hub
}

export const AIRLINE_HUB_PROFILES: Record<string, AirlineHubProfile> = {
  // Bangladesh (Strict rule: ONLY operate if origin or destination is BD)
  BG: {
    code: 'BG',
    name: 'BIMAN BANGLADESH AIRLINES',
    country: 'BD',
    hubs: ['DAC', 'CGP', 'ZYL'],
    aircraft: ['788', '789', '77W', '738', 'DH4'],
    directDestinations: ['LHR', 'JED', 'MED', 'RUH', 'DMM', 'DXB', 'AUH', 'SHJ', 'DOH', 'KWI', 'MCT', 'SIN', 'KUL', 'BKK', 'CCU', 'DEL', 'CAN', 'NRT', 'CGP', 'ZYL', 'CXB', 'JSR', 'BZL', 'RJH', 'SPD'],
  },
  BS: {
    code: 'BS',
    name: 'US-BANGLA AIRLINES',
    country: 'BD',
    hubs: ['DAC', 'CGP'],
    aircraft: ['333', '738', 'AT7'],
    directDestinations: ['DXB', 'SHJ', 'DOH', 'MCT', 'SIN', 'KUL', 'BKK', 'CCU', 'JED', 'RUH', 'MAA', 'MLE', 'CGP', 'ZYL', 'CXB', 'JSR', 'BZL', 'RJH', 'SPD'],
  },
  VQ: {
    code: 'VQ',
    name: 'NOVOAIR',
    country: 'BD',
    hubs: ['DAC'],
    aircraft: ['AT7'],
    directDestinations: ['CGP', 'ZYL', 'CXB', 'JSR', 'BZL', 'RJH', 'SPD', 'CCU'],
  },
  '2A': {
    code: '2A',
    name: 'AIR ASTRA',
    country: 'BD',
    hubs: ['DAC'],
    aircraft: ['AT7'],
    directDestinations: ['CGP', 'ZYL', 'CXB', 'SPD'],
  },

  // Saudi Arabia
  SV: {
    code: 'SV',
    name: 'SAUDIA',
    country: 'SA',
    hubs: ['JED', 'RUH'],
    aircraft: ['77W', '789', '78X', '333', '321'],
    directDestinations: ['DAC', 'CGP', 'DXB', 'AUH', 'SHJ', 'DOH', 'KWI', 'BAH', 'MCT', 'LHR', 'LGW', 'MAN', 'CDG', 'FRA', 'AMS', 'IST', 'FCO', 'MXP', 'JFK', 'IAD', 'LAX', 'CAI', 'DEL', 'BOM', 'KUL', 'SIN', 'CAN', 'RUH', 'JED', 'MED', 'DMM'],
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
  J9: {
    code: 'J9',
    name: 'JAZEERA AIRWAYS',
    country: 'KW',
    hubs: ['KWI'],
    aircraft: ['320', '321'],
    directDestinations: ['DAC', 'DXB', 'DOH', 'BAH', 'MCT', 'JED', 'RUH', 'MED', 'DMM', 'DEL', 'BOM', 'IST', 'CAI'],
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

  // Canada
  AC: {
    code: 'AC',
    name: 'AIR CANADA',
    country: 'CA',
    hubs: ['YYZ', 'YVR', 'YUL'],
    aircraft: ['789', '77W', '333', '788'],
    directDestinations: ['LHR', 'LGW', 'CDG', 'FRA', 'AMS', 'FCO', 'DXB', 'DOH', 'DEL', 'BOM', 'NRT', 'HND', 'HKG', 'ICN', 'SYD', 'JFK', 'EWR', 'ORD', 'LAX', 'SFO', 'IAD', 'ATL', 'DFW', 'IAH', 'YYZ', 'YVR', 'YUL'],
  },

  // United States
  UA: {
    code: 'UA',
    name: 'UNITED AIRLINES',
    country: 'US',
    hubs: ['EWR', 'ORD', 'IAH', 'SFO'],
    aircraft: ['789', '77W', '788', '739'],
    directDestinations: ['LHR', 'CDG', 'FRA', 'MUC', 'AMS', 'FCO', 'DXB', 'DOH', 'DEL', 'BOM', 'SIN', 'HND', 'NRT', 'HKG', 'SYD', 'MEL', 'YYZ', 'YVR', 'EWR', 'ORD', 'IAH', 'SFO', 'LAX', 'IAD'],
  },
  AA: {
    code: 'AA',
    name: 'AMERICAN AIRLINES',
    country: 'US',
    hubs: ['JFK', 'ORD', 'DFW'],
    aircraft: ['77W', '789', '788', '738'],
    directDestinations: ['LHR', 'CDG', 'FRA', 'FCO', 'DOH', 'DEL', 'HND', 'SYD', 'YYZ', 'YVR', 'JFK', 'ORD', 'DFW', 'LAX', 'MIA'],
  },
  DL: {
    code: 'DL',
    name: 'DELTA AIR LINES',
    country: 'US',
    hubs: ['ATL', 'JFK'],
    aircraft: ['359', '333', '764', '739'],
    directDestinations: ['LHR', 'CDG', 'AMS', 'FCO', 'HND', 'ICN', 'SYD', 'YYZ', 'YVR', 'ATL', 'JFK', 'LAX', 'BOS'],
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

  // France
  AF: {
    code: 'AF',
    name: 'AIR FRANCE',
    country: 'FR',
    hubs: ['CDG'],
    aircraft: ['359', '77W', '789', '321'],
    directDestinations: ['LHR', 'JFK', 'EWR', 'ORD', 'LAX', 'SFO', 'IAD', 'YYZ', 'YVR', 'DXB', 'DOH', 'JED', 'RUH', 'DEL', 'BOM', 'SIN', 'BKK', 'HKG', 'NRT', 'HND', 'CAI', 'ADD', 'CDG'],
  },

  // Netherlands
  KL: {
    code: 'KL',
    name: 'KLM ROYAL DUTCH AIRLINES',
    country: 'NL',
    hubs: ['AMS'],
    aircraft: ['789', '77W', '78X', '738'],
    directDestinations: ['LHR', 'JFK', 'EWR', 'ORD', 'LAX', 'SFO', 'IAD', 'YYZ', 'YVR', 'DXB', 'DOH', 'JED', 'RUH', 'DEL', 'BOM', 'SIN', 'BKK', 'HKG', 'NRT', 'HND', 'CAI', 'ADD', 'AMS'],
  },

  // Egypt
  MS: {
    code: 'MS',
    name: 'EGYPTAIR',
    country: 'EG',
    hubs: ['CAI'],
    aircraft: ['789', '77W', '321'],
    directDestinations: ['DAC', 'DXB', 'AUH', 'SHJ', 'DOH', 'KWI', 'BAH', 'MCT', 'JED', 'RUH', 'MED', 'DMM', 'LHR', 'CDG', 'FRA', 'IST', 'JFK', 'IAD', 'YYZ', 'ADD', 'CAI'],
  },

  // Ethiopia
  ET: {
    code: 'ET',
    name: 'ETHIOPIAN AIRLINES',
    country: 'ET',
    hubs: ['ADD'],
    aircraft: ['359', '788', '789', '77W'],
    directDestinations: ['DAC', 'DXB', 'DOH', 'KWI', 'BAH', 'MCT', 'JED', 'RUH', 'LHR', 'MAN', 'CDG', 'FRA', 'IST', 'JFK', 'EWR', 'ORD', 'IAD', 'YYZ', 'DEL', 'BOM', 'SIN', 'BKK', 'KUL', 'HKG', 'CAI', 'ADD'],
  },

  // Hong Kong
  CX: {
    code: 'CX',
    name: 'CATHAY PACIFIC',
    country: 'HK',
    hubs: ['HKG'],
    aircraft: ['351', '359', '77W'],
    directDestinations: ['DAC', 'LHR', 'MAN', 'CDG', 'FRA', 'AMS', 'JFK', 'LAX', 'SFO', 'ORD', 'YYZ', 'YVR', 'DXB', 'DOH', 'SIN', 'BKK', 'KUL', 'DEL', 'BOM', 'NRT', 'HND', 'ICN', 'SYD', 'MEL', 'HKG'],
  },
};

// Check if an airline operates direct between two cities
export const canAirlineOperateDirect = (airlineCode: string, orig: string, dest: string): boolean => {
  const air = airlineCode.toUpperCase();
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();
  const profile = AIRLINE_HUB_PROFILES[air];
  if (!profile) return false;

  const origCountry = getAirportCountry(o);
  const destCountry = getAirportCountry(d);

  // STRICT BANGLADESH RULE:
  // ONLY show BG/BS/VQ/2A if origin or destination country is Bangladesh!
  if (['BG', 'BS', 'VQ', '2A'].includes(air)) {
    if (origCountry !== 'BD' && destCountry !== 'BD') {
      return false;
    }
  }

  // Domestic Bangladesh
  if (origCountry === 'BD' && destCountry === 'BD') {
    return ['BG', 'BS', 'VQ', '2A'].includes(air);
  }

  // Airline must connect to its own country or directDestinations
  const connectsToHub = profile.hubs.includes(o) || profile.hubs.includes(d);
  const servesOrigin = profile.hubs.includes(o) || profile.directDestinations.includes(o);
  const servesDest = profile.hubs.includes(d) || profile.directDestinations.includes(d);

  if (connectsToHub && servesOrigin && servesDest) {
    return true;
  }

  // 5th Freedom / Bilateral specific allowances
  if (air === 'SQ' && ((o === 'FRA' && d === 'JFK') || (o === 'JFK' && d === 'FRA'))) return true;
  if (air === 'EK' && ((o === 'MXP' && d === 'JFK') || (o === 'JFK' && d === 'MXP'))) return true;

  return false;
};

// Check if an airline can operate connecting flight between orig and dest via its hub
export const getAirlineConnectingHub = (airlineCode: string, orig: string, dest: string): string | null => {
  const air = airlineCode.toUpperCase();
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();
  const profile = AIRLINE_HUB_PROFILES[air];
  if (!profile) return null;

  const origCountry = getAirportCountry(o);
  const destCountry = getAirportCountry(d);

  // STRICT BANGLADESH RULE:
  // BG/BS/VQ/2A NEVER do 6th freedom transits between foreign countries!
  if (['BG', 'BS', 'VQ', '2A'].includes(air)) {
    return null;
  }

  // Cannot transit if origin or destination is already a hub of this airline
  if (profile.hubs.includes(o) || profile.hubs.includes(d)) {
    return null;
  }

  // Check each hub of the airline: must serve orig from hub, and dest from hub
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
// 2. REALISTIC FARE & TIMING ENGINES
// ======================================================================

// Dynamic sector fare calculation in BDT
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
    // Domestic: BDT 4,500 - 8,500 range
    base = 5200;
    tax = 1400;
  } else if (['CCU', 'DEL', 'BOM', 'MAA', 'KTM', 'CMB'].includes(d) || ['CCU', 'DEL', 'BOM'].includes(o)) {
    // South Asia
    base = 16500;
    tax = 5800;
  } else if (['SIN', 'BKK', 'KUL', 'HKG', 'CAN'].includes(d) || ['SIN', 'BKK', 'KUL'].includes(o)) {
    // Southeast Asia
    base = 39500;
    tax = 13800;
  } else if (['JED', 'MED', 'RUH', 'DMM', 'DXB', 'SHJ', 'AUH', 'DOH', 'KWI', 'BAH', 'MCT'].includes(d) || ['JED', 'RUH', 'DXB', 'DOH'].includes(o)) {
    // Middle East
    base = 54500;
    tax = 18500;
  } else if (['LHR', 'LGW', 'MAN', 'CDG', 'FRA', 'MUC', 'AMS', 'FCO', 'MXP', 'IST'].includes(d) || ['LHR', 'CDG', 'FRA', 'AMS'].includes(o)) {
    // Europe
    base = 98000;
    tax = 29500;
  } else if (['JFK', 'EWR', 'NYC', 'YYZ', 'YVR', 'YUL', 'ORD', 'LAX', 'SFO', 'IAD', 'ATL', 'DFW', 'IAH'].includes(d) || ['JFK', 'ORD', 'YYZ'].includes(o)) {
    // North America
    base = 112000;
    tax = 33000;
  } else {
    // Long Haul Rest of World
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

// Realistic Flight Plan Template
export interface FlightRoutePlan {
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

// Pre-configured authentic flight catalogs for major airlines
const AUTHENTIC_FLIGHT_CATALOG: Record<string, { f1: string; f2?: string; d1: string; a1: string; d2?: string; a2?: string; eq1: string; eq2?: string; elapsed?: string }[]> = {
  // SV from DAC
  SV: [
    { f1: '805', d1: '0355', a1: '0820', eq1: '77W', f2: '115', d2: '1040', a2: '1455', eq2: '77W', elapsed: '14:20' },
    { f1: '801', d1: '0230', a1: '0615', eq1: '77W', f2: '121', d2: '0900', a2: '1330', eq2: '789', elapsed: '13:45' },
    { f1: '803', d1: '1215', a1: '1640', eq1: '789', f2: '119', d2: '1945', a2: '2355', eq2: '77W', elapsed: '14:50' },
    { f1: '807', d1: '1930', a1: '2355', eq1: '333', f2: '111', d2: '0230', a2: '0645', eq2: '789', elapsed: '14:25' },
    { f1: '811', d1: '1420', a1: '1835', eq1: '77W', f2: '123', d2: '2115', a2: '0130', eq2: '77W', elapsed: '14:15' },
    { f1: '815', d1: '2200', a1: '0215', eq1: '789', f2: '125', d2: '0430', a2: '0845', eq2: '789', elapsed: '13:45' },
    { f1: '817', d1: '0800', a1: '1225', eq1: '77W', f2: '127', d2: '1500', a2: '1915', eq2: '789', elapsed: '14:15' },
    { f1: '819', d1: '1630', a1: '2055', eq1: '789', f2: '129', d2: '2330', a2: '0345', eq2: '77W', elapsed: '14:15' },
  ],

  // QR from DAC
  QR: [
    { f1: '639', d1: '0410', a1: '0620', eq1: '77W', f2: '015', d2: '0815', a2: '1325', eq2: '359', elapsed: '14:15' },
    { f1: '641', d1: '1055', a1: '1305', eq1: '77W', f2: '003', d2: '1510', a2: '2025', eq2: '77W', elapsed: '14:30' },
    { f1: '643', d1: '2000', a1: '2210', eq1: '359', f2: '007', d2: '0200', a2: '0715', eq2: '789', elapsed: '14:15' },
    { f1: '639', d1: '0410', a1: '0620', eq1: '77W', f2: '9709', d2: '0755', a2: '1325', eq2: '777', elapsed: '14:15' }, // BA codeshare
    { f1: '641', d1: '1055', a1: '1305', eq1: '77W', f2: '009', d2: '1645', a2: '2155', eq2: '351', elapsed: '14:00' },
    { f1: '643', d1: '2000', a1: '2210', eq1: '359', f2: '001', d2: '0115', a2: '0625', eq2: '77W', elapsed: '13:25' },
    { f1: '639', d1: '0410', a1: '0620', eq1: '77W', f2: '011', d2: '0930', a2: '1440', eq2: '789', elapsed: '15:30' },
    { f1: '641', d1: '1055', a1: '1305', eq1: '77W', f2: '005', d2: '1730', a2: '2240', eq2: '359', elapsed: '14:45' },
  ],

  // EK from DAC
  EK: [
    { f1: '585', d1: '0140', a1: '0445', eq1: '77W', f2: '001', d2: '0745', a2: '1225', eq2: '380', elapsed: '14:45' },
    { f1: '583', d1: '1015', a1: '1320', eq1: '77W', f2: '003', d2: '1430', a2: '1910', eq2: '380', elapsed: '14:55' },
    { f1: '587', d1: '1930', a1: '2240', eq1: '77W', f2: '005', d2: '0215', a2: '0705', eq2: '380', elapsed: '14:35' },
    { f1: '581', d1: '0830', a1: '1135', eq1: '77W', f2: '007', d2: '1300', a2: '1745', eq2: '77W', elapsed: '14:15' },
    { f1: '585', d1: '0140', a1: '0445', eq1: '77W', f2: '029', d2: '0940', a2: '1420', eq2: '380', elapsed: '15:40' },
    { f1: '583', d1: '1015', a1: '1320', eq1: '77W', f2: '031', d2: '1600', a2: '2040', eq2: '77W', elapsed: '15:25' },
    { f1: '587', d1: '1930', a1: '2240', eq1: '77W', f2: '009', d2: '0310', a2: '0800', eq2: '380', elapsed: '14:30' },
    { f1: '581', d1: '0830', a1: '1135', eq1: '77W', f2: '011', d2: '1445', a2: '1930', eq2: '77W', elapsed: '16:00' },
  ],

  // TK from DAC
  TK: [
    { f1: '713', d1: '0615', a1: '1210', eq1: '359', f2: '1979', d2: '1430', a2: '1645', eq2: '321', elapsed: '14:30' },
    { f1: '715', d1: '2255', a1: '0450', eq1: '789', f2: '1983', d2: '0715', a2: '0930', eq2: '321', elapsed: '14:35' },
    { f1: '713', d1: '0615', a1: '1210', eq1: '359', f2: '1985', d2: '1600', a2: '1815', eq2: '333', elapsed: '16:00' },
    { f1: '715', d1: '2255', a1: '0450', eq1: '789', f2: '1987', d2: '0900', a2: '1115', eq2: '359', elapsed: '16:20' },
  ],

  // BG direct schedules
  BG: [
    { f1: '039', d1: '1945', a1: '2330', eq1: '788' },
    { f1: '049', d1: '0830', a1: '1215', eq1: '77W' },
    { f1: '037', d1: '1500', a1: '1845', eq1: '788' },
    { f1: '041', d1: '2315', a1: '0300', eq1: '77W' },
    { f1: '047', d1: '1800', a1: '2130', eq1: '789' },
    { f1: '147', d1: '2130', a1: '0100', eq1: '77W' },
    { f1: '247', d1: '0915', a1: '1245', eq1: '788' },
    { f1: '201', d1: '1045', a1: '1615', eq1: '77W' }, // DAC-LHR nonstop
    { f1: '203', d1: '1215', a1: '1745', eq1: '789' },
    { f1: '084', d1: '0815', a1: '1430', eq1: '738' }, // DAC-SIN
    { f1: '086', d1: '2345', a1: '0600', eq1: '788' }, // DAC-KUL
    { f1: '088', d1: '1100', a1: '1430', eq1: '738' }, // DAC-BKK
  ],

  // BS direct schedules
  BS: [
    { f1: '341', d1: '1900', a1: '2230', eq1: '738' },
    { f1: '343', d1: '2115', a1: '0045', eq1: '333' },
    { f1: '315', d1: '2350', a1: '0600', eq1: '738' },
    { f1: '307', d1: '0830', a1: '1445', eq1: '738' },
    { f1: '335', d1: '1630', a1: '2015', eq1: '333' },
    { f1: '217', d1: '1030', a1: '1400', eq1: '738' },
    { f1: '201', d1: '0730', a1: '0815', eq1: '738' },
    { f1: '203', d1: '1330', a1: '1415', eq1: '738' },
  ],
};

// Realistic Amadeus class distribution templates
// Colors in Terminal: 9-4 = Green, 3-1 = Orange, 0/L/C = Red
const REALISTIC_CLASS_SETS: { c1: string; c2: string }[] = [
  { c1: 'J9 C9 D9 Y9 B9 M9', c2: 'Q9 T9 V9 L9 K9' },
  { c1: 'J9 C7 D4 Y9 B9 M9', c2: 'Q9 T7 V4 L2 K0' },
  { c1: 'J9 C9 D6 Y9 B9 M7', c2: 'Q9 T9 V8 L5 K2' },
  { c1: 'J4 C2 D0 Y9 B7 M4', c2: 'Q7 T4 V2 L0 K0' },
  { c1: 'J9 C8 D5 Y9 B9 M9', c2: 'Q9 T4 V2 L0 K0' },
  { c1: 'J9 C6 D2 Y9 B9 M7', c2: 'Q6 T3 V1 L0 K0' },
  { c1: 'J9 C9 D9 Y9 B9 M9', c2: 'Q9 T7 V4 L2 K1' },
  { c1: 'J7 C4 D1 Y9 B8 M5', c2: 'Q4 T2 V1 L0 K0' },
  { c1: 'J9 C9 D7 Y9 B9 M9', c2: 'Q9 T8 V5 L3 K1' },
  { c1: 'J9 C7 D3 Y9 B9 M9', c2: 'Q9 T6 V3 L1 K0' },
  { c1: 'J9 C9 D9 Y9 B9 M9', c2: 'Q9 T9 V9 L9 K9' },
  { c1: 'J8 C6 D3 Y9 B8 M6', c2: 'Q8 T5 V2 L1 K0' },
  { c1: 'J9 C5 D2 Y9 B9 M8', c2: 'Q7 T5 V3 L0 K0' },
  { c1: 'J5 C3 D0 Y9 B6 M3', c2: 'Q5 T2 V0 L0 K0' },
  { c1: 'J9 C9 D8 Y9 B9 M9', c2: 'Q9 T9 V7 L4 K1' },
  { c1: 'J6 C4 D1 Y8 B7 M4', c2: 'Q6 T3 V1 L0 K0' },
];

// Determine the list of carriers that legally operate on this sector
export const getCarriersForSector = (orig: string, dest: string, airlineFilter?: string): string[] => {
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();
  const oCountry = getAirportCountry(o);
  const dCountry = getAirportCountry(d);

  if (airlineFilter) {
    const clean = airlineFilter.toUpperCase().trim();
    // If filtering by BG or BS when neither origin nor dest is Bangladesh:
    if (['BG', 'BS', 'VQ', '2A'].includes(clean) && oCountry !== 'BD' && dCountry !== 'BD') {
      return [];
    }
    return [clean];
  }

  // Domestic Bangladesh
  if (oCountry === 'BD' && dCountry === 'BD') {
    return ['BG', 'BS', 'VQ', '2A', 'BG', 'BS', 'VQ', '2A', 'BG', 'BS', 'VQ', 'BS', 'BG', '2A', 'VQ', 'BG'];
  }

  // International searches: find all direct and connecting carriers
  const candidates = Object.keys(AIRLINE_HUB_PROFILES);
  const validDirect: string[] = [];
  const validTransit: string[] = [];

  for (const air of candidates) {
    // STRICT Bangladesh rule
    if (['BG', 'BS', 'VQ', '2A'].includes(air) && oCountry !== 'BD' && dCountry !== 'BD') {
      continue;
    }

    if (canAirlineOperateDirect(air, o, d)) {
      validDirect.push(air);
    } else if (getAirlineConnectingHub(air, o, d)) {
      validTransit.push(air);
    }
  }

  // Combine to create an authentic 10-16 flight list
  const combined: string[] = [];

  // Add direct carriers first (repeated if multiple frequencies exist)
  validDirect.forEach((air) => {
    combined.push(air);
    combined.push(air);
  });

  // Add transit carriers
  validTransit.forEach((air) => {
    combined.push(air);
  });

  // If list is less than 12, pad with leading valid carriers
  while (combined.length < 12 && (validDirect.length > 0 || validTransit.length > 0)) {
    const pool = validDirect.length > 0 ? validDirect : validTransit;
    combined.push(pool[combined.length % pool.length]);
  }

  return combined.slice(0, 16);
};

// Generate realistic schedules for a carrier on a given route
export const generateScheduleForCarrier = (
  airline: string,
  orig: string,
  dest: string,
  index: number
): FlightRoutePlan => {
  const air = airline.toUpperCase();
  const o = orig.toUpperCase();
  const d = dest.toUpperCase();
  const profile = AIRLINE_HUB_PROFILES[air] || {
    code: air,
    name: air,
    country: 'XX',
    hubs: ['DXB'],
    aircraft: ['77W', '789'],
    directDestinations: [],
  };

  const isDirect = canAirlineOperateDirect(air, o, d);
  const transitHub = isDirect ? undefined : getAirlineConnectingHub(air, o, d);

  // Pick realistic class sets
  const cp1 = REALISTIC_CLASS_SETS[index % REALISTIC_CLASS_SETS.length];
  const cp2 = REALISTIC_CLASS_SETS[(index + 3) % REALISTIC_CLASS_SETS.length];

  // Pick aircraft
  const eq1 = profile.aircraft[index % profile.aircraft.length];
  const eq2 = profile.aircraft[(index + 1) % profile.aircraft.length];

  // Look into authentic catalog first
  const catalog = AUTHENTIC_FLIGHT_CATALOG[air];
  if (catalog && catalog.length > 0) {
    const item = catalog[index % catalog.length];
    if (isDirect) {
      return {
        airline: air,
        flightNumber: item.f1,
        depTime: item.d1,
        arrTime: item.a1,
        equip: item.eq1 || eq1,
        classes1: cp1.c1,
        classes2: cp1.c2,
      };
    } else if (transitHub) {
      return {
        airline: air,
        flightNumber: item.f1,
        depTime: item.d1,
        arrTime: item.a1,
        equip: item.eq1 || eq1,
        transitHub,
        transitFlightNumber: item.f2 || String(parseInt(item.f1, 10) + 20),
        transitDepTime: item.d2 || '0930',
        transitArrTime: item.a2 || '1415',
        transitEquip: item.eq2 || eq2,
        elapsedTime: item.elapsed || '14:20',
        codeshare: (air === 'QR' && item.f2 === '9709') ? 'BA:QR9709' : undefined,
        classes1: cp1.c1,
        classes2: cp1.c2,
        transitClasses1: cp2.c1,
        transitClasses2: cp2.c2,
      };
    }
  }

  // Dynamic realistic generation based on departure banks
  const departureBanks = [
    { dep: '0230', arrDirect: '0645', arrH1: '0545', depH2: '0815', arrDest: '1330', elapsed: '14:00' },
    { dep: '0415', arrDirect: '0830', arrH1: '0730', depH2: '0945', arrDest: '1455', elapsed: '13:40' },
    { dep: '0820', arrDirect: '1240', arrH1: '1130', depH2: '1345', arrDest: '1850', elapsed: '13:30' },
    { dep: '1050', arrDirect: '1505', arrH1: '1400', depH2: '1615', arrDest: '2125', elapsed: '13:35' },
    { dep: '1340', arrDirect: '1755', arrH1: '1650', depH2: '1900', arrDest: '0015', elapsed: '13:35' },
    { dep: '1615', arrDirect: '2030', arrH1: '1925', depH2: '2145', arrDest: '0250', elapsed: '13:35' },
    { dep: '1945', arrDirect: '2355', arrH1: '2255', depH2: '0130', arrDest: '0645', elapsed: '14:00' },
    { dep: '2230', arrDirect: '0245', arrH1: '0140', depH2: '0400', arrDest: '0910', elapsed: '13:40' },
  ];

  const bank = departureBanks[index % departureBanks.length];
  const numBase = 100 + (index * 12) + (air.charCodeAt(0) % 20);
  const flt1 = String(numBase);
  const flt2 = String(numBase + 101);

  if (isDirect) {
    const isDomestic = isDomesticAirport(o) && isDomesticAirport(d);
    const arr = isDomestic
      ? String((parseInt(bank.dep.substring(0, 2), 10) + 1) % 24).padStart(2, '0') + bank.dep.substring(2)
      : bank.arrDirect;

    return {
      airline: air,
      flightNumber: flt1,
      depTime: bank.dep,
      arrTime: arr,
      equip: isDomestic ? 'AT7' : eq1,
      classes1: cp1.c1,
      classes2: cp1.c2,
    };
  }

  // Connecting via hub
  const hubToUse = transitHub || (profile.hubs[0] || 'DXB');
  return {
    airline: air,
    flightNumber: flt1,
    depTime: bank.dep,
    arrTime: bank.arrH1,
    equip: eq1,
    transitHub: hubToUse,
    transitFlightNumber: flt2,
    transitDepTime: bank.depH2,
    transitArrTime: bank.arrDest,
    transitEquip: eq2,
    elapsedTime: bank.elapsed,
    classes1: cp1.c1,
    classes2: cp1.c2,
    transitClasses1: cp2.c1,
    transitClasses2: cp2.c2,
  };
};

// ======================================================================
// 3. PARSERS FOR AN AND FXD INPUTS
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

  // 1. Extract Airline Qualifier: /AQR, //AQR, /A QR, /ASV, //ASV, /ABG, /ABS, or trailing /QR, /SV, /BG, /BS
  let airlineFilter: string | undefined = undefined;
  const airMatch = rem.match(/(?:\/\/|\/|\s)A\s*([A-Z0-9]{2})(?:\s|$)/);
  if (airMatch) {
    airlineFilter = airMatch[1];
    rem = rem.replace(airMatch[0], ' ').trim();
  } else {
    const slashAir = rem.match(/(?:\/\/|\/)([A-Z0-9]{2})$/);
    if (slashAir) {
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
    const dayOnlyMatch = rem.match(/^(\d{1,2})([A-Z]{6})/);
    if (dayOnlyMatch) {
      date = `${dayOnlyMatch[1].padStart(2, '0')}SEP`;
      rem = dayOnlyMatch[2];
    }
  }

  // 4. Extract Origin and Destination
  let orig = 'DAC';
  let dest = 'JED';

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
        dest = 'JED';
      } else {
        orig = 'DAC';
        dest = tokens[0];
      }
    } else if (lettersOnly.length >= 3) {
      if (lettersOnly.startsWith('DAC')) {
        orig = 'DAC';
        dest = lettersOnly.substring(3, 6) || 'JED';
      } else {
        dest = lettersOnly.substring(0, 3);
        orig = 'DAC';
      }
    }
  }

  return {
    orig: orig || 'DAC',
    dest: dest || 'JED',
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

  // 1. Airline filter: //ASV, /ASV, /A SV, /AQR, //AEK, /ABG, /ABS
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
  let dest = 'JED';

  const origFromStart = body.match(/^([A-Z]{3})/);
  if (origFromStart && AIRPORTS.some((a) => a.code === origFromStart[1])) {
    orig = origFromStart[1];
  }

  if (legMatches.length > 0) {
    dest = legMatches[0][2];
  } else {
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
      const tokens = (cleanWithoutQualifiers.match(/[A-Z]{3}/g) || []).filter(
        (tok) => !MONTHS.includes(tok) && AIRPORTS.some((a) => a.code === tok)
      );
      if (tokens.length >= 2) {
        orig = tokens[0];
        dest = tokens[1];
      } else if (tokens.length === 1) {
        orig = 'DAC';
        dest = tokens[0];
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

// ======================================================================
// 4. GENERATE FLIGHT AVAILABILITY (AN) - 10 TO 16 FLIGHTS
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

  // STRICT BANGLADESH RULE:
  if (air && ['BG', 'BS', 'VQ', '2A'].includes(air) && oCountry !== 'BD' && dCountry !== 'BD') {
    const lines = [
      `AN${dte}${orig}${dest}/A${air}`,
      `NO SCHEDULED FLIGHTS FOR CARRIER ${air} ON SECTOR ${orig}-${dest}`,
      `NOTE: ${air} ONLY OPERATES ROUTES TO/FROM BANGLADESH (FREEDOMS OF THE AIR RESTRICTION)`,
    ];
    return { options: [], displayText: lines.join('\n') };
  }

  // Determine list of carrier slots (10 to 16 flights)
  let carriersToUse: string[] = [];
  if (air) {
    // 10 to 14 options for this specific airline
    carriersToUse = Array(12).fill(air);
  } else {
    carriersToUse = getCarriersForSector(orig, dest);
  }

  // Ensure 10-16 options
  if (carriersToUse.length < 10) {
    const fallbackAir = (oCountry === 'BD' || dCountry === 'BD') ? 'BG' : 'EK';
    while (carriersToUse.length < 12) {
      carriersToUse.push(fallbackAir);
    }
  } else if (carriersToUse.length > 16) {
    carriersToUse = carriersToUse.slice(0, 16);
  }

  const options: AvailabilityOption[] = [];

  carriersToUse.forEach((carrier, index) => {
    const lineNum = index + 1;
    const plan = generateScheduleForCarrier(carrier, orig, dest, index);

    if (plan.transitHub && plan.transitFlightNumber) {
      // Connecting flight (Leg 1: Orig -> Hub, Leg 2: Hub -> Dest)
      options.push({
        lineNum,
        date: dte,
        flight1: {
          airline: carrier,
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
          airline: carrier,
          flightNumber: plan.transitFlightNumber,
          codeshare: plan.codeshare,
          classes1: plan.transitClasses1 || plan.classes1,
          classes2: plan.transitClasses2 || plan.classes2,
          origin: plan.transitHub,
          destination: dest,
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
          airline: carrier,
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
// 5. GENERATE LOWEST FARE SEARCH (FXD) - 10 TO 16 OPTIONS
// ======================================================================

export const generateLowestFareSearch = (
  rawCmd: string
): { options: FareSearchOption[]; displayText: string } => {
  const params = parseFxdInput(rawCmd);
  const { orig, dest, outboundDate, isRoundTrip, returnDate, airlineFilter, isBusiness, adt, chd, inf } = params;

  const oCountry = getAirportCountry(orig);
  const dCountry = getAirportCountry(dest);

  // STRICT BANGLADESH RULE:
  if (airlineFilter && ['BG', 'BS', 'VQ', '2A'].includes(airlineFilter) && oCountry !== 'BD' && dCountry !== 'BD') {
    const text = [
      `FXD BEST BUY - FARE SEARCH RESULTS: ${orig}-${dest} / ${outboundDate}`,
      `NO FARES AVAILABLE FOR CARRIER ${airlineFilter} ON SECTOR ${orig}-${dest}`,
      `NOTE: ${airlineFilter} IS RESTRICTED TO ROUTES TO/FROM BANGLADESH.`,
    ].join('\n');
    return { options: [], displayText: text };
  }

  // Determine carriers (10 to 14 options)
  let carriersToUse: string[] = [];
  if (airlineFilter) {
    carriersToUse = Array(12).fill(airlineFilter.toUpperCase());
  } else {
    carriersToUse = getCarriersForSector(orig, dest);
  }

  if (carriersToUse.length < 10) {
    const fallbackAir = (oCountry === 'BD' || dCountry === 'BD') ? 'BG' : 'EK';
    while (carriersToUse.length < 12) {
      carriersToUse.push(fallbackAir);
    }
  } else if (carriersToUse.length > 14) {
    carriersToUse = carriersToUse.slice(0, 14);
  }

  const sectorFare = calculateSectorFare(orig, dest, isBusiness, isRoundTrip);
  const options: FareSearchOption[] = [];

  const bookingClasses = isBusiness ? ['J', 'C', 'D'] : ['T', 'Q', 'V', 'L', 'M', 'K', 'B', 'Y'];

  carriersToUse.forEach((airline, index) => {
    const optNum = index + 1;
    const plan = generateScheduleForCarrier(airline, orig, dest, index);

    // Price variation step
    const priceStep = 1 + (index * 0.045);
    const basePerPax = Math.round(sectorFare.base * priceStep);
    const taxPerPax = Math.round(sectorFare.tax * priceStep);

    const baseTotal = basePerPax * adt + Math.round(basePerPax * 0.75) * chd + Math.round(basePerPax * 0.1) * inf;
    const taxesTotal = taxPerPax * (adt + chd + inf);
    const totalFare = baseTotal + taxesTotal;

    const bookingClass = isBusiness ? bookingClasses[index % bookingClasses.length] : bookingClasses[Math.min(index, bookingClasses.length - 1)];

    const flights: FareSearchFlight[] = [];

    // Outbound leg 1
    flights.push({
      airline,
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
        airline,
        flightNumber: plan.transitFlightNumber,
        origin: plan.transitHub,
        destination: dest,
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
          airline,
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
          airline,
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
          airline,
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

  // Sort ascending by total fare
  options.sort((a, b) => a.totalFare - b.totalFare);
  // Re-index options 1..N
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
// 6. TIMETABLE (TN) - 10 TO 16 ROWS
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

  carriers.slice(0, 14).forEach((carrier, index) => {
    const optNum = index + 1;
    const plan = generateScheduleForCarrier(carrier, orig, dest, index);
    const fltPad = `${carrier} ${plan.flightNumber}`.padEnd(8, ' ');
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
// 7. FARE DISPLAY (FQD)
// ======================================================================

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
    `05 JLRBD1      OW    ${Math.round(baseAmt * 2.5).toLocaleString()}  J   --   -- --  --  1A/E         2PC +`,
    `-----------------------------------------------------------------------------`,
    `FOR RULE PARAGRAPHS ENTER FQN<LINE_NO>*<RULE_CODE> (e.g. FQN1*PE)`,
  ].join('\n');
};

// ======================================================================
// 8. FARE NOTES & PENALTIES (FQN)
// ======================================================================

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

// ======================================================================
// 9. CURRENCY CONVERSION (FQC)
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
