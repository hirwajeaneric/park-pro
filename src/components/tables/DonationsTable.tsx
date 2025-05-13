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

export default function DonationsTable() {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(new Date().getFullYear());


  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['donations', JSON.parse(localStorage.getItem('park-data') as string).id, selectedFiscalYear],
    queryFn: () => getDonationsByParkAndFiscalYear(JSON.parse(localStorage.getItem('park-data') as string).id, selectedFiscalYear),
  });

  const years = Array.from({ length: 31 }, (_, i) => 2000 + i);

  const columns: ColumnDef<DonationResponse>[] = [
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        return `$${amount.toFixed(2)}`;
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
      </div>
      <DataTable
        columns={columns}
        data={donations}
        isLoading={isLoading}
        searchKey="id"
      />
    </div>
  );
}