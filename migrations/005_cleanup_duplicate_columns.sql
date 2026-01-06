-- ============================================================================
-- MIGRATION: Cleanup Duplicate Columns and Fix profiles.name
-- ============================================================================
-- This migration:
-- 1. Makes profiles.name NOT NULL (if not already)
-- 2. Removes duplicate user_id column from books table (if author exists)
-- 3. Ensures proper foreign key constraints
-- ============================================================================

BEGIN;

DO $$ 
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Starting cleanup migration...';
    RAISE NOTICE '============================================================================';
    
    -- ============================================================================
    -- PART 1: Make profiles.name NOT NULL
    -- ============================================================================
    RAISE NOTICE '';
    RAISE NOTICE 'Part 1: Making profiles.name NOT NULL...';
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'name' 
        AND is_nullable = 'YES'
    ) THEN
        -- Check if there are any NULL values
        IF EXISTS (SELECT 1 FROM "profiles" WHERE "name" IS NULL) THEN
            RAISE NOTICE 'Found NULL values in profiles.name. Updating them...';
            
            -- Update NULL names to use email username (part before @) as default
            UPDATE "profiles" 
            SET "name" = SPLIT_PART("email", '@', 1)
            WHERE "name" IS NULL;
            
            RAISE NOTICE 'Updated NULL names to use email username.';
        END IF;
        
        -- Now set the column to NOT NULL
        ALTER TABLE "profiles" ALTER COLUMN "name" SET NOT NULL;
        RAISE NOTICE '✅ Successfully set profiles.name to NOT NULL.';
    ELSE
        RAISE NOTICE '✅ profiles.name is already NOT NULL, skipping...';
    END IF;
    
    -- ============================================================================
    -- PART 2: Remove duplicate user_id column from books (if author exists)
    -- ============================================================================
    RAISE NOTICE '';
    RAISE NOTICE 'Part 2: Checking for duplicate user_id column in books table...';
    
    -- Check if both user_id and author exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'user_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'author' AND udt_name = 'uuid'
    ) THEN
        RAISE NOTICE 'Found both user_id and author columns. Cleaning up...';
        
        -- First, migrate any data from user_id to author if author is NULL
        UPDATE "books" 
        SET "author" = "user_id" 
        WHERE "author" IS NULL AND "user_id" IS NOT NULL;
        
        RAISE NOTICE 'Migrated data from user_id to author where author was NULL.';
        
        -- Drop the old foreign key constraint on user_id if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'books' 
            AND constraint_name = 'books_user_id_profiles_id_fk'
        ) THEN
            ALTER TABLE "books" DROP CONSTRAINT "books_user_id_profiles_id_fk";
            RAISE NOTICE 'Dropped old foreign key constraint on user_id.';
        END IF;
        
        -- Drop the user_id column
        ALTER TABLE "books" DROP COLUMN "user_id";
        RAISE NOTICE '✅ Dropped duplicate user_id column from books table.';
        
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'user_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'author' AND udt_name = 'uuid'
    ) THEN
        -- Only user_id exists, rename it to author
        RAISE NOTICE 'Found user_id but no author. Renaming user_id to author...';
        
        -- Drop the old foreign key constraint first
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'books' 
            AND constraint_name = 'books_user_id_profiles_id_fk'
        ) THEN
            ALTER TABLE "books" DROP CONSTRAINT "books_user_id_profiles_id_fk";
        END IF;
        
        -- Rename the column
        ALTER TABLE "books" RENAME COLUMN "user_id" TO "author";
        
        -- Recreate the foreign key with new column name
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'books' 
            AND constraint_name = 'books_author_profiles_id_fk'
        ) THEN
            ALTER TABLE "books" ADD CONSTRAINT "books_author_profiles_id_fk" 
                FOREIGN KEY ("author") REFERENCES "public"."profiles"("id") 
                ON DELETE no action ON UPDATE no action;
        END IF;
        
        RAISE NOTICE '✅ Renamed user_id to author.';
    ELSE
        RAISE NOTICE '✅ No duplicate columns found. Schema is clean.';
    END IF;
    
    -- ============================================================================
    -- PART 3: Ensure proper foreign key constraint exists
    -- ============================================================================
    RAISE NOTICE '';
    RAISE NOTICE 'Part 3: Ensuring foreign key constraint exists...';
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'author' AND udt_name = 'uuid'
    ) THEN
        -- Ensure the foreign key constraint exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'books' 
            AND constraint_name = 'books_author_profiles_id_fk'
        ) THEN
            ALTER TABLE "books" ADD CONSTRAINT "books_author_profiles_id_fk" 
                FOREIGN KEY ("author") REFERENCES "public"."profiles"("id") 
                ON DELETE no action ON UPDATE no action;
            RAISE NOTICE '✅ Created foreign key constraint on books.author.';
        ELSE
            RAISE NOTICE '✅ Foreign key constraint already exists.';
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Cleanup migration completed successfully!';
    RAISE NOTICE '============================================================================';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error during cleanup migration: %', SQLERRM;
END $$;

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

