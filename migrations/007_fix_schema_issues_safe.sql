-- ============================================================================
-- FIX SCHEMA ISSUES - Safe Version with Better Error Handling
-- ============================================================================
-- This script fixes:
-- 1. Makes profiles.name NOT NULL
-- 2. Removes duplicate user_id column from books
-- ============================================================================
-- Run each section separately if you encounter errors
-- ============================================================================

-- ============================================================================
-- PART 1: Fix profiles.name - Make it NOT NULL
-- ============================================================================
-- Run this section first

DO $$ 
BEGIN
    RAISE NOTICE 'Step 1: Fixing profiles.name...';
    
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'profiles' 
        AND column_name = 'name'
    ) THEN
        RAISE EXCEPTION 'Column profiles.name does not exist!';
    END IF;
    
    -- Check if it's already NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'profiles' 
        AND column_name = 'name' 
        AND is_nullable = 'NO'
    ) THEN
        RAISE NOTICE 'profiles.name is already NOT NULL, skipping...';
    ELSE
        -- First, update any NULL names
        RAISE NOTICE 'Updating NULL names...';
        UPDATE "profiles" 
        SET "name" = COALESCE("name", SPLIT_PART("email", '@', 1), 'User')
        WHERE "name" IS NULL;
        
        RAISE NOTICE 'Updated % rows with NULL names', (SELECT COUNT(*) FROM "profiles" WHERE "name" IS NULL);
        
        -- Now make it NOT NULL
        RAISE NOTICE 'Setting profiles.name to NOT NULL...';
        ALTER TABLE "profiles" ALTER COLUMN "name" SET NOT NULL;
        
        RAISE NOTICE '✅ Successfully set profiles.name to NOT NULL';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error fixing profiles.name: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- ============================================================================
-- PART 2: Remove duplicate user_id column from books
-- ============================================================================
-- Run this section after Part 1

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Step 2: Removing duplicate user_id column from books...';
    
    -- Check if user_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'books' 
        AND column_name = 'user_id'
    ) THEN
        RAISE NOTICE 'user_id column does not exist, nothing to clean up.';
    ELSE
        RAISE NOTICE 'Found user_id column, proceeding with cleanup...';
        
        -- Step 2a: Migrate any data from user_id to author (if author is NULL)
        RAISE NOTICE 'Migrating data from user_id to author...';
        UPDATE "books" 
        SET "author" = "user_id" 
        WHERE "author" IS NULL AND "user_id" IS NOT NULL;
        
        RAISE NOTICE 'Migrated data for % rows', (SELECT COUNT(*) FROM "books" WHERE "author" IS NULL AND "user_id" IS NOT NULL);
        
        -- Step 2b: Drop the foreign key constraint on user_id (if it exists)
        RAISE NOTICE 'Checking for foreign key constraint on user_id...';
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public'
            AND table_name = 'books' 
            AND constraint_name = 'books_user_id_profiles_id_fk'
        ) THEN
            RAISE NOTICE 'Dropping foreign key constraint: books_user_id_profiles_id_fk';
            ALTER TABLE "books" DROP CONSTRAINT "books_user_id_profiles_id_fk";
            RAISE NOTICE '✅ Dropped foreign key constraint';
        ELSE
            RAISE NOTICE 'No foreign key constraint found on user_id';
        END IF;
        
        -- Step 2c: Drop the user_id column
        RAISE NOTICE 'Dropping user_id column...';
        ALTER TABLE "books" DROP COLUMN "user_id";
        RAISE NOTICE '✅ Dropped user_id column from books table';
    END IF;
    
    -- Step 2d: Ensure author has a foreign key constraint
    RAISE NOTICE 'Ensuring author has foreign key constraint...';
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'books' 
        AND column_name = 'author' 
        AND udt_name = 'uuid'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public'
            AND table_name = 'books' 
            AND constraint_name = 'books_author_profiles_id_fk'
        ) THEN
            RAISE NOTICE 'Creating foreign key constraint on books.author...';
            ALTER TABLE "books" ADD CONSTRAINT "books_author_profiles_id_fk" 
                FOREIGN KEY ("author") REFERENCES "public"."profiles"("id") 
                ON DELETE no action ON UPDATE no action;
            RAISE NOTICE '✅ Created foreign key constraint on books.author';
        ELSE
            RAISE NOTICE 'Foreign key constraint already exists on books.author';
        END IF;
    ELSE
        RAISE NOTICE 'author column does not exist or is not uuid type';
    END IF;
    
    RAISE NOTICE '✅ Step 2 completed';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error removing user_id column: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the changes:

-- Check profiles.name is NOT NULL:
-- SELECT column_name, is_nullable, data_type
-- FROM information_schema.columns 
-- WHERE table_schema = 'public'
-- AND table_name = 'profiles' AND column_name = 'name';

-- Check books table columns (should NOT have user_id):
-- SELECT column_name, data_type, udt_name, is_nullable
-- FROM information_schema.columns 
-- WHERE table_schema = 'public'
-- AND table_name = 'books' 
-- ORDER BY ordinal_position;

-- Check foreign key constraints on books:
-- SELECT constraint_name, column_name
-- FROM information_schema.key_column_usage
-- WHERE table_schema = 'public'
-- AND table_name = 'books'
-- AND constraint_name LIKE '%profiles%';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

