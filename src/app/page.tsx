'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Button } from '@/components/ui/Button';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import { InteractiveDemo } from '@/components/marketing/InteractiveDemo';

export default function HomePage() {
  const [heroState, setHeroState] = useState<'HOLD' | 'VOID' | 'CAPTURE'>('HOLD');

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased">
      <MarketingNav />

      <main className="flex-1">
        {/* ==================================================
            1. HERO SECTION (Asymmetric Editorial Layout)
            ================================================== */}
        <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-6 bg-[#F6F6F3]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
              {/* Left Column: Headline & Value Proposition */}
              <div className="lg:col-span-6 space-y-6 animate-entrance">
                <h1 className="text-3xl sm:text-[36px] lg:text-[46px] font-semibold tracking-tight text-[#171A1F] leading-[1.14]">
                  Stop the payment before pressure wins.
                </h1>

                <p className="text-[17px] text-[#2B303A] leading-relaxed max-w-xl">
                  Scam Brake introduces a verification hold between PayPal authorization and capture, stopping social-engineering fraud before irreversible settlement.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a href="#demo">
                    <Button variant="primary" size="lg">
                      <span>Explore Interactive Demo</span>
                      <ArrowRight size={15} />
                    </Button>
                  </a>
                  <Link href="/merchant-integration">
                    <Button variant="secondary" size="lg">
                      <span>Merchant Integration</span>
                    </Button>
                  </Link>
                </div>

                {/* Assurance Metrics & Boundaries */}
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-[#2B303A]">
                  <div className="animate-entrance">
                    <div className="font-semibold text-[#171A1F] text-[15px]">Pre-Capture Hold</div>
                    <div className="text-[15px] mt-1.5 text-[#2B303A] leading-relaxed">
                      Funds held safely in PayPal, never debited prematurely.
                    </div>
                  </div>
                  <div className="animate-entrance">
                    <div className="font-semibold text-[#171A1F] text-[15px]">$0 Dispute Fees</div>
                    <div className="text-[15px] mt-1.5 text-[#2B303A] leading-relaxed">
                      Pre-capture void releases holds with zero chargeback penalty.
                    </div>
                  </div>
                  <div className="animate-entrance">
                    <div className="font-semibold text-[#171A1F] text-[15px]">Zero Surveillance</div>
                    <div className="text-[15px] mt-1.5 text-[#2B303A] leading-relaxed">
                      No call eavesdropping. Voluntary customer evidence only.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Realistic Financial Product Interface Visualization */}
              <div className="lg:col-span-6 space-y-4 animate-entrance">
                <div
                  data-ui="true"
                  className="min-h-[280px] bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-5"
                >
                  {/* Interface Header Bar */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#DFE2DF] text-[13px]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          heroState === 'HOLD'
                            ? 'bg-[#784D00]'
                            : heroState === 'VOID'
                            ? 'bg-[#C53030]'
                            : 'bg-[#1A7A64]'
                        }`}
                      />
                      <span className="text-[#171A1F] font-semibold">
                        <code>
                          {heroState === 'HOLD'
                            ? 'PAYMENT HOLD ACTIVE'
                            : heroState === 'VOID'
                            ? 'AUTHORIZATION VOIDED'
                            : 'SETTLEMENT CAPTURED'}
                        </code>
                      </span>
                    </div>
                    <span className="text-[#525860]">
                      <code>REF: SB-2026-8819</code>
                    </span>
                  </div>

                  {/* Transaction Overview */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[13px] text-[#525860]">Held Authorization Amount</div>
                      <div className="text-[28px] font-semibold text-[#171A1F] tracking-tight tabular-nums">
                        <code>$1,500.00</code> <span className="text-[14px] text-[#525860] font-normal">USD</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] text-[#525860]">Merchant Partner</div>
                      <div className="text-[14px] font-medium text-[#171A1F]">Apex Digital &amp; Hardware</div>
                    </div>
                  </div>

                  {/* The Authorization Path Motif */}
                  <AuthorizationPath
                    status={
                      heroState === 'HOLD'
                        ? 'HOLD_ACTIVE'
                        : heroState === 'VOID'
                        ? 'VOIDED'
                        : 'CAPTURED'
                    }
                    holdSecondsRemaining={heroState === 'HOLD' ? 1800 : 0}
                  />

                  {/* Coercion Risk Signal Banner */}
                  <div
                    className={`p-3.5 rounded-[6px] border text-[13px] flex items-center justify-between ${
                      heroState === 'VOID'
                        ? 'bg-[#FDE8E8] border-[#C53030]/25 text-[#C53030]'
                        : heroState === 'CAPTURE'
                        ? 'bg-[#EAF4F1] border-[#1A7A64]/25 text-[#1A7A64]'
                        : 'bg-[#FAF2E4] border-[#784D00]/25 text-[#784D00]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={15} />
                      <span className="font-semibold">
                        {heroState === 'VOID'
                          ? 'Extortion Scam Confirmed: Pre-Capture Void Executed'
                          : heroState === 'CAPTURE'
                          ? 'Volition Confirmed: Payment Captured to Merchant'
                          : 'Federal Tax Warrant Impersonation Pattern (94% confidence)'}
                      </span>
                    </div>
                    <span className="text-[13px] font-medium">
                      <code>{heroState === 'HOLD' ? 'Channel3 + Elastic' : 'Resolved'}</code>
                    </span>
                  </div>

                  {/* Interactive Toggle Controls for Reviewers */}
                  <div className="pt-2 flex items-center justify-between gap-3 text-[13px] border-t border-[#DFE2DF]">
                    <span className="text-[#525860]">Interactive Test:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHeroState('VOID')}
                        className={`px-3 py-1.5 rounded-[6px] text-xs font-medium border transition-colors cursor-pointer ${
                          heroState === 'VOID'
                            ? 'bg-[#C53030] text-white border-[#C53030]'
                            : 'bg-[#FFFFFF] border-[#DFE2DF] text-[#C53030] hover:bg-[#FDE8E8]'
                        }`}
                      >
                        Simulate Customer Void ($0 fee)
                      </button>
                      <button
                        onClick={() => setHeroState('CAPTURE')}
                        className={`px-3 py-1.5 rounded-[6px] text-xs font-medium border transition-colors cursor-pointer ${
                          heroState === 'CAPTURE'
                            ? 'bg-[#1A7A64] text-white border-[#1A7A64]'
                            : 'bg-[#FFFFFF] border-[#DFE2DF] text-[#1A7A64] hover:bg-[#EAF4F1]'
                        }`}
                      >
                        Simulate Capture
                      </button>
                      <button
                        onClick={() => setHeroState('HOLD')}
                        className="p-1.5 text-[#525860] hover:text-[#171A1F] border border-[#DFE2DF] rounded-[6px] cursor-pointer"
                        title="Reset state"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            2. THE STRUCTURAL BLINDSPOT (Asymmetric Split Editorial)
            ================================================== */}
        <section className="py-24 px-6 bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Essay */}
              <div className="lg:col-span-6 space-y-5 animate-entrance">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A1F] leading-tight">
                  Authentication cannot protect volition.
                </h2>
                <p className="text-[16px] text-[#2B303A] leading-relaxed">
                  When a customer is coerced over the phone by an imposter pretending to be from the IRS, their bank fraud department, or remote tech support, they enter their own passwords, pass 2FA challenges, and click approve in their own PayPal wallet.
                </p>
                <p className="text-[16px] text-[#2B303A] leading-relaxed">
                  Because credentials match, conventional fraud engines classify the transaction as low-risk. The payment settles immediately, and the customer’s funds are permanently lost before they realize they were deceived.
                </p>
              </div>

              {/* Right Anatomy Comparison Panel */}
              <div className="lg:col-span-6 space-y-4">
                {/* Traditional Immediate Capture Failure */}
                <div
                  data-ui="true"
                  className="min-h-[170px] p-6 rounded-[6px] border border-[#DFE2DF] bg-[#F6F6F3] space-y-3 animate-entrance"
                >
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-[#C53030]">Traditional Merchant Flow</span>
                    <span className="text-[13px] text-[#C53030]">
                      <code>intent: CAPTURE</code>
                    </span>
                  </div>
                  <div className="text-[13px] text-[#525860] flex items-center gap-1.5 flex-wrap">
                    <span>Approval</span>
                    <span>→</span>
                    <span className="text-[#C53030]">Instant Capture</span>
                    <span>→</span>
                    <span>Irreversible Loss</span>
                    <span>→</span>
                    <span>60-Day Dispute Friction</span>
                  </div>
                  <p className="text-[14px] text-[#525860] leading-relaxed">
                    Funds leave the customer account immediately. Merchants face chargeback fees and negative dispute records, while consumers fight prolonged claims.
                  </p>
                </div>

                {/* Scam Brake Pre-Capture Verification Advantage */}
                <div
                  data-ui="true"
                  className="min-h-[170px] p-6 rounded-[6px] border border-[#1A7A64]/30 bg-[#EAF4F1]/30 space-y-3 animate-entrance"
                >
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-[#1A7A64]">Scam Brake Verification Flow</span>
                    <span className="text-[13px] text-[#1A7A64]">
                      <code>intent: AUTHORIZE</code>
                    </span>
                  </div>
                  <div className="text-[13px] text-[#171A1F] flex items-center gap-1.5 flex-wrap">
                    <span>Approval</span>
                    <span>→</span>
                    <span className="text-[#784D00] font-semibold">Pre-Capture Hold</span>
                    <span>→</span>
                    <span>AI Check-In</span>
                    <span>→</span>
                    <span className="text-[#1A7A64] font-semibold">Void ($0 Fee)</span>
                  </div>
                  <p className="text-[14px] text-[#525860] leading-relaxed">
                    Funds are temporarily paused in PayPal authorized status. If social engineering is confirmed, the authorization is voided with $0 in merchant processing fees and zero dispute marks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            3. INTERACTIVE PRODUCT DEMO SECTION
            ================================================== */}
        <section id="demo" className="py-24 px-6 bg-[#F6F6F3]">
          <div className="max-w-7xl mx-auto space-y-8 animate-entrance">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A1F]">
                Experience Scam Brake in action.
              </h2>
              <p className="text-[16px] text-[#2B303A] leading-relaxed">
                Test how our pre-capture verification protocol responds to real-world coercive schemes compared to legitimate merchant orders.
              </p>
            </div>

            <InteractiveDemo />
          </div>
        </section>

        {/* ==================================================
            4. THE 5-PHASE VERIFICATION PROTOCOL (Horizontal Process)
            ================================================== */}
        <section className="py-24 px-6 bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto space-y-10 animate-entrance">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A1F]">
                Five phases to settlement.
              </h2>
              <p className="text-[16px] text-[#2B303A] leading-relaxed">
                A deterministic protocol that protects consumers without creating checkout friction for clean transactions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  phase: 'Phase 01',
                  title: 'Order Initiation',
                  desc: 'Shopper selects PayPal at merchant checkout with authorization intent.',
                },
                {
                  phase: 'Phase 02',
                  title: 'Telemetry Scan',
                  desc: 'Channel3 telemetry and Elastic vector clustering evaluate concurrent voice calls.',
                },
                {
                  phase: 'Phase 03',
                  title: 'Pre-Capture Hold',
                  desc: 'PayPal creates a temporary authorization hold while funds remain safe.',
                },
                {
                  phase: 'Phase 04',
                  title: 'Safety Check-In',
                  desc: 'AI dialogue, Kernel official directory switchboards, and opt-in trusted contact advisories.',
                },
                {
                  phase: 'Phase 05',
                  title: 'Clean Resolution',
                  desc: 'If scam is confirmed, pre-capture void terminates hold at $0 fee. If verified, payment captures.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-6 space-y-2.5 bg-[#F6F6F3] rounded-[6px] animate-entrance">
                  <div className="text-[13px] text-[#525860] font-semibold">
                    <code>{item.phase}</code>
                  </div>
                  <div className="text-[15px] font-semibold text-[#171A1F]">
                    {item.title}
                  </div>
                  <p className="text-[15px] text-[#2B303A] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================
            5. ARCHITECTURAL BOUNDARIES & ANTI-SURVEILLANCE
            ================================================== */}
        <section className="py-24 px-6 bg-[#F6F6F3]">
          <div className="max-w-7xl mx-auto space-y-10 animate-entrance">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A1F]">
                Built with strict customer privacy limits.
              </h2>
              <p className="text-[16px] text-[#2B303A] leading-relaxed">
                Scam Brake is built on merchant integration and explicit customer volition. We reject passive surveillance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scope */}
              <div
                data-ui="true"
                className="p-6 rounded-[6px] border border-[#DFE2DF] bg-[#FFFFFF] space-y-4 animate-entrance"
              >
                <div className="flex items-center gap-2 text-[#1A7A64] font-semibold text-[15px]">
                  <CheckCircle2 size={16} />
                  <span>What Scam Brake Does</span>
                </div>
                <ul className="space-y-3 text-[15px] text-[#2B303A] leading-relaxed">
                  <li>• Integrates directly into merchant checkout via PayPal Partner APIs</li>
                  <li>• Pauses between authorization and capture only when risk flags trigger</li>
                  <li>• Converses voluntarily with customers to identify impersonation &amp; threats</li>
                  <li>• Provides out-of-band phone directory checks via Kernel verification</li>
                  <li>• Notifies trusted emergency contacts only with explicit customer consent</li>
                </ul>
              </div>

              {/* Strict Rejections */}
              <div
                data-ui="true"
                className="p-6 rounded-[6px] border border-[#DFE2DF] bg-[#FFFFFF] space-y-4 animate-entrance"
              >
                <div className="flex items-center gap-2 text-[#C53030] font-semibold text-[15px]">
                  <XCircle size={16} />
                  <span>What Scam Brake Never Does</span>
                </div>
                <ul className="space-y-3 text-[15px] text-[#2B303A] leading-relaxed">
                  <li>• Never acts as a universal browser interceptor or eavesdropper across the web</li>
                  <li>• Never listens to telephone calls or intercepts device microphones</li>
                  <li>• Never charges or voids payments without policy rules and customer input</li>
                  <li>• Never sells customer conversation transcripts or financial profiles</li>
                  <li>• Never delays or adds friction to clean, legitimate e-commerce purchases</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            6. FREQUENTLY ASKED QUESTIONS
            ================================================== */}
        <section className="py-24 px-6 bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto animate-entrance">
            <div className="max-w-3xl space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A1F]">
                  Frequently asked questions.
                </h2>
                <p className="text-[16px] text-[#2B303A] leading-relaxed">
                  Clear answers on how pre-capture holds protect transactions.
                </p>
              </div>

              <div className="space-y-8 pt-4">
                {[
                  {
                    q: 'How is an authorization hold different from a completed charge?',
                    a: 'When an authorization occurs, the customer funding source confirms funds are available and sets them aside, but no money is transferred to the merchant. Scam Brake operates entirely during this temporary hold. If the transaction is canceled, the authorization is voided immediately with zero dispute wait time.',
                  },
                  {
                    q: 'Does Scam Brake monitor all of my PayPal transactions?',
                    a: 'No. Scam Brake only functions at participating merchant checkouts that have integrated our pre-capture safety SDK. We do not monitor your global PayPal account, bank accounts, or external purchases.',
                  },
                  {
                    q: 'Will Scam Brake slow down normal everyday checkouts?',
                    a: 'For 98%+ of normal e-commerce orders, risk scores remain in the single digits, and the authorization is captured instantly with zero added friction. The safety check-in only triggers when high-risk coercion patterns (such as gift cards combined with active telephone calls or impersonation threats) are detected.',
                  },
                  {
                    q: 'Who decides whether to void or capture the payment?',
                    a: 'The customer and merchant policy. Scam Brake provides calm guidance, verified directory access, and trusted-contact alerts. If a customer realizes they are being defrauded, they can choose to void the authorization immediately.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2 animate-entrance">
                    <div className="font-semibold text-[17px] text-[#171A1F]">
                      {item.q}
                    </div>
                    <p className="text-[16px] text-[#2B303A] leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            7. FULL-WIDTH CTA BAND
            ================================================== */}
        <section className="py-28 px-6 bg-[#F6F6F3]">
          <div className="max-w-7xl mx-auto animate-entrance">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#171A1F] tracking-tight">
                Protect checkouts before funds leave the account.
              </h2>
              <p className="text-[16px] text-[#2B303A] leading-relaxed max-w-xl mx-auto">
                Join merchants and consumers establishing pre-capture payment protection. Explore our interactive simulation or review developer integration docs.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link href="/demo">
                  <Button variant="primary" size="lg">
                    <span>Explore Interactive Demo</span>
                    <ArrowRight size={15} />
                  </Button>
                </Link>
                <Link href="/merchant">
                  <Button variant="secondary" size="lg">
                    <span>Merchant Operations Console</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}