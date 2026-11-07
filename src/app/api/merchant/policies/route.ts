import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMerchantSession, hasMerchantPermission, hasSameOrigin } from '@/server/auth/session';
import { dbRepository } from '@/server/db/repository';

const PolicySchema = z.object({
  autoHoldThreshold: z.number().int().min(0).max(100),
  autoCaptureThreshold: z.number().int().min(0).max(100),
  interventionTimeoutMinutes: z.number().int().min(5).max(60),
  timeoutAction: z.enum(['VOID', 'MANUAL_REVIEW', 'ESCALATE']),
  requireTrustedContactOver: z.number().nonnegative().nullable(),
  prohibitRemoteDesktopGiftCard: z.boolean(),
}).refine((policy) => policy.autoCaptureThreshold < policy.autoHoldThreshold, {
  message: 'Auto-capture threshold must be below the auto-hold threshold.',
});

export async function GET(req: NextRequest) {
  const session = await getMerchantSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json(await dbRepository.getRiskPolicy(session.merchantId), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to load merchant policy.' }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getMerchantSession(req);
  if (!session || !hasMerchantPermission(session, ['OWNER', 'ADMIN'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!hasSameOrigin(req)) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const parsed = PolicySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid merchant policy.', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const policy = await dbRepository.updateRiskPolicy(session.merchantId, parsed.data);
    return NextResponse.json(policy, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to persist merchant policy.' }, { status: 503 });
  }
}
