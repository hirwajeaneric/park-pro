import ListBudgetsTable from "@/components/tables/ListBudgetsTable";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Budgets - Finance Manager Dashboard',
  description: 'Manage park budgets',
};

export default async function page() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Budgets</h1>
          <Link href="/finance/budget/new" className="underline">
            Create New Budgets
          </Link>
        </div>
        <ListBudgetsTable />
      </div>
    </ProtectedRoute>
  )
}