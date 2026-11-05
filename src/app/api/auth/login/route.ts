import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { allowLoginAttempt, createSignedSession, hasSameOrigin, merchantSessionCookie, type MerchantRole } from '@/server/auth/session';
import { verifyPassword } from '@/server/auth/password';
import { prisma } from '@/server/db/client';

const LoginSchema = z.object({
  email: z.string().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(256),
});

const validRoles: MerchantRole[] = ['OWNER', 'ADMIN', 'RISK_ANALYST', 'OPERATOR', 'VIEWER'];

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  const ip = request.headers.get('x-real-ip') || 'unknown';
  if (!allowLoginAttempt(ip)) return NextResponse.json({ error: 'Too many login attempts' }, { status: 429 });

  const parsed = LoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      include: { merchantUsers: true },
    });
    const validPassword = user
      ? await verifyPassword(parsed.data.password, user.passwordHash)
      : (await verifyPassword(parsed.data.password, 'invalid$hash'));
    const membership = user?.merchantUsers[0];
    if (!user || !validPassword || !membership || !validRoles.includes(membership.role as MerchantRole)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const { token, session } = createSignedSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: membership.role as MerchantRole,
      merchantId: membership.merchantId,
    });
    await prisma.$transaction([
      prisma.merchantSession.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.merchantSession.create({
        data: {
          id: session.jti,
          userId: user.id,
          merchantId: membership.merchantId,
          expiresAt: new Date(session.exp * 1000),
        },
      }),
    ]);
    const response = NextResponse.json({
      authenticated: true,
      user: { userId: user.id, email: user.email, name: user.name, role: membership.role, merchantId: membership.merchantId },
    });
    response.cookies.set(merchantSessionCookie.name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: merchantSessionCookie.maxAge,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}
