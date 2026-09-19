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
  dob?: string;
  associatedWithPaxId?: number; // e.g. infant tied to adult P1
  ticketNumber?: string;
}

export interface SsrItem {
  id: number;
  type: 'DOCS' | 'CTCE' | 'CTCM' | 'DOCO' | 'DOCA' | 'MOML' | 'VGML' | 'MAAS' | 'WCHR' | 'OTHER';
  code: string;
  airline?: string;
  status: string; // e.g. "HK1"
  text: string;
  paxRef?: string; // e.g. "P1"
}

export interface FareSearchFlight {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  date: string;
  depTime: string;
  arrTime: string;
  bookingClass: string;
  equip: string;
  terminal?: string;
}

export interface FareSearchOption {
  optionNumber: number;
  airline: string;
  flights: FareSearchFlight[];
  fareBasis: string;
  currency: string;
  baseFare: number;
  taxes: number;
  totalFare: number;
  paxCount: {
    adt: number;
    chd: number;
    inf: number;
  };
}

export interface AvailabilityFlightLeg {
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
}

export interface AvailabilityOption {
  lineNum: number;
  date: string;
  flight1: AvailabilityFlightLeg;
  flight2?: AvailabilityFlightLeg;
}

export interface TicketSaleRecord {
  ticketNumber: string;
  pnrLocator: string;
  passengerName: string;
  airline: string;
  issueDate: string;
  officeId: string;
  grossFare: number;
  tax: number;
  commissionPct: number;
  commissionAmount: number;
  netPayable: number;
  formOfPayment: string;
  status: 'OK' | 'VOID';
  itinerarySummary: string;
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
  ssrs: SsrItem[];
  isTicketed: boolean;
  ticketNumbers: string[];
  voidTickets?: string[];
  commission?: string;
  formOfPayment?: string;
  sharedWithOffices?: string[];
  splitPassengerBuffer?: Passenger[];
  pricing?: {
    baseFare: number;
    taxes: number;
    total: number;
    currency: string;
    fareBasis: string;
    paxBreakdown?: string;
  };
  lastAvailability?: AvailabilityOption[];
  lastFareSearch?: FareSearchOption[];
}

export interface ItrFlightSegment {
  segNum: string;
  airline: string;
  airlineName: string;
  flightNumber: string;
  bookingClass: string;
  date: string;
  origin: string;
  originName: string;
  originTerminal?: string;
  destination: string;
  destName: string;
  destTerminal?: string;
  depTime: string;
  arrTime: string;
  status: string;
  nvb: string;
  nva: string;
  baggage: string;
  equip?: string;
}

export interface ItrReceiptData {
  ticketNumber: string;
  pnrLocator: string;
  airlineLocator: string;
  passengerName: string;
  paxType?: string;
  issuingAirline: string;
  issuingAirlineName: string;
  issuingAirlineNumeric: string;
  issuingAgent: string;
  officeId: string;
  iataNumber: string;
  issueDate: string;
  segments: ItrFlightSegment[];
  baseFare: number;
  tax: number;
  totalFare: number;
  currency: string;
  formOfPayment: string;
  fareBasis: string;
  fareCalculation: string;
  endorsements: string;
  commission?: string;
}

export interface TerminalOutputItem {
  id: string;
  type: 'command' | 'response' | 'error' | 'planned_info';
  content: string;
  rawHtml?: boolean;
  isItr?: boolean;
  itrData?: ItrReceiptData;
}

export interface CommandPageTab {
  id: string;
  title: string;
  pageNumber: number;
  outputs: TerminalOutputItem[];
  commandHistory: string[];
}
