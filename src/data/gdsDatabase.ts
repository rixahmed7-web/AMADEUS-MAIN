// Comprehensive GDS Reference Database for Encode & Decode (DAN, DAC, DNA, DC, DNE)

export interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  terminal?: string;
}

export interface AirlineInfo {
  code: string;
  numericCode: string;
  name: string;
  country: string;
}

export interface CountryInfo {
  code: string;
  name: string;
}

export interface AircraftInfo {
  code: string;
  name: string;
  category: string;
}

export const AIRPORTS: AirportInfo[] = [
  { code: 'DAC', name: 'HAZRAT SHAHJALAL INTL', city: 'DHAKA', country: 'BANGLADESH', countryCode: 'BD', terminal: '1' },
  { code: 'CGP', name: 'SHAH AMANAT INTL', city: 'CHITTAGONG', country: 'BANGLADESH', countryCode: 'BD' },
  { code: 'ZYL', name: 'OSMANI INTL', city: 'SYLHET', country: 'BANGLADESH', countryCode: 'BD' },
  { code: 'CXB', name: 'COX\'S BAZAR AIRPORT', city: 'COX\'S BAZAR', country: 'BANGLADESH', countryCode: 'BD' },
  { code: 'JSR', name: 'JESSORE AIRPORT', city: 'JESSORE', country: 'BANGLADESH', countryCode: 'BD' },
  { code: 'BZL', name: 'BARISAL AIRPORT', city: 'BARISAL', country: 'BANGLADESH', countryCode: 'BD' },
  { code: 'RJH', name: 'SHAH MAKHDUM AIRPORT', city: 'RAJSHAHI', country: 'BANGLADESH', countryCode: 'BD' },
  { code: 'SPD', name: 'SAIDPUR AIRPORT', city: 'SAIDPUR', country: 'BANGLADESH', countryCode: 'BD' },
  { code: 'LHR', name: 'HEATHROW AIRPORT', city: 'LONDON', country: 'UNITED KINGDOM', countryCode: 'GB', terminal: '4' },
  { code: 'LGW', name: 'GATWICK AIRPORT', city: 'LONDON', country: 'UNITED KINGDOM', countryCode: 'GB' },
  { code: 'LON', name: 'LONDON ALL AIRPORTS', city: 'LONDON', country: 'UNITED KINGDOM', countryCode: 'GB' },
  { code: 'MAN', name: 'MANCHESTER AIRPORT', city: 'MANCHESTER', country: 'UNITED KINGDOM', countryCode: 'GB' },
  { code: 'DOH', name: 'HAMAD INTL AIRPORT', city: 'DOHA', country: 'QATAR', countryCode: 'QA' },
  { code: 'DXB', name: 'DUBAI INTL AIRPORT', city: 'DUBAI', country: 'UNITED ARAB EMIRATES', countryCode: 'AE', terminal: '3' },
  { code: 'AUH', name: 'ZAYED INTL AIRPORT', city: 'ABU DHABI', country: 'UNITED ARAB EMIRATES', countryCode: 'AE' },
  { code: 'SHJ', name: 'SHARJAH INTL AIRPORT', city: 'SHARJAH', country: 'UNITED ARAB EMIRATES', countryCode: 'AE' },
  { code: 'JFK', name: 'JOHN F KENNEDY INTL', city: 'NEW YORK', country: 'UNITED STATES', countryCode: 'US', terminal: '4' },
  { code: 'EWR', name: 'NEWARK LIBERTY INTL', city: 'NEW YORK', country: 'UNITED STATES', countryCode: 'US' },
  { code: 'NYC', name: 'NEW YORK ALL AIRPORTS', city: 'NEW YORK', country: 'UNITED STATES', countryCode: 'US' },
  { code: 'YYZ', name: 'TORONTO PEARSON INTL', city: 'TORONTO', country: 'CANADA', countryCode: 'CA' },
  { code: 'YVR', name: 'VANCOUVER INTL', city: 'VANCOUVER', country: 'CANADA', countryCode: 'CA' },
  { code: 'SIN', name: 'CHANGI AIRPORT', city: 'SINGAPORE', country: 'SINGAPORE', countryCode: 'SG', terminal: '1' },
  { code: 'BKK', name: 'SUVARNABHUMI AIRPORT', city: 'BANGKOK', country: 'THAILAND', countryCode: 'TH' },
  { code: 'KUL', name: 'KUALA LUMPUR INTL', city: 'KUALA LUMPUR', country: 'MALAYSIA', countryCode: 'MY', terminal: '1' },
  { code: 'JED', name: 'KING ABDULAZIZ INTL', city: 'JEDDAH', country: 'SAUDI ARABIA', countryCode: 'SA' },
  { code: 'MED', name: 'PRINCE MOHAMMAD INTL', city: 'MADINAH', country: 'SAUDI ARABIA', countryCode: 'SA' },
  { code: 'RUH', name: 'KING KHALID INTL', city: 'RIYADH', country: 'SAUDI ARABIA', countryCode: 'SA' },
  { code: 'DMM', name: 'KING FAHD INTL', city: 'DAMMAM', country: 'SAUDI ARABIA', countryCode: 'SA' },
  { code: 'IST', name: 'ISTANBUL AIRPORT', city: 'ISTANBUL', country: 'TURKEY', countryCode: 'TR' },
  { code: 'SAW', name: 'SABIHA GOKCEN INTL', city: 'ISTANBUL', country: 'TURKEY', countryCode: 'TR' },
  { code: 'CDG', name: 'CHARLES DE GAULLE', city: 'PARIS', country: 'FRANCE', countryCode: 'FR' },
  { code: 'FRA', name: 'FRANKFURT AIRPORT', city: 'FRANKFURT', country: 'GERMANY', countryCode: 'DE' },
  { code: 'AMS', name: 'SCHIPHOL AIRPORT', city: 'AMSTERDAM', country: 'NETHERLANDS', countryCode: 'NL' },
  { code: 'FCO', name: 'FIUMICINO AIRPORT', city: 'ROME', country: 'ITALY', countryCode: 'IT' },
  { code: 'MXP', name: 'MALPENSA AIRPORT', city: 'MILAN', country: 'ITALY', countryCode: 'IT' },
  { code: 'DEL', name: 'INDIRA GANDHI INTL', city: 'DELHI', country: 'INDIA', countryCode: 'IN' },
  { code: 'BOM', name: 'CHHATRAPATI SHIVAJI INTL', city: 'MUMBAI', country: 'INDIA', countryCode: 'IN' },
  { code: 'CCU', name: 'NETAJI SUBHASH CHANDRA BOSE INTL', city: 'KOLKATA', country: 'INDIA', countryCode: 'IN' },
  { code: 'MAA', name: 'CHENNAI INTL', city: 'CHENNAI', country: 'INDIA', countryCode: 'IN' },
  { code: 'KWI', name: 'KUWAIT INTL', city: 'KUWAIT', country: 'KUWAIT', countryCode: 'KW' },
  { code: 'BAH', name: 'BAHRAIN INTL', city: 'BAHRAIN', country: 'BAHRAIN', countryCode: 'BH' },
  { code: 'MCT', name: 'MUSCAT INTL', city: 'MUSCAT', country: 'OMAN', countryCode: 'OM' },
  { code: 'SYD', name: 'KINGSFORD SMITH', city: 'SYDNEY', country: 'AUSTRALIA', countryCode: 'AU' },
  { code: 'MEL', name: 'MELBOURNE AIRPORT', city: 'MELBOURNE', country: 'AUSTRALIA', countryCode: 'AU' },
  { code: 'CAN', name: 'BAI processes', city: 'GUANGZHOU', country: 'CHINA', countryCode: 'CN' },
  { code: 'HKG', name: 'HONG KONG INTL', city: 'HONG KONG', country: 'HONG KONG', countryCode: 'HK' },
  { code: 'NRT', name: 'NARITA INTL', city: 'TOKYO', country: 'JAPAN', countryCode: 'JP' },
  { code: 'ICN', name: 'INCHEON INTL', city: 'SEOUL', country: 'SOUTH KOREA', countryCode: 'KR' },
];

export const AIRLINES: AirlineInfo[] = [
  { code: 'QR', numericCode: '157', name: 'QATAR AIRWAYS', country: 'QATAR' },
  { code: 'EK', numericCode: '176', name: 'EMIRATES', country: 'UNITED ARAB EMIRATES' },
  { code: 'BG', numericCode: '997', name: 'BIMAN BANGLADESH AIRLINES', country: 'BANGLADESH' },
  { code: 'BS', numericCode: '852', name: 'US-BANGLA AIRLINES', country: 'BANGLADESH' },
  { code: 'VQ', numericCode: '907', name: 'NOVOAIR', country: 'BANGLADESH' },
  { code: 'J9', numericCode: '202', name: 'JAZEERA AIRWAYS', country: 'KUWAIT' },
  { code: 'BA', numericCode: '125', name: 'BRITISH AIRWAYS', country: 'UNITED KINGDOM' },
  { code: 'TK', numericCode: '235', name: 'TURKISH AIRLINES', country: 'TURKEY' },
  { code: 'SV', numericCode: '065', name: 'SAUDIA', country: 'SAUDI ARABIA' },
  { code: 'SQ', numericCode: '618', name: 'SINGAPORE AIRLINES', country: 'SINGAPORE' },
  { code: 'KU', numericCode: '229', name: 'KUWAIT AIRWAYS', country: 'KUWAIT' },
  { code: 'GF', numericCode: '072', name: 'GULF AIR', country: 'BAHRAIN' },
  { code: 'WY', numericCode: '910', name: 'OMAN AIR', country: 'OMAN' },
  { code: 'EY', numericCode: '607', name: 'ETIHAD AIRWAYS', country: 'UNITED ARAB EMIRATES' },
  { code: 'FZ', numericCode: '141', name: 'FLYDUBAI', country: 'UNITED ARAB EMIRATES' },
  { code: 'G9', numericCode: '514', name: 'AIR ARABIA', country: 'UNITED ARAB EMIRATES' },
  { code: 'MH', numericCode: '232', name: 'MALAYSIA AIRLINES', country: 'MALAYSIA' },
  { code: 'TG', numericCode: '217', name: 'THAI AIRWAYS', country: 'THAILAND' },
  { code: 'AI', numericCode: '098', name: 'AIR INDIA', country: 'INDIA' },
  { code: '6E', numericCode: '312', name: 'INDIGO', country: 'INDIA' },
  { code: 'LH', numericCode: '220', name: 'LUFTHANSA', country: 'GERMANY' },
  { code: 'AF', numericCode: '057', name: 'AIR FRANCE', country: 'FRANCE' },
  { code: 'KL', numericCode: '074', name: 'KLM ROYAL DUTCH AIRLINES', country: 'NETHERLANDS' },
  { code: 'AC', numericCode: '014', name: 'AIR CANADA', country: 'CANADA' },
  { code: 'AA', numericCode: '001', name: 'AMERICAN AIRLINES', country: 'UNITED STATES' },
  { code: 'UA', numericCode: '016', name: 'UNITED AIRLINES', country: 'UNITED STATES' },
  { code: 'DL', numericCode: '006', name: 'DELTA AIR LINES', country: 'UNITED STATES' },
  { code: 'CX', numericCode: '160', name: 'CATHAY PACIFIC', country: 'HONG KONG' },
  { code: 'MS', numericCode: '077', name: 'EGYPTAIR', country: 'EGYPT' },
  { code: 'ET', numericCode: '071', name: 'ETHIOPIAN AIRLINES', country: 'ETHIOPIA' },
];

export const COUNTRIES: CountryInfo[] = [
  { code: 'BD', name: 'BANGLADESH' },
  { code: 'CA', name: 'CANADA' },
  { code: 'US', name: 'UNITED STATES' },
  { code: 'GB', name: 'UNITED KINGDOM' },
  { code: 'QA', name: 'QATAR' },
  { code: 'AE', name: 'UNITED ARAB EMIRATES' },
  { code: 'SA', name: 'SAUDI ARABIA' },
  { code: 'IN', name: 'INDIA' },
  { code: 'MY', name: 'MALAYSIA' },
  { code: 'SG', name: 'SINGAPORE' },
  { code: 'TH', name: 'THAILAND' },
  { code: 'TR', name: 'TURKEY' },
  { code: 'KW', name: 'KUWAIT' },
  { code: 'BH', name: 'BAHRAIN' },
  { code: 'OM', name: 'OMAN' },
  { code: 'AU', name: 'AUSTRALIA' },
  { code: 'FR', name: 'FRANCE' },
  { code: 'DE', name: 'GERMANY' },
  { code: 'IT', name: 'ITALY' },
  { code: 'NL', name: 'NETHERLANDS' },
  { code: 'ES', name: 'SPAIN' },
  { code: 'CH', name: 'SWITZERLAND' },
  { code: 'JP', name: 'JAPAN' },
  { code: 'CN', name: 'CHINA' },
  { code: 'KR', name: 'SOUTH KOREA' },
  { code: 'EG', name: 'EGYPT' },
];

export const AIRCRAFT: AircraftInfo[] = [
  { code: '77W', name: 'BOEING 777-300ER', category: 'WIDEBODY TWIN JET' },
  { code: '777', name: 'BOEING 777 ALL SERIES', category: 'WIDEBODY TWIN JET' },
  { code: '788', name: 'BOEING 787-8 DREAMLINER', category: 'WIDEBODY TWIN JET' },
  { code: '789', name: 'BOEING 787-9 DREAMLINER', category: 'WIDEBODY TWIN JET' },
  { code: '78X', name: 'BOEING 787-10 DREAMLINER', category: 'WIDEBODY TWIN JET' },
  { code: '738', name: 'BOEING 737-800', category: 'NARROWBODY TWIN JET' },
  { code: '739', name: 'BOEING 737-900', category: 'NARROWBODY TWIN JET' },
  { code: '744', name: 'BOEING 747-400 PASSENGER', category: 'WIDEBODY FOUR JET' },
  { code: '359', name: 'AIRBUS A350-900', category: 'WIDEBODY TWIN JET' },
  { code: '351', name: 'AIRBUS A350-1000', category: 'WIDEBODY TWIN JET' },
  { code: '380', name: 'AIRBUS A380-800', category: 'DOUBLE DECK WIDEBODY FOUR JET' },
  { code: '333', name: 'AIRBUS A330-300', category: 'WIDEBODY TWIN JET' },
  { code: '332', name: 'AIRBUS A330-200', category: 'WIDEBODY TWIN JET' },
  { code: '320', name: 'AIRBUS A320 SHARLET/NEO', category: 'NARROWBODY TWIN JET' },
  { code: '321', name: 'AIRBUS A321 NEO/LR', category: 'NARROWBODY TWIN JET' },
  { code: 'AT7', name: 'ATR 72-600', category: 'TWIN TURBOPROP' },
  { code: 'DH4', name: 'DASH 8-Q400', category: 'TWIN TURBOPROP' },
];
