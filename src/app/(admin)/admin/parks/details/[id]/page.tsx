// app/admin/parks/[id]/page.tsx
"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchParkById, updateParkData, removePark } from "@/store/slices/adminSlice";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BreadcrumbWithCustomSeparator, { BreadCrumLinkTypes } from "@/components/widget/BreadCrumComponent";
import { RootState } from "@/store";

export default function ParkDetailsPage({ params }: { params: { id: string } }) {
  const { accessToken } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const { selectedPark, loading } = useSelector((state: RootState) => state.admin);
  const [formData, setFormData] = useState({ name: "", location: "", description: "" });

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchParkById({ parkId: params.id, token: accessToken }));
    }
  }, [accessToken, dispatch, params.id]);

  useEffect(() => {
    if (selectedPark) {
      setFormData({
        name: selectedPark.name,
        location: selectedPark.location,
        description: selectedPark.description,
      });
    }
  }, [selectedPark]);

  const handleUpdate = () => {
    if (accessToken) {
      dispatch(updateParkData({ parkId: params.id, data: formData, token: accessToken }));
    }
  };

  const handleDelete = () => {
    if (accessToken) {
      dispatch(removePark({ parkId: params.id, token: accessToken }));
      router.push("/admin/parks");
    }
  };

  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: "Parks", link: "/admin/parks", position: "middle" },
    { label: selectedPark?.name || "Park", link: "", position: "end" },
  ];

  if (loading || !selectedPark) return <div>Loading...</div>;

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
        <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
        <h1 className="mt-6 font-bold text-3xl">Park Details</h1>
        <div className="mt-6 space-y-4">
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="space-x-2">
            <Button onClick={handleUpdate}>Update Park</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Park</Button>
          </div>
        </div>
      </div>
    </div>
  );
}