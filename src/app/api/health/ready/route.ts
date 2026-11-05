import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/server/db/client';

export async function GET() {
  try {
    if (!(await checkDatabaseConnection())) {
      return NextResponse.json({ status: 'NOT_READY' }, { status: 503 });
    }
    return NextResponse.json({ status: 'READY' });
  } catch {
    return NextResponse.json({ status: 'NOT_READY' }, { status: 503 });
  }
}
