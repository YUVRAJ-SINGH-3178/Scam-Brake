'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  Send,
  MessageSquare,
} from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { mockStore } from '@/services';

interface DispatchStatus {
  status: string;
  dispatchedAt: string;
  recipient: string;
  channel: string;
  trustedResponse: string;
}

function CustomerTrustedContactContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId') || 'pay_sb_881901';

  const [payment] = useState(() => mockStore.getPaymentById(paymentId) || mockStore.getPaymentById('pay_sb_881901')!);
  const [session] = useState(() => mockStore.getInterventionById(payment.interventionSessionId || 'int_sess_881901')!);

  const [consentGranted, setConsentGranted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<DispatchStatus | null>(null);

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
        channel: 'SMS Relay',
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
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#DFE2DF] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href={`/intervention?paymentId=${payment.id}`} className="text-[#697078] hover:text-[#171A1F] p-1">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <ScamBrakeMark size={24} />
            <span className="font-semibold text-[14px] tracking-tight text-[#171A1F]">
              SCAM BRAKE
            </span>
            <span className="text-[11px] text-[#697078] border-l border-[#DFE2DF] pl-2 font-mono">
              TRUSTED CONTACT ADVOCACY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[12px]">
          <span className="font-mono text-[#697078]">Ref: {payment.paymentReference}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Advocacy Explanation */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-3">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#171A1F]">
            <UserCheck size={16} className="text-[#1A7A64]" />
            <span>Consult Your Registered Safety Advocate</span>
          </div>
          <p className="text-[12px] text-[#697078] leading-relaxed">
            When scammers isolate people over the phone, they strictly forbid speaking to family members or friends. Breaking this artificial isolation is the single most effective way to prevent financial harm.
          </p>
          <div className="p-3 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[4px] text-[12px] space-y-1">
            <div className="font-semibold text-[#171A1F]">Privacy & Consent Guarantee:</div>
            <p className="text-[#697078] leading-relaxed">
              Scam Brake will <strong>never</strong> notify your contact without your explicit permission right here. We do not share your full financial history, passwords, or personal account numbers.
            </p>
          </div>
        </div>

        {/* Registered Contact Card */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE2DF]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#697078]">Registered Advocate</span>
              <h2 className="text-[15px] font-semibold text-[#171A1F]">{contact.name}</h2>
            </div>
            <span className="text-[11px] font-mono text-[#171A1F] bg-[#F6F6F3] border border-[#DFE2DF] px-2.5 py-0.5 rounded-[4px]">
              {contact.relationship}
            </span>
          </div>

          <div className="space-y-3 text-[12px]">
            <div className="flex justify-between py-1.5 border-b border-[#DFE2DF]">
              <span className="text-[#697078]">Telephone Number:</span>
              <span className="font-mono text-[#171A1F] font-medium">{contact.phone}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#DFE2DF]">
              <span className="text-[#697078]">Notification Summary:</span>
              <span className="text-[#171A1F]">Safety pause on ${payment.amount.toFixed(2)} PayPal checkout</span>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] cursor-pointer">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
                className="mt-0.5 accent-[#171A1F]"
              />
              <div className="text-[12px] space-y-0.5">
                <span className="font-semibold text-[#171A1F] block">
                  I give permission to send an alert advisory to {contact.name}
                </span>
                <span className="text-[#697078] block text-[11px]">
                  An automated message will explain that your current payment is paused and invite them to review this situation with you.
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={handleSendNotification}
            disabled={!consentGranted || isSending || dispatchStatus !== null}
            className="w-full py-2.5 bg-[#171A1F] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#2B303A] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            {isSending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending SMS notification...</span>
              </>
            ) : dispatchStatus ? (
              <>
                <CheckCircle2 size={14} className="text-[#1A7A64]" />
                <span>SMS Notification Dispatched</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Send Alert to {contact.name}</span>
              </>
            )}
          </button>

          {/* Dispatched Confirmation & Simulated Reply */}
          {dispatchStatus && (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-[#EAF4F1] border border-[#1A7A64]/30 rounded-[4px] text-[12px] text-[#1A7A64] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  <span>SMS delivered to {dispatchStatus.recipient} via {dispatchStatus.channel}</span>
                </div>
                <span className="font-mono text-[11px]">{dispatchStatus.dispatchedAt}</span>
              </div>

              <div className="p-4 bg-[#FFFFFF] border border-[#DFE2DF] rounded-[4px] space-y-2 text-[12px]">
                <div className="flex items-center gap-1.5 font-semibold text-[#171A1F]">
                  <MessageSquare size={13} className="text-[#171A1F]" />
                  <span>Direct Reply from {contact.name}:</span>
                </div>
                <div className="p-3 bg-[#FDE8E8] border-l-2 border-[#C53030] rounded-[4px] text-[#C53030] font-medium leading-relaxed italic">
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
            className="text-[12px] text-[#697078] hover:text-[#171A1F] flex items-center gap-1 font-medium"
          >
            <ArrowLeft size={13} />
            <span>Return to Safety Chat</span>
          </Link>

          <button
            onClick={handleVoidPayment}
            className="w-full sm:w-auto px-4 py-2 bg-[#FFFFFF] border border-[#C53030]/40 text-[#C53030] text-[12px] font-medium rounded-[6px] hover:bg-[#FDE8E8] transition-colors cursor-pointer"
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
        <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center p-6">
          <div className="text-xs font-mono text-[#697078]">Loading trusted contact advocate...</div>
        </div>
      }
    >
      <CustomerTrustedContactContent />
    </React.Suspense>
  );
}
