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
      command: 'AN20MAYDACLHR/AQR',
      syntax: 'AN<DATE><DEP><ARR>/A<AIRLINE>',
      description: 'Displays multi-column seat availability for Qatar Airways from Dhaka to London.',
    },
    {
      step: 2,
      title: 'Flight Details / Planned Info',
      command: 'DO1',
      syntax: 'DO<LINE_NO>',
      description: 'Displays planned flight details, operating aircraft, terminals, and carbon emissions.',
    },
    {
      step: 3,
      title: 'Sell Seat / Book Segment',
      command: 'SS1Y1',
      syntax: 'SS<SEATS><CLASS><LINE_NO>',
      description: 'Sells 1 seat in Economy (Y class) from line 1 of the availability display.',
    },
    {
      step: 4,
      title: 'Passenger Name Element',
      command: 'NM1ISLAM/MOHAMMAD MR',
      syntax: 'NM1<SURNAME>/<FIRSTNAME> <TITLE>',
      description: 'Adds an adult passenger to the working PNR buffer.',
    },
    {
      step: 5,
      title: 'Contact Information',
      command: 'AP +8801700000000',
      syntax: 'AP <PHONE/EMAIL>',
      description: 'Adds agency contact phone number or email to the reservation.',
    },
    {
      step: 6,
      title: 'Ticketing Arrangement',
      command: 'TKOK',
      syntax: 'TKOK or TKTL<DATE>',
      description: 'Sets the ticketing status to OK or sets a ticket time limit.',
    },
    {
      step: 7,
      title: 'Received From Element',
      command: 'RF PASSPORT',
      syntax: 'RF <CALLER_NAME>',
      description: 'Records who requested the reservation action.',
    },
    {
      step: 8,
      title: 'End and Retrieve (PNR Generation)',
      command: 'ER',
      syntax: 'ER or ET',
      description: 'Finalizes the booking and generates the 6-character Amadeus Record Locator (e.g. X7K9LP).',
    },
    {
      step: 9,
      title: 'Price Itinerary & Create TST',
      command: 'FXP',
      syntax: 'FXP (Store) or FXX (Quote)',
      description: 'Calculates base fare, airport taxes, fuel surcharges, and creates the TST fare breakdown.',
    },
    {
      step: 10,
      title: 'Issue Electronic Ticket',
      command: 'TTP',
      syntax: 'TTP or TTP/RT',
      description: 'Issues an official 13-digit e-ticket (e.g. 157-2489201948) and updates PNR to TKT ISSUED / OK.',
    },
  ];

  const helperCommands = [
    { cmd: 'RT', desc: 'Retrieve current working PNR' },
    { cmd: 'IG', desc: 'Ignore & reset to empty working buffer' },
    { cmd: 'CLEAR', desc: 'Wipe terminal display clean (or CLS)' },
    { cmd: 'XI', desc: 'Cancel all flight segments in PNR' },
    { cmd: 'DAC DAC', desc: 'Decode airport code (Dhaka Hazrat Shahjalal)' },
    { cmd: 'DAC LHR', desc: 'Decode airport code (London Heathrow)' },
    { cmd: 'DNA QR', desc: 'Decode airline code (Qatar Airways 157)' },
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
