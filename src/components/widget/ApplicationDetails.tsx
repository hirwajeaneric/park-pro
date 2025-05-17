'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';
import { updateOpportunityApplicationStatus } from '@/lib/api';
import { OpportunityApplicationResponse } from '@/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ApplicationDetails({ application }: { application: OpportunityApplicationResponse }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [status, setStatus] = useState(application.status);
    const [approvalMessage, setApprovalMessage] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    // Mutation to update status
    const mutation = useMutation({
        mutationFn: () =>
            updateOpportunityApplicationStatus(application.id, status as 'SUBMITTED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED', approvalMessage, rejectionReason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            toast.success('Application status updated successfully');
            router.refresh();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update application status');
        },
    });

    const handleStatusChange = (value: string) => {
        setStatus(value);
        // Reset fields when status changes
        setApprovalMessage('');
        setRejectionReason('');
    };

    const handleSubmit = () => {
        if (status === 'ACCEPTED' && !approvalMessage.trim()) {
            toast.error('Approval message is required for ACCEPTED status');
            return;
        }
        if (status === 'REJECTED' && !rejectionReason.trim()) {
            toast.error('Rejection reason is required for REJECTED status');
            return;
        }
        mutation.mutate();
    };

    return (
        <div className="space-y-6">
            <div className="flex w-full items-center justify-between">
                <h2 className="text-xl font-semibold">Application Details</h2>
                <Button variant="outline" asChild>
                    <Link href="/accounts/applications">Back to Applications</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{application.firstName} {application.lastName}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                    <p><strong>Email:</strong> {application.email}</p>
                    <p><strong>Opportunity:</strong> {application.opportunityName}</p>
                    <p><strong>Attachment:</strong>{' '}
                        <a href={application.applicationLetterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            Cover Letter and CV/ Application Letter
                        </a>
                    </p>
                    <p>
                        <strong>Status:</strong>{' '}
                        <Badge
                            variant={
                                application.status === 'ACCEPTED'
                                    ? 'success'
                                    : application.status === 'REJECTED'
                                    ? 'destructive'
                                    : application.status === 'REVIEWED'
                                    ? 'warning'
                                    : 'default'
                            }
                        >
                            {application.status}
                        </Badge>
                    </p>
                    {application.approvalMessage && (
                        <p><strong>Approval Message:</strong> {application.approvalMessage}</p>
                    )}
                    {application.rejectionReason && (
                        <p><strong>Rejection Reason:</strong> {application.rejectionReason}</p>
                    )}
                    <p><strong>Created At:</strong> {format(new Date(application.createdAt), 'MMM dd, yyyy')}</p>
                    <p><strong>Updated At:</strong> {format(new Date(application.updatedAt), 'MMM dd, yyyy')}</p>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Update Status</label>
                            <Select
                                onValueChange={handleStatusChange}
                                defaultValue={application.status}
                                disabled={mutation.isPending}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                    <SelectItem value="REVIEWED">Reviewed</SelectItem>
                                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {status === 'ACCEPTED' && (
                            <div>
                                <label className="block text-sm font-medium">Approval Message</label>
                                <Textarea
                                    value={approvalMessage}
                                    onChange={(e) => setApprovalMessage(e.target.value)}
                                    placeholder="Provide next steps for the approved application"
                                    className="w-full"
                                    disabled={mutation.isPending}
                                />
                            </div>
                        )}
                        {status === 'REJECTED' && (
                            <div>
                                <label className="block text-sm font-medium">Rejection Reason</label>
                                <Textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Provide the reason for rejection"
                                    className="w-full"
                                    disabled={mutation.isPending}
                                />
                            </div>
                        )}
                        <Button
                            onClick={handleSubmit}
                            disabled={mutation.isPending}
                            className="mt-2"
                        >
                            {mutation.isPending ? 'Updating...' : 'Update Application'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}