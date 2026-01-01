'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { generateStoryAi, saveStoryDb } from '@/src/actions/book';
import { generateImageAi } from '@/src/actions/image';
import { Loader2Icon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function GenerateBookPage() {
  const [pages, setPages] = useState([5]);
  const [prompt, setPrompt] = useState('Three little acorns learn about AI');
  const [loading, setLoading] = useState({ title: '', status: false });

  const router = useRouter();

  const handleGenerate = async () => {
    setLoading({ title: 'Generating content...', status: true });
    const finalPrompt = `
            Your job is to write a kids story book.
            The topic of the story is: ${prompt}
            The story must have exactly ${pages[0]} chapters in an array format.

            I need the response in JSON format with the following details:
            - book title
            - book chapters in an array format with each object containing story
            subTitle, textContent, page and imageDescription to generate
            a vibrant, cartoon-style illustration using replicateAi.

            Here is an example of the JSON format:
            {
              "bookTitle": "The Three Little Acorns learn about AI",
              "bookCoverDescription": "A vibrant, cartoon-style illustration of three 
              little acorns learning about AI under a large oak tree, with glowing futuristic elements"
            
              "chapters": [
                    {
                        "subTitle": "A Curious Acorn",
                        "textContent":
                        "Once upon a time, in a cozy oak tree, there were three little acorns named Oaky, Acorn, and Acorny. One day, Oaky, the most curious of the three, asked, 'What is this thing called AI that everyone keeps talking about?'",
                        "imageDescription": "A vibrant, cartoon-style illustration featuring A curious acorn looking up at a computer screen",
                        "imageUrl": "/images/page1.jpeg",
                        "page": 1
                    },
                    {
                        "subTitle": "The Wise Old Owl",
                        "textContent":
                        "A wise old owl, who lived in a nearby hollow, heard Oaky's question. 'AI, my young friend,' hooted the owl, 'is a clever tool that can think and learn, much like a human brain. It can solve problems, create art, and even drive cars!'",
                        "imageDescription": "A vibrant, cartoon-style illustration featuring A wise old owl explaining AI to the acorns",
                        "imageUrl": "/images/page2.jpeg",
                        "page": 2
                    }
                ]
            }
        `;

    try {
      const result = await generateStoryAi(finalPrompt);

      setLoading({ title: 'Generating book cover image...', status: true });
      const bookCoverUrl = await generateImageAi(result.bookCoverDescription);

      setLoading({ title: 'Generating chapter images...', status: true });
      const chapterPromises = result.chapters.map(async (chapter) => {
        const imageUrl = await generateImageAi(chapter.imageDescription);
        return { ...chapter, imageUrl };
      });

      const chaptersWithImages = await Promise.all(chapterPromises);

      setLoading({ title: 'Saving story to database...', status: true });

      const storyWithImages = {
        ...result,
        bookCoverUrl,
        chapters: chaptersWithImages,
      };

      // save to db
      await saveStoryDb(storyWithImages);

      toast.success('Story saved successfully');

      setLoading({ title: '', status: false });

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate book. Please try again.');
      setLoading({ title: '', status: false });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Toaster position="top-center" />

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Number of pages: {pages[0]}
        </label>

        <Slider
          min={1}
          max={10}
          step={1}
          value={pages}
          onValueChange={setPages}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Story prompt</label>
        <Textarea
          id="prompt"
          placeholder="Enter your story prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
        />
      </div>

      <p className="animate-pulse text-red-500">
        {loading?.status && loading?.title}
      </p>

      <div className="flex justify-end">
        <Button
          className="rounded-full bg-green-600 hover:bg-green-800"
          onClick={handleGenerate}
          disabled={loading?.status}
        >
          {loading?.status ? (
            <>
              <Loader2Icon className="animate-spin" /> Please wait...
            </>
          ) : (
            'Generate Book'
          )}
        </Button>
      </div>
    </div>
  );
}
