"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "../ui/phone-input";
import { countries } from "@/lib/countries";
import SkeletonCardTwo from "../widget/SkeletonCardTwo";

// Define gender options
const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
] as const;

// Enhanced form schema with proper validation
export const UserProfileFormSchema = z.object({
  id: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]),
  age: z.number().min(18, "You must be at least 18 years old").max(120, "Please enter a valid age"),
  passportNationalId: z.string().min(5, "ID must be at least 5 characters"),
  nationality: z.string().min(2, "Please select a valid country"),
});

export default function UserProfileForm() {
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof UserProfileFormSchema>>({
    resolver: zodResolver(UserProfileFormSchema),
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: undefined,
      age: 18,
      passportNationalId: "",
      nationality: ""
    },
  });
  
  // Reset form when user changes
  useEffect(() => {
    if (user) {
      const defaultValues = {
        id: user.id || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: (user.gender as z.infer<typeof UserProfileFormSchema>['gender']) || undefined,
        age: user.age || 18,
        passportNationalId: user.passportNationalId || "",
        nationality: user.nationality || ""
      };
      
      form.reset(defaultValues);
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: z.infer<typeof UserProfileFormSchema>) => updateProfile(data),
    onSuccess: async (data) => {
      localStorage.setItem("user-profile", JSON.stringify(data));
      toast.success("Profile updated successfully!");
      setTimeout(() => {
        router.push(`/account/profile`);
      }, 2000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
      setIsSubmitting(false);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  function onSubmit(data: z.infer<typeof UserProfileFormSchema>) {
    setIsSubmitting(true);
    updateProfileMutation.mutate(data);
  }

  if (authLoading) {
    return <SkeletonCardTwo />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        {/* Name Fields */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
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

          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder="Enter phone number"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={"Select your gender"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age */}
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="25"
                    min={18}
                    max={120}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Passport/National ID */}
          <FormField
            control={form.control}
            name="passportNationalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passport/National ID</FormLabel>
                <FormControl>
                  <Input placeholder="A12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nationality */}
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Submit Button */}
        <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
}