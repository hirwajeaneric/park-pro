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
import { useState } from "react";
import { storage } from "@/configs/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Loader2, Upload } from "lucide-react";

const ApplicationFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  applicationLetterUrl: z.string().min(1, "Application letter is required").url("Must be a valid URL"),
});

export default function ApplicationForm({ opportunity }: { opportunity: any }) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof ApplicationFormSchema>>({
    resolver: zodResolver(ApplicationFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      applicationLetterUrl: "",
    },
  });

  const uploadFile = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `applications/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        reject,
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF or DOC/DOCX)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileUrl = await uploadFile(file);
      form.setValue('applicationLetterUrl', fileUrl, { shouldValidate: true });
      toast.success("File uploaded successfully");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

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
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="hidden"
                          id="application-file-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploading}
                          onClick={() => document.getElementById('application-file-upload')?.click()}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Document
                            </>
                          )}
                        </Button>
                      </div>
                      {field.value && (
                        <div className="mt-2">
                          <a 
                            href={field.value} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View uploaded document
                          </a>
                        </div>
                      )}
                    </div>
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