/* eslint-disable @typescript-eslint/no-unused-vars */
import UpdateExpenseDetailsForm from '@/components/forms/UpdateExpenseDetailsForm';
import { getExpenseById } from '@/lib/api';
import ProtectedRoute from '@/lib/ProtectedRoute';
import { Expense } from '@/types';
import { Metadata } from 'next';

export const dynamicParams = true;

type Props = {
  params: { expenseId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
  { params }: { params: { expenseId: string } }
): Promise<Metadata> {
  const { expenseId } = await params;
  try {
    const expense: Expense = await getExpenseById(expenseId);
    return {
      title: `Expense - ${expense.description}`,
      description: `Expense details for ${expense.description}`,
    };
  } catch (error) {
    return {
      title: 'Expense Not Found',
      description: 'Selected Expense not available',
    };
  }
}

export default async function page({ params }: Props) {
  const { expenseId } = await params;
  let expense: Expense;
  try {
    expense = await getExpenseById(expenseId);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
            <h1 className="font-bold text-3xl text-destructive">
              Expense Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              Unable to load expense. Please try again.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <UpdateExpenseDetailsForm expense={expense} />
      </div>
    </ProtectedRoute>
  );
}