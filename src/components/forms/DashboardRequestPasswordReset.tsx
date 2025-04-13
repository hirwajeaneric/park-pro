"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ForgotPasswordFormTypes } from "@/types"
import { requestPasswordReset } from "@/lib/api"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

const FormSchema = z.object({
    email: z.string().email().min(2, { message: "Please provide a valid Email" })
})

export default function DashboardRequestPasswordReset({ user }: { user: string }) {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Get redirect URL from query params or default to home
    const redirectUrl = searchParams.get('redirect') || `/auth/${user}`;

    const form = useForm<ForgotPasswordFormTypes>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: ""
        }
    });

    const requestPasswordResetMutation = useMutation({
        mutationFn: (data: ForgotPasswordFormTypes) => requestPasswordReset(data),
        onSuccess: async () => {
            form.reset();
            toast.success("Request sent!");
            setTimeout(() => {
                router.push(redirectUrl);
            }, 3000);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Request failed");
        },
        onSettled: () => {
            setIsLoading(false);
        }
    });

    function onSubmit(data: ForgotPasswordFormTypes) {
        setIsLoading(true);
        requestPasswordResetMutation.mutate(data);
    }

    return (
        <Form {...form}>
            <p className="text-sm leading-tight mb-3 text-slate-500">Provide your email so as to recieve an email with a password reset link.</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Your email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "Sending request ..." : "Send Request"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href={`/auth/${user}`}
                        className="font-medium text-primary hover:underline"
                    >
                        Go back to Login
                    </Link>
                </p>
            </form>
        </Form>
    )
}