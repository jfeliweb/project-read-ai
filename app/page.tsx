import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center justify-center">
      <h1>Home Page</h1>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white p-2 my-2 rounded-md">Click me</Button>
      </div>
    </div>
  );
}
