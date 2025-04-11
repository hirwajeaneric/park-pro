"use client";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function UserDetails({ userId }: { userId: string }) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { data: user, isLoading, refetch } = useGetUserByIdQuery(userId);
  const { data: parks } = useGetParksQuery({});
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [assignUserToPark] = useAssignUserToParkMutation();
  const [selectedPark, setSelectedPark] = useState("");

  const handleAssignToPark = async () => {
    try {
      await assignUserToPark({ userId, parkId: selectedPark }).unwrap();
      toast.success("User assigned to park successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to assign user to park");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(userId).unwrap();
      toast.success("User deleted successfully");
      router.push("/admin/users");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-lg">{`${user.firstName} ${user.lastName}`}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                {user.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge variant={user.active ? "default" : "destructive"}>
                {user.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Assigned Park</p>
              <p className="text-lg">{user.parkId || "Not assigned"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Login</p>
              <p className="text-lg">
                {user.lastLogin ? format(new Date(user.lastLogin), "PPpp") : "Never logged in"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {userProfile?.role === "ADMIN" && (
        <div className="flex space-x-4">
          <Button onClick={() => router.push(`/admin/users/${userId}/edit`)}>
            Edit User
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                Assign to Park
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign User to Park</DialogTitle>
                <DialogDescription>
                  Select a park to assign this user to
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="park" className="text-right">
                    Park
                  </Label>
                  <Select onValueChange={setSelectedPark}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a park" />
                    </SelectTrigger>
                    <SelectContent>
                      {parks?.content?.map((park) => (
                        <SelectItem key={park.id} value={park.id}>
                          {park.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  onClick={handleAssignToPark}
                  disabled={!selectedPark}
                >
                  Assign
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                Delete User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the user account.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteUser}>
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