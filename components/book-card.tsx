'use client';
import Image from 'next/image';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import BookcardOverlayButtons from '@/components/BookcardOverlayButtons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/navigation';
import type { BookWithAuthor } from '@/src/actions/book';

dayjs.extend(relativeTime);

interface BookCardProps {
  book: BookWithAuthor;
}

export default function BookCard({ book }: BookCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/book/${book.slug}`);
  };

  return (
    <Card
      className="group relative w-full max-w-2xl transform cursor-pointer transition duration-300 hover:scale-100 hover:shadow-lg"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-col pb-2">
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md">
          {book?.bookCoverUrl && (
            <Image
              src={book.bookCoverUrl}
              alt={book.bookTitle}
              fill={true}
              className="h-full w-full object-cover"
            />
          )}
          <BookcardOverlayButtons book={book} />
        </div>

        <CardTitle className="mt-2 line-clamp-1 text-lg">
          {book.bookTitle}
        </CardTitle>

        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <p className="line-clamp-1">by {book.author.name || 'Unknown'}</p>
          <p>{dayjs(book.createdAt).fromNow()}</p>
        </div>
      </CardHeader>
    </Card>
  );
}
