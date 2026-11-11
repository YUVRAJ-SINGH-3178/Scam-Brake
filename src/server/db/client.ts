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

let lastCheckTime = 0;
let lastCheckResult = false;
const CHECK_CACHE_TTL_MS = 15_000;

/**
 * Checks whether PostgreSQL is reachable via Prisma.
 */
export async function checkDatabaseConnection(force = false): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL is required in production.');
    return false;
  }
  const now = Date.now();
  if (!force && now - lastCheckTime < CHECK_CACHE_TTL_MS) {
    return lastCheckResult;
  }
  try {
    const checkPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB connection timeout')), 2500)
    );
    await Promise.race([checkPromise, timeoutPromise]);
    lastCheckResult = true;
    lastCheckTime = now;
    return true;
  } catch {
    lastCheckResult = false;
    lastCheckTime = now;
    if (process.env.NODE_ENV === 'production') throw new Error('PostgreSQL is unavailable. Refusing non-persistent repository fallback.');
    console.warn('[DB] PostgreSQL connection check failed; development fallback repository is active.');
    return false;
  }
}

