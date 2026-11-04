'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, ArrowRight, FileText } from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { Button } from '@/components/ui/Button';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';

function InterventionResolvedContent() {
  const searchParams = useSearchParams();
  const outcome = searchParams.get('outcome') || searchParams.get('action') || 'void';
  const isVoid = outcome === 'void' || outcome === 'voided';

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
          Outcome Confirmation
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 py-12 space-y-6">
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-8 space-y-6 text-center">
          <div className="flex justify-center">
            {isVoid ? (
              <div className="w-12 h-12 rounded-full bg-[#FDE8E8] text-[#C53030] flex items-center justify-center border border-[#C53030]/20">
                <XCircle size={24} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#EAF4F1] text-[#1A7A64] flex items-center justify-center border border-[#1A7A64]/20">
                <CheckCircle2 size={24} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[#171A1F] tracking-tight">
              {isVoid
                ? 'Payment Safely Canceled'
                : 'Payment Verified & Captured'}
            </h1>
            <p className="text-[13px] text-[#525860] leading-relaxed max-w-md mx-auto">
              {isVoid
                ? 'The PayPal authorization hold has been voided. Zero funds were captured or transferred. Your account balance remains completely intact.'
                : 'Your confirmation has been recorded. Merchant capture has completed and your order is proceeding normally.'}
            </p>
          </div>

          {/* Authorization Path in final state */}
          <div className="text-left pt-2">
            <AuthorizationPath
              currentStage={isVoid ? 'VOID' : 'CAPTURE'}
              variant="app"
              amount={1500.0}
            />
          </div>

          <div className="p-4 rounded-[6px] bg-[#F6F6F3] border border-[#DFE2DF] text-left text-[13px] space-y-2">
            <div className="flex justify-between">
              <span className="text-[#525860]">PayPal Authorization Reference:</span>
              <code className="font-mono text-[#171A1F]">AUTH-HLD-99120</code>
            </div>
            <div className="flex justify-between">
              <span className="text-[#525860]">Resolution Timestamp:</span>
              <span className="text-[#171A1F]">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#525860]">Final Financial Debit:</span>
              <span className="font-semibold text-[#171A1F] tabular-nums">
                <code className="font-mono">{isVoid ? '$0.00 USD' : '$1,500.00 USD'}</code>
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/intervention/summary">
              <Button variant="primary" size="md">
                <FileText size={14} />
                <span>Protection Summary</span>
              </Button>
            </Link>
            <Link href="/merchant">
              <Button variant="outline" size="md">
                <span>Merchant Console</span>
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function InterventionResolvedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center p-6">
          <div className="text-xs text-[#525860]"><code>Loading outcome...</code></div>
        </div>
      }
    >
      <InterventionResolvedContent />
    </Suspense>
  );
}
