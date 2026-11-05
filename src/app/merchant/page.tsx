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
        {/* Screen Header & Strategic Question */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <div className="text-[13px] font-medium text-[#525860]">
              Operational Overview
            </div>
            <h1 className="text-2xl font-semibold text-[#171A1F] mt-0.5 tracking-tight">
              Which protected payments need attention now?
            </h1>
            <p className="text-[14px] text-[#525860] mt-1">
              Sample dashboard data only. This prototype has no active PayPal authorizations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/merchant/simulator">
              <Button variant="outline" size="sm">
                <span>Simulation Center</span>
              </Button>
            </Link>
            <Link href="/merchant/payments">
              <Button variant="primary" size="sm">
                <span>View Full Ledger</span>
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. Scam Brake Signature Element: Authorization Protocol Lifecycle */}
        <div className="space-y-2">
          <div className="text-[13px] font-medium text-[#525860]">
            Pre-Capture Hold Lifecycle
          </div>
          <AuthorizationPath
            currentStage="REVIEW"
            variant="app"
            holdSecondsRemaining={activeHolds[0]?.authorizationHoldSecondsRemaining}
            amount={metrics.activeHoldAmount}
          />
        </div>

        {/* 2. Structured Financial Metrics (Clean Hairline Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-[6px] border border-[#DFE2DF] bg-[#F6F6F3]">
          <div>
            <div className="text-[13px] text-[#525860]">Sample Protected Volume</div>
            <div className="text-[22px] font-semibold text-[#171A1F] mt-0.5 tabular-nums">
              <code>${metrics.totalProtectedVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}</code>
            </div>
            <div className="text-[12px] text-[#525860] mt-0.5">
              {metrics.totalTransactionsReviewed} sample transactions
            </div>
          </div>

          <div>
            <div className="text-[13px] text-[#525860]">Sample Holds (In Review)</div>
            <div className="text-[22px] font-semibold text-[#784D00] mt-0.5 tabular-nums">
              <code>${metrics.activeHoldAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</code>
            </div>
            <div className="text-[12px] text-[#784D00] mt-0.5 font-medium">
              {metrics.activeHoldCount} sample holds
            </div>
          </div>

          <div>
            <div className="text-[13px] text-[#525860]">Illustrative Voids</div>
            <div className="text-[22px] font-semibold text-[#C53030] mt-0.5 tabular-nums">
              <code>${metrics.voidedFraudAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</code>
            </div>
            <div className="text-[12px] text-[#C53030] mt-0.5 font-medium">
              {metrics.voidedFraudCount} sample records
            </div>
          </div>

          <div>
            <div className="text-[13px] text-[#525860]">Illustrative Captures</div>
            <div className="text-[22px] font-semibold text-[#1A7A64] mt-0.5 tabular-nums">
              <code>${metrics.capturedLegitimateAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</code>
            </div>
            <div className="text-[12px] text-[#1A7A64] mt-0.5 font-medium">
              {metrics.capturedLegitimateCount} sample records
            </div>
          </div>
        </div>

        {/* 3. Urgent Attention Section: Active Interventions Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9A6700]" />
              <h2 className="text-[14px] font-semibold text-[#171A1F]">
                Authorizations Requiring Attention ({activeHolds.length})
              </h2>
            </div>
            <Link
              href="/merchant/interventions"
              className="text-[12px] text-[#171A1F] hover:text-[#1A7A64] hover:underline font-medium"
            >
              Open Interventions Queue →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeHolds.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectPayment(p)}
                className="p-4 rounded-[6px] border border-[#DFE2DF] bg-[#FFFFFF] hover:border-[#171A1F]/40 transition-colors cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-semibold text-[#171A1F]">
                      {p.paymentReference}
                    </span>
                    <span className="text-[11px] text-[#697078]">
                      ({p.customer.name})
                    </span>
                  </div>
                  <RiskBadge level={p.riskLevel} score={p.riskScore} />
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-[13px] font-medium text-[#171A1F] truncate max-w-[240px]">
                    {p.productName}
                  </div>
                  <div className="font-mono font-semibold text-[15px] text-[#171A1F] tabular-nums">
                    ${p.amount.toFixed(2)}
                  </div>
                </div>

                {/* Primary Risk Indicator */}
                {p.riskSignals[0] && (
                  <div className="p-2.5 rounded-[4px] bg-[#FAF2E4] border border-[#784D00]/20 text-[12px] text-[#784D00] flex items-start gap-2">
                    <AlertTriangle size={13} className="text-[#784D00] shrink-0 mt-0.5" />
                    <span>{p.riskSignals[0].title}: {p.riskSignals[0].description}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#DFE2DF] text-[12px] text-[#525860]">
                  <span><code>Hold Window: {Math.floor(p.authorizationHoldSecondsRemaining / 3600)}h remaining</code></span>
                  <span className="text-[#171A1F] font-medium flex items-center gap-1">
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
            <h2 className="text-[14px] font-semibold text-[#171A1F]">
              Recent Protected Payments
            </h2>
            <div className="text-[12px] text-[#697078]">
              Seeded sample records only
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
