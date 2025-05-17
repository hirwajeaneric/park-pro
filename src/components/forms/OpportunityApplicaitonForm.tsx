/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createOpportunityApplication } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";
import { FileUpload } from "@/components/ui/file-upload";

const ApplicationFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  applicationLetterUrl: z.string().min(10, "Application letter must be at least 10 characters"),
});

export default function ApplicationForm({ opportunity }: { opportunity: any }) {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof ApplicationFormSchema>>({
    resolver: zodResolver(ApplicationFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      applicationLetterUrl: "",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: (data: z.infer<typeof ApplicationFormSchema>) => 
      createOpportunityApplication({
        opportunityId: opportunity.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        applicationLetterUrl: data.applicationLetterUrl,
      }),
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  function onSubmit(data: z.infer<typeof ApplicationFormSchema>) {
    applicationMutation.mutate(data);
  }

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Apply for: {opportunity.title}</h2>
          <p className="text-gray-600">{opportunity.description}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
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
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicationLetterUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter and CV</FormLabel>
                  <FormControl>
                    <FileUpload
                      endpoint="resumeUpload"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={applicationMutation.isPending}
                className="w-full"
              >
                {applicationMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
              <Link href={`/opportunities/${opportunity.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}