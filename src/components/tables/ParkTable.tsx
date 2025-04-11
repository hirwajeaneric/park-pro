/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePark } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Park } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ParksTableProps {
  parks: Park[];
  isLoading: boolean;
}

export default function ParksTable({ parks, isLoading }: ParksTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deletePark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parks'] });
      toast.success('Park deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete park');
    },
  });

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
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.getValue('description')}</div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/parks/details/${row.original.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate(row.original.id)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={parks}
      isLoading={isLoading}
      searchKey="name"
    />
  );
}