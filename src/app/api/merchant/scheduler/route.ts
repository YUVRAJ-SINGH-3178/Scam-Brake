import { NextRequest, NextResponse } from 'next/server';
import { bryntumSchedulerManager } from '@/server/bryntum/scheduler';

export async function GET() {
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
  try {
    const body = await req.json();
    const updatedEvent = bryntumSchedulerManager.assignCase({
      eventId: body.eventId,
      resourceId: body.resourceId,
      startTime: body.startTime,
      endTime: body.endTime,
    });
    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

