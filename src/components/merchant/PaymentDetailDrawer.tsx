'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Clock,
  User,
  CreditCard,
  Building,
  FileCheck2,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Payment } from '@/types';
import { Drawer } from '@/components/ui/Drawer';
import { RiskBadge, AuthStatusBadge, InterventionBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import { mockStore } from '@/services';
import { toast } from 'sonner';

interface PaymentDetailDrawerProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentUpdated?: () => void;
  onCapture?: (id: string, notes?: string) => void;
  onVoid?: (id: string, reason?: string) => void;
}

export const PaymentDetailDrawer: React.FC<PaymentDetailDrawerProps> = ({
  payment,
  isOpen,
  onClose,
  onPaymentUpdated,
  onCapture,
  onVoid,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!payment) return null;

  const auditEvents = mockStore.getAuditLogs(payment.id);
  const interventionSession = payment.interventionSessionId
    ? mockStore.getInterventionById(payment.interventionSessionId)
    : undefined;

  const handleCapture = () => {
    setIsProcessing(true);
    setTimeout(() => {
      mockStore.capturePayment(payment.id, 'Manual merchant review approved capture.');
      toast.success(`Authorization captured for ${payment.paymentReference}`);
      setIsProcessing(false);
      onPaymentUpdated?.();
    }, 400);
  };

  const handleVoid = () => {
    setIsProcessing(true);
    setTimeout(() => {
      mockStore.voidPayment(payment.id, 'Coercive risk confirmed by merchant operations.');
      toast.success(`Authorization voided for ${payment.paymentReference}`);
      setIsProcessing(false);
      onPaymentUpdated?.();
    }, 400);
  };

  // Determine stage on the Authorization Path
  const currentPathStage =
    payment.authorizationStatus === 'VOIDED'
      ? 'VOID'
      : payment.authorizationStatus === 'CAPTURED'
      ? 'CAPTURE'
      : payment.interventionStatus === 'ACTIVE_INTERVENTION'
      ? 'REVIEW'
      : 'AUTHORIZED';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={payment.paymentReference}
      subtitle={`PayPal Order: ${payment.paypalOrderId}`}
    >
      <div className="space-y-6 text-[#1E1E2A]">
        {/* 1. Header Overview & Financial Total */}
        <div className="p-4 rounded-xl bg-[#FAFAFC] border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-[#6B7280]">Authorized Amount</span>
            <AuthStatusBadge status={payment.authorizationStatus} />
          </div>
          <div className="text-[28px] font-mono font-semibold tracking-tight text-[#1E1E2A]">
            ${payment.amount.toFixed(2)}{' '}
            <span className="text-[14px] text-[#6B7280] font-normal">
              {payment.currency}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E5E7EB] text-[12px] text-[#6B7280]">
            <span>Product:</span>
            <span className="font-medium text-[#1E1E2A] truncate">
              {payment.productName}
            </span>
          </div>
        </div>

        {/* 2. Authorization Path Motif Widget */}
        <div>
          <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Verification Protocol State
          </div>
          <AuthorizationPath
            currentStage={currentPathStage}
            variant="app"
            holdSecondsRemaining={payment.authorizationHoldSecondsRemaining}
          />
        </div>

        {/* 3. Action Bar (If Hold is Active) */}
        {payment.authorizationStatus === 'HOLD_ACTIVE' && (
          <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E5E7EB] space-y-3">
            <div className="text-[12px] font-semibold text-[#1E1E2A]">
              Merchant Execution Controls
            </div>
            <p className="text-[12px] text-[#6B7280] leading-relaxed">
              Funds are currently frozen under a PayPal Authorization Hold. They have not been deducted as a final charge.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="danger"
                size="md"
                isLoading={isProcessing}
                onClick={handleVoid}
                className="w-full text-[13px]"
              >
                <XCircle size={15} />
                <span>Void Authorization</span>
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isProcessing}
                onClick={handleCapture}
                className="w-full text-[13px]"
              >
                <CheckCircle2 size={15} />
                <span>Capture Funds</span>
              </Button>
            </div>
          </div>
        )}

        {/* 4. Risk Signals & Intelligence Evidence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Detected Risk Signals ({payment.riskSignals.length})
            </span>
            <RiskBadge level={payment.riskLevel} score={payment.riskScore} />
          </div>

          {payment.riskSignals.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#10B981]/5 border border-[#10B981]/20 text-[13px] text-[#059669] flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Zero abnormal coercion or impersonation signals detected.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {payment.riskSignals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-3 rounded-lg border border-[#E5E7EB] bg-white text-[12px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1E1E2A]">{sig.title}</span>
                    <span className="font-mono text-[10px] text-[#6B7280]">
                      {Math.round(sig.confidence * 100)}% Match
                    </span>
                  </div>
                  <p className="text-[#6B7280] leading-relaxed">{sig.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-[#9CA3AF]">
                    <span>Source: {sig.source}</span>
                    <span>{new Date(sig.detectedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Customer Profile & Trusted Contact */}
        <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-2.5 text-[12px]">
          <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
            Customer Context
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">Customer Name:</span>
            <span className="font-medium text-[#1E1E2A]">{payment.customer.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">Email:</span>
            <span className="font-mono text-[#1E1E2A]">{payment.customer.maskedEmail}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">Phone:</span>
            <span className="font-mono text-[#1E1E2A]">{payment.customer.maskedPhone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">Account History:</span>
            <span className="text-[#1E1E2A]">{payment.customer.accountAgeMonths} months</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
            <span className="text-[#6B7280]">Trusted Contact:</span>
            <span className="font-medium text-[#1E1E2A]">
              {payment.customer.hasTrustedContact
                ? payment.customer.trustedContactName
                : 'None Registered'}
            </span>
          </div>
        </div>

        {/* 6. Intervention Conversation Transcript (If available) */}
        {interventionSession && (
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Intervention Check-in Transcript
            </div>
            <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] space-y-2.5 max-h-56 overflow-y-auto text-[12px]">
              {interventionSession.messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-lg ${
                    m.sender === 'CUSTOMER'
                      ? 'bg-white border border-[#E5E7EB] ml-4'
                      : 'bg-[#2D5BFF]/8 border border-[#2D5BFF]/15 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-[#6B7280] mb-1">
                    <span className="font-medium">
                      {m.sender === 'CUSTOMER' ? payment.customer.name : 'Scam Brake Assistant'}
                    </span>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[#1E1E2A] leading-relaxed">{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Cryptographic Audit Trail */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
            Audit Trail ({auditEvents.length} events)
          </div>
          <div className="space-y-2">
            {auditEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[12px] space-y-1 font-mono"
              >
                <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span className="font-semibold text-[#1E1E2A]">{ev.eventType}</span>
                  <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-[11px] text-[#4B5563] font-sans">{ev.summary}</div>
                <div className="text-[10px] text-[#9CA3AF] truncate">
                  Hash: {ev.immutableHash}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
