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
      subtitle={`PayPal Order ID: ${payment.paypalOrderId}`}
    >
      <div className="space-y-6 text-[#171A1F]">
        {/* 1. Header Overview & Financial Total */}
        <div className="p-4 rounded-[6px] bg-[#F6F6F3] border border-[#DFE2DF]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-[#697078]">Authorized Amount</span>
            <AuthStatusBadge status={payment.authorizationStatus} />
          </div>
          <div className="text-[26px] font-mono font-semibold tracking-tight text-[#171A1F]">
            ${payment.amount.toFixed(2)}{' '}
            <span className="text-[13px] text-[#697078] font-normal">
              {payment.currency}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#DFE2DF] text-[12px] text-[#697078]">
            <span>Product:</span>
            <span className="font-medium text-[#171A1F] truncate">
              {payment.productName}
            </span>
          </div>
        </div>

        {/* 2. Authorization Path Motif Widget */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#697078] mb-2">
            Lifecycle Protocol
          </div>
          <AuthorizationPath
            currentStage={currentPathStage}
            variant="app"
            holdSecondsRemaining={payment.authorizationHoldSecondsRemaining}
          />
        </div>

        {/* 3. Action Bar (If Hold is Active) */}
        {payment.authorizationStatus === 'HOLD_ACTIVE' && (
          <div className="p-4 rounded-[6px] bg-[#FFFFFF] border border-[#DFE2DF] space-y-3">
            <div className="text-[12px] font-semibold text-[#171A1F]">
              Merchant Settlement Controls
            </div>
            <p className="text-[12px] text-[#697078] leading-relaxed">
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
                <span>Capture Hold</span>
              </Button>
            </div>
          </div>
        )}

        {/* 4. Risk Signals & Intelligence Evidence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#697078]">
              Risk Signals ({payment.riskSignals.length})
            </span>
            <RiskBadge level={payment.riskLevel} score={payment.riskScore} />
          </div>

          {payment.riskSignals.length === 0 ? (
            <div className="p-3.5 rounded-[6px] bg-[#EAF4F1] border border-[#1A7A64]/20 text-[12px] text-[#1A7A64] flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>Zero abnormal coercion or impersonation signals detected.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {payment.riskSignals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-3 rounded-[6px] border border-[#DFE2DF] bg-[#FFFFFF] text-[12px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#171A1F]">{sig.title}</span>
                    <span className="font-mono text-[10px] text-[#697078]">
                      {Math.round(sig.confidence * 100)}% Match
                    </span>
                  </div>
                  <p className="text-[#697078] leading-relaxed">{sig.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-[#697078] border-t border-[#DFE2DF]/60 mt-1">
                    <span>Source: {sig.source}</span>
                    <span className="font-mono">{new Date(sig.detectedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Customer Profile & Trusted Contact */}
        <div className="p-4 rounded-[6px] border border-[#DFE2DF] bg-[#FFFFFF] space-y-2 text-[12px]">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#697078] mb-1">
            Customer Profile
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#697078]">Name</span>
            <span className="font-medium text-[#171A1F]">{payment.customer.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#697078]">Email</span>
            <span className="font-mono text-[#171A1F]">{payment.customer.maskedEmail}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#697078]">Phone</span>
            <span className="font-mono text-[#171A1F]">{payment.customer.maskedPhone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#697078]">Tenure</span>
            <span className="text-[#171A1F]">{payment.customer.accountAgeMonths} months</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#DFE2DF]">
            <span className="text-[#697078]">Trusted Contact</span>
            <span className="font-medium text-[#171A1F]">
              {payment.customer.hasTrustedContact
                ? payment.customer.trustedContactName
                : 'None Registered'}
            </span>
          </div>
        </div>

        {/* 6. Intervention Conversation Transcript (If available) */}
        {interventionSession && (
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#697078]">
              Intervention Transcript
            </div>
            <div className="p-3.5 rounded-[6px] border border-[#DFE2DF] bg-[#F6F6F3] space-y-2.5 max-h-56 overflow-y-auto text-[12px]">
              {interventionSession.messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-[4px] ${
                    m.sender === 'CUSTOMER'
                      ? 'bg-[#FFFFFF] border border-[#DFE2DF] ml-4'
                      : 'bg-[#FFFFFF] border border-[#DFE2DF] mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-[#697078] mb-1">
                    <span className="font-semibold text-[#171A1F]">
                      {m.sender === 'CUSTOMER' ? payment.customer.name : 'Scam Brake Assistant'}
                    </span>
                    <span className="font-mono">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[#171A1F] leading-relaxed">{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Cryptographic Audit Trail */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#697078]">
            Audit Trail ({auditEvents.length} events)
          </div>
          <div className="space-y-1.5">
            {auditEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-2.5 rounded-[4px] border border-[#DFE2DF] bg-[#FFFFFF] text-[12px] space-y-1 font-mono"
              >
                <div className="flex items-center justify-between text-[11px] text-[#697078]">
                  <span className="font-medium text-[#171A1F]">{ev.eventType}</span>
                  <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-[11px] text-[#697078] font-sans">{ev.summary}</div>
                <div className="text-[10px] text-[#697078] truncate">
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
