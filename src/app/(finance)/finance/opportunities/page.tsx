import OpportunityDisplay from '@/components/widget/OpportunityDisplay';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Park Opportunities - Park',
  description: 'View opportunities for your park',
};

export default function OpportunitiesPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Park Opportunities</h1>
          <Link
            href={'/finance/opportunities/new'}
            className="px-3 py-2 bg-green-800 rounded-md text-white text-sm font-semibold"
          >
            Create New Opportunity
          </Link>
        </div>
        <OpportunityDisplay />
      </div>
    </ProtectedRoute>
  );
}