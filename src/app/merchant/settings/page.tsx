'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/merchant/AppShell';
import { Settings, Key, Bell, Shield, CheckCircle2, Copy, Save, Globe } from 'lucide-react';

export default function MerchantSettingsPage() {
  const [merchantName, setMerchantName] = useState('Nordic Retail Labs, Inc.');
  const [contactEmail, setContactEmail] = useState('security-ops@nordicretail.com');
  const [webhookUrl, setWebhookUrl] = useState('https://api.nordicretail.com/webhooks/scambrake');
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
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E2A]">
              Merchant Account & API Settings
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Manage organization credentials, PayPal partner credentials, and event webhook endpoints.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D5BFF] text-white hover:bg-[#2044C8] text-xs font-medium rounded transition-colors self-start sm:self-auto"
          >
            <Save size={14} />
            Save Changes
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#059669] px-4 py-2.5 rounded text-sm flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Settings and webhook destinations updated successfully.</span>
          </div>
        )}

        {/* Section 1: Merchant Profile */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1E1E2A] flex items-center gap-2">
            <Globe size={16} className="text-[#2D5BFF]" />
            Organization Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#6B7280] font-medium">Merchant Legal Name</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full p-2 bg-[#FAFAFC] border border-[#E5E7EB] rounded text-[#1E1E2A] focus:outline-hidden focus:border-[#2D5BFF]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[#6B7280] font-medium">Security Alerts Recipient</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full p-2 bg-[#FAFAFC] border border-[#E5E7EB] rounded text-[#1E1E2A] focus:outline-hidden focus:border-[#2D5BFF]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Production API Key */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1E1E2A] flex items-center gap-2">
            <Key size={16} className="text-[#2D5BFF]" />
            Scam Brake Production API Secret
          </h2>
          <p className="text-xs text-[#6B7280]">
            Use this secret key in your server-side PayPal authorization evaluation hooks. Keep this key strictly confidential.
          </p>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 font-mono p-2.5 bg-[#FAFAFC] border border-[#E5E7EB] rounded text-[#1E1E2A] overflow-x-auto">
              {apiKey}
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-2.5 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#FAFAFC] text-xs font-medium text-[#1E1E2A] rounded transition-colors flex items-center gap-1.5"
            >
              <Copy size={13} />
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
        </div>

        {/* Section 3: Webhook Endpoint */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1E1E2A] flex items-center gap-2">
            <Bell size={16} className="text-[#2D5BFF]" />
            Outbound Webhook Delivery
          </h2>
          <p className="text-xs text-[#6B7280]">
            Scam Brake delivers signed HTTP POST events when authorizations are placed on hold, verified safe, or voided.
          </p>

          <div className="space-y-1.5 text-xs">
            <label className="text-[#6B7280] font-medium">Webhook URL Endpoint</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full p-2 bg-[#FAFAFC] border border-[#E5E7EB] rounded text-[#1E1E2A] font-mono focus:outline-hidden focus:border-[#2D5BFF]"
            />
          </div>

          <div className="text-[11px] text-[#6B7280]">
            Supported events: `authorization.hold.created`, `intervention.resolved.void`, `intervention.resolved.capture`, `audit.hash.sealed`.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
