export interface FlightOption {
  lineNum: number;
  flight1: {
    airline: string;
    flightNumber: string;
    classes1: string;
    classes2?: string;
    origin: string;
    originTerm?: string;
    destination: string;
    destTerm?: string;
    depTime: string;
    arrTime: string;
    equip: string;
  };
  flight2?: {
    airline: string;
    flightNumber: string;
    codeshare?: string;
    classes1: string;
    classes2?: string;
    origin: string;
    originTerm?: string;
    destination: string;
    destTerm?: string;
    depTime: string;
    arrTime: string;
    equip: string;
    elapsedTime?: string;
  };
}

export const QR_DAC_LHR_MOCK: FlightOption[] = [
  {
    lineNum: 1,
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
  },
  {
    lineNum: 2,
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
  },
  {
    lineNum: 3,
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
  },
  {
    lineNum: 4,
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
  },
];
