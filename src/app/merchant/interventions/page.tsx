'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { Payment } from '@/types';
import { Badge } from '@/components/ui/Badge';
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
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
                Active Interventions Queue
              </h1>
              <span className="bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30 font-mono text-xs px-2 py-0.5 rounded font-semibold">
                {payments.length} Holds Pending
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mt-1">
              Authorizations paused in pre-capture hold while customers complete AI-assisted verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#FAFAFC] text-xs font-medium text-[#6B7280] rounded transition-colors"
            >
              <RefreshCw size={14} />
              Refresh Queue
            </button>
            <Link
              href="/merchant/simulator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D5BFF] text-white hover:bg-[#2044C8] text-xs font-medium rounded transition-colors"
            >
              Simulate New Hold
            </Link>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="bg-[#2D5BFF]/5 border border-[#2D5BFF]/20 rounded p-4 text-xs text-[#1E1E2A] flex items-start gap-3">
          <Clock size={16} className="text-[#2D5BFF] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-[#2D5BFF]">Zero-Dispute Protection Window</span>
            <p className="text-[#6B7280] leading-relaxed">
              When high coercion risk is detected, funds are held in PayPal authorized state for 30 minutes. The customer interacts with Scam Brake's calm verification workflow. If social engineering is confirmed or the customer cancels, the authorization is voided at $0 fee with zero chargeback record.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search reference, customer, item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded focus:outline-hidden focus:border-[#2D5BFF]"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-[#6B7280]">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-xs bg-[#FFFFFF] border border-[#E5E7EB] rounded px-2.5 py-1.5 focus:outline-hidden focus:border-[#2D5BFF]"
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
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-12 text-center space-y-3">
            <div className="p-3 bg-[#FAFAFC] border border-[#E5E7EB] rounded w-fit mx-auto text-[#059669]">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-semibold text-[#1E1E2A]">Queue Is Clean</h3>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              No active payments currently require emergency verification hold. All pending checkouts have either been verified or released.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#D1D5DB] rounded p-5 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-[#1E1E2A]">
                      {item.paymentReference}
                    </span>
                    <Badge variant={item.riskLevel} />
                    <span className="text-xs font-mono text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#F59E0B]/30 flex items-center gap-1">
                      <Clock size={12} />
                      Hold: ~{Math.floor(item.authorizationHoldSecondsRemaining / 60)}m left
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#6B7280]">
                      Customer: <strong className="text-[#1E1E2A] font-medium">{item.customer.name}</strong>
                    </span>
                    <span className="font-mono text-sm font-semibold text-[#1E1E2A]">
                      ${item.amount.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Details & Signals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-[#6B7280] mb-1">Item & Checkout</div>
                    <div className="font-medium text-[#1E1E2A]">{item.productName}</div>
                    <div className="text-[11px] text-[#6B7280]">{item.productCategory} • {item.merchantName}</div>
                  </div>

                  <div>
                    <div className="text-[#6B7280] mb-1">Detected Coercion Markers</div>
                    <div className="space-y-1">
                      {item.riskSignals.slice(0, 2).map((sig) => (
                        <div key={sig.id} className="text-[#DC2626] flex items-center gap-1 font-medium">
                          <AlertTriangle size={12} />
                          <span>{sig.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#6B7280] mb-1">Customer Verification Status</div>
                    <div className="flex items-center gap-1.5 text-[#2D5BFF] font-medium">
                      <MessageSquare size={13} />
                      <span>AI Conversational Check-in Underway</span>
                    </div>
                    {item.customer.hasTrustedContact && (
                      <div className="text-[11px] text-[#059669] flex items-center gap-1 mt-1">
                        <UserCheck size={11} />
                        <span>Trusted Contact ({item.customer.trustedContactName}) on file</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Links */}
                <div className="pt-2 flex items-center justify-between border-t border-[#E5E7EB]">
                  <span className="font-mono text-[11px] text-[#6B7280]">
                    PayPal Auth: {item.paypalAuthorizationId}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/intervention?paymentId=${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#FAFAFC] border border-[#E5E7EB] hover:bg-[#FFFFFF] text-xs font-medium text-[#1E1E2A] rounded transition-colors"
                      target="_blank"
                    >
                      <span>Simulate Customer View</span>
                      <ExternalLink size={12} />
                    </Link>
                    <Link
                      href={`/merchant/investigations/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#2D5BFF] hover:bg-[#2044C8] text-xs font-medium text-white rounded transition-colors"
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
