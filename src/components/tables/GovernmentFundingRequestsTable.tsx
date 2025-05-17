// components/GovernmentFundingRequestsTable.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { getFundingRequestsByFiscalYear } from '@/lib/api';
import { FundingRequestResponse } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';

export default function GovernmentFundingRequestsTable() {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(new Date().getFullYear());

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['funding-requests', selectedFiscalYear],
    queryFn: () => getFundingRequestsByFiscalYear(selectedFiscalYear),
  });

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear()-5 + i);

  const columns: ColumnDef<FundingRequestResponse>[] = [
    {
      accessorKey: 'parkName',
      header: 'Park Name',
    },
    {
      accessorKey: 'requestedAmount',
      header: 'Requested Amount',
      cell: ({ row }) => {
        const amount = row.getValue('requestedAmount') as number;
        return `${amount.toFixed(2)}`
      },
    },
    {
      accessorKey: 'approvedAmount',
      header: 'Approved Amount',
      cell: ({ row }) => {
        const amount = row.getValue('approvedAmount') as number;
        return `${amount}`
      },
    },
    {
      accessorKey: 'requestType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('requestType');
        if (type == 'EXTRA_FUNDS') {
          return <Badge variant={'secondary'}>Extra Funds</Badge>
        } else if (type === 'EMERGENCY_RELIEF') {
          return <Badge variant={'warning'}>Emergency Relief</Badge>
        }
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status');
        if (status == 'PENDING') {
          return <Badge variant={'default'}>Pending</Badge>
        } else if (status === 'REJECTED') {
          return <Badge variant={'destructive'}>Rejected</Badge>
        } else if (status === 'APPROVED') {
          return <Badge variant={'success'}>Approved</Badge>
        }
      }
    },
    // {
    //   accessorKey: 'reason',
    //   header: 'Reason',
    //   cell: ({ row }) => row.getValue('reason') || 'N/A',
    // },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/government/funding-requests/${row.original.id}`}>
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
        data={requests}
        isLoading={isLoading}
        searchKey="requestedAmount"
      />
    </div>
  );
}