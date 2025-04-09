"use client"

import ProtectedRoute from "@/lib/ProtectedRoute";
import UserAccountLayout from "@/lib/UserAccountLayout";
import { useAuth } from "@/hooks/useAuth";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { getUserApplications } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";

type Application = {
  id: string;
  opportunityId: string;
  firstName: string;
  lastName: string;
  email: string;
  applicationLetterUrl: string;
  status: "SUBMITTED" | "REVIEWED" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
};

export default function ApplicationsPage() {
  const { accessToken } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: applications, isLoading } = useQuery({
    queryKey: ["userApplications"],
    queryFn: () => getUserApplications(accessToken as string),
  });

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "createdAt",
      header: "Applied On",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as "APPROVED" | "REJECTED" | "REVIEWED";
        return (
          <Badge
            variant={
              status === "APPROVED"
                ? "default"
                : status === "REJECTED"
                ? "destructive"
                : status === "REVIEWED"
                ? "secondary"
                : "outline"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "firstName",
      header: "Name",
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.getValue("email"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedApplication(row.original);
              setIsDialogOpen(true);
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Application ID</p>
                  <p>{selectedApplication.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applicant Name</p>
                  <p>
                    {selectedApplication.firstName} {selectedApplication.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedApplication.status === "APPROVED"
                        ? "default"
                        : selectedApplication.status === "REJECTED"
                        ? "destructive"
                        : selectedApplication.status === "REVIEWED"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {selectedApplication.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applied On</p>
                  <p>
                    {format(new Date(selectedApplication.createdAt), "PPP p")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Application Letter</p>
                  <Button variant="link" asChild>
                    <Link
                      href={selectedApplication.applicationLetterUrl}
                      target="_blank"
                    >
                      View Application Letter
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </UserAccountLayout>
    </ProtectedRoute>
  );
}