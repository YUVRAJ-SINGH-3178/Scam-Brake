import React from 'react';
import { Clock, Check } from 'lucide-react';
import { AuthorizationStatus, InterventionStatus } from '@/types';

export type PathStage =
  | 'CHECKOUT'
  | 'AUTHORIZED'
  | 'REVIEW'
  | 'CUSTOMER_DECISION'
  | 'CAPTURE'
  | 'VOID';

interface AuthorizationPathProps {
  currentStage?: PathStage;
  status?: AuthorizationStatus;
  interventionStatus?: InterventionStatus;
  variant?: 'marketing' | 'app' | 'customer';
  holdSecondsRemaining?: number;
  amount?: number;
  currency?: string;
  className?: string;
  interactive?: boolean;
  onSelectStage?: (stage: PathStage) => void;
}

export const AuthorizationPath: React.FC<AuthorizationPathProps> = ({
  currentStage,
  status,
  interventionStatus,
  variant = 'app',
  holdSecondsRemaining,
  amount,
  currency = 'USD',
  className = '',
  interactive = false,
  onSelectStage,
}) => {
  let resolvedStage = currentStage;
  if (!resolvedStage && status) {
    if (status === 'CAPTURED') resolvedStage = 'CAPTURE';
    else if (status === 'VOIDED') resolvedStage = 'VOID';
    else if (status === 'HOLD_ACTIVE' || interventionStatus === 'ACTIVE_INTERVENTION') resolvedStage = 'CUSTOMER_DECISION';
    else if (status === 'PENDING_REVIEW') resolvedStage = 'REVIEW';
    else resolvedStage = 'AUTHORIZED';
  }
  const effectiveStage = resolvedStage || 'REVIEW';

  const stages: {
    key: PathStage;
    step: string;
    label: string;
    sublabel: string;
    state: 'completed' | 'active' | 'upcoming' | 'resolved';
  }[] = [
    {
      key: 'CHECKOUT',
      step: '1',
      label: 'Checkout',
      sublabel: 'Customer initiates PayPal order',
      state: effectiveStage === 'CHECKOUT' ? 'active' : 'completed',
    },
    {
      key: 'AUTHORIZED',
      step: '2',
      label: 'Authorized',
      sublabel: 'Temporary hold placed, uncaptured',
      state:
        effectiveStage === 'CHECKOUT'
          ? 'upcoming'
          : effectiveStage === 'AUTHORIZED'
          ? 'active'
          : 'completed',
    },
    {
      key: 'REVIEW',
      step: '3',
      label: 'Verify',
      sublabel: 'AI-guided coercion assessment',
      state:
        effectiveStage === 'CHECKOUT' || effectiveStage === 'AUTHORIZED'
          ? 'upcoming'
          : effectiveStage === 'REVIEW' || effectiveStage === 'CUSTOMER_DECISION'
          ? 'active'
          : 'completed',
    },
    {
      key: effectiveStage === 'VOID' ? 'VOID' : 'CAPTURE',
      step: '4',
      label: effectiveStage === 'VOID' ? 'Pre-Capture Void' : 'Final Capture',
      sublabel:
        effectiveStage === 'VOID'
          ? 'Hold terminated, $0 dispute fee'
          : 'Funds captured to merchant settlement',
      state:
        effectiveStage === 'CAPTURE' || effectiveStage === 'VOID'
          ? 'resolved'
          : 'upcoming',
    },
  ];

  const isVoid = effectiveStage === 'VOID';
  const isCapture = effectiveStage === 'CAPTURE';

  return (
    <div
      data-ui="true"
      className={`bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] p-5 text-[#171A1F] ${className}`}
      aria-label="Payment Authorization Lifecycle Protocol"
    >
      {/* Protocol Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DFE2DF] mb-5 text-[13px]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#171A1F] tracking-tight">
            Authorization Protocol
          </span>
          <span className="text-[#525860]">•</span>
          <span className="text-[#525860] text-[13px]">
            Pre-capture hold &amp; verification window
          </span>
        </div>

        <div className="flex items-center gap-3">
          {amount && (
            <div className="flex items-center gap-1.5 text-[13px]">
              <span className="text-[#525860]">Held Amount:</span>
              <span className="font-semibold text-[#171A1F] tabular-nums">
                <code>${amount.toFixed(2)}</code> {currency}
              </span>
            </div>
          )}

          {holdSecondsRemaining !== undefined && holdSecondsRemaining > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#FAF2E4] border border-[#784D00]/25 text-[#784D00] text-[12px] font-medium">
              <Clock size={13} />
              <span>
                <code>{Math.floor(holdSecondsRemaining / 60)}m</code> window remaining
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Flow Line */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative mb-5">
        {stages.map((st, idx) => {
          const isActive = st.state === 'active';
          const isDone = st.state === 'completed';
          const isResolved = st.state === 'resolved';

          let borderClass = 'border-[#DFE2DF] bg-[#FFFFFF]';
          let indicatorClass = 'bg-[#DFE2DF] text-[#525860]';

          if (isActive) {
            borderClass = 'border-[#171A1F] bg-[#F6F6F3]';
            indicatorClass = 'bg-[#171A1F] text-[#FFFFFF]';
          } else if (isDone) {
            borderClass = 'border-[#DFE2DF] bg-[#FFFFFF]';
            indicatorClass = 'bg-[#EAF4F1] text-[#1A7A64] border border-[#1A7A64]/30';
          } else if (isResolved) {
            if (isVoid) {
              borderClass = 'border-[#C53030]/40 bg-[#FDE8E8]/40';
              indicatorClass = 'bg-[#C53030] text-[#FFFFFF]';
            } else {
              borderClass = 'border-[#1A7A64]/40 bg-[#EAF4F1]/40';
              indicatorClass = 'bg-[#1A7A64] text-[#FFFFFF]';
            }
          }

          return (
            <div
              key={st.key}
              onClick={() => interactive && onSelectStage?.(st.key)}
              className={`p-3.5 rounded-[6px] border transition-colors ${borderClass} ${
                interactive ? 'cursor-pointer hover:border-[#171A1F]' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-5 h-5 rounded-[3px] text-[11px] font-semibold flex items-center justify-center ${indicatorClass}`}
                >
                  {isDone ? <Check size={11} strokeWidth={2.5} /> : <code>{st.step}</code>}
                </span>

                <span className="text-[11px] font-medium text-[#525860]">
                  {isActive ? 'ACTIVE STAGE' : isDone ? 'VERIFIED' : isResolved ? 'TERMINAL' : 'PENDING'}
                </span>
              </div>

              <div className="text-[13px] font-semibold text-[#171A1F]">{st.label}</div>
              <div className="text-[12px] text-[#525860] leading-normal mt-0.5">{st.sublabel}</div>
            </div>
          );
        })}
      </div>

      {/* Terminal Outcome Specification Footer */}
      <div className="pt-3.5 border-t border-[#DFE2DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] text-[#525860]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A7A64]" />
          <span>
            Intent: <strong className="text-[#171A1F]"><code>AUTHORIZE</code></strong> (no funds captured prior to verified customer volition)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#1A7A64]">Dispute Exposure: $0.00</span>
          <span>•</span>
          <span>Chargeback Mark: None</span>
        </div>
      </div>
    </div>
  );
};
