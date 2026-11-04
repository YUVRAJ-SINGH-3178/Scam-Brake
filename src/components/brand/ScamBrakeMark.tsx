import React from 'react';

interface ScamBrakeMarkProps {
  className?: string;
  size?: number;
  variant?: 'light' | 'dark' | 'monochrome';
}

export const ScamBrakeMark: React.FC<ScamBrakeMarkProps> = ({
  className = '',
  size = 32,
  variant = 'light',
}) => {
  // Original Scam Brake Symbol: The Interrupted Authorization Gate
  // Left: Incoming payment trajectory
  // Center: Pre-capture verification caliper / hold gate
  // Right: Dual deterministic resolution paths (Capture & Void)
  const isDark = variant === 'dark';
  const railColor = isDark ? '#FFFFFF' : '#171A1F';
  const brakeColor = isDark ? '#FFFFFF' : '#171A1F';
  const tealAccent = '#1A7A64';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Scam Brake Emblem"
    >
      {/* Precision square badge with subtle 6px corner radius */}
      <rect width="32" height="32" rx="6" fill={isDark ? '#171A1F' : '#FFFFFF'} />
      <rect width="32" height="32" rx="6" stroke="#DFE2DF" strokeWidth="1" />

      {/* Trajectory entry from merchant */}
      <line x1="7" y1="16" x2="13" y2="16" stroke={railColor} strokeWidth="1.75" strokeLinecap="round" />

      {/* The Authorization Caliper / Brake Gate */}
      <line x1="14.5" y1="9.5" x2="14.5" y2="22.5" stroke={brakeColor} strokeWidth="2" strokeLinecap="round" />

      {/* Center verification hold node */}
      <circle cx="14.5" cy="16" r="2.75" fill={isDark ? '#171A1F' : '#FFFFFF'} stroke={brakeColor} strokeWidth="1.5" />
      <circle cx="14.5" cy="16" r="1.25" fill={tealAccent} />

      {/* Verified Forward Capture Path */}
      <path
        d="M17.5 16H24"
        stroke={tealAccent}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="16" r="1.5" fill={tealAccent} />

      {/* Upper Pre-Capture Void Escape Path */}
      <path
        d="M17.5 14C19.5 12 21 11 24 11"
        stroke="#697078"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeDasharray="1.5 1.5"
      />
    </svg>
  );
};

export const ScamBrakeLogo: React.FC<{
  className?: string;
  variant?: 'light' | 'dark';
  showTagline?: boolean;
}> = ({ className = '', variant = 'light', showTagline = false }) => {
  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <ScamBrakeMark size={28} variant={variant} />
      <div className="flex flex-col">
        <span
          className={`font-semibold tracking-tight text-[15px] leading-none ${
            isDark ? 'text-white' : 'text-[#171A1F]'
          }`}
        >
          SCAM <span className="font-normal text-[#697078]">BRAKE</span>
        </span>
        {showTagline && (
          <span className="text-[10px] text-[#697078] font-normal tracking-wide mt-0.5">
            Stop. Verify. Stay protected.
          </span>
        )}
      </div>
    </div>
  );
};
