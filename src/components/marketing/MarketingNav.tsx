'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScamBrakeLogo } from '@/components/brand/ScamBrakeMark';
import { Button } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';

export const MarketingNav: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Interactive Demo', href: '/demo' },
    { label: 'Merchant Integration', href: '/merchant-integration' },
    { label: 'Security & Privacy', href: '/security' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0C0C14]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="cursor-pointer">
          <ScamBrakeLogo variant="dark" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[rgba(237,237,243,0.7)]">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-[#EDEDF3] ${
                  isActive ? 'text-[#2D5BFF]' : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Portal Links */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/merchant">
            <Button
              variant="secondary"
              size="sm"
              className="bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)] text-white border-[rgba(255,255,255,0.12)] text-[12px]"
            >
              Merchant Ops App
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="primary" size="sm" className="text-[12px]">
              Run Live Demo
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[rgba(237,237,243,0.7)] hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[rgba(255,255,255,0.1)] bg-[#0C0C14] px-6 py-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-[14px] font-medium text-[rgba(237,237,243,0.8)] hover:text-white py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[rgba(255,255,255,0.1)] flex flex-col gap-2">
            <Link href="/merchant" onClick={() => setMobileOpen(false)}>
              <Button
                variant="secondary"
                size="md"
                className="w-full bg-[rgba(255,255,255,0.08)] text-white border-[rgba(255,255,255,0.12)]"
              >
                Merchant Ops App
              </Button>
            </Link>
            <Link href="/demo" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
                Run Live Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
