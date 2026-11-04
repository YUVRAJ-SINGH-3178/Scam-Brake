'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { Payment } from '@/types';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

function MerchantPaymentDetailContent() {
  const params = useParams();
  const router = useRouter();
  const paymentId = (params?.id as string) || '';

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (paymentId) {
      const found = mockStore.getPaymentById(paymentId);
      if (found) {
        setPayment(found);
      }
      setLoading(false);
    }
  }, [paymentId]);

  const handleCapture = () => {
    if (!payment) return;
    const updated = mockStore.capturePayment(
      payment.id,
      'Merchant manual override after out-of-band contact.'
    );
    if (updated) {
      setPayment(updated);
      setActionFeedback('Payment authorization successfully captured.');
    }
  };

  const handleVoid = () => {
    if (!payment) return;
    const updated = mockStore.voidPayment(
      payment.id,
      'Manual merchant void due to unconfirmed social-engineering indicators.'
    );
    if (updated) {
      setPayment(updated);
      setActionFeedback('Payment authorization voided. Funds returned to customer PayPal account.');
    }
  };

  if (loading) {
    return (
      <AppShell activeItem="/merchant/payments">
        <div className="py-24 text-center text-[#6B7280]">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#2D5BFF] border-t-transparent mb-3" />
          <p className="text-sm">Loading authorization record...</p>
        </div>
      </AppShell>
    );
  }

  if (!payment) {
    return (
      <AppShell activeItem="/merchant/payments">
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="p-3 bg-[#FAFAFC] border border-[#E5E7EB] rounded w-fit mx-auto text-[#6B7280]">
            <FileText size={24} />
          </div>
          <h2 className="text-lg font-semibold text-[#1E1E2A]">Payment Record Not Found</h2>
          <p className="text-sm text-[#6B7280]">
            The payment reference `{paymentId}` could not be located in the merchant ledger.
          </p>
          <Link
            href="/merchant/payments"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] text-xs font-medium text-[#1E1E2A] rounded hover:bg-[#FAFAFC]"
          >
            <ArrowLeft size={14} />
            Back to Payments Ledger
          </Link>
        </div>
      </AppShell>
    );
  }

  const isHeld = payment.authorizationStatus === 'HOLD_ACTIVE';

  return (
    <AppShell activeItem="/merchant/payments">
      <div className="space-y-6 max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/merchant/payments"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1E1E2A] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Payments Ledger</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6B7280]">
              PayPal Auth: {payment.paypalAuthorizationId}
            </span>
          </div>
        </div>

        {actionFeedback && (
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#059669] px-4 py-2.5 rounded text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{actionFeedback}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-xs text-[#059669] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Summary */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
                  {payment.paymentReference}
                </h1>
                <Badge variant={payment.authorizationStatus} />
                <Badge variant={payment.riskLevel} />
              </div>
              <p className="text-xs text-[#6B7280]">
                Authorized {new Date(payment.authorizedAt).toLocaleString()} via PayPal Protected Checkout
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="font-mono text-3xl font-semibold text-[#1E1E2A] tabular-nums">
                ${payment.amount.toFixed(2)}
              </div>
              <div className="text-xs text-[#6B7280] mt-0.5">USD Pre-Capture Hold</div>
            </div>
          </div>

          {/* Authorization Path Motif */}
          <div className="pt-2">
            <div className="text-xs font-medium text-[#6B7280] mb-3">Authorization Lifecycle State</div>
            <AuthorizationPath
              status={payment.authorizationStatus}
              interventionStatus={payment.interventionStatus}
              className="bg-[#FAFAFC] p-4 rounded border border-[#E5E7EB]"
            />
          </div>

          {/* Operational Hold Counter */}
          {isHeld && (
            <div className="bg-[#FEF3C7]/40 border border-[#F59E0B]/30 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-[#D97706]" />
                <div>
                  <div className="text-xs font-semibold text-[#92400E]">Active Pre-Capture Verification Hold</div>
                  <div className="text-xs text-[#B45309]">
                    Window remaining: ~{Math.floor(payment.authorizationHoldSecondsRemaining / 60)} minutes before automated timeout policy.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/merchant/investigations/${payment.id}`}
                  className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D97706]/40 text-xs font-medium text-[#92400E] rounded hover:bg-[#FEF3C7] transition-colors"
                >
                  View Live Investigation
                </Link>
                <Link
                  href={`/intervention?paymentId=${payment.id}`}
                  className="px-3 py-1.5 bg-[#2D5BFF] text-white text-xs font-medium rounded hover:bg-[#2044C8] transition-colors"
                >
                  Open Customer View
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Customer & Order Metadata */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#1E1E2A] flex items-center gap-2">
              <User size={15} className="text-[#6B7280]" />
              Customer Profile & Checkout Context
            </h2>

            <div className="divide-y divide-[#E5E7EB] text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Customer Name</span>
                <span className="font-medium text-[#1E1E2A]">{payment.customer.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Masked Email</span>
                <span className="font-mono text-[#1E1E2A]">{payment.customer.maskedEmail}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Masked Phone</span>
                <span className="font-mono text-[#1E1E2A]">{payment.customer.maskedPhone}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Merchant Account Age</span>
                <span className="text-[#1E1E2A]">{payment.customer.accountAgeMonths} months</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Trusted Contact Registered</span>
                <span className="text-[#1E1E2A]">
                  {payment.customer.hasTrustedContact ? (
                    <span className="text-[#059669] font-medium">Yes ({payment.customer.trustedContactName})</span>
                  ) : (
                    <span className="text-[#6B7280]">None Registered</span>
                  )}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Item Description</span>
                <span className="font-medium text-[#1E1E2A]">{payment.productName}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Item Category</span>
                <span className="text-[#1E1E2A]">{payment.productCategory}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Risk Signals & Intelligence */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1E1E2A] flex items-center gap-2">
                <ShieldAlert size={15} className="text-[#6B7280]" />
                Enriched Risk Signals ({payment.riskSignals.length})
              </h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#FAFAFC] border border-[#E5E7EB]">
                Score: {payment.riskScore} / 100
              </span>
            </div>

            {payment.riskSignals.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6B7280]">
                No elevated coercion or impersonation markers detected.
              </div>
            ) : (
              <div className="space-y-2.5">
                {payment.riskSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="p-3 bg-[#FAFAFC] border border-[#E5E7EB] rounded text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1E1E2A]">{signal.title}</span>
                      <Badge variant={signal.severity} />
                    </div>
                    <p className="text-[#6B7280] leading-relaxed">{signal.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
                      <span>Source: {signal.source}</span>
                      <span>Confidence: {Math.round(signal.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Manual Merchant Action Bar */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-[#1E1E2A]">Merchant Settlement Actions</div>
            <p className="text-xs text-[#6B7280]">
              You can manually capture the funds if safe, or void the authorization to immediately release customer funds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleVoid}
              disabled={payment.authorizationStatus === 'VOIDED'}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                payment.authorizationStatus === 'VOIDED'
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#FFFFFF] border border-[#DC2626]/40 text-[#DC2626] hover:bg-[#FEF2F2]'
              }`}
            >
              Void Authorization
            </button>
            <button
              onClick={handleCapture}
              disabled={payment.authorizationStatus === 'CAPTURED'}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                payment.authorizationStatus === 'CAPTURED'
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#2D5BFF] text-white hover:bg-[#2044C8]'
              }`}
            >
              Capture Payment
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function MerchantPaymentDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFC] py-24 text-center text-[#6B7280]">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#2D5BFF] border-t-transparent mb-3" />
          <p className="text-sm">Loading authorization record...</p>
        </div>
      }
    >
      <MerchantPaymentDetailContent />
    </Suspense>
  );
}
