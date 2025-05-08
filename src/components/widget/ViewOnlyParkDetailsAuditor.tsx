'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';
import { getUsersByPark } from '@/lib/api';
import { Park, User } from '@/types';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ExpenseDisplayAuditor from './ExpenseDisplayAuditor';
import WithdrawRequestDisplayAuditor from './WithdrawRequestDisplayAuditor';
import FundingRequestsTabsAuditor from './FundingRequestsTabsAuditor';

export default function ViewOnlyParkDetailsAuditor({ park }: { park: Park }) {
  // Fetch users
  const { data: users = [], isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ['users', park.id],
    queryFn: () => getUsersByPark(park.id),
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
          <Link href="/auditor/park">Back to Parks</Link>
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
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" defaultChecked>Users</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="withdraw-requests">Withdraw Requests</TabsTrigger>
          <TabsTrigger value="funds-requests">Request for Funds</TabsTrigger>
        </TabsList>
        {/* Users  */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Users Associated to the Park
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <DataTable
                columns={columns}
                data={users}
                isLoading={isUsersLoading}
                searchKey="firstName"
              />
            </CardContent>
          </Card>
        </TabsContent>
        {/* Expenses  */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>
                All park expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ExpenseDisplayAuditor parkId={park.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdraw Requests  */}
        <TabsContent value="withdraw-requests">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Requests</CardTitle>
              <CardDescription>
                Requests to withdraw huge sums of money
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <WithdrawRequestDisplayAuditor parkId={park.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Request for Funds  */}
        <TabsContent value="funds-requests">
          <Card>
            <CardHeader>
              <CardTitle>Requests for funds</CardTitle>
              <CardDescription>
                Requests for extra funds and emergency funds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <FundingRequestsTabsAuditor parkId={park.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}