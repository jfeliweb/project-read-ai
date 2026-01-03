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
    <nav className="fixed-bottom mb-10 flex justify-center opacity-75">
      <ul className="mt-5 flex items-center justify-center space-x-2">
        {/* previous button */}
        {page > 1 && (
          <li className="page-item">
            <Link href={`?page=${page - 1}`}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </Link>
          </li>
        )}

        {/* first page and ellipsis */}
        {startPage > 1 && (
          <>
            <li className="page-item">
              <Link href="?page=1">
                <Button variant="ghost" size="sm">
                  1
                </Button>
              </Link>
            </li>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {/* pagination numbers */}
        {pages.map((pageNum) => (
          <li key={pageNum} className="page-item">
            <Link href={`?page=${pageNum}`}>
              <Button
                variant={pageNum === page ? 'secondary' : 'ghost'}
                size="sm"
              >
                {pageNum}
              </Button>
            </Link>
          </li>
        ))}

        {/* last page and ellipsis */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <li className="page-item">
              <Link href={`?page=${totalPages}`}>
                <Button variant="ghost" size="sm">
                  {totalPages}
                </Button>
              </Link>
            </li>
          </>
        )}

        {/* next button */}
        {page < totalPages && (
          <li className="page-item">
            <Link href={`?page=${page + 1}`}>
              <Button variant="outline" size="sm">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
