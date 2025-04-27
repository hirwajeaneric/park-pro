import FinanceOverview from "@/components/dashboard/FinanceOverview";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";

// Set metadata for the page
export const metadata: Metadata = {
  title: "Finance Overview - Government Dashboard",
  description: "Overview of park financials for the Finance Manager",
};

export default async function FinanceOverviewPage() {
  // Default to the current fiscal year (2025, as of April 27, 2025)
  const currentFiscalYear = new Date().getFullYear();

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Finance Overview</h1>
        <FinanceOverview initialFiscalYear={currentFiscalYear} />
      </div>
    </ProtectedRoute>
  );
}