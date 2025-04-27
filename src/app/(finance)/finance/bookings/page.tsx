import ListBookingsTable from "@/components/tables/ListBookingsTable";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookings - Finance Dashboard",
  description: "Manage park bookings",
};

export default async function BookingsPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Bookings</h1>
        </div>
        <ListBookingsTable />
      </div>
    </ProtectedRoute>
  );
}