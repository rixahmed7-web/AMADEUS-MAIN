import React from 'react';
import { PnrSession } from '../types';
import { Plane, User, Phone, CheckCircle, Ticket, DollarSign, X } from 'lucide-react';

interface PnrOverviewPanelProps {
  session: PnrSession;
  onClose: () => void;
  onExecuteCommand: (cmd: string) => void;
}

export const PnrOverviewPanel: React.FC<PnrOverviewPanelProps> = ({
  session,
  onClose,
  onExecuteCommand,
}) => {
  return (
    <div className="w-full md:w-[380px] lg:w-[420px] bg-[#f8fafc] border-l border-[#c8d4e5] flex flex-col h-full overflow-hidden text-xs select-none" id="pnr-overview-panel">
      {/* Header */}
      <div className="bg-[#e2ebf6] px-4 py-2.5 border-b border-[#c8d4e5] flex items-center justify-between">
        <div>
          <div className="font-bold text-[#102a5c] flex items-center gap-2">
            <span>PNR Work Area Inspection</span>
            {session.pnrLocator ? (
              <span className="bg-[#005eb8] text-white px-2 py-0.5 rounded-xs font-mono font-bold text-[11px]">
                {session.pnrLocator}
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-xs text-[10px] font-medium">
                Buffer (Unsaved)
              </span>
            )}
          </div>
          <div className="text-[10px] text-[#556987]">
            Office ID: {session.officeId} • Duty: {session.agentDuty}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#d0deee] rounded-xs text-gray-500 hover:text-gray-800 transition-colors"
          title="Close Inspection Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Tracker */}
        <div className="bg-white p-3 rounded-[3px] border border-[#d8e3f0] shadow-2xs">
          <div className="font-semibold text-[#1e293b] mb-2 text-[11px] uppercase tracking-wider">
            Mandatory PNR Elements Status
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  session.passengers.length > 0 ? 'bg-emerald-500' : 'bg-rose-400'
                }`}
              />
              <span className={session.passengers.length > 0 ? 'text-gray-800' : 'text-gray-400'}>
                1. Name (NM)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  session.segments.length > 0 ? 'bg-emerald-500' : 'bg-rose-400'
                }`}
              />
              <span className={session.segments.length > 0 ? 'text-gray-800' : 'text-gray-400'}>
                2. Itinerary (SS)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  session.contacts.length > 0 ? 'bg-emerald-500' : 'bg-rose-400'
                }`}
              />
              <span className={session.contacts.length > 0 ? 'text-gray-800' : 'text-gray-400'}>
                3. Contact (AP)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  session.ticketingArrangement ? 'bg-emerald-500' : 'bg-rose-400'
                }`}
              />
              <span className={session.ticketingArrangement ? 'text-gray-800' : 'text-gray-400'}>
                4. Ticketing (TK)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  session.receivedFrom ? 'bg-emerald-500' : 'bg-rose-400'
                }`}
              />
              <span className={session.receivedFrom ? 'text-gray-800' : 'text-gray-400'}>
                5. Received (RF)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  session.pnrLocator ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              />
              <span className={session.pnrLocator ? 'text-gray-800' : 'text-gray-400'}>
                6. Saved (ER)
              </span>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="bg-white p-3 rounded-[3px] border border-[#d8e3f0] shadow-2xs">
          <div className="font-semibold text-[#1e293b] mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#005eb8]" />
            <span>Passenger(s) ({session.passengers.length})</span>
          </div>
          {session.passengers.length === 0 ? (
            <div className="text-gray-400 italic text-[11px]">No passenger names entered yet (NM1...).</div>
          ) : (
            <div className="space-y-1 font-mono text-[11px]">
              {session.passengers.map((p) => (
                <div key={p.id} className="p-1 bg-[#f4f7fa] rounded-xs flex items-center justify-between">
                  <span>
                    {p.id}. {p.surname}/{p.firstName} {p.title}
                  </span>
                  <span className="text-[10px] text-gray-500 bg-white px-1 border border-gray-200 rounded-xs">
                    ADT
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flight Segments */}
        <div className="bg-white p-3 rounded-[3px] border border-[#d8e3f0] shadow-2xs">
          <div className="font-semibold text-[#1e293b] mb-2 flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-[#005eb8]" />
            <span>Booked Flights ({session.segments.length})</span>
          </div>
          {session.segments.length === 0 ? (
            <div className="text-gray-400 italic text-[11px]">No segments booked yet (SS1Y1...).</div>
          ) : (
            <div className="space-y-2 font-mono text-[11px]">
              {session.segments.map((s) => (
                <div key={s.segmentNumber} className="p-2 bg-[#f4f7fa] border border-[#e2eaf4] rounded-xs">
                  <div className="font-bold text-[#005eb8] flex items-center justify-between">
                    <span>
                      {s.segmentNumber}. {s.airline} {s.flightNumber}
                    </span>
                    <span className="bg-[#005eb8]/10 text-[#005eb8] px-1 py-0.5 rounded-xs text-[10px]">
                      Class {s.bookingClass} • {s.status}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1 flex items-center justify-between text-[10px]">
                    <span>
                      {s.origin} → {s.destination}
                    </span>
                    <span>
                      {s.date} | {s.depTime} - {s.arrTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fare & Ticketing */}
        <div className="bg-white p-3 rounded-[3px] border border-[#d8e3f0] shadow-2xs">
          <div className="font-semibold text-[#1e293b] mb-2 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#005eb8]" />
            <span>Pricing (TST) & E-Ticket Status</span>
          </div>
          {session.pricing ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>Base Fare:</span>
                <span className="font-mono font-medium">
                  {session.pricing.currency} {session.pricing.baseFare.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>Taxes & Fees:</span>
                <span className="font-mono font-medium">
                  {session.pricing.currency} {session.pricing.taxes.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-1 text-xs">
                <span>Total Amount:</span>
                <span className="font-mono text-[#005eb8]">
                  {session.pricing.currency} {session.pricing.total.toLocaleString()}
                </span>
              </div>

              {session.isTicketed && session.ticketNumbers.length > 0 && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xs text-emerald-800 font-mono text-[11px]">
                  <div className="font-bold flex items-center gap-1 text-emerald-900">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>E-TICKET ISSUED / OK</span>
                  </div>
                  <div className="mt-0.5 text-[10px]">Number: {session.ticketNumbers[0]}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 italic text-[11px]">
              Not priced yet. Enter <span className="font-mono text-gray-600">FXP</span> after booking segments.
            </div>
          )}
        </div>
      </div>

      {/* Footer Quick Actions */}
      <div className="p-3 bg-[#eef3f8] border-t border-[#c8d4e5] flex gap-2">
        <button
          onClick={() => onExecuteCommand('RT')}
          className="flex-1 py-1 px-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-[2px] text-center font-medium text-gray-700"
        >
          RT (Display)
        </button>
        <button
          onClick={() => onExecuteCommand('ER')}
          className="flex-1 py-1 px-2 bg-[#005eb8] hover:bg-[#00478c] text-white rounded-[2px] text-center font-medium"
        >
          ER (Save)
        </button>
        <button
          onClick={() => onExecuteCommand('IG')}
          className="py-1 px-2 bg-white hover:bg-gray-100 border border-red-300 text-red-700 rounded-[2px] text-center font-medium"
        >
          IG
        </button>
      </div>
    </div>
  );
};
