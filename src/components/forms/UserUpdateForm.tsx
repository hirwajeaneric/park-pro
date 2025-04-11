/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignUserToPark, updateUser } from '@/lib/api';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UpdateUserForm, Park, User } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { getParks } from '@/lib/api';

interface UserUpdateFormProps {
  user: User;
}

export const UserUpdateFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['VISITOR', 'ADMIN', 'FINANCE_OFFICER', 'PARK_MANAGER', 'GOVERNMENT_OFFICER', 'AUDITOR']),
  parkId: z.string().nullable().optional(),
});

export default function UserUpdateForm({ user }: UserUpdateFormProps) {
  const queryClient = useQueryClient();

  const { data: parks } = useQuery({
    queryKey: ['parks'],
    queryFn: () => getParks(0, 100),
    select: (data) => data.content,
  });

  const form = useForm<UpdateUserForm>({
    resolver: zodResolver(UserUpdateFormSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      parkId: user.parkId,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserForm) =>
      updateUser(data, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const assignParkMutation = useMutation({
    mutationFn: (parkId: string) => assignUserToPark(user.id, parkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Park assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign park');
    },
  });

  const onSubmit = (data: UpdateUserForm) => {
    updateMutation.mutate(data);
    if (data.parkId && data.parkId !== user.parkId) {
      assignParkMutation.mutate(data.parkId);
    }
  };

  return (
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
                <Input type="email" {...field} />
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
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VISITOR">Visitor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="FINANCE_OFFICER">Finance Officer</SelectItem>
                    <SelectItem value="PARK_MANAGER">Park Manager</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parkId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Park</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select park" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">No Park</SelectItem>
                    {parks?.map((park: Park) => (
                      <SelectItem key={park.id} value={park.id}>
                        {park.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={updateMutation.isPending || assignParkMutation.isPending}
        >
          {updateMutation.isPending || assignParkMutation.isPending
            ? 'Updating...'
            : 'Update User'}
        </Button>
      </form>
    </Form>
  );
}