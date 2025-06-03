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
import { updateBudgetCategory } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BudgetCategory, UpdateBudgetCategoryForm as UpdateBudgetCategoryFormTypes } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UpdateBudgetCategoryFormSchema = z.object({
  name: z.string().min(3, "The name must atleast be 3 character long."),
  allocatedAmount: z.coerce
    .number({ invalid_type_error: 'Total amount must be a number' })
    .positive({ message: 'Total amount must be positive' }),
  spendingStrategy: z.enum(['EXPENSE', 'WITHDRAW_REQUEST'])
});

export default function UpdateBudgetCategoryForm({ category }: { category: BudgetCategory }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<UpdateBudgetCategoryFormTypes>({
    resolver: zodResolver(UpdateBudgetCategoryFormSchema),
    defaultValues: {
      name: category.name,
      allocatedAmount: category.allocatedAmount,
      spendingStrategy: category.spendingStrategy
    },
  });

  const updateBudgetCategoryMutation = useMutation({
    mutationFn: (data: UpdateBudgetCategoryFormTypes) => updateBudgetCategory(category.budgetId, category.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
      toast.success('Budget category Updated!');
      router.push(`/finance/budget/${category.budgetId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update budget category');
    },
  });

  const onSubmit = (data: UpdateBudgetCategoryFormTypes) => {
    updateBudgetCategoryMutation.mutate(data);
  };

  return (
    <div className="space-y-6 w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="gap-4 flex justify-between items-end flex-col md:flex-row w-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className='w-full'>
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
              <FormItem className='w-full'>
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
              <FormItem className='w-full'>
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
          <Button
            type="submit"
            disabled={updateBudgetCategoryMutation.isPending}
            className="w-full sm:w-auto"
          >
            {updateBudgetCategoryMutation.isPending ? 'Updating...' : 'Update Budget Category'}
          </Button>
        </form>
      </Form>
    </div>
  );
}