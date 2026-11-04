'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { Menu, X } from 'lucide-react';

export const MarketingNav: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: 'Product', href: '/' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Merchant Integration', href: '/merchant-integration' },
    { label: 'Security', href: '/security' },
    { label: 'Documentation', href: '/merchant/docs' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: SCAM BRAKE wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <ScamBrakeMark size={28} />
          <span className="font-semibold tracking-tight text-[15px] text-[#171A1F]">
            SCAM <span className="font-normal text-[#697078]">BRAKE</span>
          </span>
        </Link>

        {/* Centre: Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#697078]">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-[#171A1F] ${
                  isActive ? 'text-[#171A1F] font-semibold' : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Sign in & Restrained Rectangular Workspace Button */}
        <div className="hidden md:flex items-center gap-4 text-[13px]">
          <Link
            href="/merchant"
            className="text-[#697078] hover:text-[#171A1F] font-medium transition-colors"
          >
            Sign in
          </Link>

          <span className="text-[#DFE2DF] text-xs">|</span>

          <Link
            href="/merchant"
            className="inline-flex items-center justify-center h-9 px-3.5 bg-[#171A1F] hover:bg-[#2B303A] text-white text-[13px] font-medium rounded-[6px] transition-colors"
          >
            Merchant Workspace
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[#697078] hover:text-[#171A1F]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#DFE2DF] px-6 py-4 space-y-3 text-[14px]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-1.5 text-[#697078] hover:text-[#171A1F]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#DFE2DF] flex items-center justify-between">
            <Link
              href="/merchant"
              onClick={() => setMobileOpen(false)}
              className="text-[#171A1F] font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/merchant"
              onClick={() => setMobileOpen(false)}
              className="px-3.5 py-1.5 bg-[#171A1F] text-white rounded-[6px] text-xs font-medium"
            >
              Merchant Workspace
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
