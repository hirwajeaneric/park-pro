'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { listBudgetsByPark, listBudgetWithdrawRequests } from '@/lib/api';
import { Budget, WithdrawRequest } from '@/types';

type Props = {
  parkId: string
}

export default function WithdrawRequestDisplayAuditor({ parkId }: Props) {
  const router = useRouter();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  // Fetch budgets for the park
  const { data: budgets = [], isLoading: isBudgetsLoading } = useQuery({
    queryKey: ['budgets', parkId],
    queryFn: () => listBudgetsByPark(parkId!),
    enabled: !!parkId,
  });

  // Fetch withdraw requests for the selected budget
  const { data: withdrawRequests = [], isLoading: isRequestsLoading } = useQuery({
    queryKey: ['withdrawRequests', selectedBudgetId],
    queryFn: () => listBudgetWithdrawRequests(selectedBudgetId!),
    enabled: !!selectedBudgetId,
  });

  // Set default budget on load
  useEffect(() => {
    if (budgets.length > 0 && !selectedBudgetId) {
      setSelectedBudgetId(budgets[0].id);
    }
  }, [budgets, selectedBudgetId]);

  const columns: ColumnDef<WithdrawRequest>[] = [
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `${row.getValue('amount')} ${row.original.currency}`,
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
    },
    {
      accessorKey: 'budgetCategoryName',
      header: 'Category',
      cell: ({ row }) => {
        // Assuming category name is fetched separately or stored; here we show ID
        return row.getValue('budgetCategoryName');
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('status') === 'APPROVED' ? 'success' : row.getValue('status') === 'REJECTED' ? 'warning' : 'secondary'}>
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      accessorKey: 'auditStatus',
      header: 'Audit Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('auditStatus') === 'PASSED' ? 'success' : 'secondary'}>
          {row.getValue('auditStatus')}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/auditor/withdraw-requests/${row.original.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      {!parkId ? (
        <p className="text-red-500">No park data found. Please log in again.</p>
      ) : isBudgetsLoading ? (
        <p>Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <p>No budgets found for this park.</p>
      ) : (
        <Tabs
          value={selectedBudgetId || ''}
          onValueChange={setSelectedBudgetId}
          className="space-y-4"
        >
          <TabsList>
            {budgets.map((budget: Budget) => (
              <TabsTrigger key={budget.id} value={budget.id}>
                {budget.fiscalYear}
              </TabsTrigger>
            ))}
          </TabsList>
          {budgets.map((budget: Budget) => (
            <TabsContent key={budget.id} value={budget.id}>
              <DataTable
                columns={columns}
                data={withdrawRequests}
                isLoading={isRequestsLoading}
                searchKey="reason"
                filters={[
                  {
                    column: 'status',
                    title: 'Status',
                    options: [
                      { label: 'Pending', value: 'PENDING' },
                      { label: 'Approved', value: 'APPROVED' },
                      { label: 'Rejected', value: 'REJECTED' },
                    ],
                  },
                  {
                    column: 'auditStatus',
                    title: 'Audit Status',
                    options: [
                      { label: 'Passed', value: 'PASSED' },
                      { label: 'Failed', value: 'FAILED' },
                      { label: 'Unjustified', value: 'UNJUSTIFIED' },
                    ],
                  },
                ]}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </>
  );
}