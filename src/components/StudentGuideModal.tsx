import React from 'react';
import { X, Play, BookOpen, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';

interface StudentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (cmd: string) => void;
}

interface StepItem {
  step: number;
  title: string;
  command: string;
  description: string;
  syntax: string;
}

export const StudentGuideModal: React.FC<StudentGuideModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  if (!isOpen) return null;

  const trainingSteps: StepItem[] = [
    {
      step: 1,
      title: 'Flight Availability',
      command: 'AN30SEPDACLHR/AQR',
      syntax: 'AN<DATE><DEP><ARR>/A<AIRLINE>',
      description: 'Displays multi-column seat availability for Qatar Airways from Dhaka to London.',
    },
    {
      step: 2,
      title: 'Lowest Fare Search (Best Buy)',
      command: 'FXDDAC/D20NOVJFK//AQR',
      syntax: 'FXD<ORIG>/D<DATE><DEST>[//A<AIRLINE>]',
      description: 'Finds the lowest priced fares and combinations across airlines with option numbers.',
    },
    {
      step: 3,
      title: 'Book Lowest Fare Option',
      command: 'FXZ1',
      syntax: 'FXZ<OPTION_NO>',
      description: 'Instantly books Option 01 from the Lowest Fare Search results and creates stored TST.',
    },
    {
      step: 4,
      title: 'Passenger Name Element',
      command: 'NM1HOSSAIN/ABUL MR',
      syntax: 'NM1<SURNAME>/<FIRSTNAME> <TITLE>',
      description: 'Adds an adult passenger to the working PNR buffer.',
    },
    {
      step: 5,
      title: 'Passport Details (SSR DOCS)',
      command: 'SRDOCS HK1-P-BD-EF0123456-BD-10FEB95-M-18NOV25-HOSSAIN/ABUL/P1',
      syntax: 'SRDOCS HK1-P-<ISSUE_CTY>-<NUM>-<NAT>-<DOB>-<G>-<EXP>-<NAME>/P1',
      description: 'Transmits mandatory passport information to the operating airline.',
    },
    {
      step: 6,
      title: 'Passenger Contact (SSR CTCE/CTCM)',
      command: 'SR CTCE HK1-ABCD//GMAIL.COM/P1',
      syntax: 'SR CTCE HK1-<EMAIL>/P1 (use // for @)',
      description: 'Transmits passenger email address to the operating airline.',
    },
    {
      step: 7,
      title: 'Agency Contact Information',
      command: 'AP SHOHOJ 01958658524 REF KARIM',
      syntax: 'AP <AGENCY_NAME_PHONE>',
      description: 'Adds agency contact phone number or email to the reservation.',
    },
    {
      step: 8,
      title: 'Ticketing Arrangement',
      command: 'TKOK',
      syntax: 'TKOK or TKTL<DATE>',
      description: 'Sets the ticketing status to OK or sets a ticket time limit.',
    },
    {
      step: 9,
      title: 'Received From & Save (Chained Command)',
      command: 'RF KARIM;ER',
      syntax: 'RF <CALLER_NAME>;ER',
      description: 'Chains Received From and End-Retrieve to generate the 6-character PNR locator.',
    },
    {
      step: 10,
      title: 'Price Itinerary & Create TST',
      command: 'FXP',
      syntax: 'FXP (Store) or FXX (Quote)',
      description: 'Calculates base fare, airport taxes, fuel surcharges, and creates the TST fare breakdown.',
    },
    {
      step: 11,
      title: 'Issue Electronic Ticket',
      command: 'TTP',
      syntax: 'TTP or TTP/RT',
      description: 'Issues an official 13-digit e-ticket (e.g. 157-2489201948) and updates PNR to TKT ISSUED / OK.',
    },
    {
      step: 12,
      title: 'Print / Download Itinerary Receipt',
      command: 'ITR',
      syntax: 'ITR or ITR/P1',
      description: 'Generates official Amadeus Passenger Itinerary & Receipt and triggers print / PDF download.',
    },
    {
      step: 13,
      title: 'Email E-Ticket Receipt to Client',
      command: 'ITR-EML-CLIENT@GMAIL.COM',
      syntax: 'ITR-EML-<EMAIL> or IEPJ-EML-<EMAIL>',
      description: 'Dispatches the official electronic ticket receipt directly to the passenger email.',
    },
  ];

  const helperCommands = [
    { cmd: 'ITR', desc: 'Display & download/print e-ticket receipt' },
    { cmd: 'ITR-EML-CLIENT@GMAIL.COM', desc: 'Email e-ticket receipt to passenger' },
    { cmd: 'IEPJ-EML-CLIENT@GMAIL.COM', desc: 'Email flight itinerary to passenger' },
    { cmd: 'TN20SEPDACSIN/ABG', desc: 'Timetable schedule search (TN)' },
    { cmd: 'FQDDACJFK/AEK/IO/D15MAY22', desc: 'Fare quote displayDAC-JFK (FQD)' },
    { cmd: 'FQN01', desc: 'Fare rules & penalty notes (FQN)' },
    { cmd: 'FQC100USD/BDT', desc: 'Currency rate conversion (FQC)' },
    { cmd: 'FXR', desc: 'Best buy quote without rebooking' },
    { cmd: 'FXB', desc: 'Best buy rebook to lowest class' },
    { cmd: 'TQT', desc: 'Display stored TST fare record' },
    { cmd: 'TTE', desc: 'Delete stored TST from work area' },
    { cmd: 'TJQ', desc: 'Daily TINS sales report query' },
    { cmd: 'TWD', desc: 'Electronic ticket display mask' },
    { cmd: 'TRDC', desc: 'Void/cancel issued e-ticket' },
    { cmd: 'FM7', desc: 'Store 7% agency commission' },
    { cmd: 'FP IN VAGT*SHOHOJ', desc: 'Store Form of Payment (FP)' },
    { cmd: 'ESDACVS12XY-B', desc: 'Bridge & share PNR with office' },
    { cmd: 'RRP', desc: 'Copy passenger data to new PNR' },
    { cmd: 'SP1', desc: 'Split/divide passenger 1 from PNR' },
    { cmd: 'EF', desc: 'End and file divided split PNR' },
    { cmd: 'SBY2', desc: 'Modify segment 2 class to Y' },
    { cmd: 'FFNEK-1234567/P1', desc: 'Frequent flyer number for Pax 1' },
    { cmd: 'RT', desc: 'Retrieve current working PNR' },
    { cmd: 'IG', desc: 'Ignore & reset to empty working buffer' },
    { cmd: 'CLEAR', desc: 'Wipe terminal display clean (or CLS)' },
    { cmd: 'XI', desc: 'Cancel all flight segments in PNR' },
    { cmd: 'DANDHAKA', desc: 'Encode city to airport code (DAC)' },
    { cmd: 'DACDAC', desc: 'Decode airport code (Dhaka Hazrat Shahjalal)' },
    { cmd: 'DNAQR', desc: 'Decode airline code (Qatar Airways 157)' },
    { cmd: 'DNAQATAR', desc: 'Encode airline name to QR' },
    { cmd: 'DCCANADA', desc: 'Encode country name to code (CA)' },
    { cmd: 'DNE777', desc: 'Decode Boeing 777 aircraft specs' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      id="student-guide-modal-overlay"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[4px] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-[#005eb8]/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="student-guide-card"
      >
        {/* Modal Header */}
        <div className="bg-[#051336] text-white px-5 py-3 flex items-center justify-between border-b border-[#132c66]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#005eb8] flex items-center justify-center text-xs">
              👩‍💼
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">
                Amadeus Airline Ticketing Training Guide
              </h3>
              <p className="text-[11px] text-[#8ea8df]">
                Step-by-step Standard GDS Reservation & Ticketing Workflow
              </p>
            </div>
          </div>
          <button
            id="close-guide-modal-btn"
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-[#222222]">
          {/* Quick Notice */}
          <div className="bg-[#eef5fc] border-l-3 border-[#005eb8] p-3 rounded-xs flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-[#005eb8] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#1c3e6b] leading-relaxed">
              <strong>Interactive Practice:</strong> Click the blue <strong>"Run Command"</strong> button on any step below to test it directly inside the terminal console, or type it manually into the prompt.
            </div>
          </div>

          {/* Workflow Steps */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#005eb8] mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Standard PNR Lifecycle (10 Core Steps)</span>
            </h4>

            <div className="space-y-2.5">
              {trainingSteps.map((item) => (
                <div
                  key={item.step}
                  className="border border-[#e1e7f0] rounded-[3px] p-2.5 bg-[#fdfdfd] hover:bg-[#f7faff] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="w-5 h-5 rounded-full bg-[#005eb8] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <div>
                        <div className="font-semibold text-[#111111] flex items-center gap-2">
                          <span>{item.title}</span>
                          <span className="text-[10px] font-mono text-[#666666] bg-[#f0f0f0] px-1.5 py-0.2 rounded-xs">
                            {item.syntax}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#555555] mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onExecuteCommand(item.command);
                        onClose();
                      }}
                      className="bg-[#005eb8] hover:bg-[#00478c] text-white text-[11px] px-2.5 py-1 rounded-[2px] font-mono font-medium shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                      title={`Run ${item.command}`}
                    >
                      <span>{item.command}</span>
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auxiliary Commands */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#444444] mb-2">
              Helpful Auxiliary GDS Commands
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {helperCommands.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-[#f8f9fc] border border-[#e4e8f0] rounded-[2px]"
                >
                  <div>
                    <span className="font-mono font-bold text-[#005eb8] text-[11px]">{h.cmd}</span>
                    <div className="text-[10px] text-[#666666]">{h.desc}</div>
                  </div>
                  <button
                    onClick={() => {
                      onExecuteCommand(h.cmd);
                      onClose();
                    }}
                    className="text-[#005eb8] hover:underline text-[10px] font-medium"
                  >
                    Run
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f2f5f9] px-5 py-2.5 border-t border-[#d8e2ee] flex items-center justify-between text-xs text-[#666666]">
          <span>Amadeus Selling Platform Connect • Training Edition</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-gray-100 border border-[#c4cdd5] rounded-[2px] text-xs text-[#333333] cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
