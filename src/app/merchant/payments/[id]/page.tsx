'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { Payment } from '@/types';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import { RiskBadge, AuthStatusBadge } from '@/components/ui/Badge';
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
        <div className="py-24 text-center text-[#525860]">
          <p className="text-[13px] font-medium">Loading authorization record...</p>
        </div>
      </AppShell>
    );
  }

  if (!payment) {
    return (
      <AppShell activeItem="/merchant/payments">
        <div className="max-w-md mx-auto py-16 text-center space-y-4" data-ui="true">
          <div className="p-3 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] w-fit mx-auto text-[#525860]">
            <FileText size={24} />
          </div>
          <h2 className="text-lg font-semibold text-[#171A1F]">Payment Record Not Found</h2>
          <p className="text-[13px] text-[#525860]">
            The payment reference <code className="font-mono text-xs">{paymentId}</code> could not be located in the merchant ledger.
          </p>
          <Link
            href="/merchant/payments"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] text-[13px] font-medium text-[#171A1F] rounded-[6px] hover:bg-[#F6F6F3]"
          >
            <ArrowLeft size={14} />
            <span>Back to Payments Ledger</span>
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
            className="inline-flex items-center gap-1.5 text-[13px] text-[#525860] hover:text-[#171A1F] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Payments Ledger</span>
          </Link>

          <div className="flex items-center gap-2">
            <code className="font-mono text-[12px] text-[#525860] bg-[#F6F6F3] px-2 py-0.5 rounded">
              PayPal Auth: {payment.paypalAuthorizationId}
            </code>
          </div>
        </div>

        {actionFeedback && (
          <div className="bg-[#EAF4F1] border border-[#1A7A64]/30 text-[#1A7A64] px-4 py-2.5 rounded-[6px] text-[13px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{actionFeedback}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-[12px] text-[#1A7A64] hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Summary */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#DFE2DF]">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F]">
                  <code className="font-mono text-xl">{payment.paymentReference}</code>
                </h1>
                <AuthStatusBadge status={payment.authorizationStatus} />
                <RiskBadge level={payment.riskLevel} score={payment.riskScore} />
              </div>
              <p className="text-[13px] text-[#525860]">
                Authorized {new Date(payment.authorizedAt).toLocaleString()} via PayPal Protected Checkout
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-3xl font-semibold text-[#171A1F] tabular-nums">
                <code className="font-mono">${payment.amount.toFixed(2)}</code>
              </div>
              <div className="text-[12px] text-[#525860] mt-0.5">USD Pre-Capture Hold</div>
            </div>
          </div>

          {/* Authorization Path Motif */}
          <div className="pt-2">
            <div className="text-[13px] font-medium text-[#525860] mb-3">Authorization lifecycle state</div>
            <AuthorizationPath
              currentStage={
                payment.authorizationStatus === 'VOIDED'
                  ? 'VOID'
                  : payment.authorizationStatus === 'CAPTURED'
                  ? 'CAPTURE'
                  : 'REVIEW'
              }
              variant="app"
              holdSecondsRemaining={payment.authorizationHoldSecondsRemaining}
            />
          </div>

          {/* Operational Hold Counter */}
          {isHeld && (
            <div className="bg-[#FAF2E4] border border-[#784D00]/20 rounded-[6px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-[#784D00] shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-[#784D00]">Active Pre-Capture Hold</div>
                  <div className="text-[12px] text-[#784D00]">
                    Window remaining: ~{Math.floor(payment.authorizationHoldSecondsRemaining / 60)} minutes before automated timeout policy.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/merchant/investigations/${payment.id}`}
                  className="px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] text-[13px] font-medium text-[#171A1F] rounded-[6px] hover:bg-[#F6F6F3] transition-colors"
                >
                  View Case
                </Link>
                <Link
                  href={`/intervention?paymentId=${payment.id}`}
                  className="px-3 py-1.5 bg-[#171A1F] text-white text-[13px] font-medium rounded-[6px] hover:bg-[#2B303A] transition-colors"
                >
                  Customer View
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Customer Profile */}
          <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-4">
            <h2 className="text-[14px] font-semibold text-[#171A1F] flex items-center gap-2">
              <User size={15} className="text-[#525860]" />
              <span>Customer Profile</span>
            </h2>

            <div className="divide-y divide-[#DFE2DF] text-[13px]">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#525860]">Customer Name</span>
                <span className="font-medium text-[#171A1F]">{payment.customer.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#525860]">Email</span>
                <code className="font-mono text-[12px] text-[#171A1F]">{payment.customer.maskedEmail}</code>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#525860]">Phone</span>
                <code className="font-mono text-[12px] text-[#171A1F]">{payment.customer.maskedPhone}</code>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#525860]">Account Age</span>
                <span className="text-[#171A1F]">{payment.customer.accountAgeMonths} months</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#525860]">Trusted Contact</span>
                <span className="font-medium text-[#171A1F]">
                  {payment.customer.hasTrustedContact ? payment.customer.trustedContactName : 'None Registered'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Order & Execution */}
          <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-4">
            <h2 className="text-[14px] font-semibold text-[#171A1F] flex items-center gap-2">
              <ShoppingBag size={15} className="text-[#525860]" />
              <span>Item & Settlement Context</span>
            </h2>

            <div className="divide-y divide-[#DFE2DF] text-[13px]">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#525860]">Product</span>
                <span className="font-medium text-[#171A1F] truncate max-w-[200px]">{payment.productName}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#525860]">Category</span>
                <span className="text-[#171A1F]">{payment.productCategory}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#525860]">Merchant</span>
                <span className="text-[#171A1F]">{payment.merchantName}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#525860]">PayPal Order ID</span>
                <code className="font-mono text-[12px] text-[#171A1F]">{payment.paypalOrderId}</code>
              </div>
            </div>

            {isHeld && (
              <div className="pt-3 border-t border-[#DFE2DF] flex items-center gap-2">
                <button
                  onClick={handleVoid}
                  className="flex-1 py-1.5 px-3 bg-[#FFFFFF] border border-[#C53030]/40 text-[#C53030] text-[13px] font-medium rounded-[6px] hover:bg-[#FDE8E8] transition-colors cursor-pointer"
                >
                  Void Hold
                </button>
                <button
                  onClick={handleCapture}
                  className="flex-1 py-1.5 px-3 bg-[#171A1F] text-white text-[13px] font-medium rounded-[6px] hover:bg-[#2B303A] transition-colors cursor-pointer"
                >
                  Capture Hold
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function MerchantPaymentDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F6F3] py-24 text-center text-[#525860]">
          <p className="text-[13px] font-medium">Loading payment details...</p>
        </div>
      }
    >
      <MerchantPaymentDetailContent />
    </React.Suspense>
  );
}
