import * as Prisma from '@prisma/client';
import { DATABASE_URL } from './env';

// Fix: Access PrismaClient via any cast to avoid type errors when client isn't generated
const PrismaClient = (Prisma as any).PrismaClient;

// Automatically append pgbouncer=true if connecting to Supabase pooler (port 6543)
const getDatabaseUrl = () => {
  if (!DATABASE_URL) return '';
  
  let url = DATABASE_URL;
  if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}pgbouncer=true`;
  }
  return url;
};

// Use a global variable to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  // Add logging in dev, error only in prod
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;