'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { BudgetCategory } from '@/types';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { listBudgetCategoriesByBudget } from '@/lib/api';

export default function ListBudgetCategoriesTable({ budgetId }: { budgetId: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);

    useEffect(() => {
        setIsLoading(true);
        if (budgetId) {
            listBudgetCategoriesByBudget(budgetId as string)
                .then(data => {
                    setBudgetCategories(data);
                    setIsLoading(false);
                })
                .catch((error: Error) => {
                    console.log(error);
                })
        }
    }, [budgetId]);

    const columns: ColumnDef<BudgetCategory>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'allocatedAmount',
            header: 'Allocated Amount',
            cell: ({ row }) => `XAF ${Number(row.getValue('allocatedAmount')).toFixed(2)}`,
        },
        {
            accessorKey: 'usedAmount',
            header: 'Used Amount',
            cell: ({ row }) => `XAF ${Number(row.getValue('usedAmount')).toFixed(2)}`,
        },
        {
            accessorKey: 'balance',
            header: 'Balance',
            cell: ({ row }) => `XAF ${Number(row.getValue('balance')).toFixed(2)}`,
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
                        onClick={() => router.push(`/finance/budget/${budgetId}/category/${row.original.id}`)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={budgetCategories}
            isLoading={isLoading}
            searchKey="name"
            filters={[]}
        />
    );
}