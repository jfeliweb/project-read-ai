import {
  getUser,
  getUserProfile,
  createUserProfile,
} from '@/src/libs/auth/utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // First check if user is authenticated
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // User is authenticated, try to get profile
    let profile = await getUserProfile();

    // If profile doesn't exist, try to create it (fallback if trigger didn't fire)
    if (!profile && user.email) {
      console.log(
        `Profile not found for user ${user.id}, attempting to create...`,
      );
      profile = await createUserProfile(
        user.id,
        user.email,
        (user.user_metadata?.name as string) || undefined,
      );

      if (!profile) {
        console.error(
          `Failed to create profile for user ${user.id} after signup`,
        );
        return NextResponse.json(
          { error: 'Profile not found and could not be created' },
          { status: 404 },
        );
      }
    }

    if (!profile) {
      // User exists but profile doesn't exist and couldn't be created
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
