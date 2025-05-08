import AuditorParksTable from "@/components/tables/AuditorParksTable";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parks List - Auditor Dashboard",
  description: "List of parks by auditor",
};

export default function ParksPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Parks</h1>
        <AuditorParksTable />
      </div>
    </ProtectedRoute>
  );
}