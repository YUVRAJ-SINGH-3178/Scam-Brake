'use client';

import React from 'react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export default function FAQPage() {
  const faqs = [
    {
      q: 'What is Scam Brake?',
      a: 'Scam Brake is a prototype exploring a merchant verification pause between PayPal authorization and capture. This build does not accept payments or provide a live protection service.',
    },
    {
      q: 'How does Scam Brake know when to trigger an intervention?',
      a: 'The prototype includes risk-scoring and search adapters. They have not been verified against live merchant signals or an external Elastic deployment.',
    },
    {
      q: 'Does Scam Brake work on any website or only integrated merchants?',
      a: 'The intended product would operate only at participating merchants. A production checkout SDK and verified PayPal partner integration are not available in this build.',
    },
    {
      q: 'What happens if a customer does not reply to the check-in?',
      a: 'The timeout policy is prototype code. The deployed checkout and worker lifecycle have not been verified; this build cannot create or release a PayPal authorization.',
    },
    {
      q: 'Can the AI void or capture the payment on its own?',
      a: 'The AI adapter has no direct payment permissions. Capture and void routes require merchant authentication, but buyer approval and end-to-end payment controls are not yet available.',
    },
    {
      q: 'How do merchants benefit from integrating Scam Brake?',
      a: 'The product hypothesis is that an independent verification pause could help identify social-engineering pressure. No fraud reduction, chargeback savings, or customer outcome has been measured.',
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
            Prototype scope, intended boundaries, and current implementation limits.
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
