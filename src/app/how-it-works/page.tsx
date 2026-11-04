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
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#FFFFFF] border border-[#DFE2DF] text-[#171A1F] text-[11px] font-mono">
            <span>TECHNICAL SPECIFICATION</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#171A1F] leading-tight tracking-tight">
            How Pre-Capture Verification Works
          </h1>
          <p className="text-[15px] text-[#697078] leading-relaxed">
            Understanding the structural mechanics of PayPal two-step authorizations and how Scam Brake prevents funds from ever leaving the consumer’s account.
          </p>
        </div>

        {/* Master Motif */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6">
          <AuthorizationPath currentStage="REVIEW" variant="marketing" />
        </div>

        {/* Detailed Stage Breakdown */}
        <div className="space-y-6 pt-2">
          <div className="border-b border-[#DFE2DF] pb-3">
            <h2 className="text-2xl font-semibold text-[#171A1F] tracking-tight">The 5 Core Protocol Phases</h2>
            <p className="text-[13px] text-[#697078] mt-0.5">Step-by-step breakdown of how a protected payment moves from initiation to release.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-[6px] border border-[#DFE2DF] bg-[#FFFFFF] space-y-3">
              <span className="text-[11px] font-mono font-semibold text-[#697078]">
                PHASE 01
              </span>
              <h3 className="text-[16px] font-semibold text-[#171A1F]">
                Merchant Checkout Integration
              </h3>
              <p className="text-[13px] text-[#697078] leading-relaxed">
                The customer visits a participating merchant store and clicks &quot;Pay with PayPal&quot;. Instead of an immediate single-step capture, the checkout is configured to use PayPal’s <code className="font-mono text-[#171A1F] bg-[#F6F6F3] px-1 py-0.5 rounded border border-[#DFE2DF]">intent=AUTHORIZE</code> endpoint.
              </p>
            </div>

            <div className="p-6 rounded-[6px] border border-[#DFE2DF] bg-[#FFFFFF] space-y-3">
              <span className="text-[11px] font-mono font-semibold text-[#697078]">
                PHASE 02
              </span>
              <h3 className="text-[16px] font-semibold text-[#171A1F]">
                Contextual Risk & Threat Scoring
              </h3>
              <p className="text-[13px] text-[#697078] leading-relaxed">
                Scam Brake evaluates contextual telemetry: remote desktop connections (AnyDesk, TeamViewer), telephone pretexts, gift card velocity, and Channel3 commodity enrichment.
              </p>
            </div>

            <div className="p-6 rounded-[6px] border border-[#DFE2DF] bg-[#FFFFFF] space-y-3">
              <span className="text-[11px] font-mono font-semibold text-[#697078]">
                PHASE 03
              </span>
              <h3 className="text-[16px] font-semibold text-[#171A1F]">
                PayPal Authorization Hold
              </h3>
              <p className="text-[13px] text-[#697078] leading-relaxed">
                PayPal places a temporary hold on the approved amount (up to 24–72 hours). No funds have moved to the merchant balance. If fraud is stopped now, no chargeback dispute is needed.
              </p>
            </div>

            <div className="p-6 rounded-[6px] border border-[#DFE2DF] bg-[#FFFFFF] space-y-3">
              <span className="text-[11px] font-mono font-semibold text-[#697078]">
                PHASE 04
              </span>
              <h3 className="text-[16px] font-semibold text-[#171A1F]">
                Calm AI-Assisted Intervention
              </h3>
              <p className="text-[13px] text-[#697078] leading-relaxed">
                If risk indicators are flagged, the customer enters an unhurried, step-by-step check-in. The AI checks whether an active telephone caller is coercing the purchase or demanding secrecy.
              </p>
            </div>

            <div className="md:col-span-2 p-6 rounded-[6px] border border-[#1A7A64]/30 bg-[#EAF4F1] space-y-2">
              <span className="text-[11px] font-mono font-semibold text-[#1A7A64]">
                PHASE 05 — DETERMINISTIC RESOLUTION
              </span>
              <h3 className="text-[16px] font-semibold text-[#171A1F]">
                Deterministic Decision: Void vs. Capture
              </h3>
              <p className="text-[13px] text-[#697078] leading-relaxed">
                If the customer identifies coercion or a trusted contact alerts them, Scam Brake calls the PayPal Void Authorization API. The hold evaporates and the customer’s funds remain completely safe. If verified safe, the merchant calls the Capture API to fulfill the order.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="p-8 rounded-[6px] border border-[#DFE2DF] bg-[#FFFFFF] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-[16px] font-semibold text-[#171A1F]">
              Ready to test the interactive simulation?
            </div>
            <div className="text-[13px] text-[#697078] mt-0.5">
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
