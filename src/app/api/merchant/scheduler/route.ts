import { NextRequest, NextResponse } from 'next/server';
import { bryntumSchedulerManager } from '@/server/bryntum/scheduler';
import { getMerchantSession, hasMerchantPermission, hasSameOrigin } from '@/server/auth/session';
import { errorMessage } from '@/server/errors';

export async function GET(req: NextRequest) {
  if (!await getMerchantSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = bryntumSchedulerManager.getSchedulerData();
  const status = bryntumSchedulerManager.getStatus();
  return NextResponse.json({
    resources: data.resources,
    events: data.events,
    meta: {
      provider: 'BRYNTUM_SCHEDULER_INTEGRATION',
      mode: status.status,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getMerchantSession(req);
  if (!hasSameOrigin(req)) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  if (!session || !hasMerchantPermission(session, ['OWNER', 'ADMIN', 'RISK_ANALYST'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const updatedEvent = bryntumSchedulerManager.assignCase({
      eventId: body.eventId,
      resourceId: body.resourceId,
      startTime: body.startTime,
      endTime: body.endTime,
    });
    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error, 'Unable to assign case') }, { status: 400 });
  }
}

