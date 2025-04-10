// page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BreadcrumbWithCustomSeparator, { BreadCrumLinkTypes } from "@/components/widget/BreadCrumComponent";
import { Computer, File, Trees, UserPlus, Users } from "lucide-react";
import Link from "next/link";

export default function page() {
  const breadCrumLinks: BreadCrumLinkTypes[] = [
    // {
    //   label: "Admins",
    //   link: "/users",
    //   position: "middle"
    // },
    {
      label: "Overview",
      link: "",
      position: "end"
    }
  ];

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
        <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
        <h1 className="mt-6 font-bold text-4xl">Welcome to ParkPro Admin Portal</h1>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          <Card className="bg-blue-100">
            <CardHeader className="font-bold">
              All Users
            </CardHeader>
            <CardContent className="flex items-center justify-between w-full">
              <span className="font-bold text-3xl">20</span>
              <span><Users className="text-green-500" /></span>
            </CardContent>
          </Card>
          <Card className="bg-slate-100">
            <CardHeader className="font-bold">
              Active Users
            </CardHeader>
            <CardContent className="flex items-center justify-between w-full">
              <span className="font-bold text-3xl">20</span>
              <span><UserPlus className="text-green-500" /></span>
            </CardContent>
          </Card>
          <Card className="bg-blue-100">
            <CardHeader className="font-bold">
              Parks
            </CardHeader>
            <CardContent className="flex items-center justify-between w-full">
              <span className="font-bold text-3xl">20</span>
              <span><Trees className="text-green-500" /></span>
            </CardContent>
          </Card>
          <Card className="bg-slate-100">
            <CardHeader className="font-bold">
              Park Users
            </CardHeader>
            <CardContent className="flex items-center justify-between w-full">
              <span className="font-bold text-3xl">20</span>
              <span><Computer className="text-green-500" /></span>
            </CardContent>
          </Card>
          <Card className="bg-blue-100">
            <CardHeader className="font-bold">
              Auditors
            </CardHeader>
            <CardContent className="flex items-center justify-between w-full">
              <span className="font-bold text-3xl">20</span>
              <span><File className="text-green-500" /></span>
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center mt-10 justify-between gap-5">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">User and Park Management</CardTitle>
              <CardDescription>Manage access to key system users and parks. You can also assign users to parks.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-start items-center gap-5">
              <Link href='/admin/users/new' className="cursor-pointer bg-black text-white px-3 py-2 rounded-lg hover:bg-slate-700">Add New User</Link>
              <Link href='/admin/parks/new' className="cursor-pointer bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-600">Add New Park</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}