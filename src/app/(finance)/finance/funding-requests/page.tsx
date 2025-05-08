import FundingRequestsTabs from '@/components/widget/FundingRequestsTabs';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Funding Requests - Finance Dashboard',
  description: 'View funding requests for park budgets',
};

export default async function FundingRequestsPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Funding Requests</h1>
          <Link href="/finance/funding-requests/new" className="underline">
            New Request
          </Link>
        </div>
        <FundingRequestsTabs />
      </div>
    </ProtectedRoute>
  );
}