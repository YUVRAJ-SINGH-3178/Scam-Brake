import React from 'react';
import { RiskLevel, AuthorizationStatus, InterventionStatus } from '@/types';

export type BadgeVariant =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple'
  | RiskLevel
  | AuthorizationStatus
  | InterventionStatus
  | string;

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded',
    md: 'text-[12px] px-2.5 py-1 font-medium rounded-md',
  }[size];

  // Resolve polymorphic variants to visual classes
  let resolvedClass = 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]';
  let defaultLabel: React.ReactNode = variant;

  switch (variant) {
    case 'brand':
      resolvedClass = 'bg-[#2D5BFF]/10 text-[#2D5BFF] border border-[#2D5BFF]/20';
      break;
    case 'success':
    case 'LOW':
    case 'CAPTURED':
    case 'VERIFIED_SAFE':
      resolvedClass = 'bg-[#10B981]/10 text-[#059669] border border-[#10B981]/25';
      defaultLabel = variant === 'LOW' ? 'LOW RISK' : variant;
      break;
    case 'warning':
    case 'MEDIUM':
    case 'HOLD_ACTIVE':
    case 'PENDING_REVIEW':
      resolvedClass = 'bg-[#F59E0B]/12 text-[#D97706] border border-[#F59E0B]/25';
      defaultLabel = variant === 'MEDIUM' ? 'MED RISK' : variant === 'HOLD_ACTIVE' ? 'HOLD ACTIVE' : variant;
      break;
    case 'danger':
    case 'HIGH':
    case 'CRITICAL':
    case 'VOIDED':
    case 'SCAM_CONFIRMED':
    case 'ACTIVE_INTERVENTION':
      resolvedClass = 'bg-[#EF4444]/10 text-[#DC2626] border border-[#EF4444]/25';
      defaultLabel =
        variant === 'CRITICAL'
          ? 'CRITICAL RISK'
          : variant === 'HIGH'
          ? 'HIGH RISK'
          : variant === 'ACTIVE_INTERVENTION'
          ? 'INTERVENTION ACTIVE'
          : variant;
      break;
    case 'purple':
      resolvedClass = 'bg-[#8B5CF6]/10 text-[#7C3AED] border border-[#8B5CF6]/20';
      break;
    case 'neutral':
    case 'EXPIRED':
    case 'NOT_REQUIRED':
    case 'ABANDONED':
    default:
      resolvedClass = 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]';
      break;
  }

  const content = children !== undefined ? children : defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${sizeClasses} ${resolvedClass} ${className}`}
    >
      {content}
    </span>
  );
};

export const RiskBadge: React.FC<{ level: RiskLevel; score?: number }> = ({
  level,
  score,
}) => {
  return (
    <Badge variant={level}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{level} RISK</span>
      {score !== undefined && (
        <span className="font-mono ml-0.5 opacity-80">({score})</span>
      )}
    </Badge>
  );
};

export const AuthStatusBadge: React.FC<{ status: AuthorizationStatus }> = ({
  status,
}) => {
  return <Badge variant={status} />;
};

export const InterventionBadge: React.FC<{ status: InterventionStatus }> = ({
  status,
}) => {
  return <Badge variant={status} />;
};
