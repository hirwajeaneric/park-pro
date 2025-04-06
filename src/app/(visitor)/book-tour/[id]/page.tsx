import ProtectedRoute from "@/lib/ProtectedRoute";
import { getParkActivityDetails } from "@/lib/api";
import { PageBanner } from "@/components/widget/PageBanner";
import ActivityDetails from "@/components/forms/ActivityDetails";

export default async function ActivityPage({ params }: { params: { id: string } }) {
  const activityId = params.id;
  const activity = await getParkActivityDetails(activityId);

  return (
    <ProtectedRoute>
      <PageBanner title={activity.name} backgroundImage={activity.picture} />
      <ActivityDetails activity={activity} />
    </ProtectedRoute>
  );
}