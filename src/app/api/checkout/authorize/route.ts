import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CUSTOMER_SESSION_COOKIE, findActiveCustomerSession } from '@/server/auth/customerSession';
import { checkDatabaseConnection, prisma } from '@/server/db/client';
import { dbRepository } from '@/server/db/repository';
import { paypalClient } from '@/server/paypal/client';
import { hasSameOrigin } from '@/server/auth/session';
import { RiskIntelligenceEngine } from '@/server/risk/engine';

const ApproveSchema = z.object({
  orderID: z.string().regex(/^[A-Za-z0-9_-]{5,64}$/),
  checkoutSessionId: z.string().uuid(),
});

function response(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  if (!hasSameOrigin(req)) return response('Invalid request origin.', 403);
  if (!paypalClient.isSandboxCheckoutAvailable()) return response('PayPal Sandbox checkout is not configured.', 503);
  if (!(await checkDatabaseConnection())) return response('Persistent checkout storage is required.', 503);

  const parsed = ApproveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return response('Invalid PayPal approval response.', 400);
  const token = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  const customerSession = token ? await findActiveCustomerSession(token) : null;
  if (!customerSession) return response('Checkout session expired. Restart checkout.', 401);

  const checkout = await prisma.checkoutSession.findFirst({
    where: {
      id: parsed.data.checkoutSessionId,
      customerSessionId: customerSession.id,
      status: 'AWAITING_BUYER_APPROVAL',
      expiresAt: { gt: new Date() },
    },
    include: { payments: { include: { paypalOrder: true, paymentAuthorization: true } } },
  });
  const payment = checkout?.payments[0];
  if (!checkout || !payment?.paypalOrder || payment.paypalOrder.paypalOrderId !== parsed.data.orderID) {
    return response('PayPal order is not associated with this active checkout session.', 403);
  }
  if (payment.paymentAuthorization && payment.authorizationStatus === 'HOLD_ACTIVE') {
    return NextResponse.json({ authorized: true, paymentId: payment.id, paymentReference: payment.paymentReference, status: payment.authorizationStatus });
  }

  let providerOrder;
  try {
    providerOrder = await paypalClient.getOrder(parsed.data.orderID);
  } catch {
    return response('Unable to verify PayPal order approval. No authorization was requested.', 502);
  }
  const matchingUnit = providerOrder.purchase_units.find((unit) => unit.reference_id === payment.id);
  if (
    providerOrder.id !== payment.paypalOrder.paypalOrderId ||
    providerOrder.status !== 'APPROVED' ||
    providerOrder.intent !== 'AUTHORIZE' ||
    !matchingUnit ||
    matchingUnit.amount?.currency_code !== payment.currency ||
    Number(matchingUnit.amount.value).toFixed(2) !== Number(payment.amount).toFixed(2) ||
    !providerOrder.payer?.payer_id ||
    !providerOrder.payer.email_address
  ) {
    await prisma.checkoutSession.update({ where: { id: checkout.id }, data: { status: 'APPROVAL_VERIFICATION_FAILED' } });
    return response('PayPal approval or order details could not be verified. No authorization was requested.', 409);
  }

  const existingCustomer = await prisma.customer.findUnique({ where: { paypalPayerId: providerOrder.payer.payer_id } });
  const customerName = [providerOrder.payer.name?.given_name, providerOrder.payer.name?.surname].filter(Boolean).join(' ') || providerOrder.payer.email_address;
  const customer = existingCustomer
    ? await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: { email: providerOrder.payer.email_address, name: customerName, phone: providerOrder.payer.phone?.phone_number?.national_number },
      })
    : await prisma.customer.create({
        data: {
          paypalPayerId: providerOrder.payer.payer_id,
          email: providerOrder.payer.email_address,
          name: customerName,
          phone: providerOrder.payer.phone?.phone_number?.national_number,
          accountAgeMonths: 0,
        },
      });

  const risk = await RiskIntelligenceEngine.evaluate({
    merchantId: checkout.merchantId,
    amount: Number(payment.amount),
    productName: payment.productName,
    productCategory: payment.productCategory,
    telemetry: { cartItemIsGiftCard: checkout.isGiftCard, customerAccountAgeMonths: customer.accountAgeMonths },
  });
  const requiresIntervention = risk.policyOutcome !== 'NORMAL_PROCESSING';
  await prisma.$transaction(async (tx) => {
    await tx.riskAssessment.create({
      data: {
        paymentId: payment.id,
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel,
        policyOutcome: risk.policyOutcome,
        aiHypothesis: risk.aiHypothesis,
        aiConfidence: risk.aiConfidence,
        telemetrySnapshot: { cartItemIsGiftCard: checkout.isGiftCard, productCategory: payment.productCategory },
        signals: {
          create: risk.signals.map((signal) => ({
            category: signal.category,
            severity: signal.severity,
            title: signal.title,
            description: signal.description,
            source: signal.source,
            confidence: signal.confidence,
            detectedAt: new Date(signal.detectedAt),
          })),
        },
      },
    });
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel,
        interventionStatus: requiresIntervention ? 'ACTIVE_INTERVENTION' : 'NOT_REQUIRED',
      },
    });
    if (requiresIntervention) {
      await tx.interventionSession.upsert({
        where: { paymentId: payment.id },
        create: {
          paymentId: payment.id,
          status: 'AWAITING_CUSTOMER',
          scamHypothesis: risk.aiHypothesis,
          coercionIndicators: risk.signals.map((signal) => signal.category),
          confidenceScore: risk.aiConfidence,
          startedAt: new Date(),
          messages: {
            create: {
              sender: 'SYSTEM',
              content: 'A temporary authorization hold is active. Did anyone contact you and direct you to make this purchase?',
              quickReplies: risk.recommendedQuestions.slice(0, 4),
            },
          },
        },
        update: {},
      });
    }
  });

  const reservation = await dbRepository.reserveOperation({
    paymentId: payment.id,
    operationType: 'AUTHORIZE',
    idempotencyKey: payment.id,
    executedBy: 'CUSTOMER',
  });
  if (!reservation.reserved) return response('Authorization already exists and requires reconciliation.', 409);

  let authorizationResponse;
  try {
    authorizationResponse = await paypalClient.authorizeOrder(parsed.data.orderID, payment.id);
  } catch {
    await dbRepository.recordOperation({
      paymentId: payment.id,
      operationType: 'AUTHORIZE',
      idempotencyKey: payment.id,
      status: 'RECONCILIATION_REQUIRED',
      errorMessage: 'PayPal authorization outcome is unknown.',
      executedBy: 'CUSTOMER',
    });
    await prisma.checkoutSession.update({ where: { id: checkout.id }, data: { status: 'RECONCILIATION_REQUIRED' } });
    return response('Authorization outcome is unknown. Do not retry; support reconciliation is required.', 502);
  }

  const authorization = authorizationResponse.purchase_units[0]?.payments.authorizations[0];
  const amountMatches = authorization &&
    authorization.amount.currency_code === payment.currency &&
    Number(authorization.amount.value).toFixed(2) === Number(payment.amount).toFixed(2);
  const expiration = authorization?.expiration_time ? new Date(authorization.expiration_time) : null;
  if (authorizationResponse.status !== 'COMPLETED' || authorization?.status !== 'CREATED' || !amountMatches || !expiration || expiration <= new Date()) {
    await dbRepository.recordOperation({
      paymentId: payment.id,
      operationType: 'AUTHORIZE',
      idempotencyKey: payment.id,
      status: 'RECONCILIATION_REQUIRED',
      responsePayload: { status: authorization?.status || authorizationResponse.status },
      errorMessage: 'PayPal authorization response is not a confirmed active hold.',
      executedBy: 'CUSTOMER',
    });
    await prisma.checkoutSession.update({ where: { id: checkout.id }, data: { status: 'RECONCILIATION_REQUIRED' } });
    return response('PayPal did not confirm an active authorization. Support reconciliation is required.', 502);
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.paymentAuthorization.create({
        data: {
          paymentId: payment.id,
          paypalAuthorizationId: authorization.id,
          status: authorization.status,
          amount: payment.amount,
          currency: payment.currency,
          expirationTime: expiration,
          rawResponse: { status: authorization.status, expirationTime: expiration.toISOString() },
        },
      });
      await tx.payPalOrder.update({
        where: { paymentId: payment.id },
        data: { status: 'APPROVED' },
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          customerId: customer.id,
          state: 'AUTHORIZED',
          authorizationStatus: 'HOLD_ACTIVE',
          authorizedAt: new Date(),
          holdExpiresAt: expiration,
        },
      });
      await tx.checkoutSession.update({ where: { id: checkout.id }, data: { status: 'AUTHORIZED' } });
      await tx.customerSession.update({ where: { id: customerSession.id }, data: { customerId: customer.id } });
      await tx.paymentOperation.update({
        where: { idempotencyKey: payment.id },
        data: {
          status: 'SUCCEEDED',
          responsePayload: { authorizationId: authorization.id, status: authorization.status },
        },
      });
    });
  } catch {
    await dbRepository.recordOperation({
      paymentId: payment.id,
      operationType: 'AUTHORIZE',
      idempotencyKey: payment.id,
      status: 'RECONCILIATION_REQUIRED',
      errorMessage: 'PayPal confirmed authorization but application persistence failed.',
      executedBy: 'CUSTOMER',
    });
    return response('PayPal confirmed the authorization, but local state could not be saved. Reconciliation is required.', 503);
  }

  return NextResponse.json({
    authorized: true,
    paymentId: payment.id,
    paymentReference: payment.paymentReference,
    authorizationStatus: 'HOLD_ACTIVE',
    interventionRequired: requiresIntervention,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
