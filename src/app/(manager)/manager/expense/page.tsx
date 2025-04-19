import ExpenseDisplay from '@/components/widget/ExpenseDisplay';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Submitted Expenses - Park',
  description: 'View your submitted expenses',
};

export default function MySubmittedExpensesPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className='flex w-full items-center justify-between'>
          <h1 className="text-2xl font-bold">My Submitted Expenses</h1>
          <Link href={'/manager/expense/new'} className='px-3 py-2 bg-green-800 rounded-md text-white text-sm font-semibold'>Record New Expense</Link>
        </div>
        <ExpenseDisplay />
      </div>
    </ProtectedRoute>
  );
}