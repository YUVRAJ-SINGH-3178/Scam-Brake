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
  const isDark = variant === 'dark';

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-[6px] border ${
        isDark ? 'border-[#2B303A] bg-[#171A1F]' : 'border-[#DFE2DF] bg-white'
      } ${className}`}
      style={{ width: size, height: size }}
      aria-label="Scam Brake Logo"
    >
      <img
        src="/images/scambrake-logo.png"
        alt="Scam Brake"
        width={size}
        height={size}
        className="object-contain w-full h-full p-0.5 select-none pointer-events-none"
      />
    </span>
  );
};

export const ScamBrakeLogo: React.FC<{
  className?: string;
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  size?: number;
}> = ({ className = '', variant = 'light', showTagline = false, size = 28 }) => {
  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <ScamBrakeMark size={size} variant={variant} />
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
