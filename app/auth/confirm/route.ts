import { createClient } from '@/src/libs/supabase/server';
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
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });

    if (!error) {
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
