-- Fix table ownership for Supabase migrations
-- Run this script as a superuser or the user who owns the tables
-- 
-- Usage:
-- psql "postgresql://postgres:YOUR_PASSWORD@72.62.160.62:5432/postgres" -f scripts/fix-table-ownership.sql

-- Change ownership of all tables to postgres user
ALTER TABLE IF EXISTS "books" OWNER TO postgres;
ALTER TABLE IF EXISTS "chapters" OWNER TO postgres;
ALTER TABLE IF EXISTS "profiles" OWNER TO postgres;

-- Grant all privileges to postgres user (in case ownership change doesn't work)
GRANT ALL PRIVILEGES ON TABLE "books" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "chapters" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "profiles" TO postgres;

-- Grant privileges on sequences (for serial columns)
GRANT ALL PRIVILEGES ON SEQUENCE "books_id_seq" TO postgres;
GRANT ALL PRIVILEGES ON SEQUENCE "chapters_id_seq" TO postgres;

-- Verify ownership (this will show current ownership)
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('books', 'chapters', 'profiles');

