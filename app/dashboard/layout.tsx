import { getUser, isEmailConfirmed } from '@/src/libs/auth/utils';
import { redirect } from 'next/navigation';
import DashboardMenu from '@/components/dashboard-menu';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const emailConfirmed = await isEmailConfirmed();

  if (!emailConfirmed) {
    redirect('/login');
  }

  return (
    <div>
      <DashboardMenu />
      {children}
    </div>
  );
}
