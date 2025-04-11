import { Metadata } from 'next';
import BreadcrumbWithCustomSeparator, {
  BreadCrumLinkTypes,
} from '@/components/widget/BreadCrumComponent';
import { getParks } from '@/lib/api';
import { Park } from '@/types';
import { cookies } from 'next/headers';
import ProtectedRoute from '@/lib/ProtectedRoute';
import ParksTable from '@/components/tables/ParkTable';

export const metadata: Metadata = {
  title: 'Parks - Admin Dashboard',
  description: 'Manage parks in the system',
};

export default async function ParksPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('access-token')?.value;

  let parks: Park[] = [];
  try {
    if (token) {
      const response = await getParks(0, 10);
      parks = response.content;
    }
  } catch (error) {
    console.error('Failed to fetch parks:', error);
  }

  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: 'Parks', link: '/admin/parks', position: 'end' },
  ];

  return (
    <ProtectedRoute>
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
          <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
          <div className="flex justify-between items-center mt-6">
            <h1 className="font-bold text-2xl">Parks</h1>
            <a
              href="/admin/parks/new"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Add Park
            </a>
          </div>
          <div className="mt-6">
            <ParksTable parks={parks} isLoading={false} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}