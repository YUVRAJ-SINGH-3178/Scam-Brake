'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { SimulationScenario } from '@/types';
import { RiskBadge } from '@/components/ui/Badge';
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
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F]">
              Simulation Center
            </h1>
            <p className="text-[13px] text-[#525860] mt-1">
              Test PayPal authorization holds, telemetry evaluation, and customer verification workflows.
            </p>
          </div>

          <button
            onClick={() => mockStore.resetState()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[13px] font-medium text-[#525860] hover:text-[#171A1F] rounded-[6px] transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset Ledger to Defaults</span>
          </button>
        </div>

        {/* Live Simulation Alert */}
        {resultPaymentId && (
          <div className="bg-[#EAF4F1] border border-[#1A7A64]/30 rounded-[6px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-[#1A7A64]" />
              <div className="text-[13px]">
                <span className="font-semibold text-[#1A7A64]">Simulation Succeeded:</span>{' '}
                <span className="text-[#171A1F]">
                  New authorization hold registered in ledger (ID: <code className="font-mono text-xs">{resultPaymentId}</code>).
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/merchant/payments/${resultPaymentId}`)}
                className="px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] text-[13px] font-medium text-[#171A1F] rounded-[6px] hover:bg-[#F6F6F3] cursor-pointer"
              >
                Inspect in Ledger
              </button>
              <button
                onClick={() => router.push(`/intervention?paymentId=${resultPaymentId}`)}
                className="px-3 py-1.5 bg-[#171A1F] text-white text-[13px] font-medium rounded-[6px] hover:bg-[#2B303A] cursor-pointer"
              >
                Open Customer Flow
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
              className={`p-5 rounded-[6px] border cursor-pointer transition-colors space-y-3 ${
                selectedScenario.id === scen.id
                  ? 'bg-[#FFFFFF] border-[#171A1F]'
                  : 'bg-[#F6F6F3] border-[#DFE2DF] hover:bg-[#FFFFFF]'
              }`}
            >
              <div className="flex items-center justify-between">
                <code className="font-mono text-[11px] text-[#525860]">{scen.id}</code>
                <RiskBadge level={scen.riskLevel} />
              </div>

              <div>
                <h3 className="font-semibold text-[14px] text-[#171A1F]">{scen.title}</h3>
                <p className="text-[13px] text-[#525860] line-clamp-2 mt-1">
                  {scen.description || scen.shortDescription}
                </p>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-[#DFE2DF] text-[13px]">
                <span className="text-[#525860]">
                  {scen.customerName || (scen.type === 'TAX_OFFICER_SCAM' ? 'Martha Stephenson' : scen.type === 'BANK_IMPERSONATION' ? 'Marcus Vance' : 'Dr. Clara Thorne')}
                </span>
                <span className="font-semibold text-[#171A1F] tabular-nums">
                  <code className="font-mono">${scen.amount.toFixed(2)}</code> USD
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Scenario Execution Panel */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <RiskBadge level={selectedScenario.riskLevel} />
                <span className="text-[12px] text-[#525860]">
                  Target Risk Score: <code className="font-mono">{selectedScenario.expectedRiskScore || (selectedScenario.riskLevel === 'CRITICAL' ? 95 : selectedScenario.riskLevel === 'HIGH' ? 84 : 16)}</code> / 100
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[#171A1F] tracking-tight">{selectedScenario.title}</h2>
              <p className="text-[13px] text-[#525860] mt-1">
                {selectedScenario.description || selectedScenario.shortDescription}
              </p>
            </div>

            <button
              onClick={() => handleRunSimulation(selectedScenario)}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#171A1F] text-white text-[13px] font-medium rounded-[6px] hover:bg-[#2B303A] transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing via PayPal...</span>
                </>
              ) : (
                <>
                  <Play size={13} />
                  <span>Trigger Authorization Hold</span>
                </>
              )}
            </button>
          </div>

          {/* Scenario Details Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px]">
            <div className="space-y-3">
              <h3 className="font-semibold text-[#171A1F] text-[14px]">Mock Parameters</h3>
              <div className="p-4 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#525860]">Customer:</span>
                  <span className="font-medium text-[#171A1F]">
                    {selectedScenario.customerName || (selectedScenario.type === 'TAX_OFFICER_SCAM' ? 'Martha Stephenson' : selectedScenario.type === 'BANK_IMPERSONATION' ? 'Marcus Vance' : 'Dr. Clara Thorne')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#525860]">Item:</span>
                  <span className="text-[#171A1F]">
                    {selectedScenario.itemDescription || selectedScenario.productName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#525860]">Amount:</span>
                  <span className="tabular-nums"><code className="font-mono text-[#171A1F]">${selectedScenario.amount.toFixed(2)}</code> USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#525860]">Expected Flow:</span>
                  <span className="font-medium text-[#171A1F]">
                    {selectedScenario.riskLevel === 'LOW'
                      ? 'Instant Capture (No Hold)'
                      : 'Hold Active (Customer Intervention)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-[#171A1F] text-[14px]">Injected Telemetry</h3>
              <div className="p-4 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] space-y-2">
                {(selectedScenario.riskSignals || selectedScenario.investigationFindings || []).map((sig: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#171A1F] mt-2 shrink-0" />
                    <span className="text-[#171A1F]">{sig}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Architecture Reference */}
          <div className="p-4 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] text-[13px] space-y-1.5 text-[#525860]">
            <div className="font-semibold text-[#171A1F] flex items-center gap-1.5">
              <Cpu size={14} className="text-[#171A1F]" />
              <span>Simulation Mechanics</span>
            </div>
            <p>
              When triggered, Scam Brake calls the internal mock store with realistic PayPal API request payloads. If risk &gt; 30, it creates a 30-minute hold window and seeds an active intervention session. All actions write immutable records to the audit log.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
