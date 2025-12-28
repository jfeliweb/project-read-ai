import { db } from './index';
import { books, chapters } from './schema';
import * as readline from 'readline';

// Detect environment
const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.DATABASE_URL?.includes('supabase') ||
  !process.env.DATABASE_URL?.includes('127.0.0.1');

// Sample seed data
const sampleBooks = [
  {
    title: 'The Adventure Begins',
    author: 'Jane Doe',
    slug: 'the-adventure-begins',
  },
  {
    title: 'Mystery of the Lost City',
    author: 'John Smith',
    slug: 'mystery-of-the-lost-city',
  },
  {
    title: 'Journey Through Time',
    author: 'Alice Johnson',
    slug: 'journey-through-time',
  },
];

const sampleChapters = [
  // Book 1 chapters
  {
    bookSlug: 'the-adventure-begins',
    title: 'Chapter 1: The Call',
    content: 'It was a dark and stormy night when the adventure began...',
    page: 1,
    imagePrompt: 'A stormy night with lightning in the distance',
    image: '/images/page1.jpeg',
  },
  {
    bookSlug: 'the-adventure-begins',
    title: 'Chapter 2: The Journey',
    content: 'The next morning, our hero set out on a journey...',
    page: 2,
    imagePrompt: 'A hero walking on a path at sunrise',
    image: '/images/page2.jpeg',
  },
  // Book 2 chapters
  {
    bookSlug: 'mystery-of-the-lost-city',
    title: 'Chapter 1: The Discovery',
    content: 'Deep in the jungle, an ancient map was found...',
    page: 1,
    imagePrompt: 'An ancient map in a jungle setting',
    image: '/images/page3.jpeg',
  },
  {
    bookSlug: 'mystery-of-the-lost-city',
    title: 'Chapter 2: The Expedition',
    content: 'The team assembled to explore the lost city...',
    page: 2,
    imagePrompt: 'Explorers preparing for an expedition',
    image: '/images/page4.jpeg',
  },
  // Book 3 chapters
  {
    bookSlug: 'journey-through-time',
    title: 'Chapter 1: The Time Machine',
    content: 'In a secret laboratory, a time machine was built...',
    page: 1,
    imagePrompt: 'A futuristic time machine in a laboratory',
    image: '/images/page1.jpeg',
  },
  {
    bookSlug: 'journey-through-time',
    title: 'Chapter 2: The First Jump',
    content: 'With a flash of light, the journey through time began...',
    page: 2,
    imagePrompt: 'A bright flash of light and swirling time portals',
    image: '/images/page2.jpeg',
  },
];

async function confirmProduction(): Promise<boolean> {
  if (!isProduction) {
    return true;
  }

  console.log('\n⚠️  WARNING: You are about to seed a PRODUCTION database!');
  console.log(
    'Database URL:',
    process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'),
  );
  console.log('\nThis will DELETE all existing data and insert sample data.');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\nType "YES" to continue or anything else to cancel: ',
      (answer) => {
        rl.close();
        resolve(answer.trim() === 'YES');
      },
    );
  });
}

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');
    console.log('Environment:', isProduction ? '🔴 PRODUCTION' : '🟢 LOCAL');
    console.log(
      'Database:',
      process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'),
    );
    console.log('');

    // Confirm if production
    const confirmed = await confirmProduction();
    if (!confirmed) {
      console.log('\n❌ Seeding cancelled.');
      process.exit(0);
    }

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.delete(chapters);
    await db.delete(books);
    console.log('✓ Existing data cleared\n');

    // Insert books
    console.log('📚 Inserting books...');
    const insertedBooks = await db
      .insert(books)
      .values(sampleBooks)
      .returning();
    console.log(`✓ Inserted ${insertedBooks.length} books\n`);

    // Create a map of book slugs to IDs
    const bookMap = new Map(insertedBooks.map((book) => [book.slug, book.id]));

    // Insert chapters with correct book IDs
    console.log('📖 Inserting chapters...');
    const chaptersToInsert = sampleChapters.map((chapter) => ({
      bookId: bookMap.get(chapter.bookSlug)!,
      title: chapter.title,
      content: chapter.content,
      page: chapter.page,
      imagePrompt: chapter.imagePrompt,
      image: chapter.image,
    }));

    const insertedChapters = await db
      .insert(chapters)
      .values(chaptersToInsert)
      .returning();
    console.log(`✓ Inserted ${insertedChapters.length} chapters\n`);

    // Summary
    console.log('✅ Database seeded successfully!');
    console.log('\nSummary:');
    console.log(`  - ${insertedBooks.length} books`);
    console.log(`  - ${insertedChapters.length} chapters`);
    console.log('\nYou can now run your application and view the seeded data.');
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
