import { Prisma } from '@prisma/client';
import { prisma, checkDatabaseConnection } from './client.ts';
import type {
  Payment,
  InterventionSession,
  InterventionMessage,
  AuditEvent,
  DashboardMetrics,
  RiskLevel,
  InterventionStatus,
  SignalCategory,
  RiskSignal,
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

// In-memory development fallback store; data is neither persistent nor transactional.
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

export function buildPaymentWhere(filter?: {
  riskLevel?: RiskLevel;
  status?: AuthorizationStatus;
  merchantId?: string;
}): Prisma.PaymentWhereInput {
  const where: Prisma.PaymentWhereInput = {};
  if (filter?.merchantId) where.merchantId = filter.merchantId;
  if (filter?.riskLevel) where.riskLevel = filter.riskLevel;
  if (filter?.status) where.authorizationStatus = filter.status;
  return where;
}

function handleDatabaseFailure(error: unknown, message: string): void {
  if (process.env.NODE_ENV === 'production') throw new Error(message, { cause: error });
  console.error(`[DB] ${message}; development fallback is active.`);
}

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
          where: buildPaymentWhere(filter),
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
          interventionStatus: r.interventionStatus as InterventionStatus,
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
            category: s.category as SignalCategory,
            severity: s.severity as RiskLevel,
            title: s.title,
            description: s.description,
            source: s.source as RiskSignal['source'],
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
        return results;
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to query PostgreSQL payments');
      }
    }

    // Fallback store
    let result = [...fallback.payments];
    if (filter?.merchantId) {
      result = result.filter((payment) => payment.merchantId === filter.merchantId);
    }
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

  async getPaymentById(id: string, merchantId?: string): Promise<Payment | undefined> {
    // Pass merchantId for every user initiated lookup. Omitting it is reserved
    // for trusted system workflows (worker, state machine, verified webhooks).
    const payments = await this.getPayments(merchantId ? { merchantId } : undefined);
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
        const updateData = {
          state: payment.authorizationStatus === 'CAPTURED' ? 'CAPTURED' : payment.authorizationStatus === 'VOIDED' ? 'VOIDED' : 'AUTHORIZED',
          authorizationStatus: payment.authorizationStatus,
          interventionStatus: payment.interventionStatus,
          riskScore: payment.riskScore,
          riskLevel: payment.riskLevel,
          resolvedAt: payment.resolvedAt ? new Date(payment.resolvedAt) : null,
          resolutionNotes: payment.resolutionNotes,
        };
        const existing = await prisma.payment.findFirst({
          where: { paymentReference: payment.paymentReference, merchantId: payment.merchantId },
          select: { id: true },
        });
        if (existing) {
          await prisma.payment.update({ where: { id: existing.id }, data: updateData });
        } else {
          const conflictingTenant = await prisma.payment.findUnique({
            where: { paymentReference: payment.paymentReference },
            select: { id: true },
          });
          if (conflictingTenant) throw new Error('Payment reference belongs to another merchant.');
          await prisma.payment.create({
            data: {
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
        }
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to save payment to PostgreSQL');
      }
    }

    const conflict = fallback.payments.find(
      (existing) =>
        (existing.id === payment.id || existing.paymentReference === payment.paymentReference) &&
        existing.merchantId !== payment.merchantId
    );
    if (conflict) throw new Error('Payment record belongs to another merchant.');
    const idx = fallback.payments.findIndex(
      (p) => p.merchantId === payment.merchantId &&
        (p.id === payment.id || p.paymentReference === payment.paymentReference)
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
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to check payment idempotency');
      }
    }
    return fallback.operations.some((op) => op.idempotencyKey === idempotencyKey);
  },

  async reserveOperation(data: {
    paymentId: string;
    operationType: string;
    idempotencyKey: string;
    executedBy?: string;
  }): Promise<{ reserved: boolean; status?: string }> {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        await prisma.paymentOperation.create({
          data: {
            paymentId: data.paymentId,
            operationType: data.operationType,
            idempotencyKey: data.idempotencyKey,
            status: 'PROCESSING',
            executedBy: data.executedBy || 'SYSTEM',
          },
        });
        return { reserved: true, status: 'PROCESSING' };
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          const existing = await prisma.paymentOperation.findUnique({ where: { idempotencyKey: data.idempotencyKey } });
          return { reserved: false, status: existing?.status };
        }
        handleDatabaseFailure(error, 'Unable to reserve payment operation');
      }
    }
    const existing = fallback.operations.find((op) => op.idempotencyKey === data.idempotencyKey);
    if (existing) return { reserved: false, status: existing.status };
    fallback.operations.push({
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      paymentId: data.paymentId,
      operationType: data.operationType,
      idempotencyKey: data.idempotencyKey,
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
    });
    return { reserved: true, status: 'PROCESSING' };
  },

  async recordOperation(data: {
    paymentId: string;
    operationType: string;
    idempotencyKey: string;
    status: string;
    requestPayload?: Prisma.InputJsonValue;
    responsePayload?: Prisma.InputJsonValue;
    errorMessage?: string;
    executedBy?: string;
  }) {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        await prisma.paymentOperation.update({
          where: { idempotencyKey: data.idempotencyKey },
          data: {
            status: data.status,
            requestPayload: data.requestPayload,
            responsePayload: data.responsePayload,
            errorMessage: data.errorMessage,
            executedBy: data.executedBy || 'SYSTEM',
          },
        });
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to persist payment operation');
      }
    }
    const existing = fallback.operations.find((op) => op.idempotencyKey === data.idempotencyKey);
    if (!existing) throw new Error('Payment operation must be reserved before it can be updated.');
    existing.status = data.status;
  },

  // --------------------------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------------------------
  async recordAuditLog(event: {
    paymentId?: string;
    eventType: AuditEvent['eventType'];
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
      eventType: event.eventType,
      actor: event.actor,
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
            details: event.details ? (event.details as Prisma.InputJsonValue) : undefined,
            immutableHash: hash,
            prevHash,
          },
        });
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to persist audit event');
      }
    }

    fallback.auditLogs.unshift(logEntry);
    return logEntry;
  },

  async getAuditLogs(paymentId?: string, merchantId?: string): Promise<AuditEvent[]> {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        const where: Prisma.AuditLogWhereInput = {};
        if (paymentId) where.paymentId = paymentId;
        if (merchantId) where.payment = { is: { merchantId } };
        const rows = await prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' } });
        return rows.map((row) => ({
          id: row.id,
          paymentId: row.paymentId || 'global',
          eventType: row.eventType as AuditEvent['eventType'],
          actor: row.actor as AuditEvent['actor'],
          summary: row.summary,
          timestamp: row.createdAt.toISOString(),
          details: (row.details as Record<string, unknown> | null) || {},
          immutableHash: row.immutableHash,
          sha256Hash: row.immutableHash,
        }));
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to query PostgreSQL audit events');
      }
    }
    let scoped = fallback.auditLogs;
    if (merchantId) {
      const visiblePaymentIds = new Set(
        fallback.payments.filter((payment) => payment.merchantId === merchantId).map((payment) => payment.id)
      );
      scoped = scoped.filter((log) => log.paymentId !== 'global' && visiblePaymentIds.has(log.paymentId));
    }
    if (paymentId) scoped = scoped.filter((log) => log.paymentId === paymentId);
    return [...scoped];
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
  async getMetrics(merchantId: string): Promise<DashboardMetrics> {
    const payments = await this.getPayments({ merchantId });

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
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to check webhook deduplication');
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
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to persist webhook event');
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
