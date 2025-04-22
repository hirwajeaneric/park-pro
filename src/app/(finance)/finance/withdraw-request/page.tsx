import WithdrawRequestDisplayFinance from '@/components/widget/WithdrawRequestDisplayFinance';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Withdraw Requests - Park',
  description: 'View withdraw requests',
};

export default function WithdrawRequestsPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Withdraw Requests</h1>
        </div>
        <WithdrawRequestDisplayFinance />
      </div>
    </ProtectedRoute>
  );
}