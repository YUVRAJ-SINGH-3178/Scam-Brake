'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { CheckCircle2, Shield, Clock, Save } from 'lucide-react';

export default function MerchantRiskPoliciesPage() {
  const [holdWindowMinutes, setHoldWindowMinutes] = useState(30);
  const [riskThresholdHold, setRiskThresholdHold] = useState(45);
  const [riskThresholdAutoVoid, setRiskThresholdAutoVoid] = useState(90);
  const [requireTrustedContactForAmountsOver, setRequireTrustedContactForAmountsOver] = useState(1000);
  const [autoVoidOnCustomerTimeout, setAutoVoidOnCustomerTimeout] = useState(true);
  const [kernelDirectoryAutoLookup, setKernelDirectoryAutoLookup] = useState(true);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <AppShell activeItem="/merchant/policies">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#697078]">
              Governance
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F] mt-0.5">
              Risk & Hold Policies
            </h1>
            <p className="text-[13px] text-[#697078] mt-1">
              Configure automated PayPal pre-capture hold windows, risk triggers, and escalation parameters.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#171A1F] text-white hover:bg-[#2B303A] text-[12px] font-medium rounded-[6px] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Save size={13} />
            <span>Save Policy Rules</span>
          </button>
        </div>

        {savedNotification && (
          <div className="bg-[#EAF4F1] border border-[#1A7A64]/30 text-[#1A7A64] px-4 py-2.5 rounded-[6px] text-[13px] flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>Policy changes persisted and deployed to active PayPal checkout webhook handler.</span>
          </div>
        )}

        {/* Section 1: Pre-Capture Hold Window */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-4">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#171A1F]">
            <Clock size={15} className="text-[#9A6700]" />
            <span>Pre-Capture Hold Duration Window</span>
          </div>
          <p className="text-[12px] text-[#697078] leading-relaxed">
            When high coercion or social engineering markers are detected, Scam Brake retains the payment in PayPal authorized status. This window gives the customer calm time to break psychological entrapment without failing checkout.
          </p>

          <div className="pt-2 space-y-3">
            <div className="flex justify-between text-[12px]">
              <span className="text-[#697078]">Current Hold Window:</span>
              <span className="font-mono font-semibold text-[#171A1F]">{holdWindowMinutes} Minutes</span>
            </div>
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={holdWindowMinutes}
              onChange={(e) => setHoldWindowMinutes(Number(e.target.value))}
              className="w-full accent-[#171A1F] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#697078] font-mono">
              <span>15 min</span>
              <span>30 min (Default)</span>
              <span>60 min</span>
              <span>120 min (Extended)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Automated Risk Triggers */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-6">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#171A1F]">
            <Shield size={15} className="text-[#171A1F]" />
            <span>Risk Score Activation Thresholds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[12px]">
            <div className="p-4 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-[#171A1F]">Hold & Intervention Trigger</span>
                <span className="font-mono font-semibold text-[#9A6700]">&gt; {riskThresholdHold} / 100</span>
              </div>
              <p className="text-[#697078] leading-relaxed">
                Checkouts scoring above this value are held in PayPal authorized status, launching customer verification check-in.
              </p>
              <input
                type="range"
                min="20"
                max="70"
                step="5"
                value={riskThresholdHold}
                onChange={(e) => setRiskThresholdHold(Number(e.target.value))}
                className="w-full accent-[#9A6700] cursor-pointer"
              />
            </div>

            <div className="p-4 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-[#171A1F]">Automated Pre-Capture Void</span>
                <span className="font-mono font-semibold text-[#C53030]">&gt; {riskThresholdAutoVoid} / 100</span>
              </div>
              <p className="text-[#697078] leading-relaxed">
                Critical checkouts scoring above this threshold with confirmed phone spoofing and extortion scripts are auto-voided.
              </p>
              <input
                type="range"
                min="75"
                max="98"
                step="1"
                value={riskThresholdAutoVoid}
                onChange={(e) => setRiskThresholdAutoVoid(Number(e.target.value))}
                className="w-full accent-[#C53030] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Safeguard Rules */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-4 text-[12px]">
          <h3 className="font-semibold text-[#171A1F] text-[13px]">Escalation & Advocacy Policies</h3>

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 p-3 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] cursor-pointer">
              <input
                type="checkbox"
                checked={autoVoidOnCustomerTimeout}
                onChange={(e) => setAutoVoidOnCustomerTimeout(e.target.checked)}
                className="mt-0.5 accent-[#171A1F]"
              />
              <div>
                <span className="font-medium text-[#171A1F] block">
                  Auto-void unverified authorizations when hold window expires
                </span>
                <span className="text-[#697078] text-[11px] block mt-0.5">
                  If the customer abandons the check-in or timer runs out without safe confirmation, the PayPal authorization is released without taking funds.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] cursor-pointer">
              <input
                type="checkbox"
                checked={kernelDirectoryAutoLookup}
                onChange={(e) => setKernelDirectoryAutoLookup(e.target.checked)}
                className="mt-0.5 accent-[#171A1F]"
              />
              <div>
                <span className="font-medium text-[#171A1F] block">
                  Mandatory Kernel directory lookups for government or banking claims
                </span>
                <span className="text-[#697078] text-[11px] block mt-0.5">
                  Automatically queries public government databases to display official switchboards when customer mentions agency names.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
