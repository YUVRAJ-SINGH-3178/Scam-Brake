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
  Clock,
} from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { mockStore } from '@/services';

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
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#DFE2DF] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/intervention" className="text-[#697078] hover:text-[#171A1F] p-1">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <ScamBrakeMark size={24} />
            <span className="font-semibold text-[14px] tracking-tight text-[#171A1F]">
              SCAM BRAKE
            </span>
            <span className="text-[11px] text-[#697078] border-l border-[#DFE2DF] pl-2 font-mono">
              SAFETY INQUIRY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[12px]">
          <span className="font-mono text-[11px] text-[#697078]">
            Ref: {payment.paymentReference}
          </span>
          <span className="bg-[#FAF2E4] text-[#9A6700] border border-[#9A6700]/20 font-mono px-2 py-0.5 rounded-[4px] text-[11px] font-semibold flex items-center gap-1">
            <Clock size={11} />
            Funds Held
          </span>
        </div>
      </header>

      {/* Main Chat Flow */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between space-y-4">
        {/* Reassurance Banner */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-4 text-[12px] text-[#697078] space-y-1">
          <div className="font-semibold text-[#171A1F] flex items-center gap-1.5 text-[13px]">
            <ShieldAlert size={14} className="text-[#9A6700]" />
            <span>Your ${payment.amount.toFixed(2)} payment has not been transferred.</span>
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
              <div className="text-[10px] text-[#697078] mb-1 font-mono">
                {msg.sender === 'CUSTOMER' ? 'You' : 'Scam Brake Assistant'} •{' '}
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div
                className={`max-w-lg p-3.5 rounded-[6px] text-[13px] leading-relaxed ${
                  msg.sender === 'CUSTOMER'
                    ? 'bg-[#171A1F] text-white'
                    : 'bg-[#FFFFFF] border border-[#DFE2DF] text-[#171A1F]'
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
                      className="text-[12px] bg-[#FFFFFF] border border-[#DFE2DF] hover:border-[#171A1F] text-[#171A1F] px-3 py-1.5 rounded-[4px] transition-colors cursor-pointer"
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
        <div className="space-y-3 pt-2 border-t border-[#DFE2DF]">
          {/* Quick Verification Actions */}
          <div className="flex flex-wrap gap-2 text-[12px]">
            <Link
              href={`/intervention/verify?paymentId=${payment.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[#171A1F] rounded-[4px] transition-colors"
            >
              <PhoneCall size={13} className="text-[#171A1F]" />
              <span>Independent Directory Check</span>
            </Link>

            <Link
              href={`/intervention/trusted-contact?paymentId=${payment.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[#171A1F] rounded-[4px] transition-colors"
            >
              <UserCheck size={13} className="text-[#1A7A64]" />
              <span>Consult Registered Contact</span>
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
              className="flex-1 bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] px-3.5 py-2.5 text-[13px] text-[#171A1F] focus:outline-none focus:border-[#171A1F]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="p-2.5 bg-[#171A1F] text-white rounded-[6px] hover:bg-[#2B303A] transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Send size={14} />
            </button>
          </div>

          {/* Resolution Decisions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-[#697078]">
              Ready to decide? You have total control over this authorization hold.
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleVoidPayment}
                disabled={isResolving}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#FFFFFF] border border-[#C53030]/40 text-[#C53030] hover:bg-[#FDE8E8] text-[12px] font-medium rounded-[6px] transition-colors cursor-pointer"
              >
                Cancel & Void Payment ($0 fee)
              </button>
              <button
                onClick={handleProceedPayment}
                disabled={isResolving}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#171A1F] text-white hover:bg-[#2B303A] text-[12px] font-medium rounded-[6px] transition-colors cursor-pointer"
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
        <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center p-6">
          <div className="text-xs font-mono text-[#697078]">Connecting safety check-in...</div>
        </div>
      }
    >
      <CustomerInterventionChatContent />
    </React.Suspense>
  );
}
