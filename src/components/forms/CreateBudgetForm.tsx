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
import { createBudget } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreateBudgetForm as CreateBudgetFormTypes } from '@/types';

const CreateBudgetFormSchema = z.object({
  fiscalYear: z.number(),
  totalAmount: z.number(),
  status: z.enum(['APPROVED', 'REJECTED', 'DRAFT'])
});

export default function CreateBudgetForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const parkId = JSON.parse(localStorage.getItem('park-data') as string);

  const form = useForm<CreateBudgetFormTypes>({
    resolver: zodResolver(CreateBudgetFormSchema),
    defaultValues: {
      fiscalYear: 0,
      totalAmount: 0,
      status: "DRAFT"
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data: CreateBudgetFormTypes) => createBudget(data, parkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget Created successfully');
      router.push('/finance/budgets');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create budget');
    },
  });

  const onSubmit = (data: CreateBudgetFormTypes) => {
    createBudgetMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fiscalYear"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Total Amount
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
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Button
              type="submit"
              disabled={createBudgetMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createBudgetMutation.isPending ? 'Creating...' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}