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
import { toast } from 'sonner';
import { format } from 'date-fns';
import { listBudgetsByPark, listWithdrawRequestsByBudget } from '@/lib/api';
import { Budget, WithdrawRequest } from '@/types';
import ReportExport from '@/components/reports/ReportExport';

export default function WithdrawRequestDisplayFinance() {
  const router = useRouter();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  // Safely parse parkId from localStorage
  let parkId: string | null = null;
  try {
    const parkData = localStorage.getItem('park-data');
    if (parkData) {
      parkId = JSON.parse(parkData).id as string;
    }
  } catch {
    toast.error('Invalid park data. Please try again.');
  }

  // Fetch budgets for the park
  const { data: budgets = [], isLoading: isBudgetsLoading } = useQuery({
    queryKey: ['budgets', parkId],
    queryFn: () => listBudgetsByPark(parkId!),
    enabled: !!parkId,
  });

  // Fetch withdraw requests for the selected budget
  const { data: withdrawRequests = [], isLoading: isRequestsLoading } = useQuery({
    queryKey: ['withdrawRequests', selectedBudgetId],
    queryFn: () => listWithdrawRequestsByBudget(selectedBudgetId!),
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
          onClick={() => router.push(`/finance/withdraw-request/${row.original.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const reportColumns = [
    { label: 'Amount', value: 'amount' },
    { label: 'Reason', value: 'reason' },
    { label: 'Category', value: 'budgetCategoryName' },
    { label: 'Status', value: 'status' },
    { label: 'Audit Status', value: 'auditStatus' },
    { label: 'Created At', value: 'createdAt' },
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
        <div className="space-y-6">
          <ReportExport
            title="Withdraw Requests Report"
            subtitle={`Fiscal Year: ${budgets.find((budget: Budget) => budget.id === selectedBudgetId)?.fiscalYear || ''}`}
            description="Detailed report of all withdraw requests for the selected fiscal year"
            columns={reportColumns}
            data={withdrawRequests.map(request => ({
              ...request,
              amount: `${request.amount} ${request.currency}`,
              createdAt: format(new Date(request.createdAt), 'MMM dd, yyyy')
            }))}
            fileName={`withdraw-requests-report-${budgets.find((budget: Budget) => budget.id === selectedBudgetId)?.fiscalYear || ''}`}
          />
          
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
        </div>
      )}
    </>
  );
}