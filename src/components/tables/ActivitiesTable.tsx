'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { getActivitiesByPark } from '@/lib/api';
import { ActivityResponse } from '@/types';

export default function ActivitiesTable() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', JSON.parse(localStorage.getItem('park-data') as string).id],
    queryFn: () => getActivitiesByPark(JSON.parse(localStorage.getItem('park-data') as string).id),
  });

  const columns: ColumnDef<ActivityResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.getValue('price') as number;
        return `$${price.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.getValue('description') || 'N/A',
    },
    {
      accessorKey: 'capacityPerDay',
      header: 'Capacity Per Day',
      cell: ({ row }) => row.getValue('capacityPerDay') || 'Unlimited',
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
          <Link href={`/finance/activities/${row.original.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={activities}
        isLoading={isLoading}
        searchKey="name"
      />
    </div>
  );
}