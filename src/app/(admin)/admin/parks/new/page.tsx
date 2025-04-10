"use client";

import { useDispatch } from "react-redux";
import { useState } from "react";
import { addPark } from "@/store/slices/adminSlice";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BreadcrumbWithCustomSeparator, { BreadCrumLinkTypes } from "@/components/widget/BreadCrumComponent";

export default function AddParkPage() {
  const { accessToken } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken) {
      dispatch(addPark({ data: formData, token: accessToken }));
      router.push("/admin/parks");
    }
  };

  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: "Parks", link: "/admin/parks", position: "middle" },
    { label: "Add Park", link: "", position: "end" },
  ];

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
        <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
        <h1 className="mt-6 font-bold text-3xl">Add New Park</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Button type="submit">Create Park</Button>
        </form>
      </div>
    </div>
  );
}