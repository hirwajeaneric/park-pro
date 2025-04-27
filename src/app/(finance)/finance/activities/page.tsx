import ActivitiesTable from "@/components/tables/ActivitiesTable";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Activities - Finance Manager Dashboard',
  description: 'Manage activities budgets',
};

export default async function page() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Activities</h1>
          <Link href="/finance/activities/new" className="underline">
            Create New Activity
          </Link>
        </div>
        <ActivitiesTable />
      </div>
    </ProtectedRoute>
  )
}