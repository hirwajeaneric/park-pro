'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { OpportunityApplicationResponse } from '@/types';


export default function ApplicationDetailsVisitor({ application }: { application: OpportunityApplicationResponse }) {
    return (
        <div className="space-y-6">
            <div className="flex w-full items-center justify-between">
                {/* <h2 className="text-xl font-semibold">Application Details</h2> */}
                {/* <Button variant="outline" asChild>
                    <Link href="/accounts/applications">Back to Applications</Link>
                </Button> */}
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>
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
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                    <p><strong>Attachment:</strong>{' '}
                        <a href={application.applicationLetterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            Cover Letter and CV/ Application Letter
                        </a>
                    </p>
                    {application.approvalMessage && (
                        <p><strong>Approval Message:</strong> {application.approvalMessage}</p>
                    )}
                    {application.rejectionReason && (
                        <p><strong>Rejection Reason:</strong> {application.rejectionReason}</p>
                    )}
                    <p><strong>Created At:</strong> {format(new Date(application.createdAt), 'MMM dd, yyyy')}</p>
                    <p><strong>Updated At:</strong> {format(new Date(application.updatedAt), 'MMM dd, yyyy')}</p>
                </CardContent>
            </Card>
        </div>
    );
}