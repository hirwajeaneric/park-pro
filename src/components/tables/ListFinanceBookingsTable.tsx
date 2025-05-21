// components/tables/finance/list-finance-bookings-table.tsx
"use client";

import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { BookingResponse } from "@/types";
import { format } from "date-fns";
import { getBookingsByPark } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ReportGenerator, ReportColumnConfig } from "@/components/ui/report-generator"; // Import ReportGenerator

export default function ListFinanceBookingsTable() {
    const router = useRouter();

    // Get park ID from localStorage, handle potential parsing errors or null
    const parkData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('park-data') as string) : null;
    const parkId = parkData?.id;

    const { data: bookings = [], isLoading } = useQuery<BookingResponse[]>({
        queryKey: ['bookings', parkId],
        queryFn: () => {
            if (!parkId) return Promise.resolve([]); // Don't fetch if parkId is not available
            return getBookingsByPark(parkId);
        },
        enabled: !!parkId, // Only enable query if parkId exists
    });

    const columns: ColumnDef<BookingResponse>[] = [
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <span>
                    {row.getValue("amount")} {row.original.currency}
                </span>
            ),
        },
        {
            accessorKey: "visitDate",
            header: "Visit Date",
            cell: ({ row }) => format(new Date(row.getValue("visitDate")), "MMM dd, yyyy"),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                let variant: "default" | "success" | "destructive" | "warning" = "default";
                switch (row.getValue("status")) {
                    case "CONFIRMED":
                        variant = "success";
                        break;
                    case "CANCELLED":
                        variant = "destructive";
                        break;
                    case "PENDING":
                        variant = "default"; // Assuming 'default' for pending, or create a 'warning' variant
                        break;
                    // Add other cases if you have them, e.g., 'REFUNDED'
                }
                const status = row.getValue("status") as string;
                return (
                    <Badge variant={variant}>
                        {status.toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/finance/bookings/${row.original.id}`)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    // Define columns for the report generator
    const bookingReportColumns: ReportColumnConfig<BookingResponse>[] = [
        { key: 'id', title: 'Booking ID' },
        { key: 'activityId', title: 'Activity ID' }, // You might want to resolve activity name here
        { key: 'visitorId', title: 'Visitor ID' },   // You might want to resolve visitor name/email
        { key: 'amount', title: 'Amount', type: 'currency' },
        { key: 'currency', title: 'Currency' },
        { key: 'visitDate', title: 'Visit Date', type: 'date' },
        { key: 'status', title: 'Status', type: 'badge', badgeMap: { 'CONFIRMED': 'success', 'CANCELLED': 'destructive', 'PENDING': 'default' } },
        { key: 'paymentReference', title: 'Payment Ref' },
        { key: 'createdAt', title: 'Booked At', type: 'date' },
        // Add more fields if needed, e.g., groupMembers (will need custom handling)
    ];

    // Total calculator for bookings
    const calculateTotalBookingsAmount = (filteredBookings: BookingResponse[]) => {
        const total = filteredBookings.reduce((sum, booking) => sum + booking.amount, 0);
        return `${total.toFixed(2)} XAF`; // Assuming currency is XAF
    };

    return (
        <DataTable
            columns={columns}
            data={bookings}
            isLoading={isLoading}
            searchKey="id"
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
            // Add the ReportGenerator component to the right of the header
            // Assuming your DataTable component has a slot for additional header elements
            // If not, you'll need to wrap DataTable or modify it.
            // For now, I'll place it as a sibling. You might need to adjust layout.
        >
            <ReportGenerator
                data={bookings}
                columnsConfig={bookingReportColumns}
                reportTitle="Park Bookings Report"
                reportSubtitle={`Bookings for Park ID: ${parkId || 'N/A'}`}
                descriptionText="This report provides a detailed overview of all bookings made for the selected park, including their status, amount, and visit dates."
                totalCalculator={calculateTotalBookingsAmount}
                fileName="park_bookings_report"
                // You can optionally fetch and pass system info here
                // systemName="ParkPro System"
                // systemAddress="Kigali, Rwanda"
                // systemContact="+250 788 123 456 | info@parkpro.com"
                // logoSrc="/images/system-logo.png" // Make sure this path is correct
            />
        </DataTable>
    );
}