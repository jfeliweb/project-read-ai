import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure postgres client for Supabase
// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  // SSL configuration - will be handled by connection string if sslmode is specified
  max: 10, // Connection pool size
});

export const db = drizzle(client, { schema });
