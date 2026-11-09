import type { RiskLevel, SignalCategory, RiskSignal } from '../../types/index.ts';
import { dbRepository } from '../db/repository.ts';

export interface TelemetryContext {
  remoteDesktopDetected?: boolean;
  activePhoneCall?: boolean;
  clientIp?: string;
  userAgent?: string;
  cartItemIsGiftCard?: boolean;
  orderVelocityPerHour?: number;
  customerAccountAgeMonths?: number;
  reportedCallerIdentity?: string;
  reportedUrgencyKeywords?: string[];
  reportedSecrecyDemand?: boolean;
}

export interface RiskEvaluationResult {
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  policyOutcome:
    | 'NORMAL_PROCESSING'
    | 'REQUIRE_INTERVENTION'
    | 'REQUIRE_MORE_INFORMATION'
    | 'CUSTOMER_CONFIRMATION_REQUIRED'
    | 'HUMAN_REVIEW'
    | 'RECOMMEND_CANCELLATION';
  signals: RiskSignal[];
  aiHypothesis: string;
  aiConfidence: number;
  recommendedQuestions: string[];
  recommendedAction: 'allow' | 'review' | 'recommend_void' | 'human_review';
  needsTrustedContact: boolean;
}

export class RiskIntelligenceEngine {
  /**
   * Evaluates deterministic and telemetry signals against configured merchant policy
   */
  public static async evaluate(params: {
    merchantId?: string;
    amount: number;
    productName: string;
    productCategory: string;
    telemetry?: TelemetryContext;
    customerHistory?: { totalPriorTransactions: number };
  }): Promise<RiskEvaluationResult> {
    const { merchantId, amount, productName, productCategory, telemetry, customerHistory } = params;
    const policy = await dbRepository.getRiskPolicy(merchantId);

    let score = 5; // Base clean score
    const signals: RiskSignal[] = [];

    // Signal 1: High Value Threshold
    if (amount >= 1000) {
      score += 25;
      signals.push({
        id: `sig_${Date.now()}_val`,
        category: 'ANOMALOUS_VELOCITY',
        severity: amount >= 2000 ? 'HIGH' : 'MEDIUM',
        title: 'High-Value Payment Authorization',
        description: `Authorization of $${amount.toFixed(2)} USD significantly exceeds typical consumer baseline.`,
        source: 'CHECKOUT_METADATA',
        confidence: 0.95,
        detectedAt: new Date().toISOString(),
      });
    }

    // Signal 2: Gift Card / Digital Store Voucher
    const isGiftCard =
      telemetry?.cartItemIsGiftCard ||
      productCategory.toLowerCase().includes('gift') ||
      productName.toLowerCase().includes('card') ||
      productName.toLowerCase().includes('voucher') ||
      productName.toLowerCase().includes('apple') ||
      productName.toLowerCase().includes('steam') ||
      productName.toLowerCase().includes('crypto');

    if (isGiftCard) {
      score += 35;
      signals.push({
        id: `sig_${Date.now()}_gc`,
        category: 'UNUSUAL_GIFT_CARD',
        severity: 'HIGH',
        title: 'Digital Commodity / Gift Card Purchase',
        description: 'Payment involves untraceable digital gift cards, standard currency for coercion scams.',
        source: 'CHANNEL3_ENRICHMENT',
        confidence: 0.98,
        detectedAt: new Date().toISOString(),
      });
    }

    // Signal 3: Remote Desktop Software Active (AnyDesk / TeamViewer / QuickAssist)
    if (telemetry?.remoteDesktopDetected) {
      score += 45;
      signals.push({
        id: `sig_${Date.now()}_rdp`,
        category: 'REMOTE_ACCESS_ACTIVE',
        severity: 'CRITICAL',
        title: 'Concurrent Remote Desktop Session Detected',
        description: 'Telemetry indicates active screen-sharing software (AnyDesk / TeamViewer) during checkout.',
        source: 'CHANNEL3_ENRICHMENT',
        confidence: 0.92,
        detectedAt: new Date().toISOString(),
      });
    }

    // Signal 4: Concurrent Active Voice Call
    if (telemetry?.activePhoneCall) {
      score += 20;
      signals.push({
        id: `sig_${Date.now()}_call`,
        category: 'SECRECY_COERCION',
        severity: 'HIGH',
        title: 'Active Voice Call During Checkout',
        description: 'Mobile device telemetry confirms ongoing phone call while initiating payment.',
        source: 'CHANNEL3_ENRICHMENT',
        confidence: 0.88,
        detectedAt: new Date().toISOString(),
      });
    }

    // Signal 5: Velocity anomaly
    if (telemetry?.orderVelocityPerHour && telemetry.orderVelocityPerHour > 2) {
      score += 20;
      signals.push({
        id: `sig_${Date.now()}_velo`,
        category: 'ANOMALOUS_VELOCITY',
        severity: 'MEDIUM',
        title: 'High Velocity Multiple Payment Attempts',
        description: `${telemetry.orderVelocityPerHour} checkout attempts within the past 60 minutes.`,
        source: 'CHECKOUT_METADATA',
        confidence: 0.85,
        detectedAt: new Date().toISOString(),
      });
    }

    // Signal 6: Secrecy or Urgency keywords reported
    if (telemetry?.reportedSecrecyDemand) {
      score += 30;
      signals.push({
        id: `sig_${Date.now()}_sec`,
        category: 'SECRECY_COERCION',
        severity: 'HIGH',
        title: 'Explicit Secrecy Coercion Reported',
        description: 'Customer indicates caller instructed them not to inform bank, store staff, or relatives.',
        source: 'INTERVENTION_CONVERSATION',
        confidence: 0.96,
        detectedAt: new Date().toISOString(),
      });
    }

    // Clamp score
    const finalScore = Math.min(100, Math.max(0, score));

    // Determine Risk Level
    let riskLevel: RiskLevel = 'LOW';
    if (finalScore >= 75) riskLevel = 'CRITICAL';
    else if (finalScore >= 60) riskLevel = 'HIGH';
    else if (finalScore >= 25) riskLevel = 'MEDIUM';

    // Formulate AI Hypothesis based on detected vectors
    let aiHypothesis = 'Legitimate checkout parameters consistent with normal consumer behavior.';
    let recommendedAction: 'allow' | 'review' | 'recommend_void' | 'human_review' = 'allow';
    const recommendedQuestions: string[] = [];

    if (telemetry?.remoteDesktopDetected && isGiftCard) {
      aiHypothesis =
        'High probability of Remote Access Tech Support or Government Impersonation Extortion using gift cards as untraceable liquidation.';
      recommendedAction = 'recommend_void';
      recommendedQuestions.push('Did someone claiming to be technical support instruct you to purchase these cards?');
      recommendedQuestions.push('Is anyone currently connected to your computer through AnyDesk or TeamViewer?');
    } else if (isGiftCard && amount >= 1000) {
      aiHypothesis =
        'High-value digital gift card purchase. Potential imposter fraud claiming to be IRS, utility company, or law enforcement.';
      recommendedAction = 'review';
      recommendedQuestions.push('Did a caller claim you owe unpaid taxes, utility fees, or bail money?');
      recommendedQuestions.push('Were you instructed to keep this payment private or stay on the phone?');
    } else if (finalScore >= policy.autoHoldThreshold) {
      aiHypothesis = 'Multiple risk indicators flagged requiring empathetic conversational check-in.';
      recommendedAction = 'review';
      recommendedQuestions.push('Did someone ask you to make this purchase on their behalf today?');
    }

    // Determine Policy Outcome
    let policyOutcome: RiskEvaluationResult['policyOutcome'] = 'NORMAL_PROCESSING';
    if (finalScore >= 80) {
      policyOutcome = 'RECOMMEND_CANCELLATION';
    } else if (finalScore >= policy.autoHoldThreshold) {
      policyOutcome = 'REQUIRE_INTERVENTION';
    } else if (finalScore >= policy.autoCaptureThreshold) {
      policyOutcome = 'REQUIRE_MORE_INFORMATION';
    }

    const needsTrustedContact =
      finalScore >= 70 ||
      (policy.requireTrustedContactOver !== null && amount >= Number(policy.requireTrustedContactOver));

    return {
      riskScore: finalScore,
      riskLevel,
      policyOutcome,
      signals,
      aiHypothesis,
      aiConfidence: finalScore >= 60 ? 0.94 : 0.85,
      recommendedQuestions,
      recommendedAction,
      needsTrustedContact,
    };
  }
}
