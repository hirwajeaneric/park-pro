"use client";

import { useQuery } from '@tanstack/react-query';
import { getOpportunitiesByParkId } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Opportunity } from '@/types';

const OPPORTUNITY_TYPES = [
  { value: 'ALL', label: 'All Opportunities' },
  { value: 'JOB', label: 'Jobs' },
  { value: 'VOLUNTEER', label: 'Volunteer' },
  { value: 'PARTNERSHIP', label: 'PARTNERSHIP' },
  // { value: 'SERVICE', label: 'Services' },
];

export default function OpportunitiesList() {
  const [filter, setFilter] = useState('ALL');
  const parkId = process.env.NEXT_PUBLIC_PARK_ID!;

  const { data: opportunities, isLoading, error } = useQuery({
    queryKey: ['opportunities', parkId],
    queryFn: () => getOpportunitiesByParkId(parkId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const filteredOpportunities = opportunities?.filter((opp: { type: string; }) => 
    filter === 'ALL' || opp.type === filter
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Failed to load opportunities. Please try again.</p>
      </div>
    );
  }

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-semibold">Available Opportunities</h2>
          <div className="w-full md:w-64">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {OPPORTUNITY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities?.map((opportunity: Opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                <div className="text-sm text-gray-500 capitalize">{opportunity.type.toLowerCase()}</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">{opportunity.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(opportunity.createdAt).toLocaleDateString()}
                  </span>
                  <Link href={`/opportunities/${opportunity.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOpportunities?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No opportunities found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
}