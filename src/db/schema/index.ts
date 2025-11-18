import { pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core';

// Example schema - adjust based on your application needs
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  slug: text('slug').notNull().unique(),
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
