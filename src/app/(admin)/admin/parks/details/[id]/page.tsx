/* eslint-disable @typescript-eslint/no-unused-vars */
// app/admin/parks/[id]/page.tsx
import { Metadata } from 'next';
import BreadcrumbWithCustomSeparator, {
  BreadCrumLinkTypes,
} from '@/components/widget/BreadCrumComponent';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { getParkById } from '@/lib/api';
import { Park } from '@/types';
import ParkUpdateForm from '@/components/forms/ParkUpdateForm';

export const dynamicParams = true;

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const park = await getParkById(id);
    return {
      title: `${park.name} - Park Management`,
      description: `Manage park ${park.name}`,
    };
  } catch (error) {
    return {
      title: 'Park Not Found',
      description: 'Park details not available',
    };
  }
}

export default async function ParkPage({ params }: Props) {
  const { id } = await params;
  let park: Park;
  try {
    park = await getParkById(id);
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

  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: 'Parks', link: '/admin/parks', position: 'middle' },
    { label: park.name, link: '', position: 'end' },
  ];

  return (
    <ProtectedRoute>
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
          <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
          <h1 className="mt-6 font-bold text-3xl">Park Details</h1>
          <div className="mt-6 max-w-2xl">
            <ParkUpdateForm park={park} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}