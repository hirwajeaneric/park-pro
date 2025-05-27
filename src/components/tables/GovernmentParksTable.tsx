'use client';

import { SetStateAction, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';
import { getParks } from '@/lib/api';
import { Park } from '@/types';
import ReportExport from '@/components/reports/ReportExport';

type PaginatedParks = {
  content: Park[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  pageSize: number;
};

export default function GovernmentParksTable() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Fetch parks
  const { data, isLoading } = useQuery<PaginatedParks>({
    queryKey: ['parks', page, size],
    queryFn: () => getParks(page, size),
  });

  const parks = data?.content || [];
  const totalPages = data?.totalPages || 1;

  // DataTable columns
  const columns: ColumnDef<Park>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'location',
      header: 'Location',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="link" asChild>
          <Link href={`/government/parks/${row.original.id}`}>View Details</Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ReportExport
        title="Parks Report"
        description="This report contains all parks in the system."
        columns={[
          { label: 'Name', value: 'name' },
          { label: 'Location', value: 'location' },
          { label: 'Created At', value: 'createdAt' },
        ]}
        data={parks}
        fileName="parks-report"
      />
      <DataTable
        columns={columns}
        data={parks}
        isLoading={isLoading}
        searchKey="name"
        pagination={{
          pageIndex: page,
          pageSize: size,
          totalPages,
          onPageChange: (newPage: SetStateAction<number>) => setPage(newPage),
          onPageSizeChange: (newSize: SetStateAction<number>) => {
            setSize(newSize);
            setPage(0);
          },
        }}
      />
    </div>
  );
}