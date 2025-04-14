import CreateBudgetForm from "@/components/forms/CreateBudgetForm";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Add Budget - Finance Dashboard',
  description: 'Create a new budget',
};

export default function page() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Create a budget</h1>
        <CreateBudgetForm />
      </div>
    </ProtectedRoute>
  )
}