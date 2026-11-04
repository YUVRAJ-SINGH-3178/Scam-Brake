'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { SponsorIntegration } from '@/types';
import {
  Plug,
  CheckCircle2,
  ExternalLink,
  Send,
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
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F]">
              Partner & Sponsor Connectors
            </h1>
            <p className="text-[13px] text-[#525860] mt-1">
              Active technology connectors powering Scam Brake&apos;s pre-capture authorization protection architecture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#1A7A64] bg-[#EAF4F1] px-2.5 py-1 rounded-[4px] border border-[#1A7A64]/20 flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={14} />
              <span>11 / 11 Services Operational</span>
            </span>
          </div>
        </div>

        {testSuccess && (
          <div className="bg-[#EAF4F1] border border-[#1A7A64]/30 text-[#1A7A64] px-4 py-2.5 rounded-[6px] text-[13px] flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{testSuccess}</span>
          </div>
        )}

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((s) => (
            <div
              key={s.id}
              className="bg-[#FFFFFF] border border-[#DFE2DF] hover:border-[#171A1F]/30 rounded-[6px] p-5 flex flex-col justify-between transition-colors space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[14px] text-[#171A1F]">{s.name}</span>
                  <code
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded-[3px] font-medium ${
                      s.status === 'CONNECTED'
                        ? 'bg-[#EAF4F1] text-[#1A7A64] border border-[#1A7A64]/20'
                        : 'bg-[#FAF2E4] text-[#784D00] border border-[#784D00]/20'
                    }`}
                  >
                    {s.status}
                  </code>
                </div>

                <div className="text-[12px] font-medium text-[#525860]">{s.role || s.category}</div>
                <p className="text-[13px] text-[#525860] leading-relaxed">{s.description || s.purpose}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#DFE2DF]">
                <div className="flex items-center justify-between text-[12px] text-[#525860]">
                  <span>Telemetry Latency</span>
                  <span className="text-[#171A1F] font-medium tabular-nums"><code className="font-mono">{s.latencyMs || 18}ms</code></span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <a
                    href={s.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] text-[#525860] hover:text-[#171A1F]"
                  >
                    <span>Developer Docs</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    onClick={() => handleTestWebhook(s.id, s.name)}
                    disabled={testingId === s.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F6F6F3] border border-[#DFE2DF] hover:bg-[#FFFFFF] text-[12px] font-medium text-[#171A1F] rounded-[4px] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {testingId === s.id ? (
                      <>
                        <div className="w-2.5 h-2.5 border border-[#171A1F] border-t-transparent rounded-full animate-spin" />
                        <span>Pinging...</span>
                      </>
                    ) : (
                      <>
                        <Send size={12} />
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
