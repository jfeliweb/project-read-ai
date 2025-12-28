import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard/generate-book', label: 'Create a Book' },
  { href: '/login', label: 'Login' },
  { href: '/search', label: 'Search' },
];

export default function MainMenu(): React.JSX.Element {
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
      <div className="mt-2 mr-2 flex flex-wrap gap-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="hover:text-green-800"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
