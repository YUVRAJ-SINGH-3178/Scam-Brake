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
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-[4px]',
    md: 'text-[12px] px-2.5 py-1 font-medium rounded-[4px]',
  }[size];

  // Restrained financial palette: teal for verified/protection, amber for holds/review, red for confirmed scam/danger
  let resolvedClass = 'bg-[#F6F6F3] text-[#525860] border border-[#DFE2DF]';
  let defaultLabel: React.ReactNode = variant;

  switch (variant) {
    case 'brand':
    case 'success':
    case 'LOW':
    case 'CAPTURED':
    case 'VERIFIED_SAFE':
      resolvedClass = 'bg-[#EAF4F1] text-[#1A7A64] border border-[#1A7A64]/25';
      defaultLabel = variant === 'LOW' ? 'Low Risk' : variant === 'CAPTURED' ? 'Captured' : variant === 'VERIFIED_SAFE' ? 'Verified Safe' : variant;
      break;

    case 'warning':
    case 'MEDIUM':
    case 'HOLD_ACTIVE':
    case 'PENDING_REVIEW':
      resolvedClass = 'bg-[#FAF2E4] text-[#784D00] border border-[#784D00]/25';
      defaultLabel = variant === 'MEDIUM' ? 'Medium Risk' : variant === 'HOLD_ACTIVE' ? 'Hold Active' : variant === 'PENDING_REVIEW' ? 'Pending Review' : variant;
      break;

    case 'danger':
    case 'HIGH':
    case 'CRITICAL':
    case 'VOIDED':
    case 'SCAM_CONFIRMED':
    case 'ACTIVE_INTERVENTION':
      resolvedClass = 'bg-[#FDE8E8] text-[#C53030] border border-[#C53030]/25';
      defaultLabel =
        variant === 'CRITICAL'
          ? 'Critical Risk'
          : variant === 'HIGH'
          ? 'High Risk'
          : variant === 'ACTIVE_INTERVENTION'
          ? 'Intervention Active'
          : variant === 'SCAM_CONFIRMED'
          ? 'Scam Confirmed'
          : variant === 'VOIDED'
          ? 'Voided (Pre-capture)'
          : variant;
      break;

    case 'neutral':
    case 'EXPIRED':
    case 'NOT_REQUIRED':
    case 'ABANDONED':
    default:
      resolvedClass = 'bg-[#F6F6F3] text-[#525860] border border-[#DFE2DF]';
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
      <span>{level === 'CRITICAL' ? 'Critical' : level === 'HIGH' ? 'High' : level === 'MEDIUM' ? 'Medium' : 'Low'} Risk</span>
      {score !== undefined && (
        <code className="font-mono ml-0.5 opacity-90">({score})</code>
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
