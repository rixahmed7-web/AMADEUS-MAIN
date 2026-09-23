import React, { useState } from 'react';
import {
  Terminal,
  ChevronDown,
  X,
  History,
  Columns,
  Activity,
  Plus,
} from 'lucide-react';
import { CommandPageTab } from '../types';

interface ActionBarProps {
  officeId: string;
  tabs: CommandPageTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onNewTab: () => void;
  onCloseTab: (tabId: string) => void;
  onExecuteAction: (cmd: string) => void;
  onIgnore: () => void;
  onSave: () => void;
  onToggleHistory: () => void;
  onToggleSplit: () => void;
  onOpenHelp: () => void;
  isSplitView: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onNewTab,
  onCloseTab,
  onExecuteAction,
  onIgnore,
  onSave,
  onToggleHistory,
  onToggleSplit,
  onOpenHelp,
  isSplitView,
}) => {
  const [actionInput, setActionInput] = useState('');

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionInput.trim()) return;
    onExecuteAction(actionInput.trim());
    setActionInput('');
  };

  return (
    <div className="bg-[#f0f3f8] border-b border-[#c8d4e5] select-none text-xs flex flex-col shrink-0" id="amadeus-action-bar">
      {/* Top row: New command page button & Action search input & ad notice */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 py-1.5 border-b border-[#dce3ee]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* New Command Page Button */}
          <div className="inline-flex rounded-[3px] shadow-xs shrink-0">
            <button
              id="new-command-page-btn"
              onClick={onNewTab}
              className="bg-[#005eb8] hover:bg-[#004a91] text-white px-2.5 sm:px-3 py-1 text-xs font-medium rounded-l-[3px] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Open a new command page tab"
            >
              <Terminal className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">&gt; New command page</span>
              <span className="inline xs:hidden sm:hidden">&gt; New page</span>
            </button>
            <button
              id="new-command-page-dropdown"
              onClick={onNewTab}
              className="bg-[#00529e] hover:bg-[#003e78] text-white px-1.5 py-1 text-xs rounded-r-[3px] border-l border-[#004382] transition-colors cursor-pointer shrink-0"
              title="New Tab (+)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Input */}
          <form onSubmit={handleActionSubmit} className="flex-1 min-w-[140px] sm:min-w-[200px]">
            <input
              id="action-search-input"
              type="text"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              placeholder="Enter an action (e.g. 'AN30SEPDACLHR' or 'RT')"
              className="w-full h-[28px] px-3 text-xs bg-white text-[#222222] border border-[#b8c7dc] rounded-[3px] focus:outline-none focus:border-[#005eb8] focus:ring-1 focus:ring-[#005eb8] placeholder-[#767676]"
            />
          </form>
        </div>

        {/* Sponsor / Commission Notice Banner matching reference screenshot 11 & 12 */}
        <div className="hidden lg:flex items-center gap-2.5 bg-white px-2.5 py-1 rounded-[2px] border border-[#dae3ee] text-[10px] text-[#4d5d78] shrink-0">
          <span className="font-semibold text-[#005eb8] uppercase tracking-wider whitespace-nowrap">
            15% Commission on Stays Booked Through Dec 2026
          </span>
          <span className="text-gray-300">|</span>
          <span className="truncate max-w-[240px]">Boutique Luxury in Central London & Worldwide</span>
        </div>
      </div>

      {/* Second row: Dynamic Multi-Tabs + Action buttons */}
      <div className="flex items-stretch justify-between px-2 sm:px-3 h-[35px] bg-[#e6edf5] overflow-x-auto overflow-y-hidden scrollbar-thin">
        {/* Left: Scrollable Tabs Container with "+" button */}
        <div className="flex items-end h-full space-x-1 shrink-0 overflow-x-auto pr-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                id={`command-tab-${tab.pageNumber}`}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center gap-1.5 px-2.5 sm:px-3 h-[31px] rounded-t-[3px] text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white border-t-2 border-t-[#005eb8] border-x border-[#c8d4e5] font-semibold text-[#111111] shadow-2xs'
                    : 'bg-[#dce6f2] hover:bg-[#e4edf7] border-t border-x border-transparent text-[#3e5270]'
                }`}
                title={`Switch to ${tab.title}`}
              >
                <Terminal className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#005eb8]' : 'text-[#586e8e]'}`} />
                <span className="select-none">{tab.title}</span>

                {/* Close tab button (allowed if more than 1 tab exists) */}
                {tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className={`p-0.5 rounded-full hover:bg-[#c2d4eb] transition-colors ml-1 cursor-pointer ${
                      isActive ? 'text-gray-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500 opacity-60 group-hover:opacity-100'
                    }`}
                    title={`Close ${tab.title}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Dynamic "+" New Tab Button right next to Command page tabs */}
          <button
            id="add-command-page-tab-btn"
            onClick={onNewTab}
            className="flex items-center justify-center w-[28px] h-[28px] mb-[2px] rounded-[3px] bg-[#d5e1f0] hover:bg-[#c5d5e8] text-[#005eb8] hover:text-[#004284] border border-[#bccde2] transition-all cursor-pointer shrink-0 shadow-2xs"
            title="Open new Command page (+)"
          >
            <Plus className="w-4 h-4 font-bold" />
          </button>

          {/* Quick GDS Command Shortcuts */}
          <div className="hidden md:flex items-center pl-2 space-x-1 text-[#4f6485] mb-1">
            <button
              onClick={() => onExecuteAction('AN30SEPDACLHR/AQR')}
              className="px-1.5 py-0.5 hover:bg-white rounded-xs transition-colors cursor-pointer text-[11px] font-mono border border-transparent hover:border-[#ccd7e6]"
              title="Availability: AN30SEPDACLHR/AQR"
            >
              AN
            </button>
            <button
              onClick={() => onExecuteAction('DO1')}
              className="px-1.5 py-0.5 hover:bg-white rounded-xs transition-colors cursor-pointer text-[11px] font-mono border border-transparent hover:border-[#ccd7e6]"
              title="Planned Flight Info: DO1"
            >
              DO
            </button>
            <button
              onClick={() => onExecuteAction('RT')}
              className="px-1.5 py-0.5 hover:bg-white rounded-xs transition-colors cursor-pointer text-[11px] font-mono border border-transparent hover:border-[#ccd7e6]"
              title="Retrieve PNR: RT"
            >
              RT
            </button>
            <button
              onClick={() => onExecuteAction('ITR')}
              className="px-1.5 py-0.5 hover:bg-white rounded-xs transition-colors cursor-pointer text-[11px] font-mono border border-transparent hover:border-[#ccd7e6] text-[#005eb8] font-bold"
              title="Print/Download E-Ticket Itinerary Receipt: ITR"
            >
              ITR
            </button>
          </div>
        </div>

        {/* Right: Ignore (IG) & Save (ER) & Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 my-auto pl-2">
          {/* Ignore (IG) */}
          <button
            id="action-ignore-ig-btn"
            onClick={onIgnore}
            className="px-2 sm:px-2.5 py-1 bg-white hover:bg-[#f4f7fb] text-[#005eb8] border border-[#005eb8] rounded-[2px] font-medium text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1 whitespace-nowrap"
            title="Ignore current transaction (IG)"
          >
            <span>Ignore (IG)</span>
          </button>

          {/* Save (ER) */}
          <div className="inline-flex rounded-[2px] shadow-2xs shrink-0">
            <button
              id="action-save-er-btn"
              onClick={onSave}
              className="px-2 sm:px-2.5 py-1 bg-[#005eb8] hover:bg-[#004a91] text-white rounded-l-[2px] font-medium text-xs transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
              title="End and retrieve transaction (ER)"
            >
              <span>Save (ER)</span>
            </button>
            <button
              id="action-save-dropdown-btn"
              onClick={onSave}
              className="px-1.5 py-1 bg-[#00529e] hover:bg-[#003e78] text-white rounded-r-[2px] border-l border-[#004382] transition-colors cursor-pointer"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="hidden sm:block h-4 w-[1px] bg-[#b9c8dc] mx-0.5" />

          {/* History */}
          <button
            id="toggle-history-btn"
            onClick={onToggleHistory}
            className="p-1 sm:p-1.5 text-[#3a4d6b] hover:text-[#005eb8] hover:bg-white rounded-xs transition-colors cursor-pointer"
            title="Command History (Up/Down arrow keys)"
          >
            <History className="w-3.5 h-3.5" />
          </button>

          {/* Split screen toggle */}
          <button
            id="toggle-split-view-btn"
            onClick={onToggleSplit}
            className={`p-1 sm:p-1.5 rounded-xs transition-colors cursor-pointer ${
              isSplitView ? 'bg-[#005eb8] text-white' : 'text-[#3a4d6b] hover:text-[#005eb8] hover:bg-white'
            }`}
            title="Split Screen Display"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>

          {/* Quality Monitor icon */}
          <button
            id="quality-monitor-btn"
            onClick={onOpenHelp}
            className="p-1 sm:p-1.5 text-[#3a4d6b] hover:text-[#005eb8] hover:bg-white rounded-xs transition-colors cursor-pointer flex items-center gap-1"
            title="Quality Monitor & Training Guide"
          >
            <Activity className="w-3.5 h-3.5 text-[#005eb8]" />
            <span className="hidden xl:inline text-[10px] text-[#4d5d78]">Quality Monitor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
