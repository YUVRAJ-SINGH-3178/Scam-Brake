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

let isDbConnected: boolean | null = null;

/**
 * Checks whether PostgreSQL is reachable via Prisma.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  if (isDbConnected !== null) return isDbConnected;
  if (!process.env.DATABASE_URL) {
    isDbConnected = false;
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    return true;
  } catch (error) {
    console.warn('[DB] PostgreSQL connection check failed, using persistent fallback repository:', error);
    isDbConnected = false;
    return false;
  }
}

