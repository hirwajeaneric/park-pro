'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { FundingRequestResponse } from '@/types';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';

export default function AuditorFundingRequestDetails({ request }: { request: FundingRequestResponse }) {
    const router = useRouter();



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