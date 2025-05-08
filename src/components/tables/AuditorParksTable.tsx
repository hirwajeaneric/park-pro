'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';

import { format } from 'date-fns';
import Link from 'next/link';
import { getParks } from '@/lib/api';
import { Park } from '@/types';

type PaginatedParks = {
  content: Park[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  pageSize: number;
};

export default function AuditorParksTable() {
  // Fetch parks
  const { data, isLoading } = useQuery<PaginatedParks>({
    queryKey: ['parks'],
    queryFn: () => getParks(),
  });

  const parks = data?.content || [];
  
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
          <Link href={`/auditor/park/${row.original.id}`}>View Details</Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={parks}
        isLoading={isLoading}
        searchKey="name"
      />
    </div>
  );
}