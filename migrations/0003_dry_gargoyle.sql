DO $$ BEGIN
 ALTER TABLE "books" ADD COLUMN "user_id" uuid;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "books" ADD COLUMN "book_cover_url" text;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "books" ADD COLUMN "book_cover_description" text;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "books" ADD CONSTRAINT "books_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
