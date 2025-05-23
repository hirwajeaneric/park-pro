'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { getBudgetsByFiscalYear } from '@/lib/api';
import { BudgetByFiscalYearResponse } from '@/types';

// Define fiscal years (current year and previous 3 years)
const currentYear = new Date().getFullYear();
const fiscalYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

export default function BudgetDisplayAuditor() {
  const router = useRouter();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>(currentYear.toString());

  // Fetch budgets for the selected fiscal year
  const { data: budgets = [], isLoading: isBudgetsLoading } = useQuery({
    queryKey: ['budgets', selectedFiscalYear],
    queryFn: () => getBudgetsByFiscalYear(Number(selectedFiscalYear)),
    // onError: (error: Error) => {
    //   toast.error(error.message || 'Failed to load budgets');
    // },
  });

  const columns: ColumnDef<BudgetByFiscalYearResponse>[] = [
    {
      accessorKey: 'parkName',
      header: 'Park Name',
    },
    {
      accessorKey: 'fiscalYear',
      header: 'Fiscal Year',
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => {
        const amount = row.getValue('totalAmount');
        return amount !== null && amount !== undefined ? `$${(amount as number).toFixed(2)}` : 'No Budget';
      },
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => {
        const balance = row.getValue('balance');
        return balance !== null && balance !== undefined ? `$${(balance as number).toFixed(2)}` : 'No Budget';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status');
        return status ? (
          <Badge variant={status === 'APPROVED' ? 'success' : status === 'DRAFT' ? 'default' : 'destructive'}>
            {String(status)}
          </Badge>
        ) : (
          'No Budget'
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt');
        return createdAt ? format(new Date(createdAt as string), 'MMM dd, yyyy') : 'N/A';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={!row.original.budgetId}
          onClick={() => router.push(`/government/budgets/${row.original.budgetId}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      {isBudgetsLoading ? (
        <p>Loading budgets...</p>
      ) : (
        <Tabs
          value={selectedFiscalYear}
          onValueChange={setSelectedFiscalYear}
          className="space-y-4"
        >
          <TabsList>
            {fiscalYears.map((year) => (
              <TabsTrigger key={year} value={year.toString()}>
                {year}
              </TabsTrigger>
            ))}
          </TabsList>
          {fiscalYears.map((year) => (
            <TabsContent key={year} value={year.toString()}>
              <DataTable
                columns={columns}
                data={budgets}
                isLoading={isBudgetsLoading}
                searchKey="parkName"
                filters={[
                  {
                    column: 'status',
                    title: 'Status',
                    options: [
                      { label: 'Draft', value: 'DRAFT' },
                      { label: 'Approved', value: 'APPROVED' },
                      { label: 'Rejected', value: 'REJECTED' },
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