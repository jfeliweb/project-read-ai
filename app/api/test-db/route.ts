import { connectToDatabase } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    // Test the connection by running a simple command
    const result = await db.admin().ping();
    
    // Get database stats
    const stats = await db.stats();
    
    // List collections
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB Atlas!',
      ping: result,
      database: db.databaseName,
      collections: collections.map((c) => c.name),
      stats: {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
      },
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

