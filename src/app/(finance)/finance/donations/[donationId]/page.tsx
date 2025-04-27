/* eslint-disable @typescript-eslint/no-unused-vars */
import DonationDetails from '@/components/widget/DonationDetails';
import { getDonationById } from '@/lib/api';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { DonationResponse } from '@/types';
import { Metadata } from 'next';

export const dynamicParams = true;

type Props = {
  params: { donationId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: { params: { donationId: string } }
): Promise<Metadata> {
  const { donationId } = await params;
  try {
    const donation = await getDonationById(donationId);
    return {
      title: `Donation Details - ${donation.id} - Government Dashboard`,
      description: `Details for donation ${donation.id}`,
    };
  } catch (error) {
    return {
      title: 'Donation Not Found',
      description: 'Donation details not available',
    };
  }
}

export default async function DonationPage({ params }: Props) {
  const { donationId } = await params;
  let donation: DonationResponse;
  try {
    donation = await getDonationById(donationId);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
            <h1 className="font-bold text-3xl text-destructive">
              Donation Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              Unable to load donation details. Please try again.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Donation Details</h1>
        <DonationDetails donation={donation} />
      </div>
    </ProtectedRoute>
  );
}