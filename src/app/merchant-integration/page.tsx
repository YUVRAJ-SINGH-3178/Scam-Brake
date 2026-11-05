'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Button } from '@/components/ui/Button';
import { Code2, ArrowRight } from 'lucide-react';
import { SPONSORS } from '@/data/seedData';

export default function MerchantIntegrationPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased selection:bg-[#1A7A64]/15">
      <MarketingNav />

      <main className="flex-1 py-16 px-6 max-w-6xl mx-auto w-full space-y-16">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#171A1F] leading-tight tracking-tight">
            Merchant Integration Architecture
          </h1>
          <p className="text-[17px] text-[#171A1F] leading-relaxed max-w-2xl">
            Eliminate friendly fraud disputes, recover scam-coerced gift card chargebacks, and protect your brand reputation with three API endpoints.
          </p>
        </div>

        {/* Integration Code Sample Block */}
        <div className="rounded-[6px] bg-[#FFFFFF] overflow-hidden" data-ui="true">
          <div className="px-6 py-3 border-b border-[#DFE2DF] bg-[#F6F6F3] flex items-center justify-between text-[13px] text-[#525860]">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-[#171A1F]" />
              <code className="font-mono text-[#171A1F] font-medium text-xs">checkout.ts: Pre-Capture Integration</code>
            </div>
            <code className="font-mono text-[11px] text-[#525860]">TypeScript / Node 22</code>
          </div>

          <div className="p-6 overflow-x-auto text-[12px] font-mono leading-relaxed bg-[#171A1F] text-[#F6F6F3]">
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
          <div className="border-b border-[#DFE2DF] pb-3">
            <h2 className="text-2xl font-semibold text-[#171A1F] tracking-tight">
              Technology Specifications
            </h2>
            <p className="text-[13px] text-[#525860] mt-0.5">
              Scam Brake is architected to interface cleanly with industry-standard platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPONSORS.map((spon) => (
              <div
                key={spon.id}
                className="p-5 rounded-[6px] bg-[#FFFFFF] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#171A1F] text-[14px]">{spon.name}</span>
                  <code className="text-[11px] font-mono px-2 py-0.5 rounded-[3px] bg-[#F6F6F3] border border-[#DFE2DF] text-[#525860]">
                    {spon.category}
                  </code>
                </div>
                <p className="text-[13px] text-[#525860] leading-relaxed">
                  {spon.purpose}
                </p>
                <div className="text-[12px] text-[#525860] pt-1 border-t border-[#DFE2DF]">
                  Interface: <code>{spon.interfaceMethod}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Merchant Dashboard Direct Link */}
        <div className="p-8 rounded-[6px] bg-[#FFFFFF] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-[16px] font-semibold text-[#171A1F]">
              Explore the Merchant Operations Console
            </div>
            <div className="text-[13px] text-[#525860] mt-0.5">
              Review live payment holds, risk intelligence scores, and automated void rules.
            </div>
          </div>
          <Link href="/merchant">
            <Button variant="primary" size="md">
              <span>Open Merchant Console</span>
              <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
