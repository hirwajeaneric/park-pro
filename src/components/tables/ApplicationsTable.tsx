'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { OpportunityApplicationResponse } from '@/types';
import { getApplicationsByPark } from '@/lib/api';

export default function ApplicationsTable() {

    const { data: applications = [], isLoading } = useQuery({
        queryKey: ['applications', JSON.parse(localStorage.getItem('park-data') as string).id],
        queryFn: () => getApplicationsByPark(JSON.parse(localStorage.getItem('park-data') as string).id),
        retry: false,
    });

    // DataTable columns
    const columns: ColumnDef<OpportunityApplicationResponse>[] = [
        {
            id: 'applicantName',
            header: 'Applicant Name',
            cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
        },
        {
            accessorKey: 'opportunityId',
            header: 'Opportunity ID',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.getValue('status') === 'ACCEPTED' ? 'success' :
                            row.getValue('status') === 'REJECTED' ? 'destructive' :
                                row.getValue('status') === 'REVIEWED' ? 'warning' : 'default'
                    }
                >
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
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/finance/applications/${row.original.id}`}>
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
                data={applications}
                isLoading={isLoading}
                searchKey="applicantName"
            />
        </div>
    );
};