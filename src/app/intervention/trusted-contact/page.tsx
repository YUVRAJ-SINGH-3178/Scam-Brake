'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Send,
  Lock,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { mockStore } from '@/services';

function CustomerTrustedContactContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId') || 'pay_sb_881901';

  const [payment] = useState(() => mockStore.getPaymentById(paymentId) || mockStore.getPaymentById('pay_sb_881901')!);
  const [session] = useState(() => mockStore.getInterventionById(payment.interventionSessionId || 'int_sess_881901')!);

  const [consentGranted, setConsentGranted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<any | null>(null);

  const contact = payment.customer.trustedContactName
    ? {
        name: payment.customer.trustedContactName,
        phone: payment.customer.trustedContactPhone || '+1 (415) •••-4410',
        relationship: 'Designated Family Advocate',
      }
    : {
        name: 'David Stephenson (Son)',
        phone: '+1 (415) •••-4410',
        relationship: 'Family Member',
      };

  const handleSendNotification = () => {
    if (!consentGranted) return;

    setIsSending(true);
    setTimeout(() => {
      mockStore.grantTrustedContactConsent(session.id);
      setIsSending(false);
      setDispatchStatus({
        status: 'DISPATCHED',
        dispatchedAt: new Date().toLocaleTimeString(),
        recipient: contact.name,
        channel: 'SMS via Twilio / Zapier Relay',
        trustedResponse:
          '"Mom, do NOT pay this! The IRS will never tell you to buy store vouchers. Hang up and wait for me to call you back."',
      });
    }, 900);
  };

  const handleVoidPayment = () => {
    mockStore.voidPayment(
      payment.id,
      'Customer consulted trusted contact, confirmed fraudulent coercion scheme, and voided authorization.'
    );
    router.push(`/intervention/resolved?action=voided&paymentId=${payment.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1E1E2A] flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href={`/intervention?paymentId=${payment.id}`} className="text-[#6B7280] hover:text-[#1E1E2A] p-1">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <ScamBrakeMark size={24} />
            <span className="font-semibold text-sm tracking-tight">
              SCAM<span className="text-[#2D5BFF]">BRAKE</span>
            </span>
            <span className="text-xs text-[#6B7280] border-l border-[#E5E7EB] pl-2 font-mono">
              TRUSTED CONTACT ADVOCACY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[#6B7280]">Order Ref: {payment.paymentReference}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Advocacy Explanation */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E1E2A]">
            <UserCheck size={18} className="text-[#059669]" />
            Get a Second Opinion From Someone You Trust
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            When scammers isolate people over the phone, they strictly forbid speaking to family members or friends. Breaking this artificial isolation is the single most effective way to prevent financial harm.
          </p>
          <div className="p-3 bg-[#FAFAFC] border border-[#E5E7EB] rounded text-xs space-y-1">
            <div className="font-semibold text-[#1E1E2A]">Privacy & Consent Guarantee:</div>
            <p className="text-[#6B7280] leading-relaxed">
              Scam Brake will <strong>never</strong> notify your contact without your explicit permission right here. We do not share your full financial history, passwords, or personal account numbers.
            </p>
          </div>
        </div>

        {/* Registered Contact Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <span className="text-[11px] font-mono text-[#6B7280]">Registered Safety Contact</span>
              <h2 className="text-base font-semibold text-[#1E1E2A]">{contact.name}</h2>
            </div>
            <span className="text-xs font-mono text-[#1E1E2A] bg-[#FAFAFC] border border-[#E5E7EB] px-2.5 py-1 rounded">
              {contact.relationship}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
              <span className="text-[#6B7280]">Telephone Number:</span>
              <span className="font-mono text-[#1E1E2A] font-medium">{contact.phone}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
              <span className="text-[#6B7280]">Notification Summary:</span>
              <span className="text-[#1E1E2A]">Safety pause on ${payment.amount.toFixed(2)} PayPal checkout</span>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 bg-[#FAFAFC] border border-[#E5E7EB] rounded cursor-pointer">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
                className="mt-0.5 accent-[#2D5BFF]"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-[#1E1E2A] block">
                  I give permission to send an SMS advisory to {contact.name}
                </span>
                <span className="text-[#6B7280] block text-[11px]">
                  An automated message will explain that your current payment is paused and invite them to review this situation with you.
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={handleSendNotification}
            disabled={!consentGranted || isSending || dispatchStatus !== null}
            className="w-full py-2.5 bg-[#059669] text-white text-xs font-medium rounded hover:bg-[#047857] transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isSending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending SMS notification...</span>
              </>
            ) : dispatchStatus ? (
              <>
                <CheckCircle2 size={14} />
                <span>SMS Notification Dispatched</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Send SMS to {contact.name}</span>
              </>
            )}
          </button>

          {/* Dispatched Confirmation & Simulated Reply */}
          {dispatchStatus && (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded text-xs text-[#059669] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>SMS delivered to {dispatchStatus.recipient} via {dispatchStatus.channel}</span>
                </div>
                <span className="font-mono text-[11px]">{dispatchStatus.dispatchedAt}</span>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#1E1E2A]">
                  <MessageSquare size={14} className="text-[#2D5BFF]" />
                  Direct Reply from {contact.name}:
                </div>
                <div className="p-3 bg-[#FAFAFC] border-l-2 border-[#DC2626] rounded text-[#1E1E2A] font-medium leading-relaxed italic">
                  {dispatchStatus.trustedResponse}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resolution Options */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link
            href={`/intervention?paymentId=${payment.id}`}
            className="text-xs text-[#6B7280] hover:text-[#1E1E2A] flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Return to Safety Chat</span>
          </Link>

          <button
            onClick={handleVoidPayment}
            className="w-full sm:w-auto px-4 py-2 bg-[#DC2626] text-white text-xs font-medium rounded hover:bg-[#B91C1C] transition-colors"
          >
            Cancel & Void Payment Hold Now
          </button>
        </div>
      </main>
    </div>
  );
}

export default function CustomerTrustedContactPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-6">
          <div className="text-xs text-[#6B7280]">Loading trusted contact advocate...</div>
        </div>
      }
    >
      <CustomerTrustedContactContent />
    </React.Suspense>
  );
}
