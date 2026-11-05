'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock } from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { Button } from '@/components/ui/Button';

function CheckoutStatusContent() {
  const searchParams = useSearchParams();
  void searchParams;

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased">
      <header className="h-14 bg-[#FFFFFF] border-b border-[#DFE2DF] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ScamBrakeMark size={24} />
          <span className="font-semibold text-[14px] tracking-tight text-[#171A1F]">
            SCAM BRAKE
          </span>
        </div>
        <div className="text-[12px] text-[#525860] font-medium">
          Payment Status
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 py-12 space-y-6">
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-8 space-y-6 text-center">
          <div className="w-10 h-10 rounded-full bg-[#EAF4F1] text-[#1A7A64] flex items-center justify-center mx-auto border border-[#1A7A64]/20">
            <Clock size={20} className="text-[#784D00]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[#171A1F] tracking-tight">
              No payment status is available
            </h1>
            <p className="text-[13px] text-[#525860] leading-relaxed max-w-md mx-auto">
              This prototype has not created a PayPal order or authorization. Query parameters do not confirm a payment outcome.
            </p>
          </div>


          <div className="pt-4 flex justify-center gap-3">
            <Link href="/merchant">
              <Button variant="secondary" size="sm">
                View in Merchant Ops
              </Button>
            </Link>
            <Link href="/">
              <Button variant="primary" size="sm">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center p-6">
          <div className="text-xs text-[#525860]"><code>Loading payment status...</code></div>
        </div>
      }
    >
      <CheckoutStatusContent />
    </Suspense>
  );
}
