'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';

function AuthorizingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const product = searchParams.get('product') || 'gift_cards';
  const [stage, setStage] = useState<'CONTACTING_PAYPAL' | 'HOLD_PLACED' | 'EVALUATING_RISK'>('CONTACTING_PAYPAL');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStage('HOLD_PLACED');
    }, 1200);

    const t2 = setTimeout(() => {
      setStage('EVALUATING_RISK');
    }, 2400);

    const t3 = setTimeout(() => {
      if (product === 'camera') {
        // Clean legitimate purchase -> go to status captured
        router.push('/checkout/status?outcome=captured&product=camera');
      } else {
        // Coercion risk -> trigger Scam Brake Intervention
        router.push('/intervention?product=' + product);
      }
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [product, router]);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1E1E2A] flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <ScamBrakeMark size={48} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-[#1E1E2A]">
            {stage === 'CONTACTING_PAYPAL'
              ? 'Connecting with PayPal...'
              : stage === 'HOLD_PLACED'
              ? 'Authorization Hold Established'
              : 'Scam Brake Risk Check Active...'}
          </h1>
          <p className="text-[13px] text-[#6B7280] leading-relaxed">
            {stage === 'CONTACTING_PAYPAL'
              ? 'Requesting pre-capture authorization for order.'
              : stage === 'HOLD_PLACED'
              ? 'Funds are held in escrow. No money has left your account yet.'
              : 'Verifying that this transaction is free of social-engineering coercion.'}
          </p>
        </div>

        {/* Pulse Bar */}
        <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2D5BFF] transition-all duration-700 ease-out"
            style={{
              width:
                stage === 'CONTACTING_PAYPAL'
                  ? '30%'
                  : stage === 'HOLD_PLACED'
                  ? '70%'
                  : '95%',
            }}
          />
        </div>

        <div className="p-3.5 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-[12px] text-[#6B7280] text-left space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#1E1E2A]">Mode:</span>
            <span className="font-mono text-[#2D5BFF]">intent=AUTHORIZE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#1E1E2A]">Protection Engine:</span>
            <span>Scam Brake v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthorizingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-6">
          <div className="text-xs text-[#6B7280]">Connecting PayPal authorization hold...</div>
        </div>
      }
    >
      <AuthorizingContent />
    </Suspense>
  );
}
