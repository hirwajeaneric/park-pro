"use client";

import { useAuth } from "@/hooks/useAuth";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { getUserBookings } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";

type Booking = {
    id: string;
    activityId: string;
    amount: number;
    parkId: string;
    visitDate: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    paymentReference: string;
    currency: string;
    confirmedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export default function BookingsPage() {
    const { accessToken } = useAuth();
    const router = useRouter();

    const { data: bookings, isLoading } = useQuery({
        queryKey: ["userBookings"],
        queryFn: () => getUserBookings(accessToken as string),
    });

    const columns: ColumnDef<Booking>[] = [
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
                        router.push(`/admin/bookings/${row.id}`)
                    }}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    return (
        <>
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
        </>
    );
}