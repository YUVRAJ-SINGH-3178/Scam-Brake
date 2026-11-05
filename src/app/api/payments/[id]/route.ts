import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/server/db/repository';
import { getMerchantSession } from '@/server/auth/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMerchantSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const payment = await dbRepository.getPaymentById(id, session.merchantId);

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  const intervention = await dbRepository.getInterventionByPaymentId(payment.id);
  const auditLogs = await dbRepository.getAuditLogs(payment.id, session.merchantId);

  return NextResponse.json({
    payment,
    intervention,
    auditLogs,
  });
}

