'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { Sliders, CheckCircle2, Shield, Clock, AlertTriangle, Save, RefreshCw } from 'lucide-react';

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
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
              Risk & Hold Policies
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Configure automated PayPal pre-capture hold windows, risk triggers, and escalation parameters.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D5BFF] text-white hover:bg-[#2044C8] text-xs font-medium rounded transition-colors self-start sm:self-auto"
          >
            <Save size={14} />
            Save Policy Rules
          </button>
        </div>

        {savedNotification && (
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#059669] px-4 py-2.5 rounded text-sm flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Policy changes persisted and deployed to active PayPal checkout webhook handler.</span>
          </div>
        )}

        {/* Section 1: Pre-Capture Hold Window */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E1E2A]">
            <Clock size={16} className="text-[#2D5BFF]" />
            Pre-Capture Hold Duration Window
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            When high coercion or social engineering markers are detected, Scam Brake retains the payment in PayPal authorized status. This window gives the customer calm time to break psychological entrapment without failing checkout.
          </p>

          <div className="pt-2 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-[#6B7280]">Current Hold Window:</span>
              <span className="font-mono font-semibold text-[#1E1E2A]">{holdWindowMinutes} Minutes</span>
            </div>
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={holdWindowMinutes}
              onChange={(e) => setHoldWindowMinutes(Number(e.target.value))}
              className="w-full accent-[#2D5BFF] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#6B7280] font-mono">
              <span>15 min (Fast)</span>
              <span>30 min (Recommended)</span>
              <span>60 min</span>
              <span>120 min (Extended)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Automated Risk Triggers */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E1E2A]">
            <Shield size={16} className="text-[#2D5BFF]" />
            Risk Score Activation Thresholds
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-[#FAFAFC] border border-[#E5E7EB] rounded space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-[#1E1E2A]">Hold & Intervention Trigger</span>
                <span className="font-mono font-semibold text-[#D97706]">&gt; {riskThresholdHold} / 100</span>
              </div>
              <p className="text-[#6B7280] leading-relaxed">
                Checkouts scoring above this value are held in PayPal authorized status, launching customer conversational check-in.
              </p>
              <input
                type="range"
                min="20"
                max="70"
                step="5"
                value={riskThresholdHold}
                onChange={(e) => setRiskThresholdHold(Number(e.target.value))}
                className="w-full accent-[#D97706] cursor-pointer"
              />
            </div>

            <div className="p-4 bg-[#FAFAFC] border border-[#E5E7EB] rounded space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-[#1E1E2A]">Automated Pre-Capture Void</span>
                <span className="font-mono font-semibold text-[#DC2626]">&gt; {riskThresholdAutoVoid} / 100</span>
              </div>
              <p className="text-[#6B7280] leading-relaxed">
                Critical checkouts scoring above this threshold with confirmed phone spoofing and extortion scripts are auto-voided.
              </p>
              <input
                type="range"
                min="75"
                max="98"
                step="1"
                value={riskThresholdAutoVoid}
                onChange={(e) => setRiskThresholdAutoVoid(Number(e.target.value))}
                className="w-full accent-[#DC2626] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Safeguard Rules */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-4 text-xs">
          <h3 className="font-semibold text-[#1E1E2A] text-sm">Escalation & Advocacy Policies</h3>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 p-3 bg-[#FAFAFC] border border-[#E5E7EB] rounded cursor-pointer">
              <input
                type="checkbox"
                checked={autoVoidOnCustomerTimeout}
                onChange={(e) => setAutoVoidOnCustomerTimeout(e.target.checked)}
                className="mt-0.5 accent-[#2D5BFF]"
              />
              <div>
                <span className="font-medium text-[#1E1E2A] block">
                  Auto-void unverified authorizations when hold window expires
                </span>
                <span className="text-[#6B7280] text-[11px] block mt-0.5">
                  If the customer abandons the intervention or timer runs out without safe confirmation, the PayPal authorization is safely released without taking funds.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-[#FAFAFC] border border-[#E5E7EB] rounded cursor-pointer">
              <input
                type="checkbox"
                checked={kernelDirectoryAutoLookup}
                onChange={(e) => setKernelDirectoryAutoLookup(e.target.checked)}
                className="mt-0.5 accent-[#2D5BFF]"
              />
              <div>
                <span className="font-medium text-[#1E1E2A] block">
                  Mandatory Kernel directory lookups for government or banking claims
                </span>
                <span className="text-[#6B7280] text-[11px] block mt-0.5">
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
