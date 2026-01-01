'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalPages: number;
  page: number;
}

export default function Pagination({ totalPages, page }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={`?page=${page - 1}`}>
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
        </Link>
      )}

      {startPage > 1 && (
        <>
          <Link href="?page=1">
            <Button variant="outline" size="sm">
              1
            </Button>
          </Link>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((pageNum) => (
        <Link key={pageNum} href={`?page=${pageNum}`}>
          <Button
            variant={pageNum === page ? 'default' : 'outline'}
            size="sm"
            className={pageNum === page ? 'bg-purple-600 text-white' : ''}
          >
            {pageNum}
          </Button>
        </Link>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <Link href={`?page=${totalPages}`}>
            <Button variant="outline" size="sm">
              {totalPages}
            </Button>
          </Link>
        </>
      )}

      {page < totalPages && (
        <Link href={`?page=${page + 1}`}>
          <Button variant="outline" size="sm">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
