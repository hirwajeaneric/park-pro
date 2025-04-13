import ListBudgetsTable from "@/components/tables/ListBudgetsTable";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Budgets - Finance Manager Dashboard',
  description: 'Manage park budgets',
};

export default async function page() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Bugets</h1>
        <ListBudgetsTable />
      </div>
    </ProtectedRoute>
  )
}