'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cancelDonation } from '@/lib/api';
import { DonationResponse } from '@/types';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';

export default function DonationDetails({ donation }: { donation: DonationResponse }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { user } = useAuth();

    let badgeVariant: "default" | "success" | "destructive" = "default";
    switch (donation.status) {
        case "CONFIRMED":
            badgeVariant = "success";
            break;
        case "CANCELLED":
            badgeVariant = "destructive";
            break;
        case "PENDING":
            badgeVariant = "default";
            break;
    }

    const isDonor = user?.id === donation.donorId;

    const mutation = useMutation({
        mutationFn: () => cancelDonation(donation.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['donations', donation.parkId] });
            toast.success('Donation cancelled successfully');
            router.push('/donations');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to cancel donation');
        },
    });

    const handleCancel = () => {
        mutation.mutate();
    };

    return (
        <div className="space-y-6">
            <div className="flex w-full items-center justify-between">
                <h2 className="text-xl font-semibold">Donation Details</h2>
                <Button variant="outline" onClick={() => router.push('/finance/donations')}>
                    Back to Donations
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Donation #{donation.id}</CardTitle>
                </CardHeader>
                <CardContent className=''>
                    <p><strong>Amount:</strong> ${donation.amount.toFixed(2)}</p>
                    <p><strong>Status:</strong> <Badge variant={badgeVariant}>{donation.status}</Badge></p>
                    <p><strong>Motive:</strong> {donation.motiveForDonation || 'N/A'}</p>
                    <p><strong>Payment Reference:</strong> {donation.paymentReference || 'N/A'}</p>
                    <p><strong>Currency:</strong> {donation.currency}</p>
                    <p><strong>Fiscal Year:</strong> {donation.fiscalYear}</p>
                    <p><strong>Created At:</strong> {format(new Date(donation.createdAt), 'MMM dd, yyyy')}</p>
                    <p><strong>Updated At:</strong> {format(new Date(donation.updatedAt), 'MMM dd, yyyy')}</p>
                    {donation.confirmedAt && (
                        <p><strong>Confirmed At:</strong> {format(new Date(donation.confirmedAt), 'MMM dd, yyyy')}</p>
                    )}
                </CardContent>
            </Card>
            {isDonor && donation.status === 'PENDING' && (
                <Button variant="destructive" onClick={handleCancel} disabled={mutation.isPending}>
                    {mutation.isPending ? 'Cancelling...' : 'Cancel Donation'}
                </Button>
            )}
        </div>
    );
}