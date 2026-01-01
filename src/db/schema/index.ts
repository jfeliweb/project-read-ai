import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  uuid,
} from 'drizzle-orm/pg-core';

// Example schema - adjust based on your application needs
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  slug: text('slug').notNull().unique(),
  userId: uuid('user_id').references(() => profiles.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chapters = pgTable('chapters', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id)
    .notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  imagePrompt: text('image_prompt'),
  image: text('image'),
  page: integer('page').notNull(),
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
