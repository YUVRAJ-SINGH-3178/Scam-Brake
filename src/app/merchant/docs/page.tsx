'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { Copy, Check, BookOpen } from 'lucide-react';

interface Endpoint {
  method: 'POST' | 'GET' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  requestBody?: string;
  responseBody: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'POST',
    path: '/v1/authorizations/evaluate',
    summary: 'Evaluate PayPal Authorization Risk',
    description:
      'Passes merchant checkout metadata, item categories, and customer risk telemetry to Scam Brake risk scoring engine prior to capture.',
    requestBody: `{
  "paypal_order_id": "ORD_PP_99182371",
  "paypal_authorization_id": "AUTH_PP_88190123",
  "amount": 1200.00,
  "currency": "USD",
  "customer": {
    "customer_id": "cust_901",
    "name": "Evelyn Reed",
    "email": "e***d@gmail.com"
  },
  "cart_items": [
    {
      "name": "Apple Gift Card $500",
      "category": "DIGITAL_GIFT_CARD",
      "quantity": 2
    }
  ]
}`,
    responseBody: `{
  "decision": "HOLD_REQUIRED",
  "risk_score": 88,
  "risk_level": "CRITICAL",
  "hold_window_seconds": 1800,
  "intervention_url": "https://app.scambrake.com/intervention?paymentId=pay_sb_881901",
  "coercion_markers": [
    "IMPERSONATION_IRS",
    "ACTIVE_VOICE_CALL_COERCION",
    "UNUSUAL_GIFT_CARD"
  ]
}`,
  },
  {
    method: 'POST',
    path: '/v1/authorizations/{id}/capture',
    summary: 'Capture Authorized PayPal Order',
    description:
      'Settles the previously held PayPal authorization once customer passes the conversational verification check.',
    requestBody: `{
  "reason": "Customer passed out-of-band verification.",
  "actor": "MERCHANT_AUTOMATION"
}`,
    responseBody: `{
  "status": "CAPTURED",
  "paypal_capture_id": "CAP_PP_994101",
  "captured_at": "2026-11-04T10:35:12Z",
  "amount_captured": 1200.00
}`,
  },
  {
    method: 'POST',
    path: '/v1/authorizations/{id}/void',
    summary: 'Void Uncaptured Authorization',
    description:
      'Executes pre-capture void via PayPal Orders API (`/v2/payments/authorizations/{id}/void`), terminating the payment hold with $0 fee and zero chargeback record.',
    requestBody: `{
  "reason": "Social-engineering coercion confirmed by customer during intervention.",
  "actor": "CUSTOMER_DECLINE"
}`,
    responseBody: `{
  "status": "VOIDED",
  "voided_at": "2026-11-04T10:36:01Z",
  "chargeback_fee": 0.00,
  "customer_fund_release": "INSTANT"
}`,
  },
];

export default function MerchantDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [copied, setCopied] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell activeItem="/merchant/docs">
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F]">
              API Specifications
            </h1>
            <p className="text-[13px] text-[#525860] mt-1">
              Technical integration contracts, REST endpoints, and PayPal authorization lifecycle hooks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#525860] bg-[#F6F6F3] px-2.5 py-1 rounded-[4px] border border-[#DFE2DF]">
              <code>OpenAPI 3.1 Spec</code>
            </span>
          </div>
        </div>

        {/* Integration Architecture Overview */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-4">
          <h2 className="text-[14px] font-semibold text-[#171A1F] flex items-center gap-2">
            <BookOpen size={15} className="text-[#171A1F]" />
            <span>How to Integrate with PayPal Checkout</span>
          </h2>
          <p className="text-[13px] text-[#525860] leading-relaxed">
            In standard PayPal implementations, merchants create orders with <code>intent: CAPTURE</code>, which settles funds immediately.
            To integrate Scam Brake, initialize your order with <code className="text-[#171A1F] font-mono font-semibold">intent: &apos;AUTHORIZE&apos;</code>. When the customer approves the payment, call Scam Brake&apos;s evaluation endpoint before executing final capture.
          </p>

          <pre className="bg-[#171A1F] text-[#F6F6F3] p-4 rounded-[6px] font-mono text-[12px] overflow-x-auto leading-relaxed">
            <span className="text-[#525860] block">// PayPal JS SDK Button Implementation</span>
            <span className="text-[#93C5FD]">paypal.Buttons</span>(&#123;{'\n'}
            {'  '}<span className="text-[#6EE7B7]">createOrder</span>: (data, actions) =&gt; &#123;{'\n'}
            {'    '}return actions.order.create(&#123;{'\n'}
            {'      '}<span className="text-[#FBBF24]">intent</span>: <span className="text-[#F472B6]">&apos;AUTHORIZE&apos;</span>, <span className="text-[#525860]">// Enables pre-capture hold</span>{'\n'}
            {'      '}purchase_units: [&#123; amount: &#123; value: cart.total &#125; &#125;]{'\n'}
            {'    '}&#125;);{'\n'}
            {'  '}&#125;,{'\n'}
            {'  '}<span className="text-[#6EE7B7]">onApprove</span>: async (data, actions) =&gt; &#123;{'\n'}
            {'    '}<span className="text-[#525860]">// 1. Customer authorized hold in PayPal popup</span>{'\n'}
            {'    '}const authorization = await actions.order.authorize();{'\n'}
            {'    '}<span className="text-[#525860]">// 2. Post authorization to Scam Brake for risk evaluation</span>{'\n'}
            {'    '}const check = await fetch(&apos;/api/scambrake/evaluate&apos;, &#123; ... &#125;);{'\n'}
            {'  '}&#125;{'\n'}
            &#125;);
          </pre>
        </div>

        {/* REST API Endpoints Explorer */}
        <div className="space-y-4">
          <h2 className="text-[14px] font-semibold text-[#171A1F]">REST API Endpoints</h2>

          <div className="flex flex-col sm:flex-row gap-2 border-b border-[#DFE2DF] pb-2">
            {ENDPOINTS.map((ep) => (
              <button
                key={ep.path}
                onClick={() => setSelectedEndpoint(ep)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[13px] transition-colors cursor-pointer ${
                  selectedEndpoint.path === ep.path
                    ? 'bg-[#171A1F] text-white font-medium'
                    : 'bg-[#FFFFFF] border border-[#DFE2DF] text-[#171A1F] hover:bg-[#F6F6F3]'
                }`}
              >
                <code className="font-mono text-[11px] font-bold opacity-85">{ep.method}</code>
                <code className="font-mono">{ep.path}</code>
              </button>
            ))}
          </div>

          {/* Endpoint Details */}
          <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE2DF]">
              <div>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-0.5 rounded-[3px] text-[11px] font-mono font-bold bg-[#F6F6F3] border border-[#DFE2DF] text-[#171A1F]">
                    {selectedEndpoint.method}
                  </code>
                  <code className="font-mono text-[14px] font-semibold text-[#171A1F]">
                    {selectedEndpoint.path}
                  </code>
                </div>
                <p className="text-[13px] text-[#525860] mt-1">{selectedEndpoint.description}</p>
              </div>
            </div>

            {selectedEndpoint.requestBody && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px] font-medium text-[#525860]">
                  <span>Request payload</span>
                  <button
                    onClick={() => copyCode(selectedEndpoint.requestBody!)}
                    className="inline-flex items-center gap-1 text-[12px] text-[#171A1F] hover:underline cursor-pointer"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#171A1F] text-[#F6F6F3] rounded-[6px] font-mono text-[12px] overflow-x-auto leading-relaxed">
                  {selectedEndpoint.requestBody}
                </pre>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-[12px] font-medium text-[#525860]">Response schema (200 OK)</div>
              <pre className="p-3 bg-[#171A1F] text-[#F6F6F3] rounded-[6px] font-mono text-[12px] overflow-x-auto leading-relaxed">
                {selectedEndpoint.responseBody}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
