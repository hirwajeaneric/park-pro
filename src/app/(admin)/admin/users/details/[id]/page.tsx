"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchUserById, assignParkToUser, removeUser, fetchParks } from "@/store/slices/adminSlice";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import BreadcrumbWithCustomSeparator, { BreadCrumLinkTypes } from "@/components/widget/BreadCrumComponent";
import { RootState } from "@/store";
import { SelectContent, SelectItem } from "@radix-ui/react-select";

export default function UserPage({ params }: { params: { id: string } }) {
  const { accessToken } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const { selectedUser, parks, loading } = useSelector((state: RootState) => state.admin);
  const [parkId, setParkId] = useState("");

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchUserById({ userId: params.id, token: accessToken }));
      dispatch(fetchParks(accessToken));
    }
  }, [accessToken, dispatch, params.id]);

  const handleAssignPark = () => {
    if (parkId && accessToken) {
      dispatch(assignParkToUser({ userId: params.id, parkId, token: accessToken }));
    }
  };

  const handleDelete = () => {
    if (accessToken) {
      dispatch(removeUser({ userId: params.id, token: accessToken }));
      router.push("/admin/users");
    }
  };

  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: "Users", link: "/admin/users", position: "middle" },
    { label: selectedUser?.email || "User", link: "", position: "end" },
  ];

  if (loading || !selectedUser) return <div>Loading...</div>;

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
        <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
        <h1 className="mt-6 font-bold text-3xl">User Details</h1>
        <div className="mt-6 space-y-4">
          <div>
            <label>First Name:</label>
            <Input value={selectedUser.firstName} disabled />
          </div>
          <div>
            <label>Last Name:</label>
            <Input value={selectedUser.lastName} disabled />
          </div>
          <div>
            <label>Email:</label>
            <Input value={selectedUser.email} disabled />
          </div>
          <div>
            <label>Role:</label>
            <Input value={selectedUser.role} disabled />
          </div>
          <div>
            <label>Assign Park:</label>
            <Select value={parkId} onValueChange={setParkId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a park" />
              </SelectTrigger>
              <SelectContent>
                {parks.map(park => (
                  <SelectItem key={park.id} value={park.id}>{park.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssignPark} className="mt-2">Assign</Button>
          </div>
          <Button variant="destructive" onClick={handleDelete}>Delete User</Button>
        </div>
      </div>
    </div>
  );
}