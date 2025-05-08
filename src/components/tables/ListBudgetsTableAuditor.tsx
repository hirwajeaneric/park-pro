'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Budget } from '@/types';
import { format } from 'date-fns';
import { listBudgetsByPark } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function ListBudgetsTableAuditor({ parkId }: { parkId: string }) {
    const router = useRouter();

    const {data: budgets = [], isLoading } = useQuery<Budget[]>({
        queryKey: ['budgets', parkId],
        queryFn: () => listBudgetsByPark(parkId)
    })

    const columns: ColumnDef<Budget>[] = [
        {
            accessorKey: 'fiscalYear',
            header: 'Fiscal Year',
        },
        {
            accessorKey: 'totalAmount',
            header: 'Total Amount',
        },
        {
            accessorKey: 'balance',
            header: 'Balance',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.getValue('APPROVED') ? 'default' : 'success'}>
                    {row.getValue('status')}
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
                        onClick={() => router.push(`/auditor/budgets/${row.original.id}`)}
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