'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased selection:bg-[#1A7A64]/15">
      <MarketingNav />

      <main className="flex-1 py-16 px-6 max-w-6xl mx-auto w-full space-y-16">
        {/* Title Header */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#171A1F] leading-tight tracking-tight">
            How Pre-Capture Verification Works
          </h1>
          <p className="text-[17px] text-[#171A1F] leading-relaxed max-w-2xl">
            Understanding the structural mechanics of PayPal two-step authorizations and how Scam Brake prevents funds from ever leaving the consumer’s account.
          </p>
        </div>

        {/* Master Motif */}
        <div>
          <AuthorizationPath currentStage="REVIEW" variant="marketing" />
        </div>

        {/* Detailed Stage Breakdown */}
        <div className="space-y-8 pt-4">
          <div className="pb-4">
            <h2 className="text-3xl font-semibold text-[#171A1F] tracking-tight">The 5 Core Protocol Phases</h2>
            <p className="text-[16px] text-[#525860] mt-1 max-w-2xl">Step-by-step breakdown of how a protected payment moves from initiation to release.</p>
          </div>

          <div className="space-y-6">
            <div className="p-8 rounded-[6px] bg-[#FFFFFF] space-y-3">
              <div className="text-[13px] font-mono text-[#525860]">
                <code>CHECKOUT INTEGRATION</code>
              </div>
              <h3 className="text-[20px] font-semibold text-[#171A1F]">
                Merchant Checkout Integration
              </h3>
              <p className="text-[16px] text-[#171A1F] leading-relaxed max-w-3xl">
                The customer visits a participating merchant store and clicks &quot;Pay with PayPal&quot;. Instead of an immediate single-step capture, the checkout is configured to use PayPal’s <code className="font-mono text-[#171A1F] bg-[#F6F6F3] px-1.5 py-0.5 rounded border border-[#DFE2DF]">intent=AUTHORIZE</code> endpoint.
              </p>
            </div>

            <div className="p-8 rounded-[6px] bg-[#FFFFFF] space-y-3">
              <div className="text-[13px] font-mono text-[#525860]">
                <code>RISK TELEMETRY</code>
              </div>
              <h3 className="text-[20px] font-semibold text-[#171A1F]">
                Contextual Risk & Threat Scoring
              </h3>
              <p className="text-[16px] text-[#171A1F] leading-relaxed max-w-3xl">
                Scam Brake evaluates contextual telemetry: remote desktop connections (AnyDesk, TeamViewer), telephone pretexts, gift card velocity, and Channel3 commodity enrichment.
              </p>
            </div>

            <div className="p-8 rounded-[6px] bg-[#FFFFFF] space-y-3">
              <div className="text-[13px] font-mono text-[#525860]">
                <code>PAYPAL HOLD</code>
              </div>
              <h3 className="text-[20px] font-semibold text-[#171A1F]">
                PayPal Authorization Hold
              </h3>
              <p className="text-[16px] text-[#171A1F] leading-relaxed max-w-3xl">
                PayPal places a temporary hold on the approved amount (up to 24–72 hours). No funds have moved to the merchant balance. If fraud is stopped now, no chargeback dispute is needed.
              </p>
            </div>

            <div className="p-8 rounded-[6px] bg-[#FFFFFF] space-y-3">
              <div className="text-[13px] font-mono text-[#525860]">
                <code>VERIFICATION INTERVENTION</code>
              </div>
              <h3 className="text-[20px] font-semibold text-[#171A1F]">
                Calm AI-Assisted Intervention
              </h3>
              <p className="text-[16px] text-[#171A1F] leading-relaxed max-w-3xl">
                If risk indicators are flagged, the customer enters an unhurried, step-by-step check-in. The AI checks whether an active telephone caller is coercing the purchase or demanding secrecy.
              </p>
            </div>

            <div className="p-8 rounded-[6px] bg-[#EAF4F1] border border-[#1A7A64]/30 space-y-3">
              <div className="text-[13px] font-mono text-[#1A7A64] font-medium">
                <code>DETERMINISTIC RESOLUTION</code>
              </div>
              <h3 className="text-[20px] font-semibold text-[#171A1F]">
                Deterministic Decision: Void vs. Capture
              </h3>
              <p className="text-[16px] text-[#171A1F] leading-relaxed max-w-3xl">
                If the customer identifies coercion or a trusted contact alerts them, Scam Brake calls the PayPal Void Authorization API. The hold evaporates and the customer’s funds remain completely safe. If verified safe, the merchant calls the Capture API to fulfill the order.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="p-8 rounded-[6px] bg-[#FFFFFF] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-[18px] font-semibold text-[#171A1F]">
              Ready to test the interactive simulation?
            </div>
            <div className="text-[14px] text-[#525860] mt-1">
              Experience the verification flow across government impersonation and legitimate orders.
            </div>
          </div>
          <Link href="/demo">
            <Button variant="primary" size="md">
              <span>Launch Interactive Demo</span>
              <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
