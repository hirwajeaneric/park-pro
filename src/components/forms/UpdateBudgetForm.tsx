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
import { updateBudget } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Budget, UpdateBudgetForm as UpdateBudgetFormTypes } from '@/types';

const BudgetUpdateFormSchema = z.object({
  fiscalYear: z.coerce
    .number({ invalid_type_error: 'Fiscal year must be a number' })
    .int({ message: 'Fiscal year must be an integer' })
    .min(2000, { message: 'Fiscal year must be 2000 or later' })
    .max(2100, { message: 'Fiscal year must be 2100 or earlier' }),
  totalAmount: z.coerce
    .number({ invalid_type_error: 'Total amount must be a number' })
    .positive({ message: 'Total amount must be positive' })
    .max(1_000_000_000, { message: 'Total amount cannot exceed 1 billion' }),
  status: z.enum(['APPROVED', 'REJECTED', 'DRAFT'])
});

interface BudgetUpdateFormProps {
  budget: Budget;
}

export default function UpdateBudgetForm({ budget }: BudgetUpdateFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<UpdateBudgetFormTypes>({
    resolver: zodResolver(BudgetUpdateFormSchema),
    defaultValues: {
      fiscalYear: new Date().getFullYear(),
      totalAmount: budget.totalAmount,
      status: budget.status
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateBudgetFormTypes) => updateBudget(budget.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget updated successfully');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update budget');
    },
  });

  const onSubmit = (data: UpdateBudgetFormTypes) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-6 w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="gap-4 flex justify-between items-end flex-col md:flex-row w-full">
          <FormField
            control={form.control}
            name="fiscalYear"
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-sm font-medium">
                  Fiscal Year
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder="Enter the fiscal year"
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
            name="totalAmount"
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-sm font-medium">
                  Total Amount
                </FormLabel>
                <FormControl>
                  <Input
                    type='totalAmount'
                    placeholder="Enter the total amount"
                    {...field}
                    aria-required="true"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto"
          >
            {updateMutation.isPending ? 'Updating...' : 'Update Budget'}
          </Button>
        </form>
      </Form>
    </div>
  );
}