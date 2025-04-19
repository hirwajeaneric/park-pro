'use client';

import { useState } from 'react';
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
import { approveWithdrawRequest, rejectWithdrawRequest } from '@/lib/api';
import { WithdrawRequest, RejectWithdrawRequest } from '@/types';
import Link from 'next/link';

const RejectWithdrawRequestFormSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export default function ManageWithdrawRequestForm({ request }: { request: WithdrawRequest }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRejecting, setIsRejecting] = useState(false);

  // Reject form setup
  const rejectForm = useForm<RejectWithdrawRequest>({
    resolver: zodResolver(RejectWithdrawRequestFormSchema),
    defaultValues: {
      rejectionReason: '',
    },
  });

  // Approve withdraw request mutation
  const approveMutation = useMutation({
    mutationFn: () => approveWithdrawRequest(request.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawRequests'] });
      toast.success('Withdraw request approved successfully');
      router.push('/manager/withdraw-request');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve withdraw request');
    },
  });

  // Reject withdraw request mutation
  const rejectMutation = useMutation({
    mutationFn: (data: RejectWithdrawRequest) => rejectWithdrawRequest(request.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawRequests'] });
      toast.success('Withdraw request rejected successfully');
      router.push('/manager/withdraw-request');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject withdraw request');
    },
  });

  const onRejectSubmit = (data: RejectWithdrawRequest) => {
    rejectMutation.mutate(data);
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
        <h2 className="text-lg font-semibold">Manage Withdraw Request</h2>
        {!isRejecting ? (
          <div className="space-y-4">
            {request.status === 'PENDING' ? (
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="default"
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsRejecting(true)}
                  disabled={rejectMutation.isPending}
                >
                  Reject
                </Button>
              </div>
            ) : (
              <p>Request is {request.status.toLowerCase()} and cannot be managed further.</p>
            )}
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push('/manager/withdraw-request')}
            >
              Back
            </Button>
          </div>
        ) : (
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit(onRejectSubmit)} className="space-y-4">
              <FormField
                control={rejectForm.control}
                name="rejectionReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Reason</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter rejection reason" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button type="submit" variant="destructive" disabled={rejectMutation.isPending}>
                  {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsRejecting(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}