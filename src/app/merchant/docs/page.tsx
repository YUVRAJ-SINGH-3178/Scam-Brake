'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { Code2, Copy, Check, ExternalLink, Terminal, BookOpen, Layers } from 'lucide-react';

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
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
              Developer & API Documentation
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Technical integration contracts, REST endpoints, and PayPal authorization lifecycle hooks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#6B7280] bg-[#FAFAFC] px-2.5 py-1 rounded border border-[#E5E7EB]">
              OpenAPI 3.1 Spec (v1.4)
            </span>
          </div>
        </div>

        {/* Integration Architecture Overview */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#1E1E2A] flex items-center gap-2">
            <BookOpen size={16} className="text-[#2D5BFF]" />
            How to Integrate with PayPal Checkout
          </h2>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            In standard PayPal implementations, merchants create orders with `intent: CAPTURE`, which settles funds immediately.
            To integrate Scam Brake, initialize your order with <strong className="text-[#1E1E2A] font-mono">intent: &apos;AUTHORIZE&apos;</strong>. When the customer approves the payment, call Scam Brake&apos;s evaluation endpoint before executing final capture.
          </p>

          <div className="bg-[#1E1E2A] text-[#FAFAFC] p-4 rounded font-mono text-xs overflow-x-auto">
            <span className="text-[#6B7280] block">// PayPal JS SDK Button Implementation</span>
            <span className="text-[#93C5FD]">paypal.Buttons</span>(&#123;{'\n'}
            {'  '}<span className="text-[#6EE7B7]">createOrder</span>: (data, actions) =&gt; &#123;{'\n'}
            {'    '}return actions.order.create(&#123;{'\n'}
            {'      '}<span className="text-[#FBBF24]">intent</span>: <span className="text-[#F472B6]">&apos;AUTHORIZE&apos;</span>, <span className="text-[#6B7280]">// Essential: enables pre-capture safety hold</span>{'\n'}
            {'      '}purchase_units: [&#123; amount: &#123; value: cart.total &#125; &#125;]{'\n'}
            {'    '}&#125;);{'\n'}
            {'  '}&#125;,{'\n'}
            {'  '}<span className="text-[#6EE7B7]">onApprove</span>: async (data, actions) =&gt; &#123;{'\n'}
            {'    '}<span className="text-[#6B7280]">// 1. Customer authorized hold in PayPal popup</span>{'\n'}
            {'    '}const authorization = await actions.order.authorize();{'\n'}
            {'    '}<span className="text-[#6B7280]">// 2. Post authorization to Scam Brake for risk evaluation</span>{'\n'}
            {'    '}const check = await fetch(&apos;/api/scambrake/evaluate&apos;, &#123; ... &#125;);{'\n'}
            {'  '}&#125;{'\n'}
            &#125;);
          </div>
        </div>

        {/* REST API Endpoints Explorer */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[#1E1E2A]">REST API Endpoints</h2>

          <div className="flex flex-col sm:flex-row gap-2 border-b border-[#E5E7EB] pb-2">
            {ENDPOINTS.map((ep) => (
              <button
                key={ep.path}
                onClick={() => setSelectedEndpoint(ep)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                  selectedEndpoint.path === ep.path
                    ? 'bg-[#2D5BFF] text-white font-medium'
                    : 'bg-[#FFFFFF] border border-[#E5E7EB] text-[#1E1E2A] hover:bg-[#FAFAFC]'
                }`}
              >
                <span className="font-mono text-[10px] font-bold opacity-80">{ep.method}</span>
                <span className="font-mono">{ep.path}</span>
              </button>
            ))}
          </div>

          {/* Endpoint Details */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#2D5BFF]/10 text-[#2D5BFF]">
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-mono text-sm font-semibold text-[#1E1E2A]">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">{selectedEndpoint.description}</p>
              </div>
            </div>

            {selectedEndpoint.requestBody && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280]">
                  <span>Request JSON Payload</span>
                  <button
                    onClick={() => copyCode(selectedEndpoint.requestBody!)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#2D5BFF] hover:underline"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#1E1E2A] text-[#FAFAFC] rounded font-mono text-xs overflow-x-auto">
                  {selectedEndpoint.requestBody}
                </pre>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#6B7280]">Response JSON Schema (200 OK)</div>
              <pre className="p-3 bg-[#1E1E2A] text-[#FAFAFC] rounded font-mono text-xs overflow-x-auto">
                {selectedEndpoint.responseBody}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
