'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Shield, ArrowRight, Clock, HelpCircle, Lock } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0C0C14] text-[#EDEDF3] flex flex-col antialiased">
      <MarketingNav />

      <main className="flex-1 py-16 px-6 max-w-6xl mx-auto w-full space-y-16">
        {/* Title Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(45,91,255,0.12)] border border-[#2D5BFF]/30 text-[#2D5BFF] text-[12px] font-mono">
            <span>TECHNICAL SPECIFICATION</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-white leading-tight">
            How Pre-Capture Verification Works
          </h1>
          <p className="text-[16px] text-[rgba(237,237,243,0.7)] leading-relaxed">
            Understanding the structural mechanics of PayPal two-step authorizations and how Scam Brake prevents funds from ever leaving the consumer’s account.
          </p>
        </div>

        {/* Master Motif */}
        <AuthorizationPath currentStage="REVIEW" variant="marketing" />

        {/* Detailed Stage Breakdown */}
        <div className="space-y-8 pt-4">
          <h2 className="text-2xl font-serif text-white">The 5 Core Phases</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-3">
              <span className="text-[11px] font-mono font-bold text-[#2D5BFF]">
                PHASE 01
              </span>
              <h3 className="text-[16px] font-semibold text-white">
                Merchant Checkout Integration
              </h3>
              <p className="text-[13px] text-[rgba(237,237,243,0.7)] leading-relaxed">
                The customer visits a participating merchant store and clicks &quot;Pay with PayPal&quot;. Instead of an immediate single-step capture, the checkout is configured to use PayPal’s <code className="text-[#2D5BFF]">intent=AUTHORIZE</code> endpoint.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-3">
              <span className="text-[11px] font-mono font-bold text-[#2D5BFF]">
                PHASE 02
              </span>
              <h3 className="text-[16px] font-semibold text-white">
                Contextual Risk & Threat Scoring
              </h3>
              <p className="text-[13px] text-[rgba(237,237,243,0.7)] leading-relaxed">
                Scam Brake evaluates contextual telemetry: remote desktop connections (AnyDesk, TeamViewer), telephone pretexts, gift card velocity, and Channel3 commodity enrichment.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-3">
              <span className="text-[11px] font-mono font-bold text-[#2D5BFF]">
                PHASE 03
              </span>
              <h3 className="text-[16px] font-semibold text-white">
                PayPal Authorization Hold
              </h3>
              <p className="text-[13px] text-[rgba(237,237,243,0.7)] leading-relaxed">
                PayPal places a temporary hold on the approved amount (up to 24–72 hours). No funds have moved to the merchant balance. If fraud is stopped now, no chargeback dispute is needed.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-3">
              <span className="text-[11px] font-mono font-bold text-[#2D5BFF]">
                PHASE 04
              </span>
              <h3 className="text-[16px] font-semibold text-white">
                Calm AI-Assisted Intervention
              </h3>
              <p className="text-[13px] text-[rgba(237,237,243,0.7)] leading-relaxed">
                If risk indicators are flagged, the customer enters an unhurried, step-by-step check-in. The AI checks whether an active telephone caller is coercing the purchase or demanding secrecy.
              </p>
            </div>

            <div className="md:col-span-2 p-6 rounded-xl border border-[#10B981]/25 bg-[#10B981]/5 space-y-3">
              <span className="text-[11px] font-mono font-bold text-[#10B981]">
                PHASE 05
              </span>
              <h3 className="text-[16px] font-semibold text-white">
                Deterministic Decision: Void vs. Capture
              </h3>
              <p className="text-[13px] text-[rgba(237,237,243,0.75)] leading-relaxed">
                If the customer identifies coercion or a trusted contact alerts them, Scam Brake calls the PayPal Void Authorization API. The hold evaporates and the customer’s funds remain completely safe. If verified safe, the merchant calls the Capture API to fulfill the order.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="p-8 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#11121C] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-[18px] font-semibold text-white">
              Ready to test the interactive simulation?
            </div>
            <div className="text-[13px] text-[rgba(237,237,243,0.6)]">
              Experience the verification flow across government impersonation and legitimate orders.
            </div>
          </div>
          <Link href="/demo">
            <Button variant="primary" size="md">
              <span>Launch Interactive Demo</span>
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
