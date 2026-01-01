import Link from 'next/link';
import type { InferSelectModel } from 'drizzle-orm';
import type { books } from '@/src/db/schema';

type Book = InferSelectModel<typeof books>;

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/book/${book.slug}`}>
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
          <p className="mt-1 text-sm text-gray-600">by {book.author}</p>
          <div className="mt-2 text-xs text-gray-500">
            Created: {new Date(book.createdAt).toLocaleDateString()}
          </div>
        </div>
      </Link>
    </div>
  );
}
