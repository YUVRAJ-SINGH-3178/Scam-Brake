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
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased selection:bg-[#1A7A64]/15">
      <MarketingNav />

      <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#171A1F] leading-tight tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-[17px] text-[#171A1F] leading-relaxed max-w-2xl">
            Detailed answers regarding payment authorization holds, AI safety boundaries, and merchant integration.
          </p>
        </div>

        <div className="divide-y divide-[#DFE2DF] bg-[#FFFFFF] rounded-[6px] overflow-hidden">
          {faqs.map((f, idx) => (
            <div
              key={idx}
              className="p-6 space-y-2 hover:bg-[#F6F6F3]/50 transition-colors"
            >
              <h2 className="text-[17px] font-semibold text-[#171A1F]">
                {f.q}
              </h2>
              <p className="text-[15px] text-[#171A1F] leading-relaxed">
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
