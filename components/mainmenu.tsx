'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard/generate-book',
    label: 'Create a Book',
    requiresAuth: true,
  },
  { href: '/search', label: 'Search' },
];

export default function MainMenu(): React.JSX.Element {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-purple-700 pb-2 text-lg text-purple-800">
      {/* Logo and title */}
      <Link href="/" className="mx-2 mt-2 flex items-center">
        <Image src="/logo.png" alt="logo" width={60} height={60} />
        <span className="ml-2 text-xl font-bold text-purple-800">
          ReaderAI Labs
        </span>
      </Link>
      {/* Navigation Buttons */}
      <div className="mt-2 mr-2 flex flex-wrap items-center gap-3">
        {navItems
          .filter((item) => !item.requiresAuth || user)
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-green-800"
            >
              {item.label}
            </Link>
          ))}
        {!loading && (
          <>
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  {profile?.name || user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="hover:text-green-800"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/login" className="hover:text-green-800">
                Login
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
