import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/server/db/repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payment = await dbRepository.getPaymentById(id);

  if (!payment) {
    return NextResponse.json({ error: `Payment ${id} not found` }, { status: 404 });
  }

  const intervention = await dbRepository.getInterventionByPaymentId(payment.id);
  const auditLogs = await dbRepository.getAuditLogs(payment.id);

  return NextResponse.json({
    payment,
    intervention,
    auditLogs,
  });
}

