import { Button } from '@/components/ui/button';

export default function Home(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center justify-center">
        <h1>Home Page</h1>
        <Button className="my-2 rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600">
          Click me
        </Button>
      </div>
    </div>
  );
}
