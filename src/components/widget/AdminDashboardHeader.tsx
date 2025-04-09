import Link from "next/link";
import LogoComponent from "./LogoComponent";

export default function AdminDashboardHeader() {
    return (
        <header className="py-8 w-full bg-white">
            <div className="container mx-auto px-4 smd:px-8 md:px-16 lg:px-18">
                <div className="flex w-full">
                    <LogoComponent />
                </div>
                <nav className="flex bg-slate-200 py-2 px-7 rounded-sm gap-10 mt-5">
                    <Link className="" href={"/admin"}>Home</Link>
                    <Link href={"/admin/users"}>Users</Link>
                    <Link href={"/admin/users/new"}>Add User</Link>
                    <Link href={"/admin/profile"}>Profile</Link>
                </nav>
            </div>
        </header>
    )
}