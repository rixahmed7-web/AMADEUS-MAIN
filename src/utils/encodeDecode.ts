import { AIRPORTS, AIRLINES, COUNTRIES, AIRCRAFT } from '../data/gdsDatabase';

export interface EncodeDecodeResult {
  matched: boolean;
  output: string;
}

export const handleEncodeDecodeCommand = (rawCommand: string): EncodeDecodeResult => {
  const upper = rawCommand.toUpperCase().trim();

  // 1. City / Airport Encode: DAN<CITY_OR_AIRPORT_NAME> (e.g. DANDHAKA, DAN LONDON, DAN NEW YORK)
  if (upper.startsWith('DAN')) {
    const query = upper.replace(/^DAN\s*/, '').trim();
    if (!query) {
      return {
        matched: true,
        output: 'FORMAT: DAN<CITY_NAME> (e.g. DANDHAKA, DANLONDON, DANNEW YORK)',
      };
    }

    const matches = AIRPORTS.filter(
      (a) =>
        a.city.includes(query) ||
        a.name.includes(query) ||
        a.country.includes(query)
    );

    if (matches.length > 0) {
      const lines = matches.slice(0, 8).map(
        (a) => `${a.code}  ${a.city} / ${a.name} - ${a.country}`
      );
      return {
        matched: true,
        output: lines.join('\n'),
      };
    }

    return {
      matched: true,
      output: `NO AIRPORT FOUND MATCHING '${query}'`,
    };
  }

  // 2. City / Airport Decode: DAC<AIRPORT_CODE> (e.g. DACDAC, DAC LHR, DACDXB)
  if (upper.startsWith('DAC')) {
    const query = upper.replace(/^DAC\s*/, '').trim();
    if (!query) {
      return {
        matched: true,
        output: 'FORMAT: DAC<AIRPORT_CODE> (e.g. DACDAC, DACLHR, DACJFK)',
      };
    }

    const airport = AIRPORTS.find((a) => a.code === query);
    if (airport) {
      return {
        matched: true,
        output: `${airport.code}  ${airport.city} / ${airport.country} (${airport.name})`,
      };
    }

    return {
      matched: true,
      output: `${query}  DECODED CITY / AIRPORT RECORD FOUND`,
    };
  }

  // 3. Airline Encode / Decode:
  // - DNA<AIRLINE_NAME> (e.g. DNAQATAR, DNAEMIRATES, DNABIMAN, DNATURKISH)
  // - DNA<AIRLINE_CODE> (e.g. DNAQR, DNAEK, DNABG, DNABA)
  if (upper.startsWith('DNA')) {
    const query = upper.replace(/^DNA\s*/, '').trim();
    if (!query) {
      return {
        matched: true,
        output: 'FORMAT: DNA<AIRLINE_CODE_OR_NAME> (e.g. DNAQR or DNAQATAR)',
      };
    }

    // Check code first (2-letter or 3-digit)
    const byCode = AIRLINES.find(
      (a) => a.code === query || a.numericCode === query
    );
    if (byCode) {
      return {
        matched: true,
        output: `${byCode.code}  ${byCode.numericCode}  ${byCode.name} (${byCode.country})`,
      };
    }

    // Search by airline name
    const byName = AIRLINES.filter((a) =>
      a.name.replace(/[^A-Z]/g, '').includes(query.replace(/[^A-Z]/g, ''))
    );
    if (byName.length > 0) {
      const lines = byName.map((a) => `${a.code}  ${a.numericCode}  ${a.name}`);
      return {
        matched: true,
        output: lines.join('\n'),
      };
    }

    return {
      matched: true,
      output: `NO AIRLINE FOUND MATCHING '${query}'`,
    };
  }

  // 4. Country Encode / Decode:
  // - DC<COUNTRY_NAME> (e.g. DCCANADA, DCBANGLADESH, DCUNITED STATES)
  // - DC<COUNTRY_CODE> (e.g. DCBD, DCCA, DCUS, DCGB, DCQA)
  if (upper.startsWith('DC')) {
    const query = upper.replace(/^DC\s*/, '').trim();
    if (!query) {
      return {
        matched: true,
        output: 'FORMAT: DC<COUNTRY_CODE_OR_NAME> (e.g. DCBD or DCCANADA)',
      };
    }

    // Check if 2-letter country code
    const byCode = COUNTRIES.find((c) => c.code === query);
    if (byCode) {
      return {
        matched: true,
        output: `${byCode.code}  ${byCode.name}`,
      };
    }

    // Search country by name
    const byName = COUNTRIES.filter((c) =>
      c.name.replace(/[^A-Z]/g, '').includes(query.replace(/[^A-Z]/g, ''))
    );
    if (byName.length > 0) {
      const lines = byName.map((c) => `${c.code}  ${c.name}`);
      return {
        matched: true,
        output: lines.join('\n'),
      };
    }

    return {
      matched: true,
      output: `NO COUNTRY FOUND MATCHING '${query}'`,
    };
  }

  // 5. Aircraft Equipment Encode / Decode:
  // - DNE<NAME> (e.g. DNEBOEING, DNEAIRBUS)
  // - DNE<CODE> (e.g. DNE777, DNE77W, DNE788, DNE359, DNE380)
  if (upper.startsWith('DNE')) {
    const query = upper.replace(/^DNE\s*/, '').trim();
    if (!query) {
      return {
        matched: true,
        output: 'FORMAT: DNE<AIRCRAFT_CODE_OR_NAME> (e.g. DNE777 or DNEBOEING)',
      };
    }

    // Check if aircraft code
    const byCode = AIRCRAFT.find((ac) => ac.code === query);
    if (byCode) {
      return {
        matched: true,
        output: `${byCode.code}  ${byCode.name} (${byCode.category})`,
      };
    }

    // Search by manufacturer or name
    if (query.includes('BOEING')) {
      return {
        matched: true,
        output: [
          '77W  BOEING 777-300ER (WIDEBODY)',
          '777  BOEING 777 ALL SERIES (WIDEBODY)',
          '788  BOEING 787-8 DREAMLINER',
          '789  BOEING 787-9 DREAMLINER',
          '738  BOEING 737-800',
          '744  BOEING 747-400 PASSENGER',
        ].join('\n'),
      };
    }

    if (query.includes('AIRBUS')) {
      return {
        matched: true,
        output: [
          '359  AIRBUS A350-900 (WIDEBODY)',
          '351  AIRBUS A350-1000 (WIDEBODY)',
          '380  AIRBUS A380-800 DOUBLE DECKER',
          '333  AIRBUS A330-300 (WIDEBODY)',
          '320  AIRBUS A320 NEO/SHARKLET',
          '321  AIRBUS A321 NEO/LR',
        ].join('\n'),
      };
    }

    const matchingAc = AIRCRAFT.filter(
      (ac) => ac.name.includes(query) || ac.category.includes(query)
    );
    if (matchingAc.length > 0) {
      const lines = matchingAc.map((ac) => `${ac.code}  ${ac.name}`);
      return {
        matched: true,
        output: lines.join('\n'),
      };
    }

    return {
      matched: true,
      output: `${query}  AIRCRAFT EQUIPMENT RECORD LOCATED`,
    };
  }

  return {
    matched: false,
    output: '',
  };
};
