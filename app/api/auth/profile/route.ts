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
    let profile: Awaited<ReturnType<typeof getUserProfile>> = null;
    try {
      profile = await getUserProfile();
    } catch (profileError) {
      console.error('Error fetching profile:', profileError);
      // Log the full error for debugging
      if (profileError instanceof Error) {
        console.error('Profile fetch error details:', {
          message: profileError.message,
          stack: profileError.stack,
        });
      }
      // Continue - we'll try to create it if it doesn't exist
      profile = null;
    }

    const nameFromMetadata = (user.user_metadata?.name as string) || undefined;

    // If profile doesn't exist, try to create it (fallback if trigger didn't fire)
    if (!profile && user.email) {
      console.log(
        `Profile not found for user ${user.id}, attempting to create...`,
      );
      try {
        profile = await createUserProfile(
          user.id,
          user.email,
          nameFromMetadata,
        );
      } catch (createError) {
        console.error('Error creating profile:', createError);
        if (createError instanceof Error) {
          console.error('Create profile error details:', {
            message: createError.message,
            stack: createError.stack,
          });
        }
        // If creation fails, try to return a more helpful error
        // But don't fail completely - the trigger might create it later
        return NextResponse.json(
          {
            error: 'Profile not found and could not be created',
            details:
              createError instanceof Error
                ? createError.message
                : 'Unknown error',
          },
          { status: 500 },
        );
      }

      if (!profile) {
        console.error(
          `Failed to create profile for user ${user.id} after signup`,
        );
        // Return 404 instead of 500 - profile doesn't exist
        return NextResponse.json(
          { error: 'Profile not found and could not be created' },
          { status: 404 },
        );
      }
    }

    // If profile exists but name doesn't match metadata, update it
    if (profile && nameFromMetadata && profile.name !== nameFromMetadata) {
      try {
        const { updateUserProfile } = await import('@/src/libs/auth/utils');
        const updatedProfile = await updateUserProfile(user.id, {
          name: nameFromMetadata,
        });
        if (updatedProfile) {
          profile = updatedProfile;
        }
      } catch (updateError) {
        console.error('Error updating profile name:', updateError);
        if (updateError instanceof Error) {
          console.error('Update profile error details:', {
            message: updateError.message,
            stack: updateError.stack,
          });
        }
        // Don't fail - profile exists, just name update failed
        // Return the existing profile even if update failed
      }
    }

    if (!profile) {
      // User exists but profile doesn't exist and couldn't be created
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 },
    );
  }
}
