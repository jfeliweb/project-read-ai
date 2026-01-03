'use server';

import { db } from '@/src/db';
import { books, chapters, profiles } from '@/src/db/schema';
import { getUser } from '@/src/libs/auth/utils';
import { eq, desc, sql, like } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function getBooks(page: number = 1, limit: number = 10) {
  try {
    const offset = (page - 1) * limit;

    // Get total count of all books
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(books);

    const totalCount = totalResult?.count || 0;

    // Get paginated books with author profile data
    const booksWithAuthors = await db
      .select({
        id: books.id,
        bookTitle: books.bookTitle,
        slug: books.slug,
        bookCoverUrl: books.bookCoverUrl,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        author: {
          id: profiles.id,
          name: profiles.name,
          email: profiles.email,
        },
      })
      .from(books)
      .innerJoin(profiles, eq(books.author, profiles.id))
      .orderBy(desc(books.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      books: booksWithAuthors as BookWithAuthor[],
      totalCount,
    };
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

export async function getUserBooks(page: number = 1, limit: number = 3) {
  const user = await getUser();

  if (!user) {
    return { books: [], totalCount: 0 };
  }

  const offset = (page - 1) * limit;

  // Get total count of user's books
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(books)
    .where(eq(books.author, user.id));

  const totalCount = totalResult?.count || 0;

  // Get paginated books with author profile data
  const userBooks = await db
    .select({
      id: books.id,
      bookTitle: books.bookTitle,
      slug: books.slug,
      bookCoverUrl: books.bookCoverUrl,
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
      author: {
        id: profiles.id,
        name: profiles.name,
        email: profiles.email,
      },
    })
    .from(books)
    .innerJoin(profiles, eq(books.author, profiles.id))
    .where(eq(books.author, user.id))
    .orderBy(desc(books.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    books: userBooks as BookWithAuthor[],
    totalCount,
  };
}

interface Chapter {
  subTitle: string;
  textContent: string;
  imageDescription: string;
  imageUrl: string;
  page: number;
}

interface StoryData {
  bookTitle: string;
  bookCoverDescription: string;
  bookCoverUrl: string;
  chapters: Chapter[];
}

// Extended type for components that need author profile data
export interface BookWithAuthor {
  id: number;
  bookTitle: string;
  slug: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  bookCoverUrl: string;
  createdAt: Date;
  updatedAt: Date;
  chapters?: Array<{
    id: number;
    bookId: number;
    subTitle: string;
    textContent: string;
    imageUrl: string;
    page: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export async function generateStoryAi(prompt: string): Promise<StoryData> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const parsedData = JSON.parse(text);
    return parsedData as StoryData;
  } catch (error) {
    console.error('Error generating story with Gemini AI:', error);
    throw error;
  }
}

export async function getBook(slug: string): Promise<BookWithAuthor> {
  try {
    // Get book with author profile data
    const [bookWithAuthor] = await db
      .select({
        id: books.id,
        bookTitle: books.bookTitle,
        slug: books.slug,
        bookCoverUrl: books.bookCoverUrl,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        author: {
          id: profiles.id,
          name: profiles.name,
          email: profiles.email,
        },
      })
      .from(books)
      .innerJoin(profiles, eq(books.author, profiles.id))
      .where(eq(books.slug, slug))
      .limit(1);

    if (!bookWithAuthor) {
      throw new Error('Book not found');
    }

    // Get all chapters for this book
    const bookChapters = await db
      .select()
      .from(chapters)
      .where(eq(chapters.bookId, bookWithAuthor.id))
      .orderBy(chapters.page);

    return {
      ...bookWithAuthor,
      chapters: bookChapters,
    };
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
}

export async function saveStoryDb(storyData: StoryData) {
  try {
    const user = await getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate a unique slug from the book title
    const baseSlug = storyData.bookTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists and add a random suffix if needed
    const existingSlugs = await db
      .select({ slug: books.slug })
      .from(books)
      .where(sql`${books.slug} LIKE ${baseSlug + '%'}`);

    let slug = baseSlug;
    if (existingSlugs.length > 0) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    // Insert book record
    const [book] = await db
      .insert(books)
      .values({
        bookTitle: storyData.bookTitle,
        author: user.id,
        slug: slug,
        bookCoverUrl: storyData.bookCoverUrl,
      })
      .returning();

    // Insert chapter records
    const chapterValues = storyData.chapters.map((chapter) => ({
      bookId: book.id,
      subTitle: chapter.subTitle,
      textContent: chapter.textContent,
      imageUrl: chapter.imageUrl,
      page: chapter.page.toString(),
    }));

    await db.insert(chapters).values(chapterValues);

    return {
      success: true,
      bookId: book.id,
      slug: book.slug,
    };
  } catch (error) {
    console.error('Error saving story to database:', error);
    throw error;
  }
}

export async function deleteBook(id: number) {
  try {
    const user = await getUser();

    if (!user) {
      throw new Error('You need to be logged in to delete a book');
    }

    // Get the book to verify ownership
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (!book) {
      throw new Error('Book not found');
    }

    if (book.author !== user.id) {
      throw new Error('You are not authorized to delete this book');
    }

    // Delete chapters first (if not using CASCADE)
    await db.delete(chapters).where(eq(chapters.bookId, id));

    // Delete the book
    await db.delete(books).where(eq(books.id, id));

    return { success: true };
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
}

export async function searchBooks(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchPattern = `%${query.toLowerCase()}%`;

    // Search in book titles with author profile data
    const matchingBooks = await db
      .select({
        id: books.id,
        bookTitle: books.bookTitle,
        slug: books.slug,
        bookCoverUrl: books.bookCoverUrl,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        author: {
          id: profiles.id,
          name: profiles.name,
          email: profiles.email,
        },
      })
      .from(books)
      .innerJoin(profiles, eq(books.author, profiles.id))
      .where(like(sql`LOWER(${books.bookTitle})`, searchPattern))
      .orderBy(desc(books.createdAt))
      .limit(100);

    console.log('Books searched =>', matchingBooks.length);
    return matchingBooks as BookWithAuthor[];
  } catch (error) {
    console.error('Error in searchBooks:', error);
    throw error;
  }
}

// Alias for compatibility with reference implementation
export const searchBooksDb = searchBooks;
