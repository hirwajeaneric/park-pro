/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { listBudgetsByPark, listBudgetCategoriesByBudget, createWithdrawRequest } from '@/lib/api';
import { Budget, BudgetCategory, CreateWithdrawRequestForm as CreateWithdrawRequestFormTypes } from '@/types';
import { FileUpload } from '@/components/ui/file-upload';

const CreateWithdrawRequestFormSchema = z.object({
  budgetId: z.string().min(1, 'Budget is required'),
  budgetCategoryId: z.string().min(1, 'Category is required'),
  amount: z.coerce
    .number()
    .positive('Amount must be positive')
    .transform((val) => val.toFixed(2)),
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().optional(),
  receiptUrl: z.string().url('Please upload a valid file').optional(),
  parkId: z.string()
});

export default function CreateWithdrawRequestForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

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

  // Fetch budgets
  const { data: budgets = [], isLoading: isBudgetsLoading } = useQuery({
    queryKey: ['budgets', parkId],
    queryFn: () => listBudgetsByPark(parkId!),
    enabled: !!parkId,
  });

  // Fetch categories for selected budget
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories', selectedBudgetId],
    queryFn: () => listBudgetCategoriesByBudget(selectedBudgetId!),
    enabled: !!selectedBudgetId,
  });

  // Form setup
  const form = useForm<CreateWithdrawRequestFormTypes>({
    resolver: zodResolver(CreateWithdrawRequestFormSchema),
    defaultValues: {
      budgetId: '',
      budgetCategoryId: '',
      amount: 0,
      reason: '',
      description: '',
      receiptUrl: '',
      parkId: ''
    },
  });

  // Create withdraw request mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateWithdrawRequestFormTypes) =>
      createWithdrawRequest(data.budgetId, { ...data, parkId: parkId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawRequests'] });
      toast.success('Withdraw request created successfully');
      router.push('/manager/withdraw-request');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create withdraw request');
    },
  });

  const onSubmit = (data: CreateWithdrawRequestFormTypes) => {
    createMutation.mutate(data);
  };

  return (
    <>
      {!parkId ? (
        <p className="text-red-500">No park data found. Please log in again.</p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 max-w-md">
            <FormField
              control={form.control as any}
              name="budgetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedBudgetId(value);
                      }}
                      value={field.value}
                      disabled={isBudgetsLoading || budgets.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a budget" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgets.map((budget: Budget) => (
                          <SelectItem key={budget.id} value={budget.id}>
                            {budget.fiscalYear}
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
              control={form.control as any}
              name="budgetCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isCategoriesLoading || categories.length === 0 || !selectedBudgetId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: BudgetCategory) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
              control={form.control as any}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter amount (e.g., 1000.50)"
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter reason" {...field} />
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
                    <Input placeholder="Enter description (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="receiptUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt</FormLabel>
                  <FormControl>
                    <FileUpload
                      endpoint="resumeUpload"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createMutation.isPending || !parkId}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Withdraw Request'}
              </Button>
              <Button
                variant="outline"
                type="reset"
                onClick={() => router.push('/manager/withdraw-request')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}