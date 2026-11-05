import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/server/db/repository';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('paymentId') || undefined;

  const logs = await dbRepository.getAuditLogs(paymentId);
  return NextResponse.json({
    logs,
    total: logs.length,
    tamperEvidentSeal: logs[0]?.immutableHash || '',
  });
}

