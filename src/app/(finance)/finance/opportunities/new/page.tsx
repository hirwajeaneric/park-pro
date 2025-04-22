import CreateOpportunityForm from '@/components/forms/CreateOpportunityForm';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Opportunity - Park',
  description: 'Create a new opportunity for your park',
};

export default function CreateOpportunityPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Create New Opportunity</h1>
          <Link href={'/finance/opportunities'} className="underline">
            Go to List
          </Link>
        </div>
        <CreateOpportunityForm />
      </div>
    </ProtectedRoute>
  );
}