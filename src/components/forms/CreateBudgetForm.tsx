'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
  totalContribution: z.string().optional(), // Now optional as it will be calculated
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

type FormStep = 'budget' | 'incomeStreams' | 'budgetCategories' | 'summary';

const steps: FormStep[] = ['budget', 'incomeStreams', 'budgetCategories', 'summary'];

export default function MultiStepCreateBudgetForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<FormStep>('budget');
  const [incomeStreams, setIncomeStreams] = useState<
    (CreateIncomeStreamFormTypes & { id: number })[]
  >([]);
  const [budgetCategories, setBudgetCategories] = useState<
    (CreateBudgetCategoryFormTypes & { id: number })[]
  >([]);

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

  const totalBudgetAmount = budgetForm.watch('totalAmount');

  // Income stream form
  const incomeStreamForm = useForm<
    Omit<CreateIncomeStreamFormTypes, 'totalContribution'> & {
      totalContribution?: string;
    }
  >({
    resolver: zodResolver(CreateIncomeStreamFormSchema),
    defaultValues: {
      name: '',
      percentage: '',
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

  // Calculate current total income stream percentage
  const totalIncomePercentage = useMemo(() => {
    return incomeStreams.reduce((sum, stream) => {
      try {
        return sum.add(new Decimal(stream.percentage));
      } catch {
        return sum; // Ignore invalid percentages
      }
    }, new Decimal(0)).toNumber();
  }, [incomeStreams]);

  // Effect to update totalContribution when percentage or totalBudgetAmount changes
  useEffect(() => {
    if (totalBudgetAmount) {
      const budgetDecimal = new Decimal(totalBudgetAmount);
      const updatedIncomeStreams = incomeStreams.map((stream) => {
        try {
          const percentageDecimal = new Decimal(stream.percentage);
          const calculatedContribution = budgetDecimal
            .mul(percentageDecimal)
            .div(100)
            .toFixed(2);
          return { ...stream, totalContribution: calculatedContribution };
        } catch {
          return stream; // Keep existing if percentage is invalid
        }
      });
      setIncomeStreams(updatedIncomeStreams);
    }
  }, [totalBudgetAmount]);

  const createBudgetMutation = useMutation({
    mutationFn: async (data: CreateBudgetFormTypes) => {
      if (!parkId) throw new Error('Park ID is required');
      if (incomeStreams.length === 0)
        throw new Error('At least one income stream is required');
      if (budgetCategories.length === 0)
        throw new Error('At least one budget category is required');

      const budget = await createBudget(data, parkId);
      const errors: string[] = [];

      // Create income streams
      for (const stream of incomeStreams) {
        try {
          await createIncomeStream(budget.id, {
            name: stream.name,
            percentage: stream.percentage,
            totalContribution: stream.totalContribution as string,
          });
        } catch (error: any) {
          const errorMessage =
            error.message && typeof error.message === 'string'
              ? error.message
              : JSON.stringify(error.message || error);
          errors.push(
            `Failed to create income stream "${stream.name}": ${errorMessage}`
          );
        }
      }

      // Create budget categories
      for (const category of budgetCategories) {
        try {
          await createBudgetCategory(
            { name: category.name, allocatedAmount: category.allocatedAmount },
            budget.id,
            data.totalAmount
          );
        } catch (error: any) {
          const errorMessage =
            error.message && typeof error.message === 'string'
              ? error.message
              : JSON.stringify(error.message || error);
          errors.push(
            `Failed to create budget category "${category.name}": ${errorMessage}`
          );
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

  let incomeStreamIdCounter = 0;
  const onIncomeStreamSubmit = (
    data: Omit<CreateIncomeStreamFormTypes, 'totalContribution'>
  ) => {
    if (!totalBudgetAmount) {
      toast.error('Please enter the Total Amount in the Budget Details step first.');
      return;
    }

    const newPercentageDecimal = new Decimal(data.percentage);
    if (totalIncomePercentage + newPercentageDecimal.toNumber() > 100) {
      toast.error(
        `Adding this income stream would make total percentage exceed 100%. Current total: ${totalIncomePercentage}%.`
      );
      return;
    }

    const budgetDecimal = new Decimal(totalBudgetAmount);
    const calculatedContribution = budgetDecimal
      .mul(newPercentageDecimal)
      .div(100)
      .toFixed(2);

    setIncomeStreams([
      ...incomeStreams,
      {
        ...data,
        totalContribution: calculatedContribution,
        id: incomeStreamIdCounter++,
      },
    ]);
    incomeStreamForm.reset();
  };

  const handleIncomeStreamPercentageEdit = (
    idToUpdate: number,
    newPercentage: string
  ) => {
    if (!totalBudgetAmount) {
      toast.error('Cannot edit percentage without a total budget amount.');
      return;
    }

    const currentStream = incomeStreams.find(stream => stream.id === idToUpdate);
    if (!currentStream) return;

    const oldPercentage = new Decimal(currentStream.percentage || 0);
    const newPercentageDecimal = new Decimal(newPercentage);

    const otherStreamsTotalPercentage = totalIncomePercentage - oldPercentage.toNumber();

    if (otherStreamsTotalPercentage + newPercentageDecimal.toNumber() > 100) {
        toast.error(
            `New percentage would make total exceed 100%. Current total (excluding this stream): ${otherStreamsTotalPercentage.toFixed(2)}%.`
        );
        return;
    }

    if (newPercentageDecimal.lt(0) || newPercentageDecimal.gt(100) || newPercentageDecimal.isNaN()) {
        toast.error('Percentage must be between 0 and 100.');
        return;
    }


    const budgetDecimal = new Decimal(totalBudgetAmount);
    const calculatedContribution = budgetDecimal
      .mul(newPercentageDecimal)
      .div(100)
      .toFixed(2);

    setIncomeStreams(
      incomeStreams.map((stream) =>
        stream.id === idToUpdate
          ? {
              ...stream,
              percentage: newPercentage,
              totalContribution: calculatedContribution,
            }
          : stream
      )
    );
  };

  const handleRemoveIncomeStream = (id: number) => {
    setIncomeStreams(incomeStreams.filter((stream) => stream.id !== id));
  };

  let budgetCategoryIdCounter = 0;
  const onBudgetCategorySubmit = (data: CreateBudgetCategoryFormTypes) => {
    setBudgetCategories([...budgetCategories, { ...data, id: budgetCategoryIdCounter++ }]);
    budgetCategoryForm.reset();
  };

  const handleBudgetCategoryAmountEdit = (
    idToUpdate: number,
    newAllocatedAmount: string
  ) => {
    try {
        const amountDecimal = new Decimal(newAllocatedAmount);
        if (amountDecimal.isNegative() || amountDecimal.isNaN()) {
            toast.error('Allocated amount must be a valid positive number.');
            return;
        }
    } catch {
        toast.error('Allocated amount must be a valid positive number.');
        return;
    }

    setBudgetCategories(
      budgetCategories.map((category) =>
        category.id === idToUpdate
          ? {
              ...category,
              allocatedAmount: newAllocatedAmount,
            }
          : category
      )
    );
  };

  const handleRemoveBudgetCategory = (id: number) => {
    setBudgetCategories(budgetCategories.filter((category) => category.id !== id));
  };

  const handleFinalSubmit = () => {
    budgetForm.handleSubmit((data) => {
      createBudgetMutation.mutate(data);
    })();
  };

  const currentStepIndex = steps.indexOf(step);

  const getStepTitle = (currentStep: FormStep) => {
    switch (currentStep) {
      case 'budget':
        return 'Budget Details';
      case 'incomeStreams':
        return 'Define Income Streams';
      case 'budgetCategories':
        return 'Allocate Budget Categories';
      case 'summary':
        return 'Review Budget Summary';
      default:
        return '';
    }
  };

  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Create New Budget</h1>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div
              style={{ width: `${progressPercentage}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 ease-in-out"
            ></div>
          </div>
        </div>

        <div className="flex justify-between -mt-4">
          {steps.map((s, index) => (
            <div key={s} className="text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto
                  ${index <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'}
                  ${index === currentStepIndex ? 'ring-2 ring-blue-400' : ''}
                  ${index < currentStepIndex ? 'cursor-pointer' : ''}
                `}
                onClick={() => index < currentStepIndex && setStep(s)}
              >
                {index + 1}
              </div>
              <p className={`text-sm mt-1 ${index === currentStepIndex ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                {getStepTitle(s)}
              </p>
            </div>
          ))}
        </div>
      </div>


      <h2 className="text-xl font-bold text-gray-700 mb-6">{getStepTitle(step)}</h2>

      {/* Step 1: Budget Details */}
      {step === 'budget' && (
        <form onSubmit={budgetForm.handleSubmit(onBudgetSubmit)} className="space-y-6">
          <div>
            <label htmlFor="fiscalYear" className="block text-sm font-medium text-gray-700">
              Fiscal Year
            </label>
            <input
              id="fiscalYear"
              type="number"
              {...budgetForm.register('fiscalYear', { valueAsNumber: true })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
            />
            {budgetForm.formState.errors.fiscalYear && (
              <p className="text-red-500 text-sm mt-1">{budgetForm.formState.errors.fiscalYear.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">
              Total Amount
            </label>
            <input
              id="totalAmount"
              type="text"
              placeholder="e.g., 100000.00"
              {...budgetForm.register('totalAmount')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
            />
            {budgetForm.formState.errors.totalAmount && (
              <p className="text-red-500 text-sm mt-1">{budgetForm.formState.errors.totalAmount.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Next: Define Income Streams
          </button>
        </form>
      )}

      {/* Step 2: Income Streams */}
      {step === 'incomeStreams' && (
        <div>
          <form onSubmit={incomeStreamForm.handleSubmit(onIncomeStreamSubmit)} className="space-y-6 mb-8 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Add New Income Stream</h3>
            <div>
              <label htmlFor="incomeStreamName" className="block text-sm font-medium text-gray-700">
                Income Stream Name
              </label>
              <input
                id="incomeStreamName"
                type="text"
                {...incomeStreamForm.register('name')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              />
              {incomeStreamForm.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">{incomeStreamForm.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="incomeStreamPercentage" className="block text-sm font-medium text-gray-700">
                Percentage (%)
              </label>
              <input
                id="incomeStreamPercentage"
                type="text"
                placeholder="e.g., 25.50"
                {...incomeStreamForm.register('percentage')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              />
              {incomeStreamForm.formState.errors.percentage && (
                <p className="text-red-500 text-sm mt-1">{incomeStreamForm.formState.errors.percentage.message}</p>
              )}
              {totalBudgetAmount && (
                <p className="text-sm text-gray-500 mt-2">
                  Total Budget Amount: ${new Decimal(totalBudgetAmount).toFixed(2)}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Add Income Stream
            </button>
          </form>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Added Income Streams ({totalIncomePercentage.toFixed(2)}% total)</h2>
            {incomeStreams.length === 0 ? (
              <p className="text-gray-600">No income streams added yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {incomeStreams.map((stream, index) => (
                  <li key={stream.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3">
                    <div className="flex-1 mb-2 sm:mb-0">
                      <p className="font-medium text-gray-900">{stream.name}</p>
                      <p className="text-sm text-gray-600">
                        {stream.totalContribution ? `$${stream.totalContribution}` : 'Calculating...'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={stream.percentage}
                        onChange={(e) =>
                          handleIncomeStreamPercentageEdit(stream.id, e.target.value)
                        }
                        className="w-24 border border-gray-300 rounded-md p-2 text-center text-sm focus:ring-blue-500 focus:border-blue-500"
                        title="Edit Percentage"
                      />
                      <span className="text-gray-700">%</span>
                      <button
                        onClick={() => handleRemoveIncomeStream(stream.id)}
                        className="p-2 text-red-600 hover:text-red-800 transition duration-150 ease-in-out"
                        title="Remove Income Stream"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-10 flex justify-between space-x-4">
            <button
              onClick={() => setStep('budget')}
              className="bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Back
            </button>
            <button
              onClick={() => setStep('budgetCategories')}
              className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Next: Budget Categories
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Budget Categories */}
      {step === 'budgetCategories' && (
        <div>
          <form onSubmit={budgetCategoryForm.handleSubmit(onBudgetCategorySubmit)} className="space-y-6 mb-8 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Add New Budget Category</h3>
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                Category Name
              </label>
              <input
                id="categoryName"
                type="text"
                {...budgetCategoryForm.register('name')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              />
              {budgetCategoryForm.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">{budgetCategoryForm.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="allocatedAmount" className="block text-sm font-medium text-gray-700">
                Allocated Amount
              </label>
              <input
                id="allocatedAmount"
                type="text"
                placeholder="e.g., 50000.00"
                {...budgetCategoryForm.register('allocatedAmount')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              />
              {budgetCategoryForm.formState.errors.allocatedAmount && (
                <p className="text-red-500 text-sm mt-1">{budgetCategoryForm.formState.errors.allocatedAmount.message}</p>
              )}
              {totalBudgetAmount && (
                <p className="text-sm text-gray-500 mt-2">
                  Total Budget Amount: ${new Decimal(totalBudgetAmount).toFixed(2)}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Add Budget Category
            </button>
          </form>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Added Budget Categories</h2>
            {budgetCategories.length === 0 ? (
              <p className="text-gray-600">No budget categories added yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {budgetCategories.map((category, index) => (
                  <li key={category.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3">
                    <div className="flex-1 mb-2 sm:mb-0">
                      <p className="font-medium text-gray-900">{category.name}</p>
                      {totalBudgetAmount && category.allocatedAmount && (
                        <p className="text-sm text-gray-600">
                          {new Decimal(category.allocatedAmount).toFixed(2)} (
                          {new Decimal(category.allocatedAmount)
                            .div(new Decimal(totalBudgetAmount))
                            .mul(100)
                            .toFixed(2)}%)
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-700">$</span>
                      <input
                        type="text"
                        value={category.allocatedAmount}
                        onChange={(e) =>
                          handleBudgetCategoryAmountEdit(category.id, e.target.value)
                        }
                        className="w-28 border border-gray-300 rounded-md p-2 text-center text-sm focus:ring-blue-500 focus:border-blue-500"
                        title="Edit Allocated Amount"
                      />
                      <button
                        onClick={() => handleRemoveBudgetCategory(category.id)}
                        className="p-2 text-red-600 hover:text-red-800 transition duration-150 ease-in-out"
                        title="Remove Budget Category"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-10 flex justify-between space-x-4">
            <button
              onClick={() => setStep('incomeStreams')}
              className="bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Back
            </button>
            <button
              onClick={() => setStep('summary')}
              className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Next: Summary
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Summary */}
      {step === 'summary' && (
        <div>
          <div className="bg-gray-50 p-6 rounded-md shadow-inner mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Budget Details</h3>
            <p className="mb-2"><span className="font-medium">Fiscal Year:</span> {budgetForm.getValues('fiscalYear')}</p>
            <p className="mb-2"><span className="font-medium">Total Budget Amount:</span> ${new Decimal(budgetForm.getValues('totalAmount')).toFixed(2)}</p>
            <p className="mb-2"><span className="font-medium">Status:</span> {budgetForm.getValues('status')}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-md shadow-inner mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Income Streams</h3>
            {incomeStreams.length === 0 ? (
              <p className="text-gray-600">No income streams added.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {incomeStreams.map((stream) => (
                  <li key={stream.id} className="py-2">
                    <p className="font-medium text-gray-900">{stream.name}</p>
                    <p className="text-sm text-gray-600">
                      {stream.percentage}% (${stream.totalContribution})
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-md shadow-inner mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Budget Categories</h3>
            {budgetCategories.length === 0 ? (
              <p className="text-gray-600">No budget categories added.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {budgetCategories.map((category) => (
                  <li key={category.id} className="py-2">
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-600">
                      ${new Decimal(category.allocatedAmount).toFixed(2)} (
                      {totalBudgetAmount && category.allocatedAmount
                        ? new Decimal(category.allocatedAmount)
                            .div(new Decimal(totalBudgetAmount))
                            .mul(100)
                            .toFixed(2)
                        : 'N/A'}
                      %)
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-10 flex justify-between space-x-4">
            <button
              onClick={() => setStep('budgetCategories')}
              className="bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Back
            </button>
            <div>
                <p className="text-center text-sm text-gray-700 mb-2 font-medium">
                    By clicking "Submit Budget", this request will be finalized and cannot be reverted.
                </p>
                <button
                onClick={handleFinalSubmit}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                disabled={createBudgetMutation.isPending}
                >
                {createBudgetMutation.isPending ? 'Submitting...' : 'Submit Budget'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}