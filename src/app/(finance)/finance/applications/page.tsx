import ApplicationsTable from "@/components/tables/ApplicationsTable";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opportunity Applications - Government Dashboard",
  description: "List of all opportunity applications",
};

export default function ApplicationsPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Opportunity Applications</h1>
        <ApplicationsTable />
      </div>
    </ProtectedRoute>
  );
}