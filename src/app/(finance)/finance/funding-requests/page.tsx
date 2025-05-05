import FundingRequestsTabs from '@/components/widget/FundingRequestsTabs';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Budget } from '@/types';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Funding Requests - Finance Dashboard',
  description: 'View funding requests for park budgets',
};

export default async function FundingRequestsPage() {
  let budgets: Budget[] = [];
  try {
    // Note: parkId must be fetched client-side from localStorage, so we pass budgets to client component
    // Alternatively, if server-side parkId is available, fetch budgets here
    budgets = []; // Placeholder; actual fetching happens client-side
  } catch (error) {
    console.error('Failed to fetch budgets:', error);
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Funding Requests</h1>
          <Link href="/finance/funding-requests/new" className="underline">
            New Request
          </Link>
        </div>
        <FundingRequestsTabs initialBudgets={budgets} />
      </div>
    </ProtectedRoute>
  );
}