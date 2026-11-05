import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/server/db/repository';
import { getMerchantSession } from '@/server/auth/session';

export async function GET(req: NextRequest) {
  const session = await getMerchantSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const requestedPaymentId = searchParams.get('paymentId') || undefined;
  if (requestedPaymentId) {
    const payment = await dbRepository.getPaymentById(requestedPaymentId, session.merchantId);
    if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const logs = requestedPaymentId
    ? await dbRepository.getAuditLogs(requestedPaymentId, session.merchantId)
    : (await Promise.all((await dbRepository.getPayments({ merchantId: session.merchantId }))
      .map((payment) => dbRepository.getAuditLogs(payment.id, session.merchantId)))).flat();
  return NextResponse.json({
    logs,
    total: logs.length,
    tamperEvidentSeal: logs[0]?.immutableHash || '',
  });
}

