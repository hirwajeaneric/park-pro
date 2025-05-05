/* eslint-disable @typescript-eslint/no-unused-vars */
import FundingRequestDetails from '@/components/widget/FundingRequestDetails';
import { getFundingRequestById } from '@/lib/api';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { FundingRequestResponse } from '@/types';
import { Metadata } from 'next';

export const dynamicParams = true;

type Props = {
  params: { fundingRequestId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fundingRequestId } = await params;
  try {
    const request = await getFundingRequestById(fundingRequestId);
    return {
      title: `Funding Request ${request.id}`,
      description: `Details for funding request ${request.id}`,
    };
  } catch (error) {
    return {
      title: 'Funding Request Not Found',
      description: 'Funding request details not available',
    };
  }
}

export default async function FundingRequestPage({ params }: Props) {
  const { fundingRequestId } = await params;
  let request: FundingRequestResponse;
  try {
    request = await getFundingRequestById(fundingRequestId);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
            <h1 className="font-bold text-3xl text-destructive">Funding Request Not Found</h1>
            <p className="mt-2 text-muted-foreground">Unable to load funding request details. Please try again.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* <h1 className="text-2xl font-bold">Funding Request {request.id}</h1> */}
        <FundingRequestDetails request={request} />
      </div>
    </ProtectedRoute>
  );
}