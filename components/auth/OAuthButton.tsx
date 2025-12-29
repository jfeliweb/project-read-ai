'use client';

import { createClient } from '@/src/libs/supabase/client';
import { Button } from '@/components/ui/button';

interface OAuthButtonProps {
  provider: 'google' | 'github' | 'discord';
  children: React.ReactNode;
}

export function OAuthButton({ provider, children }: OAuthButtonProps) {
  const supabase = createClient();

  const handleOAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('OAuth error:', error);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleOAuth}
      variant="outline"
      className="w-full"
    >
      {children}
    </Button>
  );
}
