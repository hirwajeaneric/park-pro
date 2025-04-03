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
import Link from "next/link"
import { ForgotPasswordFormTypes } from "@/types"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/lib/api"

const FormSchema = z.object({
    email: z.string().email().min(2, { message: "Please provide a valid Email" }),
})

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ForgotPasswordFormTypes>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
        }
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: (data: ForgotPasswordFormTypes) => requestPasswordReset(data),
        onSuccess: async () => {
            form.reset();
            toast.success("Request sent!")
            setTimeout(() => {
                router.push(`/auth/signin`);
            }, 3000);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Login failed");
        },
        onSettled: () => {
            setIsLoading(false);
        }
    });

    function onSubmit(data: ForgotPasswordFormTypes) {
        setIsLoading(true);
        forgotPasswordMutation.mutate(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-2/3 lg:w-1/3 space-y-6">
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
                        href={`/auth/signin`}
                        className="font-medium text-primary hover:underline"
                    >
                        Go back to Login
                    </Link>
                </p>
            </form>
        </Form>
    )
}