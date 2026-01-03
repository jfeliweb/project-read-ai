import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WorkStep {
  image: string;
  title: string;
  description: string;
}

interface Review {
  name: string;
  location: string;
  testimonial: string;
}

interface GradientIconProps {
  imageSrc: string;
}

export default function LandingPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200">
      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center gap-8 px-4 py-16 md:flex-row md:py-24">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl leading-tight font-bold text-purple-900 md:text-6xl">
            SPARK YOUR CHILD&apos;S IMAGINATION!
          </h1>
          <p className="text-lg text-purple-800">
            Create fun and personalized stories that bring your child&apos;s
            adventures to life and spark their passion for reading - in only a
            few clicks!
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard/generate-book">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Create Stories for Free
              </Button>
            </Link>
          </div>
          <p className="text-sm text-purple-700">
            Join 150,000+ other families using Story Spark to cultivate their
            child&apos;s passion for reading.
          </p>
        </div>
        <div className="flex-1">
          <Image
            src="/images/page4.jpeg"
            alt="Magical Book Illustration"
            width={500}
            height={400}
            className="h-auto w-full rounded-3xl shadow-lg"
          />
        </div>
      </section>

      {/* Steps Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-purple-500/95" />
        <div className="relative container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            EASY TO GET STARTED
          </h2>
          <div className="mx-auto max-w-3xl">
            <Link href="/dashboard/generate-book">
              <Image
                src="/images/create-form.png"
                alt="Story Creation Form"
                width={800}
                height={400}
                className="w-full rounded-xl shadow-xl"
                priority
              />
            </Link>
            <div className="mt-8 text-center">
              <Link href="/dashboard/generate-book">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90"
                >
                  Try it now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* image section */}
      <section>
        <div className="relative overflow-hidden pt-52 pb-52">
          <div
            className="absolute inset-0 bg-cover bg-fixed bg-center bg-no-repeat"
            style={{ backgroundImage: `url('/images/book1.png')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900 opacity-90"></div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-purple-300 to-purple-500 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 bg-gradient-to-r from-purple-400 to-purple-900 bg-clip-text text-center text-3xl font-bold">
            HOW IT WORKS
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {works.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <GradientIcon imageSrc={step.image} />
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* image section */}
      <section>
        <div className="relative overflow-hidden pt-52 pb-52">
          <div
            className="absolute inset-0 bg-cover bg-fixed bg-center bg-no-repeat"
            style={{ backgroundImage: `url('/images/book3.png')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900 opacity-90"></div>
        </div>
      </section>

      {/* Our stories */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0" />
        <div className="relative container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            EXPLORE OUR STORIES
          </h2>
          <div className="mx-auto max-w-3xl">
            <Link href="/books">
              <Image
                src="/images/stories.png"
                alt="Story Creation Form"
                width={800}
                height={400}
                className="w-full rounded-xl shadow-xl"
                priority
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-purple-900">
            WHAT OUR COMMUNITY IS SAYING
          </h2>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {reviews.map((user, i) => (
              <Card key={i} className="bg-purple-500 text-white">
                <CardContent className="p-6">
                  <p className="italic">{user.testimonial}</p>
                  <p className="mt-4 font-bold">{user.name}</p>
                  <p className="text-sm">{user.location}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/dashboard/generate-book">
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600"
              >
                SIGN UP AND START CREATING STORIES!
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const works: WorkStep[] = [
  {
    image: '/icons/ideas.png',
    title: '1. Book Idea',
    description: 'Start with your book idea and the number of pages',
  },
  {
    image: '/icons/generation.png',
    title: '2. AI Generation',
    description: 'Our AI generates entire book with chapters and images',
  },
  {
    image: '/icons/publish.png',
    title: '4. Publish',
    description: 'View and share your books with your kids and family',
  },
];

const reviews: Review[] = [
  {
    name: 'Sarah',
    location: 'Los Angeles, CA',
    testimonial: `"Thank you! I love that in just a few clicks I can create a personalized story for my children that they absolutely love!"`,
  },
  {
    name: 'Michael',
    location: 'Sydney, Australia',
    testimonial: `"This tool is amazing! My son was thrilled to see a story featuring his name and favorite animals. It's like magic!"`,
  },
  {
    name: 'Emily',
    location: 'London, UK',
    testimonial: `"I can't believe this is free! The stories are creative, fun, and my daughter can't stop reading them. Highly recommend it!"`,
  },
];

const GradientIcon: React.FC<GradientIconProps> = ({ imageSrc }) => (
  <div className="relative mb-4 h-16 w-16">
    <Image
      src={imageSrc}
      alt="Step icon"
      width={64}
      height={64}
      className="h-full w-full object-contain"
    />
  </div>
);
