'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  PhoneCall,
  UserCheck,
  Send,
  HelpCircle,
  Lock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { mockStore } from '@/services';
import { toast } from 'sonner';

export default function CustomerInterventionPage() {
  const router = useRouter();

  // Retrieve seed payment pay_sb_881901 (Martha Stephenson $1,500 gift card hold)
  const [payment, setPayment] = useState(() => mockStore.getPaymentById('pay_sb_881901')!);
  const [session, setSession] = useState(() => mockStore.getInterventionById('int_sess_881901')!);
  const [inputValue, setInputValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isNotifyingContact, setIsNotifyingContact] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    setInputValue('');
    const res = mockStore.sendCustomerMessage(session.id, text);
    if (res) {
      setSession(res.session);
    }
  };

  const handleKernelVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      mockStore.triggerIndependentVerification(session.id);
      const updated = mockStore.getInterventionById(session.id);
      if (updated) setSession(updated);
      setIsVerifying(false);
      setShowVerifyModal(false);
      toast.info('Kernel verification directory check completed.');
    }, 800);
  };

  const handleTrustedContactNotify = () => {
    setIsNotifyingContact(true);
    setTimeout(() => {
      mockStore.grantTrustedContactConsent(session.id);
      const updated = mockStore.getInterventionById(session.id);
      if (updated) setSession(updated);
      setIsNotifyingContact(false);
      setShowContactModal(false);
      toast.success('Trusted contact David Stephenson has been notified via SMS.');
    }, 700);
  };

  const handleVoidPayment = () => {
    setIsResolving(true);
    setTimeout(() => {
      mockStore.voidPayment(payment.id, 'Customer canceled during intervention.');
      router.push('/intervention/resolved?outcome=void');
    }, 600);
  };

  const handleProceedPayment = () => {
    setIsResolving(true);
    setTimeout(() => {
      mockStore.capturePayment(payment.id, 'Customer confirmed deliberate purchase.');
      router.push('/intervention/resolved?outcome=capture');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1E1E2A] flex flex-col antialiased selection:bg-[#2D5BFF]/10 selection:text-[#2D5BFF]">
      {/* Calm, High-Trust Header */}
      <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScamBrakeMark size={32} />
          <div>
            <div className="font-semibold text-[15px] leading-tight text-[#1E1E2A]">
              Scam Brake Protection Check-in
            </div>
            <div className="text-[11px] text-[#6B7280]">
              Authorized Pre-Capture Safety Protocol
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[12px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-3 py-1 rounded-md">
          <Clock size={13} />
          <span>HOLD WINDOW ACTIVE</span>
        </div>
      </header>

      {/* Main Intervention Layout */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 py-8 space-y-6">
        {/* Calm Hero Reassurance Banner */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#2D5BFF] uppercase tracking-wider">
                SAFETY INTERVENTION IN PROGRESS
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#1E1E2A] mt-1">
                Your payment is temporarily protected.
              </h1>
              <p className="text-[14px] text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
                PayPal has approved the payment authorization, but{' '}
                <strong className="text-[#1E1E2A]">no funds have been transferred</strong> to Apex Digital yet. Your money remains safe in your account while you take a calm moment to verify.
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-[#E5E7EB] sm:pl-6 shrink-0">
              <div className="text-[12px] text-[#6B7280]">Authorized Amount</div>
              <div className="text-[28px] font-mono font-bold text-[#1E1E2A]">
                ${payment.amount.toFixed(2)}
              </div>
              <div className="text-[11px] text-[#6B7280]">Apex Digital & Hardware</div>
            </div>
          </div>

          {/* Authorization Path Motif */}
          <AuthorizationPath
            currentStage="REVIEW"
            variant="app"
            holdSecondsRemaining={payment.authorizationHoldSecondsRemaining}
          />
        </div>

        {/* Two-Column Working Area: Chat on Left, Verification Tools on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Calm Conversational Check-In */}
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] text-[12px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="font-semibold text-[#1E1E2A]">
                  AI Safety Assistant
                </span>
                <span className="text-[11px] text-[#6B7280]">
                  (Calm, non-judgmental guidance)
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#9CA3AF]">
                CONFIDENTIAL
              </span>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
              {session.messages.map((m) => {
                const isAI = m.sender === 'AI_ASSISTANT';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      isAI ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-xl text-[13px] leading-relaxed ${
                        isAI
                          ? 'bg-[#F8F9FB] border border-[#E5E7EB] text-[#1E1E2A]'
                          : 'bg-[#2D5BFF] text-white shadow-xs'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[10px] text-[#9CA3AF] px-1 mt-1 font-mono">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Quick Replies if attached */}
                    {isAI && m.quickReplies && m.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                        {m.quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(reply)}
                            className="px-2.5 py-1 rounded-md bg-white border border-[#D1D5DB] hover:border-[#2D5BFF] hover:text-[#2D5BFF] text-[12px] font-medium text-[#4B5563] transition-colors cursor-pointer shadow-2xs"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="pt-3 border-t border-[#E5E7EB] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer or describe the situation calmly..."
                className="flex-1 h-10 px-3.5 text-[13px] bg-[#FAFAFC] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2D5BFF] focus:bg-white text-[#1E1E2A] placeholder-[#9CA3AF]"
              />
              <Button type="submit" size="md" variant="primary">
                <Send size={14} />
                <span>Send</span>
              </Button>
            </form>
          </div>

          {/* Right Column (5 cols): Verification Actions & Resolution */}
          <div className="lg:col-span-5 space-y-4">
            {/* Independent Directory Verification (Kernel) */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall size={16} className="text-[#2D5BFF]" />
                  <span className="text-[13px] font-semibold text-[#1E1E2A]">
                    Independent Directory Check
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D5BFF]/10 text-[#2D5BFF]">
                  KERNEL VERIFIED
                </span>
              </div>
              <p className="text-[12px] text-[#6B7280] leading-relaxed">
                If the caller claims to represent the IRS or a bank, do not use the number they gave you. Kernel provides verified official agency contacts.
              </p>

              {session.independentVerification.status === 'PASSED' ? (
                <div className="p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[12px] text-[#059669] space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Official Directory Checked ({session.independentVerification.verificationRef})</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#047857]">
                    {session.independentVerification.notes}
                  </p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowVerifyModal(true)}
                  className="w-full text-[13px]"
                >
                  <PhoneCall size={14} className="text-[#2D5BFF]" />
                  <span>Check Official Directory</span>
                </Button>
              )}
            </div>

            {/* Trusted Contact Notification */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className="text-[#059669]" />
                  <span className="text-[13px] font-semibold text-[#1E1E2A]">
                    Trusted Contact Advocate
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/10 text-[#059669]">
                  EXPLICIT CONSENT
                </span>
              </div>
              <p className="text-[12px] text-[#6B7280] leading-relaxed">
                You have designated <strong className="text-[#1E1E2A]">David Stephenson</strong> as your trusted contact. We can send a private SMS alert so they can review this purchase with you.
              </p>

              {session.trustedContact.notificationSent ? (
                <div className="p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[12px] text-[#059669] space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>SMS Dispatched to David Stephenson</span>
                  </div>
                  <p className="text-[11px] text-[#047857]">
                    Alert sent to {session.trustedContact.maskedPhone}. Awaiting check-in.
                  </p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowContactModal(true)}
                  className="w-full text-[13px]"
                >
                  <UserCheck size={14} className="text-[#059669]" />
                  <span>Notify David Stephenson</span>
                </Button>
              )}
            </div>

            {/* Final Decision Action Controls */}
            <div className="p-5 rounded-2xl bg-[#F8F9FB] border border-[#E5E7EB] shadow-xs space-y-3">
              <div className="text-[13px] font-semibold text-[#1E1E2A]">
                Your Decision
              </div>
              <p className="text-[12px] text-[#6B7280] leading-relaxed">
                You are completely in control. You may cancel this hold right now with zero dispute wait time, or confirm that you are uncoerced.
              </p>

              <div className="space-y-2 pt-1">
                <Button
                  variant="danger"
                  size="lg"
                  isLoading={isResolving}
                  onClick={handleVoidPayment}
                  className="w-full text-[14px]"
                >
                  <XCircle size={16} />
                  <span>Void Authorization (Cancel Payment)</span>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  isLoading={isResolving}
                  onClick={handleProceedPayment}
                  className="w-full text-[13px] text-[#6B7280] hover:text-[#1E1E2A]"
                >
                  <CheckCircle2 size={15} className="text-[#10B981]" />
                  <span>I Am Safe — Capture Payment</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Independent Verification Check */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Official Agency Directory Verification"
        subtitle="Powered by Kernel out-of-band verification"
      >
        <div className="space-y-4 text-[13px] text-[#4B5563]">
          <p>
            Scam callers frequently give victims spoofed telephone numbers or warn them that calling local offices will &quot;violate federal gag orders&quot;. This is always a lie.
          </p>

          <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E5E7EB] space-y-2 text-[12px]">
            <div className="font-semibold text-[#1E1E2A]">
              Internal Revenue Service (IRS) Official Contact:
            </div>
            <div className="text-[16px] font-mono font-bold text-[#2D5BFF]">
              1-800-829-1040
            </div>
            <div className="text-[#6B7280]">
              Official public line. Operating hours: Monday – Friday 7:00 a.m. to 7:00 p.m. local time.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
            <Button variant="outline" size="sm" onClick={() => setShowVerifyModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isVerifying}
              onClick={handleKernelVerify}
            >
              Verify Agency Records
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Trusted Contact Consent */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Consent to Alert Trusted Contact"
        subtitle="Emergency intervention support"
      >
        <div className="space-y-4 text-[13px] text-[#4B5563]">
          <p>
            By confirming below, Scam Brake will dispatch an SMS notification to your registered advocate, <strong className="text-[#1E1E2A]">David Stephenson (Son)</strong>:
          </p>

          <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E5E7EB] text-[12px] font-mono text-[#1E1E2A] space-y-1">
            <div className="text-[11px] text-[#6B7280]">SMS PREVIEW:</div>
            <p className="font-sans leading-relaxed">
              &quot;Alert from Scam Brake: A $1,500.00 gift card payment for Martha Stephenson has been paused under safety review. Please connect with Martha to ensure she is uncoerced.&quot;
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
            <Button variant="outline" size="sm" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isNotifyingContact}
              onClick={handleTrustedContactNotify}
            >
              Grant Consent & Send SMS
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
