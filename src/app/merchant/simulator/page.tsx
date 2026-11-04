'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { SimulationScenario } from '@/types';
import { Badge } from '@/components/ui/Badge';
import {
  Play,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function MerchantSimulatorPage() {
  const router = useRouter();
  const scenarios = mockStore.getSimulationScenarios();

  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(scenarios[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [resultPaymentId, setResultPaymentId] = useState<string | null>(null);

  const handleRunSimulation = (scenario: SimulationScenario) => {
    setIsSimulating(true);
    setResultPaymentId(null);

    setTimeout(() => {
      const payment = mockStore.createPaymentFromScenario(scenario.id);
      setIsSimulating(false);
      if (payment) {
        setResultPaymentId(payment.id);
      }
    }, 800);
  };

  return (
    <AppShell activeItem="/merchant/simulator">
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
              Scenario Simulation Center
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Test PayPal authorization holds, telemetry evaluation, and AI customer verification workflows.
            </p>
          </div>

          <button
            onClick={() => mockStore.resetState()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#FAFAFC] text-xs font-medium text-[#6B7280] rounded transition-colors"
          >
            <RotateCcw size={14} />
            Reset Ledger to Defaults
          </button>
        </div>

        {/* Live Simulation Alert */}
        {resultPaymentId && (
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-[#059669]" />
              <div className="text-xs">
                <span className="font-semibold text-[#059669]">Simulation Succeeded:</span>{' '}
                <span className="text-[#1E1E2A]">
                  New authorization hold registered in ledger (ID: {resultPaymentId}).
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/merchant/payments/${resultPaymentId}`)}
                className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] text-xs font-medium text-[#1E1E2A] rounded hover:bg-[#FAFAFC]"
              >
                Inspect in Merchant Ledger
              </button>
              <button
                onClick={() => router.push(`/intervention?paymentId=${resultPaymentId}`)}
                className="px-3 py-1.5 bg-[#2D5BFF] text-white text-xs font-medium rounded hover:bg-[#2044C8]"
              >
                Test Customer Safety Flow
              </button>
            </div>
          </div>
        )}

        {/* Scenario Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scen) => (
            <div
              key={scen.id}
              onClick={() => setSelectedScenario(scen)}
              className={`p-5 rounded border cursor-pointer transition-colors space-y-3 ${
                selectedScenario.id === scen.id
                  ? 'bg-[#FFFFFF] border-[#2D5BFF] shadow-xs'
                  : 'bg-[#FAFAFC] border-[#E5E7EB] hover:bg-[#FFFFFF]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#6B7280]">{scen.id}</span>
                <Badge variant={scen.riskLevel} />
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1E1E2A]">{scen.title}</h3>
                <p className="text-xs text-[#6B7280] line-clamp-2 mt-1">
                  {scen.description || scen.shortDescription}
                </p>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-[#E5E7EB] text-xs">
                <span className="text-[#6B7280]">
                  {scen.customerName || (scen.type === 'TAX_OFFICER_SCAM' ? 'Martha Stephenson' : scen.type === 'BANK_IMPERSONATION' ? 'Marcus Vance' : 'Dr. Clara Thorne')}
                </span>
                <span className="font-mono font-semibold text-[#1E1E2A]">
                  ${scen.amount.toFixed(2)} USD
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Scenario Execution Panel */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={selectedScenario.riskLevel} />
                <span className="text-xs font-mono text-[#6B7280]">
                  Target Risk Score: {selectedScenario.expectedRiskScore || (selectedScenario.riskLevel === 'CRITICAL' ? 95 : selectedScenario.riskLevel === 'HIGH' ? 84 : 16)} / 100
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[#1E1E2A]">{selectedScenario.title}</h2>
              <p className="text-xs text-[#6B7280] mt-1">
                {selectedScenario.description || selectedScenario.shortDescription}
              </p>
            </div>

            <button
              onClick={() => handleRunSimulation(selectedScenario)}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D5BFF] text-white text-xs font-medium rounded hover:bg-[#2044C8] transition-colors disabled:opacity-50 shrink-0"
            >
              {isSimulating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing via PayPal...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Trigger PayPal Authorization</span>
                </>
              )}
            </button>
          </div>

          {/* Scenario Details Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <h3 className="font-semibold text-[#1E1E2A]">Mock Checkout Parameters</h3>
              <div className="p-4 bg-[#FAFAFC] border border-[#E5E7EB] rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Simulated Customer:</span>
                  <span className="font-medium text-[#1E1E2A]">
                    {selectedScenario.customerName || (selectedScenario.type === 'TAX_OFFICER_SCAM' ? 'Martha Stephenson' : selectedScenario.type === 'BANK_IMPERSONATION' ? 'Marcus Vance' : 'Dr. Clara Thorne')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Item Description:</span>
                  <span className="text-[#1E1E2A]">
                    {selectedScenario.itemDescription || selectedScenario.productName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Order Amount:</span>
                  <span className="font-mono text-[#1E1E2A]">${selectedScenario.amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Expected Authorization Flow:</span>
                  <span className="font-medium text-[#2D5BFF]">
                    {selectedScenario.riskLevel === 'LOW'
                      ? 'Instant Capture (No Hold)'
                      : 'Hold Active (Customer Intervention)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-[#1E1E2A]">Injected Telemetry Signals</h3>
              <div className="p-4 bg-[#FAFAFC] border border-[#E5E7EB] rounded space-y-2">
                {(selectedScenario.riskSignals || selectedScenario.investigationFindings || []).map((sig: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D5BFF] mt-1.5 shrink-0" />
                    <span className="text-[#1E1E2A]">{sig}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Architecture Reference */}
          <div className="p-4 bg-[#FAFAFC] border border-[#E5E7EB] rounded text-xs space-y-2 text-[#6B7280]">
            <div className="font-semibold text-[#1E1E2A] flex items-center gap-1.5">
              <Cpu size={14} className="text-[#2D5BFF]" />
              Simulation Mechanics
            </div>
            <p>
              When triggered, Scam Brake calls the internal mock store with realistic PayPal API request payloads. If risk &gt; 30, it creates a 30-minute hold window and seeds an active AI intervention session. All actions write immutable records to the audit log.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
