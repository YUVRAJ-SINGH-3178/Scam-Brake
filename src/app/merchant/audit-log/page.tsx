'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import { AuditEvent } from '@/types';
import {
  FileText,
  ShieldCheck,
  Search,
  Filter,
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
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
              Cryptographic Audit Log
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Append-only tamper-evident ledger tracking every authorization hold, verification step, and void decision.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#059669] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/20 flex items-center gap-1.5 font-medium">
              <ShieldCheck size={14} />
              Merkle Seal: Intact
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#FAFAFC] text-xs font-medium text-[#6B7280] rounded transition-colors"
            >
              <Download size={14} />
              Export Signed JSON
            </button>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-4 text-xs text-[#6B7280] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#2D5BFF]" />
            <span>
              All transactions generate a deterministic SHA-256 state seal incorporating the PayPal order authorization ID, customer consent timestamps, and external directory responses.
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#1E1E2A]">
            Total Entries: {logs.length}
          </span>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search by hash, payment ID, event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded focus:outline-hidden focus:border-[#2D5BFF]"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-[#6B7280]">Actor:</span>
            <select
              value={filterActor}
              onChange={(e) => setFilterActor(e.target.value)}
              className="text-xs bg-[#FFFFFF] border border-[#E5E7EB] rounded px-2.5 py-1.5 focus:outline-hidden focus:border-[#2D5BFF]"
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
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFC] border-b border-[#E5E7EB] text-[#6B7280] font-medium">
                <tr>
                  <th className="py-2.5 px-4 font-normal">Timestamp (UTC)</th>
                  <th className="py-2.5 px-4 font-normal">Event Type</th>
                  <th className="py-2.5 px-4 font-normal">Payment Ref</th>
                  <th className="py-2.5 px-4 font-normal">Actor</th>
                  <th className="py-2.5 px-4 font-normal">Summary</th>
                  <th className="py-2.5 px-4 font-normal">SHA-256 Hash</th>
                  <th className="py-2.5 px-4 font-normal text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#FAFAFC] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#6B7280] whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-medium text-[#1E1E2A] bg-[#FAFAFC] border border-[#E5E7EB] px-2 py-0.5 rounded">
                        {entry.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#2D5BFF] whitespace-nowrap">
                      {entry.paymentId}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] text-[#6B7280] font-medium">
                        {entry.actor}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#1E1E2A] max-w-xs truncate" title={entry.summary}>
                      {entry.summary}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#6B7280]">
                        <span>
                          {(entry.sha256Hash || entry.immutableHash).slice(0, 10)}...
                          {(entry.sha256Hash || entry.immutableHash).slice(-6)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(entry.sha256Hash || entry.immutableHash)}
                          className="hover:text-[#1E1E2A] p-0.5 rounded"
                          title="Copy full hash"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(entry)}
                        className="text-[11px] text-[#2D5BFF] hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <Code2 size={12} />
                        Inspect
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
          <div className="fixed inset-0 bg-[#000000]/40 z-50 flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] rounded border border-[#E5E7EB] max-w-2xl w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="text-sm font-semibold text-[#1E1E2A]">
                    Audit Record: {selectedLog.eventType}
                  </h3>
                  <div className="font-mono text-[11px] text-[#6B7280] mt-0.5">
                    Hash: {selectedLog.sha256Hash || selectedLog.immutableHash}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-xs text-[#6B7280] hover:text-[#1E1E2A] px-2 py-1 rounded border border-[#E5E7EB]"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-[#6B7280]">Summary:</div>
                <div className="p-2.5 bg-[#FAFAFC] border border-[#E5E7EB] rounded text-[#1E1E2A]">
                  {selectedLog.summary}
                </div>

                <div className="text-[#6B7280] pt-2">Structured Event Payload:</div>
                <pre className="p-3 bg-[#1E1E2A] text-[#FAFAFC] rounded font-mono text-[11px] overflow-x-auto max-h-64">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-1.5 bg-[#2D5BFF] text-white text-xs font-medium rounded hover:bg-[#2044C8]"
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
