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
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep focus on the terminal prompt
  const focusPrompt = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusPrompt();
  }, []);

  // Scroll container to top when new output arrives so user immediately sees the top of response
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [outputs]);

  // Handle keyboard navigation (Enter, Arrow Up, Arrow Down)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = currentInput.trim();
      if (trimmed) {
        onExecuteCommand(trimmed);
        setCurrentInput('');
        setHistoryIndex(-1);
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

          // Header highlights
          if (line.includes('** AMADEUS AVAILABILITY') || line.includes('*A PLANNED FLIGHT INFO*')) {
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
      ref={containerRef}
      onClick={focusPrompt}
      className={`flex-1 bg-white overflow-y-auto p-4 md:p-6 cursor-text relative select-text transition-all flex flex-col ${
        isSplitView ? 'border-r border-[#c8d4e5]' : ''
      }`}
      style={{
        fontFamily: "'Courier New', Courier, 'Lucida Console', Monaco, monospace",
      }}
      id="amadeus-terminal-canvas"
    >
      {/* 1. FIXED TOP COMMAND PROMPT (Original Amadeus Behavior - Line 1) */}
      <div
        className="flex items-center text-[#111111] font-mono text-[13px] relative pb-3 border-b border-[#eef2f8] shrink-0"
        id="terminal-prompt-row"
      >
        <span className="text-[#005eb8] font-bold mr-2 select-none">&gt;</span>
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
            className="w-2 h-4 bg-[#111111] inline-block animate-pulse pointer-events-none opacity-80"
            style={{ animationDuration: '0.9s' }}
            id="terminal-block-cursor"
          />
        </div>
      </div>

      {/* 2. Command Output Area directly below Line 1 */}
      <div className="space-y-3 pt-3 flex-1">
        {outputs.map((item) => (
          <div key={item.id} className="space-y-1">
            {item.type === 'command' ? (
              <div className="flex items-center text-[#111111] font-mono font-semibold text-[13px]">
                <span className="text-[#005eb8] mr-2 select-none">&gt;</span>
                <span>{item.content}</span>
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
