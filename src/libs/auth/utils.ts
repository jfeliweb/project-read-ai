import { createClient } from '@/src/libs/supabase/server';
import { db } from '@/src/db';
import { profiles } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getUserProfile() {
  const user = await getUser();
  if (!user) return null;

  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  return profile[0] || null;
}

export async function createUserProfile(
  userId: string,
  email: string,
  name?: string,
) {
  try {
    // Use provided name, or extract username from email as default
    const profileName = name || email.split('@')[0] || 'User';

    const profile = await db
      .insert(profiles)
      .values({
        id: userId,
        email,
        name: profileName,
        role: 'user',
      })
      .returning();

    return profile[0];
  } catch (error: unknown) {
    // Profile might already exist - try to fetch it
    if (
      (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505') ||
      (typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('duplicate'))
    ) {
      // Unique constraint violation - profile already exists
      try {
        const existingProfile = await db
          .select()
          .from(profiles)
          .where(eq(profiles.id, userId))
          .limit(1);
        return existingProfile[0] || null;
      } catch (fetchError) {
        console.error('Error fetching existing profile:', fetchError);
        return null;
      }
    }
    // Other errors
    console.error('Error creating profile:', error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    about?: string;
    role?: string;
  },
) {
  try {
    const updated = await db
      .update(profiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId))
      .returning();

    return updated[0] || null;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getUser();
  return !!user;
}

export async function isEmailConfirmed() {
  const user = await getUser();
  if (!user) return false;

  // Check if email is confirmed (Supabase sets email_confirmed_at when confirmed)
  return !!user.email_confirmed_at || !!user.confirmed_at;
}

export async function requireEmailConfirmation() {
  const user = await getUser();
  if (!user) {
    return { requiresAuth: true, requiresConfirmation: false };
  }

  const confirmed = !!user.email_confirmed_at || !!user.confirmed_at;
  return { requiresAuth: false, requiresConfirmation: !confirmed };
}
