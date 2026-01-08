import { createClient } from '@/src/libs/supabase/server';
import { createAdminClient } from '@/src/libs/supabase/admin';
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
  try {
    const user = await getUser();
    if (!user) return null;

    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    return profile[0] || null;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error; // Re-throw to let caller handle it
  }
}

export async function createUserProfile(
  userId: string,
  email: string,
  name?: string,
) {
  try {
    // Use provided name, or extract username from email as default
    const profileName = name || email.split('@')[0] || 'User';

    // Use admin client to bypass RLS for profile creation
    // This is necessary because the user may not be fully authenticated yet
    // when creating their profile after email confirmation
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          name: profileName,
          role: 'user',
        },
        {
          onConflict: 'id',
          ignoreDuplicates: false,
        },
      )
      .select()
      .single();

    if (error) {
      console.error('Error creating profile with admin client:', error);
      return null;
    }

    return data;
  } catch (error: unknown) {
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
