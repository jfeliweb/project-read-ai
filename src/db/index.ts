import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure postgres client for external Supabase PostgreSQL
// These settings help prevent ECONNRESET errors over network connections
const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 3, // Reduced pool size for stability
  idle_timeout: 10, // Close idle connections quickly
  connect_timeout: 30, // Longer timeout for initial connection
  max_lifetime: 60 * 5, // Rotate connections every 5 minutes
  ssl: 'prefer', // Use SSL if available, fallback to unencrypted
  connection: {
    application_name: 'readerlabs-app',
  },
});

export const db = drizzle(client, { schema });
