import ProtectedRoute from "@/lib/ProtectedRoute";
import { getParkActivityDetails } from "@/lib/api";
import { PageBanner } from "@/components/widget/PageBanner";
import ActivityDetails from "@/components/forms/ActivityDetails";
import { Metadata } from "next";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const activity = await getParkActivityDetails(params.id);
  return {
    title: `Book - ${activity.name}`,
    description: activity.description,
  };
}

export default async function ActivityPage({ params }: PageProps) {
  const activity = await getParkActivityDetails(params.id);

  return (
    <ProtectedRoute>
      <PageBanner title={activity.name} backgroundImage={activity.picture} />
      <ActivityDetails activity={activity} />
    </ProtectedRoute>
  );
}