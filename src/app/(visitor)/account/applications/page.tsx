"use client"

import ProtectedRoute from "@/lib/ProtectedRoute";
import UserAccountLayout from "@/lib/UserAccountLayout";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import { getMyOpportunityApplications } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { OpportunityApplicationResponse } from "@/types";
import { useRouter } from "next/navigation";

export default function ApplicationsPage() {
  const router = useRouter();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["userApplications"],
    queryFn: () => getMyOpportunityApplications(),
  });

  const columns: ColumnDef<OpportunityApplicationResponse>[] = [
    {
      accessorKey: "createdAt",
      header: "Applied On",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        let badgeColor: 'success' | 'destructive' | 'warning' | 'default' | 'secondary' | 'outline' | null | undefined = "default";
        const status = row.getValue("status") as "ACCEPTED" | "REJECTED" | "REVIEWED" | "SUBMITTED";
        switch (status) {
          case "ACCEPTED":
            badgeColor = 'success';
            break;
          case "REJECTED":
            badgeColor = 'destructive';
            break;
          case "REVIEWED":
            badgeColor = 'warning';
            break;
          case "SUBMITTED":
            badgeColor = 'default';
            break;
          default: 
            badgeColor = 'default'
        }
        return (
          <Badge
            variant={badgeColor}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "opportunityName",
      header: "Opportunity",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => {
              router.push(`/account/applications/${row.original.id}`)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={row.original.applicationLetterUrl} target="_blank">
              <FileText className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <UserAccountLayout
        title="Applications"
        subTitle="Your Opportunity Applications"
        bannerPicture="/TVR7E3Kuzg2iRhKkjZPeWk-1200-80.jpg.webp"
      >
        <DataTable
          columns={columns}
          data={applications || []}
          isLoading={isLoading}
          searchKey="email"
          filters={[
            {
              column: "status",
              title: "Status",
              options: [
                { label: "Submitted", value: "SUBMITTED" },
                { label: "Reviewed", value: "REVIEWED" },
                { label: "Approved", value: "APPROVED" },
                { label: "Rejected", value: "REJECTED" },
              ],
            },
          ]}
        />
      </UserAccountLayout>
    </ProtectedRoute>
  );
}