'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, ArrowRight, Home, FileText, ShieldCheck } from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { Button } from '@/components/ui/Button';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';

function InterventionResolvedContent() {
  const searchParams = useSearchParams();
  const outcome = searchParams.get('outcome') || 'void';
  const isVoid = outcome === 'void';

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
          Resolution Outcome Confirmation
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 py-12 space-y-6">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 space-y-6 text-center">
          <div className="flex justify-center">
            {isVoid ? (
              <div className="w-14 h-14 rounded-full bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center">
                <XCircle size={32} />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1E1E2A]">
              {isVoid
                ? 'Payment Safely Canceled'
                : 'Payment Verified & Captured'}
            </h1>
            <p className="text-[14px] text-[#6B7280] leading-relaxed max-w-md mx-auto">
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

          <div className="p-4 rounded-xl bg-[#FAFAFC] border border-[#E5E7EB] text-left text-[12px] space-y-2">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">PayPal Authorization Reference:</span>
              <span className="font-mono text-[#1E1E2A]">AUTH-HLD-99120</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Resolution Timestamp:</span>
              <span className="text-[#1E1E2A]">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Final Financial Debit:</span>
              <span className="font-mono font-bold text-[#1E1E2A]">
                {isVoid ? '$0.00 USD' : '$1,500.00 USD'}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/intervention/summary">
              <Button variant="primary" size="lg">
                <FileText size={15} />
                <span>View Full Protection Summary</span>
              </Button>
            </Link>
            <Link href="/merchant">
              <Button variant="outline" size="lg">
                <span>View in Merchant Console</span>
                <ArrowRight size={14} />
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
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-6">
          <div className="text-xs text-[#6B7280]">Loading resolution confirmation...</div>
        </div>
      }
    >
      <InterventionResolvedContent />
    </React.Suspense>
  );
}
