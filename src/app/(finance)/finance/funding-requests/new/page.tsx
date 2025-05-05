import CreateFundingRequestForm from '@/components/forms/CreateFundingRequestForm';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Funding Request',
  description: 'Create a new funding request for your park',
};

export default function CreateFundingRequestPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Create New Funding Request</h1>
        <CreateFundingRequestForm />
      </div>
    </ProtectedRoute>
  );
}