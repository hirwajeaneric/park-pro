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


// PARK ***************************************************************************************************************************************

/**
 * Retrieves a paginated list of parks.
 * @param page - The page number (default: 0).
 * @param size - The number of parks per page (default: 10).
 * @returns A promise resolving to the paginated park data.
 * @throws Error if authentication fails or the request errors.
 */
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

// BUDGET MANAGEMENT

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

/**
 * Approves a budget by its ID.
 * @param budgetId - The ID of the budget to approve.
 * @returns A promise resolving to the updated budget data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Rejects a budget by its ID.
 * @param budgetId - The ID of the budget to reject.
 * @returns A promise resolving to the updated budget data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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
 * Retrieves budgets for all parks for a specific fiscal year.
 * @param fiscalYear - The fiscal year (e.g., 2024, 2025).
 * @returns A promise resolving to an array of budget data with park details.
 * @throws Error if authentication fails or the request errors.
 */
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
    const response = await api.get(`/api/budgets/withdraw-requests/${withdrawRequestId}/approve`, {
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
    const response = await api.post(`/api/budgets/withdraw-requests/${withdrawRequestId}/reject`, data, {
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

// INCOME STREAMS ********************************************************************************************************************

/**
 * Creates an income stream for a budget.
 * @param budgetId - The ID of the budget.
 * @param request - The income stream details.
 * @returns A promise resolving to the created income stream data.
 * @throws Error if authentication fails, validation fails, or the request errors.
 */
export const createIncomeStream = async (budgetId: string, request: IncomeStreamRequest): Promise<IncomeStreamResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.post(`/api/budgets/${budgetId}/income-streams`, request, {
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
 * Updates an income stream.
 * @param incomeStreamId - The ID of the income stream.
 * @param request - The updated income stream details.
 * @returns A promise resolving to the updated income stream data.
 * @throws Error if authentication fails, validation fails, or the request errors.
 */
export const updateIncomeStream = async (incomeStreamId: string, request: IncomeStreamRequest): Promise<IncomeStreamResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch(`/api/income-streams/${incomeStreamId}`, request, {
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
 * Deletes an income stream.
 * @param incomeStreamId - The ID of the income stream.
 * @returns A promise resolving when the income stream is deleted.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
export const deleteIncomeStream = async (incomeStreamId: string): Promise<void> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    await api.delete(`/api/income-streams/${incomeStreamId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves an income stream by its ID.
 * @param incomeStreamId - The ID of the income stream.
 * @returns A promise resolving to the income stream data.
 * @throws Error if authentication fails or the request errors.
 */
export const getIncomeStream = async (incomeStreamId: string): Promise<IncomeStreamResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/income-streams/${incomeStreamId}`, {
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
 * Retrieves income streams for a specific budget and fiscal year.
 * @param budgetId - The ID of the budget.
 * @param fiscalYear - The fiscal year to filter income streams.
 * @returns A promise resolving to an array of income stream data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
export const getIncomeStreamsByBudgetAndFiscalYear = async (
  budgetId: string,
  fiscalYear: number
): Promise<IncomeStreamResponse[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.get(`/api/budgets/${budgetId}/income-streams/fiscal-year/${fiscalYear}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('You are not authorized to view income streams for this budget');
      } else if (error.response?.status === 404) {
        throw new Error('Budget not found');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid fiscal year or budget fiscal year mismatch');
      }
    }
    throw error;
  }
};

/**
 * Retrieves income streams for a specific park and fiscal year.
 * @param parkId - The ID of the park.
 * @param fiscalYear - The fiscal year to filter income streams.
 * @returns A promise resolving to an array of income stream data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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


/**
 * Retrieves all income streams for a budget.
 * @param budgetId - The ID of the budget.
 * @returns A promise resolving to an array of income stream data.
 * @throws Error if authentication fails or the request errors.
 */
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


// OPPORTUNITIES AND OPPORTUNITY APPLICAITON ****************************************************************************************************

/**
 * Creates an opportunity application.
 * @param request - The application details.
 * @returns A promise resolving to the created application data.
 * @throws Error if authentication fails, validation fails, or the request errors.
 */
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

/**
 * Updates the status of an opportunity application.
 * @param applicationId - The ID of the application.
 * @param status - The new status (SUBMITTED, REVIEWED, ACCEPTED, REJECTED).
 * @param approvalMessage - Message explaining next steps for ACCEPTED status.
 * @param rejectionReason - Reason for REJECTED status.
 * @returns A promise resolving to the updated application data.
 * @throws Error if the request fails.
 */
export const updateOpportunityApplicationStatus = async (
  applicationId: string,
  status: 'SUBMITTED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED',
  approvalMessage?: string,
  rejectionReason?: string
): Promise<OpportunityApplicationResponse> => {
  try {
      const token = (await cookies()).get('token')?.value;
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

/**
 * Retrieves all applications for a given opportunity.
 * @param opportunityId - The ID of the opportunity.
 * @returns A promise resolving to an array of application data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Retrieves an opportunity application by its ID.
 * @param applicationId - The ID of the application.
 * @returns A promise resolving to the application data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves all applications submitted by the authenticated user.
 * @returns A promise resolving to an array of application data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves all opportunity applications in the system.
 * @returns A promise resolving to an array of application data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Retrieves all opportunity applications for a given park.
 * @param parkId - The ID of the park.
 * @returns A promise resolving to an array of application data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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


// PARK ACTIVITIES ********************************************************************************************************************


/**
 * Creates an activity for a park.
 * @param parkId - The ID of the park.
 * @param request - The activity details.
 * @returns A promise resolving to the created activity data.
 * @throws Error if authentication fails, validation fails, or the request errors.
 */
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

/**
 * Updates an existing activity.
 * @param activityId - The ID of the activity.
 * @param request - The updated activity details.
 * @returns A promise resolving to the updated activity data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Deletes an activity.
 * @param activityId - The ID of the activity.
 * @returns A promise resolving when the activity is deleted.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Retrieves all activities for a given park.
 * @param parkId - The ID of the park.
 * @returns A promise resolving to an array of activity data.
 * @throws Error if the park is not found or the request errors.
 */
export const getActivitiesByPark = async (parkId: string): Promise<ActivityResponse[]> => {
  try {
    const response = await api.get(`/api/parks/${parkId}/activities`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves an activity by its ID.
 * @param activityId - The ID of the activity.
 * @returns A promise resolving to the activity data.
 * @throws Error if the activity is not found or the request errors.
 */
export const getActivityById = async (activityId: string): Promise<ActivityResponse> => {
  try {
    const response = await api.get(`/api/activities/${activityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// DONATIONS ********************************************************************************************************************

/**
 * Creates a donation.
 * @param request - The donation details.
 * @param paymentMethodId - Stripe payment method ID.
 * @returns A promise resolving to the created donation data.
 * @throws Error if authentication fails, payment fails, or the request errors.
 */
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

/**
 * Cancels a donation.
 * @param donationId - The ID of the donation.
 * @returns A promise resolving to the cancelled donation data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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


/**
 * Retrieves all donations made by the authenticated user.
 * @returns A promise resolving to an array of donation data.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves donations for a specific park.
 * @param parkId - The ID of the park.
 * @returns A promise resolving to an array of donation data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Retrieves up to 8 most outstanding donors by total donation amount for a specific park.
 * @param parkId - The ID of the park.
 * @returns A promise resolving to an array of top donor data.
 * @throws Error if the park is not found or the request errors.
 */
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

/**
 * Retrieves donations for a specific park and fiscal year.
 * @param parkId - The ID of the park.
 * @param fiscalYear - The fiscal year to filter donations.
 * @returns A promise resolving to an array of donation data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Retrieves a donation by its ID.
 * @param donationId - The ID of the donation.
 * @returns A promise resolving to the donation data.
 * @throws Error if the donation is not found or the request errors.
 */
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


// BOOKINGS ********************************************************************************************************************

/**
 * Creates a new booking with confirmed status.
 * @param request - The booking request data.
 * @param paymentMethodId - The Stripe payment method ID (e.g., pm_xxx).
 * @returns A promise resolving to the created booking data.
 * @throws Error if authentication fails, the user lacks permission, payment fails, or the request errors.
 */
// export const createBooking = async (
//   request: CreateBookingRequest,
//   paymentMethodId: string
// ): Promise<BookingResponse> => {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get('access-token')?.value;
//     if (!token) throw new Error('Authentication required');
//     const response = await api.post('/api/bookings', request, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       params: { paymentMethodId },
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       if (error.response?.status === 400) {
//         throw new Error(error.response.data.message || 'Invalid booking request');
//       } else if (error.response?.status === 403) {
//         throw new Error('You are not authorized to create bookings');
//       } else if (error.response?.status === 404) {
//         throw new Error('Activity or user not found');
//       }
//     }
//     throw error;
//   }
// };

/**
 * Cancels an existing booking.
 * @param bookingId - The ID of the booking to cancel.
 * @returns A promise resolving to the cancelled booking data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Retrieves the authenticated user's bookings.
 * @returns A promise resolving to an array of the user's bookings.
 * @throws Error if authentication fails or the request errors.
 */
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

/**
 * Retrieves bookings for a specific park.
 * @param parkId - The ID of the park.
 * @returns A promise resolving to an array of bookings for the park.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Retrieves a booking by its ID.
 * @param bookingId - The ID of the booking.
 * @returns A promise resolving to the booking data.
 * @throws Error if authentication fails, the booking is not found, or the request errors.
 */
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


// FUNDING REQUESTS ********************************************************************************************************************

/**
 * Creates a funding request for a park.
 * @param parkId - The ID of the park.
 * @param request - The funding request details.
 * @returns A promise resolving to the created funding request data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Approves a funding request with a specified amount.
 * @param fundingRequestId - The ID of the funding request.
 * @param approvedAmount - The approved funding amount.
 * @returns A promise resolving to the updated funding request data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Rejects a funding request with a reason.
 * @param fundingRequestId - The ID of the funding request.
 * @param rejectionReason - The reason for rejection.
 * @returns A promise resolving to the updated funding request data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Retrieves a funding request by its ID.
 * @param fundingRequestId - The ID of the funding request.
 * @returns A promise resolving to the funding request data.
 * @throws Error if authentication fails, the funding request is not found, or the request errors.
 */
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

/**
 * Updates a funding request.
 * @param fundingRequestId - The ID of the funding request.
 * @param request - The updated funding request details.
 * @returns A promise resolving to the updated funding request data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Deletes a funding request.
 * @param fundingRequestId - The ID of the funding request.
 * @returns A promise that resolves when the funding request is deleted.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Retrieves funding requests for a specific park, optionally filtered by fiscal year.
 * @param parkId - The ID of the park.
 * @param fiscalYear - Optional fiscal year to filter funding requests.
 * @returns A promise resolving to an array of funding request data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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

/**
 * Retrieves all funding requests, optionally filtered by fiscal year.
 * @param fiscalYear - Optional fiscal year to filter funding requests.
 * @returns A promise resolving to an array of funding request data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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


/**
 * Retrieves funding requests for a specific budget.
 * @param budgetId - The ID of the budget.
 * @returns A promise resolving to an array of funding request data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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


/**
 * Retrieves funding requests for a specific fiscal year.
 * @param fiscalYear - The fiscal year to filter funding requests.
 * @returns A promise resolving to an array of funding request data.
 * @throws Error if authentication fails, the user lacks permission, or the request errors.
 */
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