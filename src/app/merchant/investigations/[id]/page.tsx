'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { Payment, InterventionSession } from '@/types';
import { Badge } from '@/components/ui/Badge';
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
          <FileText size={32} className="mx-auto text-[#6B7280]" />
          <h2 className="text-lg font-semibold text-[#1E1E2A]">Investigation Not Found</h2>
          <p className="text-xs text-[#6B7280]">
            No payment record found matching ID `{paymentId}`.
          </p>
          <Link
            href="/merchant/interventions"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] text-xs font-medium rounded hover:bg-[#FAFAFC]"
          >
            <ArrowLeft size={14} />
            Return to Active Interventions
          </Link>
        </div>
      </AppShell>
    );
  }

  const isHeld = payment.authorizationStatus === 'HOLD_ACTIVE';

  return (
    <AppShell activeItem="/merchant/investigations/pay_sb_881901">
      <div className="space-y-6 max-w-6xl">
        {/* Top Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/merchant/interventions"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1E1E2A]"
          >
            <ArrowLeft size={14} />
            Back to Active Interventions
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#6B7280]">Case Ref: {payment.paymentReference}</span>
            <Badge variant={payment.authorizationStatus} />
            <Badge variant={payment.riskLevel} />
          </div>
        </div>

        {actionNotice && (
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#059669] px-4 py-2.5 rounded text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-xs hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Case Banner */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-[#2D5BFF] bg-[#2D5BFF]/10 px-2 py-0.5 rounded font-semibold">
                  INVESTIGATION CASE FILE
                </span>
                <span className="text-xs text-[#6B7280]">Created {new Date(payment.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
                {payment.customer.name} — Coercion Risk Assessment
              </h1>
              <p className="text-xs text-[#6B7280] mt-1">
                Purchasing <span className="text-[#1E1E2A] font-medium">{payment.productName}</span> for ${payment.amount.toFixed(2)} USD via {payment.merchantName}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <button
                onClick={handleVoid}
                disabled={payment.authorizationStatus === 'VOIDED'}
                className="px-3.5 py-1.5 bg-[#FFFFFF] border border-[#DC2626]/40 text-[#DC2626] text-xs font-medium rounded hover:bg-[#FEF2F2] disabled:opacity-50"
              >
                Confirm Scam & Void Auth
              </button>
              <button
                onClick={handleCapture}
                disabled={payment.authorizationStatus === 'CAPTURED'}
                className="px-3.5 py-1.5 bg-[#2D5BFF] text-white text-xs font-medium rounded hover:bg-[#2044C8] disabled:opacity-50"
              >
                Clear Hold & Capture
              </button>
            </div>
          </div>

          {/* Authorization Path Visualizer */}
          <AuthorizationPath
            status={payment.authorizationStatus}
            interventionStatus={payment.interventionStatus}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-[#E5E7EB] flex items-center gap-6 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#2D5BFF] text-[#2D5BFF]'
                : 'border-transparent text-[#6B7280] hover:text-[#1E1E2A]'
            }`}
          >
            Case Overview & AI Hypothesis
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'transcript'
                ? 'border-[#2D5BFF] text-[#2D5BFF]'
                : 'border-transparent text-[#6B7280] hover:text-[#1E1E2A]'
            }`}
          >
            Customer Dialogue Transcript ({session?.messages.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('threat-intel')}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'threat-intel'
                ? 'border-[#2D5BFF] text-[#2D5BFF]'
                : 'border-transparent text-[#6B7280] hover:text-[#1E1E2A]'
            }`}
          >
            Channel3 & Elastic Signals
          </button>
          <button
            onClick={() => setActiveTab('kernel-audit')}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'kernel-audit'
                ? 'border-[#2D5BFF] text-[#2D5BFF]'
                : 'border-transparent text-[#6B7280] hover:text-[#1E1E2A]'
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
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1E1E2A] flex items-center gap-2">
                    <ShieldAlert size={16} className="text-[#DC2626]" />
                    AI Behavioral & Coercion Hypothesis
                  </h3>
                  <span className="font-mono text-xs bg-[#FEF2F2] text-[#DC2626] px-2 py-0.5 rounded font-semibold">
                    Risk Score: {payment.riskScore} / 100
                  </span>
                </div>

                <div className="text-xs text-[#1E1E2A] bg-[#FAFAFC] border border-[#E5E7EB] p-4 rounded leading-relaxed space-y-2">
                  <p>
                    <strong>Hypothesis:</strong> The customer is undergoing an active social-engineering coercion event consistent with an impersonation extortion scheme (IRS or Federal Agency spoof).
                  </p>
                  <p className="text-[#6B7280]">
                    <strong>Corroborating Evidence:</strong> The customer was instructed to remain on an active mobile call, buy prepaid store cards to "settle an immediate federal lien," and keep transaction details secret from cashier staff.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="p-2.5 bg-[#FAFAFC] border border-[#E5E7EB] rounded">
                    <div className="text-[#6B7280]">Urgency Index</div>
                    <div className="font-semibold text-[#DC2626] text-sm mt-0.5">High (92%)</div>
                  </div>
                  <div className="p-2.5 bg-[#FAFAFC] border border-[#E5E7EB] rounded">
                    <div className="text-[#6B7280]">Impersonation Match</div>
                    <div className="font-semibold text-[#DC2626] text-sm mt-0.5">IRS Criminal Dept</div>
                  </div>
                  <div className="p-2.5 bg-[#FAFAFC] border border-[#E5E7EB] rounded">
                    <div className="text-[#6B7280]">Secrecy Demanded</div>
                    <div className="font-semibold text-[#D97706] text-sm mt-0.5">Confirmed</div>
                  </div>
                </div>
              </div>

              {/* Event Timeline */}
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#1E1E2A]">Intervention Timeline</h3>
                <div className="border-l-2 border-[#E5E7EB] pl-4 space-y-4 text-xs">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#2D5BFF]" />
                    <span className="text-[#6B7280] font-mono text-[11px]">10:32:00 AM</span>
                    <div className="font-medium text-[#1E1E2A]">PayPal Order Initiated</div>
                    <p className="text-[#6B7280]">Checkout with PayPal button clicked on merchant site for $1,200.00.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <span className="text-[#6B7280] font-mono text-[11px]">10:32:04 AM</span>
                    <div className="font-medium text-[#1E1E2A]">Authorization Created — Hold Placed</div>
                    <p className="text-[#6B7280]">PayPal authorized payment; Scam Brake intercepted capture trigger due to high risk score (88/100).</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#2D5BFF]" />
                    <span className="text-[#6B7280] font-mono text-[11px]">10:32:15 AM</span>
                    <div className="font-medium text-[#1E1E2A]">Conversational Check-In Launched</div>
                    <p className="text-[#6B7280]">Scam Brake opened calm safety dialogue with customer {payment.customer.name}.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="text-[#6B7280] font-mono text-[11px]">10:33:45 AM</span>
                    <div className="font-medium text-[#1E1E2A]">Kernel Independent Directory Check Displayed</div>
                    <p className="text-[#6B7280]">Customer shown official public switchboard for IRS Criminal Investigation.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column: Customer profile & Sponsor diagnostics */}
            <div className="space-y-6">
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-3 text-xs">
                <h3 className="font-semibold text-[#1E1E2A] flex items-center gap-1.5">
                  <User size={14} className="text-[#6B7280]" />
                  Protected Customer
                </h3>
                <div className="space-y-1.5 pt-1">
                  <div>
                    <span className="text-[#6B7280]">Full Name:</span>{' '}
                    <span className="font-medium text-[#1E1E2A]">{payment.customer.name}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Account Age:</span>{' '}
                    <span className="text-[#1E1E2A]">{payment.customer.accountAgeMonths} months</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Masked Email:</span>{' '}
                    <span className="font-mono text-[#1E1E2A]">{payment.customer.maskedEmail}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Masked Phone:</span>{' '}
                    <span className="font-mono text-[#1E1E2A]">{payment.customer.maskedPhone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-3 text-xs">
                <h3 className="font-semibold text-[#1E1E2A] flex items-center gap-1.5">
                  <Database size={14} className="text-[#6B7280]" />
                  Technology Stack Traces
                </h3>
                <div className="space-y-2">
                  <div className="p-2 bg-[#FAFAFC] border border-[#E5E7EB] rounded">
                    <span className="text-[#6B7280] block text-[11px]">PayPal Orders API</span>
                    <span className="font-mono text-[#1E1E2A] text-[11px] truncate block">
                      {payment.paypalOrderId}
                    </span>
                  </div>
                  <div className="p-2 bg-[#FAFAFC] border border-[#E5E7EB] rounded">
                    <span className="text-[#6B7280] block text-[11px]">Channel3 Telemetry Ref</span>
                    <span className="font-mono text-[#1E1E2A] text-[11px]">ch3_intel_79182a</span>
                  </div>
                  <div className="p-2 bg-[#FAFAFC] border border-[#E5E7EB] rounded">
                    <span className="text-[#6B7280] block text-[11px]">Elastic Pattern Match Cluster</span>
                    <span className="font-mono text-[#1E1E2A] text-[11px]">cluster-irs-urgent-wire-2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Transcript */}
        {activeTab === 'transcript' && (
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#1E1E2A] flex items-center gap-2">
                <MessageSquare size={16} className="text-[#2D5BFF]" />
                Customer Safety Dialogue Log
              </h3>
              <span className="text-xs text-[#6B7280]">Voluntarily provided session transcript</span>
            </div>

            {(!session || session.messages.length === 0) ? (
              <div className="py-12 text-center text-xs text-[#6B7280]">
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
                    <div className="text-[11px] text-[#6B7280] mb-1 font-mono">
                      {msg.sender === 'CUSTOMER' ? payment.customer.name : 'Scam Brake Safety AI'}{' '}
                      • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div
                      className={`max-w-md p-3.5 rounded text-xs leading-relaxed ${
                        msg.sender === 'CUSTOMER'
                          ? 'bg-[#2D5BFF] text-white'
                          : 'bg-[#FAFAFC] border border-[#E5E7EB] text-[#1E1E2A]'
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
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#1E1E2A]">Channel3 & Elastic Signal Telemetry</h3>
            <div className="space-y-3">
              {payment.riskSignals.map((sig) => (
                <div key={sig.id} className="p-4 bg-[#FAFAFC] border border-[#E5E7EB] rounded text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#1E1E2A]">{sig.title}</span>
                    <Badge variant={sig.severity} />
                  </div>
                  <p className="text-[#6B7280]">{sig.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB] text-[11px] text-[#6B7280]">
                    <span>Source: <strong className="text-[#1E1E2A]">{sig.source}</strong></span>
                    <span>Confidence Score: <strong className="text-[#1E1E2A]">{Math.round(sig.confidence * 100)}%</strong></span>
                    <span>Detected: <strong className="text-[#1E1E2A]">{new Date(sig.detectedAt).toLocaleTimeString()}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 4: Kernel Audit */}
        {activeTab === 'kernel-audit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-4 text-xs">
              <h3 className="text-sm font-semibold text-[#1E1E2A] flex items-center gap-2">
                <Search size={15} className="text-[#2D5BFF]" />
                Kernel Public Directory Verification
              </h3>
              <p className="text-[#6B7280]">
                Independent phone registry verification enabled to compare incoming caller claims with official government directory records.
              </p>
              <div className="p-3 bg-[#FAFAFC] border border-[#E5E7EB] rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Target Agency:</span>
                  <span className="font-medium text-[#1E1E2A]">{session?.independentVerification.targetOrganization || 'IRS Criminal Investigation'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Official Switchboard:</span>
                  <span className="font-mono text-[#1E1E2A]">{session?.independentVerification.officialPhone || '1-800-829-1040'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Status:</span>
                  <span className="text-[#D97706] font-medium">{session?.independentVerification.status || 'PENDING'}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-4 text-xs">
              <h3 className="text-sm font-semibold text-[#1E1E2A] flex items-center gap-2">
                <UserCheck size={15} className="text-[#059669]" />
                Trusted Contact Advocacy Record
              </h3>
              <p className="text-[#6B7280]">
                Explicit customer consent record for notifying registered advocate of high-risk payment hold.
              </p>
              <div className="p-3 bg-[#FAFAFC] border border-[#E5E7EB] rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Contact Name:</span>
                  <span className="font-medium text-[#1E1E2A]">{session?.trustedContact.name || 'Marcus Vance'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Relationship:</span>
                  <span className="text-[#1E1E2A]">{session?.trustedContact.relationship || 'Son'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Consent Granted:</span>
                  <span className="text-[#059669] font-medium">{session?.trustedContact.consentGranted ? 'Yes (Explicit)' : 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">SMS Dispatched:</span>
                  <span className="text-[#1E1E2A]">{session?.trustedContact.notificationSent ? 'Yes (via Zapier/Twilio)' : 'Not Dispatched'}</span>
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
        <div className="min-h-screen bg-[#FAFAFC] py-24 text-center text-[#6B7280]">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#2D5BFF] border-t-transparent mb-3" />
          <p className="text-sm">Loading investigation case...</p>
        </div>
      }
    >
      <MerchantInvestigationCaseContent />
    </React.Suspense>
  );
}
