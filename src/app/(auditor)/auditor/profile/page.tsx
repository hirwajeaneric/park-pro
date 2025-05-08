/* eslint-disable @typescript-eslint/no-unused-vars */
import ProtectedRoute from "@/lib/ProtectedRoute";
import ProfileForm from '@/components/forms/ProfileForm';
import { getProfileData } from '@/lib/api';
import { UserProfile } from '@/types';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Profile - Auditor Dashboard',
  description: 'Manage your profile settings and personal information',
};

export default async function page() {
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

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Profile</h1>
        <ProfileForm profile={profile} />
      </div>
    </ProtectedRoute>
  )
}