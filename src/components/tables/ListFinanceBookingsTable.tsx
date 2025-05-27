'use client';

import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { BookingResponse } from '@/types';
import { format } from 'date-fns';
import { getBookingsByPark } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import ReportExport from '@/components/reports/ReportExport';

export default function ListFinanceBookingsTable() {
  const router = useRouter();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', JSON.parse(localStorage.getItem('park-data') as string).id],
    queryFn: () => getBookingsByPark(JSON.parse(localStorage.getItem('park-data') as string).id),
  });

  const columns: ColumnDef<BookingResponse>[] = [
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span>
          {row.getValue('amount')} {row.original.currency}
        </span>
      ),
    },
    {
      accessorKey: 'visitDate',
      header: 'Visit Date',
      cell: ({ row }) => format(new Date(row.getValue('visitDate')), 'MMM dd, yyyy'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        let variant: 'default' | 'success' | 'destructive' = 'default';
        switch (row.getValue('status')) {
          case 'CONFIRMED':
            variant = 'success';
            break;
          case 'CANCELLED':
            variant = 'destructive';
            break;
          case 'PENDING':
            variant = 'default';
            break;
        }
        const status = row.getValue('status') as string;
        return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push(`/finance/bookings/${row.original.id}`)}
          >
            <Eye className='h-4 w-4' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ReportExport
        title="Finance Bookings Report"
        description="This report contains all financial bookings for the park."
        columns={[
          { label: 'Amount', value: 'amount' },
          { label: 'Currency', value: 'currency' },
          { label: 'Visit Date', value: 'visitDate' },
          { label: 'Status', value: 'status' },
        ]}
        data={bookings}
        fileName="finance-bookings-report"
      />
      <DataTable
        columns={columns}
        data={bookings}
        isLoading={isLoading}
        searchKey="amount"
        filters={[
          {
            column: 'status',
            title: 'Status',
            options: [
              { label: 'Pending', value: 'PENDING' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ],
          },
        ]}
      />
    </div>
  );
}