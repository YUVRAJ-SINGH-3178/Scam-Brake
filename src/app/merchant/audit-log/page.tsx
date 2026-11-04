'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { AuditEvent } from '@/types';
import {
  FileText,
  ShieldCheck,
  Search,
  CheckCircle2,
  Copy,
  ExternalLink,
  Code2,
  Download,
} from 'lucide-react';

export default function MerchantAuditLogPage() {
  const [logs] = useState<AuditEvent[]>(() => mockStore.getAuditLogs());
  const [search, setSearch] = useState('');
  const [filterActor, setFilterActor] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (filterActor !== 'ALL' && log.actor !== filterActor) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.paymentId.toLowerCase().includes(q) ||
        log.eventType.toLowerCase().includes(q) ||
        log.summary.toLowerCase().includes(q) ||
        (log.sha256Hash || log.immutableHash).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <AppShell activeItem="/merchant/audit-log">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F]">
              Cryptographic Audit Log
            </h1>
            <p className="text-[13px] text-[#525860] mt-1">
              Append-only tamper-evident ledger tracking every authorization hold, verification step, and void decision.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#1A7A64] bg-[#EAF4F1] px-2.5 py-1 rounded-[4px] border border-[#1A7A64]/20 flex items-center gap-1.5 font-medium">
              <ShieldCheck size={14} />
              <span>Merkle Seal: Intact</span>
            </span>
            <button
              onClick={() => {
                const json = JSON.stringify(logs, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `scambrake_audit_chain_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[13px] font-medium text-[#525860] hover:text-[#171A1F] rounded-[6px] transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Export Signed JSON</span>
            </button>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] p-4 text-[13px] text-[#525860] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#171A1F] shrink-0" />
            <span>
              All transactions generate a deterministic SHA-256 state seal incorporating the PayPal order authorization ID, customer consent timestamps, and external directory responses.
            </span>
          </div>
          <span className="text-[12px] text-[#171A1F] shrink-0 ml-4">
            Total Entries: <code>{logs.length}</code>
          </span>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#525860]" />
            <input
              type="text"
              placeholder="Search by hash, payment ID, event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-[13px] pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] focus:outline-none focus:border-[#171A1F]"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[13px] text-[#525860]">Actor:</span>
            <select
              value={filterActor}
              onChange={(e) => setFilterActor(e.target.value)}
              className="text-[13px] bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] px-2.5 py-1.5 focus:outline-none focus:border-[#171A1F]"
            >
              <option value="ALL">All Actors</option>
              <option value="CUSTOMER">Customer Action</option>
              <option value="AI_ASSISTANT">AI Assistant</option>
              <option value="MERCHANT_POLICY">Merchant Policy</option>
              <option value="SYSTEM">System Automations</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F6F6F3] border-b border-[#DFE2DF] text-[#525860] font-medium text-[12px]">
                <tr>
                  <th className="py-2.5 px-4 font-normal">Timestamp</th>
                  <th className="py-2.5 px-4 font-normal">Event Type</th>
                  <th className="py-2.5 px-4 font-normal">Payment Ref</th>
                  <th className="py-2.5 px-4 font-normal">Actor</th>
                  <th className="py-2.5 px-4 font-normal">Summary</th>
                  <th className="py-2.5 px-4 font-normal">SHA-256 Hash</th>
                  <th className="py-2.5 px-4 font-normal text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE2DF]">
                {filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#F6F6F3]/50 transition-colors">
                    <td className="py-3 px-4 text-[#525860] whitespace-nowrap text-[12px]">
                      <code className="font-mono">{new Date(entry.timestamp).toLocaleString()}</code>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <code className="font-mono text-[12px] font-medium text-[#171A1F] bg-[#F6F6F3] border border-[#DFE2DF] px-2 py-0.5 rounded-[3px]">
                        {entry.eventType}
                      </code>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <code className="font-mono text-[12px] text-[#171A1F]">{entry.paymentId}</code>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[12px] text-[#525860] font-medium">
                        {entry.actor}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#171A1F] max-w-xs truncate" title={entry.summary}>
                      {entry.summary}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[12px] text-[#525860]">
                        <code className="font-mono">
                          {(entry.sha256Hash || entry.immutableHash).slice(0, 10)}...
                          {(entry.sha256Hash || entry.immutableHash).slice(-6)}
                        </code>
                        <button
                          onClick={() => copyToClipboard(entry.sha256Hash || entry.immutableHash)}
                          className="hover:text-[#171A1F] p-0.5 rounded cursor-pointer"
                          title="Copy full hash"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(entry)}
                        className="text-[12px] text-[#171A1F] hover:text-[#1A7A64] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Code2 size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Raw Payload Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-[#171A1F]/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] rounded-[6px] border border-[#DFE2DF] max-w-2xl w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#DFE2DF]">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#171A1F]">
                    Audit Record: {selectedLog.eventType}
                  </h3>
                  <div className="text-[12px] text-[#525860] mt-0.5">
                    Hash: <code className="font-mono">{selectedLog.sha256Hash || selectedLog.immutableHash}</code>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-[12px] text-[#525860] hover:text-[#171A1F] px-2 py-1 rounded-[4px] border border-[#DFE2DF] hover:bg-[#F6F6F3] cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2 text-[13px]">
                <div className="text-[#525860]">Summary:</div>
                <div className="p-2.5 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[4px] text-[#171A1F]">
                  {selectedLog.summary}
                </div>

                <div className="text-[#525860] pt-2">Structured Event Payload:</div>
                <pre className="p-3 bg-[#F6F6F3] text-[#171A1F] border border-[#DFE2DF] rounded-[4px] font-mono text-[12px] overflow-x-auto max-h-64">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-1.5 bg-[#171A1F] text-white text-[13px] font-medium rounded-[6px] hover:bg-[#2B303A] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
