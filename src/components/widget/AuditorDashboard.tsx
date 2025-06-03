/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
    getParks,
    getBudgetsByFiscalYear,
    getFundingRequestsByFiscalYear,
    listExpensesByBudget,
    listWithdrawRequestsByBudget,
    getParkById,
} from '@/lib/api';
import { Park, BudgetByFiscalYearResponse, FundingRequestResponse, Expense, WithdrawRequest } from '@/types';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

interface AuditorDashboardProps {
    initialParks: Park[];
    initialBudgets: BudgetByFiscalYearResponse[];
    initialFundingRequests: FundingRequestResponse[];
    initialExpenses: Expense[];
    initialWithdrawRequests: WithdrawRequest[];
    initialFiscalYear: number;
}

export default function AuditorDashboard({
    initialParks,
    initialBudgets,
    initialFundingRequests,
    initialExpenses,
    initialWithdrawRequests,
    initialFiscalYear,
}: AuditorDashboardProps) {
    const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(initialFiscalYear);

    // Fetch parks
    const { data: parkData, isLoading: parksLoading } = useQuery({
        queryKey: ['parks'],
        queryFn: () => getParks(0, 100),
        initialData: initialParks,
    });
    const { content: parks = initialParks, ...others } = parkData;

    // Fetch budgets
    const { data: budgets = initialBudgets, isLoading: budgetsLoading } = useQuery({
        queryKey: ['budgets', selectedFiscalYear],
        queryFn: () => getBudgetsByFiscalYear(selectedFiscalYear),
        initialData: initialBudgets,
    });

    // Fetch funding requests
    const { data: fundingRequests = initialFundingRequests, isLoading: fundingRequestsLoading } = useQuery({
        queryKey: ['funding-requests', selectedFiscalYear],
        queryFn: () => getFundingRequestsByFiscalYear(selectedFiscalYear),
        initialData: initialFundingRequests,
    });

    // Fetch expenses and withdraw requests for each budget
    const { data: expenses = initialExpenses, isLoading: expensesLoading } = useQuery({
        queryKey: ['expenses', selectedFiscalYear, budgets.map((b) => b.budgetId).join(',')],
        queryFn: async () => {
            const expensePromises = budgets
                .filter((b) => b.budgetId)
                .map((b) => listExpensesByBudget(b.budgetId!));
            return (await Promise.all(expensePromises)).flat();
        },
        initialData: initialExpenses,
        enabled: budgets.length > 0,
    });

    const { data: withdrawRequests = initialWithdrawRequests, isLoading: withdrawRequestsLoading } = useQuery({
        queryKey: ['withdraw-requests', selectedFiscalYear, budgets.map((b) => b.budgetId).join(',')],
        queryFn: async () => {
            const withdrawPromises = budgets
                .filter((b) => b.budgetId)
                .map((b) => listWithdrawRequestsByBudget(b.budgetId!));
            return (await Promise.all(withdrawPromises)).flat();
        },
        initialData: initialWithdrawRequests,
        enabled: budgets.length > 0,
    });

    // Fetch park names
    const uniqueParkIds = Array.from(new Set([
        ...budgets.map((b) => b.parkId),
        ...fundingRequests.map((fr) => fr.parkId),
        ...expenses.map((e) => e.parkId),
        ...withdrawRequests.map((wr) => wr.parkId),
    ]));

    const parkQueries = uniqueParkIds.map((parkId) =>
        () => getParkById(parkId)
    );


    // Fiscal year dropdown options
    const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

    // Summary cards data
    const totalParks = parks.length;
    const totalBudget = budgets.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalWithdrawRequests = withdrawRequests.reduce((sum, wr) => sum + wr.amount, 0);

    // Chart data
    // Budget Usage Pie Chart
    const budgetUsageData = {
        labels: budgets.map((b) => b.parkName),
        datasets: [
            {
                label: 'Allocated Amount',
                data: budgets.map((b) => b.totalAmount || 0),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            },
            {
                label: 'Used Amount',
                data: budgets.map((b) => (b.totalAmount || 0) - (b.balance || 0)),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            },
        ],
    };

    // Audit Status Bar Chart
    const auditStatusCounts = {
        expenses: { PASSED: 0, FAILED: 0, UNJUSTIFIED: 0 },
        withdraws: { PASSED: 0, FAILED: 0, UNJUSTIFIED: 0 },
    };

    expenses.forEach((e) => {
        if (e.auditStatus) auditStatusCounts.expenses[e.auditStatus]++;
    });

    expenses.forEach((wr) => {
        if (wr.auditStatus) auditStatusCounts.withdraws[wr.auditStatus]++;
    });

    const auditStatusData = {
        labels: ['PASSED', 'FAILED', 'UNJUSTIFIED'],
        datasets: [
            {
                label: 'Expenses',
                data: [
                    auditStatusCounts.expenses.PASSED,
                    auditStatusCounts.expenses.FAILED,
                    auditStatusCounts.expenses.UNJUSTIFIED,
                ],
                backgroundColor: '#36A2EB',
            },
            {
                label: 'Withdraw Requests',
                data: [
                    auditStatusCounts.withdraws.PASSED,
                    auditStatusCounts.withdraws.FAILED,
                    auditStatusCounts.withdraws.UNJUSTIFIED,
                ],
                backgroundColor: '#FF6384',
            },
        ],
    };

    // Funding Requests Trend Line Chart
    const fundingByMonth = fundingRequests.reduce((acc, fr) => {
        const date = new Date(fr.createdAt);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        if (!acc[monthYear]) {
            acc[monthYear] = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
        }
        acc[monthYear][fr.status]++;
        return acc;
    }, {} as Record<string, { PENDING: number; APPROVED: number; REJECTED: number }>);

    const months = Object.keys(fundingByMonth).sort();
    const fundingTrendData = {
        labels: months,
        datasets: [
            {
                label: 'Pending',
                data: months.map((m) => fundingByMonth[m].PENDING),
                borderColor: '#FFCE56',
                fill: false,
            },
            {
                label: 'Approved',
                data: months.map((m) => fundingByMonth[m].APPROVED),
                borderColor: '#36A2EB',
                fill: false,
            },
            {
                label: 'Rejected',
                data: months.map((m) => fundingByMonth[m].REJECTED),
                borderColor: '#FF6384',
                fill: false,
            },
        ],
    };

    // Table columns
    const fundingColumns: ColumnDef<FundingRequestResponse & { parkName: string }>[] = [
        { accessorKey: 'id', header: 'Request ID' },
        { accessorKey: 'parkName', header: 'Park Name' },
        { accessorKey: 'requestedAmount', header: 'Requested Amount', cell: ({ row }) => `$${row.getValue('requestedAmount')}` },
        { accessorKey: 'status', header: 'Status' },
        { accessorKey: 'reason', header: 'Reason', cell: ({ row }) => row.getValue('reason') || 'N/A' },
        { accessorKey: 'createdAt', header: 'Created At', cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy') },
        {
            id: 'actions',
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/auditor/funding-requests/${row.original.id}`}>
                        <Eye className="h-4 w-4" />
                    </Link>
                </Button>
            ),
        },
    ];

    const expenseColumns: ColumnDef<Expense & { parkName: string }>[] = [
        { accessorKey: 'id', header: 'Expense ID' },
        { accessorKey: 'parkName', header: 'Park Name' },
        { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => `XAF ${Number(row.getValue('amount')).toFixed(2)}` },
        { accessorKey: 'budgetCategoryName', header: 'Category' },
        { accessorKey: 'auditStatus', header: 'Audit Status' },
        { accessorKey: 'description', header: 'Description', cell: ({ row }) => row.getValue('description') || 'N/A' },
        { accessorKey: 'createdAt', header: 'Created At', cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy') },
        {
            id: 'actions',
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/auditor/expenses/${row.original.id}`}>
                        <Eye className="h-4 w-4" />
                    </Link>
                </Button>
            ),
        },
    ];

    const withdrawColumns: ColumnDef<WithdrawRequest & { parkName: string }>[] = [
        { accessorKey: 'id', header: 'Request ID' },
        { accessorKey: 'parkName', header: 'Park Name' },
        { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => `XAF ${Number(row.getValue('amount')).toFixed(2)}` },
        { accessorKey: 'budgetCategoryName', header: 'Category' },
        { accessorKey: 'auditStatus', header: 'Audit Status' },
        { accessorKey: 'reason', header: 'Reason', cell: ({ row }) => row.getValue('reason') || 'N/A' },
        { accessorKey: 'createdAt', header: 'Created At', cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy') },
        {
            id: 'actions',
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/auditor/withdraw-requests/${row.original.id}`}>
                        <Eye className="h-4 w-4" />
                    </Link>
                </Button>
            ),
        },
    ];

    const isLoading = parksLoading || budgetsLoading || fundingRequestsLoading || expensesLoading || withdrawRequestsLoading || parkQueries.some((q) => q.isLoading);

    return (
        <div className="space-y-6">
            {/* Fiscal Year Selector */}
            <div className="flex items-center gap-4">
                <label htmlFor="fiscalYear" className="font-medium">Fiscal Year:</label>
                <Select
                    value={selectedFiscalYear.toString()}
                    onValueChange={(value) => setSelectedFiscalYear(Number(value))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select fiscal year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Parks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalParks}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">XAF {totalBudget.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">XAF {totalExpenses.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Withdraw Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">XAF {totalWithdrawRequests.toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Budget Usage by Park</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Pie data={budgetUsageData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Audit Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Bar data={auditStatusData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Funding Requests Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Line data={fundingTrendData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                    </CardContent>
                </Card>
            </div>

            {/* Tables */}
            <Card>
                <CardHeader>
                    <CardTitle>Funding Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={fundingColumns}
                        data={fundingRequests}
                        isLoading={isLoading}
                        searchKey="id"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={expenseColumns}
                        data={expenses}
                        isLoading={isLoading}
                        searchKey="id"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Withdraw Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={withdrawColumns}
                        data={withdrawRequests}
                        isLoading={isLoading}
                        searchKey="id"
                    />
                </CardContent>
            </Card>
        </div>
    );
}