import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/server/db/repository';
import { RiskLevel, AuthorizationStatus } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const riskLevel = (searchParams.get('riskLevel') as RiskLevel) || undefined;
  const status = (searchParams.get('status') as AuthorizationStatus) || undefined;
  const merchantId = searchParams.get('merchantId') || undefined;

  const payments = await dbRepository.getPayments({
    search,
    riskLevel,
    status,
    merchantId,
  });

  return NextResponse.json({
    payments,
    total: payments.length,
  });
}

