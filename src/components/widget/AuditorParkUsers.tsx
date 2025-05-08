import { getUsersByPark } from '@/lib/api';
import { Badge } from '../ui/badge';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../ui/data-table';
import { User } from '@/types';

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
        <DataTable
            columns={columns}
            data={users}
            isLoading={isUsersLoading}
            searchKey="firstName"
        />
    )
}