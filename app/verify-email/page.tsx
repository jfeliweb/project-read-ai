'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@/src/libs/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Pre-fill email from query params if available
  const emailParam = searchParams.get('email');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState(emailParam || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login?confirmed=true');
      }, 2000);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);
    setError(null);

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (resendError) {
      setError(resendError.message);
    } else {
      setResendSuccess(true);
    }

    setResendLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-md">
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
            <p className="font-semibold">Email verified successfully!</p>
            <p className="mt-1 text-sm">Redirecting you to the login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code sent to your email address
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
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

          <div>
            <label htmlFor="code" className="mb-1 block text-sm font-medium">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              required
              maxLength={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-2xl tracking-widest focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="000000"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the 6-digit code from your email
            </p>
          </div>

          {error && (
            <div className="rounded bg-red-50 p-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="rounded bg-green-50 p-2 text-sm text-green-600">
              A new confirmation email has been sent to your inbox.
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || !email}
              className="text-sm text-purple-600 hover:text-purple-500 disabled:text-gray-400"
            >
              {resendLoading
                ? 'Sending...'
                : "Didn't receive the code? Resend email"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
