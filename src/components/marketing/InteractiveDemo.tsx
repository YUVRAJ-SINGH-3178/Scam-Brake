'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Clock,
  ArrowRight,
  RefreshCw,
  Info,
  ExternalLink,
} from 'lucide-react';
import { SIMULATION_SCENARIOS } from '@/data/seedData';
import { SimulationScenario } from '@/types';
import { Button } from '@/components/ui/Button';
import { AuthorizationPath, PathStage } from '@/components/brand/AuthorizationPath';

export const InteractiveDemo: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(
    SIMULATION_SCENARIOS[0]
  );
  const [step, setStep] = useState<number>(1);
  // Step 1: Checkout & Approve
  // Step 2: PayPal Authorization (Hold active)
  // Step 3: Scam Brake Intervention / Check-in
  // Step 4: Resolution (Void vs Capture)
  const [customerAnswer, setCustomerAnswer] = useState<string | null>(null);

  const resetDemo = (scenario: SimulationScenario) => {
    setSelectedScenario(scenario);
    setStep(1);
    setCustomerAnswer(null);
  };

  const currentPathStage: PathStage =
    step === 1
      ? 'CHECKOUT'
      : step === 2
      ? 'AUTHORIZED'
      : step === 3
      ? customerAnswer
        ? 'CUSTOMER_DECISION'
        : 'REVIEW'
      : selectedScenario.expectedOutcome === 'VOID'
      ? 'VOID'
      : 'CAPTURE';

  return (
    <div className="w-full bg-[#11121C] border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 md:p-8 text-[#EDEDF3]">
      {/* Simulation Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[rgba(255,255,255,0.1)] mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[12px] font-mono tracking-wider uppercase text-[#EDEDF3] font-semibold">
            Interactive Safety Simulation
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.08)] text-[rgba(237,237,243,0.7)] font-mono">
            SANDBOX MODE
          </span>
        </div>
        <div className="text-[12px] text-[rgba(237,237,243,0.5)]">
          Zero actual charges • Simulated PayPal authorization
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="mb-8">
        <label className="text-[12px] font-medium text-[rgba(237,237,243,0.6)] uppercase tracking-wider block mb-3">
          Select A Real-World Coercion Pattern To Test:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SIMULATION_SCENARIOS.map((sc) => {
            const isCurrent = sc.id === selectedScenario.id;
            return (
              <button
                key={sc.id}
                onClick={() => resetDemo(sc)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[rgba(45,91,255,0.14)] border-[#2D5BFF] ring-1 ring-[#2D5BFF]/40'
                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.06)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-medium text-[#2D5BFF]">
                    {sc.type === 'TAX_OFFICER_SCAM'
                      ? 'SCENARIO 01'
                      : sc.type === 'BANK_IMPERSONATION'
                      ? 'SCENARIO 02'
                      : 'SCENARIO 03'}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      sc.expectedOutcome === 'VOID'
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : 'bg-[#10B981]/20 text-[#10B981]'
                    }`}
                  >
                    EXPECTED: {sc.expectedOutcome}
                  </span>
                </div>
                <div className="font-semibold text-[14px] text-[#EDEDF3] mb-1 leading-snug">
                  {sc.title}
                </div>
                <div className="text-[12px] text-[rgba(237,237,243,0.6)] line-clamp-2">
                  {sc.shortDescription}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Motif: The Authorization Path (Active State for this Demo) */}
      <div className="mb-8">
        <AuthorizationPath
          currentStage={currentPathStage}
          variant="marketing"
          amount={selectedScenario.amount}
          currency="USD"
        />
      </div>

      {/* Interactive Simulation Walkthrough Stage */}
      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)] mb-6 text-[12px]">
          <span className="text-[rgba(237,237,243,0.6)]">
            Step <span className="font-mono text-white font-bold">{step}</span> of 4
          </span>
          <button
            onClick={() => resetDemo(selectedScenario)}
            className="flex items-center gap-1.5 text-[12px] text-[rgba(237,237,243,0.6)] hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Reset Flow</span>
          </button>
        </div>

        {/* STEP 1: MERCHANT CHECKOUT APPROVAL */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono text-[#2D5BFF] font-semibold tracking-wider uppercase">
                Phase 1 — Merchant Checkout Initiation
              </span>
              <h3 className="text-[18px] font-semibold text-[#EDEDF3] mt-1">
                Customer clicks &quot;Pay with PayPal&quot; at {selectedScenario.merchantName}
              </h3>
              <p className="text-[13px] text-[rgba(237,237,243,0.65)] mt-1 max-w-xl">
                The victim is attempting to purchase{' '}
                <span className="text-white font-medium">
                  {selectedScenario.productName}
                </span>{' '}
                for a total of{' '}
                <span className="font-mono font-semibold text-white">
                  ${selectedScenario.amount.toFixed(2)} USD
                </span>
                .
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[rgba(237,237,243,0.5)]">Order Summary</div>
                <div className="text-[14px] font-semibold text-white">
                  {selectedScenario.productName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[rgba(237,237,243,0.5)]">Authorized Hold Target</div>
                <div className="text-[18px] font-mono font-bold text-white">
                  ${selectedScenario.amount.toFixed(2)}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setStep(2)}
              className="w-full sm:w-auto"
            >
              <span>Simulate PayPal Order Approval</span>
              <ArrowRight size={15} />
            </Button>
          </div>
        )}

        {/* STEP 2: PAYPAL AUTHORIZATION HOLD CREATED */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono text-[#F59E0B] font-semibold tracking-wider uppercase">
                Phase 2 — Authorization Created & Held
              </span>
              <h3 className="text-[18px] font-semibold text-[#EDEDF3] mt-1">
                PayPal Authorizes Hold (Capture Paused by Scam Brake)
              </h3>
              <p className="text-[13px] text-[rgba(237,237,243,0.65)] mt-1 max-w-xl">
                PayPal has confirmed funds are available and placed an authorization hold. Scam Brake prevents the merchant from immediate capture because preliminary risk signals were detected.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] flex items-center gap-3">
              <Clock size={20} className="text-[#F59E0B] shrink-0" />
              <div className="text-[13px]">
                <div className="font-semibold text-[#F59E0B]">
                  Pre-Capture Verification Window Active (24-Hour Hold)
                </div>
                <div className="text-[rgba(237,237,243,0.7)] text-[12px]">
                  Funds remain with the buyer. Merchant capture API is gated pending Scam Brake check-in.
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setStep(3)}
              className="w-full sm:w-auto"
            >
              <span>Begin Scam Brake Customer Check-In</span>
              <ArrowRight size={15} />
            </Button>
          </div>
        )}

        {/* STEP 3: CONVERSATIONAL CHECK-IN */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono text-[#2D5BFF] font-semibold tracking-wider uppercase">
                Phase 3 — Calm AI-Assisted Intervention
              </span>
              <h3 className="text-[18px] font-semibold text-[#EDEDF3] mt-1">
                Scam Brake calmly asks the customer contextual questions
              </h3>
              <p className="text-[13px] text-[rgba(237,237,243,0.65)] mt-1">
                No alarming sirens or technical jargon. One simple question at a time.
              </p>
            </div>

            {/* Chat bubble simulation */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-[rgba(45,91,255,0.12)] border border-[rgba(45,91,255,0.25)] max-w-lg">
                <div className="text-[11px] font-semibold text-[#2D5BFF] mb-1">
                  Scam Brake Safety Assistant
                </div>
                <p className="text-[13px] text-[#EDEDF3] leading-relaxed">
                  {selectedScenario.sampleConversation[0].content}
                </p>
              </div>

              {!customerAnswer ? (
                <div className="space-y-2 pt-2">
                  <div className="text-[12px] text-[rgba(237,237,243,0.6)]">
                    Simulate Customer Response:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setCustomerAnswer(selectedScenario.sampleConversation[1].content);
                        setTimeout(() => setStep(4), 600);
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      &quot;{selectedScenario.sampleConversation[1].content}&quot;
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCustomerAnswer('I am unsure, I need help verifying.');
                        setTimeout(() => setStep(4), 600);
                      }}
                      className="text-white border-white/20"
                    >
                      &quot;I am unsure, I need help verifying.&quot;
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] max-w-lg ml-auto">
                  <div className="text-[11px] font-semibold text-[rgba(237,237,243,0.7)] mb-1 text-right">
                    Customer
                  </div>
                  <p className="text-[13px] text-[#EDEDF3] leading-relaxed">
                    {customerAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: FINAL RESOLUTION */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <span
                className={`text-[11px] font-mono font-semibold tracking-wider uppercase ${
                  selectedScenario.expectedOutcome === 'VOID'
                    ? 'text-[#EF4444]'
                    : 'text-[#10B981]'
                }`}
              >
                Phase 4 — Authorization Resolution ({selectedScenario.expectedOutcome})
              </span>
              <h3 className="text-[18px] font-semibold text-[#EDEDF3] mt-1">
                {selectedScenario.expectedOutcome === 'VOID'
                  ? 'Payment Canceled: PayPal Authorization Safely Voided'
                  : 'Payment Verified: PayPal Authorization Captured'}
              </h3>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                selectedScenario.expectedOutcome === 'VOID'
                  ? 'bg-[#EF4444]/10 border-[#EF4444]/30'
                  : 'bg-[#10B981]/10 border-[#10B981]/30'
              } space-y-2`}
            >
              <div className="flex items-center gap-2">
                {selectedScenario.expectedOutcome === 'VOID' ? (
                  <XCircle size={18} className="text-[#EF4444]" />
                ) : (
                  <CheckCircle2 size={18} className="text-[#10B981]" />
                )}
                <span
                  className={`font-semibold text-[14px] ${
                    selectedScenario.expectedOutcome === 'VOID'
                      ? 'text-[#EF4444]'
                      : 'text-[#10B981]'
                  }`}
                >
                  {selectedScenario.expectedOutcome === 'VOID'
                    ? 'Total Money Saved: $' + selectedScenario.amount.toFixed(2) + ' USD'
                    : 'Order Cleared: $' + selectedScenario.amount.toFixed(2) + ' USD Captured'}
                </span>
              </div>
              <p className="text-[13px] text-[rgba(237,237,243,0.75)] leading-relaxed">
                {selectedScenario.expectedOutcome === 'VOID'
                  ? 'Because the customer was alerted to coercion, Scam Brake dispatched a void request to the PayPal v2/payments/authorizations API. No funds ever left the customer account. No dispute needed.'
                  : 'Independent verification confirmed the customer intended to purchase this product for personal use with zero remote session or impersonation flags. PayPal capture completed.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => resetDemo(selectedScenario)}
              >
                <RefreshCw size={14} />
                <span>Run Another Scenario</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
