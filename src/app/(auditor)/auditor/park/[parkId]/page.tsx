/* eslint-disable @typescript-eslint/no-unused-vars */
import ViewOnlyParkDetailsAuditor from "@/components/widget/ViewOnlyParkDetailsAuditor";
import { getAuditByParkIdAndYear, getParkById } from "@/lib/api";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { AuditResponse, Park } from "@/types";
import { Metadata } from "next";

export const dynamicParams = true;

type Props = {
  params: { parkId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: { params: { parkId: string } }
): Promise<Metadata> {
  const { parkId } = await params;
  try {
    const park = await getParkById(parkId);
    return {
      title: `${park.name} - Government Dashboard`,
      description: `Details for ${park.name} park`,
    };
  } catch (error) {
    return {
      title: 'Park Not Found',
      description: 'Park details not available',
    };
  }
}

export default async function ParkPage({ params }: Props) {
  const { parkId } = await params;
  let park: Park;
  let audit: AuditResponse | null = null;
  try {
    park = await getParkById(parkId);
    audit = await getAuditByParkIdAndYear(parkId, 2025);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
            <h1 className="font-bold text-3xl text-destructive">
              Park Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              Unable to load park details. Please try again.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">{park.name}</h1>
        <ViewOnlyParkDetailsAuditor park={park} audit={audit} />
      </div>
    </ProtectedRoute>
  );
}