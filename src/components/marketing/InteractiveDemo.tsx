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
    <div className="w-full bg-[#FFFFFF] rounded-[6px] p-6 md:p-8 text-[#171A1F]">
      {/* Simulation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#1A7A64]" />
          <span className="text-[15px] font-semibold text-[#171A1F]">
            Interactive Pre-Capture Sandbox
          </span>
          <span className="text-[13px] px-2.5 py-0.5 rounded-[4px] bg-[#F6F6F3] text-[#525860] font-medium">
            Sandbox Simulator
          </span>
        </div>
        <div className="text-[14px] text-[#525860]">
          Zero actual card debits • Simulated PayPal Authorization hold
        </div>
      </div>

      {/* Scenario Selector Row */}
      <div data-ui="true" className="mb-6">
        <label className="text-[14px] font-medium text-[#525860] block mb-3">
          Select A Coercion Scenario To Evaluate:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {SIMULATION_SCENARIOS.map((sc, i) => {
            const isCurrent = sc.id === selectedScenario.id;
            return (
              <button
                key={sc.id}
                onClick={() => resetDemo(sc)}
                className={`text-left p-4 rounded-[6px] transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#171A1F] text-[#FFFFFF]'
                    : 'bg-[#F6F6F3] text-[#171A1F] hover:bg-[#ECECE8]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[13px] font-medium ${
                      isCurrent ? 'text-white/80' : 'text-[#525860]'
                    }`}
                  >
                    Scenario 0{i + 1}
                  </span>
                  <span
                    className={`text-[13px] px-2 py-0.5 rounded-[3px] font-semibold ${
                      sc.expectedOutcome === 'VOID'
                        ? isCurrent
                          ? 'bg-[#FDE8E8] text-[#C53030]'
                          : 'bg-[#FDE8E8] text-[#C53030]'
                        : isCurrent
                        ? 'bg-[#EAF4F1] text-[#1A7A64]'
                        : 'bg-[#EAF4F1] text-[#1A7A64]'
                    }`}
                  >
                    Outcome: {sc.expectedOutcome}
                  </span>
                </div>
                <div
                  className={`font-semibold text-[15px] mb-1.5 leading-snug ${
                    isCurrent ? 'text-white' : 'text-[#171A1F]'
                  }`}
                >
                  {sc.title}
                </div>
                <div
                  className={`text-[13px] line-clamp-2 leading-relaxed ${
                    isCurrent ? 'text-white/80' : 'text-[#525860]'
                  }`}
                >
                  {sc.shortDescription}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Motif: The Authorization Path */}
      <div className="mb-6">
        <AuthorizationPath
          currentStage={currentPathStage}
          amount={selectedScenario.amount}
          currency="USD"
        />
      </div>

      {/* Interactive Simulation Walkthrough Panel */}
      <div
        data-ui="true"
        className="min-h-[240px] bg-[#F6F6F3] rounded-[6px] p-6 space-y-4"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-3.5 mb-3 text-[14px]">
          <span className="text-[#525860]">
            Simulation Step <strong className="font-semibold text-[#171A1F]">{step}</strong> of 4
          </span>
          <button
            onClick={() => resetDemo(selectedScenario)}
            className="flex items-center gap-1.5 text-[14px] text-[#525860] hover:text-[#171A1F] transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Reset Scenario</span>
          </button>
        </div>

        {/* STEP 1: MERCHANT CHECKOUT APPROVAL */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-[13px] text-[#171A1F] font-semibold">
                PHASE 1: CHECKOUT INITIATION
              </span>
              <h3 className="text-[18px] font-semibold text-[#171A1F] mt-1">
                Customer clicks &quot;Pay with PayPal&quot; at {selectedScenario.merchantName}
              </h3>
              <p className="text-[15px] text-[#525860] mt-1 max-w-xl leading-relaxed">
                The shopper is attempting to purchase{' '}
                <strong className="text-[#171A1F]">{selectedScenario.productName}</strong> for{' '}
                <strong className="text-[#171A1F]">
                  <code>${selectedScenario.amount.toFixed(2)} USD</code>
                </strong>
                .
              </p>
            </div>

            <div className="p-4 rounded-[6px] bg-[#FFFFFF] flex items-center justify-between">
              <div>
                <div className="text-[13px] text-[#525860]">Product Description</div>
                <div className="text-[15px] font-medium text-[#171A1F]">
                  {selectedScenario.productName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] text-[#525860]">Authorization Target</div>
                <div className="text-[18px] font-semibold text-[#171A1F] tabular-nums">
                  <code>${selectedScenario.amount.toFixed(2)}</code>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(2)}
              className="w-full sm:w-auto"
            >
              <span>Approve Order in PayPal Popup</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        )}

        {/* STEP 2: PAYPAL AUTHORIZATION HOLD CREATED */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-[13px] text-[#784D00] font-semibold">
                PHASE 2: SIMULATED HOLD PREVIEW
              </span>
              <h3 className="text-[18px] font-semibold text-[#171A1F] mt-1">
                Mock Authorization Scenario
              </h3>
              <p className="text-[15px] text-[#525860] mt-1 max-w-xl leading-relaxed">
                This scripted preview shows an illustrative authorization. The current build makes no PayPal request and does not hold funds.
              </p>
            </div>

            <div className="p-4 rounded-[6px] bg-[#FAF2E4] flex items-start gap-3">
              <Clock size={18} className="text-[#784D00] shrink-0 mt-0.5" />
              <div className="text-[14px]">
                <div className="font-semibold text-[#784D00]">
                  Simulated Pre-Capture Hold Preview
                </div>
                <div className="text-[#525860] text-[13px] leading-relaxed mt-0.5">
                  Illustrative scenario only. No PayPal order exists, and no funds are held or moved.
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(3)}
              className="w-full sm:w-auto"
            >
              <span>Launch Customer Verification Dialogue</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        )}

        {/* STEP 3: CONVERSATIONAL CHECK-IN */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-[13px] text-[#171A1F] font-semibold">
                PHASE 3: CALM VERIFICATION INQUIRY
              </span>
              <h3 className="text-[18px] font-semibold text-[#171A1F] mt-1">
                Scam Brake checks for urgency, threats, or false authority
              </h3>
              <p className="text-[15px] text-[#525860] mt-1 leading-relaxed">
                Empathetic, non-alarmist dialogue asking the customer about incoming phone instructions.
              </p>
            </div>

            {/* Chat bubble simulation */}
            <div className="space-y-3">
              <div className="p-4 rounded-[6px] bg-[#FFFFFF] max-w-lg text-[14px]">
                <div className="text-[13px] font-semibold text-[#171A1F] mb-1">
                  Scam Brake Safety Assistant
                </div>
                <p className="text-[#171A1F] leading-relaxed">
                  {selectedScenario.sampleConversation[0].content}
                </p>
              </div>

              {!customerAnswer ? (
                <div className="space-y-2 pt-1">
                  <div className="text-[14px] text-[#525860]">
                    Select customer response:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setCustomerAnswer(selectedScenario.sampleConversation[1].content);
                        setTimeout(() => setStep(4), 600);
                      }}
                      className="px-3 py-2 bg-[#FFFFFF] text-[#171A1F] hover:bg-[#F6F6F3] text-[13px] font-medium rounded-[6px] transition-colors cursor-pointer"
                    >
                      &quot;{selectedScenario.sampleConversation[1].content}&quot;
                    </button>
                    <button
                      onClick={() => {
                        setCustomerAnswer('I am unsure, I need to check.');
                        setTimeout(() => setStep(4), 600);
                      }}
                      className="px-3 py-2 bg-[#FFFFFF] text-[#525860] hover:text-[#171A1F] hover:bg-[#F6F6F3] text-[13px] font-medium rounded-[6px] transition-colors cursor-pointer"
                    >
                      &quot;I am unsure, I need to check.&quot;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-[6px] bg-[#171A1F] text-white max-w-lg ml-auto text-[14px]">
                  <div className="text-[13px] font-medium opacity-80 mb-1 text-right">
                    Customer
                  </div>
                  <p className="leading-relaxed">
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
                className={`text-[13px] font-semibold ${
                  selectedScenario.expectedOutcome === 'VOID'
                    ? 'text-[#C53030]'
                    : 'text-[#1A7A64]'
                }`}
              >
                PHASE 4: DETERMINISTIC RESOLUTION ({selectedScenario.expectedOutcome})
              </span>
              <h3 className="text-[18px] font-semibold text-[#171A1F] mt-1">
                {selectedScenario.expectedOutcome === 'VOID'
                  ? 'Payment Cancelled: Pre-Capture Void Executed'
                  : 'Payment Verified: Authorization Captured to Merchant'}
              </h3>
            </div>

            <div
              className={`p-4 rounded-[6px] ${
                selectedScenario.expectedOutcome === 'VOID'
                  ? 'bg-[#FDE8E8]'
                  : 'bg-[#EAF4F1]'
              } space-y-2`}
            >
              <div className="flex items-center gap-2">
                {selectedScenario.expectedOutcome === 'VOID' ? (
                  <XCircle size={18} className="text-[#C53030]" />
                ) : (
                  <CheckCircle2 size={18} className="text-[#1A7A64]" />
                )}
                <span
                  className={`font-semibold text-[15px] ${
                    selectedScenario.expectedOutcome === 'VOID'
                      ? 'text-[#C53030]'
                      : 'text-[#1A7A64]'
                  }`}
                >
                  {selectedScenario.expectedOutcome === 'VOID'
                    ? 'Simulated void scenario: $' + selectedScenario.amount.toFixed(2) + ' USD'
                    : 'Simulated capture scenario: $' + selectedScenario.amount.toFixed(2) + ' USD'}
                </span>
              </div>
              <p className="text-[14px] text-[#525860] leading-relaxed">
                {selectedScenario.expectedOutcome === 'VOID'
                  ? 'This local-only simulation shows the void decision path. It does not call PayPal or record a real payment.'
                  : 'This local-only simulation shows the capture decision path. It does not call PayPal or record a real payment.'}
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => resetDemo(selectedScenario)}
              >
                <RefreshCw size={13} />
                <span>Test Another Coercion Scenario</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
