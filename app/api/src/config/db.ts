import * as Prisma from '@prisma/client';
import { DATABASE_URL } from './env';

// Fix: Access PrismaClient via any cast to avoid type errors when client isn't generated
const PrismaClient = (Prisma as any).PrismaClient;

// Automatically handle Supabase pooler settings
const getDatabaseUrl = () => {
  if (!DATABASE_URL) return '';
  
  let url = DATABASE_URL;

  const hasQueryParams = url.includes('?');
  const separator = hasQueryParams ? '&' : '?';

  // 1. If connecting to Supabase pooler (port 6543), ensure pgbouncer=true
  if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
    url = `${url}${separator}pgbouncer=true`;
  }

  // 2. Add connection settings for robustness
  // connect_timeout: Seconds to wait for a connection to be established
  if (!url.includes('connect_timeout')) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}connect_timeout=30`;
  }
  
  // pool_timeout: Seconds to wait for a connection from the pool
  if (!url.includes('pool_timeout')) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}pool_timeout=30`;
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