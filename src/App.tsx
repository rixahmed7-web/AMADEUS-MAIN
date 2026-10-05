import React, { useState, useRef, useEffect } from 'react';
import { PnrSession, TerminalOutputItem, CommandPageTab, ItrReceiptData } from './types';
import { createInitialSession, executeGdsCommand, ticketSalesDatabase } from './utils/gdsEngine';
import { printItrDocument, buildItrReceiptData } from './utils/itrReceipt';
import { LoginScreen } from './components/LoginScreen';
import { AmadeusHeader } from './components/AmadeusHeader';
import { ActionBar } from './components/ActionBar';
import { TerminalArea } from './components/TerminalArea';
import { StatusBar } from './components/StatusBar';
import { StudentGuideModal } from './components/StudentGuideModal';
import { PnrOverviewPanel } from './components/PnrOverviewPanel';
import { PartnerBadges } from './components/PartnerBadges';
import { ItrReceiptModal } from './components/ItrReceiptModal';
import { StandaloneTicketView } from './components/StandaloneTicketView';
import { ShareCommandModal } from './components/ShareCommandModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Check, X } from 'lucide-react';

export default function App() {
  // Routing state for standalone ticket view (e.g. ?view=ticket)
  const [isStandaloneView, setIsStandaloneView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'ticket' || params.get('view') === 'itr' || params.get('ticket') === 'true';
  });

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    officeId: string;
    dutyCode: string;
  }>({
    username: '',
    officeId: '',
    dutyCode: '',
  });

  // PNR session state & map of saved PNRs (shared ticketing session)
  const [session, setSession] = useState<PnrSession>(() => createInitialSession('DAC360', 'Student'));
  const savedPnrsRef = useRef<Map<string, PnrSession>>(new Map());

  // Multi-tab command pages state
  const [tabs, setTabs] = useState<CommandPageTab[]>([
    {
      id: 'tab-1',
      title: 'Command page 1',
      pageNumber: 1,
      outputs: [
        {
          id: 'init-1',
          type: 'command',
          content: 'ig',
        },
        {
          id: 'init-2',
          type: 'response',
          content: 'IGNORED',
        },
      ],
      commandHistory: ['ig'],
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Helper to find the active tab
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // UI state
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeItrData, setActiveItrData] = useState<ItrReceiptData | null>(null);
  const [isItrModalOpen, setIsItrModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareModalData, setShareModalData] = useState<ItrReceiptData | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Session reference to ensure async search timeouts always use the latest PNR state
  const sessionRef = useRef<PnrSession>(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Auto-dismiss toast notification after 5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Open the Share Your Command modal
  const handleOpenShareModal = (data?: ItrReceiptData) => {
    const receipt =
      data ||
      activeItrData ||
      buildItrReceiptData(sessionRef.current, ticketSalesDatabase, activeTab.commandHistory) ||
      buildItrReceiptData(createInitialSession(), ticketSalesDatabase, activeTab.commandHistory);
    setShareModalData(receipt);
    setIsShareModalOpen(true);
  };

  // Helper to determine if a command is a Flight or Fare search requiring 0.5s realistic loading delay
  const isFlightOrFareSearch = (cmdStr: string): boolean => {
    const upper = cmdStr.trim().toUpperCase();
    return (
      upper.startsWith('AN') ||
      upper.startsWith('SN') ||
      upper.startsWith('FXD') ||
      upper.startsWith('FQD') ||
      upper.startsWith('FQP')
    );
  };

  // Handle successful login
  const handleLoginSuccess = (userData: { username: string; officeId: string; dutyCode: string }) => {
    setCurrentUser(userData);
    setSession(createInitialSession(userData.officeId, userData.dutyCode));
    setIsAuthenticated(true);
  };

  // Handle sign out
  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentUser({ username: '', officeId: '', dutyCode: '' });
  };

  // Create a new command page tab (e.g. Command page 2, Command page 3)
  const handleCreateNewTab = () => {
    const existingNumbers = tabs.map((t) => t.pageNumber);
    let nextNumber = 1;
    while (existingNumbers.includes(nextNumber)) {
      nextNumber++;
    }

    const newTabId = `tab-${Date.now()}`;
    const newTab: CommandPageTab = {
      id: newTabId,
      title: `Command page ${nextNumber}`,
      pageNumber: nextNumber,
      outputs: [
        {
          id: `init-${Date.now()}-1`,
          type: 'command',
          content: 'ig',
        },
        {
          id: `init-${Date.now()}-2`,
          type: 'response',
          content: 'IGNORED',
        },
      ],
      commandHistory: ['ig'],
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
  };

  // Close a command page tab
  const handleCloseTab = (tabIdToClose: string) => {
    if (tabs.length <= 1) return; // Keep at least one tab open
    const targetIdx = tabs.findIndex((t) => t.id === tabIdToClose);
    const newTabs = tabs.filter((t) => t.id !== tabIdToClose);
    setTabs(newTabs);

    // If closing the currently active tab, switch to an adjacent tab
    if (activeTabId === tabIdToClose) {
      const nextActive = newTabs[Math.max(0, targetIdx - 1)] || newTabs[0];
      setActiveTabId(nextActive.id);
    }
  };

  // Execute a GDS command in the active tab
  const handleExecuteCommand = (rawCommand: string) => {
    const cmd = rawCommand.trim();
    if (!cmd) return;

    const upperCmd = cmd.toUpperCase();

    // Clear screen commands: CLEAR or CLS
    if (upperCmd === 'CLEAR' || upperCmd === 'CLS') {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                outputs: [],
                commandHistory: [...t.commandHistory, cmd],
              }
            : t
        )
      );
      return;
    }

    // Check if this command is a Flight or Fare search requiring 0.5s realistic loading delay
    const needsSearchDelay = isFlightOrFareSearch(cmd);

    if (needsSearchDelay) {
      const cmdId = `cmd-${Date.now()}`;
      const loadingId = `loading-${Date.now()}`;

      // User command line (starts green while searching, updated upon result)
      const cmdItem: TerminalOutputItem = {
        id: cmdId,
        type: 'command',
        content: cmd.toLowerCase(),
        isError: false,
      };

      const loadingItem: TerminalOutputItem = {
        id: loadingId,
        type: 'response',
        content: 'SEARCHING LIVE GDS FARES & FLIGHT SCHEDULES... PLEASE WAIT',
        isLoading: true,
      };

      setIsSearching(true);

      // Prepend command and loading item to active tab
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                outputs: [cmdItem, loadingItem, ...t.outputs],
                commandHistory: [...t.commandHistory, cmd],
              }
            : t
        )
      );

      // Exactly 0.5 second (500ms) delay for realistic feel
      setTimeout(() => {
        const result = executeGdsCommand(cmd, sessionRef.current, savedPnrsRef.current);
        const updatedWithHistory: PnrSession = {
          ...result.updatedSession,
          commandHistory: [...(result.updatedSession.commandHistory || []), cmd],
        };
        setSession(updatedWithHistory);

        if (result.emailSent) {
          setToastMessage(result.emailSent.message);
        }

        if (result.itrData) {
          setActiveItrData(result.itrData);
          try {
            localStorage.setItem('amadeus_active_ticket', JSON.stringify(result.itrData));
          } catch {}
        }

        const isError = Boolean(result.isError);

        const responseItem: TerminalOutputItem = {
          id: `res-${Date.now() + 1}`,
          type: 'response',
          content: result.output,
          isItr: Boolean(result.isItr || result.itrData),
          isTtp: Boolean(result.isTtp || cmd.trim().toUpperCase().startsWith('TTP')),
          itrData: result.itrData,
        };

        setTabs((prev) =>
          prev.map((t) => {
            if (t.id !== activeTabId) return t;
            const newOutputs = t.outputs.map((item) => {
              if (item.id === loadingId) return responseItem;
              if (item.id === cmdId) return { ...item, isError };
              return item;
            });
            return { ...t, outputs: newOutputs };
          })
        );

        setIsSearching(false);
      }, 500);

      return;
    }

    // Other commands execute INSTANTLY (0 delay)
    const result = executeGdsCommand(cmd, sessionRef.current, savedPnrsRef.current);
    const updatedWithHistory: PnrSession = {
      ...result.updatedSession,
      commandHistory: [...(result.updatedSession.commandHistory || []), cmd],
    };
    setSession(updatedWithHistory);

    const isError = Boolean(result.isError);

    const cmdItem: TerminalOutputItem = {
      id: `cmd-${Date.now()}`,
      type: 'command',
      content: cmd.toLowerCase(),
      isError,
    };

    // If IG command is run, reset screen back to fresh work area with IGNORED at top
    if (upperCmd === 'IG') {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                outputs: [
                  {
                    id: `cmd-${Date.now()}`,
                    type: 'command',
                    content: 'ig',
                    isError: false,
                  },
                  {
                    id: `res-${Date.now() + 1}`,
                    type: 'response',
                    content: 'IGNORED',
                  },
                ],
                commandHistory: [...t.commandHistory, cmd],
              }
            : t
        )
      );
      return;
    }

    // If navigation command (MD, MU, MT, MB), perform scrolling action without adding text clutter
    if (result.navAction) {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                commandHistory: [...t.commandHistory, cmd],
              }
            : t
        )
      );
      return;
    }

    // If email was dispatched, show realistic green toast notification
    if (result.emailSent) {
      setToastMessage(result.emailSent.message);
    }

    // If ITR or TTP produced e-ticket data, update active receipt
    if (result.itrData) {
      setActiveItrData(result.itrData);
      try {
        localStorage.setItem('amadeus_active_ticket', JSON.stringify(result.itrData));
      } catch {}
    }

    // If user typed ITR command, directly open the full-screen modal
    if (result.isItr || /^ITR(?:\s*|\/.*|-L\d+)?$/i.test(cmd.trim())) {
      const receiptToShow =
        result.itrData ||
        activeItrData ||
        buildItrReceiptData(result.updatedSession, ticketSalesDatabase, activeTab.commandHistory) ||
        buildItrReceiptData(session, ticketSalesDatabase, activeTab.commandHistory) ||
        buildItrReceiptData(createInitialSession(), ticketSalesDatabase, activeTab.commandHistory);
      if (receiptToShow) {
        setActiveItrData(receiptToShow);
        try {
          localStorage.setItem('amadeus_active_ticket', JSON.stringify(receiptToShow));
        } catch {}
        setIsItrModalOpen(true);
      }
    }

    const responseItem: TerminalOutputItem = {
      id: `res-${Date.now() + 1}`,
      type: 'response',
      content: result.output,
      isItr: Boolean(result.isItr || result.itrData),
      isTtp: Boolean(result.isTtp || cmd.trim().toUpperCase().startsWith('TTP')),
      itrData: result.itrData,
    };

    // Prepend new command and response to the top of outputs so latest is always at Line 1
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              outputs: [cmdItem, responseItem, ...t.outputs],
              commandHistory: [...t.commandHistory, cmd],
            }
          : t
      )
    );
  };

  // Direct actions: Ignore (IG) and Save (ER)
  const handleIgnore = () => {
    handleExecuteCommand('IG');
  };

  const handleSave = () => {
    handleExecuteCommand('ER');
  };

  // Quick sell from availability click
  const handleSelectFlightLine = (lineNum: number) => {
    handleExecuteCommand(`SS1Y${lineNum}`);
  };

  const handleSelectFlightDo = (lineNum: number) => {
    handleExecuteCommand(`DO${lineNum}`);
  };

  if (isStandaloneView) {
    return (
      <ErrorBoundary
        fallbackTitle="টিকিট প্রদর্শনে ত্রুটি (Standalone Ticket Error)"
        onReset={() => setIsStandaloneView(false)}
      >
        <StandaloneTicketView
          initialData={activeItrData}
          commandHistory={activeTab.commandHistory}
          onBack={() => {
            setIsStandaloneView(false);
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.delete('view');
              url.searchParams.delete('ticket');
              url.searchParams.delete('pnr');
              window.history.replaceState({}, '', url.pathname || '/');
            }
          }}
        />
      </ErrorBoundary>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        {/* Floating Partner Badges (Sabre & Travelport) */}
        <PartnerBadges />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-[#1a1a1a] font-sans antialiased select-none" id="amadeus-app-root">
      {/* 1. Top Amadeus Dark Navbar */}
      <AmadeusHeader
        username={currentUser.username}
        officeId={currentUser.officeId}
        onSignOut={handleSignOut}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Action Bar & Command Tabs */}
      <ActionBar
        officeId={currentUser.officeId}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onNewTab={handleCreateNewTab}
        onCloseTab={handleCloseTab}
        onExecuteAction={handleExecuteCommand}
        onIgnore={handleIgnore}
        onSave={handleSave}
        onToggleHistory={() => {
          handleExecuteCommand('RT');
        }}
        onToggleSplit={() => setIsSplitView(!isSplitView)}
        onOpenHelp={() => setIsHelpOpen(true)}
        isSplitView={isSplitView}
      />

      {/* 3. Main Workspace Area: Terminal Console + Optional Split PNR Inspection */}
      <main className="flex-1 flex overflow-hidden relative" id="amadeus-main-workspace">
        <TerminalArea
          key={activeTab.id}
          outputs={activeTab.outputs}
          onExecuteCommand={handleExecuteCommand}
          commandHistory={activeTab.commandHistory}
          isSplitView={isSplitView}
          onSelectFlightLine={handleSelectFlightLine}
          onSelectFlightDo={handleSelectFlightDo}
          isSearching={isSearching}
          onOpenShareModal={handleOpenShareModal}
          onOpenItrModal={(data) => {
            const receipt =
              data ||
              activeItrData ||
              buildItrReceiptData(sessionRef.current, ticketSalesDatabase, activeTab.commandHistory) ||
              buildItrReceiptData(createInitialSession(), ticketSalesDatabase, activeTab.commandHistory);
            if (receipt) {
              setActiveItrData(receipt);
              try {
                localStorage.setItem('amadeus_active_ticket', JSON.stringify(receipt));
              } catch {}
            }
            setIsItrModalOpen(true);
          }}
          onPrintItr={(data) => {
            const target =
              data ||
              activeItrData ||
              buildItrReceiptData(sessionRef.current, ticketSalesDatabase, activeTab.commandHistory) ||
              buildItrReceiptData(createInitialSession(), ticketSalesDatabase, activeTab.commandHistory);
            if (target) {
              printItrDocument(target);
            } else {
              handleExecuteCommand('ITR');
            }
          }}
        />

        {/* Live PNR Buffer Inspection Panel when split view is active */}
        {isSplitView && (
          <PnrOverviewPanel
            session={session}
            onClose={() => setIsSplitView(false)}
            onExecuteCommand={handleExecuteCommand}
          />
        )}
      </main>

      {/* 4. Bottom Status Bar */}
      <StatusBar
        officeId={currentUser.officeId}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onNewTab={handleCreateNewTab}
        onOpenHelp={() => setIsHelpOpen(!isHelpOpen)}
        isHelpOpen={isHelpOpen}
      />

      {/* 5. Student Learning Assistant Modal */}
      <StudentGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onExecuteCommand={handleExecuteCommand}
      />

      {/* 6. Floating Partner Badges (Sabre & Travelport) */}
      <PartnerBadges />

      {/* 7. Realistic Email Dispatch Green Toast Notification */}
      {toastMessage && (
        <div
          id="email-dispatch-toast"
          className="fixed top-14 right-6 z-50 bg-[#00703c] text-white px-4 py-3 rounded shadow-xl flex items-center gap-3 border border-emerald-400 animate-in slide-in-from-top-3 fade-in duration-200 select-text"
          role="alert"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div className="text-xs font-semibold tracking-wide">{toastMessage}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-emerald-200 hover:text-white p-1 rounded transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 8. Amadeus Passenger Itinerary & Receipt Modal (View / Print / Email) */}
      <ErrorBoundary
        fallbackTitle="টিকিট রেন্ডারিং সমস্যা (Ticket Display Caught by ErrorBoundary)"
        isModal={true}
        onReset={() => setIsItrModalOpen(false)}
      >
        <ItrReceiptModal
          isOpen={isItrModalOpen}
          data={activeItrData}
          commandHistory={activeTab.commandHistory}
          onClose={() => {
            setIsItrModalOpen(false);
            setTimeout(() => {
              const cliInput = document.getElementById('gds-cli-input') as HTMLInputElement | null;
              if (cliInput) {
                cliInput.focus();
              }
            }, 50);
          }}
          onSendEmail={(email) => handleExecuteCommand(`ITR-EML-${email}`)}
        />
      </ErrorBoundary>

      {/* 9. Share Your Command Modal */}
      <ShareCommandModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        ticketData={
          shareModalData ||
          activeItrData ||
          buildItrReceiptData(sessionRef.current, ticketSalesDatabase, activeTab.commandHistory) ||
          buildItrReceiptData(createInitialSession(), ticketSalesDatabase, activeTab.commandHistory)
        }
        commandHistory={activeTab.commandHistory}
        onRunCommandInTerminal={handleExecuteCommand}
      />
    </div>
  );
}
