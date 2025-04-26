'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';
import { getUsersByPark } from '@/lib/api';
import { Park, User } from '@/types';
import { Badge } from '../ui/badge';

export default function ViewOnlyParkDetails({ park }: { park: Park }) {
  // Fetch users
  const { data: users = [], isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ['users', park.id],
    queryFn: () => getUsersByPark(park.id),
    // onError: (error: Error) => {
    //   toast.error(error.message || 'Failed to load users');
    // },
  });

  // DataTable columns for users
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
      cell: ({ row }) => (
        <Badge variant={row.getValue('role') === 'ADMIN' ? 'success' : 'default'}>
          {row.getValue('role')}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-xl font-semibold">Park Details</h2>
        <Button variant="outline" asChild>
          <Link href="/government/parks">Back to Parks</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{park.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Location:</strong> {park.location}</p>
          <p><strong>Created At:</strong> {format(new Date(park.createdAt), 'MMM dd, yyyy')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Associated Users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            isLoading={isUsersLoading}
            searchKey="firstName"
          />
        </CardContent>
      </Card>
    </div>
  );
}