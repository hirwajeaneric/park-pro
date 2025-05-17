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
import { createFundingRequest, listBudgetsByPark, listBudgetCategoriesByBudget } from '@/lib/api';
import { Budget } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const CreateFundingRequestSchema = z.object({
  requestedAmount: z.coerce.number().positive('Requested amount must be positive'),
  requestType: z.enum(['EXTRA_FUNDS', 'EMERGENCY_RELIEF'], { message: 'Select a valid request type' }),
  reason: z.string().min(1, 'Reason is required'),
  parkId: z.string().min(1, 'Park ID is required'),
  budgetId: z.string().min(1, 'Budget ID is required'),
  budgetCategoryId: z.string().min(1, 'Budget category is required'),
});

type CreateFundingRequestFormData = z.infer<typeof CreateFundingRequestSchema>;

export default function CreateFundingRequestForm() {
  const [parkId, setParkId] = useState<string | null>(null);
  const [parkDataError, setParkDataError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const currentFiscalYear = new Date().getFullYear(); // 2025

  // Fetch parkId from localStorage
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

  // Fetch budgets for the park
  const { data: budgets = [], isLoading: budgetsLoading, error: budgetsError } = useQuery({
    queryKey: ['budgets', parkId],
    queryFn: () => listBudgetsByPark(parkId!),
    enabled: !!parkId,
  });

  // Default to the budget for the current fiscal year, or the first budget
  const defaultBudget = budgets.find((budget: Budget) => budget.fiscalYear === currentFiscalYear) || budgets[0];

  // Fetch budget categories for the selected budget
  const { data: budgetCategories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['budgetCategories', defaultBudget?.id],
    queryFn: () => listBudgetCategoriesByBudget(defaultBudget.id),
    enabled: !!defaultBudget?.id,
  });

  // Initialize form with default values
  const form = useForm<CreateFundingRequestFormData>({
    resolver: zodResolver(CreateFundingRequestSchema),
    defaultValues: {
      requestedAmount: 0,
      requestType: 'EXTRA_FUNDS',
      reason: '',
      parkId: parkId || '',
      budgetId: defaultBudget?.id || '',
      budgetCategoryId: '',
    },
  });

  // Update form defaults when parkId or defaultBudget changes
  useEffect(() => {
    if (parkId && defaultBudget) {
      form.setValue('parkId', parkId);
      form.setValue('budgetId', defaultBudget.id);
    }
  }, [parkId, defaultBudget, form]);

  const mutation = useMutation({
    mutationFn: (data: CreateFundingRequestFormData) =>
      createFundingRequest(data.parkId, {
        parkId: data.parkId,
        requestedAmount: data.requestedAmount,
        requestType: data.requestType,
        reason: data.reason,
        budgetId: data.budgetId,
        budgetCategoryId: data.budgetCategoryId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding-requests', defaultBudget?.id] });
      toast.success('Funding request created successfully');
      router.push(`/finance/funding-requests`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create funding request');
    },
  });

  const onSubmit = (data: CreateFundingRequestFormData) => {
    if (!defaultBudget) {
      toast.error('No budget available. Please create a budget first.');
      return;
    }
    if (!data.budgetCategoryId) {
      toast.error('Please select a budget category.');
      return;
    }
    mutation.mutate(data);
  };

  if (parkDataError) {
    return <p className="text-red-500">{parkDataError}</p>;
  }

  if (!parkId || budgetsLoading || categoriesLoading) {
    return <p>Loading...</p>;
  }

  if (budgetsError) {
    return <p className="text-red-500">Failed to load budgets: {budgetsError.message}</p>;
  }

  if (categoriesError) {
    return <p className="text-red-500">Failed to load budget categories: {categoriesError.message}</p>;
  }

  if (!defaultBudget) {
    return (
      <p className="text-red-500">
        No budget found for fiscal year {currentFiscalYear}. Please create a budget first.
      </p>
    );
  }

  if (budgetCategories.length === 0) {
    return (
      <p className="text-red-500">
        No budget categories found for the selected budget. Please create categories first.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div>
          <FormLabel>Fiscal Year</FormLabel>
          <p className="text-sm text-gray-500">Using budget for fiscal year {defaultBudget.fiscalYear}</p>
        </div>
        <FormField
          control={form.control}
          name="budgetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a budget" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {budgets.map((budget: Budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      Fiscal Year {budget.fiscalYear}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budgetCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a budget category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {budgetCategories.map((category: { id: string; name: string }) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requestedAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requested Amount (XAF)</FormLabel>
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
                <Textarea placeholder="Enter reason for funding request" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={mutation.isPending || !defaultBudget || budgetCategories.length === 0}>
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