// Location: packages/database/src/client.ts
import { PrismaClient } from '@prisma/client'; // 🛡️ FIX: Import from the global path

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;

export * from '@prisma/client'; // 🛡️ FIX: Export types from the global path