'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ServerCrash, RotateCcw, Home } from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Scam Brake Caught Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1E1E2A] flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded p-8 text-center space-y-6">
        <div className="flex justify-center">
          <ScamBrakeMark size={36} />
        </div>

        <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#DC2626]/20 flex items-center justify-center mx-auto text-[#DC2626]">
          <ServerCrash size={22} />
        </div>

        <div className="space-y-1.5">
          <div className="font-mono text-xs text-[#DC2626] font-semibold">APPLICATION ERROR</div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1E1E2A]">
            Unexpected System Exception
          </h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            An unexpected error occurred while rendering the interface. Rest assured that PayPal pre-capture holds remain securely preserved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2 bg-[#2D5BFF] text-white hover:bg-[#2044C8] font-medium rounded transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={13} />
            <span>Retry Action</span>
          </button>
          <Link
            href="/merchant"
            className="w-full sm:w-auto px-4 py-2 bg-[#FAFAFC] border border-[#E5E7EB] hover:bg-[#FFFFFF] font-medium text-[#1E1E2A] rounded transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Home size={13} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
