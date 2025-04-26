'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns'
import Link from 'next/link';
import { updateOpportunityApplicationStatus } from '@/lib/api';
import { OpportunityApplicationResponse } from '@/types';
import { useRouter } from 'next/navigation';

export default function ApplicationDetails({ application }: { application: OpportunityApplicationResponse }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Mutation to update status
  const mutation = useMutation({
    mutationFn: (status: 'SUBMITTED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED') =>
      updateOpportunityApplicationStatus(application.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application status updated successfully');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update application status');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-xl font-semibold">Application Details</h2>
        <Button variant="outline" asChild>
          <Link href="/finance/applications">Back to Applications</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{application.firstName} {application.lastName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Email:</strong> {application.email}</p>
          <p><strong>Opportunity ID:</strong> {application.opportunityId}</p>
          <p><strong>Application Letter:</strong> <a href={application.applicationLetterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Letter</a></p>
          <p><strong>Status:</strong> <Badge
            variant={
              application.status === 'ACCEPTED' ? 'success' :
              application.status === 'REJECTED' ? 'destructive' :
              application.status === 'REVIEWED' ? 'warning' : 'default'
            }
          >{application.status}</Badge></p>
          <p><strong>Created At:</strong> {format(new Date(application.createdAt), 'MMM dd, yyyy')}</p>
          <p><strong>Updated At:</strong> {format(new Date(application.updatedAt), 'MMM dd, yyyy')}</p>
          <div className="mt-4">
            <label className="block text-sm font-medium">Update Status</label>
            <Select
              onValueChange={(value: 'SUBMITTED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED') => mutation.mutate(value)}
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
        </CardContent>
      </Card>
    </div>
  );
}