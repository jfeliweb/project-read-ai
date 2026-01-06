import { createClient } from '@/src/libs/supabase/server';
import { createUserProfile } from '@/src/libs/auth/utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, name } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 },
      );
    }

    // Try to get authenticated user first (for existing authenticated users)
    const supabase = await createClient();
    const {
      data: { user: authenticatedUser },
    } = await supabase.auth.getUser();

    // If user is authenticated, verify userId matches
    if (authenticatedUser && userId !== authenticatedUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // For new signups (not yet authenticated), we allow profile creation
    // The userId comes from the signup response, which is trusted
    // Pass the name directly to createUserProfile to avoid an extra update
    const profile = await createUserProfile(userId, email, name);

    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to create or retrieve profile' },
        { status: 500 },
      );
    }

    // If name was provided and profile was updated, refresh it
    if (name && profile.name !== name) {
      const { updateUserProfile } = await import('@/src/libs/auth/utils');
      const updatedProfile = await updateUserProfile(userId, { name });
      if (updatedProfile) {
        return NextResponse.json({ success: true, profile: updatedProfile });
      }
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
