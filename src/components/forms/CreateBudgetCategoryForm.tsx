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
import { createBudgetCategory } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateBudgetCategoryForm as CreateBudgetCategoryFormTypes } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CreateBudgetCategoryFormSchema = z.object({
  name: z.string().min(3, "The name must atleast be 3 character long."),
  allocatedAmount: z.coerce
    .number({ invalid_type_error: 'Total amount must be a number' })
    .positive({ message: 'Total amount must be positive' }),
  spendingStrategy: z.enum(['EXPENSE', 'WITHDRAW_REQUEST'])
});

export default function CreateBudgetCategoryForm({ budgetId }: { budgetId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<CreateBudgetCategoryFormTypes>({
    resolver: zodResolver(CreateBudgetCategoryFormSchema),
    defaultValues: {
      name: "",
      allocatedAmount: 0,
      spendingStrategy: 'EXPENSE'
    },
  });

  const createBudgetCategoryMutation = useMutation({
    mutationFn: (data: CreateBudgetCategoryFormTypes) => createBudgetCategory(data, budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
      toast.success('Budget category Created successfully');
      router.push(`/finance/budget/${budgetId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create budget category');
    },
  });

  const onSubmit = (data: CreateBudgetCategoryFormTypes) => {
    createBudgetCategoryMutation.mutate(data);
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
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder="Enter the category name"
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
            name="allocatedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Allocated amount
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder="Enter the total amount"
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
            name="spendingStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Spending Strategy
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a spending strategy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="WITHDRAW_REQUEST">Withdraw Request</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Button
              type="submit"
              disabled={createBudgetCategoryMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createBudgetCategoryMutation.isPending ? 'Creating...' : 'Create Budget Category'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}