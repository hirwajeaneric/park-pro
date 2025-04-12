/* eslint-disable @typescript-eslint/no-unused-vars */
import { Metadata } from 'next';
import BreadcrumbWithCustomSeparator, {
  BreadCrumLinkTypes,
} from '@/components/widget/BreadCrumComponent';
import ProtectedRoute from '@/lib/ProtectedRoute';
import ProfileForm from '@/components/forms/ProfileForm';
import { getProfileData } from '@/lib/api';
import { UserProfile } from '@/types';

export const metadata: Metadata = {
  title: 'Profile - Admin Dashboard',
  description: 'Manage your profile settings and personal information',
};

export default async function ProfilePage() {
  let profile: UserProfile;

  try {
    profile = await getProfileData();
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
            <h1 className="font-bold text-3xl text-destructive">
              Profile Not Available
            </h1>
            <p className="mt-2 text-muted-foreground">
              Unable to load your profile. Please try logging in again.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: 'Profile', link: '/admin/profile', position: 'end' },
  ];

  return (
    <ProtectedRoute>
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
          <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
          <h1 className="mt-6 font-bold text-3xl">Your Profile</h1>
          <div className="mt-6 max-w-2xl">
            <ProfileForm profile={profile} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
    );
}