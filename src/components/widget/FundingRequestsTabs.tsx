/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { listBudgetsByPark } from '@/lib/api';
import { Budget } from '@/types';
import FundingRequestsTable from '@/components/tables/FundingRequestsTable';

export default function FundingRequestsTabs({ initialBudgets }: { initialBudgets: Budget[] }) {
  const [parkId, setParkId] = useState<string | null>(null);
  const [parkDataError, setParkDataError] = useState<string | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  useEffect(() => {
    const parkData = localStorage.getItem('park-data');
    if (parkData) {
      try {
        const parsed = JSON.parse(parkData);
        if (parsed.id) {
          setParkId(parsed.id);
        } else {
          setParkDataError('Park ID not found in park-data');
        }
      } catch (error) {
        setParkDataError('Failed to parse park-data');
      }
    } else {
      setParkDataError('No park data found. Please log in again.');
    }
  }, []);

  const { data: budgets = initialBudgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', parkId],
    queryFn: () => listBudgetsByPark(parkId!),
    enabled: !!parkId,
  });

  // Sort budgets by fiscalYear descending (latest first)
  const sortedBudgets = [...budgets].sort((a, b) => b.fiscalYear - a.fiscalYear);

  // Set default selected budget to the latest one
  useEffect(() => {
    if (sortedBudgets.length > 0 && !selectedBudgetId) {
      setSelectedBudgetId(sortedBudgets[0].id);
    }
  }, [sortedBudgets, selectedBudgetId]);

  if (parkDataError) {
    return <p className="text-red-500">{parkDataError}</p>;
  }

  if (!parkId || budgetsLoading) {
    return <p>Loading...</p>;
  }

  if (sortedBudgets.length === 0) {
    return <p className="text-muted-foreground">No budgets available for this park.</p>;
  }

  return (
    <Tabs value={selectedBudgetId || sortedBudgets[0].id} onValueChange={setSelectedBudgetId} className="space-y-4">
      <TabsList className="flex flex-wrap">
        {sortedBudgets.map((budget) => (
          <TabsTrigger key={budget.id} value={budget.id} className="px-4 py-2">
            FY {budget.fiscalYear}
          </TabsTrigger>
        ))}
      </TabsList>
      {sortedBudgets.map((budget) => (
        <TabsContent key={budget.id} value={budget.id}>
          <FundingRequestsTable budgetId={budget.id} />
        </TabsContent>
      ))}
    </Tabs>
  );
}