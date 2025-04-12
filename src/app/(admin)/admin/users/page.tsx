import { Metadata } from 'next';
import BreadcrumbWithCustomSeparator, {
  BreadCrumLinkTypes,
} from '@/components/widget/BreadCrumComponent';
import UsersTable from '@/components/tables/UsersTable';
import { getUsers } from '@/lib/api';
import { User } from '@/types';
import { cookies } from 'next/headers';
import ProtectedRoute from '@/lib/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Users - Admin Dashboard',
  description: 'Manage users in the system',
};

export default async function UsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access-token')?.value;

  let users: User[] = [];
  try {
    if (token) {
      users = await getUsers();
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }

  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: 'Users', link: '/admin/users', position: 'end' },
  ];

  return (
    <ProtectedRoute>
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
          <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
          <div className="flex justify-between items-center mt-6">
            <h1 className="font-bold text-3xl">Users</h1>
            <a
              href="/admin/users/new"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Add User
            </a>
          </div>
          <div className="mt-6">
            <UsersTable users={users} isLoading={false} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}