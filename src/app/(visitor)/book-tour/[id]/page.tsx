import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from 'next';
import { getParkActivityDetails } from "@/lib/api";
import { PageBanner } from "@/components/widget/PageBanner";
import ActivityDetails from "@/components/forms/ActivityDetails";

export const dynamicParams = true;

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const { id } = await params;
  const activity = await getParkActivityDetails(id);
  
  return {
    title: `Book - ${activity.name}`,
    description: activity.description,
  };
}

export default async function ActivityPage({ params }: Props) {
  const { id } = await params;
  const activity = await getParkActivityDetails(id);

  return (
    <ProtectedRoute>
      <PageBanner title={activity.name} backgroundImage={activity.picture} />
      <ActivityDetails activity={activity} />
    </ProtectedRoute>
  );
}