"use client";

import { useGetParkByIdQuery, useUpdateParkMutation, useDeleteParkMutation } from "@/store/api/parksApi";
import { Park } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ParkDetails({ parkId }: { parkId: string }) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { data: park, isLoading, refetch } = useGetParkByIdQuery(parkId);
  const [updatePark] = useUpdateParkMutation();
  const [deletePark] = useDeleteParkMutation();

  const handleDeletePark = async () => {
    try {
      await deletePark(parkId).unwrap();
      toast.success("Park deleted successfully");
      router.push("/admin/parks");
    } catch (error) {
      toast.error("Failed to delete park");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!park) return <div>Park not found</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Park Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg">{park.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-lg">{park.location}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-lg">{park.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-lg">{format(new Date(park.createdAt), "PPpp")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="text-lg">{format(new Date(park.updatedAt), "PPpp")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {userProfile?.role === "ADMIN" && (
        <div className="flex space-x-4">
          <Button onClick={() => router.push(`/admin/parks/${parkId}/edit`)}>
            Edit Park
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                Delete Park
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the park.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive" onClick={handleDeletePark}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}