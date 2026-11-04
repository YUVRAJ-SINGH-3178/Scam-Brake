import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
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
  const isMarketing = variant === 'marketing';
  const isCustomer = variant === 'customer';

  const stages: {
    key: PathStage;
    label: string;
    sublabel: string;
    state: 'completed' | 'active' | 'upcoming' | 'resolved';
  }[] = [
    {
      key: 'CHECKOUT',
      label: 'Merchant Checkout',
      sublabel: 'Customer initiates PayPal',
      state:
        effectiveStage === 'CHECKOUT'
          ? 'active'
          : 'completed',
    },
    {
      key: 'AUTHORIZED',
      label: 'PayPal Authorization',
      sublabel: 'Funds held, uncaptured',
      state:
        effectiveStage === 'CHECKOUT'
          ? 'upcoming'
          : effectiveStage === 'AUTHORIZED'
          ? 'active'
          : 'completed',
    },
    {
      key: 'REVIEW',
      label: 'Scam Brake Verification',
      sublabel: 'AI context evaluation',
      state:
        effectiveStage === 'CHECKOUT' || effectiveStage === 'AUTHORIZED'
          ? 'upcoming'
          : effectiveStage === 'REVIEW'
          ? 'active'
          : 'completed',
    },
    {
      key: 'CUSTOMER_DECISION',
      label: 'Customer Decision',
      sublabel: 'Independent validation',
      state:
        effectiveStage === 'CUSTOMER_DECISION'
          ? 'active'
          : effectiveStage === 'CAPTURE' || effectiveStage === 'VOID'
          ? 'completed'
          : 'upcoming',
    },
  ];

  const isVoid = effectiveStage === 'VOID';
  const isCapture = effectiveStage === 'CAPTURE';

  return (
    <div
      className={`rounded-xl border ${
        isMarketing
          ? 'bg-[#11121C] border-[rgba(255,255,255,0.12)] text-[#EDEDF3]'
          : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#1E1E2A]'
      } p-5 ${className}`}
      aria-label="The Authorization Path Lifecycle Diagram"
    >
      {/* Header bar of the motif */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] dark:border-[rgba(255,255,255,0.08)] mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#2D5BFF]">
            The Authorization Path
          </span>
          <span className="text-[#6B7280] text-[12px]">•</span>
          <span className="text-[13px] text-[#6B7280]">
            Pre-capture verification protocol
          </span>
        </div>

        {amount && (
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-[#6B7280]">Target Hold:</span>
            <span className="font-mono text-[14px] font-semibold text-[#1E1E2A] dark:text-[#EDEDF3]">
              ${amount.toFixed(2)} {currency}
            </span>
          </div>
        )}

        {holdSecondsRemaining !== undefined && holdSecondsRemaining > 0 && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-[12px] font-medium">
            <Clock size={13} />
            <span>Hold Window: {Math.floor(holdSecondsRemaining / 3600)}h {Math.floor((holdSecondsRemaining % 3600) / 60)}m remaining</span>
          </div>
        )}
      </div>

      {/* The Linear Progression */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative mb-6">
        {stages.map((st, idx) => {
          const isActive = st.state === 'active';
          const isDone = st.state === 'completed';

          return (
            <div
              key={st.key}
              onClick={() => interactive && onSelectStage?.(st.key)}
              className={`relative p-3.5 rounded-lg border transition-all ${
                interactive ? 'cursor-pointer hover:border-[#2D5BFF]' : ''
              } ${
                isActive
                  ? 'bg-[#2D5BFF]/5 border-[#2D5BFF] ring-1 ring-[#2D5BFF]/30'
                  : isDone
                  ? isMarketing
                    ? 'bg-[#191A26] border-[rgba(255,255,255,0.1)]'
                    : 'bg-[#F8F9FB] border-[#E5E7EB]'
                  : isMarketing
                  ? 'bg-[#11121C] border-[rgba(255,255,255,0.06)] opacity-60'
                  : 'bg-[#FFFFFF] border-[#E5E7EB] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-medium text-[#6B7280]">
                  0{idx + 1}
                </span>
                {isDone ? (
                  <CheckCircle2 size={16} className="text-[#10B981]" />
                ) : isActive ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2D5BFF] animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[#E5E7EB] dark:bg-[rgba(255,255,255,0.2)]" />
                )}
              </div>
              <div className="font-medium text-[13px] leading-tight mb-1">
                {st.label}
              </div>
              <div className="text-[11px] text-[#6B7280] leading-normal">
                {st.sublabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Outcome Resolution Fork (Capture vs Void) */}
      <div className="pt-4 border-t border-[#E5E7EB] dark:border-[rgba(255,255,255,0.08)]">
        <div className="text-[12px] text-[#6B7280] mb-3 font-medium">
          Verified Resolution Stage (One of Two Deterministic Outcomes):
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Outcome 1: Safe Void (Cancellation) */}
          <div
            className={`p-3.5 rounded-lg border flex items-start gap-3 ${
              isVoid
                ? 'bg-[#EF4444]/10 border-[#EF4444] ring-1 ring-[#EF4444]/40'
                : isMarketing
                ? 'bg-[#11121C] border-[rgba(255,255,255,0.08)] opacity-70'
                : 'bg-[#FAFAFC] border-[#E5E7EB] opacity-70'
            }`}
          >
            <div className="w-7 h-7 rounded-md bg-[#EF4444]/15 flex items-center justify-center text-[#EF4444] shrink-0 mt-0.5">
              <XCircle size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#EF4444]">
                  VOID AUTHORIZATION
                </span>
                {isVoid && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EF4444] text-white">
                    RESOLVED
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#6B7280] mt-1 leading-relaxed">
                Coercion or impersonation identified. Authorization is canceled. Zero funds captured. Buyer credit restored instantly.
              </p>
            </div>
          </div>

          {/* Outcome 2: Legitimate Capture */}
          <div
            className={`p-3.5 rounded-lg border flex items-start gap-3 ${
              isCapture
                ? 'bg-[#10B981]/10 border-[#10B981] ring-1 ring-[#10B981]/40'
                : isMarketing
                ? 'bg-[#11121C] border-[rgba(255,255,255,0.08)] opacity-70'
                : 'bg-[#FAFAFC] border-[#E5E7EB] opacity-70'
            }`}
          >
            <div className="w-7 h-7 rounded-md bg-[#10B981]/15 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
              <CheckCircle2 size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#10B981]">
                  CAPTURE AUTHORIZATION
                </span>
                {isCapture && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#10B981] text-white">
                    RESOLVED
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#6B7280] mt-1 leading-relaxed">
                Independent check verified legitimate purchase intent. Merchant executes PayPal Capture call. Order fulfilled securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
