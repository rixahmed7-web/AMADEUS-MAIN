import React, { useState } from 'react';
import { Search, Bell, Settings, ChevronDown, User, LogOut, Info, ExternalLink } from 'lucide-react';
import { AmadeusLogo } from './AmadeusLogo';

interface AmadeusHeaderProps {
  username: string;
  officeId: string;
  onSignOut: () => void;
  onOpenHelp: () => void;
}

export const AmadeusHeader: React.FC<AmadeusHeaderProps> = ({
  username,
  officeId,
  onSignOut,
  onOpenHelp,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showAppsMenu, setShowAppsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-[46px] bg-[#051336] text-white flex items-center justify-between px-3 text-xs border-b border-[#12285a] select-none relative z-30" id="amadeus-top-header">
      {/* Left section: Logo and top menus */}
      <div className="flex items-center gap-4 h-full">
        {/* Amadeus Logo */}
        <div className="flex items-center pl-1 pr-2">
          <AmadeusLogo variant="white" size="sm" />
        </div>

        {/* Navigation Menus */}
        <nav className="hidden sm:flex items-center space-x-1 h-full font-normal">
          {/* File Menu */}
          <div className="relative h-full flex items-center">
            <button
              id="header-menu-file"
              onClick={() => {
                setShowFileMenu(!showFileMenu);
                setShowAppsMenu(false);
                setShowUserMenu(false);
              }}
              className="h-full px-2.5 flex items-center gap-1 hover:bg-[#112a66] text-[#e0e6f5] transition-colors"
            >
              <span>File</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            {showFileMenu && (
              <div className="absolute top-[46px] left-0 w-44 bg-[#0c1f4d] border border-[#224285] rounded-xs shadow-lg py-1 z-50 text-xs text-white animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    setShowFileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1d3d82] flex items-center justify-between"
                >
                  <span>New Window</span>
                  <span className="text-[10px] text-gray-400">Ctrl+N</span>
                </button>
                <button
                  onClick={() => {
                    setShowFileMenu(false);
                    onOpenHelp();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1d3d82]"
                >
                  Quick Reference
                </button>
                <div className="border-t border-[#1d3d82] my-1" />
                <button
                  onClick={() => {
                    setShowFileMenu(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1d3d82] text-red-300"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Smart Flows Menu */}
          <div className="relative h-full flex items-center">
            <button
              id="header-menu-smartflows"
              className="h-full px-2.5 flex items-center gap-1 hover:bg-[#112a66] text-[#e0e6f5] transition-colors"
            >
              <span>Smart Flows</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          </div>

          {/* Apps Menu */}
          <div className="relative h-full flex items-center">
            <button
              id="header-menu-apps"
              onClick={() => {
                setShowAppsMenu(!showAppsMenu);
                setShowFileMenu(false);
                setShowUserMenu(false);
              }}
              className="h-full px-2.5 flex items-center gap-1 hover:bg-[#112a66] text-[#e0e6f5] transition-colors"
            >
              <span>Apps</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            {showAppsMenu && (
              <div className="absolute top-[46px] left-0 w-48 bg-[#0c1f4d] border border-[#224285] rounded-xs shadow-lg py-1 z-50 text-xs text-white">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#8da5db]">Amadeus Apps</div>
                <div className="px-3 py-1.5 hover:bg-[#1d3d82] cursor-pointer">Quality Monitor</div>
                <div className="px-3 py-1.5 hover:bg-[#1d3d82] cursor-pointer">Cryptic Terminal</div>
                <div className="px-3 py-1.5 hover:bg-[#1d3d82] cursor-pointer">Graphic Booking Tool</div>
                <div className="px-3 py-1.5 hover:bg-[#1d3d82] cursor-pointer">Ticket Issuance (TTP)</div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Center section: Search input */}
      <div className="flex-1 max-w-lg mx-4 hidden md:block">
        <div className="relative">
          <input
            id="amadeus-global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search solutions, learning and support"
            className="w-full h-[28px] pl-8 pr-3 text-xs bg-[#ffffff] text-[#222222] placeholder-[#767676] rounded-[3px] focus:outline-none focus:ring-1 focus:ring-[#005eb8]"
          />
          <Search className="w-3.5 h-3.5 text-[#555555] absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Right section: Notifications, About, User profile badge */}
      <div className="flex items-center gap-2 h-full">
        {/* Bell Notification */}
        <button
          id="header-notification-bell"
          className="relative p-1.5 hover:bg-[#112a66] rounded-xs text-[#cfd9ed] transition-colors"
          title="1 System Notification"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#e03a3e] text-[9px] font-bold text-white rounded-full flex items-center justify-center leading-none">
            1
          </span>
        </button>

        {/* Settings / Gear */}
        <button
          id="header-settings-btn"
          className="p-1.5 hover:bg-[#112a66] rounded-xs text-[#cfd9ed] transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* About */}
        <button
          id="header-about-btn"
          onClick={onOpenHelp}
          className="hidden sm:flex items-center gap-1 px-2 py-1 hover:bg-[#112a66] rounded-xs text-[#cfd9ed] transition-colors"
        >
          <span>About</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>

        {/* User profile badge matching screenshot: "SAZZAD2" or logged in user */}
        <div className="relative">
          <button
            id="header-user-badge-btn"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowFileMenu(false);
              setShowAppsMenu(false);
            }}
            className="flex items-center gap-2 pl-2 pr-2 py-1 bg-[#102966] hover:bg-[#163580] rounded-[3px] text-white border border-[#224796] transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-[#005eb8] flex items-center justify-center text-[10px] font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold uppercase tracking-wider text-[11px]" id="header-username-display">
              {username.toUpperCase() || 'SAZZAD2'}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-300" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div
              className="absolute right-0 top-[38px] w-56 bg-[#0c1f4d] border border-[#224285] rounded-xs shadow-xl py-2 z-50 text-xs text-white animate-in fade-in duration-150"
              id="user-profile-dropdown"
            >
              <div className="px-3 py-2 border-b border-[#1d3d82]">
                <div className="font-semibold text-white uppercase">{username || 'SAZZAD2'}</div>
                <div className="text-[11px] text-[#9bb3e6]">Office ID: {officeId || 'DAC360'}</div>
                <div className="text-[10px] text-[#8199cc]">Duty: Instructor / Trainee</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenHelp();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1d3d82] flex items-center gap-2"
                >
                  <Info className="w-3.5 h-3.5 text-[#679bf5]" />
                  <span>Amadeus Training Guide</span>
                </button>
              </div>

              <div className="border-t border-[#1d3d82] pt-1">
                <button
                  id="signout-dropdown-btn"
                  onClick={() => {
                    setShowUserMenu(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#78191c] text-red-200 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out / Lock Terminal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
