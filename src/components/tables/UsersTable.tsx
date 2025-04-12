/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUser } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { User } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
}

export default function UsersTable({ users, isLoading }: UsersTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <Badge>{row.getValue('role')}</Badge>,
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('active') ? 'default' : 'destructive'}>
          {row.getValue('active') ? 'Active' : 'Inactive'}
        </Badge>
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
            onClick={() => router.push(`/admin/users/details/${row.original.id}`)}
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
      data={users}
      isLoading={isLoading}
      searchKey="email"
      filters={[
        {
          column: 'role',
          title: 'Role',
          options: [
            { label: 'Visitor', value: 'VISITOR' },
            { label: 'Admin', value: 'ADMIN' },
            { label: 'Finance Officer', value: 'FINANCE_OFFICER' },
            { label: 'Park Manager', value: 'PARK_MANAGER' },
            { label: 'Government Officer', value: 'GOVERNMENT_OFFICER' },
            { label: 'Auditor', value: 'AUDITOR' },
          ],
        },
        {
          column: 'active',
          title: 'Status',
          options: [
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' },
          ],
        },
      ]}
    />
  );
}