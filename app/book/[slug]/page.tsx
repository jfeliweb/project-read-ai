import BookView from "@/components/BookView";


export default function BookPage({ params }: { params: { slug: string } }) {
  return (
    <div>
      <BookView />
    </div>
  );
}