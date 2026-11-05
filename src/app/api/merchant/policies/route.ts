import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbRepository } from '@/server/db/repository';

const PolicyUpdateSchema = z.object({
  autoHoldThreshold: z.number().min(10).max(90).optional(),
  autoCaptureThreshold: z.number().min(0).max(50).optional(),
  interventionTimeoutMinutes: z.number().min(5).max(60).optional(),
  timeoutAction: z.enum(['VOID', 'MANUAL_REVIEW', 'ESCALATE']).optional(),
  requireTrustedContactOver: z.number().nullable().optional(),
  prohibitRemoteDesktopGiftCard: z.boolean().optional(),
});

export async function GET() {
  const policy = await dbRepository.getRiskPolicy();
  return NextResponse.json(policy);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = PolicyUpdateSchema.parse(body);

    const updated = await dbRepository.updateRiskPolicy(validated);

    await dbRepository.recordAuditLog({
      eventType: 'RISK_ASSESSMENT_COMPLETED',
      actor: 'MERCHANT_POLICY',
      summary: `Merchant risk policy parameters updated (Hold threshold: ${updated.autoHoldThreshold}, Timeout: ${updated.interventionTimeoutMinutes}m).`,
      details: { updated },
    });

    return NextResponse.json({ success: true, policy: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid policy update' }, { status: 400 });
  }
}

