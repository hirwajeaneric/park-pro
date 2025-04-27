import GovernmentOverview from "@/components/dashboard/GovernmentOverview";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";

// Set metadata for the page
export const metadata: Metadata = {
  title: "Government Overview - Government Dashboard",
  description: "Overview of park budgets and management for government users",
};

export default async function GovernmentOverviewPage() {
  // Default to the current fiscal year (2025, as of April 27, 2025)
  const currentFiscalYear = new Date().getFullYear();

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Government Overview</h1>
        <GovernmentOverview initialFiscalYear={currentFiscalYear} />
      </div>
    </ProtectedRoute>
  );
}