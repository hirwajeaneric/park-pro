'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Budget } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { listBudgetsByPark } from '@/lib/api';

export default function ListBudgetsTable() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [budgets, setBudgets] = useState<Budget[]>([]);

    useEffect(() => {
        setIsLoading(true);
        if (user?.parkId) {
            listBudgetsByPark(user?.parkId as string)
                .then(data => {
                    setBudgets(data);
                    setIsLoading(false);
                })
                .catch((error: Error) => {
                    console.log(error);
                })
        }
    }, [user?.parkId])

    const columns: ColumnDef<Budget>[] = [
        {
            accessorKey: 'fiscalYear',
            header: 'Fiscal Year',
        },
        {
            accessorKey: 'totalAmount',
            header: 'Total Amount',
        },
        // {
        //     accessorKey: 'balance',
        //     header: 'Balance',
        // },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                let variant: "default" | "success" | "destructive" = "default";
                switch (row.getValue("status")) {
                    case "APPROVED":
                        variant = "success";
                        break;
                    case "REJECTED":
                        variant = "destructive";
                        break;
                    case "PENDING":
                        variant = "default";
                        break;
                }
                const status = row.getValue("status") as string;
                return (
                    <Badge variant={variant}>
                        {status.toUpperCase()}
                    </Badge>
                );
            },
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
                        onClick={() => router.push(`/finance/budget/${row.original.id}`)}
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
            data={budgets}
            isLoading={isLoading}
            searchKey="fiscalYear"
            filters={[
                {
                    column: 'status',
                    title: 'Status',
                    options: [
                        { label: 'Draft', value: 'DRAFT' },
                        { label: 'Approved', value: 'APPROVED' },
                        { label: 'Rejected', value: 'REJECTED' },
                    ],
                }
            ]}
        />
    );
}