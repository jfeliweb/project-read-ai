'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';

export default function MainMenu(): React.JSX.Element {
  const { user, profile } = useAuth();
  const loggedIn = !!user;

  return (
    <nav className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-purple-700 pb-2 text-lg text-purple-800">
      <Link href="/" className="mx-2 mt-2 flex items-center">
        <Image src="/logo.png" alt="logo" width={50} height={50} />
        <span className="ml-2 text-xl font-bold text-purple-800">
          ReaderAI Labs
        </span>
      </Link>

      {/* nav buttons */}
      <div className="mt-2 mr-2 flex flex-wrap gap-3">
        <Link href="/books" className="hover:text-green-800">
          Books
        </Link>

        <Link href="/dashboard/generate-book" className="hover:text-green-800">
          Generate Book
        </Link>

        <Link href="/search" className="hover:text-green-800">
          Search
        </Link>

        {loggedIn ? (
          <>
            <Link href="/dashboard">
              <span className="relative p-2 capitalize">
                {profile?.name || user?.email}
                <span className="top-0.4 absolute right-0.5 h-2 w-2 rounded-full bg-green-500"></span>
              </span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-green-800">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
