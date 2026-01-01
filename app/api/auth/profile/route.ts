import { getUserProfile } from '@/src/libs/auth/utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
