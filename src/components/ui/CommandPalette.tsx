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
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white border border-[#E5E7EB] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Scam Brake Global Command Palette">
          <div className="flex items-center px-4 border-b border-[#E5E7EB]">
            <Search className="w-4 h-4 text-[#6B7280] mr-2.5 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a command, page, payment reference, or customer..."
              className="w-full h-12 text-[14px] bg-transparent outline-none text-[#1E1E2A] placeholder-[#9CA3AF]"
            />
            <span className="text-[11px] font-mono text-[#9CA3AF] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
              ESC
            </span>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-[13px]">
            <Command.Empty className="py-6 text-center text-[#6B7280]">
              No matching records or actions found.
            </Command.Empty>

            <Command.Group heading="Merchant Operations" className="text-[11px] font-semibold text-[#9CA3AF] px-2 py-1.5">
              <Command.Item
                onSelect={() => navigate('/merchant')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <Home size={15} className="text-[#2D5BFF]" />
                <span>Main Operations Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/payments')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <CreditCard size={15} className="text-[#2D5BFF]" />
                <span>Protected Payments Ledger (AG Grid)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/interventions')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <AlertTriangle size={15} className="text-[#F59E0B]" />
                <span>Active Interventions Queue</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/risk-intelligence')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <Shield size={15} className="text-[#2D5BFF]" />
                <span>Risk Intelligence & Scam Taxonomy</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/simulator')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <Cpu size={15} className="text-[#10B981]" />
                <span>Risk Simulation Center</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/analytics')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <BarChart3 size={15} className="text-[#2D5BFF]" />
                <span>Analytics & Protection Efficacy</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/audit-log')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <FileText size={15} className="text-[#6B7280]" />
                <span>Cryptographic Audit Trail</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/merchant/policies')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <Sliders size={15} className="text-[#6B7280]" />
                <span>Risk Policies & Hold Thresholds</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Live Payments & Interventions" className="text-[11px] font-semibold text-[#9CA3AF] px-2 py-1.5 mt-2">
              {SEED_PAYMENTS.map((payment) => (
                <Command.Item
                  key={payment.id}
                  onSelect={() => navigate(`/merchant/payments/${payment.id}`)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-medium text-[#2D5BFF]">
                      {payment.paymentReference}
                    </span>
                    <span className="text-[12px] text-[#4B5563]">
                      {payment.customer.name}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">
                      ({payment.productName})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[12px]">
                    <span>${payment.amount.toFixed(2)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-medium ${
                        payment.riskLevel === 'CRITICAL'
                          ? 'bg-[#EF4444]/10 text-[#DC2626]'
                          : payment.riskLevel === 'HIGH'
                          ? 'bg-[#F59E0B]/10 text-[#D97706]'
                          : 'bg-[#10B981]/10 text-[#059669]'
                      }`}
                    >
                      {payment.riskLevel}
                    </span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Customer & Public Experience" className="text-[11px] font-semibold text-[#9CA3AF] px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={() => navigate('/')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <Home size={15} className="text-[#6B7280]" />
                <span>Public Marketing Homepage</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/demo')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <Cpu size={15} className="text-[#2D5BFF]" />
                <span>Interactive Payment Protection Demo</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/checkout')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <CreditCard size={15} className="text-[#6B7280]" />
                <span>Customer Protected Checkout (Simulated)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/intervention')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <Shield size={15} className="text-[#EF4444]" />
                <span>Customer Scam Brake Intervention Screen</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/system-states')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#F8F9FB] text-[#1E1E2A]"
              >
                <Lock size={15} className="text-[#8B5CF6]" />
                <span>System States & Error Handling Gallery (12 States)</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
