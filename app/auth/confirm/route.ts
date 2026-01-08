import { createClient } from '@/src/libs/supabase/server';
import { createUserProfile } from '@/src/libs/auth/utils';
import { NextResponse } from 'next/server';

type EmailOtpType =
  | 'signup'
  | 'invite'
  | 'magiclink'
  | 'recovery'
  | 'email_change'
  | 'email';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    // URL decode the token_hash in case it's encoded
    try {
      token_hash = decodeURIComponent(token_hash);
    } catch {
      // If decoding fails, use original token_hash
    }

    const supabase = await createClient();

    // Verify the OTP token
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });

    // Log error details for debugging
    if (error) {
      console.error('Email confirmation error:', {
        error: error.message,
        type,
        token_hash_length: token_hash?.length,
        token_hash_prefix: token_hash?.substring(0, 20),
      });
    }

    if (!error && data) {
      // User is now authenticated after email confirmation
      // Ensure profile exists (database trigger should create it, but ensure it exists)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Try to get or create profile with name from user metadata
        try {
          const { getUserProfile, updateUserProfile } = await import(
            '@/src/libs/auth/utils'
          );
          const nameFromMetadata =
            (user.user_metadata?.name as string) || undefined;

          // Try to get existing profile first
          let profile = await getUserProfile();

          if (!profile) {
            // Profile doesn't exist, create it
            profile = await createUserProfile(
              user.id,
              user.email || '',
              nameFromMetadata,
            );
          } else if (nameFromMetadata && profile.name !== nameFromMetadata) {
            // Profile exists but name doesn't match metadata (or is default), update it
            profile = await updateUserProfile(user.id, {
              name: nameFromMetadata,
            });
          }

          // Profile creation is best-effort - if it fails, the trigger should handle it
          if (!profile) {
            console.warn(
              `Profile not found for user ${user.id} after email confirmation, but trigger should create it`,
            );
          }
        } catch (profileError) {
          // Log but don't fail - profile might already exist or trigger will create it
          console.error('Error ensuring profile exists:', profileError);
        }
      }

      // Redirect to login after successful email confirmation
      const redirectPath = next && next !== '/' ? next : '/login';
      const { origin } = new URL(request.url);
      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development';

      // Use explicit app URL in production, or fall back to headers/origin
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (isLocalEnv
          ? origin
          : forwardedHost
            ? `https://${forwardedHost}`
            : origin);

      // Build redirect URL with success parameter for email confirmation
      const redirectUrl = new URL(redirectPath, baseUrl);
      redirectUrl.searchParams.set('confirmed', 'true');
      return NextResponse.redirect(redirectUrl.toString());
    } else {
      // Token verification failed - redirect to error page with helpful message
      console.error('Token verification failed:', error?.message);
    }
  }

  // return the user to an error page with instructions
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (isLocalEnv ? origin : forwardedHost ? `https://${forwardedHost}` : origin);
  const errorUrl = new URL('/auth/auth-code-error', baseUrl);
  return NextResponse.redirect(errorUrl.toString());
}
