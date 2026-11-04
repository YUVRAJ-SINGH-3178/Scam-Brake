'use client';

import React from 'react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export default function FAQPage() {
  const faqs = [
    {
      q: 'What is Scam Brake?',
      a: 'Scam Brake is an AI-guided checkout security platform that creates a safe verification pause between PayPal payment authorization and final capture. It is purpose-built to stop voluntary social-engineering scams before money leaves the victim’s account.',
    },
    {
      q: 'How does Scam Brake know when to trigger an intervention?',
      a: 'Scam Brake evaluates transaction metadata (such as unusual gift card volumes, high velocity, or remote desktop software running in the background) alongside real-time scam vectors matched via Elastic semantic search.',
    },
    {
      q: 'Does Scam Brake work on any website or only integrated merchants?',
      a: 'Scam Brake operates at participating merchants who have integrated our checkout SDK with PayPal Partner APIs. We are not a browser extension and we do not intercept payments outside our partner merchant network.',
    },
    {
      q: 'What happens if a customer does not reply to the check-in?',
      a: 'If a transaction has high critical risk and the hold window lapses without verification, merchant policy defaults to voiding the uncaptured authorization to guarantee the consumer’s funds remain completely safe.',
    },
    {
      q: 'Can the AI void or capture the payment on its own?',
      a: 'No. The AI provides calm conversational assistance and context gathering. The actual execution of a PayPal Void or Capture is strictly governed by merchant risk policies, customer decisions, and cryptographic audit parameters.',
    },
    {
      q: 'How do merchants benefit from integrating Scam Brake?',
      a: 'Merchants reduce friendly fraud disputes, eliminate non-refundable gift card chargeback losses, and safeguard elderly and vulnerable customers without adding friction for legitimate buyers.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C14] text-[#EDEDF3] flex flex-col antialiased">
      <MarketingNav />

      <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(45,91,255,0.12)] border border-[#2D5BFF]/30 text-[#2D5BFF] text-[12px] font-mono">
            <span>KNOWLEDGE BASE</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-white leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-[16px] text-[rgba(237,237,243,0.7)] leading-relaxed">
            Detailed answers regarding payment authorization holds, AI safety boundaries, and merchant integration.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-2"
            >
              <h2 className="text-[16px] font-semibold text-white">
                {f.q}
              </h2>
              <p className="text-[14px] text-[rgba(237,237,243,0.7)] leading-relaxed">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
