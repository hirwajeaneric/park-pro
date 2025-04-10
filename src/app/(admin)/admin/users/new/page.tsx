"use client";

import { useDispatch } from "react-redux";
import { useState } from "react";
import { addUser } from "@/store/slices/adminSlice";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BreadcrumbWithCustomSeparator, { BreadCrumLinkTypes } from "@/components/widget/BreadCrumComponent";

export default function AddNewUserPage() {
  const { accessToken } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "VISITOR",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken) {
      dispatch(addUser({ data: formData, token: accessToken }));
      router.push("/admin/users");
    }
  };

  const breadCrumLinks: BreadCrumLinkTypes[] = [
    {
      label: "Users",
      link: "/admin/users",
      position: "middle"
    },
    {
      label: "New",
      link: "",
      position: "end"
    }
  ];

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
        <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
        <h1 className="mt-6 font-bold text-3xl">Add New User</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <Input
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Button type="submit">Create User</Button>
        </form>
      </div>
    </div>
  );
}