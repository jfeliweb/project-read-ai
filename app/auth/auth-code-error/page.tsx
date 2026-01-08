'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@/src/libs/supabase/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthCodeErrorPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleResend = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const appOrigin =
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${appOrigin}/auth/confirm`,
        },
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Email Sent!</h1>
          </div>
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
            <p className="font-semibold">Check your inbox</p>
            <p className="mt-1 text-sm">
              We&apos;ve sent a new confirmation email to{' '}
              <strong>{email}</strong>. Please check your inbox and click the
              link to verify your account.
            </p>
          </div>
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Verification Link Expired
          </h1>
          <p className="mt-2 text-gray-600">
            The email confirmation link is invalid or has expired.
          </p>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-semibold">Why did this happen?</p>
          <ul className="mt-2 list-inside list-disc text-sm">
            <li>The link may have expired (links expire after 1 hour)</li>
            <li>The link may have already been used</li>
            <li>The link may have been clicked multiple times</li>
          </ul>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Request a new confirmation email
          </h2>
          <form onSubmit={handleResend} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            {error && (
              <div className="rounded bg-red-50 p-2 text-sm text-red-600">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Resend Confirmation Email'}
            </Button>
          </form>
        </div>

        <div className="flex justify-center gap-4 border-t border-gray-200 pt-4 text-sm">
          <Link href="/login" className="text-purple-600 hover:text-purple-800">
            Back to Login
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/signup"
            className="text-purple-600 hover:text-purple-800"
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}
