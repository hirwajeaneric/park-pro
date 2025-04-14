/* eslint-disable @typescript-eslint/no-unused-vars */
import CreateBudgetCategoryForm from "@/components/forms/CreateBudgetCategoryForm";
import { getBudgetById } from "@/lib/api";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Budget } from "@/types";
import { Metadata } from "next";

export const dynamicParams = true;

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const budget = await getBudgetById(id);
    return {
      title: `Add budget category for ${budget.fiscalYear} Budget`,
      description: `Create new budget category for ${budget.fiscalYear}`,
    };
  } catch (error) {
    return {
      title: 'Budget Not Found',
      description: 'Budget details not available',
    };
  }
}

export default async function page({ params }: Props) {

  const { id } = await params;
  let budget: Budget;
  try {
    budget = await getBudgetById(id);
  } catch (error) {
    return (
      <ProtectedRoute>
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
            <h1 className="font-bold text-3xl text-destructive">
              Budget Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              Unable to load budget details. Please try again.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Create a budget category for {budget.fiscalYear} Budget</h1>
        <CreateBudgetCategoryForm budgetId={id} />
      </div>
    </ProtectedRoute>
  )
}