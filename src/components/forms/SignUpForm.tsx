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
import { useState } from "react"
import { SignUpFormTypes } from "@/types"
import { useMutation } from "@tanstack/react-query"
import { signUp } from "@/lib/api"
import { useRouter } from "next/navigation"

const FormSchema = z.object({
  firstName: z.string().min(3, "First name is too short"),
  lastName: z.string().min(3, "Last name is too short"),
  email: z.string().email().min(2, { message: "Please provide a valid Email" }),
  password: z.string().min(6, { message: "Password must be at least 8 characters long." })
})

export default function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const form = useForm<SignUpFormTypes>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    },
  });

  const signUpMutation = useMutation({
    mutationFn: (data: SignUpFormTypes) => signUp(data),
    onSuccess: async () => {
      form.reset();
      toast.success("Account created successfully! Please verify your email and confirm your account to continue.");
      setTimeout(() => {
        router.push(`/auth/verify/?user=${userEmail}`);
      }, 3000);
    }
  });

  function onSubmit(data: SignUpFormTypes) {
    setIsLoading(true);
    setUserEmail(data.email);
    signUpMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-2/3 lg:w-1/3 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:gap-2 space-y-6 md:space-y-0">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Creating your account..." : "Create account"}
        </Button>
        <p>Already have an account? <Link href={"/auth/signin"} className="text-blue-600">Login</Link></p>
      </form>
    </Form>
  )
}
