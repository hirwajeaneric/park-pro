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
import { RequestNewVerificationCodeTypes, VerifyTokenFormTypes } from "@/types"
import { getNewVerificationCode, verifyToken } from "@/lib/api"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"

const FormSchema = z.object({
    email: z.string().email().min(2, { message: "Please provide a valid Email" }),
    code: z.string().min(6, { message: "Password must be at least 8 characters long." })
})

export default function VerifyAccountForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);

    const form = useForm<VerifyTokenFormTypes>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: searchParams.get("user")?.toString(),
            code: ""
        }
    });

    const verifyAccountMutation = useMutation({
        mutationFn: (data: VerifyTokenFormTypes) => verifyToken(data),
        onSuccess: async () => {
            form.reset();
            toast.success("Account verified! Continue to login.");
            setTimeout(() => {
                router.push("/auth/signin");
            }, 2000)
        },
        onError: (error: Error) => {
            toast.error(error.message || "Login failed");
        },
        onSettled: () => {
            setIsLoading(false);
        }
    });

    const requestNewCodeMutation = useMutation({
        mutationFn: (data: RequestNewVerificationCodeTypes) => getNewVerificationCode(data),
        onSuccess: async () => {
            toast.success("New verification code sent to your email.");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to send you a new verification code. Try again later.")
        },
        onSettled: () => {
            setIsLoading2(false);
        }
    });

    function onSubmit(data: VerifyTokenFormTypes) {
        setIsLoading(true);
        verifyAccountMutation.mutate(data);
    }

    function requestNewVerificationCode() {
        setIsLoading2(true);
        const userEmail = form.getValues("email");
        requestNewCodeMutation.mutate({ email: userEmail });
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-2/3 lg:w-1/3 space-y-6">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Verification Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="Verification code" {...field} />
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
                        {isLoading ? "Verifying" : "Verify"}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Go to ?{' '}
                        <Link
                            href={`/auth/signin`}
                            className="font-medium text-primary hover:underline"
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </Form>
            <Button 
                type="button"
                variant={'outline'} 
                className="mt-5 cursor-pointer"
                onClick={requestNewVerificationCode}
            >
                {isLoading2 ? "Sending request..." : "Get new verification code"}
            </Button>
        </>
    )
}