'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { SponsorIntegration } from '@/types';
import {
  Plug,
  CheckCircle2,
  ExternalLink,
  Activity,
  Send,
  RefreshCw,
  Cpu,
  Layers,
  Shield,
  Search,
} from 'lucide-react';

export default function MerchantIntegrationsPage() {
  const sponsors = mockStore.getSponsors();
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  const handleTestWebhook = (id: string, name: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      setTestSuccess(`Webhook test for ${name} succeeded with HTTP 200 OK.`);
      setTimeout(() => setTestSuccess(null), 3000);
    }, 700);
  };

  return (
    <AppShell activeItem="/merchant/integrations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
              Partner & Sponsor Integrations
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Active technology connectors powering Scam Brake's pre-capture authorization protection architecture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#059669] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/20 flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={13} />
              11 / 11 Services Operational
            </span>
          </div>
        </div>

        {testSuccess && (
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#059669] px-4 py-2.5 rounded text-sm flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{testSuccess}</span>
          </div>
        )}

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((s) => (
            <div
              key={s.id}
              className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#D1D5DB] rounded p-5 flex flex-col justify-between transition-colors space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#1E1E2A]">{s.name}</span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-medium ${
                      s.status === 'CONNECTED'
                        ? 'bg-[#10B981]/10 text-[#059669] border border-[#10B981]/20'
                        : 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="font-mono text-[11px] text-[#2D5BFF]">{s.role || s.category}</div>
                <p className="text-xs text-[#6B7280] leading-relaxed">{s.description || s.purpose}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span>Telemetry Latency</span>
                  <span className="font-mono text-[#1E1E2A] font-medium">{s.latencyMs || 18}ms</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <a
                    href={s.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#6B7280] hover:text-[#1E1E2A]"
                  >
                    <span>Developer Docs</span>
                    <ExternalLink size={11} />
                  </a>

                  <button
                    onClick={() => handleTestWebhook(s.id, s.name)}
                    disabled={testingId === s.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAFAFC] border border-[#E5E7EB] hover:bg-[#FFFFFF] text-[11px] font-medium text-[#1E1E2A] rounded transition-colors disabled:opacity-50"
                  >
                    {testingId === s.id ? (
                      <>
                        <div className="w-2.5 h-2.5 border border-[#2D5BFF] border-t-transparent rounded-full animate-spin" />
                        <span>Pinging...</span>
                      </>
                    ) : (
                      <>
                        <Send size={11} />
                        <span>Ping Webhook</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
