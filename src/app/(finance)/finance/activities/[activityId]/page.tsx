/* eslint-disable @typescript-eslint/no-unused-vars */
import ActivityDetails from '@/components/widget/ActivityDetails';
import { getActivityById } from '@/lib/api';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { ActivityResponse } from '@/types';
import { Metadata } from 'next';

export const dynamicParams = true;

type Props = {
  params: { activityId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: { params: { activityId: string } }
): Promise<Metadata> {
  const { activityId } = await params;
  try {
    const activity = await getActivityById(activityId);
    return {
      title: `${activity.name} - Activity Details`,
      description: `Details for activity ${activity.name}`,
    };
  } catch (error) {
    return {
      title: 'Activity Not Found',
      description: 'Activity details not available',
    };
  }
}

export default async function ActivityPage({ params }: Props) {
  const { activityId } = await params;
  let activity: ActivityResponse;
  try {
    activity = await getActivityById(activityId);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
            <h1 className="font-bold text-3xl text-destructive">
              Activity Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              Unable to load activity details. Please try again.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">{activity.name}</h1>
        <ActivityDetails activity={activity} />
      </div>
    </ProtectedRoute>
  );
}