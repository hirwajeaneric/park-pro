/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserProfileFormSchema } from '@/components/forms/UserProfileForm';
import { ChangePasswordFormTypes, ForgotPasswordFormTypes, RequestNewVerificationCodeTypes, SignInFormTypes, SignUpFormTypes, VerifyTokenFormTypes } from '@/types';
import axios from 'axios';
import { z } from 'zod';

// Define a standard error response type from your backend
interface BackendErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
  error?: string;
}

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// const parkId = process.env.PARK_ID;

// Add request interceptor for common headers
api.interceptors.request.use(config => {
  // You can add auth tokens or other headers here if needed
  return config;
}, error => {
  return Promise.reject(error);
});

// Add response interceptor to handle errors consistently
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      const backendError: BackendErrorResponse = error.response.data;

      // Format the error message
      let errorMessage = backendError.message || 'An error occurred';

      // Handle field-specific errors if they exist
      if (backendError.errors) {
        const fieldErrors = Object.entries(backendError.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        errorMessage = `${errorMessage}. ${fieldErrors}`;
      }

      // Create a new error with the formatted message
      const apiError = new Error(errorMessage);
      (apiError as any).status = error.response.status;
      (apiError as any).data = backendError;

      return Promise.reject(apiError);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('Network error - no response received from server'));
    } else {
      // Something happened in setting up the request
      return Promise.reject(new Error('Request setup error: ' + error.message));
    }
  }
);

export const signIn = async (data: SignInFormTypes) => {
  try {
    const response = await api.post("/api/login", data);
    return response.data;
  } catch (error) {
    // The interceptor already formatted the error, just rethrow
    throw error;
  }
};

export const verifyToken = async (data: VerifyTokenFormTypes) => {
  try {
    const response = await api.post("/api/verify-account", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNewVerificationCode = async (data: RequestNewVerificationCodeTypes) => {
  try {
    const response = await api.post("/api/new-verification-code", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signUp = async (data: SignUpFormTypes) => {
  try {
    const response = await api.post("/api/signup", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (data: z.infer<typeof UserProfileFormSchema>, token: string | null) => {
  try {
    const response = await api.patch(`/api/users/${data.id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestPasswordReset = async (data: ForgotPasswordFormTypes) => {
  try {
    const response = await api.post("/api/password-reset/request", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (data: ChangePasswordFormTypes) => {
  try {
    const response = await api.post(`/api/password-reset/confirm?token=${data.token}`, {
      newPassword: data.newPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfileData = async (token: string) => {
  try {
    const response = await api.get("/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
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
}

export const getParkActivityDetails = async (activityId: string) => {
  try {
    const response = await api.get(`/api/activities/${activityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const bookTour = async ({ activityId, visitDate, paymentMethodId, token, }: { activityId: string; visitDate: string; paymentMethodId: string; token: string; }) => {
  try {
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

export const makeDonation = async ( data: { parkId: string; amount: string; motiveForDonation: string; token: string; }, paymentMethodId: string ) => {
  try {
    const response = await api.post(
      "/api/donations",
      {
        parkId: data.parkId,
        amount: data.amount,
        motiveForDonation: data.motiveForDonation
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`
        },
        params: { paymentMethodId }
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to process donation. Please try again.');
  }
};

export const getParkOpportunities = async (parkId: string) => {
  try {
    const response = await api.get(`/api/park/${parkId}/opportunities`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch opportunities');
  }
};

export const getOpportunityDetails = async (opportunityId: string) => {
  try {
    const response = await api.get(`/api/opportunities/${opportunityId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch opportunity details');
  }
};

export const applyForOpportunity = async (data: { opportunityId: string; firstName: string; lastName: string; email: string; applicationLetterUrl: string; }, token: string) => {
  try {
    const response = await api.post(
      '/api/opportunity-applications',
      {
        opportunityId: data.opportunityId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        applicationLetterUrl: data.applicationLetterUrl
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to submit application');
  }
};

export const getUserBookings = async (token: string) => {
  try {
    const response = await api.get("/api/bookings/my", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch bookings');
  }
};

export const getUserDonations = async (token: string) => {
  try {
    const response = await api.get("/api/donations/my", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch donations');
  }
};

export const getUserApplications = async (token: string) => {
  try {
    const response = await api.get("/api/opportunity-applications/my", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch applications');
  }
};

export const getUsers = async (token: string, params?: { role?: string; parkId?: string }) => {
  try {
    const response = await api.get("/api/users", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (userId: string, token: string) => {
  try {
    const response = await api.get(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (data: any, token: string) => {
  try {
    const response = await api.post("/api/users", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const assignUserToPark = async (userId: string, parkId: string, token: string) => {
  try {
    const response = await api.post(`/api/users/${userId}/parks/${parkId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: string, token: string) => {
  try {
    const response = await api.delete(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getParks = async (token: string, page: number = 0, size: number = 10) => {
  try {
    const response = await api.get("/api/parks", {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getParkById = async (parkId: string, token: string) => {
  try {
    const response = await api.get(`/api/parks/${parkId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPark = async (data: any, token: string) => {
  try {
    const response = await api.post("/api/parks", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePark = async (parkId: string, data: any, token: string) => {
  try {
    const response = await api.put(`/api/parks/${parkId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePark = async (parkId: string, token: string) => {
  try {
    const response = await api.delete(`/api/parks/${parkId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;