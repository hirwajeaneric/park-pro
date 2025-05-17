/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getParks, getBudgetsByFiscalYear } from "@/lib/api";
import { BudgetByFiscalYearResponse } from "@/types";

// Helper to format currency
const formatCurrency = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Helper to calculate percentage change
const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

interface GovernmentOverviewProps {
  initialFiscalYear: number;
}

export default function GovernmentOverview({ initialFiscalYear }: GovernmentOverviewProps) {
  const [fiscalYear, setFiscalYear] = useState(initialFiscalYear);

  // Fetch parks
  const { data: parksData, isLoading: parksLoading } = useQuery({
    queryKey: ["parks"],
    queryFn: () => getParks(0, 1000), // Fetch all parks in one go
  });

  // Fetch budgets for the current and previous fiscal years
  const { data: currentBudgets = [], isLoading: currentBudgetsLoading } = useQuery({
    queryKey: ["budgets", fiscalYear],
    queryFn: () => getBudgetsByFiscalYear(fiscalYear),
  });

  const { data: previousBudgets = [], isLoading: previousBudgetsLoading } = useQuery({
    queryKey: ["budgets", fiscalYear - 1],
    queryFn: () => getBudgetsByFiscalYear(fiscalYear - 1),
  });

  // Process data
  const parkCount = parksData?.totalElements || parksData?.content?.length || 0;

  const totalBudgetCurrent = currentBudgets.reduce((sum: number, budget: BudgetByFiscalYearResponse) => sum + (budget.totalAmount || 0), 0);
  const totalBudgetPrevious = previousBudgets.reduce((sum: number, budget: BudgetByFiscalYearResponse) => sum + (budget.totalAmount || 0), 0);
  const budgetChange = calculatePercentageChange(totalBudgetCurrent, totalBudgetPrevious);

  // Prepare chart data: Compare budgets across parks for the two years
  const chartData = parksData?.content?.map((park: any) => {
    const currentBudget = currentBudgets.find((b: BudgetByFiscalYearResponse) => b.parkId === park.id)?.totalAmount || 0;
    const previousBudget = previousBudgets.find((b: BudgetByFiscalYearResponse) => b.parkId === park.id)?.totalAmount || 0;
    return {
      parkName: park.name,
      [fiscalYear]: currentBudget,
      [fiscalYear - 1]: previousBudget,
    };
  }) || [];

  const isLoading = parksLoading || currentBudgetsLoading || previousBudgetsLoading;

  return (
    <div className="space-y-6">
      {/* Fiscal Year Selector */}
      <div className="flex justify-end">
        <select
          value={fiscalYear}
          onChange={(e) => setFiscalYear(Number(e.target.value))}
          className="border rounded px-2 py-1"
          aria-label="Select fiscal year"
        >
          {Array.from({ length: 5 }, (_, i) => initialFiscalYear - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-sm text-gray-500">Managed Parks</h2>
          <p className="text-3xl font-bold">{parkCount}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-sm text-gray-500">Budget for All Parks</h2>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold">{formatCurrency(totalBudgetCurrent)}</p>
            {/* <p className={`text-sm ${budgetChange >= 0 ? "text-green-500" : "text-red-500"}`}>
              {budgetChange >= 0 ? "+" : ""}{budgetChange.toFixed(1)}%
            </p> */}
          </div>
        </div>
      </div>

      {/* Budget Comparison Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Budget Comparison Across Parks</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <XAxis dataKey="parkName" angle={-45} textAnchor="end" height={70} />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey={fiscalYear} name={`${fiscalYear}`} fill="#1f77b4" />
              <Bar dataKey={fiscalYear - 1} name={`${fiscalYear - 1}`} fill="#2ca02c" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}