import React, { useState, useRef, useEffect } from 'react';
import { TerminalOutputItem } from '../types';

interface TerminalAreaProps {
  outputs: TerminalOutputItem[];
  onExecuteCommand: (cmd: string) => void;
  commandHistory: string[];
  isSplitView: boolean;
  onSelectFlightLine?: (lineNum: number) => void;
  onSelectFlightDo?: (lineNum: number) => void;
}

export const TerminalArea: React.FC<TerminalAreaProps> = ({
  outputs,
  onExecuteCommand,
  commandHistory,
  isSplitView,
  onSelectFlightLine,
  onSelectFlightDo,
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Keep focus on the terminal prompt
  const focusPrompt = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusPrompt();
  }, []);

  // When outputs update, automatically scroll to the top so the latest command result is immediately visible at Line 1
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    focusPrompt();
  }, [outputs]);

  // Handle keyboard navigation (Enter, Arrow Up, Arrow Down) and navigation commands (MD, MU, MT, MB)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = currentInput.trim();
      if (trimmed) {
        const upper = trimmed.toUpperCase();

        // Handle terminal display scrolling directives
        if (upper === 'MD') {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop += 320;
          }
          onExecuteCommand(trimmed);
          setCurrentInput('');
          setHistoryIndex(-1);
          return;
        }
        if (upper === 'MU') {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = Math.max(0, scrollContainerRef.current.scrollTop - 320);
          }
          onExecuteCommand(trimmed);
          setCurrentInput('');
          setHistoryIndex(-1);
          return;
        }
        if (upper === 'MT') {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
          }
          onExecuteCommand(trimmed);
          setCurrentInput('');
          setHistoryIndex(-1);
          return;
        }
        if (upper === 'MB') {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
          onExecuteCommand(trimmed);
          setCurrentInput('');
          setHistoryIndex(-1);
          return;
        }

        // Standard command execution
        onExecuteCommand(trimmed);
        setCurrentInput('');
        setHistoryIndex(-1);
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setCurrentInput(commandHistory[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setCurrentInput('');
      } else {
        setHistoryIndex(nextIndex);
        setCurrentInput(commandHistory[nextIndex] || '');
      }
    }
  };

  // Render formatted Amadeus GDS output with authentic styling
  const renderFormattedOutput = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="font-mono text-[13px] leading-[1.38] text-[#111111] whitespace-pre select-text">
        {lines.map((line, idx) => {
          // Check for availability flight highlights
          if (line.includes('QR 639') || line.includes('QR 641') || line.includes('BA:QR9709')) {
            // Enhanced interactive line
            return (
              <div key={idx} className="group hover:bg-[#f2f7ff] transition-colors py-[1px]">
                {line.split(/(QR 639|QR 641|BA:QR9709|DO1|DO2)/g).map((segment, sIdx) => {
                  if (segment === 'QR 639') {
                    return (
                      <span
                        key={sIdx}
                        onClick={() => onSelectFlightLine && onSelectFlightLine(1)}
                        className="bg-[#005eb8] text-white px-1 py-0.5 rounded-[1px] font-bold cursor-pointer hover:bg-[#00478c] inline-block shadow-2xs"
                        title="Click to Sell segment (SS1Y1)"
                      >
                        {segment}
                      </span>
                    );
                  }
                  if (segment === 'BA:QR9709') {
                    return (
                      <span key={sIdx} className="text-[#b31412] font-bold">
                        <span className="inline-block w-1.5 h-3 bg-[#b31412] mr-1 align-middle" />
                        {segment}
                      </span>
                    );
                  }
                  return <span key={sIdx}>{segment}</span>;
                })}
              </div>
            );
          }

          // Lowest Fare Search (FXD) & Booking instruction (FXZ)
          if (line.includes('TO BOOK USE FXZ')) {
            return (
              <div key={idx} className="bg-amber-50 border border-amber-300 text-amber-900 px-2 py-1 my-1 font-bold rounded-xs flex items-center gap-2 flex-wrap">
                <span>{line}</span>
                <span className="flex gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={() => onExecuteCommand('FXZ1')}
                    className="px-2 py-0.5 bg-[#005eb8] hover:bg-[#00478c] text-white text-[11px] rounded-xs cursor-pointer"
                  >
                    FXZ1
                  </button>
                  <button
                    type="button"
                    onClick={() => onExecuteCommand('FXZ2')}
                    className="px-2 py-0.5 bg-[#005eb8] hover:bg-[#00478c] text-white text-[11px] rounded-xs cursor-pointer"
                  >
                    FXZ2
                  </button>
                </span>
              </div>
            );
          }

          if (line.startsWith('OPTION 0') || line.startsWith('OPTION 1')) {
            return (
              <div key={idx} className="font-bold text-[#005eb8] bg-[#f0f6ff] px-1 py-0.5 mt-1 border-l-2 border-[#005eb8]">
                {line}
              </div>
            );
          }

          if (line.includes('SSR DOCS') || line.includes('SSR CTCE') || line.includes('SSR CTCM') || line.includes('SSR MOML')) {
            return (
              <div key={idx} className="text-[#3b5998] font-medium py-[1px]">
                {line}
              </div>
            );
          }

          if (line.startsWith('OK - ITINERARY EMAIL') || line.startsWith('OK - E-TICKET RECEIPT')) {
            return (
              <div key={idx} className="text-[#00703c] font-bold py-1 bg-emerald-50 px-2 rounded-xs border border-emerald-200 my-1">
                {line}
              </div>
            );
          }

          // Header highlights
          if (line.includes('** AMADEUS AVAILABILITY') || line.includes('*A PLANNED FLIGHT INFO*') || line.includes('FXD BEST BUY')) {
            return (
              <div key={idx} className="font-semibold text-[#18397a] py-0.5">
                {line}
              </div>
            );
          }

          // Error / notice lines
          if (line.startsWith('NEED ') || line.startsWith('NO ') || line.startsWith('INVALID ') || line.startsWith('RECEIVED FROM REQUIRED')) {
            return (
              <div key={idx} className="text-[#b81d22] font-semibold py-0.5">
                {line}
              </div>
            );
          }

          // Ticket issued confirmation
          if (line.includes('OK ETICKET ISSUED') || line.includes('TKT ISSUED / OK') || line.includes('TST 00001 CREATED')) {
            return (
              <div key={idx} className="text-[#00703c] font-semibold py-0.5">
                {line}
              </div>
            );
          }

          return <div key={idx}>{line}</div>;
        })}
      </div>
    );
  };

  return (
    <div
      onClick={focusPrompt}
      className={`flex-1 bg-white cursor-text relative select-text transition-all flex flex-col overflow-hidden h-full ${
        isSplitView ? 'border-r border-[#c8d4e5]' : ''
      }`}
      style={{
        fontFamily: "'Courier New', Courier, 'Lucida Console', Monaco, monospace",
      }}
      id="amadeus-terminal-canvas"
    >
      {/* 1. FIXED TOP COMMAND PROMPT (Always visible at Line 1 - Never pushed down) */}
      <div
        className="px-4 md:px-6 py-2.5 bg-white border-b border-[#c8d4e5] shrink-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        id="terminal-prompt-container"
      >
        <div className="flex items-center text-[#111111] font-mono text-[13px] relative" id="terminal-prompt-row">
          <span className="text-[#005eb8] font-bold mr-2 select-none text-[14px]">&gt;</span>
          <div className="flex-1 relative flex items-center">
            <input
              ref={inputRef}
              id="gds-cli-input"
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-[#111111] border-none outline-none font-mono text-[13px] p-0 m-0 uppercase focus:ring-0"
              autoFocus
              spellCheck={false}
              autoCapitalize="characters"
              autoComplete="off"
              aria-label="GDS Terminal Command Input"
            />
            {/* Authentic Amadeus Blinking Block Cursor */}
            <span
              className="w-2 h-4 bg-[#111111] inline-block animate-pulse pointer-events-none opacity-80 ml-0.5"
              style={{ animationDuration: '0.9s' }}
              id="terminal-block-cursor"
            />
          </div>
        </div>
      </div>

      {/* 2. Scrollable Output Area - Latest Output Always at the Top (Line 1) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-3 space-y-3"
        id="terminal-scroll-area"
      >
        {outputs.map((item, idx) => (
          <div key={item.id} className="space-y-1">
            {item.type === 'command' ? (
              <div
                className={`flex items-center text-[#111111] font-mono text-[13px] ${
                  idx > 0
                    ? 'pt-4 mt-3 border-t border-dashed border-[#dce3ee] opacity-80'
                    : 'pb-0.5 font-bold'
                }`}
              >
                <span className="text-[#005eb8] font-bold mr-2 select-none">&gt;</span>
                <span className={idx === 0 ? 'text-[#005eb8] font-bold' : 'text-[#444444] font-semibold'}>
                  {item.content}
                </span>
                {idx > 0 && (
                  <span className="ml-3 text-[11px] text-[#888888] font-sans font-normal select-none">
                    [Previous Screen]
                  </span>
                )}
              </div>
            ) : (
              <div className="pl-0">{renderFormattedOutput(item.content)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
