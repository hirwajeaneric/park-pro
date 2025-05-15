'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Decimal from 'decimal.js';
import {
  createBudget,
  createIncomeStream,
  createBudgetCategory,
} from '@/lib/api';
import {
  CreateBudgetForm as CreateBudgetFormTypes,
  CreateBudgetCategoryForm as CreateBudgetCategoryFormTypes,
} from '@/types';

// Form schemas
const CreateBudgetFormSchema = z.object({
  fiscalYear: z.number().min(2000, 'Fiscal year must be 2000 or later'),
  totalAmount: z
    .string()
    .refine(
      (val) => {
        try {
          const num = new Decimal(val);
          return num.isPositive() && !num.isNaN();
        } catch {
          return false;
        }
      },
      { message: 'Total amount must be a valid positive number' }
    ),
  status: z.enum(['DRAFT', 'APPROVED', 'REJECTED']).default('DRAFT'),
});

const CreateIncomeStreamFormSchema = z.object({
  name: z.string().min(3, 'The name must be at least 3 characters long'),
  percentage: z
    .string()
    .refine(
      (val) => {
        try {
          const num = new Decimal(val);
          return num.gte(0) && num.lte(100) && !num.isNaN();
        } catch {
          return false;
        }
      },
      { message: 'Percentage must be between 0 and 100' }
    ),
  totalContribution: z
    .string()
    .refine(
      (val) => {
        try {
          const num = new Decimal(val);
          return num.isPositive() && !num.isNaN();
        } catch {
          return false;
        }
      },
      { message: 'Total contribution must be a valid positive number' }
    ),
});

const CreateBudgetCategoryFormSchema = z.object({
  name: z.string().min(3, 'The name must be at least 3 characters long'),
  allocatedAmount: z
    .string()
    .refine(
      (val) => {
        try {
          const num = new Decimal(val);
          return num.isPositive() && !num.isNaN();
        } catch {
          return false;
        }
      },
      { message: 'Allocated amount must be a valid positive number' }
    ),
});

type FormStep = 'budget' | 'incomeStreams' | 'budgetCategories';

export default function MultiStepCreateBudgetForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<FormStep>('budget');
  const [incomeStreams, setIncomeStreams] = useState<CreateIncomeStreamFormTypes[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<CreateBudgetCategoryFormTypes[]>([]);

  const parkId = JSON.parse(localStorage.getItem('park-data') as string).id;

  // Budget form
  const budgetForm = useForm<CreateBudgetFormTypes>({
    resolver: zodResolver(CreateBudgetFormSchema),
    defaultValues: {
      fiscalYear: new Date().getFullYear(),
      totalAmount: '',
      status: 'DRAFT',
    },
  });

  // Income stream form
  const incomeStreamForm = useForm<CreateIncomeStreamFormTypes>({
    resolver: zodResolver(CreateIncomeStreamFormSchema),
    defaultValues: {
      name: '',
      percentage: '',
      totalContribution: '',
    },
  });

  // Budget category form
  const budgetCategoryForm = useForm<CreateBudgetCategoryFormTypes>({
    resolver: zodResolver(CreateBudgetCategoryFormSchema),
    defaultValues: {
      name: '',
      allocatedAmount: '',
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: CreateBudgetFormTypes) => {
      if (!parkId) throw new Error('Park ID is required');
      if (incomeStreams.length === 0) throw new Error('At least one income stream is required');
      if (budgetCategories.length === 0) throw new Error('At least one budget category is required');

      console.log('Creating budget with data:', data);
      console.log('Income streams:', incomeStreams);
      console.log('Budget categories:', budgetCategories.map(c => ({
        name: c.name,
        allocatedAmount: c.allocatedAmount,
        percentage: new Decimal(c.allocatedAmount).div(data.totalAmount).mul(100).toFixed(2),
      })));

      const budget = await createBudget(data, parkId);
      const errors: string[] = [];

      // Create income streams
      for (const stream of incomeStreams) {
        try {
          await createIncomeStream(budget.id, {
            name: stream.name,
            percentage: stream.percentage,
            totalContribution: stream.totalContribution,
          });
        } catch (error: any) {
          const errorMessage = error.message && typeof error.message === 'string'
            ? error.message
            : JSON.stringify(error.message || error);
          errors.push(`Failed to create income stream "${stream.name}": ${errorMessage}`);
        }
      }

      // Create budget categories
      for (const category of budgetCategories) {
        try {
          await createBudgetCategory(
            { name: category.name, allocatedAmount: category.allocatedAmount },
            budget.id,
            data.totalAmount // Pass total budget amount for percentage calculation
          );
        } catch (error: any) {
          const errorMessage = error.message && typeof error.message === 'string'
            ? error.message
            : JSON.stringify(error.message || error);
          errors.push(`Failed to create budget category "${category.name}": ${errorMessage}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some operations failed:\n${errors.join('\n')}`);
      }

      return budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', 'budget-categories'] });
      toast.success('Budget, income streams, and categories created successfully');
      router.push('/finance/budget');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create budget');
    },
  });

  const onBudgetSubmit = (data: CreateBudgetFormTypes) => {
    setStep('incomeStreams');
  };

  const onIncomeStreamSubmit = (data: CreateIncomeStreamFormTypes) => {
    setIncomeStreams([...incomeStreams, data]);
    incomeStreamForm.reset();
  };

  const onBudgetCategorySubmit = (data: CreateBudgetCategoryFormTypes) => {
    setBudgetCategories([...budgetCategories, data]);
    budgetCategoryForm.reset();
  };

  const handleFinalSubmit = () => {
    budgetForm.handleSubmit((data) => {
      createBudgetMutation.mutate(data);
    })();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Budget</h1>

      {/* Step 1: Budget Details */}
      {step === 'budget' && (
        <form onSubmit={budgetForm.handleSubmit(onBudgetSubmit)} className="space-y-4">
          <div>
            <label htmlFor="fiscalYear" className="block text-sm font-medium">
              Fiscal Year
            </label>
            <input
              id="fiscalYear"
              type="number"
              {...budgetForm.register('fiscalYear', { valueAsNumber: true })}
              className="mt-1 block w-full border rounded-md p-2"
            />
            {budgetForm.formState.errors.fiscalYear && (
              <p className="text-red-500 text-sm">{budgetForm.formState.errors.fiscalYear.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium">
              Total Amount
            </label>
            <input
              id="totalAmount"
              type="text"
              {...budgetForm.register('totalAmount')}
              className="mt-1 block w-full border rounded-md p-2"
            />
            {budgetForm.formState.errors.totalAmount && (
              <p className="text-red-500 text-sm">{budgetForm.formState.errors.totalAmount.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Next: Income Streams
          </button>
        </form>
      )}

      {/* Step 2: Income Streams */}
      {step === 'incomeStreams' && (
        <div>
          <form onSubmit={incomeStreamForm.handleSubmit(onIncomeStreamSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Income Stream Name
              </label>
              <input
                id="name"
                type="text"
                {...incomeStreamForm.register('name')}
                className="mt-1 block w-full border rounded-md p-2"
              />
              {incomeStreamForm.formState.errors.name && (
                <p className="text-red-500 text-sm">{incomeStreamForm.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="percentage" className="block text-sm font-medium">
                Percentage
              </label>
              <input
                id="percentage"
                type="text"
                {...incomeStreamForm.register('percentage')}
                className="mt-1 block w-full border rounded-md p-2"
              />
              {incomeStreamForm.formState.errors.percentage && (
                <p className="text-red-500 text-sm">{incomeStreamForm.formState.errors.percentage.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="totalContribution" className="block text-sm font-medium">
                Total Contribution
              </label>
              <input
                id="totalContribution"
                type="text"
                {...incomeStreamForm.register('totalContribution')}
                className="mt-1 block w-full border rounded-md p-2"
              />
              {incomeStreamForm.formState.errors.totalContribution && (
                <p className="text-red-500 text-sm">{incomeStreamForm.formState.errors.totalContribution.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Add Income Stream
            </button>
          </form>
          <div className="mt-4">
            <h2 className="text-lg font-medium">Added Income Streams</h2>
            <ul>
              {incomeStreams.map((stream, index) => (
                <li key={index}>
                  {stream.name} - {stream.percentage}% - {stream.totalContribution}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 space-x-4">
            <button
              onClick={() => setStep('budget')}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Back
            </button>
            <button
              onClick={() => setStep('budgetCategories')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Next: Budget Categories
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Budget Categories */}
      {step === 'budgetCategories' && (
        <div>
          <form onSubmit={budgetCategoryForm.handleSubmit(onBudgetCategorySubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Category Name
              </label>
              <input
                id="name"
                type="text"
                {...budgetCategoryForm.register('name')}
                className="mt-1 block w-full border rounded-md p-2"
              />
              {budgetCategoryForm.formState.errors.name && (
                <p className="text-red-500 text-sm">{budgetCategoryForm.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="allocatedAmount" className="block text-sm font-medium">
                Allocated Amount
              </label>
              <input
                id="allocatedAmount"
                type="text"
                {...budgetCategoryForm.register('allocatedAmount')}
                className="mt-1 block w-full border rounded-md p-2"
              />
              {budgetCategoryForm.formState.errors.allocatedAmount && (
                <p className="text-red-500 text-sm">{budgetCategoryForm.formState.errors.allocatedAmount.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Add Budget Category
            </button>
          </form>
          <div className="mt-4">
            <h2 className="text-lg font-medium">Added Budget Categories</h2>
            <ul>
              {budgetCategories.map((category, index) => (
                <li key={index}>
                  {category.name} - {category.allocatedAmount}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 space-x-4">
            <button
              onClick={() => setStep('incomeStreams')}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Back
            </button>
            <button
              onClick={handleFinalSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded-md"
              disabled={createBudgetMutation.isPending}
            >
              {createBudgetMutation.isPending ? 'Submitting...' : 'Submit Budget'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}