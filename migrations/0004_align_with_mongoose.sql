-- Migration to align PostgreSQL schema with Mongoose models
-- This migration performs the following changes:
-- Books table: rename title->book_title, drop author text, rename user_id->author, add NOT NULL constraints
-- Chapters table: rename columns, change page type to text, add NOT NULL constraints

-- ====================
-- BOOKS TABLE CHANGES
-- ====================

-- Step 1: Rename title to book_title
ALTER TABLE "books" RENAME COLUMN "title" TO "book_title";

-- Step 2: Drop the author text column (we'll use user_id renamed to author instead)
ALTER TABLE "books" DROP COLUMN "author";

-- Step 3: Rename user_id to author
ALTER TABLE "books" RENAME COLUMN "user_id" TO "author";

-- Step 4: Make author NOT NULL (ensure all existing records have values first)
-- WARNING: This will fail if there are NULL values in the author column
ALTER TABLE "books" ALTER COLUMN "author" SET NOT NULL;

-- Step 5: Make book_cover_url NOT NULL
-- WARNING: This will fail if there are NULL values in the book_cover_url column
ALTER TABLE "books" ALTER COLUMN "book_cover_url" SET NOT NULL;

-- Step 6: Drop book_cover_description column
ALTER TABLE "books" DROP COLUMN "book_cover_description";

-- ====================
-- CHAPTERS TABLE CHANGES
-- ====================

-- Step 1: Rename title to sub_title
ALTER TABLE "chapters" RENAME COLUMN "title" TO "sub_title";

-- Step 2: Rename content to text_content
ALTER TABLE "chapters" RENAME COLUMN "content" TO "text_content";

-- Step 3: Rename image to image_url
ALTER TABLE "chapters" RENAME COLUMN "image" TO "image_url";

-- Step 4: Make image_url NOT NULL
-- WARNING: This will fail if there are NULL values in the image_url column
ALTER TABLE "chapters" ALTER COLUMN "image_url" SET NOT NULL;

-- Step 5: Drop image_prompt column
ALTER TABLE "chapters" DROP COLUMN "image_prompt";

-- Step 6: Change page column from integer to text
-- Convert existing integer values to text
ALTER TABLE "chapters" ALTER COLUMN "page" TYPE text USING "page"::text;

