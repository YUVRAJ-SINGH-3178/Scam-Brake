import React from 'react';
import Link from 'next/link';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';

export const MarketingFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#FFFFFF] text-[#525860] py-16 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <ScamBrakeMark size={28} />
              <span className="text-[15px] font-semibold text-[#171A1F] tracking-tight">
                SCAM <span className="font-normal text-[#525860]">BRAKE</span>
              </span>
            </div>
            <p className="text-[14px] text-[#525860] leading-relaxed max-w-sm">
              Prototype exploring a merchant-integrated verification pause before payment capture.
            </p>
            <div className="text-[13px] text-[#525860]">
              Stop. Verify. Stay protected.
            </div>
          </div>

          {/* Navigation Column 1 */}
          <div className="space-y-3">
            <div className="text-[13px] font-semibold text-[#171A1F]">
              Platform
            </div>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link href="/how-it-works" className="hover:text-[#171A1F] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-[#171A1F] transition-colors">
                  Interactive Simulator
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#171A1F] transition-colors">
                  Protected Checkout Demo
                </Link>
              </li>
              <li>
                <Link href="/system-states" className="hover:text-[#171A1F] transition-colors">
                  System State Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div className="space-y-3">
            <div className="text-[13px] font-semibold text-[#171A1F]">
              Merchant Operations
            </div>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link href="/merchant" className="hover:text-[#171A1F] transition-colors">
                  Operations Console
                </Link>
              </li>
              <li>
                <Link href="/merchant/payments" className="hover:text-[#171A1F] transition-colors">
                  Protected Payments Ledger
                </Link>
              </li>
              <li>
                <Link href="/merchant/risk-intelligence" className="hover:text-[#171A1F] transition-colors">
                  Threat Taxonomy
                </Link>
              </li>
              <li>
                <Link href="/merchant/docs" className="hover:text-[#171A1F] transition-colors">
                  OpenAPI Specification
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3 */}
          <div className="space-y-3">
            <div className="text-[13px] font-semibold text-[#171A1F]">
              Governance & Legal
            </div>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link href="/security" className="hover:text-[#171A1F] transition-colors">
                  Security & Anti-Surveillance
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#171A1F] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/merchant/audit-log" className="hover:text-[#171A1F] transition-colors">
                  Cryptographic Audit Trail
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-10 flex flex-col sm:flex-row items-baseline justify-between gap-4 text-[13px] text-[#525860]">
          <p className="max-w-xl leading-relaxed">
            Scam Brake is an independent payment protection protocol and is not affiliated with, endorsed by, or sponsored by PayPal, Inc. PayPal is a registered trademark of PayPal, Inc. Pre-capture authorization holds are governed by PayPal Orders API specifications.
          </p>
          <div className="whitespace-nowrap text-[#525860]">
            &copy; 2026 Scam Brake. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
