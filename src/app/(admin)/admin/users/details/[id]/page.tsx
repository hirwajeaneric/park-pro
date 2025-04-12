/* eslint-disable @typescript-eslint/no-unused-vars */
import { Metadata } from 'next';
import BreadcrumbWithCustomSeparator, {
  BreadCrumLinkTypes,
} from '@/components/widget/BreadCrumComponent';
import UserUpdateForm from '@/components/forms/UserUpdateForm';
import { getUserById } from '@/lib/api';
import { User } from '@/types';
import { cookies } from 'next/headers';
import ProtectedRoute from '@/lib/ProtectedRoute';

export const dynamicParams = true;

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('access-token')?.value;
  let user: User;
  try {
    user = await getUserById(id);
  } catch (error) {
    return {
      title: 'User Not Found',
      description: 'User details not available',
    };
  }
  return {
    title: `${user.firstName} ${user.lastName} - User Management`,
    description: `Manage user ${user.email}`,
  };
}

export default async function UserPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('access-token')?.value;
  let user: User;
  try {
    user = await getUserById(id);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
            <h1 className="mt-6 font-bold text-3xl">User Not Found</h1>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: 'Users', link: '/admin/users', position: 'middle' },
    {
      label: `${user.firstName} ${user.lastName}`,
      link: '',
      position: 'end',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
          <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
          <h1 className="mt-6 font-bold text-3xl">User Details</h1>
          <div className="mt-6 max-w-2xl">
            <UserUpdateForm user={user} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}