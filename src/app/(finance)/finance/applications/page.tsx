import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Applications - Finance Manager Dashboard',
  description: 'Manage applications for opportunities',
};

export default async function page() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Applications</h1>
      </div>
    </ProtectedRoute>
  )
}