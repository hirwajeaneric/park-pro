import DonationsTable from '@/components/tables/DonationsTable';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Donations - Finance Dashboard',
  description: 'List of donations for your park by fiscal year',
};

export default function DonationsPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Donations</h1>
        <DonationsTable />
      </div>
    </ProtectedRoute>
  );
}