'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PhoneCall,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { mockStore } from '@/services';

interface DirectoryResult {
  status: string;
  officialPhone: string;
  auditRef: string;
  timestamp: string;
  advisory: string;
}

function CustomerKernelVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId') || 'pay_sb_881901';

  const [payment] = useState(() => mockStore.getPaymentById(paymentId) || mockStore.getPaymentById('pay_sb_881901')!);
  const [selectedOrg, setSelectedOrg] = useState<'IRS' | 'BANK' | 'TECH' | 'SSA'>('IRS');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<DirectoryResult | null>(null);

  const orgDirectory = {
    IRS: {
      name: 'Internal Revenue Service (IRS)',
      category: 'Federal Tax Authority',
      officialSwitchboard: '1-800-829-1040',
      warning:
        'The IRS will NEVER call demanding immediate payment via gift cards, PayPal, or cryptocurrency, and will NEVER threaten law enforcement arrest over the phone.',
    },
    BANK: {
      name: 'National Financial Institution & Card Services',
      category: 'Banking / Card Issuer',
      officialSwitchboard: 'Call the number on the back of your physical card',
      warning:
        'Your bank fraud department will NEVER ask you to move your money to a "safety account" or purchase merchant vouchers to reverse a charge.',
    },
    TECH: {
      name: 'Microsoft / Apple Customer Support',
      category: 'Technology Provider',
      officialSwitchboard: '1-800-642-7676 (Microsoft) / 1-800-275-2273 (Apple)',
      warning:
        'Neither Microsoft nor Apple sends unclosable browser pop-ups with telephone numbers, and neither company requests remote control to issue refunds.',
    },
    SSA: {
      name: 'Social Security Administration (SSA)',
      category: 'Federal Benefits Administration',
      officialSwitchboard: '1-800-772-1213',
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
      'Customer verified official phone directory and cancelled fraudulent transaction.'
    );
    router.push(`/intervention/resolved?action=voided&paymentId=${payment.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#DFE2DF] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href={`/intervention?paymentId=${payment.id}`} className="text-[#525860] hover:text-[#171A1F] p-1">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <ScamBrakeMark size={24} />
            <span className="font-semibold text-[14px] tracking-tight text-[#171A1F]">
              SCAM BRAKE
            </span>
            <span className="text-[12px] text-[#525860] border-l border-[#DFE2DF] pl-2 font-medium">
              Directory verification
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-[#525860]">Hold: <code className="font-mono text-[#171A1F]">${payment.amount.toFixed(2)}</code> USD</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Anti-Spoofing Education Header */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-3">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#171A1F]">
            <PhoneCall size={16} className="text-[#171A1F]" />
            <span>Why Caller ID Cannot Be Trusted</span>
          </div>
          <p className="text-[13px] text-[#525860] leading-relaxed">
            Scammers routinely use inexpensive software to display the exact phone number and name of official government agencies or banks on your caller ID. This is called <strong className="text-[#171A1F]">Caller ID Spoofing</strong>.
          </p>
          <p className="text-[13px] text-[#525860] leading-relaxed">
            To protect you, Scam Brake provides verified public directories so you can independently verify who you are dealing with.
          </p>
        </div>

        {/* Agency Selection Tabs */}
        <div className="space-y-3">
          <label className="text-[12px] font-medium text-[#525860] block">
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
                className={`p-3 rounded-[6px] border text-[13px] font-medium transition-colors text-left cursor-pointer ${
                  selectedOrg === key
                    ? 'bg-[#171A1F] text-white border-[#171A1F]'
                    : 'bg-[#FFFFFF] border-[#DFE2DF] text-[#171A1F] hover:bg-[#F6F6F3]'
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
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE2DF]">
            <div>
              <div className="text-[12px] text-[#525860] font-medium">{currentOrg.category}</div>
              <h2 className="text-[15px] font-semibold text-[#171A1F]">{currentOrg.name}</h2>
            </div>
            <code className="font-mono text-[11px] text-[#1A7A64] bg-[#EAF4F1] px-2 py-0.5 rounded-[4px] border border-[#1A7A64]/20 font-medium">
              Verified Directory
            </code>
          </div>

          <div className="space-y-3 text-[13px]">
            <div className="p-3.5 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[4px] space-y-1">
              <span className="text-[#525860] block text-[12px]">Official Certified Switchboard:</span>
              <code className="font-mono text-[16px] font-semibold text-[#171A1F]">
                {currentOrg.officialSwitchboard}
              </code>
            </div>

            <div className="p-3.5 bg-[#FDE8E8] border border-[#C53030]/20 rounded-[4px] text-[#C53030] space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-[#C53030]" />
                <span>Critical Official Advisory</span>
              </div>
              <p className="leading-relaxed text-[13px]">{currentOrg.warning}</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRunKernelCheck}
              disabled={isVerifying}
              className="w-full py-2.5 bg-[#171A1F] text-white text-[13px] font-medium rounded-[6px] hover:bg-[#2B303A] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Cross-referencing official public registry...</span>
                </>
              ) : (
                <>
                  <Search size={14} />
                  <span>Run Independent Directory Verification</span>
                </>
              )}
            </button>
          </div>

          {/* Verification Results */}
          {verifiedResult && (
            <div className="mt-4 p-4 bg-[#EAF4F1] border border-[#1A7A64]/30 rounded-[4px] space-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1A7A64] flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  <span>Verification Directory Analysis Completed</span>
                </span>
                <code className="font-mono text-[11px] text-[#525860]">
                  Ref: {verifiedResult.auditRef}
                </code>
              </div>
              <p className="text-[#171A1F] leading-relaxed">{verifiedResult.advisory}</p>
              <div className="text-[12px] text-[#525860] pt-1 border-t border-[#1A7A64]/20 mt-1">
                Recommendation: If someone is on your phone instructing you to complete this PayPal checkout, hang up immediately. You can cancel this order safely below.
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link
            href={`/intervention?paymentId=${payment.id}`}
            className="text-[13px] text-[#525860] hover:text-[#171A1F] flex items-center gap-1 font-medium"
          >
            <ArrowLeft size={13} />
            <span>Return to Safety Conversation</span>
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCancelPayment}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#FFFFFF] border border-[#C53030]/40 text-[#C53030] text-[13px] font-medium rounded-[6px] hover:bg-[#FDE8E8] transition-colors cursor-pointer"
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
        <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center p-6">
          <div className="text-xs text-[#525860]"><code>Loading directory registry...</code></div>
        </div>
      }
    >
      <CustomerKernelVerifyContent />
    </React.Suspense>
  );
}
