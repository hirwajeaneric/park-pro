"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Opportunity } from '@/types';

export default function OpportunityDetails({ opportunity }: { opportunity: Opportunity }) {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm capitalize">
                {opportunity.type.toLowerCase()}
              </span>
              <span className="text-gray-500 text-sm">
                Posted: {new Date(opportunity.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-lg mb-4">{opportunity.description}</p>
            {opportunity.details && (
              <div dangerouslySetInnerHTML={{ __html: opportunity.details }} />
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/opportunities/${opportunity.id}/apply`} className="w-full sm:w-auto">
              <Button className="w-full">Apply Now</Button>
            </Link>
            <Link href="/opportunities" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Back to Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}