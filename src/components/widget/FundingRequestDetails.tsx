/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updateFundingRequest, deleteFundingRequest, listBudgetsByPark, listBudgetCategoriesByBudget } from '@/lib/api';
import { FundingRequestResponse, Budget } from '@/types';
import { z } from 'zod';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import ReceiptGenerator from '@/components/ui/receipt-generator';

const UpdateFundingRequestSchema = z.object({
  requestedAmount: z.coerce.number().positive('Requested amount must be positive'),
  requestType: z.enum(['EXTRA_FUNDS', 'EMERGENCY_RELIEF'], { message: 'Select a valid request type' }),
  reason: z.string().min(1, 'Reason is required'),
  parkId: z.string().min(1, 'Park ID is required'),
  budgetId: z.string().min(1, 'Budget is required'),
  budgetCategoryId: z.string().min(1, 'Budget category is required'),
});

type UpdateFundingRequestFormData = z.infer<typeof UpdateFundingRequestSchema>;

export default function FundingRequestDetails({ request }: { request: FundingRequestResponse }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [parkId, setParkId] = useState<string | null>(null);
  const [parkDataError, setParkDataError] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Fetch parkId from localStorage
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

  // Fetch budgets for the park
  const { data: budgets = [], isLoading: budgetsLoading, error: budgetsError } = useQuery({
    queryKey: ['budgets', parkId],
    queryFn: () => listBudgetsByPark(parkId!),
    enabled: !!parkId,
  });

  // Fetch budget categories for the selected budget
  const { data: budgetCategories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['budgetCategories', request.budgetId],
    queryFn: () => listBudgetCategoriesByBudget(request.budgetId),
    enabled: !!request.budgetId,
  });

  const form = useForm<UpdateFundingRequestFormData>({
    resolver: zodResolver(UpdateFundingRequestSchema),
    defaultValues: {
      requestedAmount: request.requestedAmount,
      requestType: request.requestType,
      reason: request.reason,
      parkId: request.parkId || parkId || '',
      budgetId: request.budgetId,
      budgetCategoryId: request.budgetCategoryId || '',
    },
  });

  // Update form defaults when parkId changes
  useEffect(() => {
    if (parkId) {
      form.setValue('parkId', parkId);
    }
  }, [parkId, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateFundingRequestFormData) =>
      updateFundingRequest(request.id, {
        parkId: data.parkId,
        requestedAmount: data.requestedAmount,
        requestType: data.requestType,
        reason: data.reason,
        budgetId: data.budgetId,
        budgetCategoryId: data.budgetCategoryId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding-requests', request.budgetId] });
      toast.success('Funding request updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update funding request');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFundingRequest(request.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding-requests', request.budgetId] });
      toast.success('Funding request deleted successfully');
      router.push(`/finance/funding-requests`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete funding request');
    },
  });

  const onSubmit = (data: UpdateFundingRequestFormData) => {
    if (!data.budgetCategoryId) {
      toast.error('Please select a budget category.');
      return;
    }
    updateMutation.mutate(data);
  };

  const receiptData = {
    id: request.id,
    type: 'FUNDING_REQUEST' as const,
    title: 'Funding Request Receipt',
    amount: request.requestedAmount,
    currency: request.currency,
    status: request.status,
    parkName: request.parkName,
    category: request.budgetCategoryName,
    reason: request.reason,
    createdAt: request.createdAt,
    approvedAt: request.approvedAt || undefined,
    approvedAmount: request.approvedAmount || undefined,
    receiptNumber: `FR-${request.id.slice(0, 8).toUpperCase()}`,
  };

  if (parkDataError) {
    return <p className="text-red-500">{parkDataError}</p>;
  }

  if (!parkId || budgetsLoading || categoriesLoading) {
    return <p>Loading...</p>;
  }

  if (budgetsError) {
    return <p className="text-red-500">Failed to load budgets: {budgetsError.message}</p>;
  }

  if (categoriesError) {
    return <p className="text-red-500">Failed to load budget categories: {categoriesError.message}</p>;
  }

  if (budgets.length === 0) {
    return (
      <p className="text-red-500">
        No budgets found. Please create a budget first.
      </p>
    );
  }

  if (budgetCategories.length === 0) {
    return (
      <p className="text-red-500">
        No budget categories found for the selected budget. Please create categories first.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Funding Request Details</h1>
        <div className="flex gap-2">
          {request.status === 'APPROVED' && (
            <Button 
              variant="outline" 
              onClick={() => setShowReceipt(!showReceipt)}
            >
              {showReceipt ? 'Hide Receipt' : 'View Receipt'}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/finance/funding-requests`)}>
            Back to Funding Requests
          </Button>
        </div>
      </div>

      {showReceipt && request.status === 'APPROVED' && (
        <Card>
          <CardHeader>
            <CardTitle>Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <ReceiptGenerator data={receiptData} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Request #{request.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Requested Amount:</strong> {request.currency} {request.requestedAmount.toFixed(2)}</p>
          <p><strong>Approved Amount:</strong> {request.approvedAmount ? `${request.currency} ${request.approvedAmount.toFixed(2)}` : 'N/A'}</p>
          <p><strong>Type:</strong> <RequestTypeBadge type={request.requestType} /></p>
          <p><strong>Reason:</strong> {request.reason}</p>
          <p><strong>Status:</strong> <RequestStatusBadges status={request.status} /></p>
          {request.rejectionReason && <p><strong>Rejection Reason:</strong> {request.rejectionReason}</p>}
          {/* <p><strong>Currency:</strong> {request.currency}</p> */}
          <p><strong>Created At:</strong> {format(new Date(request.createdAt), 'MMM dd, yyyy')}</p>
          <p><strong>Updated At:</strong> {format(new Date(request.updatedAt), 'MMM dd, yyyy')}</p>
          {request.approvedAt && <p><strong>Approved At:</strong> {format(new Date(request.approvedAt), 'MMM dd, yyyy')}</p>}
          {/* <p><strong>Park ID:</strong> {request.parkId}</p> */}
          {/* <p><strong>Budget ID:</strong> {request.budgetId}</p> */}
          {/* <p><strong>Budget Category ID:</strong> {request.budgetCategoryId}</p> */}
          
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Update Funding Request</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="budgetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a budget" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgets.map((budget: Budget) => (
                          <SelectItem key={budget.id} value={budget.id}>
                            Fiscal Year {budget.fiscalYear}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budgetCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a budget category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgetCategories.map((category: { id: string; name: string }) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requestedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested Amount ({request.currency})</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Enter requested amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select request type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EXTRA_FUNDS">Extra Funds</SelectItem>
                        <SelectItem value="EMERGENCY_RELIEF">Emergency Relief</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter reason for funding request" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button type="submit" disabled={updateMutation.isPending || budgets.length === 0 || budgetCategories.length === 0}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Request'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Request'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

const RequestStatusBadges = ({ status }: { status: string }) => {
  if (status === 'PENDING') {
    return <Badge variant="default">Pending</Badge>;
  } else if (status === 'REJECTED') {
    return <Badge variant="destructive">Rejected</Badge>;
  } else if (status === 'APPROVED') {
    return <Badge variant="success">Approved</Badge>;
  }
  return null;
};

const RequestTypeBadge = ({ type }: { type: string }) => {
  if (type === 'EXTRA_FUNDS') {
    return <Badge variant="secondary">Extra Funds</Badge>;
  } else if (type === 'EMERGENCY_RELIEF') {
    return <Badge variant="warning">Emergency Relief</Badge>;
  }
  return null;
};