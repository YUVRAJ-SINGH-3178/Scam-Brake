import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseConnection, prisma } from '@/server/db/client';

export async function GET(req: NextRequest) {
  req.headers.get('host');
  const { paypalClient } = await import('@/server/paypal/client');
  let clientId = paypalClient.getPublicClientId();
  if (!process.env.CHECKOUT_MERCHANT_ID || !(await checkDatabaseConnection())) clientId = null;
  if (clientId) {
    const merchant = await prisma.merchant.findUnique({ where: { id: process.env.CHECKOUT_MERCHANT_ID }, select: { id: true } });
    if (!merchant) clientId = null;
  }
  return NextResponse.json(
    { available: Boolean(clientId), clientId, environment: 'sandbox' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
