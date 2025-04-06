"use client"

import { PageBanner } from "@/components/widget/PageBanner";
import ParkActivityCard, { ParkActivityCardProps } from "@/components/widget/ParkActivityCard";
import { Services } from "@/data/data";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { useQuery } from "@tanstack/react-query";
import { getParkActivities } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Cache time constants (in milliseconds)
const CACHE_SETTINGS = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes - data is fresh for this duration
  CACHE_TIME: 30 * 60 * 1000, // 30 minutes - data remains in cache
  RETRY_DELAY: 3000, // 3 seconds between retries
  RETRY_COUNT: 2, // Number of retry attempts
};

export default function BookTourPage() {
  const parkId = process.env.NEXT_PUBLIC_PARK_ID as string;

  const {
    data: activities,
    isLoading,
    error,
    isRefetching,
  } = useQuery({
    queryKey: ['parkActivities', parkId],
    queryFn: () => getParkActivities(parkId),
    enabled: !!parkId,
    
    // Cache management settings
    staleTime: CACHE_SETTINGS.STALE_TIME,
    gcTime: CACHE_SETTINGS.CACHE_TIME,
    
    // Retry settings
    retry: CACHE_SETTINGS.RETRY_COUNT,
    retryDelay: CACHE_SETTINGS.RETRY_DELAY,
    
    // Optimistic updates and refetching behavior
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  if (isLoading && !isRefetching) {
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
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold">Choose A Fun Activity</h1>
              <p className="text-lg">
                Experience the wonders of our park with professionally guided tours.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-5">
            {activities?.map((activity: ParkActivityCardProps) => (
              <ParkActivityCard 
                key={activity.id} 
                activity={{
                  ...activity,
                  picture: activity.picture
                }} 
              />
            ))}
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}