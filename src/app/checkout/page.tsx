'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { Button } from '@/components/ui/Button';

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<'gift_cards' | 'camera' | 'tokens'>('gift_cards');
  const [isLoading, setIsLoading] = useState(false);

  const products = {
    gift_cards: {
      name: 'Apex Digital Voucher Multi-Pack ($500 x 3)',
      category: 'Stored Value Digital Cards',
      price: 1500.0,
      note: 'Simulates the high-risk government / tech-support coercion pattern.',
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
      // Redirect to authorization simulation
      router.push(`/checkout/authorizing?product=${selectedProduct}`);
    }, 500);
  };

  const current = products[selectedProduct];

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#1E1E2A] flex flex-col antialiased">
      {/* Merchant Header */}
      <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E1E2A] text-white flex items-center justify-center font-bold text-[14px]">
            AD
          </div>
          <div>
            <div className="font-semibold text-[15px] leading-tight">
              Apex Digital & Hardware
            </div>
            <div className="text-[11px] text-[#6B7280]">
              Merchant Partner Checkout
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#059669] text-[12px] font-medium border border-[#10B981]/20">
          <ShieldCheck size={14} />
          <span>Protected by Scam Brake</span>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order Configuration & Demo Picker */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-[#1E1E2A]">
              Checkout Simulation
            </h1>
            <p className="text-[13px] text-[#6B7280]">
              Select an item to simulate how Scam Brake protects PayPal authorization holds.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider block">
              Choose Test Order Item:
            </label>

            {(Object.keys(products) as (keyof typeof products)[]).map((key) => {
              const item = products[key];
              const isSelected = selectedProduct === key;

              return (
                <div
                  key={key}
                  onClick={() => setSelectedProduct(key)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#2D5BFF] ring-2 ring-[#2D5BFF]/20'
                      : 'bg-[#FAFAFC] border-[#E5E7EB] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-[14px] text-[#1E1E2A]">
                      {item.name}
                    </span>
                    <span className="font-mono font-semibold text-[15px] text-[#1E1E2A]">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#6B7280]">
                    {item.category}
                  </div>
                  <div className="mt-2 text-[11px] text-[#2D5BFF] flex items-center gap-1.5 pt-2 border-t border-[#E5E7EB]">
                    <Info size={12} />
                    <span>{item.note}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Payment Method & PayPal Approval Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <span className="text-[14px] font-semibold text-[#1E1E2A]">
                Order Total
              </span>
              <span className="text-[20px] font-mono font-bold text-[#1E1E2A]">
                ${current.price.toFixed(2)} <span className="text-[12px] font-normal text-[#6B7280]">USD</span>
              </span>
            </div>

            <div className="space-y-2 text-[12px] text-[#6B7280]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-[#1E1E2A]">${current.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="font-mono text-[#1E1E2A]">$0.00</span>
              </div>
              <div className="flex justify-between font-medium text-[#1E1E2A] pt-1 border-t border-[#E5E7EB]">
                <span>Total Authorization</span>
                <span className="font-mono">${current.price.toFixed(2)}</span>
              </div>
            </div>

            {/* PayPal Button Action */}
            <div className="pt-2 space-y-3">
              <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider text-center">
                Express Payment
              </div>

              <button
                disabled={isLoading}
                onClick={handlePayPalCheckout}
                className="w-full h-11 rounded-lg bg-[#FFC439] hover:bg-[#F4B92E] text-[#003087] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
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

              <div className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-[11px] text-[#6B7280] flex items-start gap-2">
                <Lock size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                <span>
                  This checkout uses Scam Brake pre-capture authorization protection. Funds are held safely while preliminary risk is verified.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
