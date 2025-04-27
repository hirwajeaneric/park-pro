import WithdrawRequestDisplay from "@/components/widget/WithdrawRequestDisplay";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";

// Set metadata for the page
export const metadata: Metadata = {
  title: "Staff Overview - Dashboard",
  description: "Overview of park financials for the Finance Manager",
};

export default async function FinanceOverviewPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Your Activity Overview</h1>
        <h2 className="text-lg font-bold">Sent Withdraw Requests</h2>
        <WithdrawRequestDisplay />
      </div>
    </ProtectedRoute>
  );
}