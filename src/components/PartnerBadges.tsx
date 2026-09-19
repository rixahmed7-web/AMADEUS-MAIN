import React, { useState } from 'react';

export const PartnerBadges: React.FC = () => {
  const [hoveredBadge, setHoveredBadge] = useState<'travelport' | 'sabre' | null>(null);

  return (
    <aside
      id="partner-floating-badges"
      aria-label="Partner Aviation Portals"
      className="fixed bottom-[20px] right-[20px] z-[9999] pointer-events-auto flex items-center gap-2.5 sm:gap-3"
      style={{ zIndex: 9999 }}
    >
      {/* 1. Sabre Logo Badge */}
      <a
        href="https://www.shohojsavre.site/"
        target="_blank"
        rel="noopener noreferrer"
        id="sabre-shohoj-link"
        aria-label="Visit Shohoj Sabre"
        onMouseEnter={() => setHoveredBadge('sabre')}
        onMouseLeave={() => setHoveredBadge(null)}
        className="group relative flex items-center justify-center px-3 py-2 sm:px-3.5 sm:py-2.5 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_24px_rgba(229,25,55,0.28)] border border-[#e2e8f0] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-pointer no-underline select-none"
      >
        {/* Authentic Sabre Red & Black SVG Logo */}
        <svg
          viewBox="0 0 115 32"
          className="h-5 sm:h-6 w-auto transition-transform duration-300 group-hover:scale-102"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Sabre Dynamic Red Hexagonal Gem Brandmark */}
          <g transform="translate(1, 4)">
            {/* Upper facets */}
            <path
              d="M12 0 L22 4 L14 11 L4 7 Z"
              fill="#E51937"
            />
            {/* Front right facet - deep crimson shadow */}
            <path
              d="M22 4 L22 17 L12 24 L14 11 Z"
              fill="#B00D23"
            />
            {/* Front left facet - bright red */}
            <path
              d="M4 7 L14 11 L12 24 L2 18 Z"
              fill="#FF2A4B"
            />
            {/* Bottom core facet */}
            <path
              d="M12 24 L14 11 L22 4 L12 0 L2 18 Z"
              fill="url(#sabre-red-grad)"
              opacity="0.3"
            />
          </g>

          <defs>
            <linearGradient id="sabre-red-grad" x1="2" y1="0" x2="22" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF4D6D" />
              <stop offset="1" stopColor="#990017" />
            </linearGradient>
          </defs>

          {/* Sabre Authentic Typography Wordmark */}
          <text
            x="32"
            y="22"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="18"
            fontWeight="800"
            letterSpacing="-0.5px"
            fill="#1A1A1A"
          >
            Sabre
          </text>
        </svg>

        {/* Sabre Hover Tooltip */}
        <div
          id="sabre-shohoj-tooltip"
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1a1a1a] text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none transition-all duration-200 transform ${
            hoveredBadge === 'sabre'
              ? 'opacity-100 translate-y-0 visible'
              : 'opacity-0 translate-y-1 invisible'
          }`}
          role="tooltip"
        >
          <span>Visit Shohoj Sabre</span>
          {/* Tooltip downward arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[#1a1a1a]" />
        </div>
      </a>

      {/* 2. Travelport Logo Badge */}
      <a
        href="https://www.shohojaviation.online/"
        target="_blank"
        rel="noopener noreferrer"
        id="travelport-shohoj-link"
        aria-label="Visit Shohoj Aviation"
        onMouseEnter={() => setHoveredBadge('travelport')}
        onMouseLeave={() => setHoveredBadge(null)}
        className="group relative flex items-center justify-center p-2 sm:p-2.5 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_24px_rgba(0,94,184,0.28)] border border-[#e2e8f0] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-pointer no-underline select-none"
      >
        {/* Official Travelport SVG Logo */}
        <svg
          viewBox="0 0 160 40"
          className="h-5 sm:h-6 w-auto transition-transform duration-300 group-hover:scale-102"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Travelport Modern Logomark / Brandmark (4 interconnected angled petals) */}
          <g transform="translate(4, 3)">
            {/* Top Leaf - Cyan */}
            <path
              d="M17 1 C17 1 27 6 27 16 C27 16 17 16 17 16 Z"
              fill="#00B4D8"
            />
            {/* Right Leaf - Dark Navy */}
            <path
              d="M32 17 C32 17 27 27 17 27 C17 27 17 17 17 17 Z"
              fill="#051336"
            />
            {/* Bottom Leaf - Deep Blue */}
            <path
              d="M17 33 C17 33 7 28 7 18 C7 18 17 18 17 18 Z"
              fill="#0077B6"
            />
            {/* Left Leaf - Cobalt */}
            <path
              d="M2 17 C2 17 7 7 17 7 C17 7 17 17 17 17 Z"
              fill="#005EB8"
            />
            {/* Center Core Accent */}
            <circle cx="17" cy="17" r="3.2" fill="#ffffff" />
          </g>

          {/* Typography: 'Travelport' wordmark */}
          <text
            x="48"
            y="26"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="18"
            fontWeight="700"
            letterSpacing="-0.3px"
            fill="#051336"
          >
            Travelport
          </text>
        </svg>

        {/* Travelport Hover Tooltip */}
        <div
          id="travelport-shohoj-tooltip"
          className={`absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-[#051336] text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none transition-all duration-200 transform ${
            hoveredBadge === 'travelport'
              ? 'opacity-100 translate-y-0 visible'
              : 'opacity-0 translate-y-1 invisible'
          }`}
          role="tooltip"
        >
          <span>Visit Shohoj Aviation</span>
          {/* Tooltip downward arrow */}
          <div className="absolute top-full right-5 -mt-[1px] border-4 border-transparent border-t-[#051336]" />
        </div>
      </a>
    </aside>
  );
};
