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
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { updateWithdrawRequestAuditStatus } from '@/lib/api';
import { WithdrawRequest } from '@/types';
import Link from 'next/link';
import { Input } from '../ui/input';

// Form schema for updating audit status
const UpdateAuditStatusFormSchema = z.object({
  auditStatus: z.enum(['PASSED', 'FAILED', 'UNJUSTIFIED'], {
    required_error: 'Audit status is required',
  }),
  justification: z.string().optional()
});

// Form data type
type UpdateAuditStatusForm = z.infer<typeof UpdateAuditStatusFormSchema>;

export default function AuditorWithdrawRequestForm({ request }: { request: WithdrawRequest }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<UpdateAuditStatusForm>({
    resolver: zodResolver(UpdateAuditStatusFormSchema),
    defaultValues: {
      auditStatus: request.auditStatus as 'PASSED' | 'FAILED' | 'UNJUSTIFIED' | undefined,
      justification: ''
    },
  });

  // Update audit status mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateAuditStatusForm) => updateWithdrawRequestAuditStatus(request.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawRequests'] });
      toast.success('Audit status updated successfully');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update audit status');
    },
  });

  const onSubmit = (data: UpdateAuditStatusForm) => {
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
            <strong>View Invoice:</strong>{' '}
            <Link href={request.receiptUrl} className="underline text-blue-500" target="_blank">
              Proforma Invoice
            </Link>
          </p>
        )}
        {request.rejectionReason && (
          <p><strong>Rejection Reason:</strong> {request.rejectionReason}</p>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold">Update Audit Status</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="auditStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audit Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audit status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PASSED">PASSED</SelectItem>
                        <SelectItem value="FAILED">FAILED</SelectItem>
                        <SelectItem value="UNJUSTIFIED">UNJUSTIFIED</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification {form.watch('auditStatus') === 'PASSED' ? '(Optional)' : ''}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        ['FAILED', 'UNJUSTIFIED'].includes(form.watch('auditStatus'))
                          ? 'Enter justification for audit status'
                          : 'Justification not required for PASSED'
                      }
                      {...field}
                      disabled={form.watch('auditStatus') === 'PASSED'}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Audit Status'}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push('/finance/withdraw-request')}
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