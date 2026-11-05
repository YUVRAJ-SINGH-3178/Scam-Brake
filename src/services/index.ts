import {
  Payment,
  InterventionSession,
  InterventionMessage,
  AuditEvent,
  DashboardMetrics,
  RiskLevel,
  AuthorizationStatus,
  IndependentVerificationState,
  TrustedContactConsentState,
  SponsorIntegration,
  SimulationScenario,
} from '@/types';
import {
  SEED_PAYMENTS,
  SEED_INTERVENTIONS,
  SEED_AUDIT_LOGS,
  METRICS,
  SIMULATION_SCENARIOS,
  SPONSORS,
} from '@/data/seedData';

class ScamBrakeMockStore {
  private payments: Payment[] = [...SEED_PAYMENTS];
  private interventions: Record<string, InterventionSession> = JSON.parse(
    JSON.stringify(SEED_INTERVENTIONS)
  );
  private auditLogs: AuditEvent[] = [...SEED_AUDIT_LOGS];

  getPayments(filter?: {
    search?: string;
    riskLevel?: RiskLevel;
    status?: AuthorizationStatus;
    merchantId?: string;
  }): Payment[] {
    let result = [...this.payments];

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.paymentReference.toLowerCase().includes(q) ||
          p.merchantName.toLowerCase().includes(q) ||
          p.productName.toLowerCase().includes(q) ||
          p.customer.name.toLowerCase().includes(q)
      );
    }

    if (filter?.riskLevel) {
      result = result.filter((p) => p.riskLevel === filter.riskLevel);
    }

    if (filter?.status) {
      result = result.filter((p) => p.authorizationStatus === filter.status);
    }

    if (filter?.merchantId) {
      result = result.filter((p) => p.merchantId === filter.merchantId);
    }

    return result;
  }

  getPaymentById(id: string): Payment | undefined {
    return this.payments.find((p) => p.id === id || p.paymentReference === id);
  }

  capturePayment(id: string, notes?: string): Payment | null {
    const payment = this.getPaymentById(id);
    if (!payment) return null;

    payment.authorizationStatus = 'CAPTURED';
    payment.interventionStatus = 'VERIFIED_SAFE';
    payment.resolvedAt = new Date().toISOString();
    payment.resolutionNotes = notes || 'Customer passed verification check; authorization captured.';
    payment.authorizationHoldSecondsRemaining = 0;

    this.addAuditLog({
      paymentId: payment.id,
      eventType: 'AUTHORIZATION_CAPTURED',
      actor: 'MERCHANT_POLICY',
      summary: `Authorization captured for ${payment.paymentReference} ($${payment.amount.toFixed(2)} USD).`,
      details: { amount: payment.amount, notes },
    });

    // Sync with real backend state machine if in browser
    if (typeof window !== 'undefined') {
      fetch(`/api/payments/${encodeURIComponent(payment.id)}/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      }).catch((e) => console.warn('[API SYNC] Background capture call failed:', e));
    }

    return { ...payment };
  }

  voidPayment(id: string, reason?: string): Payment | null {
    const payment = this.getPaymentById(id);
    if (!payment) return null;

    payment.authorizationStatus = 'VOIDED';
    payment.interventionStatus = 'SCAM_CONFIRMED';
    payment.resolvedAt = new Date().toISOString();
    payment.resolutionNotes = reason || 'Customer intervention identified coercive scam markers. Authorization voided.';
    payment.authorizationHoldSecondsRemaining = 0;

    this.addAuditLog({
      paymentId: payment.id,
      eventType: 'AUTHORIZATION_VOIDED',
      actor: 'CUSTOMER',
      summary: `Authorization voided for ${payment.paymentReference} ($${payment.amount.toFixed(2)} USD). Funds released.`,
      details: { amount: payment.amount, reason },
    });

    // Sync with real backend state machine if in browser
    if (typeof window !== 'undefined') {
      fetch(`/api/payments/${encodeURIComponent(payment.id)}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      }).catch((e) => console.warn('[API SYNC] Background void call failed:', e));
    }

    return { ...payment };
  }

  createPaymentFromScenario(scenarioId: string): Payment {
    const scenario = SIMULATION_SCENARIOS.find((s) => s.id === scenarioId) || SIMULATION_SCENARIOS[0];
    const newId = `pay_sim_${Date.now()}`;
    const newRef = `SB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const sessionId = `int_sess_${newId}`;

    const newPayment: Payment = {
      id: newId,
      paymentReference: newRef,
      paypalOrderId: `ORD-PP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      paypalAuthorizationId: `AUTH-HLD-${Math.floor(10000 + Math.random() * 90000)}`,
      merchantId: 'merch_simulation_merchant',
      merchantName: scenario.merchantName,
      merchantCategory: 'Simulation Environment',
      productName: scenario.productName,
      productCategory: 'Simulated Order',
      amount: scenario.amount,
      currency: 'USD',
      riskScore: scenario.riskLevel === 'CRITICAL' ? 95 : scenario.riskLevel === 'HIGH' ? 84 : 16,
      riskLevel: scenario.riskLevel,
      authorizationStatus: 'HOLD_ACTIVE',
      interventionStatus: 'ACTIVE_INTERVENTION',
      customer: {
        id: `cust_sim_${Date.now()}`,
        name: 'Simulation User',
        maskedEmail: 'test.shopper****@apexdigital.com',
        maskedPhone: '+1 (555) •••-0192',
        accountAgeMonths: 24,
        hasTrustedContact: true,
        trustedContactName: 'Taylor Morgan (Emergency Contact)',
        trustedContactPhone: '+1 (555) •••-9918',
      },
      createdAt: new Date().toISOString(),
      authorizedAt: new Date().toISOString(),
      holdExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      authorizationHoldSecondsRemaining: 86400,
      interventionSessionId: sessionId,
      riskSignals: [
        {
          id: `sig_sim_${Date.now()}`,
          category: scenario.type === 'TAX_OFFICER_SCAM' ? 'IMPERSONATION' : scenario.type === 'BANK_IMPERSONATION' ? 'URGENCY_THREAT' : 'ANOMALOUS_VELOCITY',
          severity: scenario.riskLevel,
          title: scenario.coercionVector,
          description: scenario.shortDescription,
          source: 'ELASTIC_PATTERN_MATCH',
          confidence: 0.94,
          detectedAt: new Date().toISOString(),
        },
      ],
    };

    this.payments.unshift(newPayment);

    // Create matching intervention session
    this.interventions[sessionId] = {
      id: sessionId,
      paymentId: newId,
      status: 'IN_CONVERSATION',
      scamHypothesis: scenario.title,
      coercionIndicators: scenario.investigationFindings,
      confidenceScore: scenario.riskLevel === 'CRITICAL' ? 0.95 : 0.85,
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          sender: 'AI_ASSISTANT',
          content: `Your $${scenario.amount.toFixed(2)} payment to ${scenario.merchantName} has been authorized with PayPal, but Scam Brake has held the funds safely before capture.`,
          timestamp: new Date().toISOString(),
        },
        {
          id: `msg_q_${Date.now()}`,
          sender: 'AI_ASSISTANT',
          content: scenario.sampleConversation[0]?.content || 'Did someone instruct you to make this payment today?',
          timestamp: new Date().toISOString(),
          quickReplies: [
            'Yes, I was told this was urgent',
            'No, this is my own deliberate purchase',
            'I am not sure, please explain',
          ],
        },
      ],
      independentVerification: {
        enabled: true,
        provider: 'KERNEL_VERIFY',
        targetOrganization: scenario.type === 'TAX_OFFICER_SCAM' ? 'Internal Revenue Service' : 'Primary Financial Institution',
        officialPhone: scenario.type === 'TAX_OFFICER_SCAM' ? '1-800-829-1040' : '1-800-935-9935',
        status: 'PENDING',
        notes: 'Verification directory ready via Kernel verification.',
      },
      trustedContact: {
        registered: true,
        name: 'Taylor Morgan',
        relationship: 'Family Member',
        maskedPhone: '+1 (555) •••-9918',
        consentGranted: false,
        notificationSent: false,
      },
      startedAt: new Date().toISOString(),
    };

    return newPayment;
  }

  // Interventions
  getInterventionByPaymentId(paymentId: string): InterventionSession | undefined {
    return Object.values(this.interventions).find((s) => s.paymentId === paymentId);
  }

  getInterventionById(sessionId: string): InterventionSession | undefined {
    return this.interventions[sessionId];
  }

  getInterventionSession(id: string): InterventionSession | undefined {
    return this.getInterventionById(id) || this.getInterventionByPaymentId(id);
  }

  sendCustomerMessage(
    sessionId: string,
    content: string
  ): { session: InterventionSession; aiResponse: InterventionMessage } | null {
    const session = this.interventions[sessionId];
    if (!session) return null;

    const customerMsg: InterventionMessage = {
      id: `msg_cust_${Date.now()}`,
      sender: 'CUSTOMER',
      content,
      timestamp: new Date().toISOString(),
    };
    session.messages.push(customerMsg);

    // Contextual calm AI response
    let aiContent =
      'Thank you for sharing that context. We are reviewing the transaction parameters. Remember: official institutions will never ask you to buy gift cards or bypass standard banking channels.';

    const lower = content.toLowerCase();
    if (lower.includes('irs') || lower.includes('arrest') || lower.includes('tax') || lower.includes('police')) {
      aiContent =
        'Government agencies such as the IRS or local police never demand gift card payments, never threaten immediate arrest over the phone, and never tell you to stay on the line without speaking to anyone. You are completely safe to hang up. Would you like to void this authorization now?';
    } else if (lower.includes('bank') || lower.includes('chase') || lower.includes('fraud') || lower.includes('wire')) {
      aiContent =
        'Bank fraud departments will never instruct customers to purchase digital codes, physical tokens, or transfer funds to "safe accounts". We can trigger an independent verification call through Kernel to your bank’s certified phone number.';
    } else if (lower.includes('personal') || lower.includes('gift for') || lower.includes('birthday')) {
      aiContent =
        'Thank you. We have logged this confirmation. If you are entirely certain you are not acting under someone else’s instructions, you can verify and proceed to capture.';
    }

    const aiMsg: InterventionMessage = {
      id: `msg_ai_${Date.now() + 1}`,
      sender: 'AI_ASSISTANT',
      content: aiContent,
      timestamp: new Date().toISOString(),
      quickReplies: [
        'Void this payment now',
        'Call official helpline to verify',
        'Notify my trusted contact',
      ],
    };

    session.messages.push(aiMsg);

    // Sync with backend AI & message store
    if (typeof window !== 'undefined') {
      fetch(`/api/intervention/${encodeURIComponent(session.paymentId)}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      }).catch((e) => console.warn('[API SYNC] Background message call failed:', e));
    }

    return { session: { ...session }, aiResponse: aiMsg };
  }

  triggerIndependentVerification(sessionId: string): IndependentVerificationState | null {
    const session = this.interventions[sessionId];
    if (!session) return null;

    session.independentVerification.status = 'PASSED';
    session.independentVerification.verificationRef = `KV-${Math.floor(1000 + Math.random() * 9000)}`;
    session.independentVerification.notes =
      'Official directory verified: Agency confirms no telephonic demand or warrant on file.';

    this.addAuditLog({
      paymentId: session.paymentId,
      eventType: 'INDEPENDENT_VERIFICATION_ATTEMPTED',
      actor: 'SCAM_BRAKE_AI',
      summary: `Kernel verified check completed for ${session.independentVerification.targetOrganization}. Result: PASSED.`,
      details: { ref: session.independentVerification.verificationRef },
    });

    return { ...session.independentVerification };
  }

  grantTrustedContactConsent(sessionId: string): TrustedContactConsentState | null {
    const session = this.interventions[sessionId];
    if (!session) return null;

    session.trustedContact.consentGranted = true;
    session.trustedContact.notificationSent = true;
    session.trustedContact.sentAt = new Date().toISOString();
    session.trustedContact.response = 'CONFIRMED_SCAM';

    this.addAuditLog({
      paymentId: session.paymentId,
      eventType: 'TRUSTED_CONTACT_NOTIFIED',
      actor: 'CUSTOMER',
      summary: `Customer granted explicit consent to notify trusted contact: ${session.trustedContact.name}. Notification dispatched via SMS.`,
      details: { contact: session.trustedContact.name, phone: session.trustedContact.maskedPhone },
    });

    // Sync with backend trusted contact manager
    if (typeof window !== 'undefined') {
      fetch(`/api/intervention/${encodeURIComponent(session.paymentId)}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentGranted: true }),
      }).catch((e) => console.warn('[API SYNC] Consent sync failed:', e));

      fetch(`/api/intervention/${encodeURIComponent(session.paymentId)}/notify-contact`, {
        method: 'POST',
      }).catch((e) => console.warn('[API SYNC] Notify sync failed:', e));
    }

    return { ...session.trustedContact };
  }

  // Audit Logs
  getAuditLogs(paymentId?: string): AuditEvent[] {
    if (paymentId) {
      return this.auditLogs.filter((l) => l.paymentId === paymentId);
    }
    return [...this.auditLogs];
  }

  addAuditLog(event: Omit<AuditEvent, 'id' | 'timestamp' | 'immutableHash'>): AuditEvent {
    const newLog: AuditEvent = {
      ...event,
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      immutableHash: `sha256:${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`,
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  // Metrics
  getDashboardMetrics(): DashboardMetrics {
    // Recompute directly from payments to ensure mathematical coherence
    const totalTransactionsReviewed = this.payments.length;
    let activeHoldAmount = 0;
    let activeHoldCount = 0;
    let voidedFraudAmount = 0;
    let voidedFraudCount = 0;
    let capturedLegitimateAmount = 0;
    let capturedLegitimateCount = 0;
    let interventionsCount = 0;

    for (const p of this.payments) {
      if (p.authorizationStatus === 'HOLD_ACTIVE') {
        activeHoldAmount += p.amount;
        activeHoldCount++;
      } else if (p.authorizationStatus === 'VOIDED') {
        voidedFraudAmount += p.amount;
        voidedFraudCount++;
      } else if (p.authorizationStatus === 'CAPTURED') {
        capturedLegitimateAmount += p.amount;
        capturedLegitimateCount++;
      }

      if (p.interventionStatus === 'ACTIVE_INTERVENTION' || p.interventionStatus === 'SCAM_CONFIRMED') {
        interventionsCount++;
      }
    }

    const totalProtectedVolume = activeHoldAmount + voidedFraudAmount + capturedLegitimateAmount;

    return {
      totalProtectedVolume,
      totalTransactionsReviewed,
      activeHoldCount,
      activeHoldAmount,
      interventionsCount,
      voidedFraudCount,
      voidedFraudAmount,
      capturedLegitimateCount,
      capturedLegitimateAmount,
      falsePositiveRate: 0.0,
      medianInterventionSeconds: 142,
    };
  }

  getMetrics(): DashboardMetrics {
    return this.getDashboardMetrics();
  }

  getSponsors(): SponsorIntegration[] {
    return [...SPONSORS];
  }

  getScenarios(): SimulationScenario[] {
    return [...SIMULATION_SCENARIOS];
  }

  getSimulationScenarios(): SimulationScenario[] {
    return this.getScenarios();
  }

  resetState(): void {
    this.payments = [...SEED_PAYMENTS];
    this.interventions = JSON.parse(JSON.stringify(SEED_INTERVENTIONS));
    this.auditLogs = [...SEED_AUDIT_LOGS];
  }
}

export const mockStore = new ScamBrakeMockStore();
