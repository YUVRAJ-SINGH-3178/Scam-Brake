'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Button } from '@/components/ui/Button';
import { Code2, Plug, CheckCircle2, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { SPONSORS } from '@/data/seedData';

export default function MerchantIntegrationPage() {
  return (
    <div className="min-h-screen bg-[#0C0C14] text-[#EDEDF3] flex flex-col antialiased">
      <MarketingNav />

      <main className="flex-1 py-16 px-6 max-w-6xl mx-auto w-full space-y-16">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(45,91,255,0.12)] border border-[#2D5BFF]/30 text-[#2D5BFF] text-[12px] font-mono">
            <span>DEVELOPER ARCHITECTURE</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-white leading-tight">
            Merchant Integration Architecture
          </h1>
          <p className="text-[16px] text-[rgba(237,237,243,0.7)] leading-relaxed">
            Eliminate friendly fraud disputes, recover scam-coerced gift card chargebacks, and protect your brand reputation with three API endpoints.
          </p>
        </div>

        {/* Integration Code Sample Block */}
        <div className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#11121C] overflow-hidden">
          <div className="px-6 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#0C0C14] flex items-center justify-between text-[12px] text-[rgba(237,237,243,0.5)]">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-[#2D5BFF]" />
              <span className="font-mono text-white">checkout.ts — Pre-Capture Integration</span>
            </div>
            <span className="font-mono">TypeScript / Node 22</span>
          </div>

          <div className="p-6 overflow-x-auto text-[13px] font-mono leading-relaxed text-[#EDEDF3] bg-[#0A0A10]">
            <pre>
{`import { ScamBrakeClient } from '@scambrake/sdk';
import { PayPalClient } from '@paypal/checkout-server-sdk';

const scambrake = new ScamBrakeClient({
  merchantId: process.env.SCAMBRAKE_MERCHANT_ID,
  apiKey: process.env.SCAMBRAKE_SECRET_KEY,
});

// 1. Create order with INTENT = 'AUTHORIZE' (Not immediate capture)
export async function createProtectedOrder(cart) {
  const order = await paypal.orders.create({
    intent: 'AUTHORIZE',
    purchase_units: [{
      amount: { currency_code: 'USD', value: cart.total.toFixed(2) },
      items: cart.items.map(item => ({
        name: item.name,
        category: item.isGiftCard ? 'DIGITAL_GOODS' : 'PHYSICAL_GOODS',
        unit_amount: { currency_code: 'USD', value: item.price.toFixed(2) },
        quantity: item.qty
      }))
    }]
  });

  return order.id;
}

// 2. Authorize order & evaluate pre-capture verification
export async function onCustomerApproved(orderId, clientTelemetry) {
  // Step A: PayPal Authorizes hold
  const authorization = await paypal.orders.authorize(orderId);
  const authId = authorization.purchase_units[0].payments.authorizations[0].id;

  // Step B: Scam Brake Risk Check
  const assessment = await scambrake.assessHold({
    authorizationId: authId,
    amount: cart.total,
    currency: 'USD',
    telemetry: clientTelemetry
  });

  if (assessment.status === 'HOLD_FOR_INTERVENTION') {
    // Redirect buyer to Scam Brake safe check-in
    return { redirectUrl: assessment.interventionUrl };
  }

  // If clean, capture immediately
  await paypal.authorizations.capture(authId);
  return { status: 'COMPLETED' };
}`}
            </pre>
          </div>
        </div>

        {/* Sponsor Technologies Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-white">
              Sponsor Technology Specifications
            </h2>
            <p className="text-[14px] text-[rgba(237,237,243,0.7)]">
              Scam Brake is architected to interface cleanly with industry-standard platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPONSORS.map((spon) => (
              <div
                key={spon.id}
                className="p-5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#11121C] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-[14px]">{spon.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(45,91,255,0.12)] text-[#2D5BFF]">
                    {spon.category}
                  </span>
                </div>
                <p className="text-[12px] text-[rgba(237,237,243,0.65)] leading-relaxed">
                  {spon.purpose}
                </p>
                <div className="text-[11px] font-mono text-[#9CA3AF] pt-1">
                  Interface: {spon.interfaceMethod}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Merchant Dashboard Direct Link */}
        <div className="p-8 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#11121C] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-[18px] font-semibold text-white">
              Explore the Merchant Operations Console
            </div>
            <div className="text-[13px] text-[rgba(237,237,243,0.6)]">
              Review live payment holds, risk intelligence scores, and automated void rules.
            </div>
          </div>
          <Link href="/merchant">
            <Button variant="primary" size="md">
              <span>Open Merchant Console</span>
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
