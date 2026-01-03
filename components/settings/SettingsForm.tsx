'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import {
  updateProfile,
  changePassword,
  deleteAccount,
  updateNotificationPreferences,
} from '@/src/actions/settings';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  about: string | null;
}

interface SettingsFormProps {
  profile: Profile;
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter();

  // Profile state
  const [name, setName] = useState(profile.name || '');
  const [about, setAbout] = useState(profile.about || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Delete account state
  const [confirmText, setConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookUpdates, setBookUpdates] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMessage, setNotifMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Profile update handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    const result = await updateProfile({ name, about });

    if (result.success) {
      setProfileMessage({ type: 'success', text: result.message });
      router.refresh();
    } else {
      setProfileMessage({
        type: 'error',
        text: result.error || result.message,
      });
    }

    setProfileLoading(false);
  };

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    const result = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (result.success) {
      setPasswordMessage({ type: 'success', text: result.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMessage({
        type: 'error',
        text: result.error || result.message,
      });
    }

    setPasswordLoading(false);
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);

    const result = await deleteAccount({ confirmText });

    if (result.success) {
      router.push('/');
    } else {
      alert(result.error || result.message);
    }

    setDeleteLoading(false);
  };

  // Notification preferences handler
  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifLoading(true);
    setNotifMessage(null);

    const result = await updateNotificationPreferences({
      emailNotifications,
      bookUpdates,
      systemNotifications,
    });

    if (result.success) {
      setNotifMessage({ type: 'success', text: result.message });
    } else {
      setNotifMessage({
        type: 'error',
        text: result.error || result.message,
      });
    }

    setNotifLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Accordion>
        {/* Profile Settings */}
        <AccordionItem title="Profile Settings" defaultOpen={true}>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed
              </p>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
                required
              />
            </div>

            <div>
              <Label htmlFor="about">About / Bio</Label>
              <Textarea
                id="about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={500}
                rows={4}
              />
              <p className="mt-1 text-sm text-gray-500">
                {about.length}/500 characters
              </p>
            </div>

            {profileMessage && (
              <div
                className={`rounded-md p-3 text-sm ${
                  profileMessage.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {profileMessage.text}
              </div>
            )}

            <Button
              type="submit"
              disabled={profileLoading}
              className="bg-purple-700 hover:bg-purple-800"
            >
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </AccordionItem>

        {/* Account Settings */}
        <AccordionItem title="Account Settings">
          <div className="space-y-6">
            {/* Change Password Section */}
            <div>
              <h3 className="mb-3 text-base font-semibold">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                </div>

                {passwordMessage && (
                  <div
                    className={`rounded-md p-3 text-sm ${
                      passwordMessage.type === 'success'
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </div>

            {/* Delete Account Section */}
            <div className="border-t pt-6">
              <h3 className="mb-3 text-base font-semibold text-red-600">
                Danger Zone
              </h3>
              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-3 rounded-md border border-red-300 bg-red-50 p-4">
                  <p className="text-sm text-red-800">
                    This action cannot be undone. This will permanently delete
                    your account and all associated data.
                  </p>
                  <div>
                    <Label htmlFor="confirmDelete">
                      Type <strong>DELETE</strong> to confirm
                    </Label>
                    <Input
                      id="confirmDelete"
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading || confirmText !== 'DELETE'}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setConfirmText('');
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AccordionItem>

        {/* Notification Preferences */}
        <AccordionItem title="Notification Preferences">
          <form onSubmit={handleNotificationUpdate} className="space-y-4">
            <p className="text-sm text-gray-600">
              Manage how you receive notifications from ReaderAI Labs.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive email updates and notifications
                  </p>
                </div>
                <input
                  id="emailNotifications"
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bookUpdates">Book Updates</Label>
                  <p className="text-sm text-gray-500">
                    Get notified about new books and updates
                  </p>
                </div>
                <input
                  id="bookUpdates"
                  type="checkbox"
                  checked={bookUpdates}
                  onChange={(e) => setBookUpdates(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemNotifications">
                    System Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Important updates about your account
                  </p>
                </div>
                <input
                  id="systemNotifications"
                  type="checkbox"
                  checked={systemNotifications}
                  onChange={(e) => setSystemNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-600"
                />
              </div>
            </div>

            {notifMessage && (
              <div
                className={`rounded-md p-3 text-sm ${
                  notifMessage.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {notifMessage.text}
              </div>
            )}

            <Button
              type="submit"
              disabled={notifLoading}
              className="bg-purple-700 hover:bg-purple-800"
            >
              {notifLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </form>
        </AccordionItem>

        {/* Display Preferences */}
        <AccordionItem title="Display Preferences">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Customize your reading experience. (Coming soon)
            </p>

            <div>
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-700 focus:ring-purple-700 focus:outline-none"
                disabled
              >
                <option>Light (Default)</option>
                <option>Dark</option>
                <option>Auto</option>
              </select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-700 focus:ring-purple-700 focus:outline-none"
                disabled
              >
                <option>English</option>
              </select>
            </div>

            <Button
              type="button"
              disabled
              className="bg-gray-400 hover:bg-gray-400"
            >
              Save Display Preferences (Coming Soon)
            </Button>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
