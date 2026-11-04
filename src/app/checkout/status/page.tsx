'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, Home } from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { Button } from '@/components/ui/Button';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';

function CheckoutStatusContent() {
  const searchParams = useSearchParams();
  const outcome = searchParams.get('outcome') || 'hold';
  const isCaptured = outcome === 'captured';

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1E1E2A] flex flex-col antialiased">
      <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ScamBrakeMark size={30} />
          <span className="font-semibold text-[15px] tracking-tight">
            SCAM<span className="text-[#2D5BFF] ml-0.5">BRAKE</span>
          </span>
        </div>
        <div className="text-[12px] text-[#6B7280]">
          Payment Verification Status
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 py-12 space-y-6">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#10B981]/10 text-[#059669] flex items-center justify-center mx-auto">
            {isCaptured ? <CheckCircle2 size={24} /> : <Clock size={24} />}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[#1E1E2A]">
              {isCaptured ? 'Payment Captured Successfully' : 'Authorization In Review'}
            </h1>
            <p className="text-[13px] text-[#6B7280] leading-relaxed max-w-md mx-auto">
              {isCaptured
                ? 'Your order has been verified and settled through PayPal. The merchant is preparing your fulfillment.'
                : 'Scam Brake is currently reviewing the pre-capture authorization hold. Funds remain safe.'}
            </p>
          </div>

          <div className="pt-2">
            <AuthorizationPath
              status={isCaptured ? 'CAPTURED' : 'HOLD_ACTIVE'}
              amount={1499.0}
            />
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
        <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-6">
          <div className="text-xs text-[#6B7280]">Loading payment status...</div>
        </div>
      }
    >
      <CheckoutStatusContent />
    </Suspense>
  );
}
