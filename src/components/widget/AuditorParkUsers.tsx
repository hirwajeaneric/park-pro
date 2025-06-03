import { getUsersByPark } from '@/lib/api';
import { Badge } from '../ui/badge';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../ui/data-table';
import { User } from '@/types';
import ReportExport from '../reports/ReportExport';

export default function AuditorParkUsers({ parkId }: { parkId: string }) {

    // Fetch users
    const { data: users = [], isLoading: isUsersLoading } = useQuery<User[]>({
        queryKey: ['users', parkId],
        queryFn: () => getUsersByPark(parkId),
    });

    // DataTable columns for users
    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'firstName',
            header: 'First Name',
        },
        {
            accessorKey: 'lastName',
            header: 'Last Name',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => (
                <Badge variant={row.getValue('role') === 'ADMIN' ? 'success' : 'default'}>
                    {row.getValue('role')}
                </Badge>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <ReportExport
                title="Park Users Report"
                description="List of all users associated with this park"
                columns={[
                    { label: 'First Name', value: 'firstName' },
                    { label: 'Last Name', value: 'lastName' },
                    { label: 'Email', value: 'email' },
                    { label: 'Role', value: 'role' },
                ]}
                data={users}
                fileName="park-users-report"
            />
            <DataTable
                columns={columns}
                data={users}
                isLoading={isUsersLoading}
                searchKey="firstName"
            />
        </div>
    )
}