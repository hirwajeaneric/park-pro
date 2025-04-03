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
import { ChangePasswordFormTypes } from "@/types"
import { useMutation } from "@tanstack/react-query"
import { changePassword } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"

const FormSchema = z.object({
  newPassword: z.string().min(6, { message: "Password must be at least 8 characters long." })
})

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const resetToken = searchParams.get("token")?.toString();

  const form = useForm<ChangePasswordFormTypes>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      newPassword: "",
      token: resetToken
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordFormTypes) => changePassword(data),
    onSuccess: async () => {
      form.reset();
      toast.success("Password Changed");
      setTimeout(() => {
        router.push(`/auth/signin`);
      }, 3000);
    }
  });

  function onSubmit(data: ChangePasswordFormTypes) {
    setIsLoading(true);
    data.token = resetToken;
    resetPasswordMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-2/3 lg:w-1/3 space-y-6">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between items-center">
                <span>New Password</span>
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
          {isLoading ? "Sending request..." : "Confirm new password"}
        </Button>
        <p>Already have an account? <Link href={"/auth/signin"} className="text-blue-600">Login</Link></p>
      </form>
    </Form>
  )
}
