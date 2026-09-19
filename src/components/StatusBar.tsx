import React from 'react';
import { ChevronUp, Monitor, Info, Plus } from 'lucide-react';
import { CommandPageTab } from '../types';

interface StatusBarProps {
  officeId: string;
  tabs: CommandPageTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onNewTab: () => void;
  onOpenHelp: () => void;
  isHelpOpen: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  officeId,
  tabs,
  activeTabId,
  onSelectTab,
  onNewTab,
  onOpenHelp,
  isHelpOpen,
}) => {
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className="h-[30px] bg-[#e6edf5] border-t border-[#c8d4e5] flex items-center justify-between px-2 sm:px-3 text-[11px] text-[#334460] select-none z-20 overflow-x-auto" id="amadeus-bottom-status-bar">
      {/* Left Tabs: Main Page & Dynamic Command Page tabs */}
      <div className="flex items-center h-full space-x-1 shrink-0">
        {/* Main Page Tab */}
        <button
          id="status-main-page-tab"
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 h-[24px] hover:bg-[#d5e0ee] text-[#294266] rounded-t-xs transition-colors cursor-pointer"
          title="Amadeus System Status & Guide"
        >
          <Info className="w-3 h-3 text-[#005eb8]" />
          <span className="hidden xs:inline">Main Page</span>
        </button>

        {/* Dynamic Command Page Tabs in bottom bar */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1 px-2 sm:px-2.5 h-[26px] rounded-t-xs transition-colors cursor-pointer ${
                isActive
                  ? 'bg-white border-t-2 border-t-[#005eb8] border-x border-[#c8d4e5] text-[#111111] font-semibold shadow-2xs'
                  : 'hover:bg-[#d5e0ee] text-[#445876]'
              }`}
            >
              <Monitor className={`w-3 h-3 ${isActive ? 'text-[#005eb8]' : 'text-[#6b7f9d]'}`} />
              <span className="whitespace-nowrap">{tab.title}</span>
            </button>
          );
        })}

        {/* Quick add tab from status bar */}
        <button
          onClick={onNewTab}
          className="p-1 hover:bg-[#d5e0ee] text-[#005eb8] rounded-xs transition-colors cursor-pointer"
          title="New Command Page"
        >
          <Plus className="w-3 h-3 font-bold" />
        </button>
      </div>

      {/* Right Side: 4505 input | Line 1 Column 1 | Hi, can I help you? | Office ID */}
      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0 pl-2">
        {/* Terminal buffer position */}
        <div className="hidden md:block text-[#576b88] font-mono text-[10px]" id="status-terminal-position">
          4505 input | Page: {activeTab?.pageNumber || 1} | Line: 1 | Column: 1
        </div>

        {/* Student Learning Assistant Toggle: "Hi, can I help you ?" */}
        <button
          id="status-help-assistant-btn"
          onClick={onOpenHelp}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] transition-colors cursor-pointer whitespace-nowrap ${
            isHelpOpen
              ? 'bg-[#005eb8] text-white'
              : 'bg-[#d2e0f2] hover:bg-[#c0d4ec] text-[#00478c] font-medium'
          }`}
          title="Open Amadeus Airline Ticketing Training Guide"
        >
          {/* Avatar representation matching reference screenshot */}
          <div className="w-4 h-4 rounded-full bg-[#005eb8] text-white flex items-center justify-center text-[9px] font-bold overflow-hidden">
            <span>👩‍💼</span>
          </div>
          <span className="text-[11px] font-medium hidden sm:inline">Hi, can I help you ?</span>
          <span className="text-[11px] font-medium inline sm:hidden">Help</span>
          <ChevronUp className={`w-3 h-3 transition-transform ${isHelpOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Office ID */}
        <div className="text-[#1a2e4c] font-medium pl-1 whitespace-nowrap" id="status-office-id-display">
          Office ID: <span className="font-semibold text-[#005eb8]">{officeId || 'DAC360'}</span>
        </div>
      </div>
    </div>
  );
};
