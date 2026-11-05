'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { CommandPalette } from '@/components/ui/CommandPalette';

interface AppShellProps {
  children: React.ReactNode;
  activeItem?: string;
}

const AppShellInner: React.FC<AppShellProps> = ({ children, activeItem }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navGroups = [
    {
      title: 'Operations',
      items: [
        { label: 'Overview', href: '/merchant', icon: LayoutDashboard },
        { label: 'Protected Payments', href: '/merchant/payments', icon: CreditCard },
        { label: 'Active Interventions', href: '/merchant/interventions', icon: AlertTriangle },
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
        { label: 'Audit Log', href: '/merchant/audit-log', icon: FileText },
        { label: 'Risk Policies', href: '/merchant/policies', icon: Sliders },
        { label: 'Partner Integrations', href: '/merchant/integrations', icon: Plug },
        { label: 'API Specifications', href: '/merchant/docs', icon: Code2 },
        { label: 'Settings', href: '/merchant/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased selection:bg-[#1A7A64]/15 selection:text-[#171A1F]">
      <CommandPalette />

      {/* Top Bar (48px) - Clean white with hairline porcelain divider */}
      <header className="h-12 bg-[#FFFFFF] border-b border-[#DFE2DF] px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-[4px] text-[#697078] hover:bg-[#F6F6F3] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link href="/merchant" className="flex items-center gap-2.5">
            <ScamBrakeMark size={24} />
            <span className="font-semibold text-[14px] tracking-tight text-[#171A1F]">
              SCAM BRAKE
            </span>
            <span className="hidden sm:inline-block text-[12px] text-[#525860] bg-[#F6F6F3] border border-[#DFE2DF] px-2 py-0.5 rounded-[4px] font-medium">
              Operations
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
            className="w-full h-8 px-3 rounded-[6px] bg-[#F6F6F3] border border-[#DFE2DF] text-[#525860] text-[12px] flex items-center justify-between hover:border-[#171A1F]/30 hover:bg-[#FFFFFF] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search size={13} className="text-[#525860]" />
              <span>Search authorizations, cases, or press</span>
            </div>
            <kbd className="text-[10px] font-mono bg-[#FFFFFF] border border-[#DFE2DF] px-1.5 py-0.5 rounded-[3px] text-[#171A1F]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Items & Merchant Account */}
        <div className="flex items-center gap-3">
          <Link
            href="/checkout"
            target="_blank"
            className="hidden lg:flex items-center gap-1.5 text-[12px] font-medium text-[#171A1F] hover:text-[#1A7A64] px-2.5 py-1 rounded-[6px] hover:bg-[#F6F6F3] transition-colors"
          >
            <span>Customer Checkout Preview</span>
            <ExternalLink size={12} />
          </Link>

          <div className="h-4 w-px bg-[#DFE2DF] hidden lg:block" />

          <button disabled className="p-1.5 text-[#697078] relative rounded-[4px] cursor-not-allowed" aria-label="Alerts unavailable">
            <Bell size={16} />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-[#DFE2DF]">
            <div className="w-7 h-7 rounded-[4px] bg-[#171A1F] text-white font-mono font-medium text-[11px] flex items-center justify-center">
              AD
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[12px] font-medium leading-none text-[#171A1F]">
                Authenticated merchant
              </span>
              <span className="text-[11px] text-[#784D00] font-medium leading-none mt-1">
                Provider unverified
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.replace('/login');
              }}
              className="text-[11px] text-[#525860] hover:text-[#171A1F] underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Tinted ground holding the Inset White Sheet */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (230px) */}
        <aside
          className={`w-[230px] bg-[#F6F6F3] shrink-0 p-3 flex flex-col justify-between overflow-y-auto border-r border-[#DFE2DF] ${
            mobileMenuOpen
              ? 'fixed inset-y-12 left-0 z-30 shadow-lg'
              : 'hidden md:flex'
          }`}
        >
          <div className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-0.5">
                <div className="text-[12px] font-medium text-[#525860] px-2.5 mb-1.5">
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
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                        isActive
                          ? 'bg-[#FFFFFF] text-[#171A1F] border border-[#DFE2DF] font-semibold'
                          : 'text-[#697078] hover:text-[#171A1F] hover:bg-[#FFFFFF]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          size={15}
                          className={isActive ? 'text-[#171A1F]' : 'text-[#697078]'}
                        />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Portal Switch */}
          <div className="pt-3 mt-4 border-t border-[#DFE2DF] text-[12px] text-[#525860] px-2 space-y-2">
            <div className="flex items-center justify-between">
              <span>Environment</span>
              <span className="text-[#784D00] font-medium">Sandbox unverified</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Hold Capture Mode</span>
              <span className="font-mono text-[#171A1F]">CHECKOUT_DISABLED</span>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="text-[#171A1F] hover:text-[#1A7A64] hover:underline flex items-center gap-1 font-medium"
              >
                ← Public Website
              </Link>
            </div>
          </div>
        </aside>

        {/* The Inset White Work Sheet */}
        <main className="flex-1 overflow-y-auto bg-[#FFFFFF] p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div role="status" className="mb-5 border border-[#784D00]/30 bg-[#FAF2E4] text-[#5C3B00] rounded-[4px] px-3 py-2 text-xs">
              Prototype data only. Payment controls are disabled; no real PayPal authorization, capture, or void is represented here.
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export const AppShell: React.FC<AppShellProps> = (props) => {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center p-8">
          <div className="text-xs font-mono text-[#697078]">Loading operations workspace...</div>
        </div>
      }
    >
      <AppShellInner {...props} />
    </React.Suspense>
  );
};
