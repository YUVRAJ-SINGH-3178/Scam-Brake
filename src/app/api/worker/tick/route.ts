import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { workerAuthorized } from '@/server/auth/session';
import { backgroundWorker } from '@/server/worker/scheduler';

export async function POST(request: NextRequest) {
  if (!workerAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await backgroundWorker.executeSweep();
  return NextResponse.json({
    success: true,
    result,
    timestamp: new Date().toISOString(),
  });
}

