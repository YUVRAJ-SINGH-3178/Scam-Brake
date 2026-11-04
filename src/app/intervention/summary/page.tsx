'use client';

import React from 'react';
import Link from 'next/link';
import { Download, ArrowLeft } from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { Button } from '@/components/ui/Button';

export default function InterventionSummaryPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased">
      <header className="h-14 bg-[#FFFFFF] border-b border-[#DFE2DF] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ScamBrakeMark size={24} />
          <span className="font-semibold text-[14px] tracking-tight text-[#171A1F]">
            SCAM BRAKE
          </span>
        </div>
        <Link href="/" className="text-[12px] text-[#171A1F] hover:underline">
          Return Home
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#171A1F] tracking-tight">
              Payment Certificate & Audit Summary
            </h1>
            <p className="text-[13px] text-[#697078]">
              Official record of pre-capture authorization intervention and void release.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="cursor-pointer"
          >
            <Download size={13} />
            <span>Print PDF</span>
          </Button>
        </div>

        {/* Certificate Card */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#DFE2DF]">
            <div>
              <div className="text-[10px] font-mono text-[#697078] uppercase">
                INCIDENT REFERENCE
              </div>
              <div className="text-[16px] font-mono font-bold text-[#171A1F]">
                SB-2026-8819
              </div>
            </div>
            <div className="px-2.5 py-0.5 rounded-[4px] bg-[#EAF4F1] text-[#1A7A64] text-[11px] font-mono font-semibold border border-[#1A7A64]/20">
              FUNDS PROTECTED
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[12px]">
            <div>
              <div className="text-[11px] text-[#697078]">Consumer Name</div>
              <div className="font-medium text-[#171A1F]">Martha Stephenson</div>
            </div>
            <div>
              <div className="text-[11px] text-[#697078]">PayPal Order ID</div>
              <div className="font-mono text-[#171A1F]">ORD-PP-7749210</div>
            </div>
            <div>
              <div className="text-[11px] text-[#697078]">Merchant Store</div>
              <div className="font-medium text-[#171A1F]">Apex Digital & Hardware</div>
            </div>
            <div>
              <div className="text-[11px] text-[#697078]">Authorized Amount</div>
              <div className="font-mono font-semibold text-[#171A1F] tabular-nums">$1,500.00 USD</div>
            </div>
            <div>
              <div className="text-[11px] text-[#697078]">Final Captured Amount</div>
              <div className="font-mono font-bold text-[#1A7A64] tabular-nums">$0.00 USD (Voided)</div>
            </div>
            <div>
              <div className="text-[11px] text-[#697078]">Intervention Duration</div>
              <div className="text-[#171A1F]">2 minutes 45 seconds</div>
            </div>
          </div>

          {/* Key Findings */}
          <div className="p-4 rounded-[4px] bg-[#F6F6F3] border border-[#DFE2DF] space-y-2 text-[12px]">
            <div className="font-semibold text-[#171A1F]">
              Intervention Summary:
            </div>
            <ul className="space-y-1.5 text-[#697078]">
              <li>• Impersonator attempted to pose as Federal Tax Enforcement over incoming phone call.</li>
              <li>• Scam Brake held authorization prior to merchant gift voucher generation.</li>
              <li>• Out-of-band directory check confirmed no active IRS action.</li>
              <li>• Trusted contact (David Stephenson) notified with explicit consumer consent.</li>
              <li>• Buyer voluntarily selected &quot;Void Authorization&quot;, releasing held funds immediately.</li>
            </ul>
          </div>

          {/* Cryptographic Proof */}
          <div className="pt-2 text-[11px] font-mono text-[#697078] space-y-1">
            <div>Cryptographic Verification Hash:</div>
            <div className="p-2.5 rounded-[4px] bg-[#F6F6F3] border border-[#DFE2DF] text-[#171A1F] break-all select-all">
              sha256:7c9e1b2f4a5d8e0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[12px] pt-4">
          <Link
            href="/merchant"
            className="text-[#171A1F] hover:text-[#1A7A64] hover:underline flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft size={13} />
            <span>Open Merchant Operations</span>
          </Link>
          <Link href="/" className="text-[#697078] hover:text-[#171A1F]">
            Return Home
          </Link>
        </div>
      </main>
    </div>
  );
}
