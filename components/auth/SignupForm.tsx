'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@/src/libs/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Use explicit app domain for email redirect
    // Always use the main app domain, not the API domain
    const appOrigin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (window.location.origin.includes('api.readerlabs.app')
        ? 'https://readerlabs.app'
        : window.location.origin);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${appOrigin}/auth/confirm`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      setSuccess(true);
      setLoading(false);
      // Profile will be created automatically by database trigger or after email confirmation
      // No need to create it here since user isn't authenticated yet
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
          <p className="font-semibold">Check your email!</p>
          <p className="mt-1 text-sm">
            We&apos;ve sent you a confirmation link. Please check your email to
            verify your account.
          </p>
        </div>
        <Button
          onClick={() => router.push('/login')}
          variant="outline"
          className="w-full"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          placeholder="Your name"
        />
      </div>
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
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          placeholder="••••••••"
        />
        <p className="mt-1 text-xs text-gray-500">
          Must be at least 6 characters
        </p>
      </div>
      {error && (
        <div className="rounded bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
}
