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
    <div className="min-h-screen bg-[#0C0C14] text-[#EDEDF3] flex flex-col antialiased">
      <MarketingNav />

      <main className="flex-1 py-12 px-6 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[12px] text-[rgba(237,237,243,0.6)] hover:text-white transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to Overview</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
              Interactive Protection Simulator
            </h1>
            <p className="text-[14px] text-[rgba(237,237,243,0.7)]">
              Simulate customer checkout, PayPal authorization hold, AI-assisted verification, and deterministic void/capture resolution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/checkout">
              <Button
                variant="secondary"
                size="sm"
                className="bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)] text-white border-[rgba(255,255,255,0.12)] text-[12px]"
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
