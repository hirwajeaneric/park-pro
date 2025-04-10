"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchUsers } from "@/store/slices/adminSlice";
import { useAuth } from "@/hooks/useAuth";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import BreadcrumbWithCustomSeparator, { BreadCrumLinkTypes } from "@/components/widget/BreadCrumComponent";
import { RootState } from "@/store";

export default function UsersPage() {
  const { accessToken } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const { users, loading } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchUsers(accessToken));
    }
  }, [accessToken, dispatch]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "lastName", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "parkId", header: "Park ID" },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/users/details/${row.original.id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const breadCrumLinks: BreadCrumLinkTypes[] = [{ label: "Users", link: "/admin/users", position: "end" }];

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
        <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
        <h1 className="mt-6 font-bold text-3xl">Users</h1>
        <DataTable
          columns={columns}
          data={users}
          isLoading={loading}
          searchKey="email"
          filters={[
            {
              column: "role",
              title: "Role",
              options: [
                { label: "Admin", value: "ADMIN" },
                { label: "Visitor", value: "VISITOR" },
                { label: "Finance Officer", value: "FINANCE_OFFICER" },
                { label: "Park Manager", value: "PARK MANAGER" },
                { label: "Auditor", value: "AUDITOR" },
                { label: "Government Officer", value: "GOVERNMENT_OFFICER" },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}