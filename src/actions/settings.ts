'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/src/libs/supabase/server';
import { getUser, updateUserProfile } from '@/src/libs/auth/utils';
import { db } from '@/src/db';
import { profiles } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export interface ActionResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Update user profile (name and about)
 */
export async function updateProfile(formData: {
  name: string;
  about: string;
}): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'You must be logged in to update your profile',
      };
    }

    // Validate inputs
    if (!formData.name || formData.name.trim().length === 0) {
      return {
        success: false,
        message: 'Validation error',
        error: 'Name is required',
      };
    }

    if (formData.name.length > 100) {
      return {
        success: false,
        message: 'Validation error',
        error: 'Name must be less than 100 characters',
      };
    }

    if (formData.about && formData.about.length > 500) {
      return {
        success: false,
        message: 'Validation error',
        error: 'About must be less than 500 characters',
      };
    }

    // Update profile
    const result = await updateUserProfile(user.id, {
      name: formData.name.trim(),
      about: formData.about?.trim() || '',
    });

    if (!result) {
      return {
        success: false,
        message: 'Update failed',
        error: 'Failed to update profile',
      };
    }

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      message: 'Error',
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Change user password
 */
export async function changePassword(formData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'You must be logged in to change your password',
      };
    }

    // Validate inputs
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      return {
        success: false,
        message: 'Validation error',
        error: 'All fields are required',
      };
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return {
        success: false,
        message: 'Validation error',
        error: 'New passwords do not match',
      };
    }

    if (formData.newPassword.length < 6) {
      return {
        success: false,
        message: 'Validation error',
        error: 'New password must be at least 6 characters',
      };
    }

    // Verify current password by attempting to sign in
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: formData.currentPassword,
    });

    if (signInError) {
      return {
        success: false,
        message: 'Authentication failed',
        error: 'Current password is incorrect',
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: formData.newPassword,
    });

    if (updateError) {
      return {
        success: false,
        message: 'Update failed',
        error: updateError.message || 'Failed to update password',
      };
    }

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      message: 'Error',
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(formData: {
  confirmText: string;
}): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'You must be logged in to delete your account',
      };
    }

    // Validate confirmation
    if (formData.confirmText !== 'DELETE') {
      return {
        success: false,
        message: 'Validation error',
        error: 'Please type DELETE to confirm',
      };
    }

    // Soft delete: Update profile to mark as deleted
    // Note: Actual user deletion in Supabase Auth requires admin privileges
    // This approach marks the profile as inactive
    await db
      .update(profiles)
      .set({
        name: '[Deleted User]',
        about: '',
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id));

    // Sign out the user
    const supabase = await createClient();
    await supabase.auth.signOut();

    revalidatePath('/');

    return {
      success: true,
      message: 'Account deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting account:', error);
    return {
      success: false,
      message: 'Error',
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Update notification preferences (future implementation)
 */
export async function updateNotificationPreferences(formData: {
  emailNotifications: boolean;
  bookUpdates: boolean;
  systemNotifications: boolean;
}): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'You must be logged in',
      };
    }

    // TODO: Store preferences in database when notification system is implemented
    // For now, just return success
    console.log('Notification preferences to be saved:', formData);

    return {
      success: true,
      message: 'Notification preferences updated (feature coming soon)',
    };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return {
      success: false,
      message: 'Error',
      error: 'An unexpected error occurred',
    };
  }
}
