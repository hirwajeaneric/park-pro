/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Metadata } from 'next';
import BreadcrumbWithCustomSeparator, {
  BreadCrumLinkTypes,
} from '@/components/widget/BreadCrumComponent';
import { getParkById } from '@/lib/api';
import { Park } from '@/types';
import { cookies } from 'next/headers';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePark, deletePark } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { UpdateParkForm } from '@/types';
import ProtectedRoute from '@/lib/ProtectedRoute';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cookieStore = cookies();
  const token = cookieStore.get('access-token')?.value;
  let park: Park;
  try {
    park = await getParkById(params.id);
  } catch (error) {
    return {
      title: 'Park Not Found',
      description: 'Park details not available',
    };
  }
  return {
    title: `${park.name} - Park Management`,
    description: `Manage park ${park.name}`,
  };
}

const ParkUpdateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
});

function ParkUpdateForm({ park }: { park: Park }) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<UpdateParkForm>({
    resolver: zodResolver(ParkUpdateFormSchema),
    defaultValues: {
      name: park.name,
      location: park.location,
      description: park.description,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateParkForm) => updatePark(park.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parks'] });
      toast.success('Park updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update park');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePark(park.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parks'] });
      toast.success('Park deleted successfully');
      window.location.href = '/admin/parks';
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete park');
    },
  });

  const onSubmit = (data: UpdateParkForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Updating...' : 'Update Park'}
          </Button>
        </form>
      </Form>
      <Button
        variant="destructive"
        onClick={() => deleteMutation.mutate()}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? 'Deleting...' : 'Delete Park'}
      </Button>
    </div>
  );
}

export default async function ParkPage({ params }: Props) {
  const cookieStore = cookies();
  const token = cookieStore.get('access-token')?.value;
  let park: Park;
  try {
    park = await getParkById(params.id);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
            <h1 className="mt-6 font-bold text-3xl">Park Not Found</h1>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const breadCrumLinks: BreadCrumLinkTypes[] = [
    { label: 'Parks', link: '/admin/parks', position: 'middle' },
    { label: park.name, link: '', position: 'end' },
  ];

  return (
    <ProtectedRoute>
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
          <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
          <h1 className="mt-6 font-bold text-3xl">Park Details</h1>
          <div className="mt-6 max-w-2xl">
            <ParkUpdateForm park={park} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}