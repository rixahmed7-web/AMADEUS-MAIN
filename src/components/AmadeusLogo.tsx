import React from 'react';

interface AmadeusLogoProps {
  className?: string;
  variant?: 'white' | 'blue' | 'full-white' | 'original';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AmadeusLogo: React.FC<AmadeusLogoProps> = ({
  className = '',
  variant = 'original',
  size = 'md',
}) => {
  const isWhite = variant === 'white' || variant === 'full-white';

  const sizeClasses = {
    sm: 'h-6 text-sm',
    md: 'h-8 text-base',
    lg: 'h-11 text-xl',
    xl: 'h-14 text-2xl',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`} id="amadeus-logo-container">
      {/* Amadeus Circular 'a' Emblem */}
      <svg
        className={sizeClasses}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        id="amadeus-emblem-svg"
      >
        <defs>
          <radialGradient id="amadeusGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#2575fc" />
            <stop offset="60%" stopColor="#005eb8" />
            <stop offset="100%" stopColor="#003e80" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#amadeusGrad)" />
        {/* Lowercase 'a' with classic serif shape */}
        <text
          x="50"
          y="68"
          fill="#ffffff"
          fontSize="56"
          fontWeight="bold"
          fontFamily="'Times New Roman', Times, 'Georgia', serif"
          textAnchor="middle"
        >
          a
        </text>
      </svg>

      {/* aMaDEUS wordmark */}
      <div
        className={`font-serif tracking-tight font-medium ${
          isWhite ? 'text-white' : 'text-[#005eb8]'
        }`}
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        id="amadeus-wordmark-text"
      >
        <span className="text-[1.1em] lowercase">a</span>
        <span className="text-[1.3em] uppercase font-semibold">M</span>
        <span className="text-[1.1em] lowercase">a</span>
        <span className="text-[1.3em] uppercase font-semibold">DEUS</span>
      </div>
    </div>
  );
};
