export interface FlightClassAvailability {
  classCode: string;
  seats: string; // e.g. "9", "4", "0", "L"
}

export interface FlightSegmentMock {
  lineNum: number;
  airline: string;
  flightNumber: string;
  classes: string; // e.g. "J9 C9 D9 I9 R9 P9 Y9"
  classesExtra?: string; // e.g. "B9 H9 K9 M9 L9 V9 S9 N9 Q9 T9 O9 W9"
  origin: string;
  originTerminal?: string;
  destination: string;
  destinationTerminal?: string;
  depTime: string;
  arrTime: string;
  equipment: string;
  elapsedTime?: string;
  codeshare?: string; // e.g. "BA:QR9709"
  codeshareClasses?: string;
  operationalInfo?: string;
  plannedInfo?: {
    equip: string;
    totalTime: string;
    depTerminal?: string;
    arrTerminal?: string;
    comments: string[];
    co2Eco: string;
    co2Pre: string;
    config: string;
  };
}

export interface BookedSegment {
  segmentNumber: number;
  airline: string;
  flightNumber: string;
  bookingClass: string;
  date: string;
  origin: string;
  destination: string;
  status: string; // "HK1", "HK2", etc.
  depTime: string;
  arrTime: string;
  dayOfWeek?: number;
}

export interface Passenger {
  id: number;
  surname: string;
  firstName: string;
  title: string;
  type?: 'ADT' | 'CHD' | 'INF';
  ticketNumber?: string;
}

export interface PnrSession {
  pnrLocator: string | null;
  officeId: string;
  agentDuty: string;
  passengers: Passenger[];
  segments: BookedSegment[];
  contacts: string[];
  ticketingArrangement: string | null;
  receivedFrom: string | null;
  isTicketed: boolean;
  ticketNumbers: string[];
  pricing?: {
    baseFare: number;
    taxes: number;
    total: number;
    currency: string;
    fareBasis: string;
  };
}

export interface TerminalOutputItem {
  id: string;
  type: 'command' | 'response' | 'error' | 'planned_info';
  content: string;
  rawHtml?: boolean;
}

export interface CommandPageTab {
  id: string;
  title: string;
  pageNumber: number;
  outputs: TerminalOutputItem[];
  commandHistory: string[];
}
