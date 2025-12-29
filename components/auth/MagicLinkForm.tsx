'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@/src/libs/supabase/client';
import { Button } from '@/components/ui/button';

export function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
        <p className="font-semibold">Check your email!</p>
        <p className="mt-1 text-sm">
          We&apos;ve sent you a magic link. Click the link in the email to sign
          in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="magic-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="magic-email"
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
        {loading ? 'Sending...' : 'Send Magic Link'}
      </Button>
    </form>
  );
}
