import arcjet, { detectBot, fixedWindow, shield } from '@arcjet/next';

export default arcjet({
  key: process.env.ARCJET_KEY ?? '',
  characteristics: ['userId', 'ip.src'],
  rules: [
    // Shield protects against common attacks e.g. SQL injection, XSS, CSRF, SSRF
    shield({
      mode: 'LIVE',
    }),
    // Bot detection - allows search engines but denies scrapers
    detectBot({
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE'], // Allows search engine bots
    }),
    // Rate limit requests
    fixedWindow({
      mode: 'LIVE',
      characteristics: ['ip.src'],
      window: '1m',
      max: 100, // Allow 100 requests per minute per IP
    }),
  ],
});
