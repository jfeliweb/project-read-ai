'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Loader2Icon } from 'lucide-react';
import { searchBooksDb, BookWithAuthor } from '@/src/actions/book';
import BookCard from '@/components/book-card';

// Component wrapped in Suspense
function SearchComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [text, setText] = useState(searchParams.get('query') || '');
  const [books, setBooks] = useState<BookWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);

  // Synchronize URL query parameters with state
  useEffect(() => {
    const query = searchParams.get('query') || '';
    searchBooksDb(query).then((result) => setBooks(result));
  }, [searchParams]);

  // Function to fetch books
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`?query=${text}`);

    setLoading(true);
    try {
      const result = await searchBooksDb(text);
      setBooks(result);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form className="flex items-stretch gap-4" onSubmit={handleSearch}>
        <Input
          id="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search books"
          className="flex-1"
          autoFocus
        />
        <Button
          type="submit"
          variant="outline"
          disabled={loading}
          className="flex items-center justify-center"
        >
          {loading ? (
            <Loader2Icon className="h-5 w-5 animate-spin" />
          ) : (
            <SearchIcon className="h-5 w-5" />
          )}
          <span className="ml-2">Search</span>
        </Button>
      </form>

      <div className="mt-5">
        {loading ? (
          <p>Loading...</p>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div
                key={book.id}
                className="transform transition duration-300 hover:scale-105 hover:shadow-md"
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Your search starts here. Type something to search...
          </p>
        )}
      </div>
    </div>
  );
}

// Parent Component with Suspense
export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <Label htmlFor="search" className="block text-lg font-semibold">
        Search
      </Label>

      <Suspense fallback={<p>Loading search parameters...</p>}>
        <SearchComponent />
      </Suspense>
    </div>
  );
}
