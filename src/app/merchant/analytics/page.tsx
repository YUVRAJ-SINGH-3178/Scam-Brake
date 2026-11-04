'use client';

import React from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { mockStore } from '@/services';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Download } from 'lucide-react';

const MONTHLY_PROTECTION_DATA = [
  { month: 'Jun', totalVolume: 12000, fraudVoided: 1800, captured: 10200 },
  { month: 'Jul', totalVolume: 14500, fraudVoided: 2400, captured: 12100 },
  { month: 'Aug', totalVolume: 16800, fraudVoided: 3100, captured: 13700 },
  { month: 'Sep', totalVolume: 15200, fraudVoided: 2900, captured: 12300 },
  { month: 'Oct', totalVolume: 18900, fraudVoided: 4200, captured: 14700 },
  { month: 'Nov', totalVolume: 16349, fraudVoided: 3500, captured: 10649 },
];

const RISK_SCORE_DISTRIBUTION = [
  { bucket: '0–20 (Safe)', count: 48, fill: '#1A7A64' },
  { bucket: '21–40 (Low)', count: 24, fill: '#2B303A' },
  { bucket: '41–60 (Med)', count: 14, fill: '#9A6700' },
  { bucket: '61–80 (High)', count: 8, fill: '#D97706' },
  { bucket: '81–100 (Crit)', count: 6, fill: '#C53030' },
];

const RESOLUTION_TIME_DATA = [
  { interval: '< 2 min', count: 32 },
  { interval: '2–5 min', count: 41 },
  { interval: '5–10 min', count: 18 },
  { interval: '10–20 min', count: 7 },
  { interval: '> 20 min', count: 2 },
];

export default function MerchantAnalyticsPage() {
  const metrics = mockStore.getMetrics();

  return (
    <AppShell activeItem="/merchant/analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#697078]">
              Reporting
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F] mt-0.5">
              Analytics & Protection Efficacy
            </h1>
            <p className="text-[13px] text-[#697078] mt-1">
              Operational metrics on pre-capture holds, prevented social engineering losses, and customer conversion.
            </p>
          </div>

          <button
            onClick={() => {
              alert('Exporting analytics report as CSV...');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[12px] font-medium text-[#697078] hover:text-[#171A1F] rounded-[6px] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Download size={14} />
            <span>Export Monthly Summary</span>
          </button>
        </div>

        {/* Core Financial Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-[6px] border border-[#DFE2DF] bg-[#F6F6F3]">
          <div>
            <span className="text-[12px] text-[#697078]">Total Protected Volume</span>
            <div className="font-mono text-[22px] font-semibold text-[#171A1F] mt-0.5 tabular-nums">
              ${metrics.totalProtectedVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#697078] mt-0.5">Across all checkouts</div>
          </div>

          <div>
            <span className="text-[12px] text-[#697078]">Confirmed Fraud Voided</span>
            <div className="font-mono text-[22px] font-semibold text-[#C53030] mt-0.5 tabular-nums">
              ${metrics.voidedFraudAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#C53030] mt-0.5 font-medium">100% pre-capture, $0 dispute fees</div>
          </div>

          <div>
            <span className="text-[12px] text-[#697078]">Interventions Completed</span>
            <div className="font-mono text-[22px] font-semibold text-[#1A7A64] mt-0.5 tabular-nums">
              {metrics.interventionsCount} Sessions
            </div>
            <div className="text-[11px] text-[#697078] mt-0.5">Voluntary customer participation</div>
          </div>

          <div>
            <span className="text-[12px] text-[#697078]">Median Resolution Time</span>
            <div className="font-mono text-[22px] font-semibold text-[#171A1F] mt-0.5 tabular-nums">
              {Math.round(metrics.medianInterventionSeconds / 60)} min
            </div>
            <div className="text-[11px] text-[#697078] mt-0.5">From auth hold to decision</div>
          </div>
        </div>

        {/* 2-Column Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Protection Volume Trend */}
          <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold text-[#171A1F]">
                  Volume: Captured vs. Pre-Capture Void
                </h3>
                <p className="text-[11px] text-[#697078]">Monthly dollar volume distribution (USD)</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#1A7A64]" />
                  <span className="text-[#697078]">Captured</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#C53030]" />
                  <span className="text-[#697078]">Voided Fraud</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_PROTECTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE2DF" />
                  <XAxis dataKey="month" stroke="#697078" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#697078"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DFE2DF', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="captured"
                    stackId="1"
                    stroke="#1A7A64"
                    fill="#1A7A64"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="fraudVoided"
                    stackId="1"
                    stroke="#C53030"
                    fill="#C53030"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Score Distribution */}
          <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[#171A1F]">
                Risk Score Distribution
              </h3>
              <p className="text-[11px] text-[#697078]">Number of checkouts across risk buckets (Last 30 Days)</p>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RISK_SCORE_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE2DF" />
                  <XAxis dataKey="bucket" stroke="#697078" fontSize={11} tickLine={false} />
                  <YAxis stroke="#697078" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DFE2DF', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {RISK_SCORE_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Secondary Row: Resolution Velocities */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 space-y-4">
          <div>
            <h3 className="text-[13px] font-semibold text-[#171A1F]">
              Intervention Resolution Velocity
            </h3>
            <p className="text-[11px] text-[#697078]">
              How quickly customers review their situation and confirm either safe release or pre-capture void.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1 text-center text-[12px]">
            {RESOLUTION_TIME_DATA.map((item, idx) => (
              <div key={idx} className="p-3 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[4px]">
                <span className="text-[#697078]">{item.interval}</span>
                <div className="font-mono text-[16px] font-semibold text-[#171A1F] mt-1 tabular-nums">{item.count} orders</div>
                <div className="text-[10px] text-[#697078] mt-0.5">
                  {Math.round((item.count / 100) * 100)}% of holds
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
