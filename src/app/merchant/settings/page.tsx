'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { Key, Bell, CheckCircle2, Copy, Save, Globe } from 'lucide-react';

export default function MerchantSettingsPage() {
  const [merchantName, setMerchantName] = useState('Apex Digital & Hardware, Inc.');
  const [contactEmail, setContactEmail] = useState('security-ops@apexdigital.com');
  const [webhookUrl, setWebhookUrl] = useState('https://api.apexdigital.com/webhooks/scambrake');
  const [apiKey] = useState('sb_live_99a81f3d4410982bc194a0');
  const [copiedKey, setCopiedKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AppShell activeItem="/merchant/settings">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#DFE2DF]">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#697078]">
              Configuration
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A1F] mt-0.5">
              Account & Credentials
            </h1>
            <p className="text-[13px] text-[#697078] mt-1">
              Manage merchant organization credentials, PayPal partner credentials, and event webhook endpoints.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#171A1F] text-white hover:bg-[#2B303A] text-[12px] font-medium rounded-[6px] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Save size={13} />
            <span>Save Settings</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-[#EAF4F1] border border-[#1A7A64]/30 text-[#1A7A64] px-4 py-2.5 rounded-[6px] text-[13px] flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>Settings and webhook destinations updated successfully.</span>
          </div>
        )}

        {/* Section 1: Merchant Profile */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-4">
          <h2 className="text-[13px] font-semibold text-[#171A1F] flex items-center gap-2">
            <Globe size={15} className="text-[#171A1F]" />
            <span>Organization Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px]">
            <div className="space-y-1.5">
              <label className="text-[#697078] font-medium">Merchant Legal Name</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full p-2 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] text-[#171A1F] focus:outline-none focus:border-[#171A1F]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[#697078] font-medium">Security Alerts Recipient</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full p-2 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] text-[#171A1F] focus:outline-none focus:border-[#171A1F]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Production API Key */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-4">
          <h2 className="text-[13px] font-semibold text-[#171A1F] flex items-center gap-2">
            <Key size={15} className="text-[#171A1F]" />
            <span>Production API Secret</span>
          </h2>
          <p className="text-[12px] text-[#697078]">
            Use this secret key in your server-side PayPal authorization evaluation hooks. Keep this key strictly confidential.
          </p>

          <div className="flex items-center gap-2 text-[12px]">
            <div className="flex-1 font-mono p-2.5 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] text-[#171A1F] overflow-x-auto">
              {apiKey}
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-2.5 bg-[#FFFFFF] border border-[#DFE2DF] hover:bg-[#F6F6F3] text-[12px] font-medium text-[#171A1F] rounded-[6px] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy size={13} />
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
        </div>

        {/* Section 3: Webhook Endpoint */}
        <div className="bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-6 space-y-4">
          <h2 className="text-[13px] font-semibold text-[#171A1F] flex items-center gap-2">
            <Bell size={15} className="text-[#171A1F]" />
            <span>Outbound Webhook Delivery</span>
          </h2>
          <p className="text-[12px] text-[#697078]">
            Scam Brake delivers signed HTTP POST events when authorizations are placed on hold, verified safe, or voided.
          </p>

          <div className="space-y-1.5 text-[12px]">
            <label className="text-[#697078] font-medium">Webhook URL Endpoint</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full p-2 bg-[#F6F6F3] border border-[#DFE2DF] rounded-[6px] text-[#171A1F] font-mono focus:outline-none focus:border-[#171A1F]"
            />
          </div>

          <div className="text-[11px] text-[#697078] font-mono">
            Supported events: `authorization.hold.created`, `intervention.resolved.void`, `intervention.resolved.capture`, `audit.hash.sealed`.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
