'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Clock, Send, CheckCircle2, XCircle } from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import { Button } from '@/components/ui/Button';

type CustomerPayment = {
  id: string;
  paymentReference: string;
  merchantName: string;
  productName: string;
  amount: number;
  currency: string;
  riskScore: number;
  riskLevel: string;
  authorizationStatus: string;
  interventionStatus: string;
  holdExpiresAt: string | null;
};

type CustomerIntervention = {
  id: string;
  status: string;
  scamHypothesis: string | null;
  customerDecision: string | null;
  messages: Array<{
    id: string;
    sender: 'AI_ASSISTANT' | 'CUSTOMER' | 'SYSTEM';
    content: string;
    quickReplies: string[];
    timestamp: string;
  }>;
};

export default function CustomerInterventionPage() {
  const [payment, setPayment] = useState<CustomerPayment | null>(null);
  const [session, setSession] = useState<CustomerIntervention | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [now, setNow] = useState<number | null>(null);

  const refresh = useCallback(async (paymentId: string) => {
    const res = await fetch(`/api/intervention/${encodeURIComponent(paymentId)}`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unable to load the protected payment.');
    setPayment(data.payment);
    setSession(data.intervention);
  }, []);

  useEffect(() => {
    const initial = setTimeout(() => {
      setNow(Date.now());
    }, 0);
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const paymentId = new URLSearchParams(window.location.search).get('paymentId');
    if (!paymentId) {
      queueMicrotask(() => {
        if (!ignore) {
          setStatusMessage('Payment reference is missing. Return to checkout and start again.');
        }
      });
      return;
    }

    void fetch(`/api/intervention/${encodeURIComponent(paymentId)}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load the protected payment.');
        if (!ignore) {
          setPayment(data.payment);
          setSession(data.intervention);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setStatusMessage(error instanceof Error ? error.message : 'Unable to load this customer session.');
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text || !payment || busy) return;
    setBusy(true);
    setInputValue('');
    try {
      const res = await fetch(`/api/intervention/${encodeURIComponent(payment.id)}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save your response.');
      await refresh(payment.id);
      setStatusMessage('Your response was saved securely.');
    } catch (error: unknown) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to save your response.');
      setInputValue(text);
    } finally {
      setBusy(false);
    }
  };

  const handleDecision = async (decision: 'CANCEL_PAYMENT' | 'PROCEED_PAYMENT') => {
    if (!payment || busy) return;
    setBusy(true);
    setStatusMessage('Saving your decision…');
    try {
      const res = await fetch(`/api/intervention/${encodeURIComponent(payment.id)}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Your decision could not be confirmed.');
      await refresh(payment.id);
      setStatusMessage(decision === 'CANCEL_PAYMENT'
        ? 'The cancellation decision was recorded. Check the authorization status below.'
        : 'Your choice to proceed was recorded. The merchant must still capture the authorization.');
    } catch (error: unknown) {
      setStatusMessage(error instanceof Error ? error.message : 'Your decision could not be confirmed.');
    } finally {
      setBusy(false);
    }
  };

  if (!payment || !session) {
    return (
      <main className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col items-center justify-center p-6">
        <ScamBrakeMark size={32} />
        <p role="status" className="mt-4 max-w-md text-center text-sm text-[#525860]">
          {statusMessage || 'Loading your protected payment…'}
        </p>
      </main>
    );
  }

  const holdSecondsRemaining = payment.holdExpiresAt && now !== null
    ? Math.max(0, Math.floor((new Date(payment.holdExpiresAt).getTime() - now) / 1000))
    : 0;
  const decisionResolved = Boolean(session.customerDecision);

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased selection:bg-[#1A7A64]/15">
      <header className="h-14 bg-white border-b border-[#DFE2DF] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScamBrakeMark size={28} />
          <div>
            <div className="font-semibold text-sm leading-tight">Scam Brake Protection Check-in</div>
            <div className="text-xs text-[#525860]">Pre-Capture Safety Protocol</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#784D00] bg-[#FAF2E4] border border-[#784D00]/25 px-2.5 py-1 rounded">
          <Clock size={13} />
          <span>{payment.authorizationStatus === 'HOLD_ACTIVE' ? 'Authorization hold active' : payment.authorizationStatus}</span>
        </div>
      </header>
      <div role="status" className="bg-[#FAF2E4] text-[#5C3B00] border-b border-[#784D00]/20 px-4 py-2 text-xs text-center">
        This payment and your responses are linked to your expiring customer session. No funds are captured by this check-in.
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 py-8 space-y-6">
        <div className="p-6 rounded bg-white border border-[#DFE2DF] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
            <div>
              <div className="text-[13px] font-medium text-[#525860]">Safety Check-in in Progress</div>
              <h1 className="text-2xl sm:text-3xl font-semibold mt-1 tracking-tight">Take a calm moment to review this payment.</h1>
              <p className="text-sm text-[#525860] mt-1.5 max-w-2xl leading-relaxed">
                Your PayPal authorization is on hold. Scam Brake has not captured the payment.
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-[#DFE2DF] sm:pl-6 shrink-0">
              <div className="text-xs text-[#525860]">Authorized Amount</div>
              <div className="text-[26px] font-semibold tabular-nums"><code>${payment.amount.toFixed(2)}</code></div>
              <div className="text-xs text-[#525860]">{payment.merchantName}</div>
              <div className="text-xs text-[#525860]">{payment.productName}</div>
            </div>
          </div>
          <AuthorizationPath currentStage="REVIEW" variant="app" holdSecondsRemaining={holdSecondsRemaining} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <section className="lg:col-span-7 bg-white border border-[#DFE2DF] rounded p-5 space-y-4 flex flex-col min-h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE2DF] text-[13px]">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#1A7A64]" /><span className="font-semibold">Safety Assistant</span></div>
              <span className="text-[#525860]">Risk score {payment.riskScore}/100</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {session.messages.map((message) => {
                const isAssistant = message.sender !== 'CUSTOMER';
                return (
                  <div key={message.id} className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[85%] p-3.5 rounded text-sm leading-relaxed ${isAssistant ? 'bg-[#F6F6F3] border border-[#DFE2DF]' : 'bg-[#171A1F] text-white'}`}>
                      {message.content}
                    </div>
                    <span className="text-[11px] text-[#525860] px-1 mt-1">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isAssistant && message.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                        {message.quickReplies.map((reply) => (
                          <button key={reply} disabled={busy || decisionResolved} onClick={() => void handleSendMessage(reply)} className="px-2.5 py-1 rounded bg-white border border-[#DFE2DF] hover:border-[#171A1F] text-[13px] font-medium disabled:opacity-50">
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); void handleSendMessage(); }} className="pt-3 border-t border-[#DFE2DF] flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                disabled={busy || decisionResolved}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Describe what happened in your own words…"
                className="flex-1 h-10 px-3.5 text-sm bg-[#F6F6F3] border border-[#DFE2DF] rounded focus:outline-none focus:border-[#171A1F] disabled:opacity-50"
              />
              <Button type="submit" size="md" variant="primary" disabled={busy || decisionResolved || !inputValue.trim()}>
                <Send size={13} /><span>Send</span>
              </Button>
            </form>
          </section>

          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="p-5 rounded bg-white border border-[#DFE2DF] space-y-3">
              <div className="text-sm font-semibold">Your Decision</div>
              <p className="text-[13px] text-[#525860] leading-relaxed">
                You can cancel the authorization or choose to proceed. Proceeding records your choice; the merchant must still capture the payment separately.
              </p>
              <div className="space-y-2 pt-1">
                <Button variant="danger" size="lg" disabled={busy || decisionResolved || payment.authorizationStatus !== 'HOLD_ACTIVE'} onClick={() => void handleDecision('CANCEL_PAYMENT')} className="w-full text-sm">
                  <XCircle size={15} /><span>Cancel and void authorization</span>
                </Button>
                <Button variant="outline" size="md" disabled={busy || decisionResolved || payment.authorizationStatus !== 'HOLD_ACTIVE'} onClick={() => void handleDecision('PROCEED_PAYMENT')} className="w-full text-[13px]">
                  <CheckCircle2 size={14} className="text-[#1A7A64]" /><span>Proceed after this check-in</span>
                </Button>
              </div>
              {session.customerDecision && <p className="text-sm font-medium text-[#1A7A64]">Recorded decision: {session.customerDecision}</p>}
              {statusMessage && <p role="status" className="text-xs text-[#525860]">{statusMessage}</p>}
            </div>
            <p className="text-xs text-[#525860] leading-relaxed px-1">
              Independent directory checks and trusted-contact notifications are not enabled in this release. They are not represented as completed here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
