import { NextResponse } from 'next/server';
import { dbRepository } from '@/server/db/repository';

export async function GET() {
  const metrics = await dbRepository.getMetrics();
  return NextResponse.json(metrics);
}

