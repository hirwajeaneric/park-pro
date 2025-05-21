// components/tables/finance/donations-table.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { getDonationsByParkAndFiscalYear } from '@/lib/api';
import { DonationResponse } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';
import { ReportGenerator, ReportColumnConfig } from "@/components/ui/report-generator"; // Import ReportGenerator

export default function DonationsTable() {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(new Date().getFullYear());

  // Get park ID from localStorage, handle potential parsing errors or null
  const parkData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('park-data') as string) : null;
  const parkId = parkData?.id;

  const { data: donations = [], isLoading } = useQuery<DonationResponse[]>({
    queryKey: ['donations', parkId, selectedFiscalYear],
    queryFn: () => {
        if (!parkId) return Promise.resolve([]); // Don't fetch if parkId is not available
        return getDonationsByParkAndFiscalYear(parkId, selectedFiscalYear);
    },
    enabled: !!parkId, // Only enable query if parkId exists
  });

  const years = Array.from({ length: 31 }, (_, i) => 2000 + i);

  const columns: ColumnDef<DonationResponse>[] = [
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        return `$${amount.toFixed(2)}`; // Assuming currency is USD for display here, adjust if needed
      },
    },
    {
      accessorKey: 'donorName',
      header: 'Donor',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as "CONFIRMED" | "PENDING" | "CANCELLED";
        return (<Badge
          variant={
            status === "CONFIRMED"
              ? "success"
              : status === "PENDING"
                ? "default"
                : "destructive"
          }
        >
          {status}
        </Badge>);
      }
    },
    {
      accessorKey: 'motiveForDonation',
      header: 'Motive',
      cell: ({ row }) => row.getValue('motiveForDonation') || 'N/A',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/finance/donations/${row.original.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  // Define columns for the report generator
  const donationReportColumns: ReportColumnConfig<DonationResponse>[] = [
    { key: 'id', title: 'Donation ID' },
    { key: 'donorName', title: 'Donor Name' },
    { key: 'amount', title: 'Amount', type: 'currency' },
    { key: 'currency', title: 'Currency' },
    { key: 'status', title: 'Status', type: 'badge', badgeMap: { 'CONFIRMED': 'success', 'CANCELLED': 'destructive', 'PENDING': 'default' } },
    { key: 'paymentReference', title: 'Payment Ref' },
    { key: 'motiveForDonation', title: 'Motive' },
    { key: 'fiscalYear', title: 'Fiscal Year', type: 'number' },
    { key: 'createdAt', title: 'Donated At', type: 'date' },
  ];

  // Total calculator for donations
  const calculateTotalDonationsAmount = (filteredDonations: DonationResponse[]) => {
    const total = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0);
    // Assuming currency is XAF for display, adjust if needed
    return `${total.toFixed(2)} XAF`;
  };

  // Callback for when filtered data changes within ReportGenerator.
  // This can be used to update other parts of the UI if needed,
  // but for this specific table, we're relying on the ReportGenerator's internal filtering.
  // If you want the DataTable to also filter, you'd need to lift the filteredData state up.
  const handleFilteredDonationsChange = (filtered: DonationResponse[], startDate?: Date, endDate?: Date) => {
    console.log('Filtered donations in ReportGenerator:', filtered.length, 'from', startDate, 'to', endDate);
    // If you wanted the DataTable to reflect this filtering, you would set a state here:
    // setDisplayedDonations(filtered);
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="fiscalYear" className="font-medium">Fiscal Year:</label>
        <Select
          value={selectedFiscalYear.toString()}
          onValueChange={(value) => setSelectedFiscalYear(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select fiscal year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* ReportGenerator placed here, beside the fiscal year filter */}
        <ReportGenerator
            data={donations}
            columnsConfig={donationReportColumns}
            reportTitle="Park Donations Report"
            reportSubtitle={`Donations for Park ID: ${parkId || 'N/A'}`}
            descriptionText="This report details all donations received by the park, including donor information, amounts, and fiscal year."
            totalCalculator={calculateTotalDonationsAmount}
            fileName="park_donations_report"
            enableFiltering={false} // Disable filtering inside ReportGenerator since we have fiscal year filter here
            // onFilteredDataChange={handleFilteredDonationsChange} // Enable if you need to react to internal filtering
        />
      </div>
      <DataTable
        columns={columns}
        data={donations}
        isLoading={isLoading}
        searchKey="id" // Search key for DataTable's internal search
      />
    </div>
  );
}