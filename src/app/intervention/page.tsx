'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  PhoneCall,
  UserCheck,
  Send,
  CheckCircle2,
  XCircle,
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
  const [payment] = useState(() => mockStore.getPaymentById('pay_sb_881901')!);
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
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased selection:bg-[#1A7A64]/15">
      {/* Calm, High-Trust Header */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#DFE2DF] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScamBrakeMark size={28} />
          <div>
            <div className="font-semibold text-[14px] leading-tight text-[#171A1F]">
              Scam Brake Protection Check-in
            </div>
            <div className="text-[12px] text-[#525860]">
              Pre-Capture Safety Protocol
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#784D00] bg-[#FAF2E4] border border-[#784D00]/25 px-2.5 py-1 rounded-[4px]">
          <Clock size={13} />
          <span>Hold Active</span>
        </div>
      </header>

      {/* Main Intervention Layout */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 py-8 space-y-6">
        {/* Calm Hero Reassurance Banner */}
        <div className="p-6 rounded-[6px] bg-[#FFFFFF] border border-[#DFE2DF] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
            <div>
              <div className="text-[13px] font-medium text-[#525860]">
                Safety Check-in in Progress
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#171A1F] mt-1 tracking-tight">
                Your payment is temporarily protected.
              </h1>
              <p className="text-[14px] text-[#525860] mt-1.5 max-w-2xl leading-relaxed">
                PayPal has approved the payment authorization, but{' '}
                <strong className="text-[#171A1F] font-semibold">no funds have been transferred</strong> to Apex Digital yet. Your money remains safe in your account while you take a calm moment to verify.
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-[#DFE2DF] sm:pl-6 shrink-0">
              <div className="text-[12px] text-[#525860]">Authorized Amount</div>
              <div className="text-[26px] font-semibold text-[#171A1F] tabular-nums">
                <code>${payment.amount.toFixed(2)}</code>
              </div>
              <div className="text-[12px] text-[#525860]">Apex Digital &amp; Hardware</div>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column (7 cols): Calm Conversational Check-In */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE2DF] text-[13px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1A7A64]" />
                <span className="font-semibold text-[#171A1F]">
                  Safety Assistant
                </span>
                <span className="text-[12px] text-[#525860]">
                  (Calm, non-judgmental guidance)
                </span>
              </div>
              <span className="text-[12px] text-[#525860] font-medium">
                Confidential
              </span>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
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
                      className={`max-w-[85%] p-3.5 rounded-[6px] text-[14px] leading-relaxed ${
                        isAI
                          ? 'bg-[#F6F6F3] border border-[#DFE2DF] text-[#171A1F]'
                          : 'bg-[#171A1F] text-white'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[11px] text-[#525860] px-1 mt-1">
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
                            className="px-2.5 py-1 rounded-[4px] bg-[#FFFFFF] border border-[#DFE2DF] hover:border-[#171A1F] text-[13px] font-medium text-[#171A1F] transition-colors cursor-pointer"
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
              className="pt-3 border-t border-[#DFE2DF] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer or describe the situation calmly..."
                className="flex-1 h-10 px-3.5 text-[14px] bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] focus:outline-none focus:border-[#171A1F] focus:bg-[#FFFFFF] text-[#171A1F] placeholder-[#525860]"
              />
              <Button type="submit" size="md" variant="primary">
                <Send size={13} />
                <span>Send</span>
              </Button>
            </form>
          </div>

          {/* Right Column (5 cols): Verification Actions & Resolution */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Independent Directory Verification */}
            <div className="p-5 rounded-[6px] bg-[#FFFFFF] border border-[#DFE2DF] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall size={15} className="text-[#171A1F]" />
                  <span className="text-[14px] font-semibold text-[#171A1F]">
                    Independent Directory Check
                  </span>
                </div>
                <span className="text-[12px] font-medium px-2 py-0.5 rounded-[4px] bg-[#EAF4F1] text-[#1A7A64] border border-[#1A7A64]/25">
                  Verified
                </span>
              </div>
              <p className="text-[13px] text-[#525860] leading-relaxed">
                If the caller claims to represent the IRS or a bank, do not use the number they gave you. Kernel provides verified official agency contacts.
              </p>

              {session.independentVerification.status === 'PASSED' ? (
                <div className="p-3 rounded-[4px] bg-[#EAF4F1] border border-[#1A7A64]/20 text-[13px] text-[#1A7A64] space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Official Directory Checked ({session.independentVerification.verificationRef})</span>
                  </div>
                  <p className="text-[12px] leading-relaxed">
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
                  <PhoneCall size={13} />
                  <span>Check Official Directory</span>
                </Button>
              )}
            </div>

            {/* Trusted Contact Notification */}
            <div className="p-5 rounded-[6px] bg-[#FFFFFF] border border-[#DFE2DF] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck size={15} className="text-[#1A7A64]" />
                  <span className="text-[14px] font-semibold text-[#171A1F]">
                    Trusted Contact Advocate
                  </span>
                </div>
                <span className="text-[12px] font-medium px-2 py-0.5 rounded-[4px] bg-[#EAF4F1] text-[#1A7A64] border border-[#1A7A64]/25">
                  Explicit Consent
                </span>
              </div>
              <p className="text-[13px] text-[#525860] leading-relaxed">
                You have designated <strong className="text-[#171A1F]">David Stephenson</strong> as your trusted contact. We can send a private alert so they can review this purchase with you.
              </p>

              {session.trustedContact.notificationSent ? (
                <div className="p-3 rounded-[4px] bg-[#EAF4F1] border border-[#1A7A64]/20 text-[13px] text-[#1A7A64] space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Alert Dispatched to David Stephenson</span>
                  </div>
                  <p className="text-[12px]">
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
                  <UserCheck size={13} />
                  <span>Notify David Stephenson</span>
                </Button>
              )}
            </div>

            {/* Final Decision Action Controls */}
            <div className="p-5 rounded-[6px] bg-[#FFFFFF] border border-[#DFE2DF] space-y-3">
              <div className="text-[14px] font-semibold text-[#171A1F]">
                Your Decision
              </div>
              <p className="text-[13px] text-[#525860] leading-relaxed">
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
                  <XCircle size={15} />
                  <span>Void Authorization (Cancel Payment)</span>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  isLoading={isResolving}
                  onClick={handleProceedPayment}
                  className="w-full text-[13px] text-[#525860] hover:text-[#171A1F]"
                >
                  <CheckCircle2 size={14} className="text-[#1A7A64]" />
                  <span>Confirm and Capture Payment</span>
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
        subtitle="Independent out-of-band verification"
      >
        <div className="space-y-4 text-[14px] text-[#525860]">
          <p>
            Scam callers frequently give victims spoofed telephone numbers or warn them that calling local offices will &quot;violate federal gag orders&quot;. This is always a lie.
          </p>

          <div className="p-4 rounded-[6px] bg-[#F6F6F3] border border-[#DFE2DF] space-y-2 text-[13px]">
            <div className="font-semibold text-[#171A1F]">
              Internal Revenue Service (IRS) Official Switchboard:
            </div>
            <div className="text-[18px] font-bold text-[#171A1F]">
              <code>1-800-829-1040</code>
            </div>
            <div className="text-[#525860]">
              Official public line. Operating hours: Monday through Friday, 7:00 a.m. to 7:00 p.m. local time.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DFE2DF]">
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
        <div className="space-y-4 text-[14px] text-[#525860]">
          <p>
            By confirming below, Scam Brake will dispatch an alert notification to your registered advocate, <strong className="text-[#171A1F]">David Stephenson (Son)</strong>:
          </p>

          <div className="p-4 rounded-[6px] bg-[#F6F6F3] border border-[#DFE2DF] text-[13px] text-[#171A1F] space-y-1">
            <div className="text-[12px] text-[#525860] font-medium">SMS Preview:</div>
            <p className="font-sans leading-relaxed text-[#171A1F]">
              &quot;Alert from Scam Brake: A $1,500.00 gift card payment for Martha Stephenson has been paused under safety review. Please connect with Martha to ensure she is uncoerced.&quot;
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#DFE2DF]">
            <Button variant="outline" size="sm" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isNotifyingContact}
              onClick={handleTrustedContactNotify}
            >
              Grant Consent &amp; Dispatch
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
