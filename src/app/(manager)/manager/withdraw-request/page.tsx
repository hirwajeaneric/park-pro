import WithdrawRequestDisplay from '@/components/widget/WithdrawRequestDisplay';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Submitted Withdraw Requests - Park',
  description: 'View your submitted withdraw requests',
};

export default function MySubmittedWithdrawRequestsPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">My Submitted Withdraw Requests</h1>
          <Link
            href={'/manager/withdraw-request/new'}
            className="px-3 py-2 bg-green-800 rounded-md text-white text-sm font-semibold"
          >
            Create New Withdraw Request
          </Link>
        </div>
        <WithdrawRequestDisplay />
      </div>
    </ProtectedRoute>
  );
}