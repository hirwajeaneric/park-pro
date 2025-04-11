/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/forms/UserDetailsForm.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchUserById, updateUser, deleteUser, assignParkToUser } from "@/store/slices/userSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const UserFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "VISITOR", "FINANCE_OFFICER", "PARK_MANAGER", "GOVERNMENT_OFFICER", "AUDITOR"]),
  parkId: z.string().nullable(),
  isActive: z.boolean(),
});

type UserFormValues = z.infer<typeof UserFormSchema>;

interface UserDetailsFormProps {
  userId: string;
}

export default function UserDetailsForm({ userId }: UserDetailsFormProps) {
  const { accessToken, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedUser, loading, error } = useSelector((state: RootState) => state.user);
  const parks = useSelector((state: RootState) => state.parks.parks); // Assuming parks are fetched elsewhere

  const form = useForm<UserFormValues>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "VISITOR",
      parkId: null,
      isActive: true,
    },
  });

  useEffect(() => {
    if (accessToken && !selectedUser) {
      dispatch(fetchUserById({ id: userId, token: accessToken }) as any);
    }
  }, [accessToken, userId, dispatch, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      form.reset({
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        role: selectedUser.role as "ADMIN" | "VISITOR" | "FINANCE_OFFICER" | "PARK_MANAGER" | "GOVERNMENT_OFFICER" | "AUDITOR",
        parkId: selectedUser.parkId,
        isActive: selectedUser.isActive,
      });
    }
  }, [selectedUser, form]);

  const onSubmit = (data: UserFormValues) => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }
    dispatch(
      updateUser({
        id: userId,
        data: { ...data, id: userId },
        token: accessToken,
      }) as any
    ).then((result: any) => {
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success("User updated successfully");
      }
    });
  };

  const handleDelete = () => {
    if (!accessToken) return;
    if (confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser({ id: userId, token: accessToken }) as any).then((result: any) => {
        if (result.error) {
          toast.error(result.error.message);
        } else {
          toast.success("User deleted successfully");
          router.push("/admin/users");
        }
      });
    }
  };

  const handleParkAssignment = (parkId: string) => {
    if (!accessToken) return;
    dispatch(assignParkToUser({ userId, parkId, token: accessToken }) as any).then((result: any) => {
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success("Park assigned successfully");
      }
    });
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-1/4" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="VISITOR">Visitor</SelectItem>
                    <SelectItem value="FINANCE_OFFICER">Finance Officer</SelectItem>
                    <SelectItem value="PARK_MANAGER">Park Manager</SelectItem>
                    <SelectItem value="GOVERNMENT_OFFICER">Government Officer</SelectItem>
                    <SelectItem value="AUDITOR">Auditor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "true")}
                  defaultValue={field.value ? "true" : "false"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update User"}
          </Button>
        </form>
      </Form>

      {/* Park Assignment */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Assign Park</h3>
        <Select onValueChange={handleParkAssignment} value={form.getValues("parkId") || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select a park" />
          </SelectTrigger>
          <SelectContent>
            {parks.map((park) => (
              <SelectItem key={park.id} value={park.id}>
                {park.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Delete Button */}
      <Button variant="destructive" onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting..." : "Delete User"}
      </Button>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}