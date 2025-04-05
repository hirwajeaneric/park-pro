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
import { SignInFormTypes } from "@/types"
import { getProfileData, signIn } from "@/lib/api"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useDispatch } from "react-redux"
import { setUser } from "@/store/slices/userSlice"

const FormSchema = z.object({
    email: z.string().email().min(2, { message: "Please provide a valid Email" }),
    password: z.string().min(6, { message: "Password must be at least 8 characters long." })
})

export default function SignInForm() {
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Get redirect URL from query params or default to home
    const redirectUrl = searchParams.get('redirect') || '/';

    const form = useForm<SignInFormTypes>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const loginMutation = useMutation({
        mutationFn: (data: SignInFormTypes) => signIn(data),
        onSuccess: async (token) => {
            localStorage.setItem("access-token", token);
            form.reset();
            const profile = await getProfileData(token);
            localStorage.setItem("user-profile", JSON.stringify(profile));
            dispatch(setUser(profile));
            window.location.replace(redirectUrl);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Login failed");
        },
        onSettled: () => {
            setIsLoading(false);
        }
    });

    function onSubmit(data: SignInFormTypes) {
        setIsLoading(true);
        loginMutation.mutate(data);
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
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex justify-between items-center">
                                <span>Password</span>
                                <button
                                    type="button"
                                    className="cursor-pointer text-sm text-muted-foreground hover:text-primary"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                >
                                    {isPasswordVisible ? "Hide" : "Show"} Password
                                </button>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type={isPasswordVisible ? "text" : "password"}
                                    placeholder="Your password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            <div className="flex w-full justify-end">
                                <span className="text-sm">
                                    Forgot Password?&nbsp; 
                                    <Link href={"/auth/forgot-password"} className="underline">Click Here.</Link>
                                </span>
                            </div>
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                    You do not have an account?{' '}
                    <Link
                        href={`/auth/signup${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                        className="font-medium text-primary hover:underline"
                    >
                        Create Account
                    </Link>
                </p>
            </form>
        </Form>
    )
}