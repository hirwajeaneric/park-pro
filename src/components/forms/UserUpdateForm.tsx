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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser, assignUserToPark } from '@/lib/api';
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
import { Switch } from '@/components/ui/switch';

export const UserUpdateFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  role: z.enum([
    'VISITOR',
    'ADMIN',
    'FINANCE_OFFICER',
    'PARK_MANAGER',
    'GOVERNMENT_OFFICER',
    'AUDITOR',
  ]).optional(),
  parkId: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export const ParkAssignmentSchema = z.object({
  parkId: z.string().nullable(),
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

  // Form for updating isActive
  const activeForm = useForm<UpdateUserForm>({
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

  // Form for park assignment
  const parkForm = useForm<{ parkId: string | null }>({
    resolver: zodResolver(ParkAssignmentSchema),
    defaultValues: {
      parkId: user.parkId,
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
      toast.error(error.message || 'Failed to update user account');
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

  const onActiveSubmit = (data: UpdateUserForm) => {
    updateMutation.mutate(data);
  };

  const onParkSubmit = (data: { parkId: string | null }) => {
    assignParkMutation.mutate(data.parkId);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Update User Active Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...activeForm}>
            <form onSubmit={activeForm.handleSubmit(onActiveSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={activeForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter first name"
                          {...field}
                          // disabled
                          aria-readonly="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={activeForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter last name"
                          {...field}
                          // disabled
                          aria-readonly="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={activeForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email"
                          {...field}
                          // disabled
                          aria-readonly="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={activeForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Role</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          // disabled
                          aria-readonly="true"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VISITOR">Visitor</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="FINANCE_OFFICER">Finance Officer</SelectItem>
                            <SelectItem value="PARK_MANAGER">Park Staff</SelectItem>
                            <SelectItem value="GOVERNMENT_OFFICER">Government Officer</SelectItem>
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
                {/* <FormField
                  control={activeForm.control}
                  name="parkId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Current Park</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                          value={field.value ?? 'null'}
                          // disabled
                          aria-readonly="true"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={parksLoading ? 'Loading parks...' : 'Select park'} />
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
                /> */}
                <FormField
                  control={activeForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-2 pt-2">
                      <FormLabel className="text-sm font-medium">Active Status</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-label="Toggle user active status"
                          className="mt-1"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        {field.value ? 'User is active' : 'User is inactive'}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full sm:w-auto"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Active Status'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign User to Park</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...parkForm}>
            <form onSubmit={parkForm.handleSubmit(onParkSubmit)} className="space-y-4">
              <FormField
                control={parkForm.control}
                name="parkId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Select Park</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                        value={field.value ?? 'null'}
                        disabled={parksLoading || assignParkMutation.isPending}
                        aria-label="Select park for assignment"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={parksLoading ? 'Loading parks...' : 'Select park'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">No Park (Unassign)</SelectItem>
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
              <Button
                type="submit"
                disabled={parksLoading || assignParkMutation.isPending}
                className="w-full sm:w-auto"
              >
                {assignParkMutation.isPending ? 'Assigning...' : 'Assign Park'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}