'use client';

import React from 'react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { ShieldCheck, Lock, CheckCircle2, FileText, Database } from 'lucide-react';

export default function SecurityPrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased selection:bg-[#1A7A64]/15">
      <MarketingNav />

      <main className="flex-1 py-16 px-6 max-w-5xl mx-auto w-full space-y-16">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#171A1F] leading-tight tracking-tight">
            Security & Privacy Boundaries
          </h1>
          <p className="text-[17px] text-[#171A1F] leading-relaxed max-w-2xl">
            Scam Brake is an explicit pre-capture verification gate. We prioritize consumer trust, transparent data boundaries, and zero covert surveillance.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-8 rounded-[6px] bg-[#FFFFFF] space-y-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#F6F6F3] border border-[#DFE2DF] text-[#171A1F] flex items-center justify-center">
              <Lock size={16} />
            </div>
            <h2 className="text-[18px] font-semibold text-[#171A1F]">
              No Unsanctioned Telephony Surveillance
            </h2>
            <p className="text-[15px] text-[#171A1F] leading-relaxed">
              We never access smartphone microphones, record phone calls, or install background spyware on consumer devices. Check-ins are conducted voluntarily through our web intervention interface.
            </p>
          </div>

          <div className="p-8 rounded-[6px] bg-[#FFFFFF] space-y-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#EAF4F1] border border-[#1A7A64]/20 text-[#1A7A64] flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <h2 className="text-[18px] font-semibold text-[#171A1F]">
              Pre-Capture Voiding vs. Chargeback Disputes
            </h2>
            <p className="text-[15px] text-[#171A1F] leading-relaxed">
              A pre-capture void can terminate an authorization according to PayPal state and issuer timing. This prototype has no live payment flow, and makes no fee, dispute, or credit-score outcome guarantee.
            </p>
          </div>

          <div className="p-8 rounded-[6px] bg-[#FFFFFF] space-y-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#FAF2E4] border border-[#784D00]/20 text-[#784D00] flex items-center justify-center">
              <Database size={16} />
            </div>
            <h2 className="text-[18px] font-semibold text-[#171A1F]">
              Data Minimization & Encryption
            </h2>
            <p className="text-[15px] text-[#171A1F] leading-relaxed">
              All payment telemetry and customer check-in conversations are encrypted at rest with AES-256 and in transit with TLS 1.3. Conversation transcripts are retained solely for merchant audit compliance and never sold to third parties.
            </p>
          </div>

          <div className="p-8 rounded-[6px] bg-[#FFFFFF] space-y-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#F6F6F3] border border-[#DFE2DF] text-[#171A1F] flex items-center justify-center">
              <FileText size={16} />
            </div>
            <h2 className="text-[18px] font-semibold text-[#171A1F]">
              Explicit Trusted Contact Consent
            </h2>
            <p className="text-[15px] text-[#171A1F] leading-relaxed">
              Emergency contacts or designated family advocates are notified only when the consumer explicitly taps &quot;Notify Trusted Contact&quot; during an active intervention. We never auto-dial without explicit consent.
            </p>
          </div>
        </div>

        {/* Boundary Rules */}
        <div className="p-8 rounded-[6px] bg-[#FFFFFF] space-y-6">
          <h2 className="text-2xl font-semibold text-[#171A1F] tracking-tight">
            Architectural Guarantees
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[14px] text-[#171A1F]">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#1A7A64] shrink-0 mt-0.5" />
              <span>Full compliance with PayPal Partner Commerce Platform guidelines</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#1A7A64] shrink-0 mt-0.5" />
            <span>Hold expiration and fund availability depend on PayPal and the funding institution; this prototype does not operate authorizations.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#1A7A64] shrink-0 mt-0.5" />
              <span>Immutable cryptographic hash generated for every operational decision</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#1A7A64] shrink-0 mt-0.5" />
              <span>Zero machine-learning models trained on private customer chat data</span>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
