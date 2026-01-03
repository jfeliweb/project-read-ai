import BookView from '@/components/BookView';
import { getBook } from '@/src/actions/book';
import { notFound } from 'next/navigation';

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let bookData;
  try {
    bookData = await getBook(slug);
  } catch (error) {
    console.error('Error loading book:', error);
    notFound();
  }

  return (
    <div>
      <BookView data={bookData} />
    </div>
  );
}
