import { PageBanner } from "@/components/widget/PageBanner";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Calendar, CreditCard, File, UserIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "./utils";

type AccountNavMenuTypes = {
    label: string;
    icon: React.ReactNode;
    url: string;
}

const accountNavMenu: AccountNavMenuTypes[] = [
    {
        label: "Profile",
        icon: <UserIcon />,
        url: "/account/profile",
    },
    {
        label: "Booking History",
        icon: <Calendar />,
        url: "/account/bookings",
    },
    {
        label: "Donations",
        icon: <CreditCard />,
        url: "/account/donations",
    },
    {
        label: "Applications",
        icon: <File />,
        url: "/account/applications",
    }
];

type AccountProps = {
    children: ReactNode;
    title: string;
    subTitle: string;
    bannerPicture: string;
}

export default function UserAccountLayout({ children, title, subTitle, bannerPicture }: AccountProps) {
    return (
        <ProtectedRoute>
            <PageBanner title={title} backgroundImage={bannerPicture}/>
            <section className="pb-16 bg-white">
                <div className="container mx-auto px-4 w-full">
                    <div className="flex flex-col md:flex-row shadow-md">
                        <nav className="bg-slate-50 w-full flex flex-col md:w-64 p-6 gap-2">
                            {accountNavMenu.map((menu, index) =>
                            (<Link key={index} href={menu.url} className={cn(title === menu.label ? "bg-slate-300": "", "flex gap-2 items-center px-3 py-3 hover:bg-slate-200 rounded-md")}>
                                {menu.icon}
                                <span className="text-lg">{menu.label}</span>
                            </Link>))}
                        </nav>
                        <div className="flex flex-col flex-1 gap-3 p-6 md:p-8">
                            <h1 className="text-2xl font-bold">{subTitle}</h1>
                            <div className="flex flex-col">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </ProtectedRoute>
    )
}