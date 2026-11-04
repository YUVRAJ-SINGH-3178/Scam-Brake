'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Shield,
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/merchant/AppShell';
import { PaymentTable } from '@/components/merchant/PaymentTable';
import { PaymentDetailDrawer } from '@/components/merchant/PaymentDetailDrawer';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import { Button } from '@/components/ui/Button';
import { RiskBadge, AuthStatusBadge, InterventionBadge } from '@/components/ui/Badge';
import { mockStore } from '@/services';
import { Payment } from '@/types';

export default function MerchantDashboardPage() {
  const [metrics, setMetrics] = useState(() => mockStore.getDashboardMetrics());
  const [payments, setPayments] = useState(() => mockStore.getPayments());
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeHolds = payments.filter((p) => p.authorizationStatus === 'HOLD_ACTIVE');
  const criticalCases = payments.filter((p) => p.riskLevel === 'CRITICAL');

  const handleSelectPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setDrawerOpen(true);
  };

  const refreshData = () => {
    setPayments(mockStore.getPayments());
    setMetrics(mockStore.getDashboardMetrics());
    if (selectedPayment) {
      setSelectedPayment(mockStore.getPaymentById(selectedPayment.id) || null);
    }
  };

  return (
    <AppShell activeItem="Overview">
      <div className="space-y-8">
        {/* Screen Header & The Core Question */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <div className="text-[11px] font-mono font-semibold text-[#2D5BFF] uppercase tracking-wider">
              OPERATIONAL OVERVIEW
            </div>
            <h1 className="text-2xl font-semibold text-[#1E1E2A] mt-0.5">
              Which protected payments need attention now?
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-1">
              Currently holding <strong className="text-[#1E1E2A]">{activeHolds.length} uncaptured authorizations</strong> undergoing customer verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/merchant/simulator">
              <Button variant="outline" size="sm">
                <span>Run Simulator</span>
              </Button>
            </Link>
            <Link href="/merchant/payments">
              <Button variant="primary" size="sm">
                <span>View Full Ledger</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. Scam Brake Signature Element: The Authorization Path Lifecycle Strip */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
            Active Pre-Capture Protocol Lifecycle
          </div>
          <AuthorizationPath
            currentStage="REVIEW"
            variant="app"
            holdSecondsRemaining={activeHolds[0]?.authorizationHoldSecondsRemaining}
            amount={metrics.activeHoldAmount}
          />
        </div>

        {/* 2. Structured Financial Metrics (KPIs as Clean Type, Not Tiles) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC]">
          <div>
            <div className="text-[12px] text-[#6B7280]">Total Protected Volume</div>
            <div className="text-[24px] font-mono font-semibold text-[#1E1E2A] mt-0.5">
              ${metrics.totalProtectedVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">
              {metrics.totalTransactionsReviewed} authorizations reviewed
            </div>
          </div>

          <div>
            <div className="text-[12px] text-[#6B7280]">Active Holds (In Review)</div>
            <div className="text-[24px] font-mono font-semibold text-[#F59E0B] mt-0.5">
              ${metrics.activeHoldAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#D97706] font-medium mt-0.5">
              {metrics.activeHoldCount} payments pending decision
            </div>
          </div>

          <div>
            <div className="text-[12px] text-[#6B7280]">Fraud Voided (Money Saved)</div>
            <div className="text-[24px] font-mono font-semibold text-[#EF4444] mt-0.5">
              ${metrics.voidedFraudAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#DC2626] font-medium mt-0.5">
              {metrics.voidedFraudCount} scam payments stopped
            </div>
          </div>

          <div>
            <div className="text-[12px] text-[#6B7280]">Captured Legitimate Volume</div>
            <div className="text-[24px] font-mono font-semibold text-[#10B981] mt-0.5">
              ${metrics.capturedLegitimateAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#059669] font-medium mt-0.5">
              {metrics.capturedLegitimateCount} clean orders fulfilled
            </div>
          </div>
        </div>

        {/* 3. Urgent Attention Section: Active Interventions Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
              <h2 className="text-[15px] font-semibold text-[#1E1E2A]">
                Authorizations Requiring Immediate Attention ({activeHolds.length})
              </h2>
            </div>
            <Link
              href="/merchant/interventions"
              className="text-[12px] text-[#2D5BFF] hover:underline font-medium"
            >
              Open Interventions Queue →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeHolds.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectPayment(p)}
                className="p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#2D5BFF] transition-all cursor-pointer shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-[#2D5BFF]">
                      {p.paymentReference}
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      ({p.customer.name})
                    </span>
                  </div>
                  <RiskBadge level={p.riskLevel} score={p.riskScore} />
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-[13px] font-medium text-[#1E1E2A] truncate max-w-[240px]">
                    {p.productName}
                  </div>
                  <div className="font-mono font-bold text-[16px] text-[#1E1E2A]">
                    ${p.amount.toFixed(2)}
                  </div>
                </div>

                {/* Primary Risk Indicator */}
                {p.riskSignals[0] && (
                  <div className="p-2.5 rounded-lg bg-[#EF4444]/8 border border-[#EF4444]/20 text-[11px] text-[#991B1B] flex items-start gap-2">
                    <AlertTriangle size={14} className="text-[#EF4444] shrink-0 mt-0.5" />
                    <span>{p.riskSignals[0].title}: {p.riskSignals[0].description}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] text-[11px] text-[#6B7280]">
                  <span>Hold Expires in: {Math.floor(p.authorizationHoldSecondsRemaining / 3600)}h</span>
                  <span className="text-[#2D5BFF] font-medium flex items-center gap-1">
                    <span>Inspect Case</span>
                    <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Complete Protected Payments Ledger */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#1E1E2A]">
              Recent Protected Payments
            </h2>
            <div className="text-[12px] text-[#6B7280]">
              Showing all recorded PayPal authorizations
            </div>
          </div>

          <PaymentTable
            payments={payments}
            onSelectPayment={handleSelectPayment}
            selectedPaymentId={selectedPayment?.id}
          />
        </div>
      </div>

      {/* Master-Detail Drawer */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onPaymentUpdated={refreshData}
      />
    </AppShell>
  );
}
