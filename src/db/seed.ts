async function seed() {
  try {
    // Example seed data - adjust based on your needs
    console.log('Seeding database...');

    // Add your seed logic here
    // import { db } from './index';
    // import { books, chapters } from './schema';

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
