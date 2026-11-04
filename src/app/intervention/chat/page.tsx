'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  Send,
  ArrowLeft,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import { mockStore } from '@/services';
import { toast } from 'sonner';

function CustomerInterventionChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId') || 'pay_sb_881901';

  const [payment] = useState(() => mockStore.getPaymentById(paymentId) || mockStore.getPaymentById('pay_sb_881901')!);
  const [session, setSession] = useState(() => mockStore.getInterventionById(payment.interventionSessionId || 'int_sess_881901')!);
  const [inputValue, setInputValue] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    setInputValue('');
    const res = mockStore.sendCustomerMessage(session.id, text);
    if (res) {
      setSession({ ...res.session });
    }
  };

  const handleVoidPayment = () => {
    setIsResolving(true);
    setTimeout(() => {
      mockStore.voidPayment(
        payment.id,
        'Customer acknowledged coercion markers during AI conversational check-in and cancelled authorization.'
      );
      router.push(`/intervention/resolved?action=voided&paymentId=${payment.id}`);
    }, 600);
  };

  const handleProceedPayment = () => {
    setIsResolving(true);
    setTimeout(() => {
      mockStore.capturePayment(
        payment.id,
        'Customer reviewed safety check, confirmed independent volition, and authorized capture.'
      );
      router.push(`/intervention/resolved?action=captured&paymentId=${payment.id}`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1E1E2A] flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/intervention" className="text-[#6B7280] hover:text-[#1E1E2A] p-1">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <ScamBrakeMark size={24} />
            <span className="font-semibold text-sm tracking-tight">
              SCAM<span className="text-[#2D5BFF]">BRAKE</span>
            </span>
            <span className="text-xs text-[#6B7280] border-l border-[#E5E7EB] pl-2 font-mono">
              CONFIDENTIAL SAFETY INQUIRY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-[#6B7280]">
            Order Ref: {payment.paymentReference}
          </span>
          <span className="bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30 font-mono px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
            <Clock size={12} />
            Funds Held
          </span>
        </div>
      </header>

      {/* Main Chat Flow */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between space-y-4">
        {/* Reassurance Banner */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-4 text-xs text-[#6B7280] space-y-1">
          <div className="font-semibold text-[#1E1E2A] flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-[#2D5BFF]" />
            Your ${payment.amount.toFixed(2)} payment has not been captured yet.
          </div>
          <p className="leading-relaxed">
            PayPal has temporarily authorized this hold so that you can verify this transaction in complete privacy. No money will leave your account without your explicit confirmation.
          </p>
        </div>

        {/* Message Thread */}
        <div className="flex-1 space-y-4 py-2 overflow-y-auto max-h-[55vh]">
          {session.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'CUSTOMER' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="text-[11px] text-[#6B7280] mb-1 font-mono">
                {msg.sender === 'CUSTOMER' ? 'You' : 'Scam Brake Safety AI'} •{' '}
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div
                className={`max-w-lg p-4 rounded text-xs leading-relaxed ${
                  msg.sender === 'CUSTOMER'
                    ? 'bg-[#2D5BFF] text-white shadow-xs'
                    : 'bg-[#FFFFFF] border border-[#E5E7EB] text-[#1E1E2A]'
                }`}
              >
                {msg.content}
              </div>

              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {msg.quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(reply)}
                      className="text-xs bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#2D5BFF] hover:text-[#2D5BFF] text-[#1E1E2A] px-3 py-1.5 rounded transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chat Input & External Tools */}
        <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
          {/* Quick Verification Actions */}
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href={`/intervention/verify?paymentId=${payment.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#FAFAFC] text-[#1E1E2A] rounded transition-colors"
            >
              <PhoneCall size={13} className="text-[#2D5BFF]" />
              <span>Independent Directory Verification</span>
            </Link>

            <Link
              href={`/intervention/trusted-contact?paymentId=${payment.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#FAFAFC] text-[#1E1E2A] rounded transition-colors"
            >
              <UserCheck size={13} className="text-[#059669]" />
              <span>Consult Registered Trusted Contact</span>
            </Link>
          </div>

          {/* Text Input Field */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message or answer..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 bg-[#FFFFFF] border border-[#E5E7EB] rounded px-3.5 py-2.5 text-xs text-[#1E1E2A] focus:outline-hidden focus:border-[#2D5BFF]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="p-2.5 bg-[#2D5BFF] text-white rounded hover:bg-[#2044C8] transition-colors disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>

          {/* Resolution Decisions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-[#6B7280]">
              Ready to decide? You have total control over this authorization hold.
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleVoidPayment}
                disabled={isResolving}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#FFFFFF] border border-[#DC2626]/40 text-[#DC2626] hover:bg-[#FEF2F2] text-xs font-medium rounded transition-colors"
              >
                Cancel & Void Payment ($0 fee)
              </button>
              <button
                onClick={handleProceedPayment}
                disabled={isResolving}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#2D5BFF] text-white hover:bg-[#2044C8] text-xs font-medium rounded transition-colors"
              >
                Confirm & Capture Payment
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CustomerInterventionChatPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-6">
          <div className="text-xs text-[#6B7280]">Connecting secure safety dialogue...</div>
        </div>
      }
    >
      <CustomerInterventionChatContent />
    </React.Suspense>
  );
}
