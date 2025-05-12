/* eslint-disable @typescript-eslint/no-unused-vars */
import AuditorBudgetDetails from "@/components/widget/AuditorBudgetDetails";
import { getBudgetById } from "@/lib/api";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Budget } from "@/types";
import { Metadata } from "next";

export const dynamicParams = true;

type Props = {
  params: { budgetId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: { params: { budgetId: string } }
): Promise<Metadata> {
  const { budgetId } = await params;
  try {
    const budget = await getBudgetById(budgetId);
    return {
      title: `${budget.fiscalYear} Budget Details - Government Dashboard`,
      description: `Review and approve the ${budget.fiscalYear} budget, including categories and income streams`,
    };
  } catch (error) {
    return {
      title: 'Budget Not Found',
      description: 'Budget details not available',
    };
  }
}

export default async function BudgetPage({ params }: Props) {
  const { budgetId } = await params;
  let budget: Budget;
  try {
    budget = await getBudgetById(budgetId);
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
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Budget for {budget.fiscalYear}</h1>
        <AuditorBudgetDetails budget={budget} />
      </div>
    </ProtectedRoute>
  );
}