'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';

function AuthorizingContent() {
  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-8 text-center space-y-6">
        <div className="flex justify-center">
          <ScamBrakeMark size={40} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-[#171A1F] tracking-tight">
            Checkout is unavailable
          </h1>
          <p className="text-[13px] text-[#525860] leading-relaxed">
            This prototype has not contacted PayPal. No order, authorization, or payment review exists.
          </p>
        </div>

        {/* Pulse Bar */}
        <div className="w-full bg-[#DFE2DF] h-1 rounded-[2px] overflow-hidden">
          <div
            className="h-full bg-[#171A1F] transition-[width] duration-700 ease-out"
            style={{
              width: '100%',
            }}
          />
        </div>

        <div className="p-3.5 rounded-[4px] bg-[#F6F6F3] border border-[#DFE2DF] text-[13px] text-[#525860] text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#171A1F]">Provider status</span>
            <code className="font-mono text-[#171A1F] text-xs">NOT CONNECTED</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#171A1F]">Protection</span>
            <span>Local prototype preview</span>
          </div>
        </div>
        <Link href="/checkout" className="text-sm underline underline-offset-4">Return to checkout preview</Link>
      </div>
    </div>
  );
}

export default function AuthorizingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center p-6">
          <div className="text-xs text-[#525860]"><code>Loading checkout status...</code></div>
        </div>
      }
    >
      <AuthorizingContent />
    </Suspense>
  );
}
