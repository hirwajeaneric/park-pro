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
import { listBudgetsByPark, listExpensesByBudget } from '@/lib/api';
import { Budget, Expense } from '@/types';
import ReportExport from '@/components/reports/ReportExport';

export default function ExpenseDisplayFinance() {
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

    // Fetch expenses for the selected budget
    const { data: expenses = [], isLoading: isExpensesLoading } = useQuery({
        queryKey: ['expenses', selectedBudgetId],
        queryFn: () => listExpensesByBudget(selectedBudgetId!),
        enabled: !!selectedBudgetId,
    });

    // Set default budget on load
    useEffect(() => {
        if (budgets.length > 0 && !selectedBudgetId) {
            setSelectedBudgetId(budgets[0].id);
        }
    }, [budgets, selectedBudgetId]);

    const columns: ColumnDef<Expense>[] = [
        {
            accessorKey: 'amount',
            header: 'Amount',
            cell: ({ row }) => `${row.getValue('amount')} ${row.original.currency}`,
        },
        {
            accessorKey: 'description',
            header: 'Description',
        },
        {
            accessorKey: 'budgetCategoryName',
            header: 'Category',
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
                    onClick={() => router.push(`/finance/expense/${row.original.id}`)}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    const reportColumns = [
        { label: 'Amount', value: 'amount' },
        { label: 'Description', value: 'description' },
        { label: 'Category', value: 'budgetCategoryName' },
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
                        title="Expenses Report"
                        subtitle={`Fiscal Year: ${budgets.find((budget: Budget) => budget.id === selectedBudgetId)?.fiscalYear || ''}`}
                        description="Detailed report of all expenses for the selected fiscal year"
                        columns={reportColumns}
                        data={expenses.map(expense => ({
                            ...expense,
                            amount: `${expense.amount} ${expense.currency}`,
                            createdAt: format(new Date(expense.createdAt), 'MMM dd, yyyy')
                        }))}
                        fileName={`expenses-report-${budgets.find((budget: Budget) => budget.id === selectedBudgetId)?.fiscalYear || ''}`}
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
                                    data={expenses}
                                    isLoading={isExpensesLoading}
                                    searchKey="description"
                                    filters={[
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