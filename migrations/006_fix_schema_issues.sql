-- ============================================================================
-- FIX SCHEMA ISSUES - Direct Approach
-- ============================================================================
-- This script directly fixes:
-- 1. Makes profiles.name NOT NULL
-- 2. Removes duplicate user_id column from books
-- ============================================================================

BEGIN;

DO $$ 
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Fixing schema issues...';
    RAISE NOTICE '============================================================================';
    
    -- ============================================================================
    -- STEP 1: Fix profiles.name - Make it NOT NULL
    -- ============================================================================
    RAISE NOTICE '';
    RAISE NOTICE 'Step 1: Making profiles.name NOT NULL...';
    
    -- First, update any NULL names
    UPDATE "profiles" 
    SET "name" = COALESCE("name", SPLIT_PART("email", '@', 1), 'User')
    WHERE "name" IS NULL;
    
    -- Now make it NOT NULL
    ALTER TABLE "profiles" ALTER COLUMN "name" SET NOT NULL;
    
    RAISE NOTICE '✅ Fixed profiles.name - now NOT NULL';
    
    -- ============================================================================
    -- STEP 2: Remove duplicate user_id column from books
    -- ============================================================================
    RAISE NOTICE '';
    RAISE NOTICE 'Step 2: Removing duplicate user_id column from books...';
    
    -- Step 2a: Migrate any data from user_id to author (if author is NULL)
    UPDATE "books" 
    SET "author" = "user_id" 
    WHERE "author" IS NULL AND "user_id" IS NOT NULL;
    
    -- Step 2b: Drop the foreign key constraint on user_id (if it exists)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public'
        AND table_name = 'books' 
        AND constraint_name = 'books_user_id_profiles_id_fk'
    ) THEN
        ALTER TABLE "books" DROP CONSTRAINT "books_user_id_profiles_id_fk";
        RAISE NOTICE 'Dropped foreign key constraint: books_user_id_profiles_id_fk';
    END IF;
    
    -- Step 2c: Drop the user_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'books' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE "books" DROP COLUMN "user_id";
        RAISE NOTICE '✅ Dropped user_id column from books table';
    ELSE
        RAISE NOTICE 'user_id column does not exist, skipping...';
    END IF;
    
    -- Step 2d: Ensure author has a foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public'
        AND table_name = 'books' 
        AND constraint_name = 'books_author_profiles_id_fk'
    ) THEN
        ALTER TABLE "books" ADD CONSTRAINT "books_author_profiles_id_fk" 
            FOREIGN KEY ("author") REFERENCES "public"."profiles"("id") 
            ON DELETE no action ON UPDATE no action;
        RAISE NOTICE '✅ Created foreign key constraint on books.author';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists on books.author';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Schema fixes completed successfully!';
    RAISE NOTICE '============================================================================';
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (run these separately to verify)
-- ============================================================================
-- Run these after the migration to verify:

-- Check profiles.name is NOT NULL:
-- SELECT column_name, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'name';

-- Check books table columns:
-- SELECT column_name, data_type, udt_name
-- FROM information_schema.columns 
-- WHERE table_name = 'books' 
-- ORDER BY ordinal_position;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

