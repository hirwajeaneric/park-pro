/* eslint-disable @typescript-eslint/no-unused-vars */
// app/admin/profile/page.tsx
import { Metadata } from 'next';
import BreadcrumbWithCustomSeparator, {
  BreadCrumLinkTypes,
} from '@/components/widget/BreadCrumComponent';
import { getProfileData } from '@/lib/api';
import { UserProfile } from '@/types';
import { cookies } from 'next/headers';
import ProtectedRoute from '@/lib/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Profile - Admin Dashboard',
  description: 'Manage your profile',
};

export default async function ProfilePage() {
  // const cookieStore = cookies();
  // const token = cookieStore.get('access-token')?.value;
  let profile: UserProfile;
  try {
    profile = await getProfileData();
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
            <h1 className="mt-6 font-bold text-3xl">Profile Not Available</h1>
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
        <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
          <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
          <h1 className="mt-6 font-bold text-3xl">Profile</h1>
          <div className="mt-6 max-w-2xl">
            <ProfileForm profile={profile} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}