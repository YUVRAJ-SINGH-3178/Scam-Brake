'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search,
  Shield,
  CreditCard,
  AlertTriangle,
  BarChart3,
  Sliders,
  Cpu,
  FileText,
  Home,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { SEED_PAYMENTS } from '@/data/seedData';

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#171A1F]/40 backdrop-blur-[1px]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Scam Brake Command Palette">
          <div className="flex items-center px-4 border-b border-[#DFE2DF]">
            <Search className="w-4 h-4 text-[#697078] mr-2.5 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search authorizations, customer records, navigation..."
              className="w-full h-12 text-[13px] bg-transparent outline-none text-[#171A1F] placeholder-[#697078]"
            />
            <span className="text-[10px] font-mono text-[#697078] px-1.5 py-0.5 rounded-[3px] border border-[#DFE2DF]">
              ESC
            </span>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-[13px]">
            <Command.Empty className="py-6 text-center text-[12px] text-[#697078]">
              No matching records or actions found.
            </Command.Empty>

            <Command.Group heading="Merchant Operations" className="text-[10px] font-mono uppercase tracking-wider text-[#697078] px-2 py-1.5">
              <Command.Item
                onSelect={() => navigate('/merchant')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <Home size={15} className="text-[#171A1F]" />
                <span>Main Operations Overview</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/payments')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <CreditCard size={15} className="text-[#171A1F]" />
                <span>Protected Payments Ledger</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/interventions')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <AlertTriangle size={15} className="text-[#9A6700]" />
                <span>Active Interventions Queue</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/risk-intelligence')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <Shield size={15} className="text-[#171A1F]" />
                <span>Risk Intelligence & Threat Signals</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/simulator')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <Cpu size={15} className="text-[#1A7A64]" />
                <span>Simulation Center</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/analytics')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <BarChart3 size={15} className="text-[#171A1F]" />
                <span>Analytics & Efficacy</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/audit-log')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <FileText size={15} className="text-[#697078]" />
                <span>Audit Trail</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/policies')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <Sliders size={15} className="text-[#697078]" />
                <span>Risk Policies & Hold Thresholds</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Live Authorizations" className="text-[10px] font-mono uppercase tracking-wider text-[#697078] px-2 py-1.5 mt-2">
              {SEED_PAYMENTS.map((payment) => (
                <Command.Item
                  key={payment.id}
                  onSelect={() => navigate(`/merchant/payments/${payment.id}`)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-medium text-[#171A1F]">
                      {payment.paymentReference}
                    </span>
                    <span className="text-[12px] text-[#171A1F]">
                      {payment.customer.name}
                    </span>
                    <span className="text-[11px] text-[#697078]">
                      ({payment.productName})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[12px]">
                    <span className="tabular-nums">${payment.amount.toFixed(2)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-[3px] font-mono ${
                        payment.riskLevel === 'CRITICAL'
                          ? 'bg-[#FDE8E8] text-[#C53030] border border-[#C53030]/20'
                          : payment.riskLevel === 'HIGH'
                          ? 'bg-[#FAF2E4] text-[#9A6700] border border-[#9A6700]/20'
                          : 'bg-[#EAF4F1] text-[#1A7A64] border border-[#1A7A64]/20'
                      }`}
                    >
                      {payment.riskLevel}
                    </span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Customer & Public" className="text-[10px] font-mono uppercase tracking-wider text-[#697078] px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={() => navigate('/')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <Home size={15} className="text-[#697078]" />
                <span>Public Homepage</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/how-it-works')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <FileText size={15} className="text-[#697078]" />
                <span>How It Works</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant-integration')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <FileText size={15} className="text-[#697078]" />
                <span>Merchant Integration Architecture</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/checkout')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <CreditCard size={15} className="text-[#697078]" />
                <span>Customer Checkout Sandbox</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/intervention')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <Shield size={15} className="text-[#9A6700]" />
                <span>Customer Protection Check-in</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/system-states')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] cursor-pointer hover:bg-[#F6F6F3] text-[#171A1F]"
              >
                <Lock size={15} className="text-[#697078]" />
                <span>System States Matrix</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
