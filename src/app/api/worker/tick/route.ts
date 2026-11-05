import { NextResponse } from 'next/server';
import { backgroundWorker } from '@/server/worker/scheduler';

export async function POST() {
  const result = await backgroundWorker.executeSweep();
  return NextResponse.json({
    success: true,
    result,
    timestamp: new Date().toISOString(),
  });
}

