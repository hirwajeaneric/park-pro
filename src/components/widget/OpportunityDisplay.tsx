'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getOpportunitiesByParkId } from '@/lib/api';
import { Opportunity } from '@/types';

export default function OpportunityDisplay() {
  const router = useRouter();

  // Safely parse parkId from localStorage
  let parkId: string | null = null;
  try {
    const parkData = localStorage.getItem('park-data');
    if (parkData) {
      parkId = JSON.parse(parkData).id as string;
    }
  } catch {
    toast.error('Invalid park data. Please try again.');
  }

  // Fetch opportunities for the park
  const { data: opportunities = [], isLoading: isOpportunitiesLoading } = useQuery({
    queryKey: ['opportunities', parkId],
    queryFn: () => getOpportunitiesByParkId(parkId!),
    enabled: !!parkId,
  });

  const columns: ColumnDef<Opportunity>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('type')}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('status') === 'OPEN' ? 'success' : 'secondary'}>
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      accessorKey: 'visibility',
      header: 'Visibility',
      cell: ({ row }) => (
        <Badge variant={row.getValue('visibility') === 'PUBLIC' ? 'default' : 'outline'}>
          {row.getValue('visibility')}
        </Badge>
      ),
    },
    {
      accessorKey: 'parkName',
      header: 'Park',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/manager/opportunity/${row.original.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      {!parkId ? (
        <p className="text-red-500">No park data found. Please log in again.</p>
      ) : isOpportunitiesLoading ? (
        <p>Loading opportunities...</p>
      ) : opportunities.length === 0 ? (
        <p>No opportunities found for this park.</p>
      ) : (
        <DataTable
          columns={columns}
          data={opportunities}
          isLoading={isOpportunitiesLoading}
          searchKey="title"
          filters={[
            {
              column: 'type',
              title: 'Type',
              options: [
                { label: 'Job', value: 'JOB' },
                { label: 'Volunteer', value: 'VOLUNTEER' },
                { label: 'Partnership', value: 'PARTNERSHIP' },
              ],
            },
            {
              column: 'status',
              title: 'Status',
              options: [
                { label: 'Open', value: 'OPEN' },
                { label: 'Closed', value: 'CLOSED' },
              ],
            },
            {
              column: 'visibility',
              title: 'Visibility',
              options: [
                { label: 'Public', value: 'PUBLIC' },
                { label: 'Private', value: 'PRIVATE' },
              ],
            },
          ]}
        />
      )}
    </>
  );
}