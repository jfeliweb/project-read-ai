import React from 'react';
import { getUserBooks } from '@/src/actions/book';
import Link from 'next/link';
import BookCard from '@/components/book-card';
import Pagination from '@/components/pagination';

interface DashboardPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;
  const limit = 3;

  const { books, totalCount } = await getUserBooks(currentPage, limit);
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="md:mt-0">
      <div className="px-4 pt-5">
        <h1 className="text-2xl font-bold">My Library</h1>
        <p className="text-sm text-gray-500">Total books: {totalCount}</p>

        <br />

        {books.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">You don&apos;t have any books yet.</p>
            <Link
              href="/dashboard/generate-book"
              className="mt-2 inline-block text-purple-600 underline hover:text-purple-800"
            >
              Create your first book
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <div key={book.id} className="group relative">
                  <Link href={`/book/${book.slug}`}>
                    <BookCard book={book} />
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-center">
              <Pagination totalPages={totalPages} page={currentPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
