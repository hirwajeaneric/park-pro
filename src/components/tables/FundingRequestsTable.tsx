'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { getFundingRequestsByBudget } from '@/lib/api';
import { FundingRequestResponse } from '@/types';
import { Badge } from '../ui/badge';

export default function FundingRequestsTable({ budgetId }: { budgetId: string }) {
    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['funding-requests', budgetId],
        queryFn: () => getFundingRequestsByBudget(budgetId),
    });

    const columns: ColumnDef<FundingRequestResponse>[] = [
        {
            accessorKey: 'requestedAmount',
            header: 'Requested Amount',
            cell: ({ row }) => {
                const amount = row.getValue('requestedAmount') as number;
                return `${amount.toFixed(2)}`
            },
        },
        {
            accessorKey: 'requestType',
            header: 'Type',
            cell: ({ row }) => {
                const type = row.getValue('requestType');
                if (type == 'EXTRA_FUNDS') {
                    return <Badge variant={'secondary'}>Extra Funds</Badge>
                } else if (type === 'EMERGENCY_RELIEF') {
                    return <Badge variant={'warning'}>Emergency Relief</Badge>
                }
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status');
                if (status == 'PENDING') {
                    return <Badge variant={'default'}>Pending</Badge>
                } else if (status === 'REJECTED') {
                    return <Badge variant={'destructive'}>Rejected</Badge>
                } else if (status === 'APPROVED') {
                    return <Badge variant={'success'}>Approved</Badge>
                }
            }
        },
        {
            accessorKey: 'reason',
            header: 'Reason',
            cell: ({ row }) => row.getValue('reason') || 'N/A',
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy'),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/auditor/funding-requests/${row.original.id}`}>
                        <Eye className="h-4 w-4" />
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={requests}
                filters={[
                    {
                        column: "requestType",
                        title: "Request Type",
                        options: [
                            { label: "Extra Funds", value: "EXTRA_FUNDS" },
                            { label: "Emergency Relief", value: "EMERGENCY_RELIEF" },
                        ],
                    },
                    {
                        column: "status",
                        title: "Status",
                        options: [
                            { label: "Pending", value: "PENDING" },
                            { label: "Confirmed", value: "CONFIRMED" },
                            { label: "Rejected", value: "REJECTED" },
                        ],
                    },
                ]}
                isLoading={isLoading}
                searchKey="reason"
            />
        </div>
    );
}