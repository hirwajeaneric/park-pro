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
  fiscalYear: z.coerce
    .number({ invalid_type_error: 'Fiscal year must be a number' })
    .int({ message: 'Fiscal year must be an integer' })
    .min(2000, { message: 'Fiscal year must be 2000 or later' })
    .max(2100, { message: 'Fiscal year must be 2100 or earlier' }),
  totalAmount: z.coerce
    .number({ invalid_type_error: 'Total amount must be a number' })
    .positive({ message: 'Total amount must be positive' })
    .max(1_000_000_000, { message: 'Total amount cannot exceed 1 billion' }),
  status: z.enum(['APPROVED', 'REJECTED', 'DRAFT']),
});

export default function CreateBudgetForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

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

  const form = useForm<CreateBudgetFormTypes>({
    resolver: zodResolver(CreateBudgetFormSchema),
    defaultValues: {
      fiscalYear: undefined,
      totalAmount: undefined,
      status: 'DRAFT',
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data: CreateBudgetFormTypes) => {
      if (!parkId) {
        throw new Error('Park ID is required');
      }
      return createBudget(data, parkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget created successfully');
      router.push('/finance/budget');
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
                    type="number"
                    placeholder="Enter fiscal year (e.g., 2025)"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                    aria-required="true"
                    min="2000"
                    max="2100"
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
                    type="number"
                    placeholder="Enter total amount"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                    aria-required="true"
                    min="0.01"
                    step="0.01"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Button
              type="submit"
              disabled={createBudgetMutation.isPending || !parkId}
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