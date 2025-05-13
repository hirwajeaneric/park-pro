'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  getIncomeStreamsByBudget,
  listBudgetCategoriesByBudget,
  approveBudget,
  rejectBudget,
} from '@/lib/api';
import { Budget, BudgetCategory, IncomeStreamResponse } from '@/types';

export default function GovernmentBudgetDetails({ budget }: { budget: Budget }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch income streams
  const { data: incomeStreams = [], isLoading: isIncomeStreamsLoading } = useQuery({
    queryKey: ['incomeStreams', budget.id],
    queryFn: () => getIncomeStreamsByBudget(budget.id),
  });

  // Fetch budget categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['budgetCategories', budget.id],
    queryFn: () => listBudgetCategoriesByBudget(budget.id),
  });

  // Mutations
  const approveBudgetMutation = useMutation({
    mutationFn: () => approveBudget(budget.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget approved successfully');
      router.push('/government/budgets');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve budget');
    },
  });

  const rejectBudgetMutation = useMutation({
    mutationFn: () => rejectBudget(budget.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget rejected successfully');
      router.push('/government/budgets');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject budget');
    },
  });

  // Budget Categories DataTable columns
  const categoryColumns: ColumnDef<BudgetCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'allocatedAmount',
      header: 'Allocated Amount (XAF)',
      cell: ({ row }) => {
        const value = row.getValue('allocatedAmount') as number;
        return `${value.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'usedAmount',
      header: 'Used Amount (XAF)',
      cell: ({ row }) => {
        const value = row.getValue('usedAmount') as number;
        return `${value.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy'),
    },
  ];

  // Income Streams DataTable columns
  const incomeStreamColumns: ColumnDef<IncomeStreamResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'percentage',
      header: 'Percentage (XAF)',
      cell: ({ row }) => `${row.getValue('percentage')}%`,
    },
    {
      accessorKey: 'totalContribution',
      header: 'Total Contribution (XAF)',
      cell: ({ row }) => {
        const value = row.getValue('totalContribution') as number;
        return `${value.toFixed(2)}`;
      },
    },
  ];

  // Badge variant for status
  const badgeVariant =
    budget.status === 'APPROVED' ? 'success' :
    budget.status === 'REJECTED' ? 'destructive' : 'warning';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Fiscal Year:</strong> {budget.fiscalYear}</p>
          <p><strong>Total Amount:</strong> XAF {budget.totalAmount.toFixed(2)}</p>
          <p><strong>Balance:</strong> XAF {budget.balance.toFixed(2)}</p>
          <p><strong>Status:</strong> <Badge variant={badgeVariant}>{budget.status.toUpperCase()}</Badge></p>
          <p><strong>Approver:</strong> {budget.approvedBy || 'N/A'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={categoryColumns}
            data={categories}
            isLoading={isCategoriesLoading}
            searchKey="name"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Income Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={incomeStreamColumns}
            data={incomeStreams}
            isLoading={isIncomeStreamsLoading}
            searchKey="name"
          />
        </CardContent>
      </Card>
      {categories.length != 0 && <Card>
        <CardHeader>
          <CardTitle>Budget Approval</CardTitle>
        </CardHeader>
        <CardContent>
          {budget.status === 'APPROVED' || budget.status === 'REJECTED' ? (
            <p className={budget.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}>
              This budget has already been {budget.status.toLowerCase()}.
            </p>
          ) : (
            <div className="flex gap-4">
              <Button
                variant="default"
                onClick={() => approveBudgetMutation.mutate()}
                disabled={approveBudgetMutation.isPending || rejectBudgetMutation.isPending}
              >
                {approveBudgetMutation.isPending ? 'Approving...' : 'Approve Budget'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectBudgetMutation.mutate()}
                disabled={approveBudgetMutation.isPending || rejectBudgetMutation.isPending}
              >
                {rejectBudgetMutation.isPending ? 'Rejecting...' : 'Reject Budget'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/government/budgets')}
                disabled={approveBudgetMutation.isPending || rejectBudgetMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>}
    </div>
  );
}