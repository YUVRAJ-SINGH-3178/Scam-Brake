import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { merchantSessionCookie, verifySignedToken } from '@/server/auth/session';

export const instant = false;

export default async function MerchantLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get(merchantSessionCookie.name)?.value;
  if (!token || !verifySignedToken(token)) redirect('/login');
  return children;
}
