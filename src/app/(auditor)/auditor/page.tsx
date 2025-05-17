import AuditorDashboard from '@/components/widget/AuditorDashboard';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';
import {
  getParks,
  getBudgetsByFiscalYear,
  getFundingRequestsByFiscalYear,
  listExpensesByBudget,
  listWithdrawRequestsByBudget,
} from '@/lib/api';
import { Park, BudgetByFiscalYearResponse, FundingRequestResponse, Expense, WithdrawRequest } from '@/types';

export const metadata: Metadata = {
  title: 'Auditor Dashboard',
  description: 'Overview of parks, budgets, funding requests, expenses, and audit statuses',
};

export default async function AuditorDashboardPage() {
  const fiscalYear = new Date().getFullYear();
  let parks: Park[] = [];
  let budgets: BudgetByFiscalYearResponse[] = [];
  let fundingRequests: FundingRequestResponse[] = [];
  let expenses: Expense[] = [];
  let withdrawRequests: WithdrawRequest[] = [];

  try {
    parks = await getParks(0, 100); // Fetch first 100 parks
    budgets = await getBudgetsByFiscalYear(fiscalYear);

    // Fetch funding requests for the fiscal year
    fundingRequests = await getFundingRequestsByFiscalYear(fiscalYear);

    // Fetch expenses and withdraw requests for each budget
    const expensePromises = budgets
      .filter((b) => b.budgetId)
      .map((b) => listExpensesByBudget(b.budgetId!));
    const withdrawPromises = budgets
      .filter((b) => b.budgetId)
      .map((b) => listWithdrawRequestsByBudget(b.budgetId!));

    const expenseResults = await Promise.all(expensePromises);
    const withdrawResults = await Promise.all(withdrawPromises);

    expenses = expenseResults.flat();
    withdrawRequests = withdrawResults.flat();
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Auditor Dashboard</h1>
        <AuditorDashboard
          initialParks={parks}
          initialBudgets={budgets}
          initialFundingRequests={fundingRequests}
          initialExpenses={expenses}
          initialWithdrawRequests={withdrawRequests}
          initialFiscalYear={fiscalYear}
        />
      </div>
    </ProtectedRoute>
  );
}