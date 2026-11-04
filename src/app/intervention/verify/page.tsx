'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PhoneCall,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Search,
  Building2,
  Clock,
} from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { mockStore } from '@/services';

function CustomerKernelVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId') || 'pay_sb_881901';

  const [payment] = useState(() => mockStore.getPaymentById(paymentId) || mockStore.getPaymentById('pay_sb_881901')!);
  const [selectedOrg, setSelectedOrg] = useState<'IRS' | 'BANK' | 'TECH' | 'SSA'>('IRS');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<any | null>(null);

  const orgDirectory = {
    IRS: {
      name: 'Internal Revenue Service (IRS)',
      category: 'Federal Tax Authority',
      officialSwitchboard: '1-800-829-1040',
      officialDomain: 'irs.gov',
      warning:
        'The IRS will NEVER call demanding immediate payment via gift cards, PayPal, or cryptocurrency, and will NEVER threaten law enforcement arrest over the phone.',
    },
    BANK: {
      name: 'National Financial Institution & Card Services',
      category: 'Banking / Card Issuer',
      officialSwitchboard: 'Call the number on the back of your physical card',
      officialDomain: 'consumerfinance.gov',
      warning:
        'Your bank fraud department will NEVER ask you to move your money to a "safety account" or purchase merchant vouchers to reverse a charge.',
    },
    TECH: {
      name: 'Microsoft / Apple Customer Support',
      category: 'Technology Provider',
      officialSwitchboard: '1-800-642-7676 (Microsoft) / 1-800-275-2273 (Apple)',
      officialDomain: 'microsoft.com / apple.com',
      warning:
        'Neither Microsoft nor Apple sends unclosable browser pop-ups with telephone numbers, and neither company requests remote control to issue refunds.',
    },
    SSA: {
      name: 'Social Security Administration (SSA)',
      category: 'Federal Benefits Administration',
      officialSwitchboard: '1-800-772-1213',
      officialDomain: 'ssa.gov',
      warning:
        'The SSA will NEVER threaten to suspend your Social Security Number or demand money to prevent legal proceedings.',
    },
  };

  const currentOrg = orgDirectory[selectedOrg];

  const handleRunKernelCheck = () => {
    setIsVerifying(true);
    setVerifiedResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedResult({
        status: 'CONFIRMED_FRAUD_INDICATOR',
        officialPhone: currentOrg.officialSwitchboard,
        auditRef: `KV-DIR-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString(),
        advisory:
          'Official public directory records confirm that legitimate agencies never initiate unsolicited payment requests for gift cards or digital vouchers.',
      });
    }, 900);
  };

  const handleCancelPayment = () => {
    mockStore.voidPayment(
      payment.id,
      'Customer verified official phone directory via Kernel and cancelled fraudulent transaction.'
    );
    router.push(`/intervention/resolved?action=voided&paymentId=${payment.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1E1E2A] flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href={`/intervention?paymentId=${payment.id}`} className="text-[#6B7280] hover:text-[#1E1E2A] p-1">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <ScamBrakeMark size={24} />
            <span className="font-semibold text-sm tracking-tight">
              SCAM<span className="text-[#2D5BFF]">BRAKE</span>
            </span>
            <span className="text-xs text-[#6B7280] border-l border-[#E5E7EB] pl-2 font-mono">
              INDEPENDENT DIRECTORY VERIFICATION
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[#6B7280]">Hold: ${payment.amount.toFixed(2)} USD</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Anti-Spoofing Education Header */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E1E2A]">
            <PhoneCall size={18} className="text-[#2D5BFF]" />
            Why Caller ID Cannot Be Trusted
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Scammers routinely use inexpensive software to display the exact phone number and name of official government agencies or banks on your caller ID. This is called <strong className="text-[#1E1E2A]">Caller ID Spoofing</strong>.
          </p>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            To protect you, Scam Brake provides verified public directories powered by Kernel out-of-band verification so you can independently verify who you are dealing with.
          </p>
        </div>

        {/* Agency Selection Tabs */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#6B7280]">
            Select who the caller claimed to represent:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['IRS', 'BANK', 'TECH', 'SSA'] as const).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedOrg(key);
                  setVerifiedResult(null);
                }}
                className={`p-3 rounded border text-xs font-medium transition-colors text-left ${
                  selectedOrg === key
                    ? 'bg-[#2D5BFF] text-white border-[#2D5BFF]'
                    : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#1E1E2A] hover:bg-[#FAFAFC]'
                }`}
              >
                {key === 'IRS' && 'IRS / Tax Dept'}
                {key === 'BANK' && 'Bank / Fraud Team'}
                {key === 'TECH' && 'Tech Support'}
                {key === 'SSA' && 'Social Security'}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <div className="text-[11px] font-mono text-[#6B7280]">{currentOrg.category}</div>
              <h2 className="text-base font-semibold text-[#1E1E2A]">{currentOrg.name}</h2>
            </div>
            <span className="font-mono text-xs text-[#059669] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 font-medium">
              Verified Public Registry
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#FAFAFC] border border-[#E5E7EB] rounded space-y-1">
              <span className="text-[#6B7280] block text-[11px]">Official Certified Switchboard:</span>
              <span className="font-mono text-base font-semibold text-[#1E1E2A]">
                {currentOrg.officialSwitchboard}
              </span>
            </div>

            <div className="p-3.5 bg-[#FEF2F2] border border-[#DC2626]/20 rounded text-[#991B1B] space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-[#DC2626]" />
                Critical Official Advisory
              </div>
              <p className="leading-relaxed">{currentOrg.warning}</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRunKernelCheck}
              disabled={isVerifying}
              className="w-full py-2.5 bg-[#2D5BFF] text-white text-xs font-medium rounded hover:bg-[#2044C8] transition-colors flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Cross-referencing official public registry...</span>
                </>
              ) : (
                <>
                  <Search size={14} />
                  <span>Run Kernel Independent Directory Verification</span>
                </>
              )}
            </button>
          </div>

          {/* Verification Results */}
          {verifiedResult && (
            <div className="mt-4 p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#059669] flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  Verification Directory Analysis Completed
                </span>
                <span className="font-mono text-[10px] text-[#6B7280]">
                  Ref: {verifiedResult.auditRef}
                </span>
              </div>
              <p className="text-[#1E1E2A] leading-relaxed">{verifiedResult.advisory}</p>
              <div className="text-[11px] text-[#6B7280] pt-1">
                Recommendation: If someone is on your phone instructing you to complete this PayPal checkout, hang up immediately. You can cancel this order safely below.
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link
            href={`/intervention?paymentId=${payment.id}`}
            className="text-xs text-[#6B7280] hover:text-[#1E1E2A] flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Return to Safety Conversation</span>
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCancelPayment}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#DC2626] text-white text-xs font-medium rounded hover:bg-[#B91C1C] transition-colors"
            >
              Cancel & Void Authorization Hold
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CustomerKernelVerifyPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-6">
          <div className="text-xs text-[#6B7280]">Loading independent directory registry...</div>
        </div>
      }
    >
      <CustomerKernelVerifyContent />
    </React.Suspense>
  );
}
