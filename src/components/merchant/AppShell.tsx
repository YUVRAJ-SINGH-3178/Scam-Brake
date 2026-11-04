'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  AlertTriangle,
  Search,
  Shield,
  Cpu,
  BarChart3,
  FileText,
  Sliders,
  Plug,
  Code2,
  Settings,
  Bell,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { CommandPalette } from '@/components/ui/CommandPalette';

interface AppShellProps {
  children: React.ReactNode;
  activeItem?: string;
}

const AppShellInner: React.FC<AppShellProps> = ({ children, activeItem }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navGroups = [
    {
      title: 'Operations',
      items: [
        { label: 'Overview', href: '/merchant', icon: LayoutDashboard },
        { label: 'Protected Payments', href: '/merchant/payments', icon: CreditCard },
        { label: 'Active Interventions', href: '/merchant/interventions', icon: AlertTriangle, badge: '2 Active' },
        { label: 'Investigation Cases', href: '/merchant/investigations/pay_sb_881901', icon: Shield },
      ],
    },
    {
      title: 'Intelligence & Testing',
      items: [
        { label: 'Risk Intelligence', href: '/merchant/risk-intelligence', icon: Search },
        { label: 'Simulation Center', href: '/merchant/simulator', icon: Cpu },
        { label: 'Analytics & Efficacy', href: '/merchant/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Governance & System',
      items: [
        { label: 'Cryptographic Audit Log', href: '/merchant/audit-log', icon: FileText },
        { label: 'Risk Policies', href: '/merchant/policies', icon: Sliders },
        { label: 'Partner Integrations', href: '/merchant/integrations', icon: Plug },
        { label: 'Developer & API Specs', href: '/merchant/docs', icon: Code2 },
        { label: 'Settings', href: '/merchant/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1E1E2A] flex flex-col antialiased selection:bg-[#2D5BFF]/10 selection:text-[#2D5BFF]">
      <CommandPalette />

      {/* Top Bar (48px) - seamlessly on the chrome ground */}
      <header className="h-12 bg-[#FAFAFC] border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-md text-[#6B7280] hover:bg-[#E5E7EB]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link href="/merchant" className="flex items-center gap-2.5">
            <ScamBrakeMark size={28} />
            <span className="font-semibold text-[15px] tracking-tight">
              SCAM<span className="text-[#2D5BFF] ml-0.5">BRAKE</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-[#6B7280] bg-[#E5E7EB]/60 px-1.5 py-0.5 rounded">
              MERCHANT OPS
            </span>
          </Link>
        </div>

        {/* Centered Command Bar Trigger */}
        <div className="hidden sm:flex items-center justify-center flex-1 max-w-md mx-6">
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true,
              });
              document.dispatchEvent(event);
            }}
            className="w-full h-8 px-3 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] text-[#6B7280] text-[12px] flex items-center justify-between hover:border-[#D1D5DB] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-[#9CA3AF]" />
              <span>Search payments, investigations, or jump to screen...</span>
            </div>
            <kbd className="text-[10px] font-mono bg-[#FAFAFC] border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#9CA3AF]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & Merchant Account Badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/checkout"
            target="_blank"
            className="hidden lg:flex items-center gap-1.5 text-[12px] font-medium text-[#2D5BFF] hover:text-[#1B48E8] px-2.5 py-1 rounded-md hover:bg-[#2D5BFF]/5 transition-colors"
          >
            <span>Customer Checkout Preview</span>
            <ExternalLink size={12} />
          </Link>

          <div className="h-4 w-px bg-[#E5E7EB] hidden lg:block" />

          <button
            className="p-1.5 text-[#6B7280] hover:text-[#1E1E2A] relative rounded-md hover:bg-[#E5E7EB]/50 transition-colors"
            aria-label="Alerts"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444]" />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E7EB]">
            <div className="w-7 h-7 rounded-full bg-[#2D5BFF]/10 text-[#2D5BFF] font-semibold text-[11px] flex items-center justify-center">
              AD
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[12px] font-medium leading-none text-[#1E1E2A]">
                Apex Digital
              </span>
              <span className="text-[10px] text-[#10B981] font-mono leading-none mt-1">
                PayPal Verified
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container: Tinted L-frame holding the Inset White Sheet */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (240px) */}
        <aside
          className={`w-60 bg-[#FAFAFC] shrink-0 p-3 flex flex-col justify-between overflow-y-auto ${
            mobileMenuOpen
              ? 'fixed inset-y-12 left-0 z-30 shadow-xl'
              : 'hidden md:flex'
          }`}
        >
          <div className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-2.5 mb-1.5">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/merchant' && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                        isActive
                          ? 'bg-[#FFFFFF] text-[#2D5BFF] border border-[#E5E7EB] shadow-xs'
                          : 'text-[#4B5563] hover:text-[#1E1E2A] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          size={16}
                          className={isActive ? 'text-[#2D5BFF]' : 'text-[#6B7280]'}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EF4444]/10 text-[#DC2626]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Portal Switch */}
          <div className="pt-4 mt-6 border-t border-[#E5E7EB] text-[11px] text-[#6B7280] px-2 space-y-2">
            <div className="flex items-center justify-between">
              <span>Environment</span>
              <span className="text-[#10B981] font-mono font-medium">LIVE SANDBOX</span>
            </div>
            <div className="flex items-center justify-between">
              <span>PayPal Capture Mode</span>
              <span className="font-mono text-[#1E1E2A]">AUTH_THEN_CAPTURE</span>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="text-[#2D5BFF] hover:underline flex items-center gap-1"
              >
                ← Back to Public Website
              </Link>
            </div>
          </div>
        </aside>

        {/* The Inset White Work Sheet (Framed Sheet Style) */}
        <main className="flex-1 overflow-y-auto md:mr-2 md:mb-2 bg-[#FFFFFF] md:border md:border-[#E5E7EB] md:rounded-2xl p-4 md:p-6 shadow-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export const AppShell: React.FC<AppShellProps> = (props) => {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-8">
          <div className="text-xs text-[#6B7280]">Loading operations console...</div>
        </div>
      }
    >
      <AppShellInner {...props} />
    </React.Suspense>
  );
};
