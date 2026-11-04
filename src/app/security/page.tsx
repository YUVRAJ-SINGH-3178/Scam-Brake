'use client';

import React from 'react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { ShieldCheck, Lock, CheckCircle2, XCircle, FileText, Database } from 'lucide-react';

export default function SecurityPrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0C0C14] text-[#EDEDF3] flex flex-col antialiased">
      <MarketingNav />

      <main className="flex-1 py-16 px-6 max-w-5xl mx-auto w-full space-y-16">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(16,185,129,0.12)] border border-[#10B981]/30 text-[#10B981] text-[12px] font-mono">
            <span>GOVERNANCE & PRIVACY</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-white leading-tight">
            Security & Privacy Boundaries
          </h1>
          <p className="text-[16px] text-[rgba(237,237,243,0.7)] leading-relaxed">
            Scam Brake is an explicit pre-capture verification gate. We prioritize consumer trust, transparent data boundaries, and zero covert surveillance.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#2D5BFF]/15 text-[#2D5BFF] flex items-center justify-center">
              <Lock size={18} />
            </div>
            <h2 className="text-[16px] font-semibold text-white">
              No Unsanctioned Telephony Surveillance
            </h2>
            <p className="text-[13px] text-[rgba(237,237,243,0.7)] leading-relaxed">
              We never access smartphone microphones, record phone calls, or install background spyware on consumer devices. Check-ins are conducted voluntarily through our web intervention interface.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <h2 className="text-[16px] font-semibold text-white">
              Pre-Capture Voiding vs. Chargeback Disputes
            </h2>
            <p className="text-[13px] text-[rgba(237,237,243,0.7)] leading-relaxed">
              Because funds are only authorized (held) and not yet captured, a voided authorization releases the bank reservation instantly. No credit card disputes, zero merchant chargeback fees, and zero credit score damage.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center">
              <Database size={18} />
            </div>
            <h2 className="text-[16px] font-semibold text-white">
              Data Minimization & Encryption
            </h2>
            <p className="text-[13px] text-[rgba(237,237,243,0.7)] leading-relaxed">
              All payment telemetry and customer check-in conversations are encrypted at rest with AES-256 and in transit with TLS 1.3. Conversation transcripts are retained solely for merchant audit compliance and never sold to third parties.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#2D5BFF]/15 text-[#2D5BFF] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <h2 className="text-[16px] font-semibold text-white">
              Explicit Trusted Contact Consent
            </h2>
            <p className="text-[13px] text-[rgba(237,237,243,0.7)] leading-relaxed">
              Emergency contacts or designated family advocates are notified only when the consumer explicitly taps &quot;Notify Trusted Contact&quot; during an active intervention. We never auto-dial without explicit consent.
            </p>
          </div>
        </div>

        {/* Boundary Rules */}
        <div className="p-8 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#11121C] space-y-6">
          <h2 className="text-xl font-semibold text-white">
            Architectural Guarantees
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
              <span>Full compliance with PayPal Partner Commerce Platform guidelines</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
              <span>Automated hold expiration guarantees funds are freed if uncaptured</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
              <span>Immutable cryptographic hash generated for every operational decision</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
              <span>Zero machine-learning models trained on private customer chat data</span>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
