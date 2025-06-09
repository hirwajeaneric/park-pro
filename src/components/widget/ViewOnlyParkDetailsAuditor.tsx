'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import ListAuditorBookingsTable from '../tables/ListAuditorBookingsTable';
import AuditorDonationsTable from '../tables/AuditorDonationsTable';
import { Card as MuiCard, Typography, Box, LinearProgress, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { AuditResponse, Park } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import AuditorParkUsers from './AuditorParkUsers';
import ListBudgetsTableAuditor from '../tables/ListBudgetsTableAuditor';
import ExpenseDisplayAuditor from './ExpenseDisplayAuditor';
import WithdrawRequestDisplayAuditor from './WithdrawRequestDisplayAuditor';
import FundingRequestsTabsAuditor from './FundingRequestsTabsAuditor';
import { Button } from '../ui/button';
import { createAudit, updateAuditProgress } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';

const AuditStatsCard = ({ title, value, icon, color }: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string
}) => (
  <MuiCard sx={{
    p: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: `${color}15`,
    border: `1px solid ${color}40`,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 4px 20px ${color}30`
    }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{
        mr: 1,
        color: color,
        display: 'flex',
        alignItems: 'center'
      }}>
        {icon}
      </Box>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 'auto' }}>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color }}>
        {typeof value === 'number' ? value.toFixed(1) : value}%
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={typeof value === 'number' ? Math.min(value, 100) : 0}
      sx={{
        mt: 1,
        height: 6,
        borderRadius: 3,
        bgcolor: `${color}20`,
        '& .MuiLinearProgress-bar': {
          bgcolor: color
        }
      }}
    />
  </MuiCard>
);

export default function ViewOnlyParkDetailsAuditor({ park, audit }: { park: Park, audit?: AuditResponse | null }) {
  const [isLoading, setIsLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  const closeAudit = async () => {
    try {
      setIsLoading(true);
      if (!audit?.id) {
        toast.error('No active audit to close');
        return;
      }

      await updateAuditProgress(audit.id, {
        auditProgress: 'COMPLETED'
      });

      toast.success('Audit closed successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to close audit: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const openAudit = async () => {
    try {
      setIsLoading(true);
      if (!park?.id) {
        toast.error('Park information is required to create an audit');
        return;
      }

      await createAudit({
        parkId: park.id,
        auditYear: currentYear,
      });

      toast.success('Audit opened successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to open audit: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNoAuditState = () => (
    <Box sx={{
      mt: 3,
      p: 4,
      textAlign: 'center',
      bgcolor: '#f8f9fa',
      borderRadius: 2,
      border: '1px dashed #dee2e6'
    }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#495057' }}>
        No Active Audit for {currentYear}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#6c757d' }}>
        Start a new audit to evaluate expenses and withdraw requests for this park.
        The audit will help track and verify financial transactions throughout the year.
      </Typography>
      <Button
        variant="default"
        onClick={openAudit}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        {isLoading ? (
          <>
            <span className="mr-2">Processing...</span>
            <span className="animate-spin">⌛</span>
          </>
        ) : (
          <>
            <span className="mr-2">Start {currentYear} Audit</span>
            <span>📋</span>
          </>
        )}
      </Button>
    </Box>
  );

  const renderAuditStats = () => {
    if (!audit) return null;

    return (
      <Box sx={{ }}>
        <Typography variant="h6">
          Audit Statistics for {audit.auditYear}
        </Typography>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Chip
            label={`Status: ${audit.auditProgress === 'COMPLETED' ? 'COMPLETED' : audit.auditProgress === 'IN_PROGRESS' ? 'IN PROGRESS' : 'NOT STARTED'}`}
            color={audit.auditProgress === 'COMPLETED' ? 'success' :
              audit.auditProgress === 'IN_PROGRESS' ? 'warning' : 'default'}
            sx={{ mt: 2 }}
          />
          <div className="flex gap-20">
            <Button
              variant="destructive"
              className='cursor-pointer'
              onClick={closeAudit}
              disabled={isLoading || audit.auditProgress === 'COMPLETED'}
            >
              {isLoading ? 'Processing...' : 'Close Audit'}
            </Button>
          </div>
        </Box>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <AuditStatsCard
              title="Passed"
              value={audit.percentagePassed ?? 0}
              icon={<CheckCircleIcon />}
              color="#2e7d32"
            />
          </div>
          <div>
            <AuditStatsCard
              title="Failed"
              value={audit.percentageFailed ?? 0}
              icon={<ErrorIcon />}
              color="#d32f2f"
            />
          </div>
          <div>
            <AuditStatsCard
              title="Unjustified"
              value={audit.percentageUnjustified ?? 0}
              icon={<HelpIcon />}
              color="#ed6c02"
            />
          </div>
          <div>
            <AuditStatsCard
              title="Total Score"
              value={audit.totalPercentage ?? 0}
              icon={<AssessmentIcon />}
              color="#1976d2"
            />
          </div>
        </div>
      </Box>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <p><strong>Name:</strong> {park?.name ?? 'N/A'}</p>
          <p><strong>Location:</strong> {park?.location ?? 'N/A'}</p>
          <p><strong>Description:</strong> {park?.description ?? 'N/A'}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {audit ? renderAuditStats() : renderNoAuditState()}
          </div>

          <Tabs defaultValue="users" className="w-full mt-4">
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
                  <AuditorParkUsers parkId={park?.id ?? ''} />
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
                  <ListBudgetsTableAuditor parkId={park?.id ?? ''} />
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
                  <ExpenseDisplayAuditor parkId={park?.id ?? ''} />
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
                  <WithdrawRequestDisplayAuditor parkId={park?.id ?? ''} />
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
                  <FundingRequestsTabsAuditor parkId={park?.id ?? ''} />
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
                  <AuditorDonationsTable parkId={park?.id ?? ''} />
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
                  <ListAuditorBookingsTable parkId={park?.id ?? ''} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}