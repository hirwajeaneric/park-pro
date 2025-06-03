import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import DashboardRequestPasswordReset from "@/components/forms/DashboardRequestPasswordReset";
import { Metadata } from "next";

export const dynamicParams = true;

export const metadata: Metadata = {
  title: 'Forgot / Reset password',
  description: 'Request for password reset',
};

type Props = {
  params: { user: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function page({ params }: Props) {
  const { user } = await params;
  let username = "";
  switch (user) {
    case "admin":
      username = "Admin";
      break;
    case "finance":
      username = "Finance Manager";
      break;
    case "manager":
      username = "Park Manager";
      break;
    case "government":
      username = "Government Officer";
      break;
    default:
      username = "Auditor"
      break;
  }

  return (
    <div className={"flex flex-col gap-6"}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-start">Request to Reset Password</CardTitle>
          <CardDescription className="text-start font-bold">
            {username}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardRequestPasswordReset user={user} />
        </CardContent>
      </Card>
    </div>
  )
}
