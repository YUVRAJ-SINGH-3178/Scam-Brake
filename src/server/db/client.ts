import { PrismaClient } from '@prisma/client';

// Global singleton Prisma client to prevent connection exhaustion in Next.js dev server
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Checks whether PostgreSQL is reachable via Prisma.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL is required in production.');
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    if (process.env.NODE_ENV === 'production') throw new Error('PostgreSQL is unavailable. Refusing non-persistent repository fallback.');
    console.warn('[DB] PostgreSQL connection check failed; development fallback repository is active.');
    return false;
  }
}

