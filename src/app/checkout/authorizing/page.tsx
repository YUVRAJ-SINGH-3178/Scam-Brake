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
        router.push('/checkout/status?outcome=captured&product=camera');
      } else {
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
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-8 text-center space-y-6">
        <div className="flex justify-center">
          <ScamBrakeMark size={40} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-[#171A1F] tracking-tight">
            {stage === 'CONTACTING_PAYPAL'
              ? 'Connecting with PayPal...'
              : stage === 'HOLD_PLACED'
              ? 'Authorization Hold Established'
              : 'Evaluating Risk Signals...'}
          </h1>
          <p className="text-[13px] text-[#697078] leading-relaxed">
            {stage === 'CONTACTING_PAYPAL'
              ? 'Requesting pre-capture authorization hold for order.'
              : stage === 'HOLD_PLACED'
              ? 'Funds are held in authorization. No money has moved.'
              : 'Verifying that this transaction is free of social engineering coercion.'}
          </p>
        </div>

        {/* Pulse Bar */}
        <div className="w-full bg-[#DFE2DF] h-1 rounded-[2px] overflow-hidden">
          <div
            className="h-full bg-[#171A1F] transition-all duration-700 ease-out"
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

        <div className="p-3.5 rounded-[4px] bg-[#F6F6F3] border border-[#DFE2DF] text-[12px] text-[#697078] text-left space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#171A1F]">Mode</span>
            <span className="font-mono text-[#171A1F]">intent=AUTHORIZE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#171A1F]">Protection</span>
            <span>Pre-Capture Verification Gate</span>
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
        <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center p-6">
          <div className="text-xs font-mono text-[#697078]">Connecting PayPal authorization hold...</div>
        </div>
      }
    >
      <AuthorizingContent />
    </Suspense>
  );
}
