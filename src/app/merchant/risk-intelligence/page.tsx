'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { RiskBadge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  Search,
  Database,
  Terminal,
  Activity,
  AlertTriangle,
  FileCode,
  CheckCircle,
} from 'lucide-react';

interface ThreatTaxonomyItem {
  id: string;
  name: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  frequency: string;
  avgLossPrevented: string;
  description: string;
  keyIndicators: string[];
  sampleScriptPhrases: string[];
  countermeasure: string;
}

const THREAT_TAXONOMY: ThreatTaxonomyItem[] = [
  {
    id: 'THREAT-01',
    name: 'Government Impersonation & Arrest Threat',
    category: 'IMPERSONATION',
    severity: 'CRITICAL',
    frequency: '34% of high-risk holds',
    avgLossPrevented: '$2,150',
    description:
      'Impersonating the IRS, DEA, or local sheriff claiming arrest warrants, unpaid back-taxes, or suspicious bank activity. Scammers coerce victims into purchasing digital cards or money orders under threat of arrest.',
    keyIndicators: [
      'Call spoofing federal agencies or law enforcement',
      'Active voice call during checkout process',
      'Extreme urgency demands ("within 45 minutes")',
      'Strict instructions not to tell retail clerks or family',
    ],
    sampleScriptPhrases: [
      '"Do not disconnect this call or federal marshals will arrive."',
      '"The local clerk cannot know this is for federal settlement."',
      '"Purchase PayPal digital vouchers immediately to clear your tax lien."',
    ],
    countermeasure:
      'Scam Brake pauses capture, opens calm inquiry, triggers Kernel IRS switchboard check, and prompts trusted contact notice.',
  },
  {
    id: 'THREAT-02',
    name: 'Bank Fraud Department Spoofing',
    category: 'IMPERSONATION',
    severity: 'CRITICAL',
    frequency: '28% of high-risk holds',
    avgLossPrevented: '$3,800',
    description:
      'Scammers send fake SMS alerts warning of unauthorized $1,000+ charges, then call posing as fraud investigators instructing victims to "safeguard funds" by transferring or authorizing via PayPal.',
    keyIndicators: [
      'Preceded by urgent SMS regarding fraudulent transactions',
      'Caller ID spoofed to match regional bank customer service',
      'Request to move money to a "secure safety vault"',
      'High transaction value ($1,000 to $4,500)',
    ],
    sampleScriptPhrases: [
      '"Your checking account has a pending transfer to Russia; we must reverse it now."',
      '"Approve this PayPal hold to reverse the compromised wire."',
      '"We are sending you a 6-digit confirmation code; read it to me."',
    ],
    countermeasure:
      'Scam Brake prompts customer to independently hang up and call the physical number on the back of their debit card.',
  },
  {
    id: 'THREAT-03',
    name: 'Remote Access Tech Support Coercion',
    category: 'REMOTE_ACCESS',
    severity: 'HIGH',
    frequency: '22% of high-risk holds',
    avgLossPrevented: '$1,400',
    description:
      'Pop-up warning claiming "Trojan Virus Detected". Victim calls fake Microsoft/Apple support, allows remote desktop access (AnyDesk, TeamViewer), and scammer fakes a bank error.',
    keyIndicators: [
      'Full-screen unclosable browser alert with audio warning',
      'Remote desktop tools (AnyDesk, UltraViewer) running on device',
      'Scammer inspects online banking element and edits DOM to fake accidental deposit',
      'Demands victim return the "excess money" via digital store checkout',
    ],
    sampleScriptPhrases: [
      '"We refunded you $40,000 instead of $400, my job is on the line!"',
      '"Go to PayPal and purchase merchant gift cards to refund the difference."',
      '"Do not refresh the bank page."',
    ],
    countermeasure:
      'Scam Brake detects active remote desktop indicators, displays system isolation guidance, and holds payment authorization.',
  },
  {
    id: 'THREAT-04',
    name: 'Grandparent / Family Urgent Bail Scam',
    category: 'URGENCY_THREAT',
    severity: 'HIGH',
    frequency: '11% of high-risk holds',
    avgLossPrevented: '$2,800',
    description:
      'AI voice clone or distraught caller pretending to be grandchild in an automobile accident or jail out of state, begging senior victim for emergency PayPal funds before court.',
    keyIndicators: [
      'Elderly account demographic with suddenly elevated amount',
      'Plea for secrecy: "Please don\'t tell Mom or Dad"',
      'Extreme emotional distress and short deadline',
    ],
    sampleScriptPhrases: [
      '"Grandma, I had an accident and they put me in jail, you are the only one who can help."',
      '"The public defender says I need $2,500 bail before 1:00 PM."',
    ],
    countermeasure:
      'Scam Brake immediately encourages direct phone contact with family members and enables one-click trusted contact outreach.',
  },
  {
    id: 'THREAT-05',
    name: 'Gift Card & Pre-Paid Digital Code Diversion',
    category: 'UNUSUAL_GIFT_CARD',
    severity: 'MEDIUM',
    frequency: '5% of high-risk holds',
    avgLossPrevented: '$850',
    description:
      'Coercion directing victims to purchase high-denomination digital gift cards (Apple, Google Play, Steam) under pretext of payment for utility bills or prize delivery.',
    keyIndicators: [
      'Multiple gift card items in cart ($500 x 3)',
      'First-time purchase of digital currency on merchant account',
      'No physical delivery address required',
    ],
    sampleScriptPhrases: [
      '"The power company now accepts electronic vouchers for reconnection."',
      '"Read the 16-digit pin code slowly as soon as PayPal clears."',
    ],
    countermeasure:
      'Educational warning explaining that legitimate utility companies and government agencies never accept gift cards.',
  },
];

export default function MerchantRiskIntelligencePage() {
  const [selectedThreat, setSelectedThreat] = useState<ThreatTaxonomyItem>(THREAT_TAXONOMY[0]);
  const [search, setSearch] = useState('');

  const filtered = THREAT_TAXONOMY.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell activeItem="/merchant/risk-intelligence">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F]">
              Risk & Threat Taxonomy
            </h1>
            <p className="text-[13px] text-[#525860] mt-1">
              Real-time threat taxonomy and behavioral pattern indices for pre-capture hold decisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#1A7A64] bg-[#EAF4F1] px-2.5 py-1 rounded-[4px] border border-[#1A7A64]/20 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#1A7A64]" />
              Pattern Engine: Active
            </span>
          </div>
        </div>

        {/* Intelligence Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-[6px] border border-[#DFE2DF] bg-[#F6F6F3]">
          <div>
            <div className="text-[13px] text-[#525860]">Classified Scam Types</div>
            <div className="text-[22px] font-semibold text-[#171A1F] mt-0.5"><code>18 Clusters</code></div>
            <div className="text-[12px] text-[#525860] mt-0.5">Updated daily from global feeds</div>
          </div>
          <div>
            <div className="text-[13px] text-[#525860]">Coercion Accuracy</div>
            <div className="text-[22px] font-semibold text-[#1A7A64] mt-0.5"><code>98.4%</code></div>
            <div className="text-[12px] text-[#1A7A64] mt-0.5">&lt;0.2% false positive holds</div>
          </div>
          <div>
            <div className="text-[13px] text-[#525860]">Average Hold Window</div>
            <div className="text-[22px] font-semibold text-[#171A1F] mt-0.5"><code>8.5 min</code></div>
            <div className="text-[12px] text-[#525860] mt-0.5">To customer resolution</div>
          </div>
          <div>
            <div className="text-[13px] text-[#525860]">Dispute Chargebacks</div>
            <div className="text-[22px] font-semibold text-[#1A7A64] mt-0.5"><code>$0.00</code></div>
            <div className="text-[12px] text-[#1A7A64] mt-0.5">Pre-capture voids incur zero fees</div>
          </div>
        </div>

        {/* 2-Column Taxonomy Explorer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List of Threat Categories */}
          <div className="md:col-span-1 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#525860]" />
              <input
                type="text"
                placeholder="Search threat schemes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-[13px] pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] focus:outline-none focus:border-[#171A1F]"
              />
            </div>

            <div className="space-y-2">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedThreat(item)}
                  className={`w-full text-left p-3.5 rounded-[6px] border transition-colors cursor-pointer ${
                    selectedThreat.id === item.id
                      ? 'bg-[#FFFFFF] border-[#171A1F]'
                      : 'bg-[#F6F6F3] border-[#DFE2DF] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <code className="font-mono text-[11px] text-[#525860]">{item.id}</code>
                    <code className="font-mono text-[11px] px-1.5 py-0.5 rounded-[3px] bg-[#FAF2E4] text-[#784D00] border border-[#784D00]/20">
                      {item.severity}
                    </code>
                  </div>
                  <div className="font-medium text-[13px] text-[#171A1F] line-clamp-1">{item.name}</div>
                  <div className="text-[12px] text-[#525860] mt-1 flex justify-between">
                    <span>{item.frequency}</span>
                    <span className="text-[#1A7A64] font-medium">Prevented {item.avgLossPrevented}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Deep Threat Detail View */}
          <div className="md:col-span-2 bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-6">
            <div className="pb-4 border-b border-[#DFE2DF] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <code className="font-mono text-[11px] text-[#525860]">{selectedThreat.id}</code>
                  <code className="font-mono text-[11px] px-1.5 py-0.5 rounded-[3px] bg-[#FAF2E4] text-[#784D00] border border-[#784D00]/20">
                    {selectedThreat.severity}
                  </code>
                  <span className="text-[12px] text-[#525860]">{selectedThreat.category}</span>
                </div>
                <h2 className="text-xl font-semibold text-[#171A1F] tracking-tight">{selectedThreat.name}</h2>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[12px] text-[#525860] block">Avg Loss Prevented</span>
                <div className="text-xl font-semibold text-[#1A7A64] tabular-nums">
                  <code className="font-mono">{selectedThreat.avgLossPrevented}</code>
                </div>
              </div>
            </div>

            {/* Scheme Narrative */}
            <div className="space-y-2">
              <h3 className="text-[13px] font-medium text-[#525860]">
                Threat mechanism
              </h3>
              <p className="text-[13px] text-[#171A1F] leading-relaxed bg-[#F6F6F3] p-3.5 rounded-[6px] border border-[#DFE2DF]">
                {selectedThreat.description}
              </p>
            </div>

            {/* Key Indicators */}
            <div className="space-y-2">
              <h3 className="text-[13px] font-medium text-[#525860]">
                Behavioral & technical indicators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                {selectedThreat.keyIndicators.map((ind, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-[#F6F6F3] rounded-[4px] border border-[#DFE2DF]">
                    <AlertTriangle size={14} className="text-[#784D00] shrink-0 mt-0.5" />
                    <span className="text-[#171A1F]">{ind}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verbatim Script Phrases */}
            <div className="space-y-2">
              <h3 className="text-[13px] font-medium text-[#525860]">
                Observed extortion script quotes
              </h3>
              <div className="space-y-1.5">
                {selectedThreat.sampleScriptPhrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-[#FDE8E8] border border-[#C53030]/20 rounded-[4px] text-[13px] text-[#C53030] italic"
                  >
                    {phrase}
                  </div>
                ))}
              </div>
            </div>

            {/* Countermeasure */}
            <div className="space-y-2 pt-2 border-t border-[#DFE2DF]">
              <h3 className="text-[13px] font-semibold text-[#1A7A64] flex items-center gap-1.5">
                <CheckCircle size={15} />
                <span>Scam Brake Protocol Countermeasure</span>
              </h3>
              <p className="text-[13px] text-[#171A1F] leading-relaxed">
                {selectedThreat.countermeasure}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
