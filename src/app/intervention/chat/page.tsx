'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId') || 'pay_sb_881901';

  const [payment] = useState(() => mockStore.getPaymentById(paymentId) || mockStore.getPaymentById('pay_sb_881901')!);
  const [session, setSession] = useState(() => mockStore.getInterventionById(payment.interventionSessionId || 'int_sess_881901')!);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    setInputValue('');
    const res = mockStore.sendCustomerMessage(session.id, text);
    if (res) {
      setSession({ ...res.session });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#DFE2DF] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/intervention" className="text-[#525860] hover:text-[#171A1F] p-1">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <ScamBrakeMark size={24} />
            <span className="font-semibold text-[14px] tracking-tight text-[#171A1F]">
              SCAM BRAKE
            </span>
            <span className="text-[12px] text-[#525860] border-l border-[#DFE2DF] pl-2 font-medium">
              Safety inquiry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-[12px] text-[#525860]">
            Ref: <code className="font-mono text-[#171A1F]">{payment.paymentReference}</code>
          </span>
          <span className="bg-[#FAF2E4] text-[#784D00] border border-[#784D00]/20 px-2 py-0.5 rounded-[4px] text-[12px] font-medium flex items-center gap-1">
            <Clock size={12} />
            Funds Held
          </span>
        </div>
      </header>
      <div role="status" className="bg-[#FAF2E4] text-[#5C3B00] border-b border-[#784D00]/20 px-4 py-2 text-xs text-center">
        Local conversation preview only. No PayPal transaction exists; do not enter personal information.
      </div>

      {/* Main Chat Flow */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between space-y-4">
        {/* Reassurance Banner */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-4 text-[13px] text-[#525860] space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-[#171A1F] flex items-center gap-1.5 text-[15px]">
              <ShieldAlert size={16} className="text-[#784D00]" />
              <span>Your <code className="font-mono">${payment.amount.toFixed(2)}</code> payment has not been transferred.</span>
            </h1>
          </div>
          <p className="leading-relaxed">
            This preview does not create a PayPal authorization or move money.
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
              <div className="text-[11px] text-[#525860] mb-1">
                {msg.sender === 'CUSTOMER' ? 'You' : 'Scam Brake Assistant'} •{' '}
                <code className="font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</code>
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
                      className="text-[13px] bg-[#FFFFFF] border border-[#DFE2DF] hover:border-[#171A1F] text-[#171A1F] px-3 py-1.5 rounded-[4px] transition-colors cursor-pointer"
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
            <span className="text-[12px] text-[#525860]">
              Ready to decide? You have total control over this authorization hold.
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                disabled
                className="flex-1 sm:flex-none px-4 py-2 bg-[#FFFFFF] border border-[#C53030]/40 text-[#C53030] hover:bg-[#FDE8E8] text-[13px] font-medium rounded-[6px] transition-colors cursor-pointer"
              >
                Payment decision unavailable in this preview
              </button>
              <button
                disabled
                className="flex-1 sm:flex-none px-4 py-2 bg-[#171A1F] text-white hover:bg-[#2B303A] text-[13px] font-medium rounded-[6px] transition-colors cursor-pointer"
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
          <div className="text-xs text-[#525860]"><code>Connecting safety check-in...</code></div>
        </div>
      }
    >
      <CustomerInterventionChatContent />
    </React.Suspense>
  );
}
