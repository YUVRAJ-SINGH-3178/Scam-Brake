'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Button } from '@/components/ui/Button';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import { InteractiveDemo } from '@/components/marketing/InteractiveDemo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0C0C14] text-[#EDEDF3] flex flex-col antialiased selection:bg-[#2D5BFF]/30 selection:text-[#FFFFFF]">
      <MarketingNav />

      <main className="flex-1">
        {/* ==================================================
            1. HERO SECTION
            - Direction: Editorial report / The printed annual
            - Headline: "Pause the payment. Verify the request." (<= 2 lines)
            - Real Scam Brake interface fragment (not a fake screenshot)
            ================================================== */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-6 border-b border-[rgba(255,255,255,0.08)] overflow-hidden">
          <div className="max-w-7xl mx-auto">
            {/* 42% column editorial layout as specified in direction sheet */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column (5 cols, ~42% zone) */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(45,91,255,0.12)] border border-[#2D5BFF]/30 text-[#2D5BFF] text-[12px] font-mono">
                  <span>PAYPAL PRE-CAPTURE PROTECTION</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-white leading-[1.08]">
                  Pause the payment.
                  <br />
                  Verify the request.
                </h1>

                <p className="text-[16px] sm:text-[18px] text-[rgba(237,237,243,0.7)] leading-relaxed max-w-xl">
                  Scam Brake adds an AI-guided verification step between PayPal authorization and capture, helping customers question suspicious payment requests before they are completed.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a href="#demo">
                    <Button variant="primary" size="lg" className="text-[14px]">
                      <span>Run the protection demo</span>
                      <ArrowRight size={15} />
                    </Button>
                  </a>
                  <Link href="/merchant-integration">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-white border-[rgba(255,255,255,0.14)] text-[14px]"
                    >
                      Explore merchant integration
                    </Button>
                  </Link>
                </div>

                {/* Subtext guarantees */}
                <div className="flex flex-wrap items-center gap-6 pt-4 text-[12px] text-[rgba(237,237,243,0.5)] border-t border-[rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#10B981]" />
                    <span>No surprise debits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#10B981]" />
                    <span>Pre-capture voiding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#10B981]" />
                    <span>Zero chargeback fees</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Real Scam Brake Interface Fragment */}
              <div className="lg:col-span-6 space-y-4">
                <div data-ui="true" className="rounded-2xl border border-[rgba(255,255,255,0.14)] bg-[#11121C] p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.08)] text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                      <span className="font-mono text-[#F59E0B] font-semibold">
                        PAYMENT HOLD ACTIVE
                      </span>
                    </div>
                    <span className="font-mono text-[rgba(237,237,243,0.5)]">
                      REF: SB-2026-8819
                    </span>
                  </div>

                  {/* Transaction Snapshot */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[12px] text-[rgba(237,237,243,0.5)]">Authorized Total</div>
                      <div className="text-[32px] font-mono font-bold text-white tracking-tight">
                        $1,500.00 <span className="text-[14px] text-[rgba(237,237,243,0.5)] font-normal">USD</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#6B7280]">Merchant</div>
                      <div className="text-[13px] font-medium text-white">Apex Digital & Hardware</div>
                    </div>
                  </div>

                  {/* Active Authorization Path Motif */}
                  <AuthorizationPath
                    currentStage="REVIEW"
                    variant="marketing"
                    holdSecondsRemaining={74200}
                  />

                  <div className="p-3.5 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[12px] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#EF4444]">
                      <AlertTriangle size={15} />
                      <span className="font-semibold">Coercion Signal Detected</span>
                    </div>
                    <span className="text-[rgba(237,237,243,0.7)]">
                      IRS impersonation pattern match (94% confidence)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            2. THE CORE PROBLEM & THE AUTHORIZATION GAP
            ================================================== */}
        <section className="py-20 px-6 border-b border-[rgba(255,255,255,0.08)] bg-[#0E0E18]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl space-y-3">
              <span className="text-[12px] font-mono text-[#2D5BFF] font-semibold uppercase tracking-wider">
                The Structural Flaw in Fraud Prevention
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
                Traditional fraud systems protect cards.
                <br />
                They do not protect minds.
              </h2>
              <p className="text-[15px] text-[rgba(237,237,243,0.7)] leading-relaxed">
                When a victim is manipulated by a fake tax officer, bank investigator, or tech-support caller, they voluntarily enter their own credentials and approve the transaction. Conventional fraud engines see correct passwords and 2FA, letting the stolen money drain instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center font-semibold text-[14px]">
                  01
                </div>
                <h3 className="text-[16px] font-semibold text-white">
                  Voluntary Authorization
                </h3>
                <p className="text-[13px] text-[rgba(237,237,243,0.65)] leading-relaxed">
                  The victim believes they are preventing an arrest or recovering a compromised account. They authorize the payment themselves, bypassing card security checks.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center font-semibold text-[14px]">
                  02
                </div>
                <h3 className="text-[16px] font-semibold text-white">
                  The Irreversible Capture Trap
                </h3>
                <p className="text-[13px] text-[rgba(237,237,243,0.65)] leading-relaxed">
                  Once a merchant captures funds, the money is gone. Months of painful disputes, chargeback fees, and lost life savings follow.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[#2D5BFF]/30 bg-[#2D5BFF]/8 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[#2D5BFF]/20 text-[#2D5BFF] flex items-center justify-center font-semibold text-[14px]">
                  03
                </div>
                <h3 className="text-[16px] font-semibold text-white">
                  The Scam Brake Interruption
                </h3>
                <p className="text-[13px] text-[rgba(237,237,243,0.65)] leading-relaxed">
                  We place a safety wedge between PayPal authorization and capture. The authorization creates a temporary hold while Scam Brake gently investigates before funds leave.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            3. INTERACTIVE PRODUCT DEMONSTRATION SECTION
            ================================================== */}
        <section id="demo" className="py-20 px-6 border-b border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="max-w-2xl space-y-3">
              <span className="text-[12px] font-mono text-[#2D5BFF] font-semibold uppercase tracking-wider">
                Functional Scenario Walkthrough
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
                Experience Scam Brake in action.
              </h2>
              <p className="text-[15px] text-[rgba(237,237,243,0.7)] leading-relaxed">
                Test how our pre-capture verification protocol responds to real-world coercive scripts compared to standard legitimate purchases.
              </p>
            </div>

            <InteractiveDemo />
          </div>
        </section>

        {/* ==================================================
            4. HOW IT WORKS: THE 5-STAGE PIPELINE
            ================================================== */}
        <section className="py-20 px-6 border-b border-[rgba(255,255,255,0.08)] bg-[#0E0E18]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl space-y-3">
              <span className="text-[12px] font-mono text-[#2D5BFF] font-semibold uppercase tracking-wider">
                The Safety Mechanism
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
                How Scam Brake prevents fraudulent capture.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  phase: 'Checkout',
                  title: 'Order Initiation',
                  desc: 'Customer selects PayPal at a participating merchant checkout.',
                },
                {
                  phase: 'Telemetry',
                  title: 'Contextual Scan',
                  desc: 'Channel3 product enrichment and Elastic vector models check for coercive patterns.',
                },
                {
                  phase: 'Pre-Capture',
                  title: 'PayPal Authorization',
                  desc: 'PayPal authorizes the order, placing a temporary hold without capturing funds.',
                },
                {
                  phase: 'Verification',
                  title: 'Safety Check-In',
                  desc: 'If risk triggers, a calm, one-question check-in verifies the customer is uncoerced.',
                },
                {
                  phase: 'Resolution',
                  title: 'Settlement Decision',
                  desc: 'If fraud is confirmed, authorization is voided. If verified, funds are captured.',
                },
              ].map((item) => (
                <div
                  key={item.phase}
                  className="p-5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-2.5"
                >
                  <span className="text-[11px] font-mono text-[#2D5BFF] font-bold">
                    {item.phase}
                  </span>
                  <div className="text-[14px] font-semibold text-white">
                    {item.title}
                  </div>
                  <p className="text-[12px] text-[rgba(237,237,243,0.65)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================
            5. PRODUCT BOUNDARIES & SECURITY ETHICS
            ================================================== */}
        <section className="py-20 px-6 border-b border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl space-y-3">
              <span className="text-[12px] font-mono text-[#10B981] font-semibold uppercase tracking-wider">
                Trust & Strict Boundaries
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
                Engineered with strict customer privacy limits.
              </h2>
              <p className="text-[15px] text-[rgba(237,237,243,0.7)] leading-relaxed">
                Scam Brake is built on explicit consent and merchant integration. We do not engage in surveillance or unauthorized payment interception.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 space-y-4">
                <div className="flex items-center gap-2 text-[#10B981] font-semibold text-[15px]">
                  <CheckCircle2 size={18} />
                  <span>What Scam Brake Does</span>
                </div>
                <ul className="space-y-2.5 text-[13px] text-[rgba(237,237,243,0.8)]">
                  <li>• Integrates directly into merchant checkout via PayPal Partner APIs</li>
                  <li>• Pauses between authorization and capture only when risk flags trigger</li>
                  <li>• Converses voluntarily with customers to identify impersonation & threats</li>
                  <li>• Provides out-of-band phone directory checks via Kernel verification</li>
                  <li>• Notifies trusted emergency contacts only with explicit customer consent</li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 space-y-4">
                <div className="flex items-center gap-2 text-[#EF4444] font-semibold text-[15px]">
                  <XCircle size={18} />
                  <span>What Scam Brake Never Does</span>
                </div>
                <ul className="space-y-2.5 text-[13px] text-[rgba(237,237,243,0.8)]">
                  <li>• Never acts as a universal interceptor or eavesdropper across the web</li>
                  <li>• Never listens to telephone calls or intercepts device microphones</li>
                  <li>• Never charges or voids payments without policy rules and customer input</li>
                  <li>• Never sells customer conversation transcripts or financial profiles</li>
                  <li>• Never locks legitimate customers out of accounts or delays clean checkouts</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            6. FREQUENTLY ASKED QUESTIONS (FAQ)
            ================================================== */}
        <section className="py-20 px-6 border-b border-[rgba(255,255,255,0.08)] bg-[#0E0E18]">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="space-y-3">
              <span className="text-[12px] font-mono text-[#2D5BFF] font-semibold uppercase tracking-wider">
                Common Questions
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'How is an authorization hold different from a completed charge?',
                  a: 'When an authorization occurs, the bank confirms money is available and temporarily sets it aside, but no money is transferred to the merchant. Scam Brake operates entirely during this hold window. If the transaction is canceled, the authorization is voided immediately with zero dispute wait time.',
                },
                {
                  q: 'Does Scam Brake monitor all of my PayPal transactions?',
                  a: 'No. Scam Brake only functions at participating merchant checkouts that have integrated our pre-capture safety SDK. We do not monitor your global PayPal account, bank accounts, or external purchases.',
                },
                {
                  q: 'Will Scam Brake slow down my normal purchases?',
                  a: 'For 98%+ of normal e-commerce orders, risk scores remain in the single digits, and the authorization is captured instantly with zero added friction. The safety check-in only triggers when high-risk coercion patterns (such as gift cards combined with remote software or impersonation threats) are detected.',
                },
                {
                  q: 'Who decides whether to void or capture the payment?',
                  a: 'The customer and merchant policy. Scam Brake provides calm guidance, verified directory access, and trusted-contact alerts. If a customer realizes they are being defrauded, they can choose to void the authorization immediately.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-2"
                >
                  <div className="font-semibold text-[15px] text-white">
                    {item.q}
                  </div>
                  <p className="text-[13px] text-[rgba(237,237,243,0.7)] leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================
            7. FINAL CTA
            ================================================== */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight leading-tight">
              Stop social-engineering fraud before funds leave the account.
            </h2>
            <p className="text-[16px] text-[rgba(237,237,243,0.7)] leading-relaxed max-w-xl mx-auto">
              Join merchants and consumers building a safer checkout. Test our interactive simulation or explore the merchant operations app.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/demo">
                <Button variant="primary" size="lg">
                  <span>Run Live Protection Demo</span>
                  <ArrowRight size={15} />
                </Button>
              </Link>
              <Link href="/merchant">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)] text-white border-[rgba(255,255,255,0.14)]"
                >
                  Launch Merchant Portal
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
