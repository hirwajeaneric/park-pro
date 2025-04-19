/* eslint-disable @typescript-eslint/no-unused-vars */
import UpdateOpportunityForm from '@/components/forms/UpdateOpportunityForm';
import { getOpportunityById } from '@/lib/api';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Opportunity } from '@/types';
import { Metadata } from 'next';

export const dynamicParams = true;

type Props = {
  params: { opportunityId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: { params: { opportunityId: string } }
): Promise<Metadata> {
  const { opportunityId } = await params;
  try {
    const opportunity: Opportunity = await getOpportunityById(opportunityId);
    return {
      title: `Opportunity - ${opportunity.title}`,
      description: `Opportunity details for ${opportunity.title}`,
    };
  } catch (error) {
    return {
      title: 'Opportunity Not Found',
      description: 'Selected opportunity not available',
    };
  }
}

export default async function Page({ params }: Props) {
  const { opportunityId } = await params;
  let opportunity: Opportunity;
  try {
    opportunity = await getOpportunityById(opportunityId);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
            <h1 className="font-bold text-3xl text-destructive">
              Opportunity Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              Unable to load opportunity. Please try again.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Opportunity Details</h1>
        <UpdateOpportunityForm opportunity={opportunity} />
      </div>
    </ProtectedRoute>
  );
}