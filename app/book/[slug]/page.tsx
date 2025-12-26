import BookView from '@/components/BookView';

export default function BookPage({ params }: { params: { slug: string } }) {
  void params; // params will be used when BookView accepts dynamic data
  return (
    <div>
      <BookView />
    </div>
  );
}
