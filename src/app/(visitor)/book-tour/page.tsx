"use client";

import { PageBanner } from "@/components/widget/PageBanner";
import ParkActivityCard, { ParkActivityCardProps } from "@/components/widget/ParkActivityCard";
import { Services } from "@/data/data";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { useQuery } from "@tanstack/react-query";
import { getParkActivities } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookTourPage() {
  const parkId = process.env.NEXT_PUBLIC_PARK_ID as string;

  // Fetch activities using Tanstack Query
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['parkActivities'],
    queryFn: () => getParkActivities(parkId),
    enabled: !!parkId, // Only fetch if parkId exists
  });

  if (isLoading) {
    return (
      <ProtectedRoute>
        <PageBanner title="Book Tour" backgroundImage={Services[0].image} />
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4 flex flex-col gap-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-6 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-5">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-96 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </section>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <PageBanner title="Book Tour" backgroundImage={Services[0].image} />
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4 flex flex-col gap-6">
            <h1 className="text-2xl font-semibold">Error loading activities</h1>
            <p className="text-lg text-red-500">
              {error instanceof Error ? error.message : 'Failed to load activities'}
            </p>
          </div>
        </section>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageBanner title="Book Tour" backgroundImage={Services[0].image} />
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 flex flex-col gap-6">
          <h1 className="text-2xl font-semibold">Choose A Fun Activity From a number of Our Activities</h1>
          <p className="text-lg">Experience the wonders of Loango National Park with our professionally guided tours. Choose from a variety of packages to suit your interests and schedule.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-5">
            {activities?.map((activity: ParkActivityCardProps) => (
              <ParkActivityCard 
                key={activity.id} 
                activity={{
                  ...activity,
                  // Ensure picture is always a string (fallback to empty string if null)
                  picture: activity.picture || ''
                }} 
              />
            ))}
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}