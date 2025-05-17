/* eslint-disable @typescript-eslint/no-unused-vars */
import ApplicationDetailsVisitor from "@/components/widget/ApplicationDetailsVisitor";
import { getOpportunityApplicationById } from "@/lib/api";
import ProtectedRoute from "@/lib/ProtectedRoute";
import UserAccountLayout from "@/lib/UserAccountLayout";
import { OpportunityApplicationResponse } from "@/types";
import { Metadata } from "next";

export const dynamicParams = true;

type Props = {
  params: { applicationId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: { params: { applicationId: string } }
): Promise<Metadata> {
  const { applicationId } = await params;
  try {
    const application = await getOpportunityApplicationById(applicationId);
    return {
      title: `Application for ${application.opportunityName}`,
      description: `Details for opportunity application`,
    };
  } catch (error) {
    return {
      title: 'Application Not Found',
      description: 'Application details not available',
    };
  }
}

export default async function ApplicationPage({ params }: Props) {
  const { applicationId } = await params;
  let application: OpportunityApplicationResponse;
  try {
    application = await getOpportunityApplicationById(applicationId);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
            <h1 className="font-bold text-3xl text-destructive">
              Application Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              Unable to load application details. Please try again.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <UserAccountLayout
        title="Applications"
        subTitle={`Application for ${application.opportunityName}`}
        bannerPicture="/TVR7E3Kuzg2iRhKkjZPeWk-1200-80.jpg.webp"
      >
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ApplicationDetailsVisitor application={application} />
      </div>
      </UserAccountLayout>
    </ProtectedRoute>
  );
}
