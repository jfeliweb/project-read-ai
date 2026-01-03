ALTER TABLE "books" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "book_cover_url" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "book_cover_description" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "books" ADD CONSTRAINT "books_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
