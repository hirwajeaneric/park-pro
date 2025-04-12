'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import BreadcrumbWithCustomSeparator, {
  BreadCrumLinkTypes,
} from '@/components/widget/BreadCrumComponent';
import { Computer, File, Trees, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getUsers, getParks, getUsersByRole } from '@/lib/api';
import { User, Park } from '@/types';
import Spinner from '@/components/widget/Spinner';
import ProtectedRoute from '@/lib/ProtectedRoute';

export default function DashboardPage() {
  const breadCrumLinks: BreadCrumLinkTypes[] = [
    {
      label: 'Overview',
      link: '',
      position: 'end',
    },
  ];

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Fetch parks
  const { data: parksData = { content: [] }, isLoading: parksLoading } =
    useQuery<{ content: Park[] }>({
      queryKey: ['parks'],
      queryFn: () => getParks(0, 100), // Fetch up to 100 parks
    });

  // Fetch auditors
  const { data: auditors = [], isLoading: auditorsLoading } = useQuery<User[]>({
    queryKey: ['users', 'AUDITOR'],
    queryFn: () => getUsersByRole('AUDITOR'),
  });

  // Derived stats
  const allUsersCount = users.length;
  const activeUsersCount = users.filter((user) => user.isActive).length;
  const parksCount = parksData.content.length;
  const parkUsersCount = users.filter((user) => user.parkId).length;
  const auditorsCount = auditors.length;

  return (
    <ProtectedRoute>
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
          <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
          <h1 className="mt-6 font-bold text-4xl">
            Welcome to ParkPro Admin Portal
          </h1>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            <Card className="bg-blue-100" aria-label="All users count">
              <CardHeader className="font-bold">All Users</CardHeader>
              <CardContent className="flex items-center justify-between w-full">
                <span className="font-bold text-3xl">
                  {usersLoading ? <Spinner /> : allUsersCount}
                </span>
                <span>
                  <Users className="text-green-500" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
            <Card className="bg-slate-100" aria-label="Active users count">
              <CardHeader className="font-bold">Active Users</CardHeader>
              <CardContent className="flex items-center justify-between w-full">
                <span className="font-bold text-3xl">
                  {usersLoading ? <Spinner /> : activeUsersCount}
                </span>
                <span>
                  <UserPlus className="text-green-500" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
            <Card className="bg-blue-100" aria-label="Parks count">
              <CardHeader className="font-bold">Parks</CardHeader>
              <CardContent className="flex items-center justify-between w-full">
                <span className="font-bold text-3xl">
                  {parksLoading ? <Spinner /> : parksCount}
                </span>
                <span>
                  <Trees className="text-green-500" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
            <Card className="bg-slate-100" aria-label="Park users count">
              <CardHeader className="font-bold">Park Users</CardHeader>
              <CardContent className="flex items-center justify-between w-full">
                <span className="font-bold text-3xl">
                  {usersLoading ? <Spinner /> : parkUsersCount}
                </span>
                <span>
                  <Computer className="text-green-500" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
            <Card className="bg-blue-100" aria-label="Auditors count">
              <CardHeader className="font-bold">Auditors</CardHeader>
              <CardContent className="flex items-center justify-between w-full">
                <span className="font-bold text-3xl">
                  {auditorsLoading ? <Spinner /> : auditorsCount}
                </span>
                <span>
                  <File className="text-green-500" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
          </div>
          <div className="mt-10">
            <Card className="w-full">
              <CardHeader>
                <h2 className="text-xl font-bold">
                  User and Park Management
                </h2>
                <p className="text-muted-foreground">
                  Manage access to key system users and parks. You can also assign
                  users to parks.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row justify-start items-center gap-5">
                <Link
                  href="/admin/users/new"
                  className="w-full sm:w-auto cursor-pointer bg-black text-white px-3 py-2 rounded-lg hover:bg-slate-700 text-center"
                >
                  Add New User
                </Link>
                <Link
                  href="/admin/parks/new"
                  className="w-full sm:w-auto cursor-pointer bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-600 text-center"
                >
                  Add New Park
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}