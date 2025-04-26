import BudgetDisplay from '@/components/widget/BudgetDisplay';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Budgets by Fiscal Year - Park',
  description: 'View budgets for all parks by fiscal year',
};

export default function BudgetsPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Budgets by Fiscal Year</h1>
        <BudgetDisplay />
      </div>
    </ProtectedRoute>
  );
}