export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AuthorizationStatus =
  | 'PENDING_REVIEW'
  | 'HOLD_ACTIVE'
  | 'CAPTURED'
  | 'VOIDED'
  | 'EXPIRED';

export type InterventionStatus =
  | 'NOT_REQUIRED'
  | 'ACTIVE_INTERVENTION'
  | 'VERIFIED_SAFE'
  | 'SCAM_CONFIRMED'
  | 'ABANDONED';

export type SignalCategory =
  | 'IMPERSONATION'
  | 'SECRECY_COERCION'
  | 'URGENCY_THREAT'
  | 'UNUSUAL_GIFT_CARD'
  | 'REMOTE_ACCESS_ACTIVE'
  | 'ANOMALOUS_VELOCITY';

export interface RiskSignal {
  id: string;
  category: SignalCategory;
  severity: RiskLevel;
  title: string;
  description: string;
  source: 'CHANNEL3_ENRICHMENT' | 'ELASTIC_PATTERN_MATCH' | 'CHECKOUT_METADATA' | 'INTERVENTION_CONVERSATION';
  confidence: number; // 0 to 1
  detectedAt: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  maskedEmail: string;
  maskedPhone: string;
  accountAgeMonths: number;
  hasTrustedContact: boolean;
  trustedContactName?: string;
  trustedContactPhone?: string;
}

export interface Payment {
  id: string;
  paymentReference: string;
  paypalOrderId: string;
  paypalAuthorizationId: string;
  merchantId: string;
  merchantName: string;
  merchantCategory: string;
  productName: string;
  productCategory: string;
  amount: number;
  currency: 'USD';
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  authorizationStatus: AuthorizationStatus;
  interventionStatus: InterventionStatus;
  customer: CustomerProfile;
  createdAt: string;
  authorizedAt: string;
  holdExpiresAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  riskSignals: RiskSignal[];
  interventionSessionId?: string;
  authorizationHoldSecondsRemaining: number;
}

export interface InterventionMessage {
  id: string;
  sender: 'AI_ASSISTANT' | 'CUSTOMER' | 'SYSTEM';
  content: string;
  timestamp: string;
  quickReplies?: string[];
  flaggedKeywords?: string[];
}

export interface IndependentVerificationState {
  enabled: boolean;
  provider: 'KERNEL_VERIFY';
  targetOrganization: string;
  officialPhone: string;
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'SKIPPED';
  verificationRef?: string;
  notes: string;
}

export interface TrustedContactConsentState {
  registered: boolean;
  name: string;
  relationship: string;
  maskedPhone: string;
  consentGranted: boolean;
  notificationSent: boolean;
  sentAt?: string;
  response?: 'CONFIRMED_SCAM' | 'APPROVED' | 'NO_RESPONSE';
}

export interface InterventionSession {
  id: string;
  paymentId: string;
  status:
    | 'INITIALIZING'
    | 'AWAITING_CUSTOMER'
    | 'IN_CONVERSATION'
    | 'VERIFICATION_PENDING'
    | 'TRUSTED_CONTACT_NOTIFIED'
    | 'RESOLVED_VOID'
    | 'RESOLVED_CAPTURE';
  scamHypothesis: string;
  coercionIndicators: string[];
  confidenceScore: number;
  messages: InterventionMessage[];
  independentVerification: IndependentVerificationState;
  trustedContact: TrustedContactConsentState;
  customerDecision?: 'CANCEL_PAYMENT' | 'PROCEED_PAYMENT' | 'TIMED_OUT';
  startedAt: string;
  completedAt?: string;
}

export interface AuditEvent {
  id: string;
  paymentId: string;
  eventType:
    | 'AUTH_HOLD_INITIATED'
    | 'RISK_ASSESSMENT_COMPLETED'
    | 'INTERVENTION_TRIGGERED'
    | 'CUSTOMER_CHECK_IN_ANSWERED'
    | 'INDEPENDENT_VERIFICATION_ATTEMPTED'
    | 'TRUSTED_CONTACT_NOTIFIED'
    | 'AUTHORIZATION_VOIDED'
    | 'AUTHORIZATION_CAPTURED'
    | 'HOLD_EXPIRED';
  actor: 'CUSTOMER' | 'PAYPAL_SYSTEM' | 'SCAM_BRAKE_AI' | 'MERCHANT_POLICY';
  summary: string;
  timestamp: string;
  details: Record<string, unknown>;
  immutableHash: string;
  sha256Hash?: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  type: 'TAX_OFFICER_SCAM' | 'BANK_IMPERSONATION' | 'LEGITIMATE_PURCHASE';
  riskLevel: RiskLevel;
  coercionVector: string;
  shortDescription: string;
  description?: string;
  merchantName: string;
  productName: string;
  itemDescription?: string;
  customerName?: string;
  amount: number;
  expectedOutcome: 'VOID' | 'CAPTURE';
  expectedRiskScore?: number;
  sampleConversation: InterventionMessage[];
  investigationFindings: string[];
  riskSignals?: string[];
  recommendedPolicy: string;
}

export interface SponsorIntegration {
  id: string;
  name: string;
  category: string;
  status: 'SANDBOX_READY' | 'MOCK_ACTIVE' | 'CONTRACT_VALIDATED' | 'CONNECTED';
  purpose: string;
  interfaceMethod: string;
  docsUrl: string;
  role?: string;
  description?: string;
  latencyMs?: number;
}

export interface DashboardMetrics {
  totalProtectedVolume: number;
  totalTransactionsReviewed: number;
  activeHoldCount: number;
  activeHoldAmount: number;
  interventionsCount: number;
  voidedFraudCount: number;
  voidedFraudAmount: number;
  capturedLegitimateCount: number;
  capturedLegitimateAmount: number;
  falsePositiveRate: number; // e.g. 0.012 for 1.2%
  medianInterventionSeconds: number;
}
