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
import { signIn } from "@/lib/api"

const FormSchema = z.object({
    email: z.string().email().min(2, { message: "Please provide a valid Email" }),
    password: z.string().min(6, { message: "Password must be at least 8 characters long." })
})

export default function SignInForm() {
    const { handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(FormSchema),
    });
    
    const form = useForm<SignInFormTypes>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    async function onSubmit(data: SignInFormTypes) {
        try {
            // signIn(data)
            // .then(response => {
            //     toast.success("Login Successful!");
            //     localStorage.setItem("AccessToken", response.data);
            // })
            // .catch()

        } catch (error) {
            console.log(error);
            toast.error("Error Loging In ");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full md:w-2/3 lg:w-1/3 space-y-6">
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
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input placeholder="Your password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Login</Button>
                <p>You do not have an account? <Link href={"/auth/signup"} className="text-blue-600">Create Account</Link></p>
            </form>
        </Form>
    )
}
