'use client';
import React from 'react';
import Image from 'next/image';
import { useState, useLayoutEffect, useCallback, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import type { BookWithAuthor } from '@/src/actions/book';

interface BookViewProps {
  data: BookWithAuthor;
}

interface Dimensions {
  width: number;
  height: number;
}

interface PageFlipInstance {
  flipPrev: (corner?: string) => void;
  flipNext: (corner?: string) => void;
  flip: (page: number, corner?: string) => void;
}

interface HTMLFlipBookRef {
  pageFlip: () => PageFlipInstance;
}

interface FlipEvent {
  data: number;
}

function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const colors = ['gray', 'red', 'green', 'blue', 'yellow', 'purple'] as const;
type Color = (typeof colors)[number];

const colorVariants: Record<Color, string> = {
  gray: 'from-gray-200 to-gray-100',
  red: 'from-red-200 to-red-100',
  green: 'from-green-200 to-green-100',
  blue: 'from-blue-200 to-blue-100',
  yellow: 'from-yellow-200 to-yellow-100',
  purple: 'from-purple-200 to-purple-100',
};

export default function BookView({
  data,
}: BookViewProps): React.JSX.Element | null {
  const bookRef = useRef<HTMLFlipBookRef>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [key, setKey] = useState<number>(0);
  const [color, setColor] = useState<Color>('gray');

  const updateDimensions = useCallback((): void => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setKey((prevKey) => prevKey + 1);
  }, []);

  useLayoutEffect(() => {
    const debouncedUpdateDimensions = debounce(updateDimensions, 250);
    // Defer initial call to avoid synchronous setState in effect
    setTimeout(() => updateDimensions(), 0);

    window.addEventListener('resize', debouncedUpdateDimensions);
    return () =>
      window.removeEventListener('resize', debouncedUpdateDimensions);
  }, [updateDimensions]);

  const isSinglePage = dimensions.width < 768;
  if (dimensions.width === 0) return null;

  const flipPreviousPage = (): void => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev('bottom');
    }
  };

  const flipNextPage = (): void => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext('bottom');
    }
  };

  const flipHomePage = (): void => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flip(0, 'top');
    }
  };

  return (
    <div>
      {/* @ts-expect-error - react-pageflip types are incomplete, props are valid at runtime */}
      <HTMLFlipBook
        key={key}
        ref={bookRef}
        width={
          isSinglePage
            ? dimensions.width * 0.9
            : Math.min(dimensions.width * 0.45, 800)
        }
        height={dimensions.height * 0.91}
        size="stretch"
        minWidth={320}
        maxWidth={dimensions.width}
        minHeight={420}
        maxHeight={dimensions.height * 0.9}
        maxShadowOpacity={0.5}
        mobileScrollSupport={true}
        drawShadow={true}
        useMouseEvents={true}
        showCover={isSinglePage}
        onFlip={(e: FlipEvent) => setCurrentPage(e.data)}
        style={{
          margin: '0 auto',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          className={`flex h-full flex-col items-center justify-center bg-gradient-to-b p-6 ${colorVariants[color]} relative`}
        >
          <Image
            src={data.bookCoverUrl}
            alt="Book Cover"
            fill={true}
            style={{ objectFit: 'cover' }}
            className="absolute inset-0 -z-10"
          />
          <h1 className="flex h-screen items-center justify-center text-center text-4xl font-bold text-white">
            {data.bookTitle}
          </h1>
        </div>

        <div className="flex h-full flex-col items-center justify-center p-6">
          <h1 className="flex h-screen items-center justify-center text-center">
            By {data.author.name || 'Unknown'}
          </h1>
        </div>

        {data.chapters?.map((page, index) => (
          <div
            key={index}
            className={`flex h-full flex-col items-center justify-center bg-linear-to-b p-6 ${colorVariants[color]} relative`}
            style={{ maxHeight: '100%' }}
          >
            <div className="flex-1 overflow-y-auto">
              <h1 className="mb-6 text-4xl font-bold">{page.subTitle}</h1>
              <div className="relative mt-4 mb-12 h-96 w-full">
                <Image
                  src={page.imageUrl}
                  alt={page.subTitle}
                  fill={true}
                  style={{ objectFit: 'cover' }}
                  className="rounded shadow"
                />
              </div>
              <p className="mt-4 text-lg">{page.textContent}</p>
            </div>

            <span className="absolute right-6 bottom-4">Page {index + 1}</span>
          </div>
        ))}

        <div className="flex h-full flex-col items-center justify-center bg-white p-6">
          <p className="flex h-screen items-center justify-center text-2xl">
            Thank you for reading!
          </p>
        </div>
      </HTMLFlipBook>

      <div className="bg-opacity-50 fixed bottom-4 left-1/2 flex -translate-x-1/2 items-center space-x-4 rounded-lg p-2 shadow-lg">
        {/* Previous Page Button */}
        <Button
          className={`hover:bg-opacity-70 rounded-full bg-transparent p-2 ${currentPage === 0 ? 'bg-opacity-50 cursor-not-allowed' : ''}`}
          onClick={flipPreviousPage}
          disabled={currentPage === 0}
        >
          <ChevronLeft
            className={`text-red-500 ${currentPage === 0 ? 'hover:text-red-500' : 'hover:text-red-700'}`}
          />
        </Button>
        {/* Home Page Button */}
        <Button
          className={`hover:bg-opacity-70 rounded-full bg-transparent p-2 ${currentPage === 0 ? 'bg-opacity-50 cursor-not-allowed' : ''}`}
          onClick={flipHomePage}
          disabled={currentPage === 0}
        >
          <BookOpen
            className={`text-blue-500 ${currentPage === 0 ? 'hover:text-blue-500' : 'hover:text-blue-700'}`}
          />
        </Button>
        {/* Next Page Button */}
        <Button
          className={`hover:bg-opacity-70 rounded-full bg-transparent p-2 ${currentPage >= (data.chapters?.length || 0) ? 'bg-opacity-50 cursor-not-allowed' : ''}`}
          onClick={flipNextPage}
          disabled={currentPage >= (data.chapters?.length || 0)}
        >
          <ChevronRight
            className={`text-green-500 ${currentPage === 0 ? 'hover:text-green-500' : 'hover:text-green-700'}`}
          />
        </Button>
        {/* Colors */}
        <div className="flex space-x-3">
          {colors.map((colorOption: Color) => (
            <div
              key={colorOption}
              className={`h-5 w-5 ${
                colorOption === 'gray'
                  ? 'border-2 border-gray-300 bg-white'
                  : `bg-${colorOption}-500`
              } cursor-pointer rounded-full`}
              onClick={() => setColor(colorOption)}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
