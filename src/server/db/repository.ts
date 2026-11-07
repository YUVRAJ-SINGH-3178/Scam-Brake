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
type RiskPolicySettings = {
  autoHoldThreshold: number;
  autoCaptureThreshold: number;
  interventionTimeoutMinutes: number;
  timeoutAction: 'VOID' | 'MANUAL_REVIEW' | 'ESCALATE';
  requireTrustedContactOver: number | null;
  prohibitRemoteDesktopGiftCard: boolean;
};

class FallbackRepository {
  public payments: Payment[] = JSON.parse(JSON.stringify(SEED_PAYMENTS));
  public interventions: Record<string, InterventionSession> = JSON.parse(
    JSON.stringify(SEED_INTERVENTIONS)
  );
  public auditLogs: AuditEvent[] = JSON.parse(JSON.stringify(SEED_AUDIT_LOGS));
  public sponsors: SponsorIntegration[] = JSON.parse(JSON.stringify(SPONSORS));
  public scenarios: SimulationScenario[] = JSON.parse(JSON.stringify(SIMULATION_SCENARIOS));
  public riskPolicy: RiskPolicySettings = {
    autoHoldThreshold: 60,
    autoCaptureThreshold: 25,
    interventionTimeoutMinutes: 10,
    timeoutAction: 'VOID' as 'VOID' | 'MANUAL_REVIEW' | 'ESCALATE',
    requireTrustedContactOver: 1000,
    prohibitRemoteDesktopGiftCard: true,
  };
  public merchantRiskPolicies: Record<string, RiskPolicySettings> = {};
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
        throw new Error('Unable to reserve payment operation in PostgreSQL.', { cause: error });
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
        return;
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to persist payment operation');
        throw new Error('Unable to persist payment operation in PostgreSQL.', { cause: error });
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
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        const row = await prisma.interventionSession.findUnique({
          where: { paymentId },
          include: { messages: { orderBy: { timestamp: 'asc' } }, independentVerification: true, trustedContactConsent: { include: { trustedContact: true } } },
        });
        if (!row) return undefined;
        const verification = row.independentVerification;
        const consent = row.trustedContactConsent;
        return {
          id: row.id,
          paymentId: row.paymentId,
          status: row.status as InterventionSession['status'],
          scamHypothesis: row.scamHypothesis || '',
          coercionIndicators: Array.isArray(row.coercionIndicators) ? row.coercionIndicators.filter((value): value is string => typeof value === 'string') : [],
          confidenceScore: row.confidenceScore,
          customerDecision: row.customerDecision as InterventionSession['customerDecision'],
          startedAt: row.startedAt.toISOString(),
          completedAt: row.completedAt?.toISOString(),
          messages: row.messages.map((message) => ({
            id: message.id,
            sender: message.sender as InterventionMessage['sender'],
            content: message.content,
            timestamp: message.timestamp.toISOString(),
            quickReplies: Array.isArray(message.quickReplies) ? message.quickReplies.filter((value): value is string => typeof value === 'string') : [],
            flaggedKeywords: Array.isArray(message.flaggedKeywords) ? message.flaggedKeywords.filter((value): value is string => typeof value === 'string') : [],
          })),
          independentVerification: {
            enabled: Boolean(verification),
            provider: 'KERNEL_VERIFY',
            targetOrganization: verification?.targetOrganization || '',
            officialPhone: verification?.officialPhone || '',
            status: (verification?.status || 'PENDING') as InterventionSession['independentVerification']['status'],
            verificationRef: verification?.verificationRef || undefined,
            notes: verification?.notes || '',
          },
          trustedContact: {
            registered: Boolean(consent?.trustedContact),
            name: consent?.trustedContact.name || '',
            relationship: consent?.trustedContact.relationship || '',
            maskedPhone: consent?.trustedContact.phone ? `***${consent.trustedContact.phone.slice(-4)}` : '',
            consentGranted: Boolean(consent?.consentGranted && !consent.revokedAt),
            notificationSent: false,
          },
        };
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to load persistent intervention session');
        throw new Error('Unable to load persistent intervention session.', { cause: error });
      }
    }
    return fallback.interventions[paymentId];
  },

  async saveIntervention(session: InterventionSession): Promise<InterventionSession> {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        await prisma.interventionSession.upsert({
          where: { paymentId: session.paymentId },
          create: {
            id: session.id,
            paymentId: session.paymentId,
            status: session.status,
            scamHypothesis: session.scamHypothesis,
            coercionIndicators: session.coercionIndicators,
            confidenceScore: session.confidenceScore,
            customerDecision: session.customerDecision,
            startedAt: new Date(session.startedAt),
            completedAt: session.completedAt ? new Date(session.completedAt) : null,
          },
          update: {
            status: session.status,
            scamHypothesis: session.scamHypothesis,
            coercionIndicators: session.coercionIndicators,
            confidenceScore: session.confidenceScore,
            customerDecision: session.customerDecision,
            completedAt: session.completedAt ? new Date(session.completedAt) : null,
          },
        });
        for (const message of session.messages) {
          await prisma.conversationMessage.upsert({
            where: { id: message.id },
            create: {
              id: message.id,
              interventionSessionId: session.id,
              sender: message.sender,
              content: message.content,
              quickReplies: message.quickReplies,
              flaggedKeywords: message.flaggedKeywords,
              timestamp: new Date(message.timestamp),
            },
            update: {
              content: message.content,
              quickReplies: message.quickReplies,
              flaggedKeywords: message.flaggedKeywords,
            },
          });
        }
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to save persistent intervention session');
        throw new Error('Unable to save persistent intervention session.', { cause: error });
      }
    }
    fallback.interventions[session.paymentId] = { ...session };
    return session;
  },

  async updateInterventionStatus(params: {
    paymentId: string;
    status: InterventionSession['status'];
    customerDecision?: InterventionSession['customerDecision'];
    completedAt?: Date;
  }): Promise<void> {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        await prisma.interventionSession.update({
          where: { paymentId: params.paymentId },
          data: {
            status: params.status,
            ...(params.customerDecision ? { customerDecision: params.customerDecision } : {}),
            ...(params.completedAt ? { completedAt: params.completedAt } : {}),
          },
        });
        return;
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to update persistent intervention status');
        throw new Error('Unable to update persistent intervention status.', { cause: error });
      }
    }
    const session = fallback.interventions[params.paymentId];
    if (!session) throw new Error('Intervention session not found.');
    session.status = params.status;
    if (params.customerDecision) session.customerDecision = params.customerDecision;
    if (params.completedAt) session.completedAt = params.completedAt.toISOString();
  },

  async addInterventionMessage(
    paymentId: string,
    message: Omit<InterventionMessage, 'id' | 'timestamp'>
  ): Promise<InterventionMessage> {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        const persistedSession = await prisma.interventionSession.findUnique({ where: { paymentId } });
        if (!persistedSession) throw new Error('Intervention session does not exist.');
        const row = await prisma.conversationMessage.create({
          data: {
            interventionSessionId: persistedSession.id,
            sender: message.sender,
            content: message.content,
            quickReplies: message.quickReplies,
            flaggedKeywords: message.flaggedKeywords,
          },
        });
        return {
          id: row.id,
          sender: row.sender as InterventionMessage['sender'],
          content: row.content,
          timestamp: row.timestamp.toISOString(),
          quickReplies: Array.isArray(row.quickReplies) ? row.quickReplies.filter((value): value is string => typeof value === 'string') : [],
          flaggedKeywords: Array.isArray(row.flaggedKeywords) ? row.flaggedKeywords.filter((value): value is string => typeof value === 'string') : [],
        };
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to save intervention message');
        throw new Error('Unable to save persistent intervention message.', { cause: error });
      }
    }
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
      } else if (p.authorizationStatus === 'VOIDED' && p.interventionStatus === 'SCAM_CONFIRMED') {
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
  async getRiskPolicy(merchantId?: string) {
    if (merchantId) {
      const isPg = await checkDatabaseConnection();
      if (isPg) {
        try {
          const policy = await prisma.merchantRiskPolicy.findUnique({ where: { merchantId } });
          if (policy) {
            return {
              autoHoldThreshold: policy.autoHoldThreshold,
              autoCaptureThreshold: policy.autoCaptureThreshold,
              interventionTimeoutMinutes: policy.interventionTimeoutMinutes,
              timeoutAction: policy.timeoutAction as 'VOID' | 'MANUAL_REVIEW' | 'ESCALATE',
              requireTrustedContactOver: policy.requireTrustedContactOver === null ? null : Number(policy.requireTrustedContactOver),
              prohibitRemoteDesktopGiftCard: policy.prohibitRemoteDesktopGiftCard,
            };
          }
        } catch (error: unknown) {
          handleDatabaseFailure(error, 'Unable to load merchant risk policy');
          throw new Error('Unable to load merchant risk policy.', { cause: error });
        }
      }
      return { ...(fallback.merchantRiskPolicies[merchantId] || fallback.riskPolicy) };
    }
    return { ...fallback.riskPolicy };
  },

  async updateRiskPolicy(merchantId: string, policy: Partial<typeof fallback.riskPolicy>) {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        const saved = await prisma.merchantRiskPolicy.upsert({
          where: { merchantId },
          create: { merchantId, ...policy },
          update: policy,
        });
        return {
          autoHoldThreshold: saved.autoHoldThreshold,
          autoCaptureThreshold: saved.autoCaptureThreshold,
          interventionTimeoutMinutes: saved.interventionTimeoutMinutes,
          timeoutAction: saved.timeoutAction as 'VOID' | 'MANUAL_REVIEW' | 'ESCALATE',
          requireTrustedContactOver: saved.requireTrustedContactOver === null ? null : Number(saved.requireTrustedContactOver),
          prohibitRemoteDesktopGiftCard: saved.prohibitRemoteDesktopGiftCard,
        };
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to update merchant risk policy');
        throw new Error('Unable to update merchant risk policy.', { cause: error });
      }
    }
    fallback.merchantRiskPolicies[merchantId] = { ...fallback.riskPolicy, ...fallback.merchantRiskPolicies[merchantId], ...policy };
    return { ...fallback.merchantRiskPolicies[merchantId] };
  },

  // --------------------------------------------------------------------------
  // WEBHOOK DEDUPLICATION
  // --------------------------------------------------------------------------
  async claimWebhookEvent(eventId: string, eventType: string, resourceId: string | undefined, payload: unknown) {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        const now = new Date();
        try {
          await prisma.webhookEvent.create({
            data: { eventId, eventType, resourceId, status: 'PROCESSING', signatureValid: true, payload: payload as Prisma.InputJsonValue },
          });
          return 'CLAIMED' as const;
        } catch (error: unknown) {
          if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
        }

        const existing = await prisma.webhookEvent.findUnique({ where: { eventId } });
        if (!existing) throw new Error('Webhook claim disappeared after unique-key conflict.');
        if (existing.status === 'PROCESSED') return 'PROCESSED' as const;

        // A crashed worker may leave PROCESSING behind. Reclaim only after five minutes.
        const staleBefore = new Date(now.getTime() - 5 * 60_000);
        const reclaimed = await prisma.webhookEvent.updateMany({
          where: {
            eventId,
            OR: [
              { status: 'FAILED' },
              { status: 'PROCESSING', createdAt: { lt: staleBefore } },
              { status: 'PENDING', createdAt: { lt: staleBefore } },
            ],
          },
          data: { eventType, resourceId, payload: payload as Prisma.InputJsonValue, status: 'PROCESSING', signatureValid: true, errorMessage: null, processedAt: null, createdAt: now },
        });
        return reclaimed.count === 1 ? 'CLAIMED' as const : 'IN_PROGRESS' as const;
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to claim webhook event');
        throw new Error('Unable to claim webhook event.', { cause: error });
      }
    }

    const existing = fallback.webhooks.find((webhook) => webhook.eventId === eventId);
    if (existing) return 'PROCESSED' as const;
    fallback.webhooks.push({ eventId, eventType, resourceId, processedAt: '' });
    return 'CLAIMED' as const;
  },

  async completeWebhookEvent(eventId: string) {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        const result = await prisma.webhookEvent.updateMany({
          where: { eventId, status: 'PROCESSING' },
          data: { status: 'PROCESSED', processedAt: new Date(), errorMessage: null },
        });
        if (result.count !== 1) throw new Error('Webhook event is not owned by this processor.');
        return;
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to complete webhook event');
        throw new Error('Unable to complete webhook event.', { cause: error });
      }
    }
    const fallbackEvent = fallback.webhooks.find((webhook) => webhook.eventId === eventId);
    if (fallbackEvent) fallbackEvent.processedAt = new Date().toISOString();
  },

  async failWebhookEvent(eventId: string, errorMessage: string) {
    const isPg = await checkDatabaseConnection();
    if (isPg) {
      try {
        await prisma.webhookEvent.updateMany({
          where: { eventId, status: 'PROCESSING' },
          data: { status: 'FAILED', errorMessage: errorMessage.slice(0, 1000) },
        });
      } catch (error: unknown) {
        handleDatabaseFailure(error, 'Unable to record webhook failure');
      }
    } else {
      fallback.webhooks = fallback.webhooks.filter((webhook) => webhook.eventId !== eventId);
    }
  },

  async persistCaptureFromWebhook(paymentId: string, capture: {
    id: string;
    status: string;
    amount: { currency_code: string; value: string };
  }, authorizationId: string, rawResponse: unknown) {
    if (!(await checkDatabaseConnection())) throw new Error('PostgreSQL is required to persist a PayPal capture webhook.');
    try {
      const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { paymentAuthorization: true } });
      if (!payment || !payment.paymentAuthorization || payment.paymentAuthorization.paypalAuthorizationId !== authorizationId) {
        throw new Error('PayPal capture does not match the stored payment authorization.');
      }
      if (capture.amount.currency_code !== payment.currency || Number(capture.amount.value) !== Number(payment.amount)) {
        throw new Error('PayPal capture amount or currency does not match the stored payment.');
      }
      await prisma.$transaction([
        prisma.paymentCapture.upsert({
          where: { paymentId },
          create: {
            paymentId, paypalCaptureId: capture.id, status: capture.status,
            amount: capture.amount.value, currency: capture.amount.currency_code, finalCapture: true,
            rawResponse: rawResponse as Prisma.InputJsonValue,
          },
          update: {
            paypalCaptureId: capture.id, status: capture.status,
            amount: capture.amount.value, currency: capture.amount.currency_code, finalCapture: true,
            rawResponse: rawResponse as Prisma.InputJsonValue,
          },
        }),
        prisma.paymentAuthorization.update({ where: { paymentId }, data: { status: 'CAPTURED' } }),
      ]);
    } catch (error: unknown) {
      handleDatabaseFailure(error, 'Unable to persist provider capture reconciliation');
      throw new Error('Unable to persist provider capture reconciliation.', { cause: error });
    }
  },

  async persistVoidFromWebhook(paymentId: string, authorizationId: string) {
    if (!(await checkDatabaseConnection())) throw new Error('PostgreSQL is required to persist a PayPal void webhook.');
    try {
      const result = await prisma.paymentAuthorization.updateMany({
        where: { paymentId, paypalAuthorizationId: authorizationId },
        data: { status: 'VOIDED' },
      });
      if (result.count !== 1) throw new Error('PayPal void does not match a stored payment authorization.');
    } catch (error: unknown) {
      handleDatabaseFailure(error, 'Unable to persist provider void reconciliation');
      throw new Error('Unable to persist provider void reconciliation.', { cause: error });
    }
  },

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
