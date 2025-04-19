import CreateWithdrawRequestForm from '@/components/forms/CreateWithdrawRequestForm';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Withdraw Request - Park',
  description: 'Create a new withdraw request for park',
};

export default function CreateWithdrawRequestPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Create New Withdraw Request</h1>
          <Link href={'/manager/withdraw-request'} className="underline">
            Go to List
          </Link>
        </div>
        <CreateWithdrawRequestForm />
      </div>
    </ProtectedRoute>
  );
}