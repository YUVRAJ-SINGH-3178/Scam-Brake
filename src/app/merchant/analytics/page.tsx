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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, ShieldCheck, DollarSign, Clock, Download } from 'lucide-react';

const MONTHLY_PROTECTION_DATA = [
  { month: 'Jun', totalVolume: 12000, fraudVoided: 1800, captured: 10200 },
  { month: 'Jul', totalVolume: 14500, fraudVoided: 2400, captured: 12100 },
  { month: 'Aug', totalVolume: 16800, fraudVoided: 3100, captured: 13700 },
  { month: 'Sep', totalVolume: 15200, fraudVoided: 2900, captured: 12300 },
  { month: 'Oct', totalVolume: 18900, fraudVoided: 4200, captured: 14700 },
  { month: 'Nov', totalVolume: 16349, fraudVoided: 3500, captured: 10649 },
];

const RISK_SCORE_DISTRIBUTION = [
  { bucket: '0-20 (Safe)', count: 48, fill: '#10B981' },
  { bucket: '21-40 (Low)', count: 24, fill: '#3B82F6' },
  { bucket: '41-60 (Medium)', count: 14, fill: '#F59E0B' },
  { bucket: '61-80 (High)', count: 8, fill: '#EA580C' },
  { bucket: '81-100 (Critical)', count: 6, fill: '#DC2626' },
];

const RESOLUTION_TIME_DATA = [
  { interval: '< 2 min', count: 32 },
  { interval: '2-5 min', count: 41 },
  { interval: '5-10 min', count: 18 },
  { interval: '10-20 min', count: 7 },
  { interval: '> 20 min', count: 2 },
];

export default function MerchantAnalyticsPage() {
  const metrics = mockStore.getMetrics();

  return (
    <AppShell activeItem="/merchant/analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
              Analytics & Protection Efficacy
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Operational metrics on pre-capture holds, prevented social engineering losses, and customer conversion.
            </p>
          </div>

          <button
            onClick={() => {
              alert('Exporting analytics report as CSV...');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#FAFAFC] text-xs font-medium text-[#6B7280] rounded transition-colors self-start sm:self-auto"
          >
            <Download size={14} />
            Export Monthly Summary
          </button>
        </div>

        {/* Core KPI Row — Strict Mercury typography: big numbers, clean labels, no vanity colored circle icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded">
            <span className="text-xs text-[#6B7280]">Total Protected Volume</span>
            <div className="font-mono text-2xl font-semibold text-[#1E1E2A] mt-1 tabular-nums">
              ${metrics.totalProtectedVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">Across all protected checkouts</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded">
            <span className="text-xs text-[#6B7280]">Confirmed Fraud Voided</span>
            <div className="font-mono text-2xl font-semibold text-[#DC2626] mt-1 tabular-nums">
              ${metrics.voidedFraudAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#059669] mt-0.5">100% pre-capture, $0 dispute fees</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded">
            <span className="text-xs text-[#6B7280]">Interventions Completed</span>
            <div className="font-mono text-2xl font-semibold text-[#059669] mt-1 tabular-nums">
              {metrics.interventionsCount} Sessions
            </div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">Voluntary customer participation</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded">
            <span className="text-xs text-[#6B7280]">Median Resolution Time</span>
            <div className="font-mono text-2xl font-semibold text-[#2D5BFF] mt-1 tabular-nums">
              {Math.round(metrics.medianInterventionSeconds / 60)} min
            </div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">From auth hold to decision</div>
          </div>
        </div>

        {/* 2-Column Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Protection Volume Trend */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1E1E2A]">
                  Protected Volume: Captured vs Pre-Capture Void
                </h3>
                <p className="text-xs text-[#6B7280]">Monthly dollar volume distribution (USD)</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#2D5BFF]" />
                  <span className="text-[#6B7280]">Captured</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#DC2626]" />
                  <span className="text-[#6B7280]">Voided Fraud</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_PROTECTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="captured"
                    stackId="1"
                    stroke="#2D5BFF"
                    fill="#2D5BFF"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="fraudVoided"
                    stackId="1"
                    stroke="#DC2626"
                    fill="#DC2626"
                    fillOpacity={0.25}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Score Distribution */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1E1E2A]">
                Checkout Risk Score Distribution
              </h3>
              <p className="text-xs text-[#6B7280]">Number of checkouts across risk buckets (Last 30 Days)</p>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RISK_SCORE_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="bucket" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', fontSize: '11px', borderRadius: '4px' }}
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
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1E1E2A]">
              Intervention Resolution Velocity
            </h3>
            <p className="text-xs text-[#6B7280]">
              How quickly customers review their situation and confirm either safe release or pre-capture void.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 text-center text-xs">
            {RESOLUTION_TIME_DATA.map((item, idx) => (
              <div key={idx} className="p-3 bg-[#FAFAFC] border border-[#E5E7EB] rounded">
                <span className="text-[#6B7280]">{item.interval}</span>
                <div className="font-mono text-lg font-semibold text-[#1E1E2A] mt-1">{item.count} orders</div>
                <div className="text-[10px] text-[#6B7280] mt-0.5">
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
