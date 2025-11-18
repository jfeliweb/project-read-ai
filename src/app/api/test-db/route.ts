import { db } from '@/src/db';
import { books, chapters } from '@/src/db/schema';
import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Test the connection by running a simple query
    const versionResult = await db.execute<{ version: string }>(
      sql`SELECT version()`,
    );
    const dbResult = await db.execute<{ database_name: string }>(
      sql`SELECT current_database() as database_name`,
    );

    // Get table counts
    const booksCount = await db.select().from(books);
    const chaptersCount = await db.select().from(chapters);

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to PostgreSQL!',
      database: dbResult.rows[0]?.database_name || 'unknown',
      postgresVersion: versionResult.rows[0]?.version || 'unknown',
      tables: {
        books: {
          count: booksCount.length,
        },
        chapters: {
          count: chaptersCount.length,
        },
      },
    });
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
