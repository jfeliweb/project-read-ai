-- Add book cover fields to books table
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "book_cover_url" text;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "book_cover_description" text;

