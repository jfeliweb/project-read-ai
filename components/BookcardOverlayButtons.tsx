'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { deleteBook } from '@/src/actions/book';
import type { BookWithAuthor } from '@/src/actions/book';

interface BookcardOverlayButtonsProps {
  book: BookWithAuthor;
}

export default function BookcardOverlayButtons({
  book,
}: BookcardOverlayButtonsProps) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const isConfirm = confirm('Are you sure you want to delete this book?');
    if (!isConfirm) return;

    await deleteBook(book.id);
    router.refresh();
  };

  return (
    <div className="bg-opacity-30 absolute inset-0 flex items-center justify-center rounded-xl bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <div className="flex space-x-4">
        <Link href={`/book/${book.slug}`}>
          <Button className="bg-blue-800 text-white hover:bg-blue-500">
            View
          </Button>
        </Link>
        <Button
          onClick={handleDelete}
          className="bg-red-500 text-white hover:bg-red-700"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
