// Location: packages/database/src/client.ts
import { PrismaClient } from '@prisma/client';

// Declare type safety bindings cleanly atop the global runtime namespace
declare global {
  interface typeofThis {
    prismaInstance?: PrismaClient;
  }
}

const localGlobal = globalThis as unknown as { prismaInstance?: PrismaClient };

/**
 * Shared Monorepo Infrastructure Connection Singleton Pool.
 * Configured defensively to prevent socket exhaustion during local dev hot-reloads.
 */
export const db = localGlobal.prismaInstance || new PrismaClient({
  log: process.env.NODE_ENV === 'production' 
    ? ['error'] 
    : ['query', 'error', 'warn'],
});

// Cache the active baseline engine socket reference context during non-production runs
if (process.env.NODE_ENV !== 'production') {
  localGlobal.prismaInstance = db;
}