'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Lock, Info } from 'lucide-react';
import Script from 'next/script';

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onCancel?: () => void;
        onError?: (error: unknown) => void;
      }) => {
        render: (container: HTMLElement) => Promise<void>;
        close?: () => Promise<void>;
      };
    };
  }
}

export default function CheckoutPage() {
  const [selectedProduct, setSelectedProduct] = useState<'gift_cards' | 'camera' | 'tokens'>('gift_cards');
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState('');
  const buttonContainer = useRef<HTMLDivElement>(null);
  const selectedSku = useRef(selectedProduct);
  const requestId = useRef<string | null>(null);
  const checkoutSessionId = useRef<string | null>(null);

  useEffect(() => {
    selectedSku.current = selectedProduct;
    requestId.current = null;
    checkoutSessionId.current = null;
  }, [selectedProduct]);

  useEffect(() => {
    let active = true;
    fetch('/api/checkout/config', { cache: 'no-store' })
      .then(async (res) => res.ok ? res.json() : null)
      .then((config) => {
        if (active && config?.available && typeof config.clientId === 'string') setPaypalClientId(config.clientId);
      })
      .catch(() => {
        if (active) setCheckoutStatus('PayPal Sandbox checkout is not configured.');
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!sdkReady || !paypalClientId || !buttonContainer.current || !window.paypal) return;
    const buttons = window.paypal.Buttons({
      createOrder: async () => {
        setCheckoutStatus('Creating secure order…');
        requestId.current ||= crypto.randomUUID();
        const res = await fetch('/api/checkout/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sku: selectedSku.current, requestId: requestId.current }),
        });
        const data = await res.json();
        if (!res.ok || typeof data.orderID !== 'string' || typeof data.checkoutSessionId !== 'string') {
          throw new Error(data.error || 'Unable to create a PayPal order.');
        }
        checkoutSessionId.current = data.checkoutSessionId;
        setCheckoutStatus('PayPal order ready. Continue in the PayPal window.');
        return data.orderID;
      },
      onApprove: async (data) => {
        if (!checkoutSessionId.current) throw new Error('Checkout session expired. Restart checkout.');
        setCheckoutStatus('Verifying PayPal approval and placing the authorization hold…');
        const res = await fetch('/api/checkout/authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderID: data.orderID, checkoutSessionId: checkoutSessionId.current }),
        });
        const result = await res.json();
        if (!res.ok || result.authorized !== true) throw new Error(result.error || 'PayPal authorization could not be verified.');
        if (result.interventionRequired && result.paymentId) {
          window.location.assign(`/intervention?paymentId=${encodeURIComponent(result.paymentId)}`);
          return;
        }
        setCheckoutStatus('PayPal authorization verified. The payment is on hold pending merchant review.');
      },
      onCancel: () => setCheckoutStatus('PayPal checkout was cancelled. No authorization was requested.'),
      onError: (error) => setCheckoutStatus(error instanceof Error ? error.message : 'PayPal checkout failed. No payment status is assumed.'),
    });
    buttons.render(buttonContainer.current).catch(() => setCheckoutStatus('PayPal button could not be loaded.'));
    return () => { void buttons.close?.(); };
  }, [sdkReady, paypalClientId]);

  const products = {
    gift_cards: {
      name: 'Apex Digital Voucher Multi-Pack ($500 x 3)',
      category: 'Stored Value Digital Cards',
      price: 1500.0,
      note: 'Simulates high-risk government or tech-support coercion pattern.',
    },
    camera: {
      name: 'Sony Alpha 7R V Full-Frame Camera Kit',
      category: 'Photography Equipment',
      price: 3899.0,
      note: 'Simulates a legitimate high-value consumer purchase.',
    },
    tokens: {
      name: 'YubiKey 5C NFC Enterprise Bundle (10 Units)',
      category: 'Hardware Security Keys',
      price: 700.0,
      note: 'Simulates bank impersonation token coercion.',
    },
  };

  const current = products[selectedProduct];

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased selection:bg-[#1A7A64]/15">
      {/* Merchant Header */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#DFE2DF] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-[4px] bg-[#171A1F] text-white flex items-center justify-center font-bold text-[12px]">
            AD
          </div>
          <div>
            <div className="font-semibold text-[14px] leading-tight text-[#171A1F]">
              Apex Digital &amp; Hardware
            </div>
            <div className="text-[12px] text-[#525860]">
              Protected Checkout
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#EAF4F1] text-[#1A7A64] text-[12px] font-medium border border-[#1A7A64]/20">
          <ShieldCheck size={14} />
          <span>Protected by Scam Brake</span>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order Configuration & Demo Picker */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-[#171A1F] tracking-tight">
              Protected Checkout
            </h1>
            <p className="text-[14px] text-[#525860]">
              PayPal Sandbox checkout. Buyer approval is verified on the server before an authorization is created.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[13px] font-medium text-[#525860] block">
              Choose Order Scenario:
            </label>

            {(Object.keys(products) as (keyof typeof products)[]).map((key) => {
              const item = products[key];
              const isSelected = selectedProduct === key;

              return (
                <div
                  key={key}
                  onClick={() => setSelectedProduct(key)}
                  className={`p-4 rounded-[6px] transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFFFFF] border-2 border-[#171A1F]'
                      : 'bg-[#FFFFFF] border border-[#DFE2DF] hover:border-[#171A1F]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-[14px] text-[#171A1F]">
                      {item.name}
                    </span>
                    <span className="font-semibold text-[15px] text-[#171A1F] tabular-nums">
                      <code>${item.price.toFixed(2)}</code>
                    </span>
                  </div>
                  <div className="text-[12px] text-[#525860]">
                    {item.category}
                  </div>
                  <div className="mt-2 text-[12px] text-[#525860] flex items-center gap-1.5 pt-2 border-t border-[#DFE2DF]">
                    <Info size={13} className="text-[#171A1F] shrink-0" />
                    <span>{item.note}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Payment Method & PayPal Approval Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE2DF]">
              <span className="text-[14px] font-semibold text-[#171A1F]">
                Order Total
              </span>
              <span className="text-[18px] font-bold text-[#171A1F] tabular-nums">
                <code>${current.price.toFixed(2)}</code> <span className="text-[13px] font-normal text-[#525860]">USD</span>
              </span>
            </div>

            <div className="space-y-2 text-[13px] text-[#525860]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#171A1F] tabular-nums"><code>${current.price.toFixed(2)}</code></span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="text-[#171A1F] tabular-nums"><code>$0.00</code></span>
              </div>
              <div className="flex justify-between font-medium text-[#171A1F] pt-1.5 border-t border-[#DFE2DF]">
                <span>Total Authorization</span>
                <span className="tabular-nums"><code>${current.price.toFixed(2)}</code></span>
              </div>
            </div>

            {/* PayPal Button Action */}
            <div className="pt-2 space-y-3">
              <div className="text-[13px] font-medium text-[#525860] text-center">
                Payment Method
              </div>

              {paypalClientId && <Script
                src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paypalClientId)}&currency=USD&intent=authorize`}
                strategy="afterInteractive"
                onReady={() => setSdkReady(true)}
                onError={() => setCheckoutStatus('PayPal Sandbox SDK could not be loaded.')}
              />}
              <div ref={buttonContainer} aria-label="PayPal Sandbox checkout button" />
              {!paypalClientId && <div className="w-full rounded-[6px] bg-[#DFE2DF] text-[#525860] font-semibold text-[14px] text-center py-3">
                PayPal Sandbox checkout unavailable
              </div>}
              {checkoutStatus && <p role="status" className="text-[12px] text-[#525860] text-center">{checkoutStatus}</p>}

              <div className="p-3 rounded-[4px] bg-[#F6F6F3] border border-[#DFE2DF] text-[12px] text-[#525860] flex items-start gap-2">
                <Lock size={14} className="text-[#1A7A64] shrink-0 mt-0.5" />
                <span>
                  This checkout only uses PayPal Sandbox. Scam Brake verifies the approved order and amount before requesting an authorization hold.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
