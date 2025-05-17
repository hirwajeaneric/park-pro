"use client";

import ProtectedRoute from "@/lib/ProtectedRoute";
import UserAccountLayout from "@/lib/UserAccountLayout";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { getMyBookings } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { BookingResponse } from "@/types";


export default function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["userBookings"],
    queryFn: () => getMyBookings(),
  });

  const columns: ColumnDef<BookingResponse>[] = [
    {
      accessorKey: "visitDate",
      header: "Visit Date",
      cell: ({ row }) => format(new Date(row.getValue("visitDate")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => `${row.getValue("amount")} ${row.original.currency}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as "CONFIRMED" | "PENDING" | "CANCELLED";
        return (
          <Badge
            variant={
              status === "CONFIRMED"
                ? "default"
                : status === "PENDING"
                ? "secondary"
                : "destructive"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Booked On",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM dd, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedBooking(row.original);
            setIsDialogOpen(true);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <UserAccountLayout
        title="Bookings"
        subTitle="Your Booking History"
        bannerPicture="/TVR7E3Kuzg2iRhKkjZPeWk-1200-80.jpg.webp"
      >
        <DataTable
          columns={columns}
          data={bookings || []}
          isLoading={isLoading}
          searchKey="status"
          filters={[
            {
              column: "status",
              title: "Status",
              options: [
                { label: "Pending", value: "PENDING" },
                { label: "Confirmed", value: "CONFIRMED" },
                { label: "Cancelled", value: "CANCELLED" },
              ],
            },
          ]}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p>{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visit Date</p>
                  <p>{format(new Date(selectedBooking.visitDate), "PPP")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p>
                    {selectedBooking.amount} {selectedBooking.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedBooking.status === "CONFIRMED"
                        ? "success"
                        : selectedBooking.status === "PENDING"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Reference</p>
                  <p>{selectedBooking.paymentReference}</p>
                </div>
                {selectedBooking.confirmedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmed At</p>
                    <p>
                      {format(new Date(selectedBooking.confirmedAt), "PPP p")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </UserAccountLayout>
    </ProtectedRoute>
  );
}