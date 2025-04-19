import CreateExpenseForm from '@/components/forms/CreateExpenseForm';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Record Expense - Park',
  description: 'Record new expense for park',
};

export default function CreateExpensePage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className='flex w-full items-center justify-between'>
          <h1 className="text-2xl font-bold">Create New Expense</h1>
          <Link href={'/manager/expense'} className='underline'>Go to List</Link>
        </div>
        <CreateExpenseForm />
      </div>
    </ProtectedRoute>
  );
}