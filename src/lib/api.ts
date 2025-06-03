/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { UserUpdateFormSchema } from '@/components/forms/UserUpdateForm';
import {
  ChangePasswordFormTypes,
  ForgotPasswordFormTypes,
  RequestNewVerificationCodeTypes,
  SignInFormTypes,
  SignUpFormTypes,
  VerifyTokenFormTypes,
  CreateUserForm,
  CreateParkForm,
  UpdateParkForm,
  UpdateProfileForm,
  CreateBudgetForm,
  UpdateBudgetForm,
  CreateBudgetCategoryForm,
  UpdateBudgetCategoryForm,
  CreateExpenseForm,
  UpdateExpenseForm,
  WithdrawRequest,
  CreateWithdrawRequestForm,
  UpdateWithdrawRequest,
  RejectWithdrawRequest,
  UpdateWithdrawRequestAuditStatus,
  UpdateExpenseAuditStatus,
  Expense,
  CreateOpportunityForm,
  Opportunity,
  BudgetByFiscalYearResponse,
  BudgetResponse,
  IncomeStreamResponse,
  IncomeStreamRequest,
  OpportunityApplicationResponse,
  OpportunityApplicationRequest,
  CreateActivityRequest,
  ActivityResponse,
  UpdateActivityRequest,
  DonationResponse,
  CreateDonationRequest,
  BookingResponse,
  CreateFundingRequestDto,
  FundingRequestResponse,
  OutstandingDonorResponse,
} from '@/types';
import axios from 'axios';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Define a standard error response type from the backend
interface BackendErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
  error?: string;
}

// ==============================================
// BASE API CONFIGURATION
// ==============================================
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Add request interceptor for common headers (no token here)
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const backendError: BackendErrorResponse = error.response.data;
      let errorMessage = backendError.message || 'An error occurred';
      if (backendError.errors) {
        const fieldErrors = Object.entries(backendError.errors)
          .map(([field, messages]) => {
            // Handle both string and array error messages
            const messageStr = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${field}: ${messageStr}`;
          })
          .join('; ');
        errorMessage = `${errorMessage}. ${fieldErrors}`;
      }
      const apiError = new Error(errorMessage);
      (apiError as any).status = error.response.status;
      (apiError as any).data = backendError;
      return Promise.reject(apiError);
    } else if (error.request) {
      return Promise.reject(new Error('Network error - no response received'));
    } else {
      return Promise.reject(new Error('Request setup error: ' + error.message));
    }
  }
);

// ==============================================
// 1. AUTHENTICATION & USER MANAGEMENT
// ==============================================

// --------------------------
// Authentication Functions
// --------------------------
export const signIn = async (data: SignInFormTypes): Promise<string> => {
  try {
    const response = await api.post('/api/login', data);
    const cookieStore = await cookies();
    cookieStore.set('access-token', response.data, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyToken = async (data: VerifyTokenFormTypes) => {
  try {
    const response = await api.post('/api/verify-account', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNewVerificationCode = async (
  data: RequestNewVerificationCodeTypes
) => {
  try {
    const response = await api.post('/api/new-verification-code', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signUp = async (data: SignUpFormTypes) => {
  try {
    const response = await api.post('/api/signup', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestPasswordReset = async (data: ForgotPasswordFormTypes) => {
  try {
    const response = await api.post('/api/password-reset/request', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (data: ChangePasswordFormTypes, token: string) => {
  try {
    const response = await api.post(
      `/api/password-reset/confirm?token=${token}`,
      {
        newPassword: data.newPassword,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --------------------------
// User Profile Functions
// --------------------------
export const updateProfile = async (userId: string, data: UpdateProfileForm) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/users/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfileData = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --------------------------
// User Management (Admin Functions)
// --------------------------
export const updateUser = async (
  data: z.infer<typeof UserUpdateFormSchema>,
  id: string
) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/users/${id}/admin`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get('/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUsersByRole = async (role: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/users?role=${role}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUsersByPark = async (parkId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/parks/${parkId}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    response.data.isActive = response.data.active;
    delete response.data.active;
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (data: CreateUserForm) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post('/api/users', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const assignUserToPark = async (
  userId: string,
  parkId: string | null
): Promise<unknown> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(
      `/api/users/${userId}/parks${parkId ? `/${parkId}` : ''}`,
      parkId ? {} : { parkId: null },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.delete(`/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==============================================
// 2. PARK MANAGEMENT
// ==============================================

// --------------------------
// Park Operations
// --------------------------
export const getParks = async (page: number = 0, size: number = 20) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/parks?page=${page}&size=${size}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getParkById = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/parks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getParkInfoById = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/parks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPark = async (data: CreateParkForm) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post('/api/parks', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePark = async (id: string, data: UpdateParkForm) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.put(`/api/parks/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePark = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.delete(`/api/parks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --------------------------
// Park Activities
// --------------------------
export const getParkActivities = async (parkId: string) => {
  try {
    const response = await api.get(`/api/parks/${parkId}/activities`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getParkActivityDetails = async (activityId: string) => {
  try {
    const response = await api.get(`/api/activities/${activityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createActivity = async (parkId: string, request: CreateActivityRequest): Promise<ActivityResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    console.log(parkId);
    console.log(request);
    const response = await api.post(`/api/parks/${parkId}/activities`, request, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateActivity = async (activityId: string, request: UpdateActivityRequest): Promise<ActivityResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/activities/${activityId}`, request, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteActivity = async (activityId: string): Promise<void> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    await api.delete(`/api/activities/${activityId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getActivitiesByPark = async (parkId: string): Promise<ActivityResponse[]> => {
  try {
    const response = await api.get(`/api/parks/${parkId}/activities`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getActivityById = async (activityId: string): Promise<ActivityResponse> => {
  try {
    const response = await api.get(`/api/activities/${activityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==============================================
// 3. FINANCIAL MANAGEMENT
// ==============================================

// --------------------------
// Budget Operations
// --------------------------
export const createBudget = async (data: CreateBudgetForm, parkId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(`/api/parks/${parkId}/budgets`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBudget = async (id: string, data: UpdateBudgetForm) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/budgets/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const approveBudget = async (budgetId: string): Promise<BudgetResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(`/api/budgets/${budgetId}/approve`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectBudget = async (budgetId: string): Promise<BudgetResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(`/api/budgets/${budgetId}/reject`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBudgetById = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const listBudgetsByPark = async (parkId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/parks/${parkId}/budgets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBudgetsByFiscalYear = async (fiscalYear: number): Promise<BudgetByFiscalYearResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/by-fiscal-year/${fiscalYear}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --------------------------
// Budget Category Operations
// --------------------------

export const createBudgetCategory = async (
  data: CreateBudgetCategoryForm,
  budgetId: string,
  totalBudgetAmount: string // Add total budget amount for percentage calculation
) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('access-token')?.value;
  if (!token) throw new Error('Authentication required');

  // Calculate percentage: (allocatedAmount / totalBudgetAmount) * 100
  const allocatedAmount = Number(data.allocatedAmount);
  const totalAmount = Number(totalBudgetAmount);
  const percentage = ((allocatedAmount / totalAmount) * 100).toFixed(2);

  const requestData = {
    name: data.name,
    percentage: percentage.toString(), // Send as string to match BigDecimal
    spendingStrategy: data.spendingStrategy
  };

  console.log('Creating budget category:', { budgetId, requestData });
  const response = await api.post(`/api/budgets/${budgetId}/categories`, requestData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateBudgetCategory = async (
  budgetId: string,
  categoryId: string,
  data: UpdateBudgetCategoryForm
): Promise<UpdateBudgetCategoryForm> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.patch(
      `/api/budgets/${budgetId}/categories/${categoryId}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getBudgetCategoryById = async (
  budgetId: string,
  categoryId: string
) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.get(
      `/api/budgets/${budgetId}/categories/${categoryId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const listBudgetCategoriesByBudget = async (
  budgetId: string
) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.get(
      `/api/budgets/${budgetId}/categories`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBudgetCategory = async (
  budgetId: string,
  categoryId: string
): Promise<void> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    await api.delete(
      `/api/budgets/${budgetId}/categories/${categoryId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    throw error;
  }
};

export const getExpensesForBudgetCategory = async (
  budgetId: string,
  categoryId: string
): Promise<Expense[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.get(
      `/api/budgets/${budgetId}/categories/${categoryId}/expenses`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==============================================
// EXPENSE OPERATIONS
// ==============================================

export const createExpense = async (
  budgetId: string,
  data: CreateExpenseForm
): Promise<Expense> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.post(
      `/api/budgets/${budgetId}/expenses`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateExpense = async (
  expenseId: string,
  data: UpdateExpenseForm
): Promise<Expense> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.patch(
      `/api/expenses/${expenseId}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getExpenseById = async (expenseId: string): Promise<Expense> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.get(`/api/expenses/${expenseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const listExpensesByBudget = async (budgetId: string): Promise<Expense[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.get(`/api/budgets/${budgetId}/expenses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getExpensesByBudgetCategory = async (categoryId: string): Promise<Expense[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.get(`/api/budgets/categories/${categoryId}/expenses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    await api.delete(`/api/expenses/${expenseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    throw error;
  }
};

export const getMySubmittedExpenses = async (budgetId: string): Promise<Expense[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/expenses/my-submissions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const updateExpenseAuditStatus = async (
  expenseId: string,
  data: UpdateExpenseAuditStatus
): Promise<Expense> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.patch(
      `/api/expenses/${expenseId}/audit-status`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==============================================
// WITHDRAW REQUEST OPERATIONS
// ==============================================
export const createWithdrawRequest = async ( budgetId: string, data: CreateWithdrawRequestForm ): Promise<WithdrawRequest> => {
  console.log("Hello");
  console.log(data, budgetId);
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.post(
      `/api/budgets/${budgetId}/withdraw-requests`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getWithdrawRequestById = async (
  requestId: string
): Promise<WithdrawRequest> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.get(`/api/withdraw-requests/${requestId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const listWithdrawRequestsByBudget = async (
  budgetId: string
): Promise<WithdrawRequest[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.get(
      `/api/budgets/${budgetId}/withdraw-requests`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateWithdrawRequest = async (
  requestId: string,
  data: UpdateWithdrawRequest
): Promise<WithdrawRequest> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.patch(
      `/api/withdraw-requests/${requestId}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const approveWithdrawRequest = async (
  requestId: string
): Promise<WithdrawRequest> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.get(
      `/api/budgets/withdraw-requests/${requestId}/approve`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectWithdrawRequest = async (
  requestId: string,
  data: RejectWithdrawRequest
): Promise<WithdrawRequest> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.post(
      `/api/budgets/withdraw-requests/${requestId}/reject`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateWithdrawRequestAuditStatus = async (
  withdrawRequestId: string,
  data: UpdateWithdrawRequestAuditStatus
): Promise<WithdrawRequest> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/budgets/withdraw-requests/${withdrawRequestId}/audit-status`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMySubmittedWithdrawRequests = async (budgetId: string): Promise<WithdrawRequest[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/withdraw-requests/my-submissions`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ==============================================
// INCOME STREAM OPERATIONS
// ==============================================

export const createIncomeStream = async (
  budgetId: string,
  data: IncomeStreamRequest
): Promise<IncomeStreamResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.post(
      `/api/budgets/${budgetId}/income-streams`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateIncomeStream = async (
  incomeStreamId: string,
  data: IncomeStreamRequest
): Promise<IncomeStreamResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.patch(
      `/api/income-streams/${incomeStreamId}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getIncomeStreamById = async (
  incomeStreamId: string
): Promise<IncomeStreamResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.get(`/api/income-streams/${incomeStreamId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const listIncomeStreamsByBudget = async (
  budgetId: string
): Promise<IncomeStreamResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    const response = await api.get(
      `/api/budgets/${budgetId}/income-streams`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const deleteIncomeStream = async (
  incomeStreamId: string
): Promise<void> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');

    await api.delete(`/api/income-streams/${incomeStreamId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    throw error;
  }
};

export const getIncomeStreamsByParkAndFiscalYear = async (
  parkId: string,
  fiscalYear: number
): Promise<IncomeStreamResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/parks/${parkId}/income-streams/fiscal-year/${fiscalYear}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to view income streams for this park');
      } else if (error.response?.status === 404) {
        throw new Error('Park not found');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid fiscal year or park fiscal year mismatch');
      }
    }
    throw error;
  }
};

export const getIncomeStreamsByBudget = async (budgetId: string): Promise<IncomeStreamResponse[]> => {
  console.log(budgetId);
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/income-streams`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==============================================
// 4. OPPORTUNITIES & APPLICATIONS
// ==============================================

// --------------------------
// Opportunity Operations
// --------------------------
export const createOpportunity = async (data: CreateOpportunityForm): Promise<Opportunity> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post('/api/opportunities', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOpportunity = async (opportunityId: string, data: CreateOpportunityForm): Promise<Opportunity> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/opportunities/${opportunityId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllOpportunities = async (): Promise<Opportunity[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    const headers: { Authorization?: string } = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await api.get('/api/opportunities', { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOpportunityById = async (opportunityId: string): Promise<Opportunity> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    const headers: { Authorization?: string } = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await api.get(`/api/opportunities/${opportunityId}`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyOpportunities = async (): Promise<Opportunity[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get('/api/opportunities/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOpportunitiesByParkId = async (parkId: string): Promise<Opportunity[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    const headers: { Authorization?: string } = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await api.get(`/api/park/${parkId}/opportunities`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --------------------------
// Opportunity Application Operations
// --------------------------
export const createOpportunityApplication = async (request: OpportunityApplicationRequest): Promise<OpportunityApplicationResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post('/api/opportunity-applications', request, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOpportunityApplicationStatus = async (
  applicationId: string,
  status: 'SUBMITTED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED',
  approvalMessage?: string,
  rejectionReason?: string
): Promise<OpportunityApplicationResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('No authentication token found');

    const response = await api.patch(
      `/api/opportunity-applications/${applicationId}/status`,
      { status, approvalMessage, rejectionReason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update application status');
    }
    throw error;
  }
};

export const getApplicationsByOpportunity = async (opportunityId: string): Promise<OpportunityApplicationResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/opportunity-applications/opportunity/${opportunityId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOpportunityApplicationById = async (applicationId: string): Promise<OpportunityApplicationResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/opportunity-applications/${applicationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyOpportunityApplications = async (): Promise<OpportunityApplicationResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get('/api/opportunity-applications/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllOpportunityApplications = async (): Promise<OpportunityApplicationResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get('/api/opportunity-applications', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getApplicationsByPark = async (parkId: string): Promise<OpportunityApplicationResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/opportunity-applications/park/${parkId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==============================================
// 5. DONATIONS
// ==============================================
export const createDonation = async (request: CreateDonationRequest, paymentMethodId: string): Promise<DonationResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post('/api/donations', request, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { paymentMethodId },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to create donations');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid donation data');
      }
    }
    throw error;
  }
};

export const cancelDonation = async (donationId: string): Promise<DonationResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(`/api/donations/${donationId}/cancel`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to cancel this donation');
      }
    }
    throw error;
  }
};

export const getMyDonations = async (): Promise<DonationResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get('/api/donations/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDonationsByPark = async (parkId: string): Promise<DonationResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/parks/${parkId}/donations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to view donations for this park');
      } else if (error.response?.status === 404) {
        throw new Error('Park not found');
      }
    }
    throw error;
  }
};

export const getTopDonorsByPark = async (parkId: string): Promise<OutstandingDonorResponse[]> => {
  try {
    const response = await api.get(`/api/parks/${parkId}/top-donors`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Park not found');
      }
    }
    throw error;
  }
};

export const getDonationsByParkAndFiscalYear = async (
  parkId: string,
  fiscalYear: number
): Promise<DonationResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/parks/${parkId}/donations/fiscal-year/${fiscalYear}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to view donations for this park');
      } else if (error.response?.status === 404) {
        throw new Error('Park not found');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid fiscal year');
      }
    }
    throw error;
  }
};

export const getDonationById = async (donationId: string): Promise<DonationResponse> => {
  try {
    const response = await api.get(`/api/donations/${donationId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Donation not found');
      }
    }
    throw error;
  }
};

// ==============================================
// 6. BOOKINGS
// ==============================================
export const bookTour = async ({
  activityId,
  visitDate,
  numberOfTickets,
  groupMembers,
  paymentMethodId,
}: {
  activityId: string;
  visitDate: string;
  numberOfTickets: number;
  groupMembers: { guestName?: string; guestEmail?: string }[];
  paymentMethodId: string;
}) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(
      '/api/bookings',
      { activityId, visitDate, numberOfTickets, groupMembers },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { paymentMethodId },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelBooking = async (bookingId: string): Promise<BookingResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(`/api/bookings/${bookingId}/cancel`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid cancellation request');
      } else if (error.response?.status === 403) {
        throw new Error('You are not authorized to cancel this booking');
      } else if (error.response?.status === 404) {
        throw new Error('Booking not found');
      }
    }
    throw error;
  }
};

export const getMyBookings = async (): Promise<BookingResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get('/api/bookings/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to view bookings');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      }
    }
    throw error;
  }
};

export const getBookingsByPark = async (parkId: string): Promise<BookingResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/parks/${parkId}/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to view park bookings');
      } else if (error.response?.status === 404) {
        throw new Error('Park not found');
      }
    }
    throw error;
  }
};

export const getBookingById = async (bookingId: string): Promise<BookingResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/bookings/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Booking not found');
      } else if (error.response?.status === 403) {
        throw new Error('You are not authorized to view this booking');
      }
    }
    throw error;
  }
};

// ==============================================
// 7. FUNDING REQUESTS
// ==============================================
export const createFundingRequest = async (
  parkId: string,
  request: CreateFundingRequestDto
): Promise<FundingRequestResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(`/api/parks/${parkId}/funding-requests`, request, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to create funding requests');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid funding request data');
      } else if (error.response?.status === 404) {
        throw new Error('Park or budget not found');
      }
    }
    throw error;
  }
};

export const approveFundingRequest = async (
  fundingRequestId: string,
  approvedAmount: number
): Promise<FundingRequestResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(
      `/api/funding-requests/${fundingRequestId}/approve`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { approvedAmount },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to approve funding requests');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid approval request');
      } else if (error.response?.status === 404) {
        throw new Error('Funding request not found');
      }
    }
    throw error;
  }
};

export const rejectFundingRequest = async (
  fundingRequestId: string,
  rejectionReason: string
): Promise<FundingRequestResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(
      `/api/funding-requests/${fundingRequestId}/reject`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { rejectionReason },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to reject funding requests');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid rejection request');
      } else if (error.response?.status === 404) {
        throw new Error('Funding request not found');
      }
    }
    throw error;
  }
};

export const getFundingRequestById = async (
  fundingRequestId: string
): Promise<FundingRequestResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/funding-requests/${fundingRequestId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Funding request not found');
      } else if (error.response?.status === 403) {
        throw new Error('You are not authorized to view this funding request');
      }
    }
    throw error;
  }
};

export const updateFundingRequest = async (
  fundingRequestId: string,
  request: CreateFundingRequestDto
): Promise<FundingRequestResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/funding-requests/${fundingRequestId}`, request, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to update funding requests');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid funding request data');
      } else if (error.response?.status === 404) {
        throw new Error('Funding request not found');
      }
    }
    throw error;
  }
};

export const deleteFundingRequest = async (fundingRequestId: string): Promise<void> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    await api.delete(`/api/funding-requests/${fundingRequestId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to delete funding requests');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid deletion request');
      } else if (error.response?.status === 404) {
        throw new Error('Funding request not found');
      }
    }
    throw error;
  }
};

export const getFundingRequestsByPark = async (
  parkId: string,
  fiscalYear?: number
): Promise<FundingRequestResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/parks/${parkId}/funding-requests`, {
      headers: { Authorization: `Bearer ${token}` },
      params: fiscalYear ? { fiscalYear } : undefined,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to view funding requests for this park');
      } else if (error.response?.status === 404) {
        throw new Error('Park not found');
      }
    }
    throw error;
  }
};

export const getAllFundingRequests = async (
  fiscalYear?: number
): Promise<FundingRequestResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/funding-requests`, {
      headers: { Authorization: `Bearer ${token}` },
      params: fiscalYear ? { fiscalYear } : undefined,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to view all funding requests');
      }
    }
    throw error;
  }
};

export const getFundingRequestsByBudget = async (
  budgetId: string
): Promise<FundingRequestResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/funding-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to view funding requests for this budget');
      } else if (error.response?.status === 404) {
        throw new Error('Budget not found');
      }
    }
    throw error;
  }
};

export const getFundingRequestsByFiscalYear = async (
  fiscalYear: number
): Promise<FundingRequestResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/funding-requests/fiscal-year/${fiscalYear}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to view funding requests for this fiscal year');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid fiscal year');
      }
    }
    throw error;
  }
};

export default api;