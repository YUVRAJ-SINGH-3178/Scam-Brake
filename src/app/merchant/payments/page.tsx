'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { PaymentTable } from '@/components/merchant/PaymentTable';
import { PaymentDetailDrawer } from '@/components/merchant/PaymentDetailDrawer';
import { mockStore } from '@/services';
import { Payment, RiskLevel, AuthorizationStatus } from '@/types';
import { Download, SlidersHorizontal, RefreshCw, PlusCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function MerchantPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(() => mockStore.getPayments());
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<AuthorizationStatus | 'ALL'>('ALL');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'held' | 'captured' | 'voided'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleSelectPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setDrawerOpen(true);
  };

  const handleCapture = (id: string, notes?: string) => {
    const updated = mockStore.capturePayment(id, notes);
    if (updated) {
      setPayments(mockStore.getPayments());
      setSelectedPayment(updated);
      setNotification('Payment actions are disabled in this prototype; no provider request was made.');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleVoid = (id: string, reason?: string) => {
    const updated = mockStore.voidPayment(id, reason);
    if (updated) {
      setPayments(mockStore.getPayments());
      setSelectedPayment(updated);
      setNotification('Payment actions are disabled in this prototype; no provider request was made.');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Tab filter
      if (activeTab === 'held' && p.authorizationStatus !== 'HOLD_ACTIVE') return false;
      if (activeTab === 'captured' && p.authorizationStatus !== 'CAPTURED') return false;
      if (activeTab === 'voided' && p.authorizationStatus !== 'VOIDED') return false;

      // Status dropdown
      if (filterStatus !== 'ALL' && p.authorizationStatus !== filterStatus) return false;

      // Risk dropdown
      if (filterRisk !== 'ALL' && p.riskLevel !== filterRisk) return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesRef = p.paymentReference.toLowerCase().includes(q);
        const matchesCust = p.customer.name.toLowerCase().includes(q);
        const matchesProd = p.productName.toLowerCase().includes(q);
        const matchesPaypal = p.paypalOrderId.toLowerCase().includes(q);
        if (!matchesRef && !matchesCust && !matchesProd && !matchesPaypal) return false;
      }

      return true;
    });
  }, [payments, activeTab, filterStatus, filterRisk, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: payments.length,
      held: payments.filter((p) => p.authorizationStatus === 'HOLD_ACTIVE').length,
      captured: payments.filter((p) => p.authorizationStatus === 'CAPTURED').length,
      voided: payments.filter((p) => p.authorizationStatus === 'VOIDED').length,
    };
  }, [payments]);

  return (
    <AppShell activeItem="/merchant/payments">
      <div className="space-y-6">
        {notification && (
          <div className="bg-[#EAF4F1] border border-[#1A7A64]/30 text-[#1A7A64] px-4 py-2.5 rounded-[6px] text-[13px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-[12px] text-[#1A7A64] hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Title & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#697078]">
              Register
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F] mt-0.5">
              Protected Payments Ledger
            </h1>
            <p className="text-[13px] text-[#697078] mt-1">
              Complete register of merchant checkouts governed by Scam Brake pre-capture holds.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/merchant/simulator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[12px] font-medium text-[#171A1F] rounded-[6px] transition-colors"
            >
              <PlusCircle size={14} className="text-[#171A1F]" />
              <span>Simulate Checkout</span>
            </Link>
            <button
              onClick={() => setPayments(mockStore.getPayments())}
              className="p-1.5 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[#697078] hover:text-[#171A1F] rounded-[6px] transition-colors cursor-pointer"
              title="Refresh ledger"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => {
                const csv = [
                  'Reference,PayPal_Order,Customer,Amount,Status,Risk_Score,Risk_Level',
                  ...payments.map(
                    (p) =>
                      `${p.paymentReference},${p.paypalOrderId},"${p.customer.name}",${p.amount},${p.authorizationStatus},${p.riskScore},${p.riskLevel}`
                  ),
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `scambrake_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[12px] font-medium text-[#697078] hover:text-[#171A1F] rounded-[6px] transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segmented Filter Tabs */}
          <div className="inline-flex items-center bg-[#F6F6F3] border border-[#DFE2DF] p-0.5 rounded-[6px]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#FFFFFF] text-[#171A1F] border border-[#DFE2DF] font-semibold'
                  : 'text-[#697078] hover:text-[#171A1F]'
              }`}
            >
              All Records ({counts.all})
            </button>
            <button
              onClick={() => setActiveTab('held')}
              className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                activeTab === 'held'
                  ? 'bg-[#FFFFFF] text-[#9A6700] border border-[#DFE2DF] font-semibold'
                  : 'text-[#697078] hover:text-[#171A1F]'
              }`}
            >
              Holds Active ({counts.held})
            </button>
            <button
              onClick={() => setActiveTab('captured')}
              className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                activeTab === 'captured'
                  ? 'bg-[#FFFFFF] text-[#1A7A64] border border-[#DFE2DF] font-semibold'
                  : 'text-[#697078] hover:text-[#171A1F]'
              }`}
            >
              Captured ({counts.captured})
            </button>
            <button
              onClick={() => setActiveTab('voided')}
              className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                activeTab === 'voided'
                  ? 'bg-[#FFFFFF] text-[#C53030] border border-[#DFE2DF] font-semibold'
                  : 'text-[#697078] hover:text-[#171A1F]'
              }`}
            >
              Voided ({counts.voided})
            </button>
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[12px] text-[#697078]">
              <SlidersHorizontal size={13} />
              <span>Filter:</span>
            </div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'ALL')}
              className="text-[12px] bg-[#FFFFFF] border border-[#DFE2DF] text-[#171A1F] rounded-[6px] px-2.5 py-1.5 focus:outline-none focus:border-[#171A1F]"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk (80-100)</option>
              <option value="HIGH">High Risk (60-79)</option>
              <option value="MEDIUM">Medium Risk (30-59)</option>
              <option value="LOW">Low Risk (0-29)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AuthorizationStatus | 'ALL')}
              className="text-[12px] bg-[#FFFFFF] border border-[#DFE2DF] text-[#171A1F] rounded-[6px] px-2.5 py-1.5 focus:outline-none focus:border-[#171A1F]"
            >
              <option value="ALL">All Authorization States</option>
              <option value="HOLD_ACTIVE">Hold Active</option>
              <option value="CAPTURED">Captured</option>
              <option value="VOIDED">Voided (Pre-capture)</option>
              <option value="PENDING_REVIEW">Pending Review</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="border border-[#DFE2DF] rounded-[6px] overflow-hidden bg-[#FFFFFF]">
          <PaymentTable
            payments={filteredPayments}
            onSelectPayment={handleSelectPayment}
            selectedPaymentId={selectedPayment?.id}
          />
        </div>

        {/* Footnote on Pre-Capture Hold Architecture */}
        <div className="text-[12px] text-[#697078] pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#DFE2DF]">
          <p>
            This ledger contains seeded sample records only. No PayPal transactions have been created, captured, or voided.
          </p>
          <span className="font-mono text-[11px] text-[#697078] shrink-0">
            Displaying {filteredPayments.length} of {payments.length} transactions
          </span>
        </div>
      </div>

      {/* Slide-out Drawer for deep inspection */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCapture={handleCapture}
        onVoid={handleVoid}
      />
    </AppShell>
  );
}
