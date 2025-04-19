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
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { updateWithdrawRequest } from '@/lib/api';
import { WithdrawRequest, UpdateWithdrawRequest } from '@/types';
import { FileUpload } from '@/components/ui/file-upload';
import Link from 'next/link';

const UpdateWithdrawRequestFormSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive').optional(),
  reason: z.string().min(1, 'Reason is required').optional(),
  description: z.string().optional(),
  receiptUrl: z.string().url('Must be a valid URL').optional(),
});

export default function UpdateWithdrawRequestForm({ request }: { request: WithdrawRequest }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<UpdateWithdrawRequest>({
    resolver: zodResolver(UpdateWithdrawRequestFormSchema),
    defaultValues: {
      amount: request.amount,
      reason: request.reason,
      description: request.description || '',
      receiptUrl: request.receiptUrl || '',
    },
  });

  // Update withdraw request mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateWithdrawRequest) => updateWithdrawRequest(request.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawRequests'] });
      toast.success('Withdraw request updated successfully');
      router.push('/manager/withdraw-request');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update withdraw request');
    },
  });

  const onSubmit = (data: UpdateWithdrawRequest) => {
    updateMutation.mutate(data);
  };

  if (!request) return <div>Withdraw request not found</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h2 className="text-lg font-semibold">Details</h2>
        <p><strong>Amount:</strong> {request.amount} {request.currency}</p>
        <p><strong>Reason:</strong> {request.reason}</p>
        <p><strong>Category:</strong> {request.budgetCategoryName}</p>
        <p><strong>Status:</strong> {request.status}</p>
        <p><strong>Audit Status:</strong> {request.auditStatus}</p>
        <p><strong>Created:</strong> {format(new Date(request.createdAt), 'MMM dd, yyyy')}</p>
        <p><strong>Park ID:</strong> {request.parkId}</p>
        {request.receiptUrl && (
          <p>
            <strong>View Receipt:</strong>{' '}
            <Link href={request.receiptUrl} className="underline text-blue-500" target="_blank">
              Receipt
            </Link>
          </p>
        )}
        {request.rejectionReason && (
          <p><strong>Rejection Reason:</strong> {request.rejectionReason}</p>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold">Update Withdraw Request</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
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
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                    <Input placeholder="Enter reason" value={field.value ?? ''} onChange={field.onChange} />
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
                    <Input placeholder="Enter description (optional)" value={field.value ?? ''} onChange={field.onChange} />
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
                      value={field.value ?? ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Withdraw Request'}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push('/manager/withdraw-request')}
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