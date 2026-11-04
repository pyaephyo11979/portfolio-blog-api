import 'dotenv/config';
import { PrismaClient } from '../features/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;

// 1. Export the prisma instance exactly as your other files expect it
export let prisma: PrismaClient;

// 2. Add an internal initialization check
let isInitialized = false;

export function initPrisma(databaseUrl: string) {
  if (isInitialized) return;

  const adapter = new PrismaNeon({ connectionString: databaseUrl });

  // Instantiates the client using the active runtime environment variable
  prisma = new PrismaClient({
    adapter,
  });

  isInitialized = true;
}
