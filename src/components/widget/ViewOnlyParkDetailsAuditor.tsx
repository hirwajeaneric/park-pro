'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';
import { Park } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ExpenseDisplayAuditor from './ExpenseDisplayAuditor';
import WithdrawRequestDisplayAuditor from './WithdrawRequestDisplayAuditor';
import FundingRequestsTabsAuditor from './FundingRequestsTabsAuditor';
import AuditorParkUsers from './AuditorParkUsers';
import ListBudgetsTableAuditor from '../tables/ListBudgetsTableAuditor';
import ListAuditorBookingsTable from '../tables/ListAuditorBookingsTable';
import AuditorDonationsTable from '../tables/AuditorDonationsTable';
import ReportExport from '@/components/reports/ReportExport';

export default function ViewOnlyParkDetailsAuditor({ park }: { park: Park }) {
  return (
    <div className="space-y-6">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-xl font-semibold">Park Details</h2>
        <Button variant="outline" asChild>
          <Link href="/auditor/park">Back to Parks</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{park.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Location:</strong> {park.location}</p>
          <p><strong>Created At:</strong> {format(new Date(park.createdAt), 'MMM dd, yyyy')}</p>
        </CardContent>
      </Card>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="withdraw-requests">Withdraw Requests</TabsTrigger>
          <TabsTrigger value="funds-requests">Request for Funds</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        
        {/* Users  */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Users Associated to the Park
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* <ReportExport
                title="Park Users Report"
                description="List of all users associated with this park"
                columns={[
                  { label: 'First Name', value: 'firstName' },
                  { label: 'Last Name', value: 'lastName' },
                  { label: 'Email', value: 'email' },
                  { label: 'Role', value: 'role' },
                ]}
                data={[]} // Data will be provided by AuditorParkUsers component
                fileName="park-users-report"
              /> */}
              <AuditorParkUsers parkId={park.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgets  */}
        <TabsContent value="budgets">
          <Card>
            <CardHeader>
              <CardTitle>Budgets</CardTitle>
              <CardDescription>
                All park budgets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* <ReportExport
                title="Park Budgets Report"
                description="List of all budgets for this park"
                columns={[
                  { label: 'Fiscal Year', value: 'fiscalYear' },
                  { label: 'Total Amount', value: 'totalAmount' },
                  { label: 'Balance', value: 'balance' },
                  { label: 'Status', value: 'status' },
                  { label: 'Created At', value: 'createdAt' },
                ]}
                data={[]} // Data will be provided by ListBudgetsTableAuditor component
                fileName="park-budgets-report"
              /> */}
              <ListBudgetsTableAuditor parkId={park.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses  */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>
                All park expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* <ReportExport
                title="Park Expenses Report"
                description="List of all expenses for this park"
                columns={[
                  { label: 'Amount', value: 'amount' },
                  { label: 'Description', value: 'description' },
                  { label: 'Category', value: 'budgetCategoryName' },
                  { label: 'Audit Status', value: 'auditStatus' },
                  { label: 'Created At', value: 'createdAt' },
                ]}
                data={[]} // Data will be provided by ExpenseDisplayAuditor component
                fileName="park-expenses-report"
              /> */}
              <ExpenseDisplayAuditor parkId={park.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdraw Requests  */}
        <TabsContent value="withdraw-requests">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Requests</CardTitle>
              <CardDescription>
                Requests to withdraw huge sums of money
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* <ReportExport
                title="Withdraw Requests Report"
                description="List of all withdraw requests for this park"
                columns={[
                  { label: 'Amount', value: 'amount' },
                  { label: 'Reason', value: 'reason' },
                  { label: 'Category', value: 'budgetCategoryName' },
                  { label: 'Status', value: 'status' },
                  { label: 'Audit Status', value: 'auditStatus' },
                  { label: 'Created At', value: 'createdAt' },
                ]}
                data={[]} // Data will be provided by WithdrawRequestDisplayAuditor component
                fileName="withdraw-requests-report"
              /> */}
              <WithdrawRequestDisplayAuditor parkId={park.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Request for Funds  */}
        <TabsContent value="funds-requests">
          <Card>
            <CardHeader>
              <CardTitle>Requests for funds</CardTitle>
              <CardDescription>
                Requests for extra funds and emergency funds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* <ReportExport
                title="Funding Requests Report"
                description="List of all funding requests for this park"
                columns={[
                  { label: 'Amount', value: 'requestedAmount' },
                  { label: 'Type', value: 'type' },
                  { label: 'Status', value: 'status' },
                  { label: 'Reason', value: 'reason' },
                  { label: 'Created At', value: 'createdAt' },
                ]}
                data={[]} // Data will be provided by FundingRequestsTabsAuditor component
                fileName="funding-requests-report"
              /> */}
              <FundingRequestsTabsAuditor parkId={park.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donations  */}
        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>Donations</CardTitle>
              <CardDescription>
                Donations for this park.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* <ReportExport
                title="Donations Report"
                description="List of all donations for this park"
                columns={[
                  { label: 'Amount', value: 'amount' },
                  { label: 'Donor Name', value: 'donorName' },
                  { label: 'Status', value: 'status' },
                  { label: 'Motive', value: 'motiveForDonation' },
                  { label: 'Created At', value: 'createdAt' },
                ]}
                data={[]} // Data will be provided by AuditorDonationsTable component
                fileName="donations-report"
              /> */}
              <AuditorDonationsTable parkId={park.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>
                All bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* <ReportExport
                title="Bookings Report"
                description="List of all bookings for this park"
                columns={[
                  { label: 'Booking ID', value: 'id' },
                  { label: 'Amount', value: 'amount' },
                  { label: 'Visit Date', value: 'visitDate' },
                  { label: 'Status', value: 'status' },
                ]}
                data={[]} // Data will be provided by ListAuditorBookingsTable component
                fileName="bookings-report"
              /> */}
              <ListAuditorBookingsTable parkId={park.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}