/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { updateOpportunity } from '@/lib/api';
import { CreateOpportunityForm, Opportunity } from '@/types';

const UpdateOpportunityFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().min(1, 'Description is required'),
  details: z.string().optional(),
  type: z.enum(['JOB', 'VOLUNTEER', 'PARTNERSHIP'], { required_error: 'Type is required' }),
  status: z.enum(['OPEN', 'CLOSED'], { required_error: 'Status is required' }),
  visibility: z.enum(['PUBLIC', 'PRIVATE'], { required_error: 'Visibility is required' }),
});

export default function UpdateOpportunityForm({ opportunity }: { opportunity: Opportunity }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Safely parse parkId from localStorage
  let parkId: string | null = null;
  try {
    const parkData = localStorage.getItem('park-data');
    if (parkData) {
      parkId = JSON.parse(parkData).id as string;
    }
  } catch {
    toast.error('Invalid park data. Please try again.');
  }

  // Form setup
  const form = useForm<CreateOpportunityForm>({
    resolver: zodResolver(UpdateOpportunityFormSchema),
    defaultValues: {
      title: opportunity.title,
      description: opportunity.description,
      details: opportunity.details || '',
      type: opportunity.type,
      status: opportunity.status,
      visibility: opportunity.visibility,
      parkId: parkId || '',
    },
  });

  // Update opportunity mutation
  const updateMutation = useMutation({
    mutationFn: (data: CreateOpportunityForm) => updateOpportunity(opportunity.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Opportunity updated successfully');
      router.push('/manager/opportunity');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update opportunity');
    },
  });

  const onSubmit = (data: CreateOpportunityForm) => {
    if (!parkId) {
      toast.error('No park data found. Please log in again.');
      return;
    }
    updateMutation.mutate({ ...data, parkId });
  };

  if (!opportunity) return <div>Opportunity not found</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h2 className="text-lg font-semibold">Details</h2>
        <p><strong>Title:</strong> {opportunity.title}</p>
        <p><strong>Type:</strong> {opportunity.type}</p>
        <p><strong>Status:</strong> {opportunity.status}</p>
        <p><strong>Visibility:</strong> {opportunity.visibility}</p>
        <p><strong>Park:</strong> {opportunity.parkName}</p>
        <p><strong>Created:</strong> {format(new Date(opportunity.createdAt), 'MMM dd, yyyy')}</p>
        <p><strong>Description:</strong> {opportunity.description}</p>
        {opportunity.details && <p><strong>Details:</strong> {opportunity.details}</p>}
      </div>
      <div>
        <h2 className="text-lg font-semibold">Update Opportunity</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <FormField
              control={form.control as any}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter opportunity title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter additional details" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JOB">Job</SelectItem>
                        <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                        <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Opportunity'}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push('/manager/opportunity')}
              >
                Back
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}