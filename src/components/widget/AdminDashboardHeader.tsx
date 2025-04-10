"use client";

import Link from "next/link";
import LogoComponent from "./LogoComponent";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function AdminDashboardHeader() {
  const pathname = usePathname();

  // Define nav items as an array for better maintainability
  const navItems = [
    { href: "/admin", label: "Home" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/users/new", label: "Add User" },
    { href: "/admin/parks", label: "Parks" },
    { href: "/admin/profile", label: "Profile" },
  ];

  return (
    <header className="py-8 w-full bg-white">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
        <div className="flex w-full">
          <LogoComponent />
        </div>
        <nav className="flex bg-slate-200 shadow-sm py-2 px-7 rounded-sm gap-10 mt-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-gray-700",
                pathname === item.href ? "font-bold" : "font-normal"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}