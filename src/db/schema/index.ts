import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  uuid,
} from 'drizzle-orm/pg-core';

// Schema aligned with Mongoose models from reference project
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  bookTitle: text('book_title').notNull(),
  slug: text('slug').notNull().unique(),
  author: uuid('author')
    .references(() => profiles.id)
    .notNull(),
  bookCoverUrl: text('book_cover_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chapters = pgTable('chapters', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id)
    .notNull(),
  subTitle: text('sub_title').notNull(),
  textContent: text('text_content').notNull(),
  imageUrl: text('image_url').notNull(),
  page: text('page').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User profiles table - extends Supabase auth.users
// The id references auth.users(id) which is managed by Supabase
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // References auth.users(id)
  email: text('email').notNull(),
  name: text('name'),
  about: text('about'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
