'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ColumnDef } from '@tanstack/react-table';
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
import { Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';
import {
  getIncomeStreamsByBudget,
  createIncomeStream,
  updateIncomeStream,
  deleteIncomeStream,
} from '@/lib/api';
import { Budget, IncomeStreamRequest, IncomeStreamResponse } from '@/types';

const IncomeStreamFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  percentage: z.coerce
    .number({ invalid_type_error: 'Percentage must be a number' })
    .positive({ message: 'Percentage must be positive' })
    .max(100, { message: 'Percentage cannot exceed 100%' }),
  totalContribution: z.coerce
    .number({ invalid_type_error: 'Total contribution must be a number' })
    .positive({ message: 'Total contribution must be positive' }),
});

export default function IncomeStreamsTable({ budget }: { budget: Budget }) {
//   const router = useRouter();
  const queryClient = useQueryClient();
  const [editingIncomeStreamId, setEditingIncomeStreamId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch income streams
  const { data: incomeStreams = [], isLoading: isIncomeStreamsLoading } = useQuery({
    queryKey: ['incomeStreams', budget.id],
    queryFn: () => getIncomeStreamsByBudget(budget.id),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to load income streams');
    },
  });

  // Income stream form
  const form = useForm<IncomeStreamRequest>({
    resolver: zodResolver(IncomeStreamFormSchema),
    defaultValues: {
      name: '',
      percentage: undefined,
      totalContribution: undefined,
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: IncomeStreamRequest) => createIncomeStream(budget.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeStreams', budget.id] });
      toast.success('Income stream added successfully');
      form.reset();
      setIsAdding(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add income stream');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: IncomeStreamRequest) =>
      updateIncomeStream(editingIncomeStreamId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeStreams', budget.id] });
      toast.success('Income stream updated successfully');
      form.reset();
      setEditingIncomeStreamId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update income stream');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (incomeStreamId: string) => deleteIncomeStream(incomeStreamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeStreams', budget.id] });
      toast.success('Income stream deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete income stream');
    },
  });

  // Validate income streams
  const validateIncomeStreams = (
    newStream: IncomeStreamRequest,
    isUpdate: boolean,
    currentStreamId?: string
  ): { valid: boolean; message?: string } => {
    const otherStreams = isUpdate
      ? incomeStreams.filter((stream) => stream.id !== currentStreamId)
      : incomeStreams;
    const totalPercentage =
      otherStreams.reduce((sum, stream) => sum + stream.percentage, 0) +
      newStream.percentage;
    const totalContribution =
      otherStreams.reduce((sum, stream) => sum + stream.totalContribution, 0) +
      newStream.totalContribution;

    if (Math.abs(totalPercentage - 100) > 0.01) {
      return { valid: false, message: 'Total percentages must sum to 100%' };
    }
    if (Math.abs(totalContribution - budget.totalAmount) > 0.01) {
      return {
        valid: false,
        message: 'Total contributions must equal the budget amount',
      };
    }
    return { valid: true };
  };

  // Handle form submission
  const onSubmit = (data: IncomeStreamRequest) => {
    const validation = validateIncomeStreams(
      data,
      !!editingIncomeStreamId,
      editingIncomeStreamId || undefined
    );
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    if (editingIncomeStreamId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Handle edit
  const handleEdit = (stream: IncomeStreamResponse) => {
    form.reset({
      name: stream.name,
      percentage: stream.percentage,
      totalContribution: stream.totalContribution,
    });
    setEditingIncomeStreamId(stream.id);
    setIsAdding(true);
  };

  // Handle delete
  const handleDelete = (incomeStreamId: string) => {
    deleteMutation.mutate(incomeStreamId);
  };

  // DataTable columns
  const columns: ColumnDef<IncomeStreamResponse>[] = [
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
      header: 'Total Contribution ($)',
      cell: ({ row }) => `$${row.getValue('totalContribution').toFixed(2)}`,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
            disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {isAdding || editingIncomeStreamId ? (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingIncomeStreamId ? 'Edit Income Stream' : 'Add Income Stream'}
          </h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="totalContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Contribution ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter total contribution"
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingIncomeStreamId ? 'Update Income Stream' : 'Add Income Stream'}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    form.reset();
                    setEditingIncomeStreamId(null);
                    setIsAdding(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setIsAdding(true)}
          className="mb-4"
        >
          Add Income Stream
        </Button>
      )}
      <DataTable
        columns={columns}
        data={incomeStreams}
        isLoading={isIncomeStreamsLoading}
        searchKey="name"
      />
    </div>
  );
}