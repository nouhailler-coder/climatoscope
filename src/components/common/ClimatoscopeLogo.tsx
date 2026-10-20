import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  versionBadge?: boolean;
}

export const ClimatoscopeLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  versionBadge = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* High-tech Optical Earth Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-900 p-0.5 shadow-lg shadow-cyan-950/40 group-hover:shadow-cyan-500/20 transition-all duration-300 flex-shrink-0`}
      >
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden relative">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:6px_6px] opacity-30" />

          {/* SVG Vector Logo */}
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-1.5 relative z-10"
          >
            {/* Outer optical reticle ring */}
            <circle cx="18" cy="18" r="14.5" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
            
            {/* Globe sphere gradient */}
            <defs>
              <radialGradient id="globeGrad" cx="35%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="45%" stopColor="#0284c7" />
                <stop offset="90%" stopColor="#0f172a" />
              </radialGradient>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* Earth Core */}
            <circle cx="18" cy="18" r="10" fill="url(#globeGrad)" />

            {/* Latitude parallels */}
            <ellipse cx="18" cy="18" rx="10" ry="4" stroke="#e0f2fe" strokeWidth="0.8" opacity="0.75" />
            <line x1="8" y1="18" x2="28" y2="18" stroke="#e0f2fe" strokeWidth="0.9" opacity="0.85" />

            {/* Longitude meridian */}
            <ellipse cx="18" cy="18" rx="4.5" ry="10" stroke="#e0f2fe" strokeWidth="0.8" opacity="0.7" />

            {/* Climate Anomaly Signal Vector (thermal wave) */}
            <path
              d="M 6 23 C 11 25, 14 13, 19 16 C 24 19, 27 10, 31 12"
              stroke="url(#ringGrad)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Focal measurement sensor dot */}
            <circle cx="26" cy="12" r="1.8" fill="#f43f5e" />
            <circle cx="26" cy="12" r="3" stroke="#f43f5e" strokeWidth="0.7" opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`${textSizes[size]} font-bold tracking-tight text-white font-sans flex items-center gap-1`}>
              Climat<span className="text-cyan-400">OSCOPE</span>
            </span>
            {versionBadge && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold shadow-xs">
                v0.7
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
            Observatoire scientifique des mesures ouvertes
          </span>
        </div>
      )}
    </div>
  );
};
