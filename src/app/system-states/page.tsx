'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileQuestion,
  Lock,
  ServerCrash,
  WifiOff,
  AlertCircle,
  Clock,
  Ban,
  ShieldX,
  CreditCard,
  Inbox,
  Loader2,
  Wrench,
  Home,
} from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';

interface SystemStateDemo {
  id: string;
  code: string;
  title: string;
  category: 'HTTP_ERROR' | 'CHECKOUT_EDGE_CASE' | 'CONNECTIVITY' | 'LIFECYCLE';
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  suggestedAction: string;
  userMessage: string;
}

const SYSTEM_STATES: SystemStateDemo[] = [
  {
    id: 'STATE-404',
    code: '404 NOT FOUND',
    title: 'Resource Not Located',
    category: 'HTTP_ERROR',
    description: 'Triggered when an invalid payment reference, order ID, or investigation case is requested.',
    icon: FileQuestion,
    suggestedAction: 'Return to Operations Overview',
    userMessage: 'The requested payment or investigation record does not exist or may have been archived.',
  },
  {
    id: 'STATE-403',
    code: '403 FORBIDDEN',
    title: 'Access Restricted by Policy',
    category: 'HTTP_ERROR',
    description: 'Triggered when an unauthenticated merchant user attempts to inspect sensitive customer telemetry.',
    icon: Lock,
    suggestedAction: 'Request Elevated Permission',
    userMessage: 'You do not have authorization to view unmasked customer directory records or override risk holds.',
  },
  {
    id: 'STATE-500',
    code: '500 INTERNAL SERVER ERROR',
    title: 'Upstream Service Exception',
    category: 'HTTP_ERROR',
    description: 'Occurs if an unexpected exception interrupts risk pipeline evaluation.',
    icon: ServerCrash,
    suggestedAction: 'Retry Authorization Check',
    userMessage: 'An internal error occurred while processing telemetry. Customer funds remain held safely in PayPal.',
  },
  {
    id: 'STATE-OFFLINE',
    code: 'NETWORK OFFLINE',
    title: 'Client Connectivity Lost',
    category: 'CONNECTIVITY',
    description: 'Client device loses active internet connectivity during customer intervention check-in.',
    icon: WifiOff,
    suggestedAction: 'Check Internet Connection',
    userMessage: 'Your connection was interrupted. The payment authorization remains safely paused while you reconnect.',
  },
  {
    id: 'STATE-TIMEOUT',
    code: 'GATEWAY TIMEOUT',
    title: 'PayPal API Latency / Timeout',
    category: 'CONNECTIVITY',
    description: 'PayPal Orders API exceeds 10,000ms latency during pre-capture authorization hook.',
    icon: AlertCircle,
    suggestedAction: 'Query PayPal Status',
    userMessage: 'PayPal upstream response timed out. A background worker is verifying authorization status.',
  },
  {
    id: 'STATE-EXPIRED-SESSION',
    code: 'SESSION EXPIRED',
    title: 'Intervention Session Inactivity',
    category: 'LIFECYCLE',
    description: 'Customer closes browser or leaves safety conversation idle past 30-minute threshold.',
    icon: Clock,
    suggestedAction: 'Resume Verification Session',
    userMessage: 'Your safety check-in session timed out. For your security, funds were kept in pre-capture hold.',
  },
  {
    id: 'STATE-INVALID-CHECKOUT',
    code: 'INVALID CHECKOUT',
    title: 'Malformed PayPal Order Intent',
    category: 'CHECKOUT_EDGE_CASE',
    description: 'Merchant checkout passed intent: CAPTURE instead of required intent: AUTHORIZE.',
    icon: Ban,
    suggestedAction: 'Review Integration Docs',
    userMessage: 'Scam Brake protection requires PayPal orders to be initialized with intent: "AUTHORIZE".',
  },
  {
    id: 'STATE-AUTH-EXPIRED',
    code: 'HOLD EXPIRED',
    title: 'PayPal Authorization Window Elapsed',
    category: 'LIFECYCLE',
    description: 'PayPal default 29-day authorization lifespan expired without capture or void.',
    icon: ShieldX,
    suggestedAction: 'Re-initiate Checkout Order',
    userMessage: 'The temporary PayPal authorization hold has expired. No funds were debited from customer account.',
  },
  {
    id: 'STATE-CAPTURE-FAIL',
    code: 'CAPTURE REJECTED',
    title: 'PayPal Capture Settlement Failed',
    category: 'CHECKOUT_EDGE_CASE',
    description: 'Customer PayPal account experienced funding source decline at time of final capture.',
    icon: CreditCard,
    suggestedAction: 'Update Payment Method in PayPal',
    userMessage: 'PayPal could not complete the final settlement. Please check your funding balance in PayPal.',
  },
  {
    id: 'STATE-EMPTY-DATA',
    code: 'EMPTY LEDGER',
    title: 'No Payments Matching Filter',
    category: 'LIFECYCLE',
    description: 'Ledger search or filter query returns 0 matching payment records.',
    icon: Inbox,
    suggestedAction: 'Clear Search Filters',
    userMessage: 'No transactions match the selected criteria. Try adjusting your date or risk level filters.',
  },
  {
    id: 'STATE-LOADING',
    code: 'PROCESSING',
    title: 'Telemetry Scan in Progress',
    category: 'LIFECYCLE',
    description: 'Channel3 threat enrichment and pattern matching underway (<800ms).',
    icon: Loader2,
    suggestedAction: 'Awaiting Analysis...',
    userMessage: 'Analyzing payment risk signals against known social-engineering schemes...',
  },
  {
    id: 'STATE-MAINTENANCE',
    code: '503 SERVICE UNAVAILABLE',
    title: 'Scheduled System Maintenance',
    category: 'HTTP_ERROR',
    description: 'Scheduled infrastructure maintenance on risk intelligence cluster.',
    icon: Wrench,
    suggestedAction: 'Check Status Page',
    userMessage: 'Scam Brake core services are undergoing scheduled maintenance. PayPal checkouts operate with fail-safe hold.',
  },
];

export default function SystemStatesGalleryPage() {
  const [selectedState, setSelectedState] = useState<SystemStateDemo>(SYSTEM_STATES[0]);
  const StateIcon = selectedState.icon;

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171A1F] flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#DFE2DF] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/merchant" className="flex items-center gap-2">
            <ScamBrakeMark size={24} />
            <span className="font-semibold text-[14px] tracking-tight text-[#171A1F]">
              SCAM BRAKE
            </span>
          </Link>
          <span className="text-[12px] text-[#525860] border-l border-[#DFE2DF] pl-2 font-medium">
            System state catalog (12 edge cases)
          </span>
        </div>

        <Link
          href="/merchant"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[13px] font-medium text-[#171A1F] rounded-[6px] transition-colors"
        >
          <Home size={13} />
          <span>Return to Dashboard</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F]">
            Edge Case & Error State Design System
          </h1>
          <p className="text-[13px] text-[#525860] mt-1">
            Standardized UX treatments for HTTP codes, network disconnections, timeout windows, and payment exceptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* State Selector Sidebar */}
          <div className="space-y-1.5 md:col-span-1 max-h-[75vh] overflow-y-auto pr-1">
            {SYSTEM_STATES.map((state) => {
              const Icon = state.icon;
              return (
                <button
                  key={state.id}
                  onClick={() => setSelectedState(state)}
                  className={`w-full text-left p-3 rounded-[6px] border transition-colors flex items-center gap-3 cursor-pointer ${
                    selectedState.id === state.id
                      ? 'bg-[#FFFFFF] border-[#171A1F]'
                      : 'bg-[#F6F6F3] border-[#DFE2DF] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-[4px] shrink-0 ${
                      selectedState.id === state.id
                        ? 'bg-[#171A1F] text-white'
                        : 'bg-[#FFFFFF] border border-[#DFE2DF] text-[#525860]'
                    }`}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <code className="font-mono text-[11px] text-[#525860] block">{state.code}</code>
                    <div className="font-medium text-[13px] text-[#171A1F] truncate">{state.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Screen Preview */}
          <div className="md:col-span-2 bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-8 flex flex-col justify-between min-h-[500px]">
            <div className="flex items-center justify-between pb-4 border-b border-[#DFE2DF]">
              <div>
                <code className="font-mono text-[11px] text-[#171A1F] bg-[#F6F6F3] border border-[#DFE2DF] px-2 py-0.5 rounded-[3px] font-semibold">
                  {selectedState.code}
                </code>
                <span className="text-[12px] text-[#525860] ml-2">{selectedState.category}</span>
              </div>
              <span className="text-[12px] text-[#525860]">UI Preview</span>
            </div>

            {/* Centered Render of Error Component */}
            <div className="my-auto py-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F6F6F3] border border-[#DFE2DF] flex items-center justify-center mx-auto text-[#171A1F]">
                <StateIcon size={22} className={selectedState.id === 'STATE-LOADING' ? 'animate-spin' : ''} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#171A1F] tracking-tight">{selectedState.title}</h2>
                <p className="text-[13px] text-[#525860] mt-1.5 leading-relaxed">
                  {selectedState.userMessage}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert(`Simulated action: ${selectedState.suggestedAction}`)}
                  className="px-4 py-2 bg-[#171A1F] text-white text-[13px] font-medium rounded-[6px] hover:bg-[#2B303A] transition-colors cursor-pointer"
                >
                  {selectedState.suggestedAction}
                </button>
              </div>
            </div>

            {/* Technical Specification Footer */}
            <div className="pt-4 border-t border-[#DFE2DF] text-[13px] text-[#525860] space-y-1">
              <div className="font-semibold text-[#171A1F]">Technical Behavior & Recovery Rule:</div>
              <p className="leading-relaxed">{selectedState.description}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
