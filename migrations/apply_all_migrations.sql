-- ============================================================================
-- PRODUCTION DATABASE MIGRATION SCRIPT
-- ============================================================================
-- This script applies all database migrations to your self-hosted Supabase
-- database. It is idempotent and can be safely run multiple times.
--
-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Open Supabase SQL Editor
-- 3. Paste and run the script
-- 4. Check for any errors (warnings are usually safe to ignore)
--
-- MIGRATION ORDER:
-- 1. Initial schema (tables: books, chapters, profiles)
-- 2. Row Level Security policies and triggers (Supabase-specific)
-- 3. Add user_id column to books table
-- 4. Add book_cover fields to books table
-- 5. Schema refactoring (rename columns, change types)
-- ============================================================================

BEGIN;

-- ============================================================================
-- MIGRATION 1: Initial Schema (0000_nosy_excalibur)
-- ============================================================================
-- Creates the base tables: books, chapters, and profiles

DO $$ 
BEGIN
    RAISE NOTICE 'Applying migration 1: Initial schema...';
END $$;

-- Create books table
CREATE TABLE IF NOT EXISTS "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "books_slug_unique" UNIQUE("slug")
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS "chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"image_prompt" text,
	"image" text,
	"page" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"about" text,
	"role" text DEFAULT 'user',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint for chapters -> books
DO $$ BEGIN
	ALTER TABLE "chapters" ADD CONSTRAINT "chapters_book_id_books_id_fk" 
		FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") 
		ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN 
		RAISE NOTICE 'Foreign key constraint already exists, skipping...';
END $$;

-- ============================================================================
-- MIGRATION 2: Row Level Security and Triggers (001_profiles_rls_and_triggers)
-- ============================================================================
-- Enables RLS on profiles table and creates trigger for automatic profile creation
-- This is Supabase-specific and will skip gracefully if auth schema doesn't exist

DO $$ 
BEGIN
    RAISE NOTICE 'Applying migration 2: Row Level Security policies...';
    
    -- Only run if auth schema exists (Supabase environment)
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        -- Enable Row Level Security
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist (for idempotency)
        DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

        -- Policy: Users can read their own profile
        CREATE POLICY "Users can read own profile" ON profiles 
            FOR SELECT USING (auth.uid() = id);

        -- Policy: Users can update their own profile
        CREATE POLICY "Users can update own profile" ON profiles 
            FOR UPDATE USING (auth.uid() = id);

        -- Policy: Users can insert their own profile (for initial creation)
        CREATE POLICY "Users can insert own profile" ON profiles 
            FOR INSERT WITH CHECK (auth.uid() = id);

        -- Function to automatically create profile when user signs up
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $fn$
        BEGIN
            INSERT INTO public.profiles (id, email, role)
            VALUES (NEW.id, NEW.email, 'user')
            ON CONFLICT (id) DO NOTHING;
            RETURN NEW;
        END;
        $fn$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Drop existing trigger if it exists (for idempotency)
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

        -- Trigger to call the function when a new user is created
        CREATE TRIGGER on_auth_user_created 
            AFTER INSERT ON auth.users 
            FOR EACH ROW 
            EXECUTE FUNCTION public.handle_new_user();
            
        RAISE NOTICE 'RLS policies and triggers created successfully.';
    ELSE
        RAISE NOTICE 'Auth schema not found, skipping RLS migration (this is normal for non-Supabase databases).';
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        RAISE NOTICE 'Skipping RLS migration: auth schema not available.';
    WHEN OTHERS THEN
        RAISE NOTICE 'Skipping RLS migration: %', SQLERRM;
END $$;

-- ============================================================================
-- MIGRATION 3: Add user_id to books (002_add_user_id_to_books)
-- ============================================================================
-- Adds user_id column to link books to user profiles

DO $$ 
BEGIN
    RAISE NOTICE 'Applying migration 3: Adding user_id to books table...';
END $$;

-- Add user_id column if it doesn't exist
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "user_id" uuid;

-- Add foreign key constraint
DO $$ BEGIN
	ALTER TABLE "books" ADD CONSTRAINT "books_user_id_profiles_id_fk" 
		FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") 
		ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN 
		RAISE NOTICE 'Foreign key constraint already exists, skipping...';
END $$;

-- ============================================================================
-- MIGRATION 4: Add book_cover fields (0003_dry_gargoyle + 003_add_book_cover_fields)
-- ============================================================================
-- Adds book_cover_url and book_cover_description columns to books table
-- Note: user_id is already added in migration 3, so we skip that part

DO $$ 
BEGIN
    RAISE NOTICE 'Applying migration 4: Adding book cover fields...';
END $$;

-- Add user_id if it doesn't exist (from 0003, but already handled in migration 3)
-- This is here for idempotency in case migration 3 wasn't run
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "user_id" uuid;

-- Add book_cover_url if it doesn't exist
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "book_cover_url" text;

-- Add book_cover_description if it doesn't exist
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "book_cover_description" text;

-- Ensure foreign key constraint exists (idempotency)
DO $$ BEGIN
	ALTER TABLE "books" ADD CONSTRAINT "books_user_id_profiles_id_fk" 
		FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") 
		ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN 
		RAISE NOTICE 'Foreign key constraint already exists, skipping...';
END $$;

-- ============================================================================
-- MIGRATION 5: Schema Refactoring (0004_align_with_mongoose)
-- ============================================================================
-- Major schema changes to align with Mongoose models:
-- Books: rename title->book_title, drop author text, rename user_id->author, 
--        make book_cover_url NOT NULL, drop book_cover_description
-- Chapters: rename columns, change page type to text, make image_url NOT NULL,
--           drop image_prompt

DO $$ 
BEGIN
    RAISE NOTICE 'Applying migration 5: Schema refactoring...';
    
    -- ====================
    -- BOOKS TABLE CHANGES
    -- ====================
    
    -- Step 1: Rename title to book_title (if title exists and book_title doesn't)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'title'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'book_title'
    ) THEN
        ALTER TABLE "books" RENAME COLUMN "title" TO "book_title";
        RAISE NOTICE 'Renamed books.title to books.book_title';
    ELSE
        RAISE NOTICE 'books.title already renamed or book_title already exists, skipping...';
    END IF;
    
    -- Step 2: Drop the author text column (if it exists and is text type)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'author' 
        AND data_type = 'text'
    ) THEN
        ALTER TABLE "books" DROP COLUMN "author";
        RAISE NOTICE 'Dropped books.author text column';
    ELSE
        RAISE NOTICE 'books.author text column does not exist or is not text type, skipping...';
    END IF;
    
    -- Step 3: Rename user_id to author (if user_id exists and author doesn't exist as uuid)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'user_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'author' 
        AND udt_name = 'uuid'
    ) THEN
        -- Drop the old foreign key constraint first (if it exists)
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'books' 
            AND constraint_name = 'books_user_id_profiles_id_fk'
        ) THEN
            ALTER TABLE "books" DROP CONSTRAINT "books_user_id_profiles_id_fk";
        END IF;
        
        -- Rename the column
        ALTER TABLE "books" RENAME COLUMN "user_id" TO "author";
        
        -- Recreate the foreign key with new column name (if it doesn't exist)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'books' 
            AND constraint_name = 'books_author_profiles_id_fk'
        ) THEN
            ALTER TABLE "books" ADD CONSTRAINT "books_author_profiles_id_fk" 
                FOREIGN KEY ("author") REFERENCES "public"."profiles"("id") 
                ON DELETE no action ON UPDATE no action;
        END IF;
            
        RAISE NOTICE 'Renamed books.user_id to books.author';
    ELSE
        RAISE NOTICE 'books.user_id already renamed or author already exists, skipping...';
    END IF;
    
    -- Step 4: Make author NOT NULL (only if column exists and is nullable)
    -- WARNING: This will fail if there are NULL values in the author column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'author' 
        AND is_nullable = 'YES'
    ) THEN
        -- Check if there are any NULL values
        IF EXISTS (SELECT 1 FROM "books" WHERE "author" IS NULL) THEN
            RAISE WARNING 'Cannot set author NOT NULL: there are NULL values in books.author. Please update existing records first.';
        ELSE
            ALTER TABLE "books" ALTER COLUMN "author" SET NOT NULL;
            RAISE NOTICE 'Set books.author to NOT NULL';
        END IF;
    ELSE
        RAISE NOTICE 'books.author is already NOT NULL or does not exist, skipping...';
    END IF;
    
    -- Step 5: Make book_cover_url NOT NULL (only if column exists and is nullable)
    -- WARNING: This will fail if there are NULL values in the book_cover_url column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'book_cover_url' 
        AND is_nullable = 'YES'
    ) THEN
        -- Check if there are any NULL values
        IF EXISTS (SELECT 1 FROM "books" WHERE "book_cover_url" IS NULL) THEN
            RAISE WARNING 'Cannot set book_cover_url NOT NULL: there are NULL values in books.book_cover_url. Please update existing records first.';
        ELSE
            ALTER TABLE "books" ALTER COLUMN "book_cover_url" SET NOT NULL;
            RAISE NOTICE 'Set books.book_cover_url to NOT NULL';
        END IF;
    ELSE
        RAISE NOTICE 'books.book_cover_url is already NOT NULL or does not exist, skipping...';
    END IF;
    
    -- Step 6: Drop book_cover_description column (if it exists)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'book_cover_description'
    ) THEN
        ALTER TABLE "books" DROP COLUMN "book_cover_description";
        RAISE NOTICE 'Dropped books.book_cover_description column';
    ELSE
        RAISE NOTICE 'books.book_cover_description does not exist, skipping...';
    END IF;
    
    -- ====================
    -- CHAPTERS TABLE CHANGES
    -- ====================
    
    -- Step 1: Rename title to sub_title (if title exists and sub_title doesn't)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chapters' AND column_name = 'title'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chapters' AND column_name = 'sub_title'
    ) THEN
        ALTER TABLE "chapters" RENAME COLUMN "title" TO "sub_title";
        RAISE NOTICE 'Renamed chapters.title to chapters.sub_title';
    ELSE
        RAISE NOTICE 'chapters.title already renamed or sub_title already exists, skipping...';
    END IF;
    
    -- Step 2: Rename content to text_content (if content exists and text_content doesn't)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chapters' AND column_name = 'content'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chapters' AND column_name = 'text_content'
    ) THEN
        ALTER TABLE "chapters" RENAME COLUMN "content" TO "text_content";
        RAISE NOTICE 'Renamed chapters.content to chapters.text_content';
    ELSE
        RAISE NOTICE 'chapters.content already renamed or text_content already exists, skipping...';
    END IF;
    
    -- Step 3: Rename image to image_url (if image exists and image_url doesn't)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chapters' AND column_name = 'image'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chapters' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE "chapters" RENAME COLUMN "image" TO "image_url";
        RAISE NOTICE 'Renamed chapters.image to chapters.image_url';
    ELSE
        RAISE NOTICE 'chapters.image already renamed or image_url already exists, skipping...';
    END IF;
    
    -- Step 4: Make image_url NOT NULL (only if column exists and is nullable)
    -- WARNING: This will fail if there are NULL values in the image_url column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chapters' 
        AND column_name = 'image_url' 
        AND is_nullable = 'YES'
    ) THEN
        -- Check if there are any NULL values
        IF EXISTS (SELECT 1 FROM "chapters" WHERE "image_url" IS NULL) THEN
            RAISE WARNING 'Cannot set image_url NOT NULL: there are NULL values in chapters.image_url. Please update existing records first.';
        ELSE
            ALTER TABLE "chapters" ALTER COLUMN "image_url" SET NOT NULL;
            RAISE NOTICE 'Set chapters.image_url to NOT NULL';
        END IF;
    ELSE
        RAISE NOTICE 'chapters.image_url is already NOT NULL or does not exist, skipping...';
    END IF;
    
    -- Step 5: Drop image_prompt column (if it exists)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chapters' AND column_name = 'image_prompt'
    ) THEN
        ALTER TABLE "chapters" DROP COLUMN "image_prompt";
        RAISE NOTICE 'Dropped chapters.image_prompt column';
    ELSE
        RAISE NOTICE 'chapters.image_prompt does not exist, skipping...';
    END IF;
    
    -- Step 6: Change page column from integer to text (if it's currently integer)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chapters' 
        AND column_name = 'page' 
        AND data_type = 'integer'
    ) THEN
        -- Convert existing integer values to text
        ALTER TABLE "chapters" ALTER COLUMN "page" TYPE text USING "page"::text;
        RAISE NOTICE 'Changed chapters.page from integer to text';
    ELSE
        RAISE NOTICE 'chapters.page is already text or does not exist, skipping...';
    END IF;
    
END $$;

-- ============================================================================
-- MIGRATION 6: Make profiles.name NOT NULL (004_make_profiles_name_not_null)
-- ============================================================================
-- Ensures that the name column in profiles table is always required

DO $$ 
BEGIN
    RAISE NOTICE 'Applying migration 6: Making profiles.name NOT NULL...';
    
    -- Check if name column is currently nullable
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
        RAISE NOTICE 'Successfully set profiles.name to NOT NULL.';
    ELSE
        RAISE NOTICE 'profiles.name is already NOT NULL, skipping...';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Could not set profiles.name to NOT NULL: %. You may need to update NULL values manually.', SQLERRM;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$ 
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'All migrations applied successfully!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Final schema:';
    RAISE NOTICE '  - books: id, book_title, slug, author (uuid FK to profiles), book_cover_url, created_at, updated_at';
    RAISE NOTICE '  - chapters: id, book_id (FK to books), sub_title, text_content, image_url, page (text), created_at, updated_at';
    RAISE NOTICE '  - profiles: id (uuid), email, name (NOT NULL), about, role, created_at, updated_at';
    RAISE NOTICE '';
    RAISE NOTICE 'If you see any WARNING messages above, please address them before proceeding.';
    RAISE NOTICE '============================================================================';
END $$;

COMMIT;

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================

