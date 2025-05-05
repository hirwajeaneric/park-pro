import GovernmentFundingRequestsTable from '@/components/tables/GovernmentFundingRequestsTable';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Funding Requests - Government Dashboard',
  description: 'Manage funding requests for your park',
};

export default function GovernmentFundingRequestsPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Funding Requests</h1>
        <GovernmentFundingRequestsTable />
      </div>
    </ProtectedRoute>
  );
}