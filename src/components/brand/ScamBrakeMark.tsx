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
  // Original Scam Brake Symbol:
  // "The Interrupted Payment Pathway"
  // Horizontal stream (checkout -> authorization) that enters a vertical caliper/brake gate.
  // The gate holds the token, showing the branching safe resolution paths (forward capture vs release).
  const isDark = variant === 'dark';
  const railColor = isDark ? '#EDEDF3' : '#1E1E2A';
  const brakeColor = '#2D5BFF'; // Scam Brake brand accent
  const voidColor = '#EF4444'; // Void safe release
  const captureColor = '#10B981'; // Capture path

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Scam Brake - Interrupted Authorization Pathway Mark"
    >
      {/* Background container if needed */}
      <rect width="40" height="40" rx="10" fill={isDark ? '#11121C' : '#FFFFFF'} />
      <rect width="40" height="40" rx="10" stroke={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'} strokeWidth="1" />

      {/* 1. Origin payment trajectory from left */}
      <line x1="8" y1="20" x2="17" y2="20" stroke={railColor} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="10" cy="20" r="2" fill={railColor} />

      {/* 2. The Verification Brake / Interruption Caliper */}
      {/* Upper brake arm */}
      <path d="M19 12V18" stroke={brakeColor} strokeWidth="3" strokeLinecap="round" />
      {/* Lower brake arm */}
      <path d="M19 22V28" stroke={brakeColor} strokeWidth="3" strokeLinecap="round" />
      {/* Center Hold Token: The active authorization hold node */}
      <circle cx="20" cy="20" r="3.5" fill={brakeColor} />
      <circle cx="20" cy="20" r="1.5" fill="#FFFFFF" />

      {/* 3. The Two Verified Outcomes */}
      {/* Upper Path: Void / Cancellation Release (deflected safely upward) */}
      <path
        d="M23 18C25 15 28 14 32 14"
        stroke={voidColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
      <circle cx="32" cy="14" r="1.75" fill={voidColor} />

      {/* Lower Path: Legitimate Capture (verified forward authorization) */}
      <path
        d="M23 22C25 25 28 26 32 26"
        stroke={captureColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="32" cy="26" r="1.75" fill={captureColor} />
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
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <ScamBrakeMark size={36} variant={variant} />
      <div className="flex flex-col">
        <span
          className={`font-semibold tracking-tight text-[17px] leading-tight ${
            isDark ? 'text-[#EDEDF3]' : 'text-[#1E1E2A]'
          }`}
        >
          SCAM<span className="text-[#2D5BFF] ml-1">BRAKE</span>
        </span>
        {showTagline && (
          <span className="text-[11px] text-[#6B7280] font-normal tracking-normal uppercase">
            Stop. Verify. Protect.
          </span>
        )}
      </div>
    </div>
  );
};
