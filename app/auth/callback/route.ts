import { createClient } from '@/src/libs/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  // Default to /login for email confirmation flows
  const next = searchParams.get('next') ?? '/login';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
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
      const redirectUrl = new URL(next, baseUrl);
      redirectUrl.searchParams.set('confirmed', 'true');

      if (isLocalEnv) {
        return NextResponse.redirect(redirectUrl.toString());
      } else if (forwardedHost) {
        return NextResponse.redirect(redirectUrl.toString());
      } else {
        return NextResponse.redirect(redirectUrl.toString());
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
