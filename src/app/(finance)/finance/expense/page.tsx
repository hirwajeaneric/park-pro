import ExpenseDisplayFinance from '@/components/widget/ExpenseDisplayFinance';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expenses - Park',
  description: 'View expenses for your park',
};

export default function MySubmittedExpensesPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className='flex w-full items-center justify-between'>
          <h1 className="text-2xl font-bold">Expenses</h1>
        </div>
        <ExpenseDisplayFinance />
      </div>
    </ProtectedRoute>
  );
}