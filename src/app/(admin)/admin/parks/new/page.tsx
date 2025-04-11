import { Metadata } from 'next';
import BreadcrumbWithCustomSeparator, {
  BreadCrumLinkTypes,
} from '@/components/widget/BreadCrumComponent';
import ParkForm from '@/components/forms/ParkForm';
import ProtectedRoute from '@/lib/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Add Park - Admin Dashboard',
  description: 'Create a new park in the system',
};

export default function AddParkPage() {
  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: 'Parks', link: '/admin/parks', position: 'middle' },
    { label: 'Add Park', link: '', position: 'end' },
  ];

  return (
    <ProtectedRoute>
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
          <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
          <h1 className="mt-6 font-bold text-3xl">Add Park</h1>
          <div className="mt-6 max-w-2xl">
            <ParkForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}