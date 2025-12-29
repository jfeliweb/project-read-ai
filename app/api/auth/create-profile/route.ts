import { createClient } from '@/src/libs/supabase/server';
import { createUserProfile } from '@/src/libs/auth/utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, email, name } = body;

    // Verify the userId matches the authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const profile = await createUserProfile(userId, email || user.email || '');

    if (profile && name) {
      // Update name if provided
      const { updateUserProfile } = await import('@/src/libs/auth/utils');
      await updateUserProfile(userId, { name });
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
