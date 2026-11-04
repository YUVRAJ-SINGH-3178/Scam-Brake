'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { InteractiveDemo } from '@/components/marketing/InteractiveDemo';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased selection:bg-[#1A7A64]/15">
      <MarketingNav />

      <main className="flex-1 py-12 px-6 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[12px] text-[#697078] hover:text-[#171A1F] transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to Overview</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#171A1F] tracking-tight">
              Interactive Protection Simulator
            </h1>
            <p className="text-[14px] text-[#697078]">
              Simulate customer checkout, PayPal authorization hold, verification check-in, and deterministic void/capture resolution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/checkout">
              <Button
                variant="outline"
                size="sm"
                className="text-[12px]"
              >
                <span>Live Customer Checkout</span>
                <ExternalLink size={12} />
              </Button>
            </Link>
          </div>
        </div>

        <InteractiveDemo />
      </main>

      <MarketingFooter />
    </div>
  );
}
