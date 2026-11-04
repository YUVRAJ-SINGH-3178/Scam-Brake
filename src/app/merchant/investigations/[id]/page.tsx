'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { Payment, InterventionSession } from '@/types';
import { RiskBadge, AuthStatusBadge } from '@/components/ui/Badge';
import { AuthorizationPath } from '@/components/brand/AuthorizationPath';
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  User,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  MessageSquare,
  Lock,
  PhoneCall,
  UserCheck,
  ChevronRight,
  Database,
  Share2,
} from 'lucide-react';

function MerchantInvestigationCaseContent() {
  const params = useParams();
  const router = useRouter();
  const paymentId = (params?.id as string) || '';

  const [payment, setPayment] = useState<Payment | null>(null);
  const [session, setSession] = useState<InterventionSession | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'threat-intel' | 'kernel-audit'>('overview');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (paymentId) {
      const p = mockStore.getPaymentById(paymentId);
      if (p) {
        setPayment(p);
        const s = mockStore.getInterventionSession(p.interventionSessionId || `session_${p.id}`);
        setSession(s || null);
      }
    }
  }, [paymentId]);

  const handleCapture = () => {
    if (!payment) return;
    const res = mockStore.capturePayment(payment.id, 'Investigator cleared payment after thorough review.');
    if (res) {
      setPayment(res);
      setActionNotice('Authorization successfully captured. Funds released to merchant settlement.');
    }
  };

  const handleVoid = () => {
    if (!payment) return;
    const res = mockStore.voidPayment(payment.id, 'Investigator confirmed social engineering indicators. Pre-capture void executed.');
    if (res) {
      setPayment(res);
      setActionNotice('Authorization voided. Full payment hold terminated without chargeback.');
    }
  };

  if (!payment) {
    return (
      <AppShell activeItem="/merchant/investigations/pay_sb_881901">
        <div className="py-24 text-center max-w-md mx-auto space-y-4">
          <FileText size={32} className="mx-auto text-[#697078]" />
          <h2 className="text-lg font-semibold text-[#171A1F]">Investigation Not Found</h2>
          <p className="text-[13px] text-[#697078]">
            No payment record found matching ID `{paymentId}`.
          </p>
          <Link
            href="/merchant/interventions"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] text-[12px] font-medium text-[#171A1F] rounded-[6px] hover:bg-[#F6F6F3]"
          >
            <ArrowLeft size={14} />
            <span>Return to Active Interventions</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeItem="/merchant/investigations/pay_sb_881901">
      <div className="space-y-6 max-w-6xl">
        {/* Top Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/merchant/interventions"
            className="inline-flex items-center gap-1.5 text-[12px] text-[#697078] hover:text-[#171A1F] font-medium"
          >
            <ArrowLeft size={14} />
            <span>Back to Active Interventions</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#697078]">Case Ref: {payment.paymentReference}</span>
            <AuthStatusBadge status={payment.authorizationStatus} />
            <RiskBadge level={payment.riskLevel} score={payment.riskScore} />
          </div>
        </div>

        {actionNotice && (
          <div className="bg-[#EAF4F1] border border-[#1A7A64]/30 text-[#1A7A64] px-4 py-2.5 rounded-[6px] text-[13px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-[12px] hover:underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Case Banner */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-[#DFE2DF]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-[#697078] bg-[#F6F6F3] border border-[#DFE2DF] px-2 py-0.5 rounded-[4px] font-semibold uppercase">
                  INVESTIGATION CASE FILE
                </span>
                <span className="text-[11px] text-[#697078]">Created {new Date(payment.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F]">
                {payment.customer.name} — Coercion Risk Assessment
              </h1>
              <p className="text-[13px] text-[#697078] mt-1">
                Purchasing <span className="text-[#171A1F] font-medium">{payment.productName}</span> for ${payment.amount.toFixed(2)} USD via {payment.merchantName}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <button
                onClick={handleVoid}
                disabled={payment.authorizationStatus === 'VOIDED'}
                className="px-3.5 py-1.5 bg-[#FFFFFF] border border-[#C53030]/40 text-[#C53030] text-[12px] font-medium rounded-[6px] hover:bg-[#FDE8E8] disabled:opacity-50 cursor-pointer"
              >
                Confirm Scam & Void Auth
              </button>
              <button
                onClick={handleCapture}
                disabled={payment.authorizationStatus === 'CAPTURED'}
                className="px-3.5 py-1.5 bg-[#171A1F] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#2B303A] disabled:opacity-50 cursor-pointer"
              >
                Clear Hold & Capture
              </button>
            </div>
          </div>

          {/* Authorization Path Visualizer */}
          <AuthorizationPath
            currentStage={
              payment.authorizationStatus === 'VOIDED'
                ? 'VOID'
                : payment.authorizationStatus === 'CAPTURED'
                ? 'CAPTURE'
                : 'REVIEW'
            }
            variant="app"
            holdSecondsRemaining={payment.authorizationHoldSecondsRemaining}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-[#DFE2DF] flex items-center gap-6 text-[12px]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#171A1F] text-[#171A1F]'
                : 'border-transparent text-[#697078] hover:text-[#171A1F]'
            }`}
          >
            Case Overview & Hypothesis
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'transcript'
                ? 'border-[#171A1F] text-[#171A1F]'
                : 'border-transparent text-[#697078] hover:text-[#171A1F]'
            }`}
          >
            Customer Dialogue Transcript ({session?.messages.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('threat-intel')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'threat-intel'
                ? 'border-[#171A1F] text-[#171A1F]'
                : 'border-transparent text-[#697078] hover:text-[#171A1F]'
            }`}
          >
            Signal Telemetry
          </button>
          <button
            onClick={() => setActiveTab('kernel-audit')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'kernel-audit'
                ? 'border-[#171A1F] text-[#171A1F]'
                : 'border-transparent text-[#697078] hover:text-[#171A1F]'
            }`}
          >
            Kernel Verification & Trusted Contact
          </button>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* AI Coercion Hypothesis Box */}
              <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-[#171A1F] flex items-center gap-2">
                    <ShieldAlert size={15} className="text-[#C53030]" />
                    <span>Behavioral & Coercion Hypothesis</span>
                  </h3>
                  <span className="font-mono text-[11px] bg-[#FDE8E8] text-[#C53030] px-2 py-0.5 rounded-[4px] font-semibold border border-[#C53030]/20">
                    Risk Score: {payment.riskScore} / 100
                  </span>
                </div>

                <div className="text-[12px] text-[#171A1F] bg-[#F6F6F3] border border-[#DFE2DF] p-4 rounded-[6px] leading-relaxed space-y-2">
                  <p>
                    <strong>Hypothesis:</strong> The customer is undergoing an active social-engineering coercion event consistent with an impersonation extortion scheme (IRS or Federal Agency spoof).
                  </p>
                  <p className="text-[#697078]">
                    <strong>Corroborating Evidence:</strong> The customer was instructed to remain on an active mobile call, buy prepaid store cards to &quot;settle an immediate federal lien,&quot; and keep transaction details secret from cashier staff.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[12px]">
                  <div className="p-2.5 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px]">
                    <div className="text-[#697078]">Urgency Index</div>
                    <div className="font-semibold text-[#C53030] text-[13px] mt-0.5">High (92%)</div>
                  </div>
                  <div className="p-2.5 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px]">
                    <div className="text-[#697078]">Impersonation Match</div>
                    <div className="font-semibold text-[#C53030] text-[13px] mt-0.5">IRS Criminal Dept</div>
                  </div>
                  <div className="p-2.5 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px]">
                    <div className="text-[#697078]">Secrecy Demanded</div>
                    <div className="font-semibold text-[#9A6700] text-[13px] mt-0.5">Confirmed</div>
                  </div>
                </div>
              </div>

              {/* Event Timeline */}
              <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-4">
                <h3 className="text-[13px] font-semibold text-[#171A1F]">Intervention Timeline</h3>
                <div className="border-l-2 border-[#DFE2DF] pl-4 space-y-4 text-[12px]">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#171A1F]" />
                    <span className="text-[#697078] font-mono text-[11px]">10:32:00 AM</span>
                    <div className="font-medium text-[#171A1F]">PayPal Order Initiated</div>
                    <p className="text-[#697078]">Checkout with PayPal button clicked on merchant site for $1,200.00.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#9A6700]" />
                    <span className="text-[#697078] font-mono text-[11px]">10:32:04 AM</span>
                    <div className="font-medium text-[#171A1F]">Authorization Created — Hold Placed</div>
                    <p className="text-[#697078]">PayPal authorized payment; Scam Brake intercepted capture trigger due to high risk score (88/100).</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#171A1F]" />
                    <span className="text-[#697078] font-mono text-[11px]">10:32:15 AM</span>
                    <div className="font-medium text-[#171A1F]">Conversational Check-In Launched</div>
                    <p className="text-[#697078]">Scam Brake opened calm safety dialogue with customer {payment.customer.name}.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#1A7A64]" />
                    <span className="text-[#697078] font-mono text-[11px]">10:33:45 AM</span>
                    <div className="font-medium text-[#171A1F]">Kernel Independent Directory Check Displayed</div>
                    <p className="text-[#697078]">Customer shown official public switchboard for IRS Criminal Investigation.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column: Customer profile & Sponsor diagnostics */}
            <div className="space-y-6">
              <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-3 text-[12px]">
                <h3 className="font-semibold text-[#171A1F] flex items-center gap-1.5">
                  <User size={14} className="text-[#697078]" />
                  <span>Protected Customer</span>
                </h3>
                <div className="space-y-1.5 pt-1">
                  <div>
                    <span className="text-[#697078]">Full Name:</span>{' '}
                    <span className="font-medium text-[#171A1F]">{payment.customer.name}</span>
                  </div>
                  <div>
                    <span className="text-[#697078]">Account Age:</span>{' '}
                    <span className="text-[#171A1F]">{payment.customer.accountAgeMonths} months</span>
                  </div>
                  <div>
                    <span className="text-[#697078]">Email:</span>{' '}
                    <span className="font-mono text-[#171A1F]">{payment.customer.maskedEmail}</span>
                  </div>
                  <div>
                    <span className="text-[#697078]">Phone:</span>{' '}
                    <span className="font-mono text-[#171A1F]">{payment.customer.maskedPhone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-3 text-[12px]">
                <h3 className="font-semibold text-[#171A1F] flex items-center gap-1.5">
                  <Database size={14} className="text-[#697078]" />
                  <span>Telemetry Traces</span>
                </h3>
                <div className="space-y-2">
                  <div className="p-2 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[4px]">
                    <span className="text-[#697078] block text-[10px] font-mono uppercase">PayPal Orders API</span>
                    <span className="font-mono text-[#171A1F] text-[11px] truncate block">
                      {payment.paypalOrderId}
                    </span>
                  </div>
                  <div className="p-2 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[4px]">
                    <span className="text-[#697078] block text-[10px] font-mono uppercase">Channel3 Telemetry Ref</span>
                    <span className="font-mono text-[#171A1F] text-[11px]">ch3_intel_79182a</span>
                  </div>
                  <div className="p-2 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[4px]">
                    <span className="text-[#697078] block text-[10px] font-mono uppercase">Pattern Match Cluster</span>
                    <span className="font-mono text-[#171A1F] text-[11px]">cluster-irs-urgent-wire-2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Transcript */}
        {activeTab === 'transcript' && (
          <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE2DF]">
              <h3 className="text-[13px] font-semibold text-[#171A1F] flex items-center gap-2">
                <MessageSquare size={15} className="text-[#171A1F]" />
                <span>Customer Dialogue Transcript</span>
              </h3>
              <span className="text-[11px] text-[#697078]">Voluntarily provided session transcript</span>
            </div>

            {(!session || session.messages.length === 0) ? (
              <div className="py-12 text-center text-[12px] text-[#697078]">
                No messages recorded for this session.
              </div>
            ) : (
              <div className="space-y-3 max-w-2xl mx-auto py-2">
                {session.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'CUSTOMER' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="text-[10px] text-[#697078] mb-1 font-mono">
                      {msg.sender === 'CUSTOMER' ? payment.customer.name : 'Scam Brake Safety AI'}{' '}
                      • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div
                      className={`max-w-md p-3.5 rounded-[6px] text-[13px] leading-relaxed ${
                        msg.sender === 'CUSTOMER'
                          ? 'bg-[#171A1F] text-white'
                          : 'bg-[#F6F6F3] border border-[#DFE2DF] text-[#171A1F]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Threat Intel */}
        {activeTab === 'threat-intel' && (
          <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-4">
            <h3 className="text-[13px] font-semibold text-[#171A1F]">Signal Telemetry</h3>
            <div className="space-y-3">
              {payment.riskSignals.map((sig) => (
                <div key={sig.id} className="p-4 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] text-[12px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[13px] text-[#171A1F]">{sig.title}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[3px] bg-[#FAF2E4] text-[#9A6700] border border-[#9A6700]/20">
                      {sig.severity}
                    </span>
                  </div>
                  <p className="text-[#697078]">{sig.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#DFE2DF] text-[11px] text-[#697078]">
                    <span>Source: <strong className="text-[#171A1F] font-mono">{sig.source}</strong></span>
                    <span>Confidence: <strong className="text-[#171A1F] font-mono">{Math.round(sig.confidence * 100)}%</strong></span>
                    <span>Detected: <strong className="text-[#171A1F] font-mono">{new Date(sig.detectedAt).toLocaleTimeString()}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 4: Kernel Audit */}
        {activeTab === 'kernel-audit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-4 text-[12px]">
              <h3 className="text-[13px] font-semibold text-[#171A1F] flex items-center gap-2">
                <Search size={14} className="text-[#171A1F]" />
                <span>Kernel Directory Verification</span>
              </h3>
              <p className="text-[#697078]">
                Independent directory verification compares incoming caller claims with official government records.
              </p>
              <div className="p-3 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#697078]">Target Agency:</span>
                  <span className="font-medium text-[#171A1F]">{session?.independentVerification.targetOrganization || 'IRS Criminal Investigation'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697078]">Official Switchboard:</span>
                  <span className="font-mono text-[#171A1F]">{session?.independentVerification.officialPhone || '1-800-829-1040'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697078]">Status:</span>
                  <span className="text-[#9A6700] font-medium font-mono">{session?.independentVerification.status || 'PENDING'}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-4 text-[12px]">
              <h3 className="text-[13px] font-semibold text-[#171A1F] flex items-center gap-2">
                <UserCheck size={14} className="text-[#1A7A64]" />
                <span>Trusted Contact Record</span>
              </h3>
              <p className="text-[#697078]">
                Explicit customer consent record for notifying registered advocate of high-risk payment hold.
              </p>
              <div className="p-3 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#697078]">Contact Name:</span>
                  <span className="font-medium text-[#171A1F]">{session?.trustedContact.name || 'David Stephenson'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697078]">Relationship:</span>
                  <span className="text-[#171A1F]">{session?.trustedContact.relationship || 'Son'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697078]">Consent Granted:</span>
                  <span className="text-[#1A7A64] font-medium">{session?.trustedContact.consentGranted ? 'Yes (Explicit)' : 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697078]">SMS Dispatched:</span>
                  <span className="text-[#171A1F]">{session?.trustedContact.notificationSent ? 'Yes (via SMS Gateway)' : 'Not Dispatched'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function MerchantInvestigationCasePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F6F3] py-24 text-center text-[#697078]">
          <p className="text-xs font-mono">Loading investigation case...</p>
        </div>
      }
    >
      <MerchantInvestigationCaseContent />
    </React.Suspense>
  );
}
