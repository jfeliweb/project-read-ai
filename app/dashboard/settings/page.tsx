import { getUser, getUserProfile } from '@/src/libs/auth/utils';
import { redirect } from 'next/navigation';
import SettingsForm from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getUserProfile();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-800">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  );
}
