'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DashboardMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="flex items-center justify-between border-b-2 border-purple-700 p-2 text-purple-800">
      <div>
        <h2 className="font-bold capitalize">
          {user?.email ? `Welcome, ${user.email.split('@')[0]}` : 'Dashboard'}
        </h2>
      </div>
      <div className="mr-2 flex flex-wrap gap-3">
        <Link href="/dashboard/generate-book" className="hover:text-green-800">
          Generate Book
        </Link>
        <Link href="/dashboard/settings" className="hover:text-green-800">
          Settings
        </Link>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="cursor-pointer hover:text-red-800"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}
