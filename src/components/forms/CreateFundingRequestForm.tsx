/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFundingRequest, listBudgetsByPark } from '@/lib/api';
import { Budget } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const CreateFundingRequestSchema = z.object({
  requestedAmount: z.coerce.number().positive('Requested amount must be positive'),
  requestType: z.enum(['EXTRA_FUNDS', 'EMERGENCY_RELIEF']),
  reason: z.string().min(1, 'Reason is required'),
  budgetId: z.string().min(1, 'Budget is required'),
});

type CreateFundingRequestFormData = z.infer<typeof CreateFundingRequestSchema>;

export default function CreateFundingRequestForm() {
  const [parkId, setParkId] = useState<string | null>(null);
  const [parkDataError, setParkDataError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const parkData = localStorage.getItem('park-data');
    if (parkData) {
      try {
        const parsed = JSON.parse(parkData);
        if (parsed.id) {
          setParkId(parsed.id);
        } else {
          setParkDataError('Park ID not found in park-data');
        }
      } catch (error) {
        setParkDataError('Failed to parse park-data');
      }
    } else {
      setParkDataError('No park data found. Please log in again.');
    }
  }, []);

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', parkId],
    queryFn: () => listBudgetsByPark(parkId!),
    enabled: !!parkId,
  });

  const form = useForm<CreateFundingRequestFormData>({
    resolver: zodResolver(CreateFundingRequestSchema),
    defaultValues: {
      requestedAmount: 0,
      requestType: 'EXTRA_FUNDS',
      reason: '',
      budgetId: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateFundingRequestFormData) => createFundingRequest(parkId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding-requests', form.getValues('budgetId')] });
      toast.success('Funding request created successfully');
      router.push(`/finance/funding-requests`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create funding request');
    },
  });

  const onSubmit = (data: CreateFundingRequestFormData) => {
    mutation.mutate(data);
  };

  if (parkDataError) {
    return <p className="text-red-500">{parkDataError}</p>;
  }

  if (!parkId || budgetsLoading) {
    return <p>Loading...</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <FormField
          control={form.control}
          name="requestedAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requested Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Enter requested amount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requestType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EXTRA_FUNDS">Extra Funds</SelectItem>
                  <SelectItem value="EMERGENCY_RELIEF">Emergency Relief</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter reason" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budgetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {budgets.map((budget: Budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      (FY {budget.fiscalYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Request'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/finance')}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}