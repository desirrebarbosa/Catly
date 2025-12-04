import * as Prisma from '@prisma/client';
import { DATABASE_URL } from './env';

// Fix: Access PrismaClient via any cast to avoid type errors when client isn't generated
const PrismaClient = (Prisma as any).PrismaClient;

// Automatically append pgbouncer=true if connecting to Supabase pooler (port 6543)
// and the flag is missing.
const getDatabaseUrl = () => {
  if (DATABASE_URL && DATABASE_URL.includes(':6543') && !DATABASE_URL.includes('pgbouncer=true')) {
    const separator = DATABASE_URL.includes('?') ? '&' : '?';
    return `${DATABASE_URL}${separator}pgbouncer=true`;
  }
  return DATABASE_URL || '';
};

// Use a global variable to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;