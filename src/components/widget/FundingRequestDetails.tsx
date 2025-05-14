'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updateFundingRequest, deleteFundingRequest } from '@/lib/api';
import { FundingRequestResponse } from '@/types';
import { z } from 'zod';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';

const UpdateFundingRequestSchema = z.object({
    requestedAmount: z.coerce.number().positive('Requested amount must be positive'),
    requestType: z.enum(['EXTRA_FUNDS', 'EMERGENCY_RELIEF']),
    reason: z.string().min(1, 'Reason is required'),
    budgetId: z.string().min(1, 'Budget is required'),
});

type UpdateFundingRequestFormData = z.infer<typeof UpdateFundingRequestSchema>;

export default function FundingRequestDetails({ request }: { request: FundingRequestResponse }) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const form = useForm<UpdateFundingRequestFormData>({
        resolver: zodResolver(UpdateFundingRequestSchema),
        defaultValues: {
            requestedAmount: request.requestedAmount,
            requestType: request.requestType,
            reason: request.reason,
            budgetId: request.budgetId,
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateFundingRequestFormData) => updateFundingRequest(request.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funding-requests', request.budgetId] });
            toast.success('Funding request updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update funding request');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteFundingRequest(request.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funding-requests', request.budgetId] });
            toast.success('Funding request deleted successfully');
            router.push(`/finance/funding-requests/${request.budgetId}`);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete funding request');
        },
    });

    const onSubmit = (data: UpdateFundingRequestFormData) => {
        updateMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-semibold">Funding Request Details</h1>
                <Button variant="outline" onClick={() => router.push(`/finance/funding-requests`)}>
                    Back to Funding Requests
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Request #{request.id}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p><strong>Requested Amount:</strong> ${request.requestedAmount.toFixed(2)}</p>
                    <p><strong>Approved Amount:</strong> {request.approvedAmount ? `$${request.approvedAmount.toFixed(2)}` : 'N/A'}</p>
                    <p><strong>Type:</strong> <RequestTypeBadge type={request.requestType} /></p>
                    <p><strong>Reason:</strong> {request.reason}</p>
                    <p><strong>Status:</strong><RequestStatusBadges status={request.status} /></p>
                    {request.rejectionReason && <p><strong>Rejection Reason:</strong> {request.rejectionReason}</p>}
                    <p><strong>Budget ID:</strong> {request.budgetId}</p>
                    <p><strong>Currency:</strong> {request.currency}</p>
                    <p><strong>Created At:</strong> {format(new Date(request.createdAt), 'MMM dd, yyyy')}</p>
                    <p><strong>Updated At:</strong> {format(new Date(request.updatedAt), 'MMM dd, yyyy')}</p>
                    {request.approvedAt && <p><strong>Approved At:</strong> {format(new Date(request.approvedAt), 'MMM dd, yyyy')}</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Update Funding Request</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="requestedAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Requested Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="Enter requested amount" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="requestType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Request Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select request type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="EXTRA_FUNDS">Extra Funds</SelectItem>
                                                <SelectItem value="EMERGENCY_RELIEF">Emergency Relief</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter reason" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-4">
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? 'Updating...' : 'Update Request'}
                                </Button>
                                <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete Request'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
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

const RequestTypeBadge = ({ type }: {type: string }) => {
    if (type == 'EXTRA_FUNDS') {
        return <Badge variant={'secondary'}>Extra Funds</Badge>
    } else if (type === 'EMERGENCY_RELIEF') {
        return <Badge variant={'warning'}>Emergency Relief</Badge>
    }
}