/* eslint-disable @typescript-eslint/no-unused-vars */
import UpdateBudgetCategoryForm from "@/components/forms/UpdateBudgetCategoryForm";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getBudgetCategoryById } from "@/lib/api";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { BudgetCategory } from "@/types";
import { Metadata } from "next";

export const dynamicParams = true;

type Props = {
    params: { id: string, categoryId: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
    { params }: { params: { id: string, categoryId: string } }
): Promise<Metadata> {
    const { id, categoryId } = await params;
    try {
        const budgetCategory = await getBudgetCategoryById(id, categoryId);
        return {
            title: `Budget category - ${budgetCategory.name}`,
            description: `Budget category details for ${budgetCategory.name}`,
        };
    } catch (error) {
        return {
            title: 'Category Not Found',
            description: 'Budget category not available',
        };
    }
}

export default async function page({ params }: Props) {
    const { id, categoryId } = await params;
    let budgetCategory: BudgetCategory;
    try {
        budgetCategory = await getBudgetCategoryById(id, categoryId);
    } catch (error) {
        return (
            <ProtectedRoute>
                <div className="w-full bg-white">
                    <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18 py-6">
                        <h1 className="font-bold text-3xl text-destructive">
                            Budget category Not Found
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Unable to load budget categpry. Please try again.
                        </p>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <h1 className="text-2xl font-bold">{budgetCategory.name}</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Name - </strong>{budgetCategory.name}</p>
                        <p><strong>Balance - </strong>{budgetCategory.balance}</p>
                        <p><strong>Budget - </strong>{budgetCategory.budgetId}</p>
                    </CardContent>
                    <CardFooter>
                        <UpdateBudgetCategoryForm category={budgetCategory} />
                    </CardFooter>
                </Card>
            </div>
        </ProtectedRoute>
    )
}