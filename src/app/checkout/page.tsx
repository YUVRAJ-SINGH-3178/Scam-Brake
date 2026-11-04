'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Info } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<'gift_cards' | 'camera' | 'tokens'>('gift_cards');
  const [isLoading, setIsLoading] = useState(false);

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

  const handlePayPalCheckout = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(`/checkout/authorizing?product=${selectedProduct}`);
    }, 500);
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
              Checkout Sandbox
            </h1>
            <p className="text-[14px] text-[#525860]">
              Select an item to simulate how Scam Brake protects PayPal authorization holds.
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
                  className={`p-4 rounded-[6px] transition-all cursor-pointer ${
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

              <button
                disabled={isLoading}
                onClick={handlePayPalCheckout}
                className="w-full h-11 rounded-[6px] bg-[#FFC439] hover:bg-[#F4B92E] text-[#003087] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                {isLoading ? (
                  <span>Connecting to PayPal...</span>
                ) : (
                  <>
                    <span className="font-bold italic">PayPal</span>
                    <span className="text-[#003087]/80 text-[13px] font-normal">Check out</span>
                  </>
                )}
              </button>

              <div className="p-3 rounded-[4px] bg-[#F6F6F3] border border-[#DFE2DF] text-[12px] text-[#525860] flex items-start gap-2">
                <Lock size={14} className="text-[#1A7A64] shrink-0 mt-0.5" />
                <span>
                  This checkout uses Scam Brake pre-capture hold protection. Funds remain safe in your account during review.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
