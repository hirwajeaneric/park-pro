import GovernmentParksTable from "@/components/tables/GovernmentParksTable";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parks List - Government Dashboard",
  description: "List of parks managed by the government",
};

export default function ParksPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Parks</h1>
        <GovernmentParksTable />
      </div>
    </ProtectedRoute>
  );
}