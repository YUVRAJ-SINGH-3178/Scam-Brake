'use client';

import React from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { ExternalLink } from 'lucide-react';

export default function MerchantIntegrationsPage() {
  const sponsors = mockStore.getSponsors();

  return (
    <AppShell activeItem="/merchant/integrations">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F]">Partner &amp; Sponsor Connectors</h1>
            <p className="text-[13px] text-[#525860] mt-1">Status reflects repository evidence; no live sponsor connection has been verified.</p>
          </div>
          <span className="text-[12px] text-[#784D00] bg-[#FAF2E4] px-2.5 py-1 rounded-[4px] border border-[#784D00]/20 font-medium">
            No live sponsor connections verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sponsor) => (
            <section key={sponsor.id} className="bg-white border border-[#DFE2DF] rounded-[6px] p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-[14px] text-[#171A1F]">{sponsor.name}</h2>
                  <code className="font-mono text-[10px] px-1.5 py-0.5 rounded-[3px] bg-[#FAF2E4] text-[#784D00] border border-[#784D00]/20">
                    {sponsor.status}
                  </code>
                </div>
                <div className="text-[12px] font-medium text-[#525860]">{sponsor.role || sponsor.category}</div>
                <p className="text-[13px] text-[#525860] leading-relaxed">{sponsor.description || sponsor.purpose}</p>
              </div>
              <div className="pt-3 border-t border-[#DFE2DF] flex items-center justify-between text-[12px]">
                <a href={sponsor.docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#525860] hover:text-[#171A1F]">
                  Developer docs <ExternalLink size={12} />
                </a>
                <span className="text-[#525860]">Live test unavailable</span>
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
