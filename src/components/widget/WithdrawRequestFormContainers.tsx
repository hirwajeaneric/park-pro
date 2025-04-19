"use client";

import { useAuth } from "@/hooks/useAuth";
import { WithdrawRequest } from "@/types";
import UpdateWithdrawRequestForm from "../forms/UpdateWithdrawRequestDetailsForm";
import ManageWithdrawRequestForm from "../forms/ManageWithdrawRequestForm";

export default function WithdrawRequestFormContainers({ request }: { request: WithdrawRequest }) {
    const { user } = useAuth();
    if (user?.role === "PARK_MANAGER") {
        return <UpdateWithdrawRequestForm request={request} />
    } else if (user?.role === "FINANCE_OFFICER") {
        return <ManageWithdrawRequestForm request={request} />
    } else {
        return <div>Unauthorized: You do not have permission to manage this request.</div>
    }
}