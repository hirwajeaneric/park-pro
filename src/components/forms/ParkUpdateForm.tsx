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
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePark, deletePark } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Park, UpdateParkForm } from '@/types';

const ParkUpdateFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
});

interface ParkUpdateFormProps {
  park: Park;
}

export default function ParkUpdateForm({ park }: ParkUpdateFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

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
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update park');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePark(park.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parks'] });
      toast.success('Park deleted successfully');
      router.push('/admin/parks');
    },
    onError: (error: Error) => {
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
                <FormLabel className="text-sm font-medium">
                  Park Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter park name"
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Location
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter park location"
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter park description"
                    {...field}
                    aria-required="true"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Park'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Park'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}