'use server';

import { db } from '@/src/db';
import { books, chapters } from '@/src/db/schema';
import { getUser } from '@/src/libs/auth/utils';
import { eq, desc, sql } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    .where(eq(books.userId, user.id));

  const totalCount = totalResult?.count || 0;

  // Get paginated books
  const userBooks = await db
    .select()
    .from(books)
    .where(eq(books.userId, user.id))
    .orderBy(desc(books.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    books: userBooks,
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

    // Get the author name from user profile or email
    const userName = user.email?.split('@')[0] || 'Unknown Author';

    // Insert book record
    const [book] = await db
      .insert(books)
      .values({
        title: storyData.bookTitle,
        author: userName,
        slug: slug,
        userId: user.id,
        bookCoverUrl: storyData.bookCoverUrl,
        bookCoverDescription: storyData.bookCoverDescription,
      })
      .returning();

    // Insert chapter records
    const chapterValues = storyData.chapters.map((chapter) => ({
      bookId: book.id,
      title: chapter.subTitle,
      content: chapter.textContent,
      imagePrompt: chapter.imageDescription,
      image: chapter.imageUrl,
      page: chapter.page,
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
