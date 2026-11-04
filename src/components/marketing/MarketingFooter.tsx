import React from 'react';
import Link from 'next/link';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';

export const MarketingFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#08080E] text-[rgba(237,237,243,0.7)] border-t border-[rgba(255,255,255,0.08)] py-16 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <ScamBrakeMark size={32} variant="dark" />
              <span className="text-[17px] font-semibold text-white tracking-tight">
                SCAM<span className="text-[#2D5BFF] ml-0.5">BRAKE</span>
              </span>
            </div>
            <p className="text-[13px] text-[rgba(237,237,243,0.6)] leading-relaxed max-w-sm">
              The merchant-integrated payment protection protocol that introduces an AI-assisted verification stage between PayPal payment authorization and final capture.
            </p>
            <div className="text-[11px] text-[rgba(237,237,243,0.4)]">
              Stop. Verify. Stay protected.
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="space-y-3">
            <div className="text-[12px] font-semibold text-white uppercase tracking-wider">
              Product
            </div>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-white transition-colors">
                  Interactive Demo
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  Customer Checkout Preview
                </Link>
              </li>
              <li>
                <Link href="/system-states" className="hover:text-white transition-colors">
                  System States & Fallbacks
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[12px] font-semibold text-white uppercase tracking-wider">
              Merchant App
            </div>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link href="/merchant" className="hover:text-white transition-colors">
                  Operations Overview
                </Link>
              </li>
              <li>
                <Link href="/merchant/payments" className="hover:text-white transition-colors">
                  Protected Payments Ledger
                </Link>
              </li>
              <li>
                <Link href="/merchant/simulator" className="hover:text-white transition-colors">
                  Risk Simulation Center
                </Link>
              </li>
              <li>
                <Link href="/merchant/docs" className="hover:text-white transition-colors">
                  API & Developer Specs
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[12px] font-semibold text-white uppercase tracking-wider">
              Boundaries
            </div>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  Security & Privacy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/merchant/integrations" className="hover:text-white transition-colors">
                  Sponsor Architecture
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sponsor Technologies Attribution Strip */}
        <div className="pt-8 border-t border-[rgba(255,255,255,0.06)] text-[12px] text-[rgba(237,237,243,0.5)]">
          <div className="mb-2 font-medium text-[rgba(237,237,243,0.7)]">
            Architected for Sponsor Technology Standards:
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>AG Grid (Financial Grids)</span>
            <span>•</span>
            <span>APIMatic (OpenAPI Specs)</span>
            <span>•</span>
            <span>Astropods (AI Agent Sandboxes)</span>
            <span>•</span>
            <span>Bryntum (Hold Timelines)</span>
            <span>•</span>
            <span>Channel3 (SKU Intelligence)</span>
            <span>•</span>
            <span>Elastic (Threat Search)</span>
            <span>•</span>
            <span>Kernel (Out-of-band Verification)</span>
            <span>•</span>
            <span>Postman (API Collections)</span>
            <span>•</span>
            <span>Render (Worker Infra)</span>
            <span>•</span>
            <span>Zapier (Outbound Alerts)</span>
          </div>
        </div>

        {/* Legal & Product Boundaries Disclaimer */}
        <div className="pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[rgba(237,237,243,0.4)]">
          <div>
            Scam Brake is an integrated checkout security verification platform, not a universal PayPal interceptor. Funds are held via pre-capture authorizations. AI does not autonomously void or capture funds without merchant and policy rules.
          </div>
          <div className="shrink-0">
            © 2026 Scam Brake Technologies Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
