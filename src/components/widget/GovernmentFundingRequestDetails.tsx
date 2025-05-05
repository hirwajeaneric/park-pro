'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { approveFundingRequest, rejectFundingRequest } from '@/lib/api';
import { FundingRequestResponse } from '@/types';
import { z } from 'zod';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';

const ApproveSchema = z.object({
    approvedAmount: z.coerce.number().positive('Approved amount must be positive'),
});

const RejectSchema = z.object({
    rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

type ApproveFormData = z.infer<typeof ApproveSchema>;
type RejectFormData = z.infer<typeof RejectSchema>;

export default function GovernmentFundingRequestDetails({ request }: { request: FundingRequestResponse }) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const approveForm = useForm<ApproveFormData>({
        resolver: zodResolver(ApproveSchema),
        defaultValues: {
            approvedAmount: request.requestedAmount,
        },
    });

    const rejectForm = useForm<RejectFormData>({
        resolver: zodResolver(RejectSchema),
        defaultValues: {
            rejectionReason: '',
        },
    });

    const approveMutation = useMutation({
        mutationFn: (data: ApproveFormData) => approveFundingRequest(request.id, data.approvedAmount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funding-requests', request.parkId] });
            toast.success('Funding request approved successfully');
            router.push('/government/funding-requests');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve funding request');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (data: RejectFormData) => rejectFundingRequest(request.id, data.rejectionReason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funding-requests', request.parkId] });
            toast.success('Funding request rejected successfully');
            router.push('/government/funding-requests');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reject funding request');
        },
    });

    const onApproveSubmit = (data: ApproveFormData) => {
        approveMutation.mutate(data);
    };

    const onRejectSubmit = (data: RejectFormData) => {
        rejectMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-semibold">Funding Request Details</h1>
                <Button variant="outline" onClick={() => router.push('/government/funding-requests')}>
                    Back to Funding Requests
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Request #{request.id}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p><strong>Park:</strong> {request.parkName}</p>
                    <p><strong>Requested Amount:</strong> ${request.requestedAmount.toFixed(2)}</p>
                    <p><strong>Approved Amount:</strong> {request.approvedAmount ? `$${request.approvedAmount.toFixed(2)}` : 'N/A'}</p>
                    <p><strong>Type:</strong> <RequestTypeBadge type={request.requestType} /> </p>
                    <p><strong>Reason:</strong> {request.reason}</p>
                    <p><strong>Status:</strong> <RequestStatusBadges status={request.status} /></p>
                    {request.rejectionReason && <p><strong>Rejection Reason:</strong> {request.rejectionReason}</p>}
                    <p><strong>Budget ID:</strong> {request.budgetId}</p>
                    <p><strong>Currency:</strong> {request.currency}</p>
                    <p><strong>Created At:</strong> {format(new Date(request.createdAt), 'MMM dd, yyyy')}</p>
                    <p><strong>Updated At:</strong> {format(new Date(request.updatedAt), 'MMM dd, yyyy')}</p>
                    {request.approvedAt && <p><strong>Approved At:</strong> {format(new Date(request.approvedAt), 'MMM dd, yyyy')}</p>}
                </CardContent>
            </Card>
            {request.status === 'PENDING' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approve Funding Request</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...approveForm}>
                                <form onSubmit={approveForm.handleSubmit(onApproveSubmit)} className="space-y-4">
                                    <FormField
                                        control={approveForm.control}
                                        name="approvedAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Approved Amount</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="Enter approved amount" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={approveMutation.isPending}>
                                        {approveMutation.isPending ? 'Approving...' : 'Approve Request'}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Reject Funding Request</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...rejectForm}>
                                <form onSubmit={rejectForm.handleSubmit(onRejectSubmit)} className="space-y-4">
                                    <FormField
                                        control={rejectForm.control}
                                        name="rejectionReason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rejection Reason</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Enter rejection reason" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" variant="destructive" disabled={rejectMutation.isPending}>
                                        {rejectMutation.isPending ? 'Rejecting...' : 'Reject Request'}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}


const RequestStatusBadges = ({ status }: { status: string }) => {
    if (status == 'PENDING') {
        return <Badge variant={'default'}>Pending</Badge>
    } else if (status === 'REJECTED') {
        return <Badge variant={'destructive'}>Rejected</Badge>
    } else if (status === 'APPROVED') {
        return <Badge variant={'success'}>Approved</Badge>
    }
}

const RequestTypeBadge = ({ type }: { type: string }) => {
    if (type == 'EXTRA_FUNDS') {
        return <Badge variant={'secondary'}>Extra Funds</Badge>
    } else if (type === 'EMERGENCY_RELIEF') {
        return <Badge variant={'warning'}>Emergency Relief</Badge>
    }
}