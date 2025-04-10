// page.tsx
"use client";

import BreadcrumbWithCustomSeparator, { BreadCrumLinkTypes } from "@/components/widget/BreadCrumComponent";

export default function page() {
  const breadCrumLinks: BreadCrumLinkTypes[] = [
    // {
    //   label: "Admins",
    //   link: "/users",
    //   position: "middle"
    // },
    {
      label: "Parks",
      link: "",
      position: "end"
    }
  ];

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
        <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
        <h1 className="mt-6 font-bold text-3xl">Parks</h1>
        
      </div>
    </div>
  );
}