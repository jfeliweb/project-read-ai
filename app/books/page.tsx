import React from 'react';
import { getBooks } from '@/src/actions/book';
import Link from 'next/link';
import Pagination from '@/components/pagination';
import BookCard from '@/components/book-card';

interface BooksPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;
  const limit = 3;

  const { books, totalCount } = await getBooks(currentPage, limit);
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="md:mt-0">
      <div className="p-5">
        <h1 className="text-2xl font-bold">Explore The Latest Books</h1>
        <p className="text-sm text-gray-500">Total books: {totalCount}</p>
        <br />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div
              key={book.id}
              className="transform transition duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Link href={`/book/${book.slug}`}>
                <BookCard book={book} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <Pagination page={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
