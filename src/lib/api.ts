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
} from '@/types';
import axios from 'axios';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Define a standard error response type from your backend
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

// Public endpoints (no token required)
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

// Authenticated endpoints (token fetched from cookies)
export const updateProfile = async (data: UpdateProfileForm) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access-token')?.value;
    if (!token) throw new Error('Authentication required');
    const response = await api.patch('/api/users/me', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (
  data: z.infer<typeof UserUpdateFormSchema>,
  id: string
) => {
  try {
    console.log(data);

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

// lib/api.ts
export const assignUserToPark = async (
  userId: string,
  parkId: string | null
): Promise<any> => {
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

export const getParkOpportunities = async (parkId: string) => {
  try {
    const response = await api.get(`/api/park/${parkId}/opportunities`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOpportunityDetails = async (opportunityId: string) => {
  try {
    const response = await api.get(`/api/opportunities/${opportunityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

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

export default api;