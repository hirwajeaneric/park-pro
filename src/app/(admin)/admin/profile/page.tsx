"use client";

import { useAuth } from "@/hooks/useAuth";
import BreadcrumbWithCustomSeparator, { BreadCrumLinkTypes } from "@/components/widget/BreadCrumComponent";

export default function ProfilePage() {
  const { userProfile } = useAuth();

  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: "Profile", link: "/admin/profile", position: "end" },
  ];

  if (!userProfile) return <div>Loading...</div>;

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
        <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
        <h1 className="mt-6 font-bold text-3xl">Profile</h1>
        <div className="mt-6 space-y-4">
          <div>
            <label className="font-bold">First Name:</label>
            <p>{userProfile.firstName}</p>
          </div>
          <div>
            <label className="font-bold">Last Name:</label>
            <p>{userProfile.lastName}</p>
          </div>
          <div>
            <label className="font-bold">Email:</label>
            <p>{userProfile.email}</p>
          </div>
          <div>
            <label className="font-bold">Role:</label>
            <p>{userProfile.role}</p>
          </div>
          <div>
            <label className="font-bold">Park ID:</label>
            <p>{userProfile.parkId || "Not assigned"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}