import CreateBudgetForm from '@/components/forms/CreateBudgetForm';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Budget with Income Streams - Finance Dashboard',
  description: 'Create a new budget and manage its income streams',
};

export default function CreateBudgetPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Create New Budget</h1>
          <Link href="/finance/budget" className="underline">
            Back to Budgets
          </Link>
        </div>
        <CreateBudgetForm />
      </div>
    </ProtectedRoute>
  );
}