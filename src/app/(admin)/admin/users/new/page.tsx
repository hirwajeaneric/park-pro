import { Metadata } from 'next';
import BreadcrumbWithCustomSeparator, {
  BreadCrumLinkTypes,
} from '@/components/widget/BreadCrumComponent';
import UserForm from '@/components/forms/UserForm';
import ProtectedRoute from '@/lib/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Add User - Admin Dashboard',
  description: 'Create a new user in the system',
};

export default function AddUserPage() {
  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: 'Users', link: '/admin/users', position: 'middle' },
    { label: 'Add User', link: '', position: 'end' },
  ];

  return (
    <ProtectedRoute>
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
          <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
          <h1 className="mt-6 font-bold text-3xl">Add User</h1>
          <div className="mt-6 max-w-2xl">
            <UserForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}