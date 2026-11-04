'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { Payment } from '@/types';
import { RiskBadge } from '@/components/ui/Badge';
import {
  Clock,
  AlertTriangle,
  Shield,
  UserCheck,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function MerchantInterventionsQueuePage() {
  const [payments, setPayments] = useState<Payment[]>(() =>
    mockStore
      .getPayments()
      .filter((p) => p.authorizationStatus === 'HOLD_ACTIVE' || p.interventionStatus === 'ACTIVE_INTERVENTION')
  );
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const refreshList = () => {
    const list = mockStore
      .getPayments()
      .filter((p) => p.authorizationStatus === 'HOLD_ACTIVE' || p.interventionStatus === 'ACTIVE_INTERVENTION');
    setPayments(list);
  };

  const filtered = payments.filter((p) => {
    if (filterSeverity !== 'ALL' && p.riskLevel !== filterSeverity) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.paymentReference.toLowerCase().includes(q) ||
        p.customer.name.toLowerCase().includes(q) ||
        p.productName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell activeItem="/merchant/interventions">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F]">
                Active Interventions Queue
              </h1>
              <span className="bg-[#FAF2E4] text-[#9A6700] border border-[#9A6700]/20 font-mono text-[11px] px-2 py-0.5 rounded-[4px] font-semibold">
                {payments.length} Holds Pending
              </span>
            </div>
            <p className="text-[13px] text-[#697078] mt-1">
              Authorizations paused in pre-capture hold while customers complete verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[12px] font-medium text-[#697078] hover:text-[#171A1F] rounded-[6px] transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Refresh Queue</span>
            </button>
            <Link
              href="/merchant/simulator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171A1F] text-white hover:bg-[#2B303A] text-[12px] font-medium rounded-[6px] transition-colors"
            >
              <span>Simulate Hold</span>
            </Link>
          </div>
        </div>

        {/* Informational Guidance Band */}
        <div className="bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] p-4 text-[12px] text-[#171A1F] flex items-start gap-3">
          <Clock size={16} className="text-[#9A6700] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-[#171A1F]">Zero-Dispute Protection Window</span>
            <p className="text-[#697078] leading-relaxed">
              When high coercion risk is detected, funds are held in PayPal authorized state for 30 minutes. The customer interacts with Scam Brake&apos;s calm verification workflow. If social engineering is confirmed or the customer cancels, the authorization is voided at \$0 fee with zero chargeback record.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#697078]" />
            <input
              type="text"
              placeholder="Search reference, customer, item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-[12px] pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] focus:outline-none focus:border-[#171A1F]"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[12px] text-[#697078]">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-[12px] bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] px-2.5 py-1.5 focus:outline-none focus:border-[#171A1F]"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>
          </div>
        </div>

        {/* Queue Items */}
        {filtered.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-12 text-center space-y-3">
            <div className="p-3 bg-[#EAF4F1] border border-[#1A7A64]/20 rounded-[6px] w-fit mx-auto text-[#1A7A64]">
              <CheckCircle2 size={22} />
            </div>
            <h3 className="text-[14px] font-semibold text-[#171A1F]">Queue Is Clean</h3>
            <p className="text-[12px] text-[#697078] max-w-sm mx-auto">
              No active payments currently require emergency verification hold. All pending checkouts have either been verified or released.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-[#FFFFFF] border border-[#DFE2DF] hover:border-[#171A1F]/40 rounded-[6px] p-5 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DFE2DF]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[13px] font-semibold text-[#171A1F]">
                      {item.paymentReference}
                    </span>
                    <RiskBadge level={item.riskLevel} score={item.riskScore} />
                    <span className="text-[11px] font-mono text-[#9A6700] bg-[#FAF2E4] px-2 py-0.5 rounded-[4px] border border-[#9A6700]/20 flex items-center gap-1">
                      <Clock size={11} />
                      Hold: ~{Math.floor(item.authorizationHoldSecondsRemaining / 60)}m left
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[12px]">
                    <span className="text-[#697078]">
                      Customer: <strong className="text-[#171A1F] font-medium">{item.customer.name}</strong>
                    </span>
                    <span className="font-mono text-[14px] font-semibold text-[#171A1F] tabular-nums">
                      ${item.amount.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Details & Signals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px]">
                  <div>
                    <div className="text-[#697078] mb-1 font-mono uppercase text-[10px] tracking-wider">Item & Checkout</div>
                    <div className="font-medium text-[#171A1F]">{item.productName}</div>
                    <div className="text-[11px] text-[#697078] mt-0.5">{item.productCategory} • {item.merchantName}</div>
                  </div>

                  <div>
                    <div className="text-[#697078] mb-1 font-mono uppercase text-[10px] tracking-wider">Detected Risk Markers</div>
                    <div className="space-y-1">
                      {item.riskSignals.slice(0, 2).map((sig) => (
                        <div key={sig.id} className="text-[#C53030] flex items-center gap-1 font-medium">
                          <AlertTriangle size={12} />
                          <span>{sig.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#697078] mb-1 font-mono uppercase text-[10px] tracking-wider">Verification Status</div>
                    <div className="flex items-center gap-1.5 text-[#171A1F] font-medium">
                      <MessageSquare size={13} className="text-[#9A6700]" />
                      <span>AI Conversational Check-in Underway</span>
                    </div>
                    {item.customer.hasTrustedContact && (
                      <div className="text-[11px] text-[#1A7A64] flex items-center gap-1 mt-1">
                        <UserCheck size={11} />
                        <span>Trusted Contact ({item.customer.trustedContactName}) on file</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Links */}
                <div className="pt-2 flex items-center justify-between border-t border-[#DFE2DF]">
                  <span className="font-mono text-[11px] text-[#697078]">
                    PayPal Auth: {item.paypalAuthorizationId}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/intervention?paymentId=${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[12px] font-medium text-[#171A1F] rounded-[6px] transition-colors"
                      target="_blank"
                    >
                      <span>Simulate Customer View</span>
                      <ExternalLink size={12} />
                    </Link>
                    <Link
                      href={`/merchant/investigations/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#171A1F] hover:bg-[#2B303A] text-[12px] font-medium text-white rounded-[6px] transition-colors"
                    >
                      <span>Investigate Case</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
