import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CUSTOMER_SESSION_COOKIE, CUSTOMER_SESSION_TTL_MS, createCustomerSessionToken, hashCustomerSessionToken } from '@/server/auth/customerSession';
import { CHECKOUT_CATALOG } from '@/server/checkout/catalog';
import { checkDatabaseConnection, prisma } from '@/server/db/client';
import { dbRepository } from '@/server/db/repository';
import { paypalClient } from '@/server/paypal/client';
import { hasSameOrigin } from '@/server/auth/session';

const CreateOrderSchema = z.object({
  sku: z.enum(['gift_cards', 'camera', 'tokens']),
  requestId: z.string().uuid(),
});

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  if (!hasSameOrigin(req)) return errorResponse('Invalid request origin.', 403);
  if (!paypalClient.isSandboxCheckoutAvailable()) {
    return errorResponse('PayPal Sandbox checkout is not configured.', 503);
  }
  if (!process.env.CHECKOUT_MERCHANT_ID) return errorResponse('Checkout merchant is not configured.', 503);
  const appOrigin = process.env.APP_BASE_URL || new URL(req.url).origin;
  try {
    const parsedOrigin = new URL(appOrigin);
    if (process.env.NODE_ENV === 'production' && parsedOrigin.protocol !== 'https:') {
      return errorResponse('A secure public checkout URL is required.', 503);
    }
  } catch {
    return errorResponse('Checkout base URL is invalid.', 503);
  }

  const parsed = CreateOrderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse('Invalid checkout request.', 400);
  if (!(await checkDatabaseConnection())) return errorResponse('Persistent checkout storage is required.', 503);

  const { sku, requestId } = parsed.data;
  const product = CHECKOUT_CATALOG[sku];
  const merchant = await prisma.merchant.findUnique({ where: { id: process.env.CHECKOUT_MERCHANT_ID } });
  if (!merchant) return errorResponse('Configured checkout merchant does not exist.', 503);

  const existingCheckout = await prisma.checkoutSession.findUnique({
    where: { clientReference: requestId },
    include: { payments: { include: { paypalOrder: true } } },
  });
  if (existingCheckout) {
    const token = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
    const activeSession = token
      ? await prisma.customerSession.findFirst({
          where: { sessionTokenHash: hashCustomerSessionToken(token), expiresAt: { gt: new Date() } },
        })
      : null;
    const payment = existingCheckout.payments[0];
    if (
      existingCheckout.merchantId !== merchant.id ||
      existingCheckout.productName !== product.name ||
      !activeSession ||
      activeSession.id !== existingCheckout.customerSessionId
    ) {
      return errorResponse('Checkout request already exists. Start a new checkout session.', 409);
    }
    if (payment?.paypalOrder) {
      return NextResponse.json(
        { orderID: payment.paypalOrder.paypalOrderId, checkoutSessionId: existingCheckout.id },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return errorResponse('Order creation is pending reconciliation. Start a new checkout only after support review.', 409);
  }

  const sessionToken = createCustomerSessionToken();
  const sessionExpiresAt = new Date(Date.now() + CUSTOMER_SESSION_TTL_MS);
  const paymentId = randomUUID();
  const paymentReference = `pay_${randomUUID().replaceAll('-', '')}`;
  const checkoutExpiresAt = new Date(Date.now() + CUSTOMER_SESSION_TTL_MS);
  const session = await prisma.$transaction(async (tx) => {
    const customerSession = await tx.customerSession.create({
      data: { sessionTokenHash: hashCustomerSessionToken(sessionToken), expiresAt: sessionExpiresAt },
    });
    const checkoutSession = await tx.checkoutSession.create({
      data: {
        merchantId: merchant.id,
        customerSessionId: customerSession.id,
        clientReference: requestId,
        amount: product.amount,
        currency: 'USD',
        productName: product.name,
        productCategory: product.category,
        isGiftCard: sku === 'gift_cards',
        status: 'CREATING_ORDER',
        expiresAt: checkoutExpiresAt,
      },
    });
    await tx.payment.create({
      data: {
        id: paymentId,
        paymentReference,
        merchantId: merchant.id,
        checkoutSessionId: checkoutSession.id,
        amount: product.amount,
        currency: 'USD',
        productName: product.name,
        productCategory: product.category,
        state: 'CREATED',
        authorizationStatus: 'PENDING_REVIEW',
        interventionStatus: 'NOT_REQUIRED',
        riskScore: 0,
        riskLevel: 'LOW',
      },
    });
    return { customerSession, checkoutSession };
  });

  const operationKey = requestId;
  const reservation = await dbRepository.reserveOperation({
    paymentId,
    operationType: 'CREATE_ORDER',
    idempotencyKey: operationKey,
    executedBy: 'CUSTOMER',
  });
  if (!reservation.reserved) return errorResponse('Order creation already exists and requires reconciliation.', 409);

  try {
    const order = await paypalClient.createOrder(
      {
        referenceId: paymentId,
        amount: product.amount,
        currency: 'USD',
        description: product.name,
        returnUrl: `${appOrigin.replace(/\/$/, '')}/checkout/authorizing`,
        cancelUrl: `${appOrigin.replace(/\/$/, '')}/checkout`,
      },
      operationKey,
    );
    if (!order.id || order.intent !== 'AUTHORIZE' || !order.purchase_units?.some((unit) =>
      unit.reference_id === paymentId && unit.amount.currency_code === 'USD' && Number(unit.amount.value) === product.amount
    )) {
      throw new Error('PayPal returned an order that does not match the server-side checkout.');
    }

    await prisma.payPalOrder.create({
      data: {
        paymentId,
        paypalOrderId: order.id,
        intent: order.intent,
        status: order.status,
        amount: product.amount,
        currency: 'USD',
      },
    });
    await prisma.checkoutSession.update({ where: { id: session.checkoutSession.id }, data: { status: 'AWAITING_BUYER_APPROVAL' } });
    await dbRepository.recordOperation({
      paymentId,
      operationType: 'CREATE_ORDER',
      idempotencyKey: operationKey,
      status: 'SUCCEEDED',
      responsePayload: { paypalOrderId: order.id, status: order.status },
      executedBy: 'CUSTOMER',
    });

    const response = NextResponse.json(
      { orderID: order.id, checkoutSessionId: session.checkoutSession.id },
      { headers: { 'Cache-Control': 'no-store' } },
    );
    response.cookies.set(CUSTOMER_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: req.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: sessionExpiresAt,
    });
    return response;
  } catch {
    await dbRepository.recordOperation({
      paymentId,
      operationType: 'CREATE_ORDER',
      idempotencyKey: operationKey,
      status: 'RECONCILIATION_REQUIRED',
      errorMessage: 'PayPal order creation failed or returned an unverifiable response.',
      executedBy: 'CUSTOMER',
    });
    await prisma.checkoutSession.update({ where: { id: session.checkoutSession.id }, data: { status: 'RECONCILIATION_REQUIRED' } });
    return errorResponse('PayPal order creation could not be verified. Contact support before retrying this checkout.', 502);
  }
}
