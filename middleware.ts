import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import arcjet, { detectBot, rateLimit, shield } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY ?? '',
  characteristics: ['userId', 'ip.src'],
  rules: [
    // Shield protects against common attacks
    shield({
      mode: 'LIVE',
    }),
    // Bot detection
    detectBot({
      mode: 'LIVE',
      block: ['AUTOMATED'],
      allow: ['SEARCH_ENGINE', 'PREVIEW'],
    }),
    // Rate limiting
    rateLimit({
      mode: 'LIVE',
      characteristics: ['ip.src'],
      window: '1m',
      max: 100,
    }),
  ],
});

export async function middleware(request: NextRequest) {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    if (decision.reason.isBot()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
