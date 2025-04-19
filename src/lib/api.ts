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
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
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

/**
 * Authenticates a user and sets an access token cookie.
 * @param data - The sign-in credentials (email and password).
 * @returns A promise resolving to the access token string.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Verifies a user's account using an email and verification code.
 * @param data - The verification data (email and code).
 * @returns A promise resolving to the verification response data.
 * @throws Error if verification fails or the request errors.
 */
export const verifyToken = async (data: VerifyTokenFormTypes) => {
  try {
    const response = await api.post('/api/verify-account', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Requests a new verification code for a user.
 * @param data - The request data (email).
 * @returns A promise resolving to the response data.
 * @throws Error if the request fails.
 */
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

/**
 * Registers a new user.
 * @param data - The sign-up data (firstName, lastName, email, password).
 * @returns A promise resolving to the response data.
 * @throws Error if registration fails or the request errors.
 */
export const signUp = async (data: SignUpFormTypes) => {
  try {
    const response = await api.post('/api/signup', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Initiates a password reset request for a user.
 * @param data - The request data (email).
 * @returns A promise resolving to the response data.
 * @throws Error if the request fails.
 */
export const requestPasswordReset = async (data: ForgotPasswordFormTypes) => {
  try {
    const response = await api.post('/api/password-reset/request', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Changes a user's password using a reset token.
 * @param data - The new password data.
 * @param token - The password reset token.
 * @returns A promise resolving to the response data.
 * @throws Error if the password change fails or the request errors.
 */
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

/**
 * Updates the authenticated user's profile.
 * @param userId - The ID of the user to update.
 * @param data - The profile update data.
 * @returns A promise resolving to the updated user data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Updates a user's data as an admin.
 * @param data - The user update data (validated by UserUpdateFormSchema).
 * @param id - The ID of the user to update.
 * @returns A promise resolving to the updated user data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves the authenticated user's profile data.
 * @returns A promise resolving to the user's profile data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves a list of all users.
 * @returns A promise resolving to an array of user data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves users filtered by role.
 * @param role - The role to filter users by.
 * @returns A promise resolving to an array of user data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves users associated with a specific park.
 * @param parkId - The ID of the park.
 * @returns A promise resolving to an array of user data.
 * @throws Error if authentication fails or the request errors.
 */
export const getUsersByPark = async (parkId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/users?parkId=${parkId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a user by their ID.
 * @param id - The ID of the user.
 * @returns A promise resolving to the user data.
 * @throws Error if authentication fails or the request errors.
 */
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
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a new user.
 * @param data - The user creation data.
 * @returns A promise resolving to the created user data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Assigns or removes a user from a park.
 * @param userId - The ID of the user.
 * @param parkId - The ID of the park, or null to remove assignment.
 * @returns A promise resolving to the response data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Deletes a user by their ID.
 * @param id - The ID of the user to delete.
 * @returns A promise resolving to the response data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves a paginated list of parks.
 * @param page - The page number (default: 0).
 * @param size - The number of parks per page (default: 10).
 * @returns A promise resolving to the paginated park data.
 * @throws Error if authentication fails or the request errors.
 */
export const getParks = async (page: number = 0, size: number = 10) => {
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

/**
 * Retrieves a park by its ID.
 * @param id - The ID of the park.
 * @returns A promise resolving to the park data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves detailed information for a park by its ID.
 * @param id - The ID of the park.
 * @returns A promise resolving to the park data.
 * @throws Error if authentication fails or the request errors.
 * @remarks This function is similar to getParkById; consider consolidating.
 */
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

/**
 * Creates a new park.
 * @param data - The park creation data.
 * @returns A promise resolving to the created park data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Updates a park's details.
 * @param id - The ID of the park to update.
 * @param data - The park update data.
 * @returns A promise resolving to the updated park data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Deletes a park by its ID.
 * @param id - The ID of the park to delete.
 * @returns A promise resolving to the response data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves activities for a specific park.
 * @param parkId - The ID of the park.
 * @returns A promise resolving to the park's activity data.
 * @throws Error if the request errors.
 * @remarks This endpoint does not require authentication.
 */
export const getParkActivities = async (parkId: string) => {
  try {
    const response = await api.get(`/api/parks/${parkId}/activities`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves details for a specific park activity.
 * @param activityId - The ID of the activity.
 * @returns A promise resolving to the activity data.
 * @throws Error if the request errors.
 * @remarks This endpoint does not require authentication.
 */
export const getParkActivityDetails = async (activityId: string) => {
  try {
    const response = await api.get(`/api/activities/${activityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Books a tour for an activity.
 * @param params - The booking details (activityId, visitDate, paymentMethodId).
 * @returns A promise resolving to the booking data.
 * @throws Error if authentication fails or the request errors.
 */
export const bookTour = async ({
  activityId,
  visitDate,
  paymentMethodId,
}: {
  activityId: string;
  visitDate: string;
  paymentMethodId: string;
}) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(
      '/api/bookings',
      { activityId, visitDate },
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

/**
 * Makes a donation to a park.
 * @param data - The donation details (parkId, amount, motiveForDonation).
 * @param paymentMethodId - The ID of the payment method.
 * @returns A promise resolving to the donation data.
 * @throws Error if authentication fails or the request errors.
 */
export const makeDonation = async (
  data: { parkId: string; amount: string; motiveForDonation: string },
  paymentMethodId: string
) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(
      '/api/donations',
      {
        parkId: data.parkId,
        amount: data.amount,
        motiveForDonation: data.motiveForDonation,
      },
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

/**
 * Retrieves opportunities for a specific park.
 * @param parkId - The ID of the park.
 * @returns A promise resolving to the opportunity data.
 * @throws Error if the request errors.
 * @remarks This endpoint does not require authentication.
 */
export const getParkOpportunities = async (parkId: string) => {
  try {
    const response = await api.get(`/api/park/${parkId}/opportunities`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves details for a specific opportunity.
 * @param opportunityId - The ID of the opportunity.
 * @returns A promise resolving to the opportunity data.
 * @throws Error if the request errors.
 * @remarks This endpoint does not require authentication.
 */
export const getOpportunityDetails = async (opportunityId: string) => {
  try {
    const response = await api.get(`/api/opportunities/${opportunityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Applies for an opportunity.
 * @param data - The application data (opportunityId, firstName, lastName, email, applicationLetterUrl).
 * @returns A promise resolving to the application data.
 * @throws Error if authentication fails or the request errors.
 */
export const applyForOpportunity = async (data: {
  opportunityId: string;
  firstName: string;
  lastName: string;
  email: string;
  applicationLetterUrl: string;
}) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post('/api/opportunity-applications', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves the authenticated user's bookings.
 * @returns A promise resolving to the user's booking data.
 * @throws Error if authentication fails or the request errors.
 */
export const getUserBookings = async () => {
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
    throw error;
  }
};

/**
 * Retrieves the authenticated user's donations.
 * @returns A promise resolving to the user's donation data.
 * @throws Error if authentication fails or the request errors.
 */
export const getUserDonations = async () => {
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

/**
 * Retrieves the authenticated user's opportunity applications.
 * @returns A promise resolving to the user's application data.
 * @throws Error if authentication fails or the request errors.
 */
export const getUserApplications = async () => {
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

/**
 * Creates a new budget for a park.
 * @param data - The budget creation data.
 * @param parkId - The ID of the park.
 * @returns A promise resolving to the created budget data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Updates an existing budget.
 * @param id - The ID of the budget to update.
 * @param data - The budget update data.
 * @returns A promise resolving to the updated budget data.
 * @throws Error if authentication fails or the request errors.
 */
export const updateBudget = async (id: string, data: UpdateBudgetForm) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.put(`/api/budgets/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a budget by its ID.
 * @param id - The ID of the budget.
 * @returns A promise resolving to the budget data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Lists budgets for a specific park.
 * @param parkId - The ID of the park.
 * @returns A promise resolving to an array of budget data.
 * @throws Error if authentication fails or the request errors.
 */
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
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a new budget category for a budget.
 * @param data - The budget category creation data.
 * @param budgetId - The ID of the budget.
 * @returns A promise resolving to the created budget category data.
 * @throws Error if authentication fails or the request errors.
 */
export const createBudgetCategory = async (data: CreateBudgetCategoryForm, budgetId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(`/api/budgets/${budgetId}/categories`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates an existing budget category.
 * @param budgetId - The ID of the budget.
 * @param categoryId - The ID of the budget category.
 * @param data - The budget category update data.
 * @returns A promise resolving to the updated budget category data.
 * @throws Error if authentication fails or the request errors.
 */
export const updateBudgetCategory = async (budgetId: string, categoryId: string, data: UpdateBudgetCategoryForm) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/budgets/${budgetId}/categories/${categoryId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a budget category by its ID.
 * @param budgetId - The ID of the budget.
 * @param categoryId - The ID of the budget category.
 * @returns A promise resolving to the budget category data.
 * @throws Error if authentication fails or the request errors.
 */
export const getBudgetCategoryById = async (budgetId: string, categoryId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lists budget categories for a specific budget.
 * @param budgetId - The ID of the budget.
 * @returns A promise resolving to an array of budget category data.
 * @throws Error if authentication fails or the request errors.
 */
export const listBudgetCategoriesByBudget = async (budgetId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// EXPENSES ********************************************************************************************************************

/**
 * Lists expenses for a specific budget.
 * @param budgetId - The ID of the budget.
 * @returns A promise resolving to an array of expense data.
 * @throws Error if authentication fails or the request errors.
 * @remarks The endpoint URL may be incorrect; it currently fetches categories instead of expenses.
 */
export const listBudgetExpenses = async (budgetId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a new expense for a budget category.
 * @param data - The expense creation data.
 * @param budgetId - The ID of the budget.
 * @returns A promise resolving to the created expense data.
 * @throws Error if authentication fails or the request errors.
 */
export const createExpensesForBudgetCategory = async (data: CreateExpenseForm, budgetId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(`/api/budgets/${budgetId}/expenses`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves expenses for a specific budget category.
 * @param budgetId - The ID of the budget.
 * @param categoryId - The ID of the budget category.
 * @returns A promise resolving to an array of expense data.
 * @throws Error if authentication fails or the request errors.
 * @remarks The endpoint uses POST, which is unusual for retrieval; consider changing to GET.
 */
export const getExpensesByBudgetCategory = async (categoryId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/categories/${categoryId}/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get expense by Id.
 * @param id - The ID of the expense. 
 * @returns A promise resolving to the expense data.
 */
export const getExpensesById = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/expenses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get submitted Expenses.
 * @param budgetId - The ID of the budget the expense belongs to. 
 * @returns A promise resolving to the expense data.
 */
export const getMySubmittedExpenses = async (budgetId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/expenses/my-submissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates expense.
 * @param expenseId - The ID of the expense.
 * @param data - The expense update data.
 * @returns A promise resolving to the updated expense data.
 * @throws Error if authentication fails or the request errors.
 */
export const updateExpense = async (expenseId: string, data: UpdateExpenseForm) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/expenses/${expenseId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes expense.
 * @param expenseId - The ID of the expense.
 * @returns A promise resolving to the response message.
 * @throws Error if authentication fails or the request errors.
 */
export const deleteExpense = async (expenseId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.delete(`/api/expenses/${expenseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


/**
 * Updates the audit status of an expense.
 * @param expenseId - The ID of the expense.
 * @param data - The audit status update data.
 * @returns A promise resolving to the updated expense data.
 * @throws Error if authentication fails or the request errors.
 */
export const updateExpenseAuditStatus = async (
  expenseId: string,
  data: UpdateExpenseAuditStatus
): Promise<Expense> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/expenses/${expenseId}/audit-status`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


// WITHDRAW REQUESTS ********************************************************************************************************************
/**
 * Lists withdraw requests for a specific budget.
 * @param budgetId - The ID of the budget.
 * @returns A promise resolving to an array of withdraw request data.
 * @throws Error if authentication fails or the request errors.
 */
export const listBudgetWithdrawRequests = async (budgetId: string): Promise<WithdrawRequest[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/withdraw-requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a new withdraw request for a budget.
 * @param data - The withdraw request creation data.
 * @param budgetId - The ID of the budget.
 * @returns A promise resolving to the created withdraw request data.
 * @throws Error if authentication fails or the request errors.
 */
export const createWithdrawRequestForBudget = async (data: CreateWithdrawRequestForm, budgetId: string): Promise<WithdrawRequest> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(`/api/budgets/${budgetId}/withdraw-requests`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves withdraw requests for a specific budget category.
 * @param budgetId - The ID of the budget.
 * @param categoryId - The ID of the budget category.
 * @returns A promise resolving to an array of withdraw request data.
 * @throws Error if authentication fails or the request errors.
 */
export const getWithdrawRequestsByBudgetCategory = async (budgetId: string, categoryId: string): Promise<WithdrawRequest[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/categories/${categoryId}/withdraw-requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Gets a withdraw request by ID.
 * @param id - The ID of the withdraw request.
 * @returns A promise resolving to the withdraw request data.
 * @throws Error if authentication fails or the request errors.
 */
export const getWithdrawRequestById = async (id: string): Promise<WithdrawRequest> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/withdraw-requests/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Gets withdraw requests submitted by the authenticated user.
 * @param budgetId - The ID of the budget.
 * @returns A promise resolving to an array of withdraw request data.
 * @throws Error if authentication fails or the request errors.
 */
export const getMySubmittedWithdrawRequests = async (budgetId: string): Promise<WithdrawRequest[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/withdraw-requests/my-submissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates a withdraw request.
 * @param withdrawRequestId - The ID of the withdraw request.
 * @param data - The withdraw request update data.
 * @returns A promise resolving to the updated withdraw request data.
 * @throws Error if authentication fails or the request errors.
 */
export const updateWithdrawRequest = async (withdrawRequestId: string, data: UpdateWithdrawRequest): Promise<WithdrawRequest> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/withdraw-requests/${withdrawRequestId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a withdraw request.
 * @param withdrawRequestId - The ID of the withdraw request.
 * @returns A promise resolving to the response message.
 * @throws Error if authentication fails or the request errors.
 */
export const deleteWithdrawRequest = async (withdrawRequestId: string): Promise<string> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.delete(`/api/withdraw-requests/${withdrawRequestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Approves a withdraw request.
 * @param withdrawRequestId - The ID of the withdraw request.
 * @param data - The approval data (empty for now, as approverId is set by backend).
 * @returns A promise resolving to the approved withdraw request data.
 * @throws Error if authentication fails or the request errors.
 */
export const approveWithdrawRequest = async (withdrawRequestId: string): Promise<WithdrawRequest> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/withdraw-requests/${withdrawRequestId}/approve`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Rejects a withdraw request.
 * @param withdrawRequestId - The ID of the withdraw request.
 * @param data - The rejection data, including the rejection reason.
 * @returns A promise resolving to the rejected withdraw request data.
 * @throws Error if authentication fails or the request errors.
 */
export const rejectWithdrawRequest = async (withdrawRequestId: string, data: RejectWithdrawRequest): Promise<WithdrawRequest> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/withdraw-requests/${withdrawRequestId}/reject`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates the audit status of a withdraw request.
 * @param withdrawRequestId - The ID of the withdraw request.
 * @param data - The audit status update data.
 * @returns A promise resolving to the updated withdraw request data.
 * @throws Error if authentication fails or the request errors.
 */
export const updateWithdrawRequestAuditStatus = async (
  withdrawRequestId: string,
  data: UpdateWithdrawRequestAuditStatus
): Promise<WithdrawRequest> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/withdraw-requests/${withdrawRequestId}/audit-status`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


// OPPORTUNITIES ********************************************************************************************************************

/**
 * Creates a new opportunity.
 * @param data - The opportunity creation data.
 * @returns A promise resolving to the created opportunity data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Updates an existing opportunity.
 * @param opportunityId - The ID of the opportunity.
 * @param data - The opportunity update data.
 * @returns A promise resolving to the updated opportunity data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves all opportunities.
 * @returns A promise resolving to an array of opportunity data.
 * @throws Error if the request errors.
 * @remarks Authentication is optional; public opportunities are accessible without a token.
 */
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

/**
 * Retrieves an opportunity by ID.
 * @param opportunityId - The ID of the opportunity.
 * @returns A promise resolving to the opportunity data.
 * @throws Error if the request errors.
 * @remarks Authentication is optional; public opportunities are accessible without a token.
 */
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

/**
 * Retrieves opportunities created by the authenticated user.
 * @returns A promise resolving to an array of opportunity data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves opportunities for a specific park.
 * @param parkId - The ID of the park.
 * @returns A promise resolving to an array of opportunity data.
 * @throws Error if the request errors.
 * @remarks Authentication is optional; public opportunities are accessible without a token.
 */
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


export default api;