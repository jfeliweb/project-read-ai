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

export async function createUserProfile(userId: string, email: string) {
  try {
    const profile = await db
      .insert(profiles)
      .values({
        id: userId,
        email,
        role: 'user',
      })
      .returning();

    return profile[0];
  } catch (error) {
    // Profile might already exist
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
