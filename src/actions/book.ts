import { db } from '@/src/db';
import { books } from '@/src/db/schema';
import { getUser } from '@/src/libs/auth/utils';
import { eq, desc, sql } from 'drizzle-orm';

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
