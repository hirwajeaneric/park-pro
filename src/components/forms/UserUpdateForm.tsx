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
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';

export const UserUpdateFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  role: z.enum([
    'VISITOR',
    'ADMIN',
    'FINANCE_OFFICER',
    'PARK_MANAGER',
    'GOVERNMENT_OFFICER',
    'AUDITOR',
  ]),
  parkId: z.string().nullable().optional(),
  isActive: z.boolean(),
});

interface UserUpdateFormProps {
  user: User;
}

export default function UserUpdateForm({ user }: UserUpdateFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: parks = [], isLoading: parksLoading } = useQuery<Park[]>({
    queryKey: ['parks'],
    queryFn: () => getParks(0, 100).then((data) => data.content),
  });

  const form = useForm<UpdateUserForm>({
    resolver: zodResolver(UserUpdateFormSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      parkId: user.parkId,
      isActive: user.isActive,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserForm) => updateUser(data, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      router.replace('/admin/users');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const assignParkMutation = useMutation({
    mutationFn: (parkId: string | null) => assignUserToPark(user.id, parkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Park assignment updated successfully');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update park assignment');
    },
  });

  const onSubmit = (data: UpdateUserForm) => {
    updateMutation.mutate(data);
    if (data.parkId !== user.parkId) {
      // @ts-expect-error Suppress type error for parkId possibly being undefined
      assignParkMutation.mutate(data.parkId);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  First Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter first name"
                    {...field}
                    aria-required="true"
                  />
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
                <FormLabel className="text-sm font-medium">
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter last name"
                    {...field}
                    aria-required="true"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    {...field}
                    aria-required="true"
                  />
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
                <FormLabel className="text-sm font-medium">Role</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    aria-label="Select role"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VISITOR">Visitor</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="FINANCE_OFFICER">
                        Finance Officer
                      </SelectItem>
                      <SelectItem value="PARK_MANAGER">Park Manager</SelectItem>
                      <SelectItem value="GOVERNMENT_OFFICER">
                        Government Officer
                      </SelectItem>
                      <SelectItem value="AUDITOR">Auditor</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="parkId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Park</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'null' ? null : value)
                    }
                    value={field.value ?? 'null'}
                    disabled={parksLoading}
                    aria-label="Select park"
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          parksLoading ? 'Loading parks...' : 'Select park'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">No Park</SelectItem>
                      {parks.map((park) => (
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
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 pt-8">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Toggle user active status"
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium">
                  Active User
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={updateMutation.isPending || assignParkMutation.isPending}
          className="w-full sm:w-auto"
        >
          {updateMutation.isPending || assignParkMutation.isPending
            ? 'Updating...'
            : 'Update User'}
        </Button>
      </form>
    </Form>
  );
}