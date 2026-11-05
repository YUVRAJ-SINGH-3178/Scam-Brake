import { prisma, checkDatabaseConnection } from './client.ts';
import type {
  Payment,
  InterventionSession,
  InterventionMessage,
  AuditEvent,
  DashboardMetrics,
  RiskLevel,
  AuthorizationStatus,
  SponsorIntegration,
  SimulationScenario,
} from '../../types/index.ts';
import {
  SEED_PAYMENTS,
  SEED_INTERVENTIONS,
  SEED_AUDIT_LOGS,
  METRICS,
  SIMULATION_SCENARIOS,
  SPONSORS,
} from '../../data/seedData.ts';
import crypto from 'crypto';

// In-memory persistent transactional fallback store
class FallbackRepository {
  public payments: Payment[] = JSON.parse(JSON.stringify(SEED_PAYMENTS));
  public interventions: Record<string, InterventionSession> = JSON.parse(
    JSON.stringify(SEED_INTERVENTIONS)
  );
  public auditLogs: AuditEvent[] = JSON.parse(JSON.stringify(SEED_AUDIT_LOGS));
  public sponsors: SponsorIntegration[] = JSON.parse(JSON.stringify(SPONSORS));
  public scenarios: SimulationScenario[] = JSON.parse(JSON.stringify(SIMULATION_SCENARIOS));
  public riskPolicy = {
    autoHoldThreshold: 60,
    autoCaptureThreshold: 25,
    interventionTimeoutMinutes: 10,
    timeoutAction: 'VOID' as 'VOID' | 'MANUAL_REVIEW' | 'ESCALATE',
    requireTrustedContactOver: 1000.0 as number | null,
    prohibitRemoteDesktopGiftCard: true,
  };
  public operations: Array<{
    id: string;
    paymentId: string;
    operationType: string;
    idempotencyKey: string;
    status: string;
    createdAt: string;
  }> = [];
  public webhooks: Array<{
    eventId: string;
    eventType: string;
    resourceId?: string;
    processedAt: string;
  }> = [];
}

const fallback = new FallbackRepository();

/**
 * Computes deterministic Merkle-style SHA-256 seal for an audit event
 */
export function calculateAuditHash(
  paymentId: string,
  eventType: string,
  timestamp: string,
  actor: string,
  prevHash: string = ''
): string {
  return crypto
    .createHash('sha256')
    .update(`${paymentId}:${eventType}:${timestamp}:${actor}:${prevHash}`)
    .digest('hex');
}

export const dbRepository = {
  // --------------------------------------------------------------------------
  // PAYMENTS
  // --------------------------------------------------------------------------
  async getPayments(filter?: {
    search?: string;
    riskLevel?: RiskLevel;
    status?: AuthorizationStatus;
    merchantId?: string;
  }): Promise<Payment[]> {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        const rows = await prisma.payment.findMany({
          include: {
            customer: true,
            riskAssessments: { include: { signals: true } },
            paymentAuthorization: true,
            paypalOrder: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        let results: Payment[] = rows.map((r) => ({
          id: r.id,
          paymentReference: r.paymentReference,
          paypalOrderId: r.paypalOrder?.paypalOrderId || '',
          paypalAuthorizationId: r.paymentAuthorization?.paypalAuthorizationId || '',
          merchantId: r.merchantId,
          merchantName: 'Apex Electronics Direct',
          merchantCategory: 'Consumer Electronics',
          productName: r.productName,
          productCategory: r.productCategory,
          amount: Number(r.amount),
          currency: 'USD',
          riskScore: r.riskScore,
          riskLevel: r.riskLevel as RiskLevel,
          authorizationStatus: r.authorizationStatus as AuthorizationStatus,
          interventionStatus: r.interventionStatus as any,
          customer: {
            id: r.customer?.id || 'cust_unknown',
            name: r.customer?.name || 'Customer',
            maskedEmail: r.customer?.email ? r.customer.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'c***@mail.com',
            maskedPhone: r.customer?.phone ? r.customer.phone.replace(/(\+\d{1,2}\s\(\d{3}\)\s)\d{3}-(\d{4})/, '$1***-$2') : '+1 (555) ***-5678',
            accountAgeMonths: r.customer?.accountAgeMonths || 12,
            hasTrustedContact: true,
          },
          createdAt: r.createdAt.toISOString(),
          authorizedAt: r.authorizedAt?.toISOString() || r.createdAt.toISOString(),
          holdExpiresAt: r.holdExpiresAt?.toISOString() || new Date(Date.now() + 86400000).toISOString(),
          resolvedAt: r.resolvedAt?.toISOString(),
          resolutionNotes: r.resolutionNotes || undefined,
          riskSignals: (r.riskAssessments[0]?.signals || []).map((s) => ({
            id: s.id,
            category: s.category as any,
            severity: s.severity as any,
            title: s.title,
            description: s.description,
            source: s.source as any,
            confidence: s.confidence,
            detectedAt: s.detectedAt.toISOString(),
          })),
          authorizationHoldSecondsRemaining: r.holdExpiresAt
            ? Math.max(0, Math.floor((r.holdExpiresAt.getTime() - Date.now()) / 1000))
            : 0,
        }));

        if (filter?.search) {
          const q = filter.search.toLowerCase();
          results = results.filter(
            (p) =>
              p.paymentReference.toLowerCase().includes(q) ||
              p.productName.toLowerCase().includes(q) ||
              p.customer.name.toLowerCase().includes(q)
          );
        }
        if (filter?.riskLevel) {
          results = results.filter((p) => p.riskLevel === filter.riskLevel);
        }
        if (filter?.status) {
          results = results.filter((p) => p.authorizationStatus === filter.status);
        }
        return results;
      } catch (err) {
        console.error('[DB] Error querying Postgres payments, falling back to local store:', err);
      }
    }

    // Fallback store
    let result = [...fallback.payments];
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
    return result;
  },

  async getPaymentById(id: string): Promise<Payment | undefined> {
    const payments = await this.getPayments();
    return payments.find(
      (p) =>
        p.id === id ||
        p.paymentReference === id ||
        p.paypalOrderId === id ||
        p.paypalAuthorizationId === id
    );
  },

  async savePayment(payment: Payment): Promise<Payment> {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        await prisma.payment.upsert({
          where: { paymentReference: payment.paymentReference },
          update: {
            state: payment.authorizationStatus === 'CAPTURED' ? 'CAPTURED' : payment.authorizationStatus === 'VOIDED' ? 'VOIDED' : 'AUTHORIZED',
            authorizationStatus: payment.authorizationStatus,
            interventionStatus: payment.interventionStatus,
            riskScore: payment.riskScore,
            riskLevel: payment.riskLevel,
            resolvedAt: payment.resolvedAt ? new Date(payment.resolvedAt) : null,
            resolutionNotes: payment.resolutionNotes,
          },
          create: {
            id: payment.id,
            paymentReference: payment.paymentReference,
            merchantId: payment.merchantId,
            amount: payment.amount,
            currency: payment.currency,
            productName: payment.productName,
            productCategory: payment.productCategory,
            state: payment.authorizationStatus === 'CAPTURED' ? 'CAPTURED' : payment.authorizationStatus === 'VOIDED' ? 'VOIDED' : 'AUTHORIZED',
            authorizationStatus: payment.authorizationStatus,
            interventionStatus: payment.interventionStatus,
            riskScore: payment.riskScore,
            riskLevel: payment.riskLevel,
            authorizedAt: new Date(payment.authorizedAt),
            holdExpiresAt: new Date(payment.holdExpiresAt),
            resolvedAt: payment.resolvedAt ? new Date(payment.resolvedAt) : null,
            resolutionNotes: payment.resolutionNotes,
          },
        });
      } catch (err) {
        console.error('[DB] Postgres savePayment error:', err);
      }
    }

    const idx = fallback.payments.findIndex(
      (p) => p.id === payment.id || p.paymentReference === payment.paymentReference
    );
    if (idx >= 0) {
      fallback.payments[idx] = { ...payment };
    } else {
      fallback.payments.unshift({ ...payment });
    }
    return payment;
  },

  // --------------------------------------------------------------------------
  // PAYMENT OPERATIONS & IDEMPOTENCY
  // --------------------------------------------------------------------------
  async checkIdempotency(idempotencyKey: string): Promise<boolean> {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        const op = await prisma.paymentOperation.findUnique({
          where: { idempotencyKey },
        });
        return !!op;
      } catch (e) {
        console.error('[DB] checkIdempotency error:', e);
      }
    }
    return fallback.operations.some((op) => op.idempotencyKey === idempotencyKey);
  },

  async recordOperation(data: {
    paymentId: string;
    operationType: string;
    idempotencyKey: string;
    status: string;
    requestPayload?: any;
    responsePayload?: any;
    errorMessage?: string;
    executedBy?: string;
  }) {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        await prisma.paymentOperation.create({
          data: {
            paymentId: data.paymentId,
            operationType: data.operationType,
            idempotencyKey: data.idempotencyKey,
            status: data.status,
            requestPayload: data.requestPayload,
            responsePayload: data.responsePayload,
            errorMessage: data.errorMessage,
            executedBy: data.executedBy || 'SYSTEM',
          },
        });
      } catch (e) {
        console.error('[DB] recordOperation error:', e);
      }
    }
    fallback.operations.push({
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      paymentId: data.paymentId,
      operationType: data.operationType,
      idempotencyKey: data.idempotencyKey,
      status: data.status,
      createdAt: new Date().toISOString(),
    });
  },

  // --------------------------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------------------------
  async recordAuditLog(event: {
    paymentId?: string;
    eventType: string;
    actor: 'CUSTOMER' | 'PAYPAL_SYSTEM' | 'SCAM_BRAKE_AI' | 'MERCHANT_POLICY' | 'SYSTEM_WORKER';
    summary: string;
    details?: Record<string, unknown>;
  }): Promise<AuditEvent> {
    const timestamp = new Date().toISOString();
    const prevLog = fallback.auditLogs[0];
    const prevHash = prevLog ? prevLog.immutableHash : '0'.repeat(64);
    const hash = calculateAuditHash(
      event.paymentId || 'global',
      event.eventType,
      timestamp,
      event.actor,
      prevHash
    );

    const logEntry: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      paymentId: event.paymentId || 'global',
      eventType: event.eventType as any,
      actor: event.actor as any,
      summary: event.summary,
      timestamp,
      details: event.details || {},
      immutableHash: hash,
      sha256Hash: hash,
    };

    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        await prisma.auditLog.create({
          data: {
            id: logEntry.id,
            paymentId: event.paymentId && event.paymentId !== 'global' ? event.paymentId : null,
            eventType: event.eventType,
            actor: event.actor,
            summary: event.summary,
            details: event.details ? (event.details as any) : undefined,
            immutableHash: hash,
            prevHash,
          },
        });
      } catch (err) {
        console.error('[DB] recordAuditLog error:', err);
      }
    }

    fallback.auditLogs.unshift(logEntry);
    return logEntry;
  },

  async getAuditLogs(paymentId?: string): Promise<AuditEvent[]> {
    if (paymentId) {
      return fallback.auditLogs.filter((l) => l.paymentId === paymentId);
    }
    return [...fallback.auditLogs];
  },

  // --------------------------------------------------------------------------
  // INTERVENTIONS & CONVERSATIONS
  // --------------------------------------------------------------------------
  async getInterventionByPaymentId(paymentId: string): Promise<InterventionSession | undefined> {
    return fallback.interventions[paymentId];
  },

  async saveIntervention(session: InterventionSession): Promise<InterventionSession> {
    fallback.interventions[session.paymentId] = { ...session };
    return session;
  },

  async addInterventionMessage(
    paymentId: string,
    message: Omit<InterventionMessage, 'id' | 'timestamp'>
  ): Promise<InterventionMessage> {
    const session = fallback.interventions[paymentId];
    const newMsg: InterventionMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    if (session) {
      session.messages.push(newMsg);
      await this.saveIntervention(session);
    }
    return newMsg;
  },

  // --------------------------------------------------------------------------
  // METRICS & DASHBOARD
  // --------------------------------------------------------------------------
  async getMetrics(): Promise<DashboardMetrics> {
    const payments = await this.getPayments();

    let totalProtectedVolume = 0;
    let activeHoldCount = 0;
    let activeHoldAmount = 0;
    let voidedFraudCount = 0;
    let voidedFraudAmount = 0;
    let capturedLegitimateCount = 0;
    let capturedLegitimateAmount = 0;
    let interventionsCount = 0;

    for (const p of payments) {
      totalProtectedVolume += p.amount;
      if (p.authorizationStatus === 'HOLD_ACTIVE' || p.authorizationStatus === 'PENDING_REVIEW') {
        activeHoldCount++;
        activeHoldAmount += p.amount;
      } else if (p.authorizationStatus === 'VOIDED') {
        voidedFraudCount++;
        voidedFraudAmount += p.amount;
      } else if (p.authorizationStatus === 'CAPTURED') {
        capturedLegitimateCount++;
        capturedLegitimateAmount += p.amount;
      }
      if (p.interventionStatus !== 'NOT_REQUIRED') {
        interventionsCount++;
      }
    }

    return {
      totalProtectedVolume,
      totalTransactionsReviewed: payments.length,
      activeHoldCount,
      activeHoldAmount,
      interventionsCount,
      voidedFraudCount,
      voidedFraudAmount,
      capturedLegitimateCount,
      capturedLegitimateAmount,
      falsePositiveRate: 0.0,
      medianInterventionSeconds: 184,
    };
  },

  // --------------------------------------------------------------------------
  // SPONSORS & INTEGRATIONS
  // --------------------------------------------------------------------------
  async getSponsors(): Promise<SponsorIntegration[]> {
    return [...fallback.sponsors];
  },

  async updateSponsorStatus(
    sponsorKey: string,
    status: SponsorIntegration['status'],
    latencyMs?: number
  ): Promise<SponsorIntegration | undefined> {
    const s = fallback.sponsors.find((x) => x.id === sponsorKey);
    if (s) {
      s.status = status;
      if (latencyMs !== undefined) s.latencyMs = latencyMs;
      return { ...s };
    }
    return undefined;
  },

  // --------------------------------------------------------------------------
  // SIMULATION SCENARIOS
  // --------------------------------------------------------------------------
  async getSimulationScenarios(): Promise<SimulationScenario[]> {
    return [...fallback.scenarios];
  },

  // --------------------------------------------------------------------------
  // POLICIES
  // --------------------------------------------------------------------------
  async getRiskPolicy() {
    return { ...fallback.riskPolicy };
  },

  async updateRiskPolicy(policy: Partial<typeof fallback.riskPolicy>) {
    fallback.riskPolicy = { ...fallback.riskPolicy, ...policy };
    return { ...fallback.riskPolicy };
  },

  // --------------------------------------------------------------------------
  // WEBHOOK DEDUPLICATION
  // --------------------------------------------------------------------------
  async isWebhookProcessed(eventId: string): Promise<boolean> {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        const found = await prisma.webhookEvent.findUnique({
          where: { eventId },
        });
        return !!found && found.status === 'PROCESSED';
      } catch (err) {
        console.error('[DB] isWebhookProcessed error:', err);
      }
    }
    return fallback.webhooks.some((w) => w.eventId === eventId);
  },

  async markWebhookProcessed(eventId: string, eventType: string, resourceId?: string) {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        await prisma.webhookEvent.upsert({
          where: { eventId },
          update: { status: 'PROCESSED', processedAt: new Date() },
          create: {
            eventId,
            eventType,
            resourceId,
            status: 'PROCESSED',
            signatureValid: true,
            payload: {},
            processedAt: new Date(),
          },
        });
      } catch (err) {
        console.error('[DB] markWebhookProcessed error:', err);
      }
    }
    fallback.webhooks.push({
      eventId,
      eventType,
      resourceId,
      processedAt: new Date().toISOString(),
    });
  },
};
