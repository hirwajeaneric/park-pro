/* eslint-disable @typescript-eslint/no-unused-vars */
import ApplicationDetails from "@/components/widget/ApplicationDetails";
import { getOpportunityApplicationById } from "@/lib/api";
import ProtectedRoute from "@/lib/ProtectedRoute";
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
      title: `Application by ${application.firstName} ${application.lastName} - Government Dashboard`,
      description: `Details for opportunity application by ${application.firstName} ${application.lastName}`,
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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Application by {application.firstName} {application.lastName}</h1>
        <ApplicationDetails application={application} />
      </div>
    </ProtectedRoute>
  );
}
