/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { listBudgetsByPark, listBudgetExpenses, listBudgetCategoriesByBudget, getExpensesByBudgetCategory, getIncomeStreamsByBudget } from "@/lib/api";
import { BudgetResponse, Expense, IncomeStreamResponse } from "@/types";

// Colors for the charts
const COLORS = ["#1f77b4", "#2ca02c", "#d62728", "#9467bd"];

// Helper to format currency
const formatCurrency = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Helper to calculate percentage change
const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper to aggregate expenses by month
const aggregateExpensesByMonth = (expenses: Expense[], fiscalYear: number) => {
  const monthlyData: { [key: string]: number } = {
    Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
  };
  expenses.forEach((expense) => {
    const date = new Date(expense.createdAt); // Assuming Expense has createdAt
    if (date.getFullYear() === fiscalYear) {
      const month = date.toLocaleString("en-US", { month: "short" });
      monthlyData[month] = (monthlyData[month] || 0) + Number(expense.amount);
    }
  });
  return Object.entries(monthlyData)
    .map(([month, amount]) => ({ month, amount: Number(amount) }))
    .filter((_, idx) => idx < 7); // Jan to Jul, as per the image
};

interface FinanceOverviewProps {
  initialFiscalYear: number;
}

export default function FinanceOverview({ initialFiscalYear }: FinanceOverviewProps) {
  const [fiscalYear, setFiscalYear] = useState(initialFiscalYear);

  // Get parkId from localStorage
  const parkId = useMemo(() => {
    try {
      const parkData = JSON.parse(localStorage.getItem("park-data") as string);
      return parkData?.id;
    } catch {
      return null;
    }
  }, []);

  // Fetch budgets for the park
  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ["budgets", parkId],
    queryFn: () => listBudgetsByPark(parkId),
    enabled: !!parkId,
  });

  // Find budgets for the current and previous fiscal years
  const currentBudget = budgets.find((b: BudgetResponse) => b.fiscalYear === fiscalYear);
  const previousBudget = budgets.find((b: BudgetResponse) => b.fiscalYear === fiscalYear - 1);

  // Fetch expenses for the current and previous budgets
  const { data: currentExpenses = [], isLoading: currentExpensesLoading } = useQuery({
    queryKey: ["expenses", currentBudget?.id],
    queryFn: () => listBudgetExpenses(currentBudget?.id),
    enabled: !!currentBudget,
  });

  const { data: previousExpenses = [], isLoading: previousExpensesLoading } = useQuery({
    queryKey: ["expenses", previousBudget?.id],
    queryFn: () => listBudgetExpenses(previousBudget?.id),
    enabled: !!previousBudget,
  });

  // Fetch budget categories for the current budget
  const { data: budgetCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["budgetCategories", currentBudget?.id],
    queryFn: () => listBudgetCategoriesByBudget(currentBudget?.id),
    enabled: !!currentBudget,
  });

  // Fetch expenses for each category
  const categoryExpensesQueries = useQuery({
    queryKey: ["categoryExpenses", currentBudget?.id],
    queryFn: async () => {
      const categoryExpenses = await Promise.all(
        budgetCategories.map(async (category: any) => {
          const expenses = await getExpensesByBudgetCategory(category.id);
          const total = expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
          return { name: category.name, value: total };
        })
      );
      return categoryExpenses;
    },
    enabled: !!budgetCategories.length,
  });

  // Fetch income streams for the current budget
  const { data: incomeStreams = [], isLoading: incomeStreamsLoading } = useQuery({
    queryKey: ["incomeStreams", currentBudget?.id],
    queryFn: () => getIncomeStreamsByBudget(currentBudget?.id),
    enabled: !!currentBudget,
  });

  // Process data
  const moneyOnAccount = currentBudget?.balance || 0;
  const previousMoneyOnAccount = previousBudget?.balance || 0;
  const moneyOnAccountChange = calculatePercentageChange(moneyOnAccount, previousMoneyOnAccount);

  const moneySpent = currentExpenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
  const previousMoneySpent = previousExpenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
  const moneySpentChange = calculatePercentageChange(moneySpent, previousMoneySpent);

  const monthlyUsageThisYear = aggregateExpensesByMonth(currentExpenses, fiscalYear);
  const monthlyUsageLastYear = aggregateExpensesByMonth(previousExpenses, fiscalYear - 1);
  const monthlyUsageData = monthlyUsageThisYear.map((item, idx) => ({
    month: item.month,
    thisYear: item.amount,
    lastYear: monthlyUsageLastYear[idx]?.amount || 0,
  }));

  const expenseCategoriesData = categoryExpensesQueries.data || [];

  // Normalize income stream percentages to sum to 100%
  const totalPercentage = incomeStreams.reduce((sum: number, stream: IncomeStreamResponse) => sum + stream.percentage, 0);
  const incomeStreamsData = incomeStreams.map((stream: IncomeStreamResponse) => ({
    name: stream.name,
    value: totalPercentage ? (stream.percentage / totalPercentage) * 100 : 0,
  }));

  const isLoading = budgetsLoading || currentExpensesLoading || previousExpensesLoading || categoriesLoading || incomeStreamsLoading || categoryExpensesQueries.isLoading;

  if (!parkId) {
    return <div className="text-destructive">Error: Park data not found in localStorage.</div>;
  }

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

      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-sm text-gray-500">Money on Account</h2>
          <p className="text-3xl font-bold">{formatCurrency(moneyOnAccount)}</p>
          <p className={`text-sm ${moneyOnAccountChange >= 0 ? "text-green-500" : "text-red-500"}`}>
            {moneyOnAccountChange >= 0 ? "+" : ""}{moneyOnAccountChange.toFixed(1)}%
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-sm text-gray-500">Money Spent</h2>
          <p className="text-3xl font-bold">{formatCurrency(moneySpent)}</p>
          <p className={`text-sm ${moneySpentChange >= 0 ? "text-green-500" : "text-red-500"}`}>
            {moneySpentChange >= 0 ? "+" : ""}{moneySpentChange.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Monthly Usage Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Monthly Usage</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyUsageData}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="thisYear" name="This Year" stroke="#000" />
              <Line type="monotone" dataKey="lastYear" name="Last Year" stroke="#000" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Expense Categories and Income Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expense Categories Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Expense Categories</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseCategoriesData}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#8884d8">
                  {expenseCategoriesData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Income Streams Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Income Streams</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeStreamsData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    {incomeStreamsData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="ml-4">
                {incomeStreamsData.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center mb-2">
                    <div
                      className="w-4 h-4 mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>
                      {entry.name}: {entry.value.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}