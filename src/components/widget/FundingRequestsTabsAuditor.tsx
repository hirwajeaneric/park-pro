/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { listBudgetsByPark } from '@/lib/api';
import { Budget } from '@/types';
import FundingRequestsTable from '@/components/tables/FundingRequestsTable';

export default function FundingRequestsTabsAuditor({ parkId }: { parkId: string }) {
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
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