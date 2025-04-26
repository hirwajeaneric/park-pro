/* eslint-disable @typescript-eslint/no-unused-vars */
import UpdateBudgetForm from "@/components/forms/UpdateBudgetForm";
import IncomeStreamsTable from "@/components/tables/IncomeStreamsTable";
import ListBudgetCategoriesTable from "@/components/tables/ListBudgetCategoriesTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getBudgetById } from "@/lib/api";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { Budget } from "@/types";
import { Metadata } from "next";
import Link from "next/link";

export const dynamicParams = true;

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const budget = await getBudgetById(id);
    return {
      title: `${budget.fiscalYear} Budget Details`,
      description: `Details for ${budget.fiscalYear} budget, including income streams and categories`,
    };
  } catch (error) {
    return {
      title: 'Budget Not Found',
      description: 'Budget details not available',
    };
  }
}

export default async function BudgetPage({ params }: Props) {
  let budgetCategoryBadgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' = 'default';

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
    );
  }

  switch (budget.status) {
    case 'APPROVED':
      budgetCategoryBadgeVariant = 'success';
      break;
    case 'REJECTED':
      budgetCategoryBadgeVariant = 'destructive';
      break;
    case 'DRAFT':
      budgetCategoryBadgeVariant = 'warning';
      break;
    default:
      budgetCategoryBadgeVariant = 'default';
      break;
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Budget for {budget.fiscalYear}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Budget Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Balance:</strong> ${budget.balance.toFixed(2)}</p>
            <p><strong>Status:</strong> <Badge variant={budgetCategoryBadgeVariant}>{budget.status.toLowerCase()}</Badge></p>
            <p><strong>Approver:</strong> {budget.approvedBy || 'N/A'}</p>
          </CardContent>
          <CardFooter>
            <UpdateBudgetForm budget={budget} />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex w-full justify-between">
              <h2 className="text-2xl font-bold">Income Streams</h2>
            </CardTitle>
            <CardDescription>
              <IncomeStreamsTable budget={budget} />
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex w-full justify-between">
              <h2 className="text-2xl font-bold">Budget Categories</h2>
              <Button variant="secondary">
                <Link href={`/finance/budget/${budget.id}/category/new`}>Add New Category</Link>
              </Button>
            </CardTitle>
            <CardDescription>
              <ListBudgetCategoriesTable budgetId={budget.id} />
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </ProtectedRoute>
  );
}