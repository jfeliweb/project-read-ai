import { db } from './index';
import { books, chapters } from './schema';
import * as readline from 'readline';

// Detect environment
const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.DATABASE_URL?.includes('supabase') ||
  !process.env.DATABASE_URL?.includes('127.0.0.1');

// Sample seed data
// Note: You'll need to provide a valid UUID for the author field
// This should be a real user ID from the profiles table
const sampleBooks = [
  {
    bookTitle: 'The Adventure Begins',
    author: '00000000-0000-0000-0000-000000000001', // Replace with real profile UUID
    slug: 'the-adventure-begins',
    bookCoverUrl: '/images/page1.jpeg',
  },
  {
    bookTitle: 'Mystery of the Lost City',
    author: '00000000-0000-0000-0000-000000000001', // Replace with real profile UUID
    slug: 'mystery-of-the-lost-city',
    bookCoverUrl: '/images/page2.jpeg',
  },
  {
    bookTitle: 'Journey Through Time',
    author: '00000000-0000-0000-0000-000000000001', // Replace with real profile UUID
    slug: 'journey-through-time',
    bookCoverUrl: '/images/page3.jpeg',
  },
];

const sampleChapters = [
  // Book 1 chapters
  {
    bookSlug: 'the-adventure-begins',
    subTitle: 'Chapter 1: The Call',
    textContent: 'It was a dark and stormy night when the adventure began...',
    page: '1',
    imageUrl: '/images/page1.jpeg',
  },
  {
    bookSlug: 'the-adventure-begins',
    subTitle: 'Chapter 2: The Journey',
    textContent: 'The next morning, our hero set out on a journey...',
    page: '2',
    imageUrl: '/images/page2.jpeg',
  },
  // Book 2 chapters
  {
    bookSlug: 'mystery-of-the-lost-city',
    subTitle: 'Chapter 1: The Discovery',
    textContent: 'Deep in the jungle, an ancient map was found...',
    page: '1',
    imageUrl: '/images/page3.jpeg',
  },
  {
    bookSlug: 'mystery-of-the-lost-city',
    subTitle: 'Chapter 2: The Expedition',
    textContent: 'The team assembled to explore the lost city...',
    page: '2',
    imageUrl: '/images/page4.jpeg',
  },
  // Book 3 chapters
  {
    bookSlug: 'journey-through-time',
    subTitle: 'Chapter 1: The Time Machine',
    textContent: 'In a secret laboratory, a time machine was built...',
    page: '1',
    imageUrl: '/images/page1.jpeg',
  },
  {
    bookSlug: 'journey-through-time',
    subTitle: 'Chapter 2: The First Jump',
    textContent: 'With a flash of light, the journey through time began...',
    page: '2',
    imageUrl: '/images/page2.jpeg',
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
      subTitle: chapter.subTitle,
      textContent: chapter.textContent,
      page: chapter.page,
      imageUrl: chapter.imageUrl,
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
