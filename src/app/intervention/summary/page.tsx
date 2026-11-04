'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, ShieldCheck, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { Button } from '@/components/ui/Button';

export default function InterventionSummaryPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1E1E2A] flex flex-col antialiased">
      <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ScamBrakeMark size={30} />
          <span className="font-semibold text-[15px] tracking-tight">
            SCAM<span className="text-[#2D5BFF] ml-0.5">BRAKE</span>
          </span>
        </div>
        <Link href="/" className="text-[12px] text-[#2D5BFF] hover:underline">
          Return to Scam Brake
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1E1E2A]">
              Protected Payment Certificate & Audit Summary
            </h1>
            <p className="text-[13px] text-[#6B7280]">
              Official record of pre-capture authorization intervention and void release.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="cursor-pointer"
          >
            <Download size={14} />
            <span>Print / Save PDF</span>
          </Button>
        </div>

        {/* Certificate Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
            <div>
              <div className="text-[11px] font-mono text-[#6B7280] uppercase">
                INCIDENT REFERENCE
              </div>
              <div className="text-[18px] font-mono font-bold text-[#2D5BFF]">
                SB-2026-8819
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#10B981]/10 text-[#059669] text-[12px] font-semibold border border-[#10B981]/20">
              FUNDS FULLY PROTECTED
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div>
              <div className="text-[11px] text-[#6B7280]">Consumer Name</div>
              <div className="font-medium text-[#1E1E2A]">Martha Stephenson</div>
            </div>
            <div>
              <div className="text-[11px] text-[#6B7280]">PayPal Order ID</div>
              <div className="font-mono text-[#1E1E2A]">ORD-PP-7749210</div>
            </div>
            <div>
              <div className="text-[11px] text-[#6B7280]">Merchant Store</div>
              <div className="font-medium text-[#1E1E2A]">Apex Digital & Hardware</div>
            </div>
            <div>
              <div className="text-[11px] text-[#6B7280]">Original Authorized Amount</div>
              <div className="font-mono font-semibold text-[#1E1E2A]">$1,500.00 USD</div>
            </div>
            <div>
              <div className="text-[11px] text-[#6B7280]">Final Captured Amount</div>
              <div className="font-mono font-bold text-[#10B981]">$0.00 USD (Voided)</div>
            </div>
            <div>
              <div className="text-[11px] text-[#6B7280]">Intervention Duration</div>
              <div className="text-[#1E1E2A]">2 minutes 45 seconds</div>
            </div>
          </div>

          {/* Key Findings */}
          <div className="p-4 rounded-xl bg-[#FAFAFC] border border-[#E5E7EB] space-y-2 text-[12px]">
            <div className="font-semibold text-[#1E1E2A]">
              Intervention Verification Summary:
            </div>
            <ul className="space-y-1.5 text-[#4B5563]">
              <li>• Impersonator attempted to pose as Federal Tax Enforcement over incoming phone call.</li>
              <li>• Scam Brake held authorization prior to merchant gift voucher generation.</li>
              <li>• Out-of-band Kernel directory check confirmed no active IRS action.</li>
              <li>• Trusted contact (David Stephenson) notified with explicit consumer consent.</li>
              <li>• Buyer voluntarily selected &quot;Void Authorization&quot;, releasing held funds immediately.</li>
            </ul>
          </div>

          {/* Cryptographic Proof */}
          <div className="pt-2 text-[11px] font-mono text-[#9CA3AF] space-y-1">
            <div>Cryptographic Verification Hash:</div>
            <div className="p-2.5 rounded bg-[#F8F9FB] border border-[#E5E7EB] text-[#6B7280] break-all select-all">
              sha256:7c9e1b2f4a5d8e0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[13px] pt-4">
          <Link
            href="/merchant"
            className="text-[#2D5BFF] hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Open Merchant Operations View</span>
          </Link>
          <Link href="/" className="text-[#6B7280] hover:text-[#1E1E2A]">
            Return Home
          </Link>
        </div>
      </main>
    </div>
  );
}
