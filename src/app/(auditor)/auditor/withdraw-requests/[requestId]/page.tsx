/* eslint-disable @typescript-eslint/no-unused-vars */
import AuditorWithdrawRequestForm from '@/components/forms/AuditorWithdrawRequestForm';
import { getWithdrawRequestById } from '@/lib/api';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { WithdrawRequest } from '@/types';
import { Metadata } from 'next';

export const dynamicParams = true;

type Props = {
  params: { requestId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: { params: { requestId: string } }
): Promise<Metadata> {
  const { requestId } = await params;
  try {
    const request: WithdrawRequest = await getWithdrawRequestById(requestId);
    return {
      title: `Withdraw Request - ${request.reason}`,
      description: `Withdraw request details for ${request.reason}`,
    };
  } catch (error) {
    return {
      title: 'Withdraw Request Not Found',
      description: 'Selected withdraw request not available',
    };
  }
}

export default async function page({ params }: Props) {
  const { requestId } = await params;
  let request: WithdrawRequest;
  try {
    request = await getWithdrawRequestById(requestId);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
            <h1 className="font-bold text-3xl text-destructive">
              Withdraw Request Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              Unable to load withdraw request. Please try again.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Withdraw Request Details</h1>
        <AuditorWithdrawRequestForm request={request} />
      </div>
    </ProtectedRoute>
  );
}