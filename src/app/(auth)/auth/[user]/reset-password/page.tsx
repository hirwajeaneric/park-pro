import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import DashboardResetPasswordForm from "@/components/forms/DashboardResetPasswordForm";
import { Metadata } from "next";

export const dynamicParams = true;

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Change your password',
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
    case "parkman":
      username = "Park Manager";
      break;
    case "gov":
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
          <CardTitle className="text-xl text-start">Change Password</CardTitle>
          <CardDescription className="text-start font-bold">
            {username}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardResetPasswordForm user={user} />
        </CardContent>
      </Card>
    </div>
  )
}
