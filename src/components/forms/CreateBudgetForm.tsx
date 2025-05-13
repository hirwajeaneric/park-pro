'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { createBudget, createIncomeStream, getIncomeStreamsByParkAndFiscalYear } from '@/lib/api';
import { CreateBudgetForm as CreateBudgetFormTypes, IncomeStreamRequest } from '@/types';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CreateBudgetFormSchema = z.object({
  fiscalYear: z.coerce
    .number({ invalid_type_error: 'Fiscal year must be a number' })
    .int({ message: 'Fiscal year must be an integer' })
    .min(2000, { message: 'Fiscal year must be 2000 or later' })
    .max(2100, { message: 'Fiscal year must be 2100 or earlier' }),
  totalAmount: z.coerce
    .number({ invalid_type_error: 'Total amount must be a number' })
    .positive({ message: 'Total amount must be positive' })
    .max(1_000_000_000, { message: 'Total amount cannot exceed 1 billion' }),
  status: z.enum(['DRAFT', 'APPROVED', 'REJECTED']),
});

const IncomeStreamFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  percentage: z.coerce
    .number({ invalid_type_error: 'Percentage must be a number' })
    .positive({ message: 'Percentage must be positive' })
    .max(100, { message: 'Percentage cannot exceed 100%' }),
  totalContribution: z.coerce
    .number({ invalid_type_error: 'Total contribution must be a number' })
    .positive({ message: 'Total contribution must be positive' })
    .optional(),
});

type LocalIncomeStream = IncomeStreamRequest & { id: string };

export default function CreateBudgetForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Safely parse parkId from localStorage
  let parkId: string | null = null;
  try {
    const parkData = localStorage.getItem('park-data');
    if (parkData) {
      parkId = JSON.parse(parkData).id as string;
    }
  } catch {
    toast.error('Invalid park data. Please try again.');
  }

  // Budget form
  const budgetForm = useForm<CreateBudgetFormTypes>({
    resolver: zodResolver(CreateBudgetFormSchema),
    defaultValues: {
      fiscalYear: undefined,
      totalAmount: undefined,
      status: 'DRAFT',
    },
  });

  // Income stream form
  const incomeStreamForm = useForm<IncomeStreamRequest>({
    resolver: zodResolver(IncomeStreamFormSchema),
    defaultValues: {
      name: '',
      percentage: undefined,
      totalContribution: undefined,
    },
  });

  // Watch totalAmount and fiscalYear from budget form and percentage from income stream form
  const totalAmount = budgetForm.watch('totalAmount');
  const fiscalYear = budgetForm.watch('fiscalYear');
  const percentage = incomeStreamForm.watch('percentage');

  // Automatically calculate totalContribution when percentage or totalAmount changes
  useEffect(() => {
    if (percentage && totalAmount) {
      const calculatedContribution = (percentage / 100) * totalAmount;
      incomeStreamForm.setValue('totalContribution', Number(calculatedContribution.toFixed(2)));
    } else {
      incomeStreamForm.setValue('totalContribution', undefined);
    }
  }, [percentage, totalAmount, incomeStreamForm]);

  // Local state for income streams
  const [incomeStreams, setIncomeStreams] = useState<LocalIncomeStream[]>([]);
  const [editingIncomeStreamId, setEditingIncomeStreamId] = useState<string | null>(null);
  const [isLoadingIncomeStreams, setIsLoadingIncomeStreams] = useState(false);
  const [lastFetchedFiscalYear, setLastFetchedFiscalYear] = useState<number | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Fetch income streams based on fiscalYear or previous year
  useEffect(() => {
    if (!parkId) return;

    const targetFiscalYear = fiscalYear ? fiscalYear - 1 : new Date().getFullYear() - 1;

    // Prevent duplicate fetches
    if (lastFetchedFiscalYear === targetFiscalYear) return;

    setIsLoadingIncomeStreams(true);
    getIncomeStreamsByParkAndFiscalYear(parkId, targetFiscalYear)
      .then((response) => {
        const newStreams = response.map((stream) => ({
          id: crypto.randomUUID(), // Generate new IDs for local state
          name: stream.name,
          percentage: stream.percentage,
          totalContribution: totalAmount
            ? Number(((stream.percentage / 100) * totalAmount).toFixed(2))
            : stream.totalContribution,
        }));
        setIncomeStreams(newStreams);
        setLastFetchedFiscalYear(targetFiscalYear);
        if (newStreams.length > 0) {
          toast.info(`Pre-populated ${newStreams.length} income streams from fiscal year ${targetFiscalYear}`);
        } else {
          toast.info(`No income streams found for fiscal year ${targetFiscalYear}`);
        }
      })
      .catch((error) => {
        console.error('Error fetching income streams:', error);
        toast.error(`Failed to fetch income streams for fiscal year ${targetFiscalYear}`);
      })
      .finally(() => {
        setIsLoadingIncomeStreams(false);
      });
  }, [parkId, fiscalYear, totalAmount]);

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: async (data: CreateBudgetFormTypes) => {
      if (!parkId) {
        throw new Error('Park ID is required');
      }
      const budget = await createBudget(data, parkId);
      // Create income streams with error handling
      const errors: string[] = [];
      for (const stream of incomeStreams) {
        try {
          await createIncomeStream(budget.id, {
            name: stream.name,
            percentage: stream.percentage,
            totalContribution: stream.totalContribution,
          });
        } catch (error) {
          errors.push(`Failed to create income stream "${stream.name}": ${error.message}`);
        }
      }
      if (errors.length > 0) {
        throw new Error(`Some income streams failed to create:\n${errors.join('\n')}`);
      }
      return budget;
    },
    onSuccess: (budget) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget and income streams created successfully');
      router.push('/finance/budget');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create budget');
    },
  });

  // Validate income streams
  const validateIncomeStreams = (totalAmount: number | undefined): { valid: boolean; message?: string } => {
    if (!totalAmount) return { valid: false, message: 'Total amount is required' };
    const totalPercentage = incomeStreams.reduce((sum, stream) => sum + stream.percentage, 0);
    const totalContribution = incomeStreams.reduce(
      (sum, stream) => sum + (stream.totalContribution || (stream.percentage / 100) * totalAmount),
      0
    );
    if (totalPercentage !== 100 && incomeStreams.length > 0) {
      return { valid: false, message: 'Income stream percentages must sum to exactly 100%' };
    }
    if (incomeStreams.length > 0 && Math.abs(totalContribution - totalAmount) > 0.01) {
      return { valid: false, message: 'Income stream contributions must equal total amount' };
    }
    return { valid: true };
  };

  // Handle income stream form submission
  const onIncomeStreamSubmit = (data: IncomeStreamRequest) => {
    if (!totalAmount) {
      toast.error('Please enter the total budget amount first');
      return;
    }
    const calculatedContribution = (data.percentage / 100) * totalAmount;
    const newStream = {
      ...data,
      totalContribution: Number(calculatedContribution.toFixed(2)),
      id: editingIncomeStreamId || crypto.randomUUID(),
    };

    if (editingIncomeStreamId) {
      // Update existing income stream
      setIncomeStreams((prev) =>
        prev.map((stream) => (stream.id === editingIncomeStreamId ? newStream : stream))
      );
      setEditingIncomeStreamId(null);
      toast.success('Income stream updated');
    } else {
      // Add new income stream
      setIncomeStreams((prev) => [...prev, newStream]);
      toast.success('Income stream added');
    }
    incomeStreamForm.reset();
  };

  // Handle delete income stream
  const deleteIncomeStream = (id: string) => {
    setIncomeStreams((prev) => prev.filter((stream) => stream.id !== id));
    toast.success('Income stream removed');
  };

  // Handle edit income stream
  const editIncomeStream = (id: string) => {
    const stream = incomeStreams.find((s) => s.id === id);
    if (stream) {
      incomeStreamForm.reset(stream);
      setEditingIncomeStreamId(id);
    }
  };

  // Handle budget form submission with confirmation
  const onBudgetSubmit = (data: CreateBudgetFormTypes) => {
    const validation = validateIncomeStreams(data.totalAmount);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    if (incomeStreams.length === 0) {
      toast.error('At least one income stream is required');
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  // Handle reset income streams
  const resetIncomeStreams = () => {
    setIncomeStreams([]);
    setLastFetchedFiscalYear(null);
    toast.info('Cleared income streams. You can re-fetch or add new ones.');
  };

  // DataTable columns for income streams
  const columns: ColumnDef<LocalIncomeStream>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'percentage',
      header: 'Percentage (%)',
      cell: ({ row }) => `${row.getValue('percentage')}%`,
    },
    {
      accessorKey: 'totalContribution',
      header: 'Total Contribution (XAF)',
      cell: ({ row }) => {
        const value = row.getValue('totalContribution') as number;
        return `XAF ${value.toFixed(2)}`;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editIncomeStream(row.original.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteIncomeStream(row.original.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {!parkId ? (
        <p className="text-red-500">No park data found. Please log in again.</p>
      ) : (
        <>
          {/* Budget Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Budget Details</h2>
            <Form {...budgetForm}>
              <form onSubmit={budgetForm.handleSubmit(onBudgetSubmit)} className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={budgetForm.control}
                  name="fiscalYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiscal Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter fiscal year (e.g., 2025)"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          min="2000"
                          max="2100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={budgetForm.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount (XAF)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter total amount"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          min="0.01"
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createBudgetMutation.isPending || !parkId}
                  >
                    {createBudgetMutation.isPending ? 'Creating...' : 'Create Budget'}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push('/finance/budget')}
                  >
                    Back
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Income Streams Section */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold mb-4">Income Streams</h2>
              <CardDescription>
                Manage income streams for the new budget. Pre-populated streams from fiscal year
                {fiscalYear ? ` ${fiscalYear - 1}` : ` ${new Date().getFullYear() - 1}`} are templates and will be saved as new records for this budget. Total contribution is calculated based on percentage and total budget amount.
              </CardDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={resetIncomeStreams}
                disabled={isLoadingIncomeStreams}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Income Streams
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Form {...incomeStreamForm}>
                  <form
                    onSubmit={incomeStreamForm.handleSubmit(onIncomeStreamSubmit)}
                    className="space-y-4 gap-4 grid grid-cols-1 md:grid-cols-3"
                  >
                    <FormField
                      control={incomeStreamForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter income stream name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={incomeStreamForm.control}
                      name="percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Percentage (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter percentage"
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(e.target.value ? Number(e.target.value) : undefined)
                              }
                              min="0.01"
                              max="100"
                              step="0.01"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={incomeStreamForm.control}
                      name="totalContribution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Contribution (XAF)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Calculated automatically"
                              value={field.value ?? ''}
                              disabled
                              min="0.01"
                              step="0.01"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={createBudgetMutation.isPending || !totalAmount || isLoadingIncomeStreams}
                      >
                        {editingIncomeStreamId ? 'Update Income Stream' : 'Add Income Stream'}
                      </Button>
                      {editingIncomeStreamId && (
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => {
                            incomeStreamForm.reset();
                            setEditingIncomeStreamId(null);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
              <DataTable
                columns={columns}
                data={incomeStreams}
                isLoading={isLoadingIncomeStreams}
                searchKey="name"
              />
            </CardContent>
          </Card>

          {/* Confirmation Dialog */}
          <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Budget Submission</DialogTitle>
                <DialogDescription>
                  You are about to create a new budget for fiscal year {fiscalYear} with {incomeStreams.length} income streams.
                  Please review the details below:
                  <ul className="mt-2 list-disc pl-5">
                    {incomeStreams.map((stream) => (
                      <li key={stream.id}>
                        {stream.name}: {stream.percentage}% (XAF {stream.totalContribution.toFixed(2)})
                      </li>
                    ))}
                  </ul>
                  Total Percentage: {incomeStreams.reduce((sum, stream) => sum + stream.percentage, 0)}%
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setIsConfirmDialogOpen(false);
                    createBudgetMutation.mutate(budgetForm.getValues());
                  }}
                  disabled={createBudgetMutation.isPending}
                >
                  {createBudgetMutation.isPending ? 'Submitting...' : 'Confirm'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}