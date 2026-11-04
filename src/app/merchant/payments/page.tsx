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
      setNotification(`Authorization ${updated.paymentReference} successfully captured.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleVoid = (id: string, reason?: string) => {
    const updated = mockStore.voidPayment(id, reason);
    if (updated) {
      setPayments(mockStore.getPayments());
      setSelectedPayment(updated);
      setNotification(`Authorization ${updated.paymentReference} voided before capture.`);
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
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#059669] px-4 py-2.5 rounded text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs text-[#059669] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Title & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
              Protected Payments Ledger
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Complete register of merchant checkouts governed by Scam Brake authorization holds.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/merchant/simulator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#FAFAFC] text-xs font-medium text-[#1E1E2A] rounded transition-colors"
            >
              <PlusCircle size={14} className="text-[#2D5BFF]" />
              Simulate Checkout
            </Link>
            <button
              onClick={() => setPayments(mockStore.getPayments())}
              className="p-1.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#FAFAFC] text-[#6B7280] rounded transition-colors"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#FAFAFC] text-xs font-medium text-[#6B7280] rounded transition-colors"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segmented Filter Tabs */}
          <div className="inline-flex items-center bg-[#FAFAFC] border border-[#E5E7EB] p-0.5 rounded">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#FFFFFF] text-[#1E1E2A] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1E1E2A]'
              }`}
            >
              All Records ({counts.all})
            </button>
            <button
              onClick={() => setActiveTab('held')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === 'held'
                  ? 'bg-[#FFFFFF] text-[#D97706] shadow-xs font-semibold'
                  : 'text-[#6B7280] hover:text-[#1E1E2A]'
              }`}
            >
              Holds Active ({counts.held})
            </button>
            <button
              onClick={() => setActiveTab('captured')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === 'captured'
                  ? 'bg-[#FFFFFF] text-[#059669] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1E1E2A]'
              }`}
            >
              Captured ({counts.captured})
            </button>
            <button
              onClick={() => setActiveTab('voided')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === 'voided'
                  ? 'bg-[#FFFFFF] text-[#DC2626] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1E1E2A]'
              }`}
            >
              Voided ({counts.voided})
            </button>
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <SlidersHorizontal size={13} />
              <span>Filter:</span>
            </div>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'ALL')}
              className="text-xs bg-[#FFFFFF] border border-[#E5E7EB] text-[#1E1E2A] rounded px-2.5 py-1.5 focus:outline-hidden focus:border-[#2D5BFF]"
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
              className="text-xs bg-[#FFFFFF] border border-[#E5E7EB] text-[#1E1E2A] rounded px-2.5 py-1.5 focus:outline-hidden focus:border-[#2D5BFF]"
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
        <div className="border border-[#E5E7EB] rounded overflow-hidden bg-[#FFFFFF]">
          <PaymentTable
            payments={filteredPayments}
            onSelectPayment={handleSelectPayment}
            selectedPaymentId={selectedPayment?.id}
          />
        </div>

        {/* Footnote on Pre-Capture Hold Architecture */}
        <div className="text-xs text-[#6B7280] pt-2 flex items-center justify-between">
          <p>
            Authorizations are temporary holds created via PayPal Orders API (`intent: AUTHORIZE`).
            Voiding an uncaptured authorization releases funds without transaction fees or chargebacks.
          </p>
          <span className="font-mono text-[11px] text-[#6B7280]">
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
