/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { updateExpense } from '@/lib/api';
import { Expense, UpdateExpenseForm } from '@/types';
import { FileUpload } from '../ui/file-upload';
import Link from 'next/link';
import ReceiptGenerator from '@/components/ui/receipt-generator';
import { useState } from 'react';

const UpdateExpenseFormSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  receiptUrl: z.string().url('Must be a valid URL'),
});

export default function UpdateExpenseDetailsForm({ expense }: { expense: Expense }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showReceipt, setShowReceipt] = useState(false);

  // Form setup
  const form = useForm<UpdateExpenseForm>({
    resolver: zodResolver(UpdateExpenseFormSchema),
    defaultValues: {
      description: expense.description,
      receiptUrl: expense.receiptUrl || undefined,
    },
  });

  // Update expense mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateExpenseForm) => updateExpense(expense.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated successfully');
      router.push('/manager/expense');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update expense');
    },
  });

  const onSubmit = (data: UpdateExpenseForm) => {
    updateMutation.mutate(data);
  };

  const receiptData = {
    id: expense.id,
    type: 'EXPENSE' as const,
    title: 'Expense Receipt',
    amount: expense.amount.toString(),
    currency: expense.currency,
    status: expense.auditStatus,
    parkName: expense.parkName || 'N/A',
    category: expense.budgetCategoryName,
    reason: expense.description,
    createdAt: expense.createdAt,
    receiptNumber: `EXP-${expense.id.slice(0, 8).toUpperCase()}`,
  };

  if (!expense) return <div>Expense not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Expense Details</h1>
        <div className="flex gap-2">
          {expense.auditStatus === 'PASSED' && (
            <Button 
              variant="outline" 
              onClick={() => setShowReceipt(!showReceipt)}
            >
              {showReceipt ? 'Hide Receipt' : 'View Receipt'}
            </Button>
          )}
        </div>
      </div>

      {showReceipt && expense.auditStatus === 'PASSED' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Receipt</h2>
          <ReceiptGenerator data={receiptData} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Details</h2>
          <p><strong>Amount:</strong> {expense.amount} {expense.currency}</p>
          <p><strong>Category:</strong> {expense.budgetCategoryName}</p>
          <p><strong>Audit Status:</strong> {expense.auditStatus}</p>
          <p><strong>Created:</strong> {format(new Date(expense.createdAt), 'MMM dd, yyyy')}</p>
          <p><strong>Park ID:</strong> {expense.parkId}</p>
          <p><strong>View Receipt:</strong> <Link href={form.getValues('receiptUrl')} className='underline text-blue-500' target='_blank'>Receipt</Link></p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Update Expense</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
              <FormField
                control={form.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Expense'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}