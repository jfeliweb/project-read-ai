'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/src/libs/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  about: string | null;
  role: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      // Use setTimeout to defer state update and avoid synchronous setState
      const timeoutId = setTimeout(() => {
        if (!cancelled) {
          setProfile(null);
        }
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
      };
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (cancelled) return;

        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setProfile(data.profile);
          }
        } else {
          if (!cancelled) {
            setProfile(null);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
