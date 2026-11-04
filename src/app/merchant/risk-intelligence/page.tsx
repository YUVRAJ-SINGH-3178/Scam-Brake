'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  Search,
  Database,
  Terminal,
  Activity,
  AlertTriangle,
  Flame,
  FileCode,
  CheckCircle,
  ExternalLink,
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
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
              Risk & Social Engineering Intelligence
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Real-time threat taxonomy and behavioral pattern indices powered by Channel3 and Elastic.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#059669] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/20 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Elastic Pattern Engine: Connected
            </span>
          </div>
        </div>

        {/* Intelligence Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded">
            <div className="text-xs text-[#6B7280]">Classified Scam Types</div>
            <div className="font-mono text-2xl font-semibold text-[#1E1E2A] mt-1">18 Clusters</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">Updated daily from global feeds</div>
          </div>
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded">
            <div className="text-xs text-[#6B7280]">Coercion Accuracy</div>
            <div className="font-mono text-2xl font-semibold text-[#059669] mt-1">98.4%</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">&lt;0.2% false positive holds</div>
          </div>
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded">
            <div className="text-xs text-[#6B7280]">Average Hold Window</div>
            <div className="font-mono text-2xl font-semibold text-[#2D5BFF] mt-1">8.5 min</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">To customer resolution</div>
          </div>
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded">
            <div className="text-xs text-[#6B7280]">Dispute Chargebacks</div>
            <div className="font-mono text-2xl font-semibold text-[#059669] mt-1">$0.00</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">Pre-capture voids incur zero fees</div>
          </div>
        </div>

        {/* 2-Column Taxonomy Explorer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List of Threat Categories */}
          <div className="md:col-span-1 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search threat schemes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded focus:outline-hidden focus:border-[#2D5BFF]"
              />
            </div>

            <div className="space-y-2">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedThreat(item)}
                  className={`w-full text-left p-3.5 rounded border transition-colors ${
                    selectedThreat.id === item.id
                      ? 'bg-[#FFFFFF] border-[#2D5BFF] shadow-xs'
                      : 'bg-[#FAFAFC] border-[#E5E7EB] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-[#6B7280]">{item.id}</span>
                    <Badge variant={item.severity} />
                  </div>
                  <div className="font-medium text-xs text-[#1E1E2A] line-clamp-1">{item.name}</div>
                  <div className="text-[11px] text-[#6B7280] mt-1 flex justify-between">
                    <span>{item.frequency}</span>
                    <span className="text-[#059669] font-medium">Prevented {item.avgLossPrevented}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Deep Threat Detail View */}
          <div className="md:col-span-2 bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-6">
            <div className="pb-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-[#6B7280]">{selectedThreat.id}</span>
                  <Badge variant={selectedThreat.severity} />
                  <span className="text-xs text-[#6B7280] font-mono">{selectedThreat.category}</span>
                </div>
                <h2 className="text-xl font-semibold text-[#1E1E2A]">{selectedThreat.name}</h2>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#6B7280] block">Avg Loss Prevented</span>
                <span className="font-mono text-xl font-semibold text-[#059669]">
                  {selectedThreat.avgLossPrevented}
                </span>
              </div>
            </div>

            {/* Scheme Narrative */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#6B7280]">
                Threat Mechanism
              </h3>
              <p className="text-xs text-[#1E1E2A] leading-relaxed bg-[#FAFAFC] p-3.5 rounded border border-[#E5E7EB]">
                {selectedThreat.description}
              </p>
            </div>

            {/* Key Indicators */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#6B7280]">
                Behavioral & Technical Indicators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedThreat.keyIndicators.map((ind, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-[#FAFAFC] rounded border border-[#E5E7EB]">
                    <AlertTriangle size={14} className="text-[#D97706] shrink-0 mt-0.5" />
                    <span className="text-[#1E1E2A]">{ind}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verbatim Script Phrases */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#6B7280]">
                Observed Extortion Script Quotes
              </h3>
              <div className="space-y-1.5">
                {selectedThreat.sampleScriptPhrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-[#FEF2F2]/60 border border-[#DC2626]/20 rounded text-xs text-[#991B1B] font-mono italic"
                  >
                    {phrase}
                  </div>
                ))}
              </div>
            </div>

            {/* Scam Brake Countermeasure */}
            <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
              <h3 className="text-xs font-semibold text-[#059669] flex items-center gap-1.5">
                <CheckCircle size={14} />
                Scam Brake Protocol Countermeasure
              </h3>
              <p className="text-xs text-[#1E1E2A] leading-relaxed">
                {selectedThreat.countermeasure}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
