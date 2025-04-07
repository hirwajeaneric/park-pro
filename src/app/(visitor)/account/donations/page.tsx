"use client"

import ProtectedRoute from "@/lib/ProtectedRoute";
import UserAccountLayout from "@/lib/UserAccountLayout";
import { useAuth } from "@/hooks/useAuth";
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
import { getUserDonations } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";

type Donation = {
  id: string;
  parkId: string;
  amount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentReference: string;
  currency: string;
  motiveForDonation: string;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function DonationsPage() {
  const { accessToken } = useAuth();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: donations, isLoading } = useQuery({
    queryKey: ["userDonations"],
    queryFn: () => getUserDonations(accessToken as string),
  });

  const columns: ColumnDef<Donation>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM dd, yyyy"),
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
        const status = row.getValue("status");
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
      accessorKey: "motiveForDonation",
      header: "Purpose",
      cell: ({ row }) => row.getValue("motiveForDonation"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedDonation(row.original);
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
        title="Donations"
        subTitle="Your Donation History"
        bannerPicture="/TVR7E3Kuzg2iRhKkjZPeWk-1200-80.jpg.webp"
      >
        <DataTable
          columns={columns}
          data={donations || []}
          isLoading={isLoading}
          searchKey="motiveForDonation"
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
              <DialogTitle>Donation Details</DialogTitle>
            </DialogHeader>
            {selectedDonation && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Donation ID</p>
                  <p>{selectedDonation.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p>
                    {selectedDonation.amount} {selectedDonation.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedDonation.status === "CONFIRMED"
                        ? "default"
                        : selectedDonation.status === "PENDING"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {selectedDonation.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p>{selectedDonation.motiveForDonation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Reference</p>
                  <p>{selectedDonation.paymentReference}</p>
                </div>
                {selectedDonation.confirmedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmed At</p>
                    <p>
                      {format(new Date(selectedDonation.confirmedAt), "PPP p")}
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